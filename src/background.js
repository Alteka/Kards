'use strict'

const { app, protocol, BrowserWindow, ipcMain, dialog, shell, screen, nativeTheme, powerMonitor } = require('electron')
const { default: installExtension, VUEJS3_DEVTOOLS } = require('electron-devtools-installer')
const compareVersions = require('compare-versions')
const log = require('electron-log')
const { networkInterfaces, hostname } = require('os')
const Store = require('electron-store')
const path = require('path')
const bonjour = require('./main/bonjour')
const mime = require('mime-types')
const fs = require('fs')
const say = require('say')
const wallpaper = require('wallpaper')

const touchBar = require('./main/touchBar.js')
const altekaMenu = require('./main/menu.js')
const initWindows = require('./main/windows')
const initAudio = require('./main/audio')
const initSettings = require('./main/settings')
const startUpdateChecker = require('./main/updateChecker')
const { initRollbar } = require('./main/rollbar')
const { getDefaultConfig, initConfig, getConfig, setConfig, persist } = require('./main/config')
const { createServices } = require('./main/services')
const { initIpc } = require('./main/ipc')

const isDevelopment = process.env.NODE_ENV !== 'production'
const version = require('../package.json').version
const store = new Store()
let env
try {
  env = require('../env.json')
} catch (e) {
  env = { rollbarToken: '' }
}

const state = {
  controlWindow: null,
  testCardWindow: null,
  testCardWindowScreen: null,
  headlessExportMode: false,
  testCardWindowResizeTimer: null
}

initRollbar(env, version, isDevelopment, log)

// ---------------------------------------
// Boilerplate
// ---------------------------------------
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true, stream: true } }])

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  dialog.showErrorBox('Error', 'Another instance of Kards is already running')
  app.quit()
}

process.on('uncaughtException', (error) => {
  if (isDevelopment) {
    dialog.showErrorBox('Unexpected Error', error + '\r\n\r\n' + JSON.stringify(error))
  }
  log.warn('Error: ', error)
})

const { osc, rest } = createServices(state, { getConfig, fs, log })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    bonjour.unpublishAll()
    bonjour.destroy()
    log.info('All Windows closed - Quitting App')
    rest.stop()
    app.quit()
  }
})

app.on('activate', () => {
  app.whenReady().then(() => {
    if (BrowserWindow.getAllWindows().length === 0 && state.createControlWindow) {
      state.createControlWindow()
    }
  })
})

const controlMenu = new altekaMenu()

controlMenu.on('menuClick', (c) => {
  if (state.controlWindow) state.controlWindow.webContents.send('config', c)
})
controlMenu.on('openLogs', () => {
  const logPath = log.transports.file.findLogPath()
  shell.showItemInFolder(logPath)
})
controlMenu.on('aboutDialog', () => {
  if (state.controlWindow) state.controlWindow.webContents.send('aboutDialog')
})
controlMenu.on('checkForUpdates', () => {
  if (state.checkForUpdates) state.checkForUpdates()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      log.error('Vue Devtools failed to install:', e.toString())
    }
  }

  log.info('Launching Kards')
  initConfig(store)
  controlMenu.setup(getConfig())
  log.info('Loaded Config')

  osc.setup()
  rest.setup()

  if (state.createControlWindow) {
    state.createControlWindow()
  }
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        bonjour.unpublishAll()
        bonjour.destroy()
        log.info('OS called for graceful exit - Quitting App')
        rest.stop()
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      bonjour.unpublishAll()
      bonjour.destroy()
      log.info('OS call SIGTERM - Quitting App')
      rest.stop()
      app.quit()
    })
  }
}

// ---------------------------------------
// Windows (must run before createControlWindow is used in ready)
// ---------------------------------------
initWindows(state, {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  screen,
  path,
  log,
  rest,
  touchBar,
  isDevelopment,
  mime,
  fs,
  wallpaper,
  controlMenu,
  osc,
  getConfig
})

// ---------------------------------------
// Audio & settings
// ---------------------------------------
const audio = initAudio(ipcMain, state, {
  app,
  dialog,
  fs,
  say,
  log,
  getConfig
})

initSettings(ipcMain, controlMenu, state, {
  dialog,
  fs,
  log,
  version,
  getConfig,
  audio
})

controlMenu.on('loadAudioFile', () => {
  if (audio && audio.loadAudioFile) audio.loadAudioFile()
})

// ---------------------------------------
// IPC (after audio so resetDefault can call audio.resetAudio)
// ---------------------------------------
initIpc(ipcMain, state, {
  getConfig,
  setConfig,
  getDefaultConfig,
  persist,
  store,
  controlMenu,
  osc,
  rest,
  touchBar,
  nativeTheme,
  version,
  dialog,
  shell,
  fs,
  mime,
  networkInterfaces,
  hostname,
  log,
  audio
})

// ---------------------------------------
// Update checker
// ---------------------------------------
startUpdateChecker(state, {
  compareVersions,
  version,
  log,
  dialog,
  shell,
  ipcMain,
  powerMonitor
})
