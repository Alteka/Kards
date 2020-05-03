import { app, BrowserWindow, ipcMain, webContents, dialog, screen, TouchBar } from 'electron'
import { create } from 'domain';
const wallpaper = require('wallpaper');
const fs = require('fs')
const Store = require('electron-store')
const touchBar = require('./touchBar.js')
const log = require('electron-log');

const store = new Store();

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  log.info('Running in production mode')
}

process.on('uncaughtException', function (error) {
  log.warn('Error: ', error)
})

let controlWindow
let testCardWindow
let config
let testCardWindowScreen

function createWindow () {
  log.info('Showing control window')
  const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

  controlWindow = new BrowserWindow({
    height: 450,
    resizable: false,
    maximizable: false,
    useContentSize: true,
    width: 620,
    webPreferences: {
      webSecurity: false
     }
  })
  controlWindow.loadURL(winURL)
  controlWindow.setTouchBar(touchBar.touchBar)
  touchBar.setWindow(controlWindow)
  controlWindow.on('closed', () => { 
    app.quit()
   })
}

app.on('ready', function() {
  log.info('Launching Kards')
  config = store.get('config', getDefaultConfig())
  config.visible = false
  config.audio.enabled = false
  log.info('Loaded Config: ', config)
  createWindow()
})

app.on('window-all-closed', () => {
    log.info('Windows closed, quitting app')
    app.quit()
})

app.on('activate', () => {
  if (controlWindow === null) {
    createWindow()
  }
})


ipcMain.on('config', (event, arg) => {
  config = arg
  manageTestCardWindow()
  if (testCardWindow != null) { 
    testCardWindow.webContents.send('config', config)
  }
  touchBar.setConfig(config)
  store.set('config', config)
})

ipcMain.on('getConfigTestCard', (event, arg) => {
  testCardWindow.webContents.send('config', config)
})

ipcMain.on('getConfigControl', (event, arg) => {
  controlWindow.webContents.send('config', config)
})

ipcMain.on('closeTestCard', (event, arg) => {
  controlWindow.webContents.send('closeTestCard')
})

ipcMain.on('controlResize', (event, width, height) => {
  controlWindow.setSize(620, height + 30)
})

ipcMain.on('testCardToPNG', (event) => {
  testCardWindow.webContents.send('testCardToPNG')
})
ipcMain.on('outputToPNG', (event) => {
  testCardWindow.webContents.send('outputToPNG')
})
ipcMain.on('testCardToWallpaper', (event) => {
  testCardWindow.webContents.send('testCardToWallpaper')
})
ipcMain.on('outputToWallpaper', (event) => {
  testCardWindow.webContents.send('outputToWallpaper')
})

ipcMain.on('saveAsPNG', (event, arg) => {
  dialog.showSaveDialog(controlWindow, {title: 'Save PNG', filters: [{name: 'Images', extensions: ['png']}]}, (path) => {
    var base64Data = arg.replace(/^data:image\/png;base64,/, "");
    fs.writeFile(path, base64Data, 'base64', function(err) {
      log.error('Couldnt save file: ', err);
    });
    log.info('PNG saved to: ', path);
  })
})
ipcMain.on('setAsWallpaper', (event, arg) => {
  let dest = app.getPath('userData') + '/wallpaper.png'
  var base64Data = arg.replace(/^data:image\/png;base64,/, "")
  fs.writeFile(dest, base64Data, 'base64', err => {
    if (err) {
      log.error('Couldnt save wallpaper file ', err)
      return
    }
    (async () => {
      await wallpaper.set(dest);
      log.info('Setting png as wallpaper')
      })();
    })
  })
  


ipcMain.on('resetDefault', (event, arg) => {
  controlWindow.webContents.send('config', getDefaultConfig())
  log.info('Resetting to default')
})

function getDefaultConfig() {
  let defaultConfig = require('./defaultConfig.json')
  defaultConfig.name = require('os').hostname().split('.')[0]
  defaultConfig.screen = screen.getPrimaryDisplay().id
  defaultConfig.visible = false
  return defaultConfig
}

function manageTestCardWindow() {
  let displays = screen.getAllDisplays()

  let windowConfig = {
    width: 900,
    height: 600,
    webPreferences: {
      webSecurity: false
     } 
  }  

  if (testCardWindow == null && config.visible) {
    log.info('Showing test card')  
    
    if (config.screen != 0) {
      windowConfig.fullscreen = true
      windowConfig.simpleFullscreen = false 

      for (const disp of displays) {
        if (disp.id == config.screen) {
          windowConfig.x = disp.bounds.x
          windowConfig.y = disp.bounds.y
          windowConfig.width = disp.bounds.width
          windowConfig.height = disp.bounds.height
        }
      }
    }
    showTestCardWindow(windowConfig)
  } else if (testCardWindow != null && !config.visible) {
    log.info('Closing test card')
    testCardWindow.close()
  }
}


function showTestCardWindow(windowConfig) {
  const testCardUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/#/testcard' : `file://${__dirname}/index.html#testcard`
  testCardWindow = new BrowserWindow(windowConfig)
  testCardWindowScreen = config.screen
  testCardWindow.setTouchBar(touchBar.touchBar)
  testCardWindow.on('close', function () { 
    testCardWindow = null 
    controlWindow.webContents.send('closeTestCard')
  })
  testCardWindow.loadURL(testCardUrl)
}


ipcMain.on('selectImage', (event, arg) => {
  let result = dialog.showOpenDialog({ 
    title: "Select Image",
    properties: ['openFile'],
    filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}],
   })

   if (result.length > 0) {
    let dest = app.getPath('userData') + '/logo.png'

    fs.copyFile(result[0], dest, (err) => {
      if (err) throw err;
      log.info('Selected image: ' + result[0] + ' was copied to ' + dest);
      let logoUrl = 'file://' + dest + '?bust=' + Math.round((Math.random()*100000))
      controlWindow.webContents.send('logoUrl', logoUrl)
    });
   } else {
     log.info('No file selected')
     // need to think about NOT clearing out an old photo;.
   }
})