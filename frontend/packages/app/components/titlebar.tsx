import {AppPlatform, useAppContext} from '@mintter/app/app-context'
import {TitlebarWrapper} from '@mintter/ui'
import {Suspense, lazy} from 'react'

var TitleBarMacos = lazy(() => import('./titlebar-macos'))
var TitleBarWindowsLinux = lazy(() => import('./titlebar-windows-linux'))

export interface TitleBarProps {
  clean?: boolean
}

export function TitleBar(props: TitleBarProps) {
  const {platform} = useAppContext()
  let Component = getTitleBar(platform)
  return (
    <Suspense fallback={<TitlebarWrapper style={{flex: 'none'}} />}>
      <Component {...props} />
    </Suspense>
  )
}

function getTitleBar(platform: AppPlatform) {
  // return TitleBarWindowsLinux // to test from macOS
  switch (platform) {
    case 'win32':
    case 'linux':
      return TitleBarWindowsLinux
    case 'darwin':
      return TitleBarMacos
    default:
      console.warn(`Titlebar: unsupported platform: ${platform}`)
      return TitleBarMacos
  }
}
