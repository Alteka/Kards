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

// Project specific includes
const fs = require('fs')
const say = require('say')
var sizeOf = require('image-size')
const wallpaper = require('wallpaper')
import altekaAnalytics from './analytics'
import altekaMenu from './menu'
import oscServer from './osc'
import restServer from './rest'

const store = new Store({
  migrations: {
    '<1.2.0': store => {
      store.delete('KardsConfig')
      log.info('Resetting to default settings due to upgrade')
    }
  }
})


//======================================//
//      BOILER PLATE ELECTRON STUFF     //
//======================================//
const isDevelopment = process.env.NODE_ENV !== 'production'

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

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
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
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
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      bonjour.unpublishAll()
      bonjour.destroy()
      log.info('OS call SIGTERM - Quitting App')
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
  config = store.get('KardsConfig', getDefaultConfig())
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
      testCardWindow.setContentSize(parseInt(config.window.width), parseInt(config.window.height))
    }
  }
  // touchBar.setConfig(config)
  controlMenu.updateConfig(config)
  analytics.updateConfig(config)
  osc.updateConfig(config)
  rest.updateConfig(config)
  store.set('KardsConfig', config)
})
ipcMain.on('getConfigTestCard', () => {
  testCardWindow.webContents.send('config', config)
})

ipcMain.on('getConfigControl', () => {
  controlWindow.webContents.send('config', config)
  controlWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)
})

ipcMain.on('resetDefault', () => {
  controlWindow.webContents.send('config', getDefaultConfig())
  analytics.track("ResetDefaults", 'Resetting app config to defaults')
  createTextAudio()
  createVoice()
})

function getDefaultConfig() {
  let defaultConfig = require('./defaultConfig.json')
  defaultConfig.name = require('os').hostname().split('.')[0].replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2").replace(/-|_|\.|\||\+|=|~|<|>|\/|\\/g, ' ')
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

async function createWindow() {
  log.info('Showing control window')
  controlWindow = new BrowserWindow({
    width: 620,
    height: 450,
    show: false,
    useContentSize: true,
    maximizable: false,
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
    bonjour.unpublishAll()
    bonjour.destroy()
    if (testCardWindow !== null) {
      testCardWindow.close()
    }
    log.info('Control Window closed - Quitting App')
    app.quit()
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await controlWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) controlWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    controlWindow.loadURL('app://./index.html')
  }
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
  }

  if (controlWindow != null) {
    controlWindow.webContents.send('screens', {all: screens, primary: primaryScreen})  
    controlMenu.updateScreens(screens)
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



//=====================//
//       Analytics     //
//=====================//
let analytics = new altekaAnalytics()
app.on('ready', async () => {
  analytics.setup()
})


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
  analytics.track('OpenLogs', 'Opening log folder')
}

ipcMain.on('openUrl', (_, arg) => {
  shell.openExternal(arg)
  log.info('open url', arg)
})

ipcMain.on('networkInfo', (event) => {
  const nets = networkInterfaces();
  const results = [hostname().split('.')[0]]

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
}

function setupNewTestCardWindow() {
  let windowConfig = {show: false, frame: false, width: config.window.width, height: config.window.height, webPreferences: {preload: path.join(__dirname, 'preload.js')}}  
  
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
  testCardWindow.close()
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
    if (!process.env.IS_TEST) testCardWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    testCardWindow.loadURL('app://./index.html#testcard')
  }

  testCardWindow.once('ready-to-show', () => {
    if (config.visible && !headlessExportMode) {
      testCardWindow.show()
    }
  })

  testCardWindow.on('resize', function() {
    clearTimeout(testCardWindowResizeTimer)
    testCardWindowResizeTimer = setTimeout(handleTestCardResize, 500)
    analytics.setSize(testCardWindow.getBounds().width,testCardWindow.getBounds().height)
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
  let bounds = testCardWindow.getBounds()
  let t = 2
  if (config.window.width < (bounds.width-t) || config.window.width > (bounds.width+t) || config.window.height < (bounds.height-t) || config.window.height > (bounds.height+t) || process.platform == 'darwin') {
    config.window.width = bounds.width
    config.window.height = bounds.height
    controlWindow.webContents.send('config', config)
  }
}
let testCardWindowResizeTimer




//========================//
//    Setup OSC Server    //
//========================//
let osc = new oscServer()
osc.setup()
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
// osc.on('exportImageToWallpaper', () => {
//   log.debug('exportImageToWallpaper')
// })
// osc.on('exportImageToFile', (filePath) => {
//   log.debug('exportImageToFile', filePath)
// })


let rest = new restServer()
rest.setup()
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
    let mime = require('mime').getType(result[0])
    config.alteka.logo = 'data:' + mime + ';base64,' + data
    controlWindow.webContents.send('config', config)
  } else {
    log.info('No file selected')
  }
})

