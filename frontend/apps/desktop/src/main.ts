import * as Sentry from '@sentry/electron/main'
import {
  BrowserWindow,
  Menu,
  app,
  ipcMain,
  nativeTheme,
  shell,
  autoUpdater,
  dialog,
  MessageBoxOptions,
} from 'electron'
import log from 'electron-log/main'
import squirrelStartup from 'electron-squirrel-startup'
import path from 'node:path'
import {
  handleSecondInstance,
  handleUrlOpen,
  openInitialWindows,
  trpc,
} from './app-api'
import {initPaths} from './app-paths'
import {startMainDaemon} from './daemon'
import {saveCidAsFile} from './save-cid-as-file'
import {IS_PROD_DESKTOP, MINTTER_SENTRY_DESKTOP_DSN} from '@mintter/shared'
import {createAppMenu} from './app-menu'

const OS_REGISTER_SCHEME = 'hm'

if (IS_PROD_DESKTOP) {
  if (squirrelStartup) {
    app.quit()
  }

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(OS_REGISTER_SCHEME, process.execPath, [
        path.resolve(process.argv[1]!),
      ])
    }
  } else {
    app.setAsDefaultProtocolClient(OS_REGISTER_SCHEME)
  }
}

initPaths()

const mainDaemon = startMainDaemon()

Menu.setApplicationMenu(createAppMenu())

autoUpdate()

//Simple logging module Electron/Node.js/NW.js application. No dependencies. No complicated configuration.
log.initialize({
  preload: true,
  // It makes a renderer logger available trough a global electronLog instance
  spyRendererConsole: true,
})

if (IS_PROD_DESKTOP) {
  Sentry.init({
    debug: true,
    dsn: MINTTER_SENTRY_DESKTOP_DSN,
    transportOptions: {
      // The maximum number of days to keep an event in the queue.
      maxQueueAgeDays: 30,
      // The maximum number of events to keep in the queue.
      maxQueueCount: 30,
      // Called every time the number of requests in the queue changes.
      queuedLengthChanged: (length) => {
        log.debug('[MAIN]: Sentry queue changed', length)
      },
      // Called before attempting to send an event to Sentry. Used to override queuing behavior.
      //
      // Return 'send' to attempt to send the event.
      // Return 'queue' to queue and persist the event for sending later.
      // Return 'drop' to drop the event.
      // beforeSend: (request) => (isOnline() ? 'send' : 'queue'),
    },
  })
}

app.on('did-become-active', () => {
  log.debug('[MAIN]: Mintter active')
})
app.on('did-resign-active', () => {
  log.debug('[MAIN]: Mintter no longer active')
})

// dark mode support: https://www.electronjs.org/docs/latest/tutorial/dark-mode
ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})

ipcMain.on('save-file', saveCidAsFile)
ipcMain.on('open-external-link', (_event, linkUrl) => {
  shell.openExternal(linkUrl)
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  log.debug('[MAIN]: Another Mintter already running. Quitting..')
  app.quit()
} else {
  app.on('ready', () => {
    log.debug('[MAIN]: Mintter ready')
    openInitialWindows()
  })
  app.on('second-instance', handleSecondInstance)

  app.on('window-all-closed', () => {
    log.debug('[MAIN]: window-all-closed')
    if (process.platform != 'darwin') {
      log.debug('[MAIN]: will quit the app')
      app.quit()
    }
  })
  app.on('open-url', (_event, url) => {
    handleUrlOpen(url)
  })
  app.on('activate', () => {
    log.debug('[MAIN]: Mintter Active')
    if (BrowserWindow.getAllWindows().length === 0) {
      log.debug('[MAIN]: will open the home window')
      trpc.createAppWindow({
        routes: [{key: 'home'}],
      })
    }
  })
}

function autoUpdate() {
  const updateUrl = `https://update.electronjs.org/MintterHypermedia/mintter/${
    process.platform
  }-${process.arch}/${app.getVersion()}`

  autoUpdater.setFeedURL({url: updateUrl})

  fetch(
    `https://update.electronjs.org/MintterHypermedia/mintter/darwin-x64/${app.getVersion()}`,
  ).then((res) => {
    if (res) {
      log.debug('[MAIN]: LINUX UPDATE NEED TO UPDATE', res)
    } else {
      log.debug('[MAIN]: LINUX LATEST', res)
    }
  })

  if (IS_PROD_DESKTOP) {
    if (process.platform == 'linux') {
    } else {
      setInterval(() => {
        autoUpdater.checkForUpdates()
        // check for updates every 10mins
      }, 60000 * 10)

      autoUpdater.on(
        'update-downloaded',
        (event, releaseNotes, releaseName) => {
          log.debug('[MAIN]: AUTO-UPDATE: New version downloaded')
          const dialogOpts: MessageBoxOptions = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail:
              'A new version has been downloaded. Restart the application to apply the updates.',
          }

          dialog.showMessageBox(dialogOpts).then((returnValue) => {
            log.debug('[MAIN]: AUTO-UPDATE: Quit and Install')
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
          })
        },
      )

      autoUpdater.on('error', (message) => {
        log.error(
          `[MAIN]: AUTO-UPDATE: There was a problem updating the application: ${message}`,
        )
        console.error('There was a problem updating the application')
        console.error(message)
      })
    }
  }
}
