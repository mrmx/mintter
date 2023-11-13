import {updateElectronApp} from 'update-electron-app'
import log from 'electron-log/main'

export function setupUpdates() {
  // We delay this work by 1s to ensure that the
  // app doesn't have to worry about updating during launch
  setTimeout(() => {
    updateElectronApp({
      repo: 'MintterHypermedia/mintter',
      updateInterval: '1 hour',
      logger: log,
    })
  }, 1000)
}