ipcMain.on('saveAsPNG', (_, arg) => {
  headlessExportMode = false
  dialog.showSaveDialog(controlWindow, {title: 'Save PNG', defaultPath: 'TestKard.png', filters: [{name: 'Images', extensions: ['png']}]}).then(result => {
    if (!result.canceled) {
      var base64Data = arg.replace(/^data:image\/png;base64,/, "")
      fs.writeFile(result.filePath, base64Data, 'base64', function(err) {
        if (err) {
          dialog.showErrorBox('Error Saving File', JSON.stringify(err))
          log.error('Couldnt save file: ', err)
          controlWindow.webContents.send('exportCardCompleted', 'Could Not Write File')
        } else {
          let dims = sizeOf(result.filePath)
          analytics.track('ImageSavedToPNG', 'PNG saved to: ', result.filePath, ' - With dimensions: ', dims.width, 'x', dims.height)
          controlWindow.webContents.send('exportCardCompleted')
        }
      })
    } else {
      log.info('Save dialog closed')
      controlWindow.webContents.send('exportCardCompleted', 'File Save Cancelled')
    }
  })
  if (!config.visible) {
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
      let dims = sizeOf(dest)
      analytics.track('ImageSavedToWallpaper', 'Setting PNG as wallpaper with dims: ' + dims.width + 'x' + dims.height)
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
setTimeout(createVoice, 5000)
setTimeout(createTextAudio, 5000)
ipcMain.on('createVoice', () => {
  createVoice()
})
ipcMain.on('updateAudioText', () => {
  createTextAudio()
})
ipcMain.on('loadAudioFile', () => {
  loadAudioFile()
})
let audioGeneratedVoice = ''
function createVoice() {
  if (audioGeneratedVoice != config.audio.prependText + config.name) {
    let dest = app.getPath('userData') + '/voice.wav'  
    audioGeneratedVoice = config.audio.prependText + config.name
    say.export(audioGeneratedVoice, null, null, dest, (err) => {
      if (err) {
        return console.error(err)
      }
      log.info('Audio :: Updated name (' + config.name + ') has been saved to ', dest)
      config.audio.voiceData = 'data:audio/wav;base64,' + fs.readFileSync(dest, {encoding: 'base64'})
      controlWindow.webContents.send('config', config)
    })
  }
}
let audioGeneratedText = ''
function createTextAudio() {
  if (config.audio.text != audioGeneratedText) {
    let dest = app.getPath('userData') + '/text.wav'  
    audioGeneratedText = config.audio.text
    say.export(config.audio.text, null, null, dest, (err) => {
      if (err) {
        return console.error(err)
      }
      log.info('Audio :: Updated audio text (' + config.audio.text + ') has been saved to ', dest)
      config.audio.textData = 'data:audio/wav;base64,' + fs.readFileSync(dest, {encoding: 'base64'})
      controlWindow.webContents.send('config', config)
    })
  }
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
      cfg.exportedVersion = require('./../package.json').version

      let data = JSON.stringify(cfg, null, 2)

      fs.writeFile(path, data, function(err) {
        if (err) {
          dialog.showErrorBox('Error Saving File', JSON.stringify(err))
          log.error('Couldnt save file: ', err)
        } else {
          analytics.track('SettingsExported', 'JSON saved to: ' + path)
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
        if (d.exportedVersion == require('./../package.json').version) {
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
          analytics.track('SettingsImported', 'Imported ' + count + ' settings from json file.')
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
      let now = require('./../package.json').version
      let status = compareVersions(online, now, '>')
      if (status == 1) { 
        log.info('Update :: A newer version (v' + online + ') is available. v' + now + ' currently installed.')
        dialog.showMessageBox(controlWindow, {
          type: 'question',
          title: 'An Update Is Available',
          message: 'Would you like to download version: ' + online,
          buttons: ['Cancel', 'Yes']
        }).then(function (response) {
          if (response.response == 1) {
            shell.openExternal('https://alteka.solutions/kards')
            analytics.track('OpenUpdateLink', "Open Update Link")
          }
        });
      } else if (status == 0) {
        log.info('Update :: Running latest version - v' + online)
      } else if (status == -1) {
        log.info('Update :: Running a newer version (v' + now + ') than is online: v' + online)
      }
    })
    .catch(function (error) {
      log.error(error);
    })
  }, 10000)