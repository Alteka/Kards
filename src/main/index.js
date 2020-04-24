import { app, BrowserWindow, ipcMain, webContents, dialog, screen, TouchBar } from 'electron'
import { create } from 'domain';
const fs = require('fs')
const Store = require('electron-store')
const touchBar = require('./touchBar.js')

const store = new Store();

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

process.on('uncaughtException', function (error) {
  console.log('Error: ', error)
})

let controlWindow
let testCardWindow

let config

let testCardWindowScreen

function createWindow () {
  const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

  controlWindow = new BrowserWindow({
    height: 750,
    useContentSize: true,
    width: 600,
    webPreferences: {
      webSecurity: false
     }
  })
  controlWindow.loadURL(winURL)
  controlWindow.setTouchBar(touchBar.touchBar)
  // console.log('Setting touchbar: ', touchBar.touchBar)
  controlWindow.on('closed', () => { 
    app.quit()
   })
}

app.on('ready', function() {
  config = store.get('config', getDefaultConfig())
  console.log('Loaded Config: ', config)
  createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
  if (controlWindow === null) {
    createWindow()
  }
})


ipcMain.on('config', (event, arg) => {
  config = arg
  console.log('config change via ipc: ', config)
  manageTestCardWindow()
  if (testCardWindow != null) { 
    testCardWindow.webContents.send('config', config)
  }
  // controlWindow.setTouchBar(touchBar.touchBar)
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

ipcMain.on('resetDefault', (event, arg) => {
  controlWindow.webContents.send('config', getDefaultConfig())
})

function getDefaultConfig() {
  let defaultConfig = require('./defaultConfig.json')

  defaultConfig.name = require('os').hostname().split('.')[0]
  defaultConfig.screen = screen.getPrimaryDisplay().id

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
    console.log('showing test card!')  
    
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
    console.log('closing test card')
    testCardWindow.close()
  }
}


function showTestCardWindow(windowConfig) {
  const testCardUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/#/testcard' : `file://${__dirname}/index.html#testcard`
  testCardWindow = new BrowserWindow(windowConfig)
  testCardWindowScreen = config.screen
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
      console.log(result[0] + ' was copied to ' + dest);
      let logoUrl = 'file://' + dest + '?bust=' + Math.round((Math.random()*100000))
      controlWindow.webContents.send('logoUrl', logoUrl)
    });
   } else {
     console.log('No file selected')
     // need to think about NOT clearing out an old photo;.
   }
})