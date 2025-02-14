import {Avatar} from '@mintter/app/components/avatar'
import appError from '@mintter/app/errors'
import {useAccount} from '@mintter/app/models/accounts'
import {useNavigate} from '@mintter/app/utils/useNavigate'
import {Account} from '@mintter/shared'
import {Button, FontSizeTokens, Tooltip, YStack} from '@mintter/ui'
import {AlertCircle} from '@tamagui/lucide-icons'
import {getAvatarUrl} from '../utils/account-url'

export function ErrorDot() {
  return (
    <YStack
      backgroundColor={'#ff3333'}
      display="flex"
      position="absolute"
      top={-8}
      left={-8}
      padding={0}
      paddingLeft={-4}
      width={16}
      height={16}
      borderRadius={8}
    >
      <AlertCircle size={16} />
    </YStack>
  )
}

export function AccountLinkAvatar({
  accountId,
  size = 20,
}: {
  accountId?: string
  size?: FontSizeTokens | number
}) {
  const account = useAccount(accountId)
  if (!accountId) return null
  return (
    <BaseAccountLinkAvatar
      account={account.data}
      size={size}
      accountId={accountId}
      error={!!account.error}
    />
  )
}

export function BaseAccountLinkAvatar({
  account,
  accountId,
  size = 20,
  error,
}: {
  account: Account | undefined
  accountId: string
  size?: FontSizeTokens | number
  error?: boolean
}) {
  const navigate = useNavigate()
  let content = account?.profile ? (
    <Avatar
      size={size}
      label={account.profile.alias}
      id={account.id}
      url={getAvatarUrl(account.profile?.avatar)}
    />
  ) : (
    <>
      <Avatar size={size} label={'?'} id={accountId!} />
      {error ? <ErrorDot /> : null}
    </>
  )
  return (
    <Tooltip content={account?.profile?.alias || accountId || ''}>
      <Button
        id="avatar"
        className="no-window-drag"
        size="$1"
        backgroundColor="transparent"
        hoverStyle={{backgroundColor: 'transparent'}}
        minWidth={20}
        minHeight={20}
        padding={0}
        onPress={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!accountId) return appError('No account ready to load')
          navigate({key: 'account', accountId})
        }}
        position="relative"
        height={size}
      >
        {content}
      </Button>
    </Tooltip>
  )
}
