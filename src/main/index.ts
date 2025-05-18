import { app, BrowserWindow, ipcMain, dialog, shell, screen, nativeTheme } from 'electron'
import { optimizer, is } from '@electron-toolkit/utils'
import { installExtension, VUEJS_DEVTOOLS_BETA } from 'electron-devtools-installer'
import { compareVersions } from 'compare-versions'

import log from 'electron-log/main'
import { hostname, networkInterfaces } from 'os'
import axios from 'axios'
import Store from 'electron-store'
import path from 'path'
import { Bonjour } from 'bonjour-service'
import mime from 'mime-types'
import Rollbar from 'rollbar'
import defaultConfig from '../shared/defaultConfig.json'

// Project specific includes
import { touchBar, setTouchbarWindow, setTouchbarConfig } from './touchbar'
import fs from 'fs'
import say from 'say'
import wallpaper from 'wallpaper'
import { AltekaMenu } from './menu'
import { OSCServer } from './osc'
import { RESTServer } from './rest'

log.initialize()
const version = require('../../package.json').version

const store = new Store()
const bonjourInstance = new Bonjour()

//========================//
//         Rollbar        //
//========================//
const env = require('../../env.json')
if (!is.dev && env.rollbarToken != '') {
  const rollbar = new Rollbar({
    accessToken: env.rollbarToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      version: version
    }
  })
  // rollbar.debug('Hello World')
}
if (!env.rollbarToken) {
  log.warn('No Rollbar token has been set!')
}

//======================================//
//      BOILER PLATE ELECTRON STUFF     //
//======================================//

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  dialog.showErrorBox('Error', 'Another instance of Kards is already running')
  app.quit()
}

process.on('uncaughtException', function (error) {
  if (is.dev) {
    dialog.showErrorBox('Unexpected Error', error + '\r\n\r\n' + JSON.stringify(error))
  }
  log.warn('Error: ', error)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    bonjourInstance.unpublishAll()
    bonjourInstance.destroy()
    log.info('All Windows closed - Quitting App')
    rest.stop()
    app.quit()
  }
})

