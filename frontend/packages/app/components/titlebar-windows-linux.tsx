import {TitleBarProps} from '@mintter/app/components/titlebar'
import {
  TitlebarRow,
  TitlebarSection,
  TitlebarWrapper,
  XStack,
} from '@mintter/ui'
import {
  NavMenuButton,
  NavigationButtons,
  PageActionButtons,
  PageContextControl,
} from './titlebar-common'
import {Title} from './titlebar-title'
import './titlebar-windows-linux.css'
import {CloseButton, WindowsLinuxWindowControls} from './window-controls'
import {SystemMenu} from './windows-linux-titlebar'

export default function TitleBarWindows(props: TitleBarProps) {
  if (props.clean) {
    return (
      <TitlebarWrapper style={{flex: 'none'}} className="window-drag">
        <TitlebarRow>
          <TitlebarSection
            flex={1}
            alignItems="center"
            justifyContent="flex-end"
          >
            <XStack className="no-window-drag">
              <CloseButton />
            </XStack>
          </TitlebarSection>
        </TitlebarRow>
      </TitlebarWrapper>
    )
  }

  return (
    <WindowsLinuxTitleBar
      right={<PageActionButtons {...props} />}
      left={
        <XStack paddingHorizontal={0} paddingVertical="$2" space="$2">
          <NavMenuButton />
          <NavigationButtons />
          <PageContextControl {...props} />
        </XStack>
      }
      title={<Title />}
    />
  )
}

export function WindowsLinuxTitleBar({
  left,
  title,
  right,
}: {
  title: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <TitlebarWrapper className="window-drag" style={{flex: 'none'}}>
      <TitlebarRow minHeight={28} backgroundColor="$color3">
        <TitlebarSection>
          <SystemMenu />
        </TitlebarSection>
        <XStack flex={1} />
        <TitlebarSection space>
          <WindowsLinuxWindowControls />
        </TitlebarSection>
      </TitlebarRow>
      <TitlebarRow>
        <XStack
          flex={1}
          minWidth={'min-content'}
          flexBasis={0}
          alignItems="center"
          className="window-drag"
        >
          {left}
        </XStack>
        <XStack
          f={1}
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
          height="100%"
          ai="center"
          jc="center"
        >
          {title}
        </XStack>
        <XStack
          flex={1}
          justifyContent="flex-end"
          minWidth={'min-content'}
          flexBasis={0}
          className="window-drag"
          alignItems="center"
        >
          {right}
        </XStack>
      </TitlebarRow>
    </TitlebarWrapper>
  )
}
