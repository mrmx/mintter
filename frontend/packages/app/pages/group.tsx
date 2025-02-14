import * as Ariakit from '@ariakit/react'
import {CompositeInput} from '@ariakit/react-core/composite/composite-input'
import Footer from '@mintter/app/components/footer'
import {
  API_FILE_URL,
  Account,
  Document,
  Group,
  Profile,
  Publication,
  PublicationContent,
  Role,
  formattedDate,
  idToUrl,
  pluralS,
  unpackDocId,
  unpackHmId,
} from '@mintter/shared'
import {
  Button,
  Container,
  DialogDescription,
  DialogTitle,
  Form,
  H1,
  Heading,
  Label,
  ListItem,
  Separator,
  SizableText,
  Tooltip,
  View,
  XGroup,
  XStack,
  YGroup,
  YStack,
} from '@mintter/ui'
import {
  ArrowUpRight,
  Pencil,
  PlusCircle,
  Store,
  Trash,
  X,
} from '@tamagui/lucide-icons'
import {Allotment} from 'allotment'
import 'allotment/dist/style.css'
import {matchSorter} from 'match-sorter'
import {
  forwardRef,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {toast} from 'react-hot-toast'
import {AccountLinkAvatar} from '../components/account-link-avatar'
import '../components/accounts-combobox.css'
import {Avatar} from '../components/avatar'
import {EntityVersionsAccessory} from '../components/changes-list'
import {useAppDialog} from '../components/dialog'
import {EditDocButton} from '../components/edit-doc-button'
import {useEditGroupInfoDialog} from '../components/edit-group-info'
import {FooterButton} from '../components/footer'
import {AppLinkText} from '../components/link'
import {copyLinkMenuItem} from '../components/list-item'
import {MainWrapper} from '../components/main-wrapper'
import {OptionsDropdown} from '../components/options-dropdown'
import {PinGroupButton} from '../components/pin-entity'
import {PublicationListItem} from '../components/publication-list-item'
import {CopyReferenceButton} from '../components/titlebar-common'
import appError from '../errors'
import {useAccount, useAllAccounts, useMyAccount} from '../models/accounts'
import {useEntityTimeline} from '../models/changes'
import {useDraftList, usePublication} from '../models/documents'
import {useGatewayUrl} from '../models/gateway-settings'
import {
  useAddGroupMember,
  useFullGroupContent,
  useGroup,
  useGroupContent,
  useGroupMembers,
  useRemoveDocFromGroup,
} from '../models/groups'
import {useOpenUrl} from '../open-url'
import {RenamePubDialog} from '../src/rename-publication-dialog'
import {GroupRoute, useNavRoute} from '../utils/navigation'
import {useOpenDraft} from '../utils/open-draft'
import {hostnameStripProtocol} from '../utils/site-hostname'
import {useNavigate} from '../utils/useNavigate'
import {AppPublicationContentProvider} from './publication-content-provider'

export default function GroupPage() {
  const route = useNavRoute()
  const accessory = route?.accesory
  if (route.key !== 'group') throw new Error('Group page needs group route')
  const {groupId, version} = route
  const group = useGroup(groupId, version, {
    // refetchInterval: 5_000,
  })
  const latestGroup = useGroup(groupId, undefined, {})
  const groupContent = useFullGroupContent(groupId, version)
  const latestGroupContent = useGroupContent(groupId)
  // const groupMembers = useGroupMembers(groupId, version)
  const groupMembers = useGroupMembers(groupId)
  const drafts = useDraftList()
  const myAccount = useMyAccount()
  const myMemberRole =
    groupMembers.data?.members[myAccount.data?.id || ''] ||
    Role.ROLE_UNSPECIFIED
  const isMember = myMemberRole !== Role.ROLE_UNSPECIFIED
  // const isOwner = myAccount.data?.id === group.data?.ownerAccountId
  // const owner = groupMembers.data?.members[group.data?.ownerAccountId || '']
  const spawn = useNavigate('spawn')
  const ownerAccount = useAccount(group.data?.ownerAccountId)
  const inviteMember = useAppDialog(InviteMemberDialog)
  const openDraft = useOpenDraft()
  const ownerAccountId = group.data?.ownerAccountId
  const frontDocumentUrl = groupContent.data?.content
    ? groupContent.data?.content['/']
    : undefined
  const frontPageId = frontDocumentUrl ? unpackDocId(frontDocumentUrl) : null
  const memberCount = Object.keys(groupMembers.data?.members || {}).length
  const siteBaseUrl = group.data?.siteInfo?.baseUrl
  const {lastSyncTime, lastOkSyncTime} = group.data?.siteInfo || {}
  const now = useRoughTime()
  const syncAge = lastSyncTime ? now - lastSyncTime.seconds : 0n
  const isRecentlySynced = syncAge < 70n // slightly over 60s just in case. we are polling and updating time ever 5s
  const isRecentlyOkSynced = syncAge < 70n // slightly over 60s just in case. we are polling and updating time ever 5s
  const siteVersionMatches = true
  //https://www.notion.so/mintter/SiteInfo-version-not-set-c37f78820189401ab4621ae0f7c1b63a?pvs=4
  // const siteVersionMatches =
  //   group.data?.version === group.data?.siteInfo?.version
  const siteSyncStatus =
    isRecentlySynced && isRecentlyOkSynced
      ? siteVersionMatches
        ? GroupStatus.SyncedConnected
        : GroupStatus.UnsyncedConnected
      : GroupStatus.Disconnected
  const syncStatus = siteBaseUrl ? siteSyncStatus : undefined
  const editGroupInfo = useEditGroupInfoDialog()
  const removeDoc = useRemoveDocFromGroup()
  const frontDocMenuItems = [
    frontDocumentUrl && isMember
      ? {
          label: 'Remove Front Document',
          key: 'remove-front-doc',
          icon: Trash,
          onPress: () => {
            removeDoc
              .mutateAsync({groupId, pathName: '/'})
              .then(() => {
                toast.success('Removed front document')
              })
              .catch((error) => {
                appError(`Failed to remove front document: ${error?.message}`, {
                  error,
                })
              })
          },
        }
      : null,
  ].filter(Boolean)
  const openUrl = useOpenUrl()
  const entityId = unpackHmId(groupId)
  return (
    <>
      <YStack flex={1} justifyContent="space-between" maxHeight={'100%'}>
        <Allotment
          key={`${accessory}`}
          defaultSizes={accessory ? [65, 35] : [100]}
        >
          <Allotment.Pane>
            <MainWrapper maxHeight={'100%'}>
              <Container>
                <YStack group="header">
                  <XStack gap="$2" padding="$4" paddingHorizontal={0}>
                    <YStack gap="$3" flex={1}>
                      <YStack gap="$3">
                        <H1 fontWeight="bold">{group.data?.title}</H1>
                        {siteBaseUrl && (
                          <XStack alignItems="center" gap="$2">
                            <Tooltip
                              content={`Open group in the web (${syncStatus?.message(
                                group.data,
                              )})`}
                            >
                              <Button
                                size="$2"
                                fontFamily={'$mono'}
                                fontSize="$4"
                                // hoverStyle={{textDecorationLine: 'underline'}}
                                onPress={() => {
                                  openUrl(siteBaseUrl)
                                }}
                                color="$blue10"
                                icon={
                                  syncStatus &&
                                  group.data && (
                                    <View
                                      style={{
                                        borderRadius: 5,
                                        width: 10,
                                        height: 10,
                                        backgroundColor: syncStatus.color,
                                      }}
                                    />
                                  )
                                }
                              >
                                {hostnameStripProtocol(siteBaseUrl)}
                              </Button>
                            </Tooltip>
                          </XStack>
                        )}
                        <XStack>
                          <SizableText size="$5">
                            {group.data?.description}
                          </SizableText>
                        </XStack>
                      </YStack>
                    </YStack>
                    <YStack paddingTop="$4">
                      <XStack gap="$3" alignItems="center">
                        {!frontDocumentUrl && isMember && (
                          <Tooltip content={'Create Front Document'}>
                            <Button
                              icon={Store}
                              size="$2"
                              onPress={() => {
                                openDraft(
                                  {groupId, pathName: '/', key: 'group'},
                                  {
                                    pathName: '/',
                                    initialTitle: group?.data?.title,
                                  },
                                )
                              }}
                            >
                              Add a Frontpage
                            </Button>
                          </Tooltip>
                        )}

                        <XStack
                          gap="$2"
                          // opacity={0}
                          // $group-header-hover={{
                          //   opacity: 1,
                          // }}
                        >
                          <CopyReferenceButton />
                          <PinGroupButton groupId={groupId} />
                          {isMember && (
                            <Tooltip content="Edit Group info">
                              <Button
                                icon={Pencil}
                                size="$2"
                                onPress={() => {
                                  editGroupInfo.open(groupId)
                                }}
                              />
                            </Tooltip>
                          )}
                        </XStack>
                      </XStack>
                    </YStack>
                  </XStack>
                </YStack>
                <YStack>
                  <XStack paddingVertical="$4" alignItems="center" gap="$3">
                    <XStack gap="$3" flex={1} alignItems="flex-end">
                      {ownerAccountId ? (
                        <YStack
                          gap="$1"
                          padding="$2"
                          bg="$blue4"
                          borderRadius="$3"
                          alignItems="flex-start"
                        >
                          <SizableText size="$1">Owner:</SizableText>
                          <XStack gap="$2">
                            <AccountLinkAvatar
                              size={24}
                              accountId={ownerAccountId}
                            />
                            <AppLinkText
                              toRoute={{
                                key: 'account',
                                accountId: ownerAccountId,
                              }}
                            >
                              {ownerAccount.data?.profile?.alias}
                            </AppLinkText>
                          </XStack>
                        </YStack>
                      ) : null}
                      <XStack paddingVertical="$2">
                        {Object.entries(groupMembers.data?.members || {}).map(
                          ([memberId, role], idx) => {
                            if (role === Role.OWNER) return null
                            return (
                              <XStack
                                zIndex={idx + 1}
                                key={memberId}
                                borderColor="$background"
                                backgroundColor="$background"
                                borderWidth={2}
                                borderRadius={100}
                                marginLeft={-8}
                                animation="fast"
                              >
                                <AccountLinkAvatar
                                  size={24}
                                  accountId={memberId}
                                />
                              </XStack>
                            )
                          },
                        )}
                      </XStack>
                    </XStack>
                    {memberCount > 1 || myMemberRole === Role.OWNER ? (
                      <XStack>
                        {myMemberRole === Role.OWNER ? (
                          <InviteMemberButton
                            onPress={() => {
                              inviteMember.open({groupId})
                            }}
                          />
                        ) : (
                          <View />
                        )}
                      </XStack>
                    ) : null}
                  </XStack>
                </YStack>
                <Separator />
                {frontPageId && frontDocumentUrl && (
                  <XStack
                    gap="$2"
                    borderBottomWidth={1}
                    borderColor="$gray6"
                    paddingVertical="$4"
                    paddingHorizontal={0}
                    minHeight="$6"
                    group="item"
                  >
                    <FrontPublicationDisplay
                      urlWithVersion={frontDocumentUrl}
                      groupTitle={group.data?.title || ''}
                    />

                    <XStack
                      gap="$2"
                      position="absolute"
                      right={0}
                      top={'$4'}
                      alignItems="center"
                    >
                      {frontDocMenuItems.length ? (
                        <OptionsDropdown
                          hiddenUntilItemHover
                          menuItems={frontDocMenuItems}
                        />
                      ) : null}
                      <XGroup>
                        {isMember && (
                          <EditDocButton
                            contextRoute={route}
                            variant={{
                              key: 'group',
                              groupId,
                              pathName: '/',
                            }}
                            docId={frontPageId?.docId}
                            baseVersion={frontPageId?.version || undefined}
                            navMode="push"
                          />
                        )}
                      </XGroup>
                      <Tooltip content="Open in New Window">
                        <Button
                          icon={ArrowUpRight}
                          size="$2"
                          onPress={() => {
                            spawn({
                              key: 'publication',
                              documentId: frontPageId?.docId,
                              variant: {
                                key: 'group',
                                groupId,
                                pathName: '/',
                              },
                            })
                          }}
                        />
                      </Tooltip>
                    </XStack>
                  </XStack>
                )}
                <YStack paddingVertical="$4" gap="$4">
                  {//Object.entries(groupContent.data?.content || {})
                  groupContent.data?.items.map(
                    ({key, pub, author, editors, id}) => {
                      if (key === '/') return null

                      const latestEntry =
                        latestGroupContent.data?.content?.[key]
                      const latestDocId = latestEntry
                        ? unpackDocId(latestEntry)
                        : null

                      return (
                        <GroupContentItem
                          key={key}
                          docId={id.qid}
                          groupId={groupId}
                          version={id?.version || undefined}
                          latestVersion={latestDocId?.version || undefined}
                          hasDraft={drafts.data?.documents.find(
                            (d) => d.id == id.qid,
                          )}
                          pub={pub}
                          userRole={myMemberRole}
                          editors={editors}
                          author={author}
                          pathName={key}
                        />
                      )
                    },
                  )}
                </YStack>
              </Container>
            </MainWrapper>
          </Allotment.Pane>
          {group.data?.version && route.accessory?.key === 'versions' ? (
            <EntityVersionsAccessory
              id={entityId}
              activeVersion={group.data?.version}
              variantVersion={latestGroup.data?.version}
            />
          ) : null}
        </Allotment>
        <Footer>
          <ChangesFooterItem route={route} />
        </Footer>
        {inviteMember.content}
        {editGroupInfo.content}
      </YStack>
    </>
  )
}

function GroupContentItem({
  docId,
  version,
  latestVersion,
  hasDraft,
  groupId,
  pathName,
  userRole,
  pub,
  editors,
  author,
}: {
  docId: string
  version?: string
  latestVersion?: string
  hasDraft: undefined | Document
  groupId: string
  pathName: string
  userRole: Role
  pub: Publication | undefined
  editors: Array<Account | string | undefined>
  author: Account | string | undefined
}) {
  const removeDoc = useRemoveDocFromGroup()
  const renameDialog = useAppDialog(RenamePubDialog)
  const gwUrl = useGatewayUrl()
  if (!pub) return null
  const memberMenuItems = [
    {
      label: 'Remove from Group',
      icon: Trash,
      onPress: () => {
        removeDoc.mutate({groupId, pathName})
      },
      key: 'remove',
    },
    {
      label: 'Rename Short Path',
      icon: Pencil,
      onPress: () => {
        renameDialog.open({
          pathName,
          groupId,
          docTitle: pub.document?.title || '',
        })
      },
      key: 'rename',
    },
  ]
  const ownerId = pub.document?.author
  if (!ownerId) return null
  return (
    <>
      <PublicationListItem
        publication={pub}
        editors={editors}
        author={author}
        hasDraft={hasDraft}
        pathName={pathName}
        onPathNamePress={() => {
          renameDialog.open({
            pathName,
            groupId,
            docTitle: pub.document?.title || '',
          })
        }}
        variant={{key: 'group', groupId, pathName}}
        menuItems={() => [
          copyLinkMenuItem(
            idToUrl(docId, gwUrl.data, version), // this will produce a /d/eid URL but we really want a /g/eid/pathName URL here :(
            'Group Publication',
          ),
          ...(userRole != Role.ROLE_UNSPECIFIED ? memberMenuItems : []),
        ]}
        openRoute={{
          key: 'publication',
          documentId: docId,
          ...(latestVersion === version
            ? {variant: {key: 'group', groupId, pathName}}
            : {
                versionId: version,
                variant: {key: 'authors', authors: [ownerId]},
              }),
        }}
      />
      {renameDialog.content}
    </>
  )
}

function InviteMemberButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button icon={PlusCircle} size="$2" {...props}>
      Invite Editor
    </Button>
  )
}

