import {
  GRPCClient,
  Group,
  ListDocumentGroupsResponse,
  ListGroupsResponse,
  Role,
  UnpackedHypermediaId,
  createHmId,
  unpackDocId,
  unpackHmId,
} from '@mintter/shared'
import {ListDocumentGroupsResponse_Item} from '@mintter/shared/src/client/.generated/groups/v1alpha/groups_pb'
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQueries,
  useQuery,
} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useGRPCClient, useQueryInvalidator} from '../app-context'
import appError from '../errors'
import {useAllAccounts, useMyAccount} from './accounts'
import {queryPublication, sortDocuments} from './documents'

import {queryKeys} from './query-keys'

export function useGroups(opts?: UseQueryOptions<ListGroupsResponse>) {
  const grpcClient = useGRPCClient()
  const groupsQuery = useQuery({
    ...opts,
    queryKey: [queryKeys.GET_GROUPS],
    queryFn: async () => {
      return await grpcClient.groups.listGroups({})
    },
  })

  return useMemo(() => {
    return {
      ...groupsQuery,
      data: {
        ...groupsQuery.data,
        groups:
          groupsQuery.data?.groups?.sort((a, b) =>
            sortDocuments(a.updateTime, b.updateTime),
          ) || [],
      },
    }
  }, [groupsQuery])
}

function createGroupQuery(
  grpcClient: GRPCClient,
  groupId: string | undefined,
  version: string | undefined,
) {
  return {
    queryKey: [queryKeys.GET_GROUP, groupId, version],
    queryFn: async () => {
      const group = await grpcClient.groups.getGroup({id: groupId, version})
      return group
    },
  }
}

/**
 *
 * @param groupId
 * @param version
 * @param opts
 * @returns only the group metadata and the list of members
 */
export function useGroup(
  groupId: string | undefined,
  version?: string | undefined,
  opts?: UseQueryOptions<Group>,
) {
  const grpcClient = useGRPCClient()
  return useQuery({
    ...createGroupQuery(grpcClient, groupId, version),
    enabled: !!groupId,
    ...opts,
  })
}

export function useSelectedGroups(groupIds: string[]) {
  const grpcClient = useGRPCClient()
  return useQueries({
    queries: groupIds.map((groupId) =>
      createGroupQuery(grpcClient, groupId, undefined),
    ),
  })
}

export function useCreateGroup(
  opts?: UseMutationOptions<
    string,
    unknown,
    {
      description?: string | undefined
      title: string
      members?: string[]
      content?: Record<string, string>
    }
  >,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      description,
      title,
      members,
      content,
    }: {
      description?: string | undefined
      title: string
      members?: string[]
      content?: Record<string, string>
    }) => {
      try {
        const group = await grpcClient.groups.createGroup({
          description,
          title,
        })
        if (content || members) {
          await grpcClient.groups.updateGroup({
            id: group.id,
            updatedContent: content,
            updatedMembers: members
              ? Object.fromEntries(members.map((m) => [m, Role.EDITOR]))
              : undefined,
          })
        }
        return group.id
      } catch (error) {
        appError(`Error: createGroup: ${error?.message}`, {error})
        return error
      }
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUPS])
    },
  })
}

type UpdateGroupMutationInput = {
  id: string
  title: string
  description: string
}

export function useUpdateGroup(
  opts?: UseMutationOptions<void, unknown, UpdateGroupMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({description, title, id}: UpdateGroupMutationInput) => {
      await grpcClient.groups.updateGroup({id, description, title})
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUPS])
      invalidate([queryKeys.GET_GROUP, input.id])
      invalidate([queryKeys.GET_GROUPS_FOR_ACCOUNT])
    },
  })
}

type PublishGroupToSiteMutationInput = {groupId: string; setupUrl: string}

export function usePublishGroupToSite(
  opts?: UseMutationOptions<void, unknown, PublishGroupToSiteMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      groupId,
      setupUrl,
    }: PublishGroupToSiteMutationInput) => {
      await grpcClient.groups.updateGroup({
        siteSetupUrl: setupUrl,
        id: groupId,
      })
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUPS])
      invalidate([queryKeys.GET_GROUP, input.groupId])
    },
  })
}

type PublishDocToGroupMutationInput = {
  groupId: string
  docId: string
  version: string
  pathName: string
}
export function usePublishDocToGroup(
  opts?: UseMutationOptions<boolean, unknown, PublishDocToGroupMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      groupId,
      pathName,
      docId,
      version,
    }: PublishDocToGroupMutationInput): Promise<boolean> => {
      try {
        await grpcClient.groups.updateGroup({
          id: groupId,
          updatedContent: {
            [pathName]: `${docId}?v=${version}`,
          },
        })
      } catch (e) {
        if (e.message.match('nothing to update')) {
          // the group seems to already have this exact version at this path
          return false
        }
        throw e
      }
      return true
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUP_CONTENT, input.groupId])
      invalidate([queryKeys.ENTITY_TIMELINE, input.groupId])
      invalidate([queryKeys.GET_GROUPS_FOR_DOCUMENT, input.docId])
    },
  })
}

type RemoveDocFromGroupMutationInput = {
  groupId: string
  pathName: string
}

export function useRemoveDocFromGroup(
  opts?: UseMutationOptions<void, unknown, RemoveDocFromGroupMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      groupId,
      pathName,
    }: RemoveDocFromGroupMutationInput) => {
      await grpcClient.groups.updateGroup({
        id: groupId,
        updatedContent: {[pathName]: ''},
      })
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUP_CONTENT, input.groupId])
      invalidate([queryKeys.ENTITY_TIMELINE, input.groupId])
      invalidate([queryKeys.GET_GROUPS_FOR_DOCUMENT])
    },
  })
}

type RenameGroupDocMutationInput = {
  groupId: string
  pathName: string
  newPathName: string
}

export function useRenameGroupDoc(
  opts?: UseMutationOptions<string, unknown, RenameGroupDocMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      groupId,
      pathName,
      newPathName,
    }: RenameGroupDocMutationInput) => {
      const listed = await grpcClient.groups.listContent({
        id: groupId,
      })
      const prevPathValue = listed.content[pathName]
      if (!prevPathValue)
        throw new Error('Could not find previous path at ' + pathName)
      await grpcClient.groups.updateGroup({
        id: groupId,
        updatedContent: {[pathName]: '', [newPathName]: prevPathValue},
      })
      return prevPathValue
    },
    onSuccess: (result, input, context) => {
      const docId = unpackDocId(result)
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUP_CONTENT, input.groupId])
      invalidate([queryKeys.GET_GROUPS_FOR_DOCUMENT, docId?.docId])
    },
  })
}

function getGroupContentQuery(
  grpcClient: GRPCClient,
  groupId?: string | undefined,
  version?: string | undefined,
) {
  return {
    queryKey: [queryKeys.GET_GROUP_CONTENT, groupId, version],
    queryFn: async () => {
      return await grpcClient.groups.listContent({id: groupId, version})
    },
    enabled: !!groupId,
  }
}

export function useCanEditGroup(groupId: string | undefined) {
  const myAccount = useMyAccount()
  const groups = useAccountGroups(myAccount.data?.id)
  if (!groupId) return false
  return !!groups.data?.items?.find(
    (item) => !!item.group?.id && item.group.id === groupId,
  )
}

/**
 *
 * @param groupId
 * @param version
 * @returns the list of content for a particular group
 */
export function useGroupContent(
  groupId?: string | undefined,
  version?: string,
) {
  const grpcClient = useGRPCClient()
  return useQuery(getGroupContentQuery(grpcClient, groupId, version))
}

/**
 *
 * @param groupIds
 * @returns returns all the content for a list of groupIds
 */
export function useGroupsContent(groupIds: string[]) {
  const grpcClient = useGRPCClient()
  return useQueries({
    queries: groupIds.map((groupId) =>
      getGroupContentQuery(grpcClient, groupId),
    ),
  })
}
/**
 *
 * @param groupId
 * @param version
 * @returns returns everything from `useGroupContent` and all the publication's data
 */
export function useFullGroupContent(
  groupId?: string | undefined,
  version?: string,
) {
  const groupContent = useGroupContent(groupId, version)
  const grpcClient = useGRPCClient()
  const contentEntries: (readonly [string, UnpackedHypermediaId])[] = []
  Object.entries(groupContent.data?.content || {}).forEach(
    ([pathName, fullContentId]) => {
      const id = unpackHmId(fullContentId)
      if (id) {
        contentEntries.push([pathName, id])
      }
    },
  )
  const contentQueries = useQueries({
    queries: contentEntries.map(([contentKey, contentId]) => {
      const docId = createHmId('d', contentId.eid)
      return queryPublication(
        grpcClient,
        docId,
        contentId.version || undefined,
        false,
      )
    }),
  })
  const accounts = useAllAccounts()
  function lookupAccount(accountId: string | undefined) {
    return (
      (accountId &&
        accounts.data?.accounts.find((acc) => acc.id === accountId)) ||
      accountId
    )
  }
  return {
    ...groupContent,
    data: {
      items: contentEntries
        .map(([contentKey, contentId], i) => {
          const pub = contentQueries.find((pubQuery) => {
            return (
              pubQuery.data?.document?.id === contentId.qid &&
              pubQuery.data?.version === contentId.version
            )
          })
          return {
            key: contentKey,
            pub: pub?.data,
            author: lookupAccount(pub?.data?.document?.author),
            editors: pub?.data?.document?.editors?.map(lookupAccount) || [],
            id: contentId,
          }
        })
        .sort((a, b) => {
          const timeA = a.pub?.document?.updateTime?.seconds || 0n
          const timeB = b.pub?.document?.updateTime?.seconds || 0n
          return Number(timeB - timeA)
        }),
      content: groupContent.data?.content,
    },
  }
}

export function useInvertedGroupContent(
  groupId?: string | undefined,
  version?: string,
) {
  const groupContent = useGroupContent(groupId, version)
  const data = useMemo(() => {
    const groupPathsByDocIdVersion: Record<string, Record<string, string>> = {}
    Object.entries(groupContent?.data?.content || {}).map(
      ([pathName, fullContentId]) => {
        if (!fullContentId) return
        const unpackedId = unpackHmId(fullContentId)
        if (unpackedId && unpackedId.version) {
          const versions =
            groupPathsByDocIdVersion[unpackedId.eid] ||
            (groupPathsByDocIdVersion[unpackedId.eid] = {})
          versions[unpackedId.version] = pathName
        }
      },
    )
    return groupPathsByDocIdVersion
  }, [groupContent.data])
  return {...groupContent, data}
}

export function useGroupMembers(groupId: string, version?: string | undefined) {
  const grpcClient = useGRPCClient()
  return useQuery({
    queryKey: [queryKeys.GET_GROUP_MEMBERS, groupId, version],
    queryFn: async () => {
      return await grpcClient.groups.listMembers({id: groupId, version})
    },
  })
}

export function useDocumentGroups(
  documentId?: string,
  opts?: UseQueryOptions<unknown, unknown, ListDocumentGroupsResponse_Item[]>,
) {
  const grpcClient = useGRPCClient()
  return useQuery({
    ...opts,
    enabled: !!documentId && opts?.enabled !== false,
    queryKey: [queryKeys.GET_GROUPS_FOR_DOCUMENT, documentId],
    queryFn: async () => {
      const result = await grpcClient.groups.listDocumentGroups({
        documentId,
      })
      const resultMap = new Map<
        string,
        ListDocumentGroupsResponse['items'][number]
      >()
      for (const item of result.items) {
        const itemKey = `${item.groupId}-${item.path}`
        if (item.changeTime?.seconds === undefined) continue
        if (resultMap.has(itemKey)) {
          const prevItem = resultMap.get(itemKey)
          if (!prevItem?.changeTime?.seconds) continue
          if (prevItem?.changeTime?.seconds > item.changeTime?.seconds) continue
        }
        resultMap.set(itemKey, item)
      }
      const output = Array.from(resultMap.values())
      return output
    },
  })
}

export function useCurrentDocumentGroups(
  documentId?: string,
  opts?: UseQueryOptions<unknown, unknown, ListDocumentGroupsResponse_Item[]>,
) {
  const docGroupsQuery = useDocumentGroups(documentId, opts)
  const referencedGroupIds = new Set<string>()
  docGroupsQuery.data?.forEach((item) => {
    referencedGroupIds.add(item.groupId)
  })
  const groupsToQuery = [...referencedGroupIds]
  const groupsContentQuery = useGroupsContent(groupsToQuery)
  return {
    ...docGroupsQuery,
    data: docGroupsQuery.data?.filter((item) => {
      const {groupId, path} = item
      const groupContent = groupsContentQuery.find((contentQuery, index) => {
        const queriedGroupId = groupsToQuery[index]
        return groupId === queriedGroupId
      })?.data
      const pathURL = groupContent?.content?.[path]
      if (!pathURL) return false
      const currentPathDocId = unpackDocId(pathURL)
      if (!currentPathDocId?.docId) return false
      return currentPathDocId.docId === documentId
    }),
  }
}

export function useAccountGroups(accountId?: string) {
  const grpcClient = useGRPCClient()
  return useQuery({
    enabled: !!accountId,
    queryKey: [queryKeys.GET_GROUPS_FOR_ACCOUNT, accountId],
    queryFn: () => {
      return grpcClient.groups.listAccountGroups({
        accountId,
      })
    },
  })
}
export function useMyGroups() {
  const account = useMyAccount()
  const groups = useAccountGroups(account.data?.id)
  return groups
}

export function useHostGroup(hostname: string) {
  const grpcClient = useGRPCClient()
  return useQuery({
    queryKey: [queryKeys.GET_HOST_GROUP, hostname],
    queryFn: async () => {
      // return await grpcClient.groups.({
      //   hostname,
      // })
    },
  })
}

type AddGroupMemberMutationInput = {
  groupId: string
  members: Array<string>
}

export function useAddGroupMember(
  opts?: UseMutationOptions<void, unknown, AddGroupMemberMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({groupId, members}: AddGroupMemberMutationInput) => {
      let updatedMembers = {}
      members.forEach((id) => (updatedMembers[id] = Role.EDITOR))

      await grpcClient.groups.updateGroup({
        id: groupId,
        updatedMembers,
      })
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUP_MEMBERS, input.groupId])
    },
  })
}

type RemoveGroupMemberMutationInput = {
  groupId: string
  newMemberAccount: string
}

export function useRemoveGroupMember(
  opts?: UseMutationOptions<void, unknown, RemoveGroupMemberMutationInput>,
) {
  const grpcClient = useGRPCClient()
  const invalidate = useQueryInvalidator()
  return useMutation({
    mutationFn: async ({
      groupId,
      newMemberAccount,
    }: RemoveGroupMemberMutationInput) => {
      await grpcClient.groups.updateGroup({
        id: groupId,
        updatedMembers: {[newMemberAccount]: Role.ROLE_UNSPECIFIED},
      })
    },
    onSuccess: (result, input, context) => {
      opts?.onSuccess?.(result, input, context)
      invalidate([queryKeys.GET_GROUP_MEMBERS, input.groupId])
    },
  })
}
