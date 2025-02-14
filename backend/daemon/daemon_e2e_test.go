package daemon

import (
	"context"
	"mintter/backend/core"
	accounts "mintter/backend/genproto/accounts/v1alpha"
	daemon "mintter/backend/genproto/daemon/v1alpha"
	documents "mintter/backend/genproto/documents/v1alpha"
	networking "mintter/backend/genproto/networking/v1alpha"
	p2p "mintter/backend/genproto/p2p/v1alpha"
	"mintter/backend/hyper"
	"mintter/backend/ipfs"
	"mintter/backend/mttnet"
	"mintter/backend/pkg/must"
	"mintter/backend/testutil"
	"testing"
	"time"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/stretchr/testify/require"
	"golang.org/x/sync/errgroup"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/proto"
)

func TestDaemonSmoke(t *testing.T) {
	t.Parallel()

	dmn := makeTestApp(t, "alice", makeTestConfig(t), false)
	ctx := context.Background()

	conn, err := grpc.Dial(dmn.GRPCListener.Addr().String(), grpc.WithBlock(), grpc.WithTransportCredentials(insecure.NewCredentials()))
	require.NoError(t, err)
	defer conn.Close()

	ac := accounts.NewAccountsClient(conn)
	dc := daemon.NewDaemonClient(conn)
	nc := networking.NewNetworkingClient(conn)

	acc, err := ac.GetAccount(ctx, &accounts.GetAccountRequest{})
	require.Error(t, err)
	require.Nil(t, acc)

	seed, err := dc.GenMnemonic(ctx, &daemon.GenMnemonicRequest{
		MnemonicsLength: 12,
	})
	require.NoError(t, err)

	reg, err := dc.Register(ctx, &daemon.RegisterRequest{
		Mnemonic: seed.Mnemonic,
	})
	require.NoError(t, err)
	require.NotNil(t, reg)
	require.NotEqual(t, "", reg.AccountId, "account ID must be generated after registration")

	_, err = core.DecodePrincipal(reg.AccountId)
	require.NoError(t, err, "account must have principal encoding")

	_, err = dmn.Storage.Identity().Await(ctx)
	require.NoError(t, err)

	_, err = dmn.Net.Await(ctx)
	require.NoError(t, err)

	me := dmn.Storage.Identity().MustGet()
	require.Equal(t, me.Account().String(), reg.AccountId)

	acc, err = ac.GetAccount(ctx, &accounts.GetAccountRequest{})
	require.NoError(t, err)
	require.Equal(t, reg.AccountId, acc.Id, "must return account after registration")
	require.Equal(t, 1, len(acc.Devices), "must return our own device after registration")
	require.Equal(t, acc.Id, me.Account().String())

	profileUpdate := &accounts.Profile{
		Alias:  "fulanito",
		Bio:    "Mintter Tester",
		Avatar: "bafkreibaejvf3wyblh3s4yhbrwtxto7wpcac7zkkx36cswjzjez2cbmzvu",
	}

	updatedAcc, err := ac.UpdateProfile(ctx, profileUpdate)
	require.NoError(t, err)
	require.Equal(t, acc.Id, updatedAcc.Id)
	require.Equal(t, acc.Devices, updatedAcc.Devices)
	testutil.ProtoEqual(t, profileUpdate, updatedAcc.Profile, "profile update must return full profile")

	acc, err = ac.GetAccount(ctx, &accounts.GetAccountRequest{})
	require.NoError(t, err)
	testutil.ProtoEqual(t, updatedAcc, acc, "get account after update must match")

	infoResp, err := dc.GetInfo(ctx, &daemon.GetInfoRequest{})
	require.NoError(t, err)
	require.NotNil(t, infoResp)
	require.Equal(t, me.Account().String(), infoResp.AccountId)
	require.Equal(t, me.DeviceKey().PeerID().String(), infoResp.DeviceId)

	peerInfo, err := nc.GetPeerInfo(ctx, &networking.GetPeerInfoRequest{
		DeviceId: infoResp.DeviceId,
	})
	require.NoError(t, err)
	require.NotNil(t, peerInfo)
	require.Equal(t, me.Account().String(), peerInfo.AccountId)
}

func TestDaemonListPublications(t *testing.T) {
	t.Parallel()

	alice := makeTestApp(t, "alice", makeTestConfig(t), true)

	conn, err := grpc.Dial(alice.GRPCListener.Addr().String(), grpc.WithBlock(), grpc.WithTransportCredentials(insecure.NewCredentials()))
	require.NoError(t, err)
	defer conn.Close()

	client := documents.NewPublicationsClient(conn)

	list, err := client.ListPublications(context.Background(), &documents.ListPublicationsRequest{})
	require.NoError(t, err)
	require.Len(t, list.Publications, 0, "account object must not be listed as publication")
}

func TestDaemonPushPublication(t *testing.T) {
	t.Parallel()
	t.Skip("Test uses real infra")
	cfg := makeTestConfig(t)
	cfg.P2P.TestnetName = "dev"
	alice := makeTestApp(t, "alice", cfg, true)
	ctx := context.Background()

	pub := publishDocument(t, ctx, alice)
	_, err := alice.RPC.Documents.PushPublication(ctx, &documents.PushPublicationRequest{
		DocumentId: pub.Document.Id,
		Url:        ipfs.TestGateway,
	})
	require.NoError(t, err)
	_, err = alice.RPC.Documents.PushPublication(ctx, &documents.PushPublicationRequest{
		DocumentId: pub.Document.Id,
		Url:        "https://gabo.es/",
	})
	require.Error(t, err)
}

func TestAPIGetRemotePublication(t *testing.T) {
	ctx := context.Background()

	// Carol will be the DHT server
	dhtProvider := makeTestApp(t, "carol", makeTestConfig(t), true)

	requester, publishedDocument, _ := makeRemotePublication(t, ctx, dhtProvider)

	remotePublication, err := requester.RPC.Documents.GetPublication(ctx, &documents.GetPublicationRequest{DocumentId: publishedDocument.Document.Id})
	require.NoError(t, err)

	testutil.ProtoEqual(t, publishedDocument, remotePublication, "remote publication doesn't match")
}

func TestBug_SyncHangs(t *testing.T) {
	// See: https://github.com/mintterteam/mintter/issues/712.
	t.Parallel()

	alice := makeTestApp(t, "alice", makeTestConfig(t), true)
	bob := makeTestApp(t, "bob", makeTestConfig(t), true)
	carol := makeTestApp(t, "carol", makeTestConfig(t), true)
	ctx := context.Background()

	var g errgroup.Group
	g.Go(func() error {
		_, err := alice.RPC.Networking.Connect(ctx, &networking.ConnectRequest{
			Addrs: getAddrs(t, bob),
		})
		return err
	})

	g.Go(func() error {
		_, err := alice.RPC.Daemon.ForceSync(ctx, &daemon.ForceSyncRequest{})
		return err
	})

	require.NoError(t, func() error {
		_, err := alice.RPC.Networking.Connect(ctx, &networking.ConnectRequest{
			Addrs: getAddrs(t, carol),
		})
		return err
	}())

	require.NoError(t, g.Wait())
}

func TestBug_PublicationsListInconsistent(t *testing.T) {
	// See: https://github.com/mintterteam/mintter/issues/692.
	// Although it turns out this bug may not be the daemon's issue.
	t.Parallel()

	alice := makeTestApp(t, "alice", makeTestConfig(t), true)
	ctx := context.Background()

	publish := func(ctx context.Context, t *testing.T, title, text string) *documents.Publication {
		draft, err := alice.RPC.Documents.CreateDraft(ctx, &documents.CreateDraftRequest{})
		require.NoError(t, err)

		_, err = alice.RPC.Documents.UpdateDraft(ctx, &documents.UpdateDraftRequest{
			DocumentId: draft.Id,
			Changes: []*documents.DocumentChange{
				{
					Op: &documents.DocumentChange_SetTitle{SetTitle: title},
				},
				{
					Op: &documents.DocumentChange_MoveBlock_{MoveBlock: &documents.DocumentChange_MoveBlock{
						BlockId:     "b1",
						Parent:      "",
						LeftSibling: "",
					}},
				},
				{
					Op: &documents.DocumentChange_ReplaceBlock{ReplaceBlock: &documents.Block{
						Id:   "b1",
						Text: "Hello world",
					}},
				},
			},
		})
		require.NoError(t, err)

		pub, err := alice.RPC.Documents.PublishDraft(ctx, &documents.PublishDraftRequest{
			DocumentId: draft.Id,
		})
		require.NoError(t, err)

		return pub
	}

	want := []*documents.Publication{
		publish(ctx, t, "Doc-1", "This is a doc-1"),
		publish(ctx, t, "Doc-2", "This is a doc-2"),
		publish(ctx, t, "Doc-3", "This is a doc-3"),
		publish(ctx, t, "Doc-4", "This is a doc-4"),
	}

	var g errgroup.Group

	// Trying this more than once and expecting it to return the same result. This is what bug was mostly about.
	// Arbitrary number of attempts was chosen.
	for i := 0; i < 15; i++ {
		g.Go(func() error {
			list, err := alice.RPC.Documents.ListPublications(ctx, &documents.ListPublicationsRequest{})
			require.NoError(t, err)

			require.Len(t, list.Publications, len(want))

			for w := range want {
				testutil.ProtoEqual(t, want[w], list.Publications[w], "publication %d doesn't match", w)
			}
			return nil
		})
	}

	require.NoError(t, g.Wait())
}

