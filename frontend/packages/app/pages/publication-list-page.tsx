import {EmptyList} from '@mintter/app/components/empty-list'
import Footer from '@mintter/app/components/footer'
import {useDraftList} from '@mintter/app/models/documents'
import {useOpenDraft} from '@mintter/app/utils/open-draft'
import {
  Button,
  ButtonText,
  Container,
  Copy,
  Delete,
  DialogDescription,
  DialogTitle,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from '@mintter/ui'

import {createPublicWebHmUrl, idToUrl, unpackHmId} from '@mintter/shared'
import copyTextToClipboard from 'copy-text-to-clipboard'
import {memo} from 'react'
import {useAppContext} from '../app-context'
import {DeleteDocumentDialog} from '../components/delete-dialog'
import {useAppDialog} from '../components/dialog'
import {copyLinkMenuItem} from '../components/list-item'
import {MainWrapper} from '../components/main-wrapper'
import {PublicationListItem} from '../components/publication-list-item'
import {queryPublication, usePublicationFullList} from '../models/documents'
import {useWaitForPublication} from '../models/web-links'
import {toast} from '../toast'

export const PublicationListPage = memo(PublicationListPageUnmemo)

export function PublicationListPageUnmemo({
  trustedOnly,
  empty,
}: {
  trustedOnly: boolean
  empty?: React.ReactNode
}) {
  const publications = usePublicationFullList({trustedOnly})
  const drafts = useDraftList()
  const {queryClient, grpcClient} = useAppContext()
  const openDraft = useOpenDraft('push')
  const items = publications.data
  const deleteDialog = useAppDialog(DeleteDocumentDialog, {isAlert: true})
  if (items) {
    if (items.length) {
      return (
        <>
          <MainWrapper>
            <Container>
              {items.map((item) => {
                const {publication, author, editors} = item
                const docId = publication.document?.id
                if (!docId) return null
                return (
                  <PublicationListItem
                    key={docId}
                    pubContext={trustedOnly ? {key: 'trusted'} : null}
                    openRoute={{
                      key: 'publication',
                      documentId: docId,
                      pubContext: trustedOnly ? {key: 'trusted'} : null,
                    }}
                    hasDraft={drafts.data?.documents.find(
                      (d) => d.id == publication.document?.id,
                    )}
                    onPointerEnter={() => {
                      if (publication.document?.id) {
                        queryClient.client.prefetchQuery(
                          queryPublication(
                            grpcClient,
                            publication.document.id,
                            publication.version,
                          ),
                        )
                      }
                    }}
                    publication={publication}
                    author={author}
                    editors={editors}
                    menuItems={[
                      copyLinkMenuItem(
                        idToUrl(docId, undefined, publication.version),
                        'Publication',
                      ),
                      {
                        key: 'delete',
                        label: 'Delete Publication',
                        icon: Delete,
                        onPress: () => {
                          deleteDialog.open(docId)
                        },
                      },
                    ]}
                  />
                )
              })}
            </Container>
            {deleteDialog.content}
          </MainWrapper>
          <Footer />
        </>
      )
    } else {
      return (
        <>
          <MainWrapper>
            <Container>
              {empty || (
                <EmptyList
                  description="You have no Publications yet."
                  action={() => {
                    openDraft()
                  }}
                />
              )}
            </Container>
          </MainWrapper>
          <Footer />
        </>
      )
    }
  }

  if (publications.error) {
    return (
      <MainWrapper>
        <Container>
          <YStack gap="$3" alignItems="flex-start" maxWidth={500} padding="$8">
            <SizableText fontFamily="$body" fontWeight="700" fontSize="$6">
              Publication List Error
            </SizableText>
            <SizableText fontFamily="$body" fontSize="$4">
              {JSON.stringify(publications.error)}
            </SizableText>
            <Button theme="yellow" onPress={() => publications.refetch()}>
              try again
            </Button>
          </YStack>
        </Container>
      </MainWrapper>
    )
  }

  return (
    <>
      <MainWrapper>
        <Container>
          <Spinner />
        </Container>
      </MainWrapper>
      <Footer />
    </>
  )
}

function PublishedFirstDocDialog({
  input,
  onClose,
}: {
  input: {docId: string}
  onClose: () => void
}) {
  const {externalOpen} = useAppContext()
  const id = unpackHmId(input.docId)
  if (!id) throw new Error('invalid doc id')
  const url = createPublicWebHmUrl('d', id.eid)
  const {resultMeta, timedOut} = useWaitForPublication(url, 120)
  return (
    <>
      <DialogTitle>Congrats!</DialogTitle>
      <DialogDescription>
        Your doc has been published. You can share your doc on the public
        Hypermedia gateway:
      </DialogDescription>
      <XStack jc="space-between" ai="center">
        {resultMeta ? (
          <ButtonText
            color="$blue10"
            size="$2"
            fontFamily={'$mono'}
            fontSize="$4"
            onPress={() => {
              externalOpen(url)
            }}
          >
            {url}
          </ButtonText>
        ) : (
          <Spinner />
        )}
        {timedOut ? (
          <DialogDescription theme="red">
            We failed to publish your document to the hypermedia gateway. Please
            try again later.
          </DialogDescription>
        ) : null}
        <Button
          size="$2"
          icon={Copy}
          onPress={() => {
            copyTextToClipboard(url)
            toast.success('Copied link to document')
          }}
        />
      </XStack>
      <Button onPress={onClose}>Done</Button>
    </>
  )
}

export default function TrustedPublicationList() {
  const successDialog = useAppDialog(PublishedFirstDocDialog)

  return (
    <>
      <PublicationListPage trustedOnly={true} />
      {successDialog.content}
    </>
  )
}