app.on('activate', () => {
  app.whenReady().then(() => {
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('ready', async () => {
  if (is.dev && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS_BETA)
    } catch (e) {
      log.error('Vue Devtools failed to install:', e.toString())
    }
  }
  await createWindow()
})

//==========================//
//       CONFIG OBJECT      //
//==========================//
let config
app.on('ready', function () {
  log.info('Launching Kards')
  config = {
    ...getDefaultConfig(),
    ...store.get('KardsConfig', getDefaultConfig())
  }
  config.visible = false
  config.audio.enabled = false
  log.info('Loaded Config')
  controlMenu.setup(config)
})
ipcMain.on('config', (_, arg) => {
  config = arg
  manageTestCardWindow()
  if (testCardWindow != null) {
    testCardWindow.webContents.send('config', config)
    if (config.windowed) {
      if (config.window.width > 0) {
        testCardWindow.setContentSize(parseInt(config.window.width), parseInt(config.window.height))
      }
    }
  }
  controlMenu.updateConfig(config)
  osc.updateConfig(config)
  rest.updateConfig(config)
  store.set('KardsConfig', config)
  setTouchbarConfig(config)
  updateScreens()
})
ipcMain.on('getConfigTestCard', () => {
  testCardWindow.webContents.send('config', config)
})

ipcMain.on('getConfigControl', () => {
  controlWindow.webContents.send('config', config)
  controlWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)
})

ipcMain.handle('aboutDialogInfo', () => {
  return {
    version: version,
    electron: process.versions.electron,
    node: process.versions.node,
    vue: require('vue/package.json').version
  }
})

ipcMain.on('resetDefault', () => {
  controlWindow.webContents.send('config', getDefaultConfig())
  resetAudio()
})

function getDefaultConfig() {
  defaultConfig.name = hostname()
    .split('.')[0]
    .replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2')
    .replace(/-|_|\.|\||\+|=|~|<|>|\/|\\/g, ' ')
  defaultConfig.screen = screen.getPrimaryDisplay().id
  return defaultConfig
}

//==========================//
//       WINDOW HANDLER     //
//==========================//
let controlWindow: BrowserWindow
let testCardWindow: BrowserWindow
let testCardWindowScreen: number
const controlMenu = new AltekaMenu()

controlMenu.on('menuClick', (c) => {
  controlWindow.webContents.send('config', c)
})
controlMenu.on('loadAudioFile', () => {
  loadAudioFile()
})
controlMenu.on('openLogs', () => {
  openLogs()
})
controlMenu.on('aboutDialog', () => {
  controlWindow.webContents.send('aboutDialog')
})

async function createWindow() {
  log.info('Showing control window')
  controlWindow = new BrowserWindow({
    width: 620,
    height: 450,
    show: false,
    useContentSize: true,
    maximizable: false,
    title: 'Kards',
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      sandbox: false,
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  controlWindow.once('ready-to-show', () => {
    controlWindow.show()
  })

  controlWindow.on('closed', () => {
    log.info('Control Window closed - Quitting App')
    bonjourInstance.unpublishAll()
    bonjourInstance.destroy()
    rest.stop()
    app.quit()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await controlWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    controlWindow.webContents.openDevTools()
  } else {
    await controlWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  controlWindow.setTouchBar(touchBar)
  setTouchbarWindow(controlWindow)
}
ipcMain.on('controlResize', (_, data) => {
  controlWindow.setContentSize(675, data.height)
})

//========================//
//   Screen Management    //
//========================//

function updateScreens() {
  const screens = screen.getAllDisplays()
  const primaryScreen = screen.getPrimaryDisplay().id

  // workaround for Electron's displayFrequency being rounded.
  for (const s in screens) {
    if (screens[s].displayFrequency == 59) {
      screens[s].displayFrequency = 59.94
    }
    if (screens[s].displayFrequency == 29) {
      screens[s].displayFrequency = 29.97
    }
    screens[s].displayFrequency = Math.round(screens[s].displayFrequency * 100) / 100 // force elegant rounding
  }

  if (controlWindow != null) {
    controlWindow.webContents.send('screens', { all: screens, primary: primaryScreen })
    controlMenu.updateScreens(screens)
    rest.updateScreens(screens)
    osc.updateScreens(screens)
  }
  if (testCardWindow != null) {
    for (const scr in screens) {
      if (screens[scr].id == config.screen) {
        testCardWindow.webContents.send('displayFrequency', screens[scr].displayFrequency)
      }
    }
  }
}
ipcMain.on('getScreens', () => {
  updateScreens()
})
app.on('ready', function () {
  updateScreens()

  screen.on('display-added', function () {
    setTimeout(updateScreens, 500)
  })
  screen.on('display-removed', function () {
    setTimeout(updateScreens, 500)
  })
  screen.on('display-metrics-changed', function () {
    setTimeout(updateScreens, 500)
  })
})

//========================//
//       IPC Handlers     //
//========================//
ipcMain.on('closeTestCard', () => {
  controlWindow.webContents.send('closeTestCard')
})

ipcMain.on('openLogs', () => {
  openLogs()
})

function openLogs() {
  shell.showItemInFolder(log.transports.file.getFile().path)
}

ipcMain.on('openUrl', (_, arg) => {
  shell.openExternal(arg)
  log.info('open url', arg)
})

ipcMain.on('selectMaskImage', () => {
  const result = dialog.showOpenDialogSync({
    title: 'Select Image',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg'] }]
  })
  if (result != null) {
    const data = fs.readFileSync(result[0], { encoding: 'base64' })
    config.mask.imageSource = 'data:' + mime.lookup(result[0]) + ';base64,' + data
    config.mask.enabled = true // enable when image is picked.
    controlWindow.webContents.send('config', config)
  } else {
    log.info('No file selected')
  }
})

ipcMain.on('networkInfo', (event) => {
  const nets = networkInterfaces()
  const results = ['Kards v' + version, hostname().split('.')[0]]

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(name + ': ' + net.address)
      }
    }
  }
  if (testCardWindow !== null) {
    testCardWindow.webContents.send('networkInfo', results)
  }
})

//==========================//
//   Test Card Management   //
//==========================//
// called when config is updated
function manageTestCardWindow() {
  if (testCardWindow == null && config.visible) {
    // Test card doesn't exist, but now needs to
    setupNewTestCardWindow()
  } else if (testCardWindow != null && !config.visible && !headlessExportMode) {
    // A window exists and shouldn't so lets close it
    closeTestCard()
  } else if (testCardWindow != null && config.visible && config.screen != testCardWindowScreen) {
    // a different screen as been selected..
    moveTestCardToNewScreen()
  } else if (testCardWindow != null) {
    if (testCardWindow.isFullScreen() || testCardWindow.isSimpleFullScreen()) {
      if (config.windowed) {
        // A full screen test card now needs to be windowed - hard to handle elegantly so close and reopen
        reopenTestCard()
      }
    } else if (!testCardWindow.isFullScreen() && !testCardWindow.isSimpleFullScreen()) {
      if (!config.windowed) {
        // A windowed test card now needs to be full screen.
        reopenTestCard()
      }
    }
  }
  if (testCardWindow !== null && config.visible) {
    if (config.cardType == 'led' && config.windowed) {
      testCardWindow.resizable = false
    } else {
      testCardWindow.resizable = true
    }
  }
}

function setupNewTestCardWindow() {
  const windowConfig: Electron.BrowserWindowConstructorOptions = {
    title: 'Kards - Output',
    show: false,
    frame: false,
    width: config.window.width,
    height: config.window.height,
    webPreferences: { preload: path.join(__dirname, '../preload/index.js') }
  }

  if (!config.windowed) {
    // Setting up for full screen test card
    windowConfig.fullscreen = true

    for (const disp of screen.getAllDisplays()) {
      if (disp.id == config.screen) {
        if (process.platform == 'darwin') {
          // figure out if it's newer macos...
          const version = process.getSystemVersion().split('.')
          let catalina = false
          if (version[0] > 10) {
            catalina = true
          }
          if (version[0] == 10 && version[1] >= 15) {
            catalina = true
          }

          if (disp.bounds.height != disp.workArea.height && catalina) {
            log.info('Running in seperate spaces mode - this is Catalina or newer')
            windowConfig.simpleFullscreen = false
          } else if (!catalina) {
            log.info('Using legacy full screen mode as this is not Catalina (or newer)')
            windowConfig.simpleFullscreen = true
          } else {
            log.info('Using legacy full screen mode')
            windowConfig.simpleFullscreen = true
          }
        } else {
          log.info('Using windows full screen system. Easy.')
        }
        windowConfig.x = disp.bounds.x
        windowConfig.y = disp.bounds.y
        windowConfig.width = disp.bounds.width
        windowConfig.height = disp.bounds.height
      }
    }
  } else {
    windowConfig.roundedCorners = false
    for (const disp of screen.getAllDisplays()) {
      if (disp.id == config.screen) {
        windowConfig.x = disp.bounds.x + (disp.bounds.width - config.window.width) / 2
        windowConfig.y = disp.bounds.y + (disp.bounds.height - config.window.height) / 2
      }
    }
  }
  showTestCardWindow(windowConfig)
}

function closeTestCard() {
  log.info('Closing test card')
  testCardWindow.destroy()
  testCardWindow = null
  testCardWindowScreen = null
  clearTimeout(testCardWindowResizeTimer)
}

function reopenTestCard() {
  closeTestCard()
  config.visible = true
  log.info('Setting timer to re-open test card')
  setTimeout(manageTestCardWindow, 500)
}

function moveTestCardToNewScreen() {
  if (config.windowed) {
    for (const disp of screen.getAllDisplays()) {
      if (disp.id == config.screen) {
        testCardWindowScreen = disp.id
      }
    }
  } else {
    reopenTestCard()
  }
}

ipcMain.on('moveWindowTo', (_, arg) => {
  log.info('Move active window to screen: ', arg)
  for (const disp of screen.getAllDisplays()) {
    if (disp.id == arg) {
      testCardWindowScreen = disp.id
      const x = disp.bounds.x + (disp.bounds.width - config.window.width) / 2
      const y = disp.bounds.y + (disp.bounds.height - config.window.height) / 2
      testCardWindow.setPosition(Math.round(x), Math.round(y))
    }
  }
})

function showTestCardWindow(windowConfig: Electron.BrowserWindowConstructorOptions) {
  log.info('Showing test card with config: ', windowConfig)

  testCardWindow = new BrowserWindow(windowConfig)
  testCardWindowScreen = config.screen

  testCardWindow.on('close', function () {
    testCardWindow = null
  })

  if (config.windowed || headlessExportMode) {
    testCardWindow.setBounds({ width: windowConfig.width, height: windowConfig.height })
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    testCardWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/testcard')
    testCardWindow.webContents.openDevTools()
  } else {
    testCardWindow.loadFile(path.join(__dirname, '../renderer/index.html#testcard'))
  }

  testCardWindow.once('ready-to-show', () => {
    if (config.visible && !headlessExportMode && testCardWindow) {
      testCardWindow.show()
    }
  })

  testCardWindow.on('resize', function () {
    clearTimeout(testCardWindowResizeTimer)
    testCardWindowResizeTimer = setTimeout(handleTestCardResize, 500)
  })

  testCardWindow.on('move', function () {
    const x = testCardWindow.getBounds().x
    const y = testCardWindow.getBounds().y

    for (const disp of screen.getAllDisplays()) {
      if (
        x > disp.bounds.x &&
        x < disp.bounds.x + disp.bounds.width &&
        y > disp.bounds.y &&
        y < disp.bounds.y + disp.bounds.height
      ) {
        if (testCardWindowScreen != disp.id) {
          config.screen = disp.id
          controlWindow.webContents.send('config', config)
        }
      }
    }
  })
}

function handleTestCardResize() {
  if (testCardWindow != null) {
    const bounds = testCardWindow.getBounds()
    const t = 2
    if (
      config.window.width < bounds.width - t ||
      config.window.width > bounds.width + t ||
      config.window.height < bounds.height - t ||
      config.window.height > bounds.height + t ||
      process.platform == 'darwin'
    ) {
      config.window.width = bounds.width
      config.window.height = bounds.height
      controlWindow.webContents.send('config', config)
    }
  }
}
let testCardWindowResizeTimer

//========================//
//    Setup OSC Server    //
//========================//
const osc = new OSCServer()
app.on('ready', function () {
  osc.setup(bonjourInstance)
})
osc.on('updateConfig', (c) => {
  controlWindow.webContents.send('config', c)
})
osc.on('audioFile', (filePath) => {
  log.debug('Audio File!', filePath)
  if (fs.lstatSync(filePath).isFile()) {
    config.audio.fileData =
      'data:audio/' +
      filePath.split('.').pop() +
      ';base64,' +
      fs.readFileSync(filePath, { encoding: 'base64' })
    config.audio.fileName = 'Opened ' + filePath
    controlWindow.webContents.send('config', config)
  } else {
    log.warn('Selected audio file does not exist')
  }
})

const rest = new RESTServer()
app.on('ready', function () {
  rest.setup(bonjourInstance)
})
rest.on('updateConfig', (c) => {
  controlWindow.webContents.send('config', c)
})

//========================//
//   Export PNG Images    //
//========================//
let headlessExportMode = false

ipcMain.on('testCardKeyPress', (_, msg) => {
  config[msg] = !config[msg]
  controlWindow.webContents.send('config', config)
  if (testCardWindow != null) {
    testCardWindow.webContents.send('config', config)
  }
})

ipcMain.on('exportCard', () => {
  if (testCardWindow != null) {
    testCardWindow.webContents.send('exportCard')
  } else {
    headlessExportMode = true
    const c: Electron.BrowserWindowConstructorOptions = {
      show: false,
      frame: false,
      width: config.window.width,
      height: config.window.height,
      webPreferences: { preload: path.join(__dirname, 'preload.js') }
    }

    if (config.windowed) {
      c.minWidth = config.window.width
      c.minHeight = config.window.height
    } else {
      for (const disp of screen.getAllDisplays()) {
        if (disp.id == config.screen) {
          c.width = disp.bounds.width
          c.height = disp.bounds.height
          c.minWidth = disp.bounds.width
          c.minHeight = disp.bounds.height
        }
      }
    }
    showTestCardWindow(c)
    log.info('Creating dummy test card window to capture image')
  }
})

ipcMain.on('selectImage', () => {
  const result = dialog.showOpenDialogSync({
    title: 'Select Image',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif'] }]
  })
  if (result != null) {
    const data = fs.readFileSync(result[0], { encoding: 'base64' })
    config.alteka.logo = 'data:' + mime.lookup(result[0]) + ';base64,' + data
    controlWindow.webContents.send('config', config)
  } else {
    log.info('No file selected')
  }
})

ipcMain.on('saveAsPNG', (_, arg) => {
  headlessExportMode = false
  let suffix = config.cardType[0].toUpperCase() + config.cardType.slice(1)
  if (suffix == 'Placeholder') suffix = 'Name'
  if (suffix == 'Led') suffix = 'LED'
  const name = config.name.replace(/ /g, '-') + '-' + suffix + 'Kard.png'
  dialog
    .showSaveDialog(controlWindow, {
      title: 'Save PNG',
      defaultPath: name,
      filters: [{ name: 'Images', extensions: ['png'] }]
    })
    .then((result) => {
      if (!result.canceled) {
        const base64Data = arg.replace(/^data:image\/png;base64,/, '')
        fs.writeFile(result.filePath, base64Data, 'base64', function (err) {
          if (err) {
            dialog.showErrorBox('Error Saving File', JSON.stringify(err))
            log.error('Couldnt save file: ', err)
            controlWindow.webContents.send('exportCardCompleted', 'Could Not Write File')
          } else {
            // let dims = sizeOf(result.filePath)
            controlWindow.webContents.send('exportCardCompleted')
          }
        })
      } else {
        log.info('Save dialog closed')
        controlWindow.webContents.send('exportCardCompleted', 'File Save Cancelled')
      }
    })
  if (!config.visible && testCardWindow !== null) {
    log.info('Closing dummy test card window')
    testCardWindow.close()
  }
})

ipcMain.on('setAsWallpaper', (_, arg) => {
  headlessExportMode = false
  const dest = app.getPath('userData') + '/wallpaper' + Math.round(Math.random() * 100000) + '.png'
  const base64Data = arg.replace(/^data:image\/png;base64,/, '')
  fs.writeFile(dest, base64Data, 'base64', (err) => {
    if (err) {
      dialog.showErrorBox('Error Saving Wallpaper', JSON.stringify(err))
      log.error('Couldnt save wallpaper file ', err)
      controlWindow.webContents.send('exportCardCompleted', 'Could not write temporary file')
      return
    }
    ;(async () => {
      await wallpaper.set(dest)
      controlWindow.webContents.send('exportCardCompleted')
    })()
  })
  if (!config.visible) {
    log.info('Closing dummy test card window')
    testCardWindow.close()
  }
})

//========================//
//    Voice Generation    //
//========================//
ipcMain.on('createVoice', () => {
  createVoice()
})
ipcMain.on('updateAudioText', () => {
  createTextAudio()
})
ipcMain.on('loadAudioFile', () => {
  loadAudioFile()
})
function resetAudio() {
  setTimeout(createVoice, 5000)
  setTimeout(createTextAudio, 5000)
}

function createVoice() {
  const dest = app.getPath('userData') + '/voice.wav'
  const voice = config.audio.prependText + config.name

  say.export(voice, null, null, dest, (err) => {
    if (err) {
      return log.error(err)
    }
    log.info('Audio :: Updated name (' + config.name + ') has been saved to ', dest)
    config.audio.voiceData =
      'data:audio/wav;base64,' + fs.readFileSync(dest, { encoding: 'base64' })
    controlWindow.webContents.send('config', config)
  })
}

function createTextAudio() {
  const dest = app.getPath('userData') + '/text.wav'
  say.export(config.audio.text, null, null, dest, (err) => {
    if (err) {
      return log.error(err)
    }
    log.info('Audio :: Updated audio text (' + config.audio.text + ') has been saved to ', dest)
    config.audio.textData = 'data:audio/wav;base64,' + fs.readFileSync(dest, { encoding: 'base64' })
    controlWindow.webContents.send('config', config)
  })
}

let textToSpeechCount = 0
function textToSpeachData(text) {
  const dest = app.getPath('userData') + '/tts0' + textToSpeechCount + '.wav'
  textToSpeechCount++
  say.export(config.audio.text, null, null, dest, (err) => {
    if (err) {
      log.error(err)
      return ''
    }
    return 'data:audio/wav;base64,' + fs.readFileSync(dest, { encoding: 'base64' })
  })
}

function loadAudioFile() {
  dialog
    .showOpenDialog(controlWindow, {
      title: 'Open Audio File',
      filters: [{ name: 'Audio', extensions: ['wav', 'mp3', 'ogg', 'aac'] }]
    })
    .then((result) => {
      if (!result.canceled) {
        const path = result.filePaths[0]
        config.audio.fileData =
          'data:audio/' +
          path.split('.').pop() +
          ';base64,' +
          fs.readFileSync(path, { encoding: 'base64' })
        config.audio.fileName = 'Opened ' + path
        controlWindow.webContents.send('config', config)
        log.info('Audio :: Audio file imported - ' + path)
      } else {
        log.info('Audio :: Save dialog closed')
      }
    })
}

//============================//
//   Import/Export Settings   //
//============================//
ipcMain.on('exportSettings', () => {
  exportSettings()
})

ipcMain.on('importSettings', () => {
  importSettings()
})

controlMenu.on('importSettings', () => {
  importSettings()
})

controlMenu.on('exportSettings', () => {
  exportSettings()
})

function exportSettings() {
  dialog
    .showSaveDialog({
      title: 'Export Settings',
      buttonLabel: 'Export',
      defaultPath: 'KardsSettings.json',
      filters: [{ extensions: ['json'] }]
    })
    .then((result) => {
      if (!result.canceled) {
        const path = result.filePath
        const cfg = config
        cfg.audio.voiceData = '' // clear this out as it can be easily rebuilt
        cfg.audio.textData = '' // clear this out as it can be easily rebuilt
        cfg.createdBy = 'Kards'
        cfg.exportedVersion = version

        const data = JSON.stringify(cfg, null, 2)

        fs.writeFile(path, data, function (err) {
          if (err) {
            dialog.showErrorBox('Error Saving File', JSON.stringify(err))
            log.error('Couldnt save file: ', err)
          }
        })
      } else {
        log.info('Save dialog closed')
      }
    })
}

function importSettings() {
  const result = dialog.showOpenDialogSync({
    title: 'Import Settings',
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }]
  })
  if (result != null) {
    fs.readFile(result[0], (err, data) => {
      if (err) throw err
      const d = JSON.parse(data)
      let count = 0

      if (d.createdBy == 'Kards') {
        if (d.exportedVersion == version) {
          for (const key in config) {
            if (
              d[key] != undefined &&
              key != 'visible' &&
              key != 'exportedVersion' &&
              key != 'createdBy' &&
              typeof d[key] === typeof config[key]
            ) {
              config[key] = d[key]
              count++
            }
          }
          createVoice() // recreate voice data after importing settings.
          createTextAudio()
          controlWindow.webContents.send('config', config)
          controlWindow.webContents.send('importSettings', 'Imported ' + count + ' settings')
        } else {
          controlWindow.webContents.send(
            'importSettings',
            'Skipping - The file is from a different version of Kards'
          )
        }
      } else {
        controlWindow.webContents.send('importSettings', 'Failed - That file was not made by Kards')
      }
    })
  } else {
    log.info('No file selected')
  }
}

//========================//
//     Update Checker     //
//========================//
setTimeout(function () {
  axios
    .get('https://api.github.com/repos/alteka/kards/releases/latest')
    .then(function (response) {
      const online = response.data.tag_name
      const status = compareVersions(online, version)
      if (status == 1) {
        log.info(
          'Update :: A newer version (' +
            online +
            ') is available. ' +
            version +
            ' currently installed.'
        )
        dialog
          .showMessageBox(controlWindow, {
            type: 'question',
            title: 'An Update Is Available',
            message: 'Would you like to download version: ' + online,
            buttons: ['Cancel', 'Yes']
          })
          .then(function (response) {
            if (response.response == 1) {
              shell.openExternal('https://alteka.solutions/kards')
            }
          })
      } else if (status == 0) {
        log.info('Update :: Running latest version - ' + online)
      } else if (status == -1) {
        log.info('Update :: Running a newer version (' + version + ') than is online: ' + online)
      }
    })
    .catch(function (error) {
      log.error(error)
    })
}, 10000)