func TestBug_ListObjectsMustHaveCausalOrder(t *testing.T) {
	t.Parallel()

	alice := makeTestApp(t, "alice", makeTestConfig(t), true)
	bob := makeTestApp(t, "bob", makeTestConfig(t), true)
	ctx := context.Background()

	require.NoError(t, bob.Net.MustGet().Connect(ctx, alice.Net.MustGet().AddrInfo()))

	pub := publishDocument(t, ctx, alice)

	cc, err := bob.Net.MustGet().Client(ctx, alice.Storage.Device().PeerID())
	require.NoError(t, err)

	list, err := cc.ListObjects(ctx, &p2p.ListObjectsRequest{})
	require.NoError(t, err)

	require.Len(t, list.Objects, 2, "alice must list her account and the published document")

	var found *p2p.Object
	seen := map[cid.Cid]struct{}{}
	for _, obj := range list.Objects {
		if obj.Id == pub.Document.Id {
			found = obj
		}
		for _, ch := range obj.ChangeIds {
			c := must.Do2(cid.Decode(ch))

			var change hyper.Change
			require.NoError(t, alice.Blobs.LoadBlob(ctx, c, &change))

			seen[c] = struct{}{}

			for _, dep := range change.Deps {
				_, ok := seen[dep]
				require.True(t, ok, "non causal order of IPLD links: haven't seen dep %s of %s", dep, c)
			}
		}
	}

	require.NotNil(t, found, "published document must be in the list objects response")
}

func TestPeriodicSync(t *testing.T) {
	t.Parallel()

	acfg := makeTestConfig(t)
	bcfg := makeTestConfig(t)

	acfg.Syncing.WarmupDuration = 1 * time.Millisecond
	bcfg.Syncing.WarmupDuration = 1 * time.Millisecond

	acfg.Syncing.Interval = 150 * time.Millisecond
	bcfg.Syncing.Interval = 150 * time.Millisecond

	alice := makeTestApp(t, "alice", acfg, true)
	bob := makeTestApp(t, "bob", bcfg, true)
	ctx := context.Background()

	_, err := alice.RPC.Networking.Connect(ctx, &networking.ConnectRequest{
		Addrs: getAddrs(t, bob),
	})
	require.NoError(t, err)

	time.Sleep(200 * time.Millisecond)

	checkListAccounts := func(t *testing.T, a, b *App, msg string) {
		accs, err := a.RPC.Accounts.ListAccounts(ctx, &accounts.ListAccountsRequest{})
		require.NoError(t, err)

		bacc := must.Do2(b.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{}))

		require.Len(t, accs.Accounts, 2, msg)       // our own account is also listed. It's always first.
		bacc.IsTrusted = accs.Accounts[1].IsTrusted // just bc they synced they dont trust each other
		testutil.ProtoEqual(t, bacc, accs.Accounts[1], "a must fetch b's account fully")
	}

	checkListAccounts(t, alice, bob, "alice to bob")
	checkListAccounts(t, bob, alice, "bob to alice")
}

func TestMultiDevice(t *testing.T) {
	t.Parallel()

	alice1 := makeTestApp(t, "alice", makeTestConfig(t), true)
	alice2 := makeTestApp(t, "alice-2", makeTestConfig(t), true)
	ctx := context.Background()

	_, err := alice1.RPC.Networking.Connect(ctx, &networking.ConnectRequest{
		Addrs: getAddrs(t, alice2),
	})
	require.NoError(t, err)
	acc1 := must.Do2(alice1.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{}))
	acc2 := must.Do2(alice2.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{}))

	require.False(t, proto.Equal(acc1, acc2), "accounts must not match before syncing")

	{
		sr := must.Do2(alice1.Syncing.MustGet().Sync(ctx))
		require.Equal(t, int64(1), sr.NumSyncOK)
		require.Equal(t, int64(0), sr.NumSyncFailed)
		require.Equal(t, []peer.ID{alice1.Storage.Device().PeerID(), alice2.Storage.Device().PeerID()}, sr.Peers)
	}

	{
		sr := must.Do2(alice2.Syncing.MustGet().Sync(ctx))
		require.Equal(t, int64(1), sr.NumSyncOK)
		require.Equal(t, int64(0), sr.NumSyncFailed)
		require.Equal(t, []peer.ID{alice2.Storage.Device().PeerID(), alice1.Storage.Device().PeerID()}, sr.Peers)
	}
	acc1 = must.Do2(alice1.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{}))
	acc2 = must.Do2(alice2.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{}))
	testutil.ProtoEqual(t, acc1, acc2, "accounts must match after sync")

	require.Len(t, acc2.Devices, 2, "must have two devices after syncing")
}

