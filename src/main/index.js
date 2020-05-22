import { app, BrowserWindow, ipcMain, webContents, dialog, screen, TouchBar, Menu, MenuItem } from 'electron'
import { create } from 'domain';
const wallpaper = require('wallpaper');
const fs = require('fs')
const Store = require('electron-store')
const touchBar = require('./touchBar.js')
const menu = require('./menu.js').menu
const log = require('electron-log');

const store = new Store();

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  log.info('Running in production mode')
}

process.on('uncaughtException', function (error) {
  if (process.env.NODE_ENV === 'development') {
    dialog.showErrorBox('Unexpected Error', 'Because.. You know - normally we expect them. \r\n\r\n' + error + '\r\n\r\n' + JSON.stringify(error))
  }
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
    show: false,
    height: 450,
    resizable: false,
    maximizable: false,
    useContentSize: true,
    width: 620,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
     }
  })

  if (process.platform == 'darwin') {
    Menu.setApplicationMenu(menu)

  } else {
    Menu.setApplicationMenu(null)
  }

  controlWindow.loadURL(winURL)

  controlWindow.once('ready-to-show', () => {
    controlWindow.show()
  })

  controlWindow.setTouchBar(touchBar.touchBar)
  touchBar.setWindow(controlWindow)

  controlWindow.on('closed', (event) => { 
    event.preventDefault()
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
    if (config.screen == 0) {
      testCardWindow.setContentSize(parseInt(config.winWidth), parseInt(config.winHeight))
    }
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

ipcMain.on('controlResize', (event, w, h) => {
  controlWindow.setContentSize(620, h)
})

ipcMain.on('testCardToPNG', (event) => {
  testCardWindow.webContents.send('testCardToPNG')
})

ipcMain.on('canvasToPNG', (event) => {
  testCardWindow.webContents.send('outputToPNG')
})

ipcMain.on('testCardToWallpaper', (event) => {
  testCardWindow.webContents.send('testCardToWallpaper')
})

ipcMain.on('canvasToWallpaper', (event) => {
  testCardWindow.webContents.send('outputToWallpaper')
})

ipcMain.on('saveAsPNG', (event, arg) => {
  dialog.showSaveDialog(controlWindow, {title: 'Save PNG', defaultPath: 'TestKard.png', filters: [{name: 'Images', extensions: ['png']}]}).then(result => {
    if (!result.canceled) {
      let path = result.filePath
      var base64Data = arg.replace(/^data:image\/png;base64,/, "")
      fs.writeFile(path, base64Data, 'base64', function(err) {
        if (err) {
          dialog.showErrorBox('Error Saving File', JSON.stringify(err))
          log.error('Couldnt save file: ', err)
        } else {
          log.info('PNG saved to: ', path)
        }
      })
    } else {
      log.info('Save dialog closed')
    }
  })
})

ipcMain.on('setAsWallpaper', (event, arg) => {
  let dest = app.getPath('userData') + '/wallpaper.png'
  var base64Data = arg.replace(/^data:image\/png;base64,/, "")
  fs.writeFile(dest, base64Data, 'base64', err => {
    if (err) {
      dialog.showErrorBox('Error Saving Wallpaper', JSON.stringify(err))
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
    show: false,
    width: 900,
    height: 600,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
     } 
  }  

  if (testCardWindow == null && config.visible) {
    log.info('Showing test card with config: ', config)  
    
    if (config.screen != 0) {
      windowConfig.fullscreen = true
      
      for (const disp of displays) {
        if (disp.id == config.screen) {

          // Check and manage for seperate spaces configurations
          if (process.platform == 'darwin') {
            if (disp.bounds.height != disp.workArea.height) {
              log.info('Running in seperate spaces mode')
              windowConfig.simpleFullscreen = false 
            } else {
              log.info('Using legacy full screen mode')
              windowConfig.simpleFullscreen = true 
            }
          }

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
  testCardWindow.on('close', function () { 
    testCardWindow = null 
  })

  testCardWindow.loadURL(testCardUrl)

  testCardWindow.once('ready-to-show', () => {
    testCardWindow.show()
  })

  testCardWindow.on('resize', function() {
    clearTimeout(testCardWindowResizeTimer)
    testCardWindowResizeTimer = setTimeout(handleTestCardResize, 500)
  })
}

function handleTestCardResize() {
  let bounds = testCardWindow.getBounds()
  config.winWidth = bounds.width
  config.winHeight = bounds.height
  controlWindow.webContents.send('config', config)
}
let testCardWindowResizeTimer


ipcMain.on('selectImage', (event, arg) => {
  let result = dialog.showOpenDialogSync({ 
    title: "Select Image",
    properties: ['openFile'],
    filters: [{name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif']}],
  })
  if (result != null) {
    let dest = app.getPath('userData') + '/logo.png'

    fs.copyFile(result[0], dest, (err) => {
      if (err) {
        dialog.showErrorBox('Error Copying File', JSON.stringify(err))
        return
      }
      log.info('Selected image: ' + result[0] + ' was copied to ' + dest);
      let logoUrl = 'file://' + dest + '?bust=' + Math.round((Math.random()*100000))
      controlWindow.webContents.send('logoUrl', logoUrl)
    });
  } else {
    log.info('No file selected')
    // need to think about NOT clearing out an old photo;.
  }
})