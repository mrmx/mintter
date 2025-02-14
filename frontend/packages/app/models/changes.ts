import {
  BlockNode,
  Change,
  ChangeInfo,
  Document,
  GRPCClient,
  WebPublicationRecord,
} from '@mintter/shared'
import {useQueries, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useGRPCClient} from '../app-context'
import {useDocumentVersions, usePublicationList} from './documents'
import {queryKeys} from './query-keys'

function createDocChangesQuery(
  grpcClient: GRPCClient,
  docId: string | undefined,
) {
  return {
    queryFn: () =>
      grpcClient.changes.listChanges({
        documentId: docId,
      }),
    queryKey: [queryKeys.PUBLICATION_CHANGES, docId],
    enabled: !!docId,
  } as const
}

export function useDocChanges(docId?: string) {
  const grpcClient = useGRPCClient()
  return useQuery(createDocChangesQuery(grpcClient, docId))
}

export function useDocHistory(docId?: string, variantVersion?: string) {
  const {data} = useEntityTimeline(docId)
  const changes = useMemo(() => {
    const allVariantChanges = new Set<string>()
    const variantVersionChanges: TimelineChange[] = []
    variantVersion
      ?.split('.')
      .map((chId) => data?.allChanges[chId])
      .forEach((ch) => {
        if (!ch) return
        variantVersionChanges.push(ch)
        allVariantChanges.add(ch.id)
      })
    let walkLeafVersions = variantVersionChanges
    while (walkLeafVersions?.length) {
      const nextLeafVersions: TimelineChange[] = []
      for (const change of walkLeafVersions) {
        change?.change.deps?.map((depChangeId) => {
          allVariantChanges.add(depChangeId)
          const depChange = data?.allChanges[depChangeId]
          if (depChange) {
            nextLeafVersions.push(depChange)
          }
        })
      }
      walkLeafVersions = nextLeafVersions
    }
    return [...allVariantChanges]
      .map((changeId) => data?.allChanges[changeId])
      .filter(Boolean)
      .sort((a, b) => {
        let dateA = a?.change.createTime ? a.change.createTime.toDate() : 0
        let dateB = b?.change.createTime ? b.change.createTime.toDate() : 1
        // @ts-ignore
        return dateB - dateA
      })
  }, [data, variantVersion])
  return changes
}

export type SmartChangeInfo = ChangeInfo & {
  webPubs: WebPublicationRecord[]
  summary: string[]
}

// utility to get revisions of all blocks in a document snapshot
function extractBlocksWithRevisions(
  blocks?: BlockNode[],
): Record<string, {revision: string; block: BlockNode}> {
  const output: Record<string, {revision: string; block: BlockNode}> = {}
  blocks?.forEach((block) => {
    const {id, revision} = block.block || {}
    if (id && revision) {
      output[id] = {revision, block}
    }
    if (block.children) {
      Object.assign(output, extractBlocksWithRevisions(block.children))
    }
  })
  return output
}

export type TimelineChange = {
  change: Change
  deps: string[]
  citations: string[]
  id: string
}

export function useEntityTimeline(entityId?: string) {
  const grpcClient = useGRPCClient()
  return useQuery({
    queryFn: async () => {
      const rawTimeline = await grpcClient.entities.getEntityTimeline({
        id: entityId || '',
      })
      const timelineEntries = Object.entries(rawTimeline.changes)
      const allChanges: Record<string, TimelineChange> = {}
      timelineEntries.forEach(([changeId, change]) => {
        allChanges[changeId] = {
          deps: change.deps,
          citations: [],
          change: change,
          id: change.id,
        }
      })
      timelineEntries.forEach(([changeId, change]) => {
        change.deps.forEach((depId) => {
          allChanges[depId]?.citations.push(changeId)
        })
      })
      return {
        allChanges,
        authorVersions: rawTimeline.authorVersions,
        timelineEntries,
      }
    },
    queryKey: [queryKeys.ENTITY_TIMELINE, entityId],
    enabled: !!entityId,
  })
}

// when we summarize block actions, we need a quick text representation, skipping all annotations and other block types
export function getTextOfBlock(block: BlockNode): string {
  let output = ''
  if (block.block?.text) {
    output += block.block.text
  }
  if (block.children) {
    output += block.children.map(getTextOfBlock)
  }
  return output
}

