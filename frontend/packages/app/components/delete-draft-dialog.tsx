import {useDeleteDraft} from '@mintter/app/models/documents'
import {AlertDialog, Button, XStack, YStack} from '@mintter/ui'
import {useAppDialog} from './dialog'

export function useDeleteDraftDialog() {
  return useAppDialog(DeleteDraftDialog, {isAlert: true})
}

function DeleteDraftDialog({
  onClose,
  input,
}: {
  onClose: () => void
  input: {draftId: string; onSuccess?: () => void}
}) {
  const deleteDraft = useDeleteDraft({
    onSuccess: input.onSuccess,
  })
  return (
    <YStack space backgroundColor="$background" padding="$4" borderRadius="$3">
      <AlertDialog.Title>Discard Draft</AlertDialog.Title>
      <AlertDialog.Description>
        Permanently delete this draft document?
      </AlertDialog.Description>

      <XStack space="$3" justifyContent="flex-end">
        <AlertDialog.Cancel asChild>
          <Button
            onPress={() => {
              onClose()
            }}
            chromeless
          >
            Cancel
          </Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action asChild>
          <Button
            theme="red"
            onPress={() => {
              deleteDraft.mutate(input.draftId)
              onClose()
            }}
          >
            Delete
          </Button>
        </AlertDialog.Action>
      </XStack>
    </YStack>
  )
}