function normalizeAccountId(accountId: string) {
  if (accountId.length === 48) return accountId
  const fromUrl = unpackHmId(accountId)
  if (fromUrl && fromUrl.type === 'a') return fromUrl.eid
}

type AccountListItem = {
  id: string
  profile?: Profile
  alias?: string
  devices: any
  isTrusted: boolean
}

function InviteMemberDialog({
  input,
  onClose,
}: {
  input: {groupId: string}
  onClose: () => void
}) {
  const addMember = useAddGroupMember()
  const accounts = useAllAccounts(true)

  const accountsMap = useMemo(
    () =>
      accounts.status == 'success'
        ? accounts.data.accounts.reduce((acc, current) => {
            if (current?.profile?.alias) {
              acc[current.id] = {...current, alias: current?.profile?.alias}
            }

            return acc
          }, {})
        : {},
    [accounts.status, accounts.data],
  )
  let accountsListValues = Object.values(accountsMap)

  const [selectedMembers, setMemberSelection] = useState<Array<string>>([])
  const [value, setValue] = useState('')

  const searchValue = useDeferredValue(value)

  const matches = useMemo(() => {
    return matchSorter(accountsListValues, searchValue, {
      // baseSort: (a, b) => (a.index < b.index ? -1 : 1),
      keys: ['id', 'alias'],
    })
      .slice(0, 10)
      .map((v: any) => v.id)
  }, [accountsListValues, searchValue])

  return (
    <>
      <Form
        onSubmit={() => {
          if (!selectedMembers.length) {
            toast.error('Empty selection')
            return
          }

          addMember
            .mutateAsync({
              groupId: input.groupId,
              members: selectedMembers,
            })
            .then(() => {
              onClose()
              toast.success('Members added to group')
            })
            .catch((error) => {
              toast.error('Error when adding members: ', error)
            })
        }}
      >
        <DialogTitle>Add Group Editor</DialogTitle>

        <YStack paddingVertical="$3" gap="$2">
          <Label>Contacts</Label>
          <TagInput
            label="Accounts"
            value={value}
            onChange={setValue}
            values={selectedMembers}
            onValuesChange={setMemberSelection}
            placeholder="Search by alias..."
            accountsMap={accountsMap}
          >
            {matches.map((value) => (
              <TagInputItem
                key={value}
                value={value}
                account={accountsMap[value]}
              />
            ))}
            {matches.length == 0 ? (
              <TagInputItem
                onClick={() => {
                  let unpackedId = unpackHmId(value)
                  if (unpackedId && unpackedId.type == 'a') {
                    setMemberSelection((values) => [...values, unpackedId.eid])
                  }
                }}
              >
                Add &quot;{value}&quot;
              </TagInputItem>
            ) : null}
          </TagInput>
        </YStack>
        <DialogDescription gap="$3">
          <SizableText>Search for member alias, or paste member ID</SizableText>
        </DialogDescription>
        <Form.Trigger asChild>
          <Button>Add Member</Button>
        </Form.Trigger>
      </Form>
    </>
  )
}

function FrontPublicationDisplay({
  urlWithVersion,
  groupTitle,
}: {
  urlWithVersion: string
  groupTitle: string
}) {
  const unpacked = unpackDocId(urlWithVersion)
  const pub = usePublication({
    id: unpacked?.docId || '',
    version: unpacked?.version || '',
  })

  return pub.status == 'success' && pub.data ? (
    <YStack
      width="100%"
      maxWidth="calc(90ch + 20vw)"
      paddingHorizontal="$5"
      alignSelf="center"
    >
      {pub.data?.document?.title && groupTitle !== pub.data?.document?.title ? (
        <Heading
          size="$1"
          fontSize={'$2'}
          paddingHorizontal="$5"
          $gtMd={{
            paddingHorizontal: '$6',
          }}
        >
          {pub.data?.document?.title}
        </Heading>
      ) : null}
      <AppPublicationContentProvider>
        <PublicationContent publication={pub.data} />
      </AppPublicationContentProvider>
    </YStack>
  ) : null
}

function useRoughTime(): bigint {
  // hook that provides time in seconds, updates every 5 seconds
  const [time, setTime] = useState(BigInt(Math.round(Date.now() / 1000)))
  const timer = useRef<NodeJS.Timeout | null>(null)
  const updateTime = () => {
    setTime(BigInt(Math.round(Date.now() / 1000)))
  }
  useEffect(() => {
    timer.current = setInterval(updateTime, 5_000)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])
  return time
}

const GroupStatus = {
  SyncedConnected: {
    color: 'green',
    message: (g: Group) =>
      `Synced and Connected to ${hostnameStripProtocol(g.siteInfo?.baseUrl)}`,
  },
  UnsyncedConnected: {color: 'orange', message: (g: Group) => `Syncing`},
  Disconnected: {
    color: 'gray',
    message: (g: Group) =>
      g.siteInfo?.lastOkSyncTime && g.siteInfo?.lastOkSyncTime?.seconds !== 0n
        ? `Last Synced ${formattedDate(g.siteInfo.lastOkSyncTime)}`
        : `Not Connected`,
  },
} as const

function ChangesFooterItem({route}: {route: GroupRoute}) {
  const timeline = useEntityTimeline(route.groupId)
  const count = timeline.data?.timelineEntries.length || 0
  const replace = useNavigate('replace')
  return (
    <FooterButton
      active={route.accessory?.key === 'versions'}
      label={`${count} ${pluralS(count, 'Version')}`}
      icon={Pencil}
      onPress={() => {
        if (route.accessory) return replace({...route, accessory: null})
        replace({...route, accessory: {key: 'versions'}})
      }}
    />
  )
}

// export function EntityChangesAccessory({
//   id,
//   accessory,
// }: {
//   id: UnpackedHypermediaId | null
//   accessory: EntityVersionsAccessory | undefined | null
// }) {
//   const timeline = useEntityTimeline(
//     (id && createHmId(id.type, id.eid)) || undefined,
//   )
//   if (accessory?.key !== 'versions') return null
//   return (
//     <AccessoryContainer title="Changes">
//       <Text>Changes of {JSON.stringify(timeline.data)}</Text>
//     </AccessoryContainer>
//   )
// }

export interface TagInputProps extends Omit<Ariakit.ComboboxProps, 'onChange'> {
  label: string
  value?: string
  onChange?: (value: string) => void
  defaultValue?: string
  values?: Array<string>
  onValuesChange?: (values: Array<string>) => void
  defaultValues?: Array<AccountListItem>
  accountsMap: Record<string, AccountListItem>
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  function TagInput(props, ref) {
    const {
      label,
      defaultValue,
      value,
      onChange,
      defaultValues,
      values,
      onValuesChange,
      children,
      accountsMap,
      ...comboboxProps
    } = props

    const comboboxRef = useRef<HTMLInputElement>(null)
    const defaultComboboxId = useId()
    const comboboxId = comboboxProps.id || defaultComboboxId

    const combobox = Ariakit.useComboboxStore({
      value,
      defaultValue,
      setValue: onChange,
      resetValueOnHide: true,
    })

    const select = Ariakit.useSelectStore<any>({
      combobox,
      value: values,
      defaultValue: defaultValues,
      setValue: onValuesChange,
    })

    const composite = Ariakit.useCompositeStore({
      defaultActiveId: comboboxId,
    })

    const selectedValues = select.useState('value')

    // Reset the combobox value whenever an item is checked or unchecked.
    useEffect(() => combobox.setValue(''), [selectedValues, combobox])

    const toggleValueFromSelectedValues = (value: string) => {
      select.setValue((prevSelectedValues) => {
        const index = prevSelectedValues.indexOf(value)
        if (index !== -1) {
          return prevSelectedValues.filter((v: string) => v != value)
        }
        return [...prevSelectedValues, value]
      })
    }

    const onItemClick = (value: string) => () => {
      toggleValueFromSelectedValues(value)
    }

    const onItemKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.currentTarget.click()
      }
    }

    const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Backspace') return
      const {selectionStart, selectionEnd} = event.currentTarget
      const isCaretAtTheBeginning = selectionStart === 0 && selectionEnd === 0
      if (!isCaretAtTheBeginning) return
      select.setValue((values) => {
        if (!values.length) return values
        return values.slice(0, values.length - 1)
      })
      combobox.hide()
    }

    return (
      <Ariakit.Composite
        store={composite}
        role="grid"
        aria-label={label}
        className="tag-grid"
        onClick={() => comboboxRef.current?.focus()}
        render={
          <XStack
            // borderColor="$borderColor"
            // borderWidth={1}
            borderRadius="$2"
            padding="$1"
            backgroundColor="white"
          />
        }
      >
        <Ariakit.CompositeRow
          role="row"
          render={<XStack gap="$1" width="100%" flexWrap="wrap" />}
        >
          {selectedValues.map((value) => {
            let account = accountsMap[value]
            let alias =
              account && account?.profile?.alias ? account.profile.alias : value
            let avatar = account?.profile?.avatar
            return (
              // <AccountCard accountId={value} key={value}>
              <Ariakit.CompositeItem
                key={value}
                role="gridcell"
                onClick={onItemClick(value)}
                onKeyDown={onItemKeyDown}
                onFocus={combobox.hide}
                render={
                  <XStack
                    gap="$2"
                    padding="$1.5"
                    minHeight="2rem"
                    borderRadius="$1"
                    backgroundColor="$backgroundFocus"
                    borderColor="$borderColor"
                    alignItems="center"
                    hoverStyle={{
                      cursor: 'pointer',
                      backgroundColor: '$color7',
                    }}
                  />
                }
              >
                <Avatar
                  label={alias}
                  id={value}
                  url={avatar ? `${API_FILE_URL}/${avatar}` : undefined}
                />
                <SizableText size="$3">
                  {alias
                    ? alias
                    : value.length > 20
                    ? `${value?.slice(0, 5)}...${value?.slice(-5)}`
                    : value}
                </SizableText>
                {/* <span className="tag-remove"></span> */}
                <X size={12} />
              </Ariakit.CompositeItem>
              // </AccountCard>
            )
          })}
          <YStack role="gridcell" flex={1}>
            <Ariakit.CompositeItem
              id={comboboxId}
              render={
                <CompositeInput
                  ref={comboboxRef}
                  onKeyDown={onInputKeyDown}
                  render={
                    <Ariakit.Combobox
                      ref={ref}
                      store={combobox}
                      autoSelect
                      className="combobox"
                      {...comboboxProps}
                    />
                  }
                />
              }
            />
          </YStack>
          <Ariakit.ComboboxPopover
            store={combobox}
            portal
            sameWidth
            gutter={8}
            render={
              <Ariakit.SelectList
                store={select}
                render={
                  <YGroup
                    zIndex={100000}
                    backgroundColor="$background"
                    separator={<Separator />}
                  />
                }
              />
            }
          >
            {children}
          </Ariakit.ComboboxPopover>
        </Ariakit.CompositeRow>
      </Ariakit.Composite>
    )
  },
)

export interface TagInputItemProps extends Ariakit.SelectItemProps {
  children?: React.ReactNode
  account?: AccountListItem
}

export const TagInputItem = forwardRef<HTMLDivElement, TagInputItemProps>(
  function TagInputItem(props, ref) {
    let label = useMemo(() => {
      if (!props.account)
        return (
          `${props.value?.slice(0, 5)}...${props.value?.slice(-5)}` || 'account'
        )

      return (
        props.account.alias ||
        `${props.value?.slice(0, 5)}...${props.value?.slice(-5)}` ||
        'account'
      )
    }, [props.account, props.value])
    return (
      <Ariakit.SelectItem
        ref={ref}
        {...props}
        render={
          <Ariakit.ComboboxItem
            render={
              <TagInputItemContent
                className="combobox-item"
                render={props.render}
              />
            }
          />
        }
      >
        <XStack gap="$2" flex={1}>
          <Ariakit.SelectItemCheck />
          <Avatar
            label={props.account?.alias}
            id={props.value}
            url={
              props.account?.profile?.avatar
                ? `${API_FILE_URL}/${props.account?.profile?.avatar}`
                : undefined
            }
          />
          <XStack flex={1}>
            <SizableText size="$3" color="currentColor">
              {props.children || label}
            </SizableText>
          </XStack>
        </XStack>
      </Ariakit.SelectItem>
    )
  },
)

const TagInputItemContent = forwardRef<any, any>(
  function TagInputItemContent(props, ref) {
    let {render, children, ...restProps} = props

    return (
      <YGroup.Item>
        <ListItem ref={ref} {...restProps} className="combobox-item">
          {render ? render : children}
        </ListItem>
      </YGroup.Item>
    )
  },
)
