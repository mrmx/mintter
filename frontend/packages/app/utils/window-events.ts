import {useEffect} from 'react'
import {useIPC} from '../app-context'

export type AppWindowSimpleEvent =
  | 'back'
  | 'forward'
  | 'triggerPeerSync'
  | 'openQuickSwitcher'
  | 'checkForUpdates'

export type AppWindowEvent =
  | AppWindowSimpleEvent
  | {key: 'connectPeer'; peer: string}

export function useListenAppEvent(
  eventKey: AppWindowSimpleEvent,
  handlerFn: () => void,
) {
  useEffect(() => {
    // @ts-expect-error
    return window.appWindowEvents?.subscribe((event: AppWindowEvent) => {
      if (event === eventKey) handlerFn()
    })
  })
}

export function useTriggerWindowEvent() {
  const ipc = useIPC()
  return (event: AppWindowEvent) => {
    ipc.send('focusedWindowAppEvent', event)
  }
}
