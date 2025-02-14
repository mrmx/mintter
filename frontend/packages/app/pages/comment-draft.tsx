import {HMEditorContainer, HyperMediaEditorView} from '@mintter/editor'
import {StateStream, unpackHmId} from '@mintter/shared'
import {Button, ChevronUp, SizableText, YStack, useStream} from '@mintter/ui'
import {useEffect} from 'react'
import {XStack} from 'tamagui'
import {
  CommentPageTitlebarWithDocId,
  CommentPresentation,
  CommentThread,
} from '../components/comments'
import {useDeleteCommentDraftDialog} from '../components/delete-comment-draft-dialog'
import {MainWrapperStandalone} from '../components/main-wrapper'
import {useComment, useCommentEditor} from '../models/comments'
import {useNavRoute} from '../utils/navigation'
import {useNavigate} from '../utils/useNavigate'
import {AppPublicationContentProvider} from './publication-content-provider'

function CommitBar({
  onSubmit,
  onDiscard,
  isSaved,
  targetCommentId,
}: {
  onSubmit: () => void
  onDiscard: () => void
  isSaved: StateStream<boolean>
  targetCommentId: StateStream<string | null>
}) {
  const _isSaved = useStream(isSaved)
  const _targetCommentId = useStream(targetCommentId)
  return (
    <XStack
      ai="center"
      padding="$4"
      paddingHorizontal="$5"
      theme="blue"
      jc="space-between"
      borderTopWidth={1}
      borderColor="$borderColor"
    >
      <Button size="$2" onPress={onDiscard}>
        Discard Draft
      </Button>
      <Button
        className="no-window-drag"
        disabled={!_isSaved}
        onPress={onSubmit}
        size="$2"
        theme="green"
      >
        {_targetCommentId ? 'Submit Reply' : 'Submit Comment'}
      </Button>
    </XStack>
  )
}

function TargetComment({
  targetCommentId,
  onReplyBlock,
}: {
  targetCommentId: StateStream<string | null>
  onReplyBlock: (commentId: string, blockId: string) => void
}) {
  const route = useNavRoute()
  if (route.key !== 'comment-draft')
    throw new Error('Invalid route for CommentDraftPage')
  const replace = useNavigate('replace')
  const _targetCommentId = useStream(targetCommentId)
  const comment = useComment(_targetCommentId)
  if (!_targetCommentId) return null
  const targetDocId = comment.data?.target
    ? unpackHmId(comment.data?.target)
    : null
  if (!targetDocId) return null
  return (
    <YStack
      borderBottomWidth={1}
      borderColor="$borderColor"
      marginHorizontal={14}
    >
      <SizableText size="$2" color="$color8" margin="$2" marginHorizontal="$4">
        Replying to:
      </SizableText>
      {route.showThread && comment.data?.repliedComment ? (
        <CommentThread
          targetCommentId={comment.data?.repliedComment}
          targetDocEid={targetDocId.eid}
          onReplyBlock={onReplyBlock}
        />
      ) : comment.data?.repliedComment ? (
        <XStack jc="center">
          <Button
            onPress={() => {
              replace({...route, showThread: true})
            }}
            icon={ChevronUp}
            chromeless
            size="$1"
            marginHorizontal="$4"
          >
            Show Thread
          </Button>
        </XStack>
      ) : null}
      {comment.data && (
        <CommentPresentation
          comment={comment.data}
          onReplyBlock={(blockId) => onReplyBlock(_targetCommentId, blockId)}
        />
      )}
    </YStack>
  )
}

export default function CommentDraftPage() {
  const route = useNavRoute()
  if (route.key !== 'comment-draft')
    throw new Error('Invalid route for CommentDraftPage')

  const {
    editor,
    onSubmit,
    onDiscard,
    isSaved,
    targetCommentId,
    targetDocId,
    addReplyEmbed,
  } = useCommentEditor({
    onDiscard: () => {
      window.close()
    },
  })
  useEffect(() => {
    editor._tiptapEditor.commands.focus()
  }, [])
  const discardComment = useDeleteCommentDraftDialog()
  return (
    <>
      <CommentPageTitlebarWithDocId targetDocIdStream={targetDocId} />
      <MainWrapperStandalone>
        <YStack minHeight={'100vh'}>
          <TargetComment
            targetCommentId={targetCommentId}
            onReplyBlock={addReplyEmbed}
          />
          <YStack
            f={1}
            onPress={() => {
              editor._tiptapEditor.commands.focus()
            }}
          >
            <AppPublicationContentProvider disableEmbedClick>
              <HMEditorContainer>
                <HyperMediaEditorView editor={editor} editable />
              </HMEditorContainer>
            </AppPublicationContentProvider>
          </YStack>
        </YStack>
      </MainWrapperStandalone>
      <CommitBar
        isSaved={isSaved}
        onSubmit={onSubmit}
        onDiscard={() => discardComment.open({onConfirm: onDiscard})}
        targetCommentId={targetCommentId}
      />
      {discardComment.content}
    </>
  )
}
