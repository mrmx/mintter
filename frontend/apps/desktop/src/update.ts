import updateApp from 'update-electron-app'

export function setupUpdates() {
  // We delay this work by 1s to ensure that the
  // app doesn't have to worry about updating during launch
  setTimeout(() => {
    updateApp({
      repo: 'MintterHypermedia/mintter',
      updateInterval: '1 hour',
    })
  }, 1000)
}
