import {ConnectError} from '@connectrpc/connect'
import {useGRPCClient, useQueryInvalidator} from '@mintter/app/app-context'
import appError from '@mintter/app/errors'
import {useDaemonInfo} from '@mintter/app/models/daemon'
import {queryKeys} from '@mintter/app/models/query-keys'
import {Account, GRPCClient, Profile} from '@mintter/shared'
import {
  UseMutationOptions,
  useMutation,
  useQueries,
  useQuery,
} from '@tanstack/react-query'
import {useConnectedPeers} from './networking'

export function useAccount(accountId?: string) {
  const grpcClient = useGRPCClient()
  return useQuery<Account | null, ConnectError>(
    getAccountQuery(grpcClient, accountId),
  )
}

export function useAccounts(accountIds: string[]) {
  const grpcClient = useGRPCClient()
  return useQueries({
    queries: accountIds.map((id) => getAccountQuery(grpcClient, id)),
  })
}

function getAccountQuery(grpcClient: GRPCClient, accountId?: string) {
  return {
    enabled: !!accountId,
    queryKey: [queryKeys.GET_ACCOUNT, accountId],
    queryFn: () =>
      grpcClient.accounts.getAccount({id: accountId}).catch((e) => {
        return null
      }),
    useErrorBoundary: () => false,
  }
}

export function useAllAccounts(filterSites?: boolean) {
  // let isDaemonReady = useDaemonReady()
  const grpcClient = useGRPCClient()
  const contacts = useQuery<{accounts: Array<Account>}, ConnectError>({
    // enabled: !!isDaemonReady,
    queryKey: [queryKeys.GET_ALL_ACCOUNTS, filterSites],
    queryFn: async () => {
      const listed = await grpcClient.accounts.listAccounts({})
      if (filterSites) {
        return {
          accounts: listed.accounts.filter(
            (account) =>
              account.profile?.bio !== 'Hypermedia Site. Powered by Mintter.',
          ),
        }
      }
      return listed
    },
    onError: (err) => {
      appError(`useAllAccounts Error ${err.code}: ${err.message}`, err.metadata)
    },
  })
  return contacts
}

export function useSetTrusted(
  opts?: UseMutationOptions<
    void,
    unknown,
    {accountId: string; isTrusted: boolean}
  >,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      accountId,
      isTrusted,
    }: {
      accountId: string
      isTrusted: boolean
    }) => {
      await grpcClient.accounts.setAccountTrust({id: accountId, isTrusted})
      return undefined
    },
    onSuccess: (result, input, ctx) => {
      invalidate([queryKeys.GET_ACCOUNT, input.accountId])
      invalidate([queryKeys.GET_ALL_ACCOUNTS])
      invalidate([queryKeys.GET_PUBLICATION_LIST, 'trusted'])
      opts?.onSuccess?.(result, input, ctx)
    },
    ...opts,
  })
}

export function useAccountIsConnected(account: Account) {
  const peers = useConnectedPeers()
  return !!peers.data?.find((peer) => peer.accountId == account.id)
}

export function useMyAccount() {
  const daemonInfo = useDaemonInfo()
  return useAccount(daemonInfo.data?.accountId)
}

export function useSetProfile(
  opts?: UseMutationOptions<string, unknown, Partial<Profile>>,
) {
  const invalidate = useQueryInvalidator()
  const grpcClient = useGRPCClient()
  return useMutation({
    mutationFn: async (profile: Partial<Profile>) => {
      const daemonInfo = await grpcClient.daemon.getInfo({})
      const accountId = daemonInfo?.accountId
      await grpcClient.accounts.updateProfile(profile)
      return accountId || '' // empty string here is nonsense but we need to pass the account id to the invalidation fn if we have it
      // but accountId is empty during onboarding, so the invalidate will be nonsense but who cares
    },
    ...opts, // careful to put this above onSuccess so that it overrides opts.onSuccess
    onSuccess: (accountId, ...rest) => {
      invalidate([queryKeys.GET_ACCOUNT, accountId])
      invalidate([queryKeys.GET_ALL_ACCOUNTS])
      opts?.onSuccess?.(accountId, ...rest)
    },
  })
}