func TestTrustedPeers(t *testing.T) {
	t.Parallel()

	alice := makeTestApp(t, "alice", makeTestConfig(t), true)
	bob := makeTestApp(t, "bob", makeTestConfig(t), true)
	ctx := context.Background()

	_, err := alice.RPC.Networking.Connect(ctx, &networking.ConnectRequest{
		Addrs: getAddrs(t, bob),
	})
	require.NoError(t, err)

	{
		sr := must.Do2(alice.Syncing.MustGet().Sync(ctx))
		require.Equal(t, int64(1), sr.NumSyncOK)
		require.Equal(t, int64(0), sr.NumSyncFailed)
		require.ElementsMatch(t, []peer.ID{alice.Storage.Device().PeerID(), bob.Storage.Device().PeerID()}, sr.Peers)
	}

	{
		sr := must.Do2(bob.Syncing.MustGet().Sync(ctx))
		require.Equal(t, int64(1), sr.NumSyncOK)
		require.Equal(t, int64(0), sr.NumSyncFailed)
		require.ElementsMatch(t, []peer.ID{bob.Storage.Device().PeerID(), alice.Storage.Device().PeerID()}, sr.Peers)
	}

	acc1 := must.Do2(alice.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{Id: bob.Net.MustGet().ID().Account().Principal().String()}))
	require.False(t, acc1.IsTrusted)
	acc2 := must.Do2(bob.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{Id: alice.Net.MustGet().ID().Account().Principal().String()}))
	require.False(t, acc2.IsTrusted)

	acc1, err = alice.RPC.Accounts.SetAccountTrust(ctx, &accounts.SetAccountTrustRequest{Id: bob.Net.MustGet().ID().Account().Principal().String(), IsTrusted: true})
	require.NoError(t, err)
	require.True(t, acc1.IsTrusted)

	//Just because they sync the should not be trusted
	{
		sr := must.Do2(alice.Syncing.MustGet().Sync(ctx))
		require.Equal(t, int64(1), sr.NumSyncOK)
		require.Equal(t, int64(0), sr.NumSyncFailed)
		require.ElementsMatch(t, []peer.ID{alice.Storage.Device().PeerID(), bob.Storage.Device().PeerID()}, sr.Peers)
	}

	{
		sr := must.Do2(bob.Syncing.MustGet().Sync(ctx))
		require.Equal(t, int64(1), sr.NumSyncOK)
		require.Equal(t, int64(0), sr.NumSyncFailed)
		require.ElementsMatch(t, []peer.ID{bob.Storage.Device().PeerID(), alice.Storage.Device().PeerID()}, sr.Peers)
	}
	time.Sleep(100 * time.Millisecond) // to give time to sync
	acc1 = must.Do2(alice.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{Id: bob.Net.MustGet().ID().Account().Principal().String()}))
	require.True(t, acc1.IsTrusted)
	acc2 = must.Do2(bob.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{Id: alice.Net.MustGet().ID().Account().Principal().String()}))
	require.False(t, acc2.IsTrusted)

	acc1, err = alice.RPC.Accounts.SetAccountTrust(ctx, &accounts.SetAccountTrustRequest{Id: bob.Net.MustGet().ID().Account().Principal().String(), IsTrusted: false})
	require.NoError(t, err)
	require.False(t, acc1.IsTrusted)
	acc2, err = bob.RPC.Accounts.SetAccountTrust(ctx, &accounts.SetAccountTrustRequest{Id: alice.Net.MustGet().ID().Account().Principal().String(), IsTrusted: true})
	require.NoError(t, err)
	require.True(t, acc2.IsTrusted)

	//Double check
	acc1 = must.Do2(alice.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{Id: bob.Net.MustGet().ID().Account().Principal().String()}))
	require.False(t, acc1.IsTrusted)
	acc2 = must.Do2(bob.RPC.Accounts.GetAccount(ctx, &accounts.GetAccountRequest{Id: alice.Net.MustGet().ID().Account().Principal().String()}))
	require.True(t, acc2.IsTrusted)
}

func TestNetworkingListPeers(t *testing.T) {
	t.Parallel()

	alice := makeTestApp(t, "alice", makeTestConfig(t), true)
	bob := makeTestApp(t, "bob", makeTestConfig(t), true)
	ctx := context.Background()

	_, err := alice.RPC.Networking.Connect(ctx, &networking.ConnectRequest{
		Addrs: getAddrs(t, bob),
	})
	require.NoError(t, err)

	pid := bob.Storage.Identity().MustGet().DeviceKey().PeerID()
	acc := bob.Storage.Identity().MustGet().Account().Principal()
	pList, err := alice.RPC.Networking.ListPeers(ctx, &networking.ListPeersRequest{})
	require.NoError(t, err)
	require.Len(t, pList.Peers, 1)
	require.Equal(t, acc.String(), pList.Peers[0].AccountId, "account ids must match")
	require.Equal(t, pid.String(), pList.Peers[0].Id, "peer ids must match")
	pList, err = alice.RPC.Networking.ListPeers(ctx, &networking.ListPeersRequest{})
	require.NoError(t, err)
	require.Len(t, pList.Peers, 1)
}

func getAddrs(t *testing.T, a *App) []string {
	return mttnet.AddrInfoToStrings(a.Net.MustGet().AddrInfo())
}

func makeRemotePublication(t *testing.T, ctx context.Context, dhtProvider *App) (*App, *documents.Publication, *App) {
	var publisher *App
	{
		cfg := makeTestConfig(t)
		cfg.P2P.BootstrapPeers = dhtProvider.Net.MustGet().Libp2p().AddrsFull()
		publisher = makeTestApp(t, "alice", cfg, true)
	}

	var bob *App
	{
		cfg := makeTestConfig(t)
		cfg.P2P.BootstrapPeers = dhtProvider.Net.MustGet().Libp2p().AddrsFull()
		bob = makeTestApp(t, "bob", cfg, true)
	}

	// Make sure bob does't know anything about publisher.
	require.NoError(t, bob.Net.MustGet().Libp2p().Network().ClosePeer(publisher.Storage.Device().ID()))
	bob.Net.MustGet().Libp2p().Peerstore().RemovePeer(publisher.Storage.Device().ID())

	publishedDocument := publishDocument(t, ctx, publisher)

	// Sleeping just in case to make sure alices publication propagates.
	time.Sleep(time.Second)
	return bob, publishedDocument, publisher
}

func publishDocument(t *testing.T, ctx context.Context, publisher *App) *documents.Publication {
	draft, err := publisher.RPC.Documents.CreateDraft(ctx, &documents.CreateDraftRequest{})
	require.NoError(t, err)

	updated, err := publisher.RPC.Documents.UpdateDraft(ctx, &documents.UpdateDraftRequest{
		DocumentId: draft.Id,
		Changes: []*documents.DocumentChange{
			{Op: &documents.DocumentChange_SetTitle{SetTitle: "My new document title"}},
			{Op: &documents.DocumentChange_MoveBlock_{MoveBlock: &documents.DocumentChange_MoveBlock{BlockId: "b1"}}},
			{Op: &documents.DocumentChange_ReplaceBlock{ReplaceBlock: &documents.Block{
				Id:   "b1",
				Type: "statement",
				Text: "Hello world!",
			}}},
		},
	})
	require.NoError(t, err)
	require.NotNil(t, updated)
	published, err := publisher.RPC.Documents.PublishDraft(ctx, &documents.PublishDraftRequest{DocumentId: draft.Id})
	require.NoError(t, err)
	return published
}

func updateDocumenTitle(t *testing.T, ctx context.Context, publisher *App, docID, newTitle string) *documents.Publication {
	draft, err := publisher.RPC.Documents.CreateDraft(ctx, &documents.CreateDraftRequest{
		ExistingDocumentId: docID,
	})
	require.NoError(t, err)

	updated, err := publisher.RPC.Documents.UpdateDraft(ctx, &documents.UpdateDraftRequest{
		DocumentId: draft.Id,
		Changes: []*documents.DocumentChange{
			{Op: &documents.DocumentChange_SetTitle{SetTitle: newTitle}},
		},
	})
	require.NoError(t, err)
	require.NotNil(t, updated)
	published, err := publisher.RPC.Documents.PublishDraft(ctx, &documents.PublishDraftRequest{DocumentId: draft.Id})
	require.NoError(t, err)
	return published
}