// this hook uses aggressive data loading to determine what changed for each change, and prepare that for rendering
// this involves loading every version of the doc, and using block revisions to see what changed
export function useSmartChanges(docId?: string, version?: string) {
  const docChanges = useDocChanges(docId)
  // const loadedDocs = useQueries()
  const changes = docChanges.data?.changes
  const versionPublications = useDocumentVersions(
    docId,
    changes?.map((change) => change.version) || [],
  )
  const versionPubData = versionPublications.map((pub) => pub.data)
  return {
    versionPublications,
    ...docChanges,
    data: useMemo(() => {
      // two index of document states
      const docsAtVersions: Record<string, Document> = {}
      const docsAtChanges: Record<string, Document> = {}

      versionPubData.map((pub, pubQueryIndex) => {
        const change = changes?.[pubQueryIndex]
        const doc = pub?.document
        if (doc && change) {
          docsAtVersions[change.version] = doc
          docsAtChanges[change.id] = doc
        }
      })

      const sortedChanges = [...(docChanges.data?.changes || [])]
        .sort((a, b) => Number(a?.createTime) - Number(b?.createTime))
        .reverse() // newest on top

      return {
        changes: sortedChanges.map((change) => {
          // now computing what happened in this change.
          // FOR NOW, we ignore block moving because it's too complicated.

          const thisVersionDoc = docsAtVersions[change.version]
          const thisVersionBlocks = extractBlocksWithRevisions(
            thisVersionDoc?.children,
          )
          // each change may have MULTIPLE changes upstream, which is why this gets tricky
          const depDocs = change.deps.map((dep) => docsAtChanges[dep])
          // extract the block state for each upstream version
          const depsBlocks = depDocs.map((depDoc) => {
            return extractBlocksWithRevisions(depDoc?.children)
          })

          const summary: string[] = []
          if (depDocs.length > 1) {
            summary.push('Merged Versions')
          }
          // if (
          //   depDocs.find(
          //     (depDoc) => depDoc?.publisher !== thisVersionDoc?.publisher,
          //   )
          // ) {
          //   summary.push('Edited Publisher')
          // }
          const summarizedBlockIds: Record<string, true> = {}
          depsBlocks.forEach((prevBlocks) => {
            Object.entries(prevBlocks).forEach(
              ([blockId, {block, revision}]) => {
                if (summarizedBlockIds[blockId]) return
                if (prevBlocks[blockId] && !thisVersionBlocks[blockId]) {
                  summary.push(`Deleted Block ${blockId}`)
                  summarizedBlockIds[blockId] = true
                } else if (
                  thisVersionBlocks[blockId]?.revision !==
                  prevBlocks[blockId]?.revision
                ) {
                  summary.push(
                    `Edited Block ${blockId} ${
                      getTextOfBlock(block) || block.block?.id
                    }`,
                  )
                  summarizedBlockIds[blockId] = true
                } else {
                  // block is unchanged because revision matches. mark it as summarized so we don't think it is added later
                  summarizedBlockIds[blockId] = true
                }
              },
            )
          })
          Object.entries(thisVersionBlocks).forEach(
            ([blockId, {revision, block}]) => {
              if (!summarizedBlockIds[blockId]) {
                summary.push(
                  `Added Block ${blockId} ${
                    getTextOfBlock(block) || block.block?.id
                  }`,
                )
                summarizedBlockIds[blockId] = true
              }
            },
          )
          return {
            ...change,
            summary,
          } as SmartChangeInfo
        }),
        rawChanges: changes,
      } as const
    }, [changes, ...versionPubData]),
  }
}

export function useChange(changeId?: string) {
  const grpcClient = useGRPCClient()
  return useQuery({
    queryFn: () =>
      grpcClient.entities.getChange({
        id: changeId || '',
      }),
    queryKey: [queryKeys.CHANGE, changeId],
    enabled: !!changeId,
  })
}

export function useAllPublicationChanges() {
  const allPublications = usePublicationList({trustedOnly: false})
  const pubs = allPublications?.data?.publications || []
  const grpcClient = useGRPCClient()
  const queries = pubs.map((pub) => {
    return createDocChangesQuery(grpcClient, pub.document?.id)
  })
  const resultQueries = useQueries({
    queries,
  })
  return {
    isLoading:
      allPublications.isLoading || resultQueries.some((q) => q.isLoading),
    error: allPublications.error || resultQueries.find((q) => q.error)?.error,
    data: pubs.map((pub, pubIndex) => ({
      publication: pub,
      changes: resultQueries[pubIndex]?.data?.changes,
    })),
  }
}
