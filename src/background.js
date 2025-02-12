'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, shell, screen, nativeTheme } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import compareVersions from 'compare-versions'
const log = require('electron-log')
const { networkInterfaces, hostname } = require('os')
const axios = require('axios')
const Store = require('electron-store')
const path = require('path')
var bonjour = require('bonjour')()
const mime = require('mime-types')

// Project specific includes
const touchBar = require('./touchBar.js')
const fs = require('fs')
const say = require('say')
// var sizeOf = require('image-size')
const wallpaper = require('wallpaper')
import altekaMenu from './menu'
import oscServer from './osc'
import restServer from './rest'

const isDevelopment = process.env.NODE_ENV !== 'production'
const version = require('./../package.json').version

const store = new Store()

//========================//
//         Rollbar        //
//========================//
var Rollbar = require("rollbar")
let env = require('../env.json')
if (!isDevelopment && env.rollbarToken != '') {
  var rollbar = new Rollbar({
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
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
])

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  dialog.showErrorBox("Error", "Another instance of Kards is already running")
  app.quit()
}

process.on('uncaughtException', function (error) {
  if (isDevelopment) {
    dialog.showErrorBox('Unexpected Error', error + '\r\n\r\n' + JSON.stringify(error))
  }
  log.warn('Error: ', error)
})

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
    if (BrowserWindow.getAllWindows().length === 0) createWindow()  
   })
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      log.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
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



//==========================//
//       CONFIG OBJECT      //
//==========================//
let config
app.on('ready', function() {
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
  touchBar.setConfig(config)
  updateScreens()
})
ipcMain.on('getConfigTestCard', () => {
  testCardWindow.webContents.send('config', config)
})

ipcMain.on('getConfigControl', () => {
  controlWindow.webContents.send('config', config)
  controlWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)
})

ipcMain.on('aboutDialogInfo', () => {
  let about = {
    version: version,
    electron: process.versions.electron,
    node: process.versions.node,
    vue: require('vue/package.json').version
  }
  controlWindow.webContents.send('aboutDialogInfo', about)
})


ipcMain.on('resetDefault', () => {
  controlWindow.webContents.send('config', getDefaultConfig())
  resetAudio()
})

function getDefaultConfig() {
  let defaultConfig = require('./defaultConfig.json')
  defaultConfig.name = hostname().split('.')[0].replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2").replace(/-|_|\.|\||\+|=|~|<|>|\/|\\/g, ' ')
  defaultConfig.screen = screen.getPrimaryDisplay().id
  return defaultConfig
}





//==========================//
//       WINDOW HANDLER     //
//==========================//
let controlWindow
let testCardWindow
let testCardWindowScreen
var controlMenu = new altekaMenu()

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
    title: "Kards",
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  controlWindow.once('ready-to-show', () => {
    controlWindow.show()
  })

  controlWindow.on('closed', () => {
    log.info('Control Window closed - Quitting App')
    rest.stop()
    app.quit()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await controlWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) controlWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    controlWindow.loadURL('app://./index.html')
  }

  controlWindow.setTouchBar(touchBar.touchBar)
  touchBar.setWindow(controlWindow)
}
ipcMain.on('controlResize', (_, data) => {
  controlWindow.setContentSize(675, data.height)
})


//========================//
//   Screen Management    //
//========================//
let screens
let primaryScreen

function updateScreens() {
  screens = screen.getAllDisplays()
  primaryScreen = screen.getPrimaryDisplay().id

  // workaround for Electron's displayFrequency being rounded.
  for (const s in screens) {
    if (screens[s].displayFrequency == 59) {
      screens[s].displayFrequency = 59.94
    }
    if (screens[s].displayFrequency == 29) {
      screens[s].displayFrequency = 29.97
    }
    screens[s].displayFrequency = Math.round(screens[s].displayFrequency*100)/100 // force elegant rounding 
  }

  if (controlWindow != null) {
    controlWindow.webContents.send('screens', {all: screens, primary: primaryScreen})  
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
app.on('ready', function() {
  updateScreens()

  screen.on('display-added', function() {
    setTimeout(updateScreens, 500)
  })
  screen.on('display-removed', function() {
    setTimeout(updateScreens, 500)
  })
  screen.on('display-metrics-changed', function() {
    setTimeout(updateScreens, 500)
  })
})




// app.on('ready', async () => {
// })


//========================//
//       IPC Handlers     //
//========================//
ipcMain.on('closeTestCard', (_, arg) => {
  controlWindow.webContents.send('closeTestCard')
})

ipcMain.on('openLogs', () => {
  openLogs()
})

function openLogs() {
  const path = log.transports.file.findLogPath()
  shell.showItemInFolder(path)
}

ipcMain.on('openUrl', (_, arg) => {
  shell.openExternal(arg)
  log.info('open url', arg)
})

ipcMain.on('selectMaskImage', () => {
  let result = dialog.showOpenDialogSync({ title: "Select Image", properties: ['openFile'], filters: [{name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg']}] })
  if (result != null) {
    let data = fs.readFileSync(result[0], { encoding: 'base64' })
    config.mask.imageSource = 'data:' + mime.lookup(result[0]) + ';base64,' + data
    config.mask.enabled = true // enable when image is picked.
    controlWindow.webContents.send('config', config)
  } else {
    log.info('No file selected')
  }
})

ipcMain.on('networkInfo', (event) => {
  const nets = networkInterfaces();
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
  if (testCardWindow == null && config.visible) { // Test card doesn't exist, but now needs to
    setupNewTestCardWindow()
  } else if (testCardWindow != null && !config.visible && !headlessExportMode) { // A window exists and shouldn't so lets close it
    closeTestCard()
  } else if (testCardWindow != null && config.visible && config.screen != testCardWindowScreen) { // a different screen as been selected..
    moveTestCardToNewScreen()
  } else if (testCardWindow != null) {
    if (testCardWindow.isFullScreen() || testCardWindow.isSimpleFullScreen()) {
      if (config.windowed) { // A full screen test card now needs to be windowed - hard to handle elegantly so close and reopen
        reopenTestCard()
      }
    } else if (!testCardWindow.isFullScreen() && !testCardWindow.isSimpleFullScreen()) {
      if (!config.windowed) { // A windowed test card now needs to be full screen. 
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
  let windowConfig = {title: "Kards - Output", show: false, frame: false, width: config.window.width, height: config.window.height, webPreferences: {preload: path.join(__dirname, 'preload.js')}}  
  
  if (!config.windowed) { // Setting up for full screen test card
    windowConfig.fullscreen = true

    for (const disp of screen.getAllDisplays()) {
      if (disp.id == config.screen) {
          if (process.platform == 'darwin') {

            // figure out if it's newer macos...
            let version = process.getSystemVersion().split('.')
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
        windowConfig.x = disp.bounds.x + (disp.bounds.width - config.window.width)/2
        windowConfig.y = disp.bounds.y + (disp.bounds.height - config.window.height)/2
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
        let x = disp.bounds.x + (disp.bounds.width - config.window.width)/2
        let y = disp.bounds.y + (disp.bounds.height - config.window.height)/2
        testCardWindow.setPosition(Math.round(x), Math.round(y))
    }
  }
})

function showTestCardWindow(windowConfig) {
  log.info('Showing test card with config: ', windowConfig)  

  testCardWindow = new BrowserWindow(windowConfig)
  testCardWindowScreen = config.screen

  testCardWindow.on('close', function () { 
    testCardWindow = null 
  })

  if(config.windowed || headlessExportMode){
    testCardWindow.setBounds({ width: windowConfig.width, height: windowConfig.height })
  }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    testCardWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/testcard')
    if (isDevelopment) testCardWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    testCardWindow.loadURL('app://./index.html#testcard')
  }

  testCardWindow.once('ready-to-show', () => {
    if (config.visible && !headlessExportMode && testCardWindow) {
      testCardWindow.show()
    }
  })

  testCardWindow.on('resize', function() {
    clearTimeout(testCardWindowResizeTimer)
    testCardWindowResizeTimer = setTimeout(handleTestCardResize, 500)
  })

  testCardWindow.on('move', function() {
    let x = testCardWindow.getBounds().x
    let y = testCardWindow.getBounds().y

    for (const disp of screen.getAllDisplays()) {
      if (x > disp.bounds.x && x < (disp.bounds.x + disp.bounds.width) && y > disp.bounds.y && y < (disp.bounds.y + disp.bounds.height)) {
        if (testCardWindowScreen!=disp.id) {
          config.screen = disp.id
          controlWindow.webContents.send('config', config)
        }
      }
    }
  })
}

function handleTestCardResize() {
  if (testCardWindow != null) {
    let bounds = testCardWindow.getBounds()
    let t = 2
    if (config.window.width < (bounds.width-t) || config.window.width > (bounds.width+t) || config.window.height < (bounds.height-t) || config.window.height > (bounds.height+t) || process.platform == 'darwin') {
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
let osc = new oscServer()
app.on('ready', function() {
  osc.setup()
})
osc.on('updateConfig', (c) => {
  controlWindow.webContents.send('config', c)
})
osc.on('audioFile', (filePath) => {
  log.debug('Audio File!', filePath)
  if (fs.lstatSync(filePath).isFile()) {
    config.audio.fileData = 'data:audio/' + filePath.split('.').pop() + ';base64,' + fs.readFileSync(filePath, {encoding: 'base64'})
    config.audio.fileName = 'Opened ' + filePath
    controlWindow.webContents.send('config', config)
  } else {
    log.warning("Selected audio file does not exist")
  }
})


let rest = new restServer()
app.on('ready', function() {
  rest.setup()
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
    let c = {show: false, frame: false, width: config.window.width, height: config.window.height, webPreferences: {preload: path.join(__dirname, 'preload.js')}}

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
  let result = dialog.showOpenDialogSync({ title: "Select Image", properties: ['openFile'], filters: [{name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif']}] })
  if (result != null) {
    let data = fs.readFileSync(result[0], { encoding: 'base64' })
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
  var name = config.name.replace(/ /g,"-") + '-' + suffix + 'Kard.png'
  dialog.showSaveDialog(controlWindow, {title: 'Save PNG', defaultPath: name, filters: [{name: 'Images', extensions: ['png']}]}).then(result => {
    if (!result.canceled) {
      var base64Data = arg.replace(/^data:image\/png;base64,/, "")
      fs.writeFile(result.filePath, base64Data, 'base64', function(err) {
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
  let dest = app.getPath('userData') + '/wallpaper' + Math.round((Math.random()*100000)) + '.png'
  var base64Data = arg.replace(/^data:image\/png;base64,/, "")
  fs.writeFile(dest, base64Data, 'base64', err => {
    if (err) {
      dialog.showErrorBox('Error Saving Wallpaper', JSON.stringify(err))
      log.error('Couldnt save wallpaper file ', err)
      controlWindow.webContents.send('exportCardCompleted', 'Could not write temporary file')
      return
    }
    (async () => {
      await wallpaper.set(dest)
      controlWindow.webContents.send('exportCardCompleted')
      })();
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

let lastCreatedVoice = ''
function createVoice() {
  let dest = app.getPath('userData') + '/voice.wav'  
  let voice = config.audio.prependText + config.name 

  say.export(voice, null, null, dest, (err) => {
    if (err) {
      return log.error(err)
    }
    log.info('Audio :: Updated name (' + config.name + ') has been saved to ', dest)
    config.audio.voiceData = 'data:audio/wav;base64,' + fs.readFileSync(dest, {encoding: 'base64'})
    controlWindow.webContents.send('config', config)
  })
}

function createTextAudio() {
  let dest = app.getPath('userData') + '/text.wav'  
  say.export(config.audio.text, null, null, dest, (err) => {
    if (err) {
      return log.error(err)
    }
    log.info('Audio :: Updated audio text (' + config.audio.text + ') has been saved to ', dest)
    config.audio.textData = 'data:audio/wav;base64,' + fs.readFileSync(dest, {encoding: 'base64'})
    controlWindow.webContents.send('config', config)
  })
}

let textToSpeechCount = 0
function textToSpeachData(text) {
  let dest = app.getPath('userData') + '/tts0' + textToSpeechCount + '.wav'  
  textToSpeechCount++
  say.export(config.audio.text, null, null, dest, (err) => {
    if (err) {
      log.error(err)
      return ''
    }
    return 'data:audio/wav;base64,' + fs.readFileSync(dest, {encoding: 'base64'})
  })
}

function loadAudioFile() {
  dialog.showOpenDialog(controlWindow, {title: 'Open Audio File', filters: [{name: "Audio", extensions: ['wav', 'mp3', 'ogg', 'aac']}]}).then(result => {
    if (!result.canceled) {
      let path = result.filePaths[0]
      config.audio.fileData = 'data:audio/' + path.split('.').pop() + ';base64,' + fs.readFileSync(path, {encoding: 'base64'})
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
  dialog.showSaveDialog({title: 'Export Settings', buttonLabel: 'Export', defaultPath: 'KardsSettings.json', filters: [{extensions: ['json']}]}).then(result => {
    if (!result.canceled) {
      let path = result.filePath
      let cfg = config
      cfg.audio.voiceData = '' // clear this out as it can be easily rebuilt    
      cfg.audio.textData = '' // clear this out as it can be easily rebuilt    
      cfg.createdBy = 'Kards'
      cfg.exportedVersion = version

      let data = JSON.stringify(cfg, null, 2)

      fs.writeFile(path, data, function(err) {
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
  let result = dialog.showOpenDialogSync({ title: "Import Settings", properties: ['openFile'], filters: [{name: 'JSON', extensions: ['json', 'JSON']}]})
  if (result != null) {
    fs.readFile(result[0], (err, data) => {
      if (err) throw err;
      let d = JSON.parse(data)
      let count = 0

      if (d.createdBy == 'Kards') {
        if (d.exportedVersion == version) {
          for (let key in config) {
            if (d[key] != undefined && key != 'visible' && key != 'exportedVersion' && key != 'createdBy' && typeof d[key] === typeof config[key]) {
              config[key] = d[key]
              count++
            }
          }
          createVoice() // recreate voice data after importing settings.
          createTextAudio() 
          controlWindow.webContents.send('config', config)
          controlWindow.webContents.send('importSettings', 'Imported ' + count + ' settings')
        } else {
          controlWindow.webContents.send('importSettings', 'Skipping - The file is from a different version of Kards')  
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
setTimeout(function() {
  axios.get('https://api.github.com/repos/alteka/kards/releases/latest')
    .then(function (response) {
      let online = response.data.tag_name
      let status = compareVersions(online, version, '>')
      if (status == 1) { 
        log.info('Update :: A newer version (' + online + ') is available. ' + version + ' currently installed.')
        dialog.showMessageBox(controlWindow, {
          type: 'question',
          title: 'An Update Is Available',
          message: 'Would you like to download version: ' + online,
          buttons: ['Cancel', 'Yes']
        }).then(function (response) {
          if (response.response == 1) {
            shell.openExternal('https://alteka.solutions/kards')
          }
        });
      } else if (status == 0) {
        log.info('Update :: Running latest version - ' + online)
      } else if (status == -1) {
        log.info('Update :: Running a newer version (' + version + ') than is online: ' + online)
      }
    })
    .catch(function (error) {
      log.error(error);
    })
  }, 10000)