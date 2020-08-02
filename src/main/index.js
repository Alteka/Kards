import { app, BrowserWindow, ipcMain, webContents, dialog, screen, TouchBar, Menu, MenuItem } from 'electron'
import { create } from 'domain';
const wallpaper = require('wallpaper');
const fs = require('fs')
const Store = require('electron-store')
const touchBar = require('./touchBar.js')
const menu = require('./menu.js').menu
const log = require('electron-log');

const store = new Store({
  migrations: {
    '<=0.8.0': store => {
      store.delete('KardsConfig')
      log.info('Resetting to default settings due to upgrade')
    }
  }});

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
  config = store.get('KardsConfig', getDefaultConfig())
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
    if (config.windowed) {
      testCardWindow.setContentSize(parseInt(config.winWidth), parseInt(config.winHeight))
    }
  }
  touchBar.setConfig(config)
  store.set('KardsConfig', config)
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


ipcMain.on('exportCard', (event) => {
  if (testCardWindow != null) {
    testCardWindow.webContents.send('exportCard')
  } else {
    let c = {show: false, frame: false, width: config.winWidth, height: config.winHeight, webPreferences: { nodeIntegration: true }}
    if (!config.windowed) {
      for (const disp of screen.getAllDisplays()) {
        if (disp.id == config.screen) {
          c.width = disp.bounds.width
          c.height = disp.bounds.height
        }
      }
    }
    showTestCardWindow(c) 
    log.info('Creating dummy test card window to capture image')
    // once shown it will make the image, and once that's made the window will be closed. 
  }
  
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
          controlWindow.webContents.send('exportCardCompleted', 'Could Not Write File')
        } else {
          log.info('PNG saved to: ', path)
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

ipcMain.on('setAsWallpaper', (event, arg) => {
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
      await wallpaper.set(dest);
      log.info('Setting png as wallpaper')
      controlWindow.webContents.send('exportCardCompleted')
      })();
    })
    if (!config.visible) {
      log.info('Closing dummy test card window')
      testCardWindow.close()
    }
  })
  
ipcMain.on('resetDefault', (event, arg) => {
  controlWindow.webContents.send('config', getDefaultConfig())
  log.info('Resetting to default')
})

function getDefaultConfig() {
  let defaultConfig = require('./defaultConfig.json')
  defaultConfig.name = require('os').hostname().split('.')[0].replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2").replace(/-|_|\.|\||\+|=|~|<|>|\/|\\/g, ' ')
  defaultConfig.screen = screen.getPrimaryDisplay().id
  return defaultConfig
}

function manageTestCardWindow() {
  let displays = screen.getAllDisplays()
  
  let windowConfig = {
    show: false,
    width: config.winWidth,
    height: config.winHeight,
    frame: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
     } 
  }  

  if (testCardWindow == null && config.visible) {
    log.info('Showing test card with config: ', config)  
    
    if (!config.windowed) {
      windowConfig.fullscreen = true
      
      for (const disp of displays) {
        if (disp.id == config.screen) {

           // Check and manage for seperate spaces configurations
           if (process.platform == 'darwin') {
          	let catalina = (process.getSystemVersion().split('.')[1] >= 15) ? true : false

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
      for (const disp of displays) {
        if (disp.id == config.screen) {
          windowConfig.x = disp.bounds.x + (disp.bounds.width - config.winWidth)/2
          windowConfig.y = disp.bounds.y + (disp.bounds.height - config.winHeight)/2
        }
      }
    }
    showTestCardWindow(windowConfig)
  } else if (testCardWindow != null && !config.visible) {
    log.info('Closing test card')
    testCardWindow.close()
  } else if (testCardWindow != null && config.visible && config.screen != testCardWindowScreen) {
    // a different screen as been selected..
    if (config.windowed) {
      for (const disp of displays) {
        if (disp.id == config.screen) {
          if (config.winWidth > disp.bounds.width) {
            config.winWidth = disp.bounds.width
            controlWindow.webContents.send('config', config)
          }
          if (config.winHeight > disp.bounds.height) {
            config.winHeight = disp.bounds.height
            controlWindow.webContents.send('config', config)
          }
          let newBounds = {
            x: Math.round(disp.bounds.x + (disp.bounds.width - config.winWidth)/2),
            y: Math.round(disp.bounds.y + (disp.bounds.height - config.winHeight)/2),
            width: config.winWidth,
            height: config.winHeight
          }
          console.log('Moving window to: ', newBounds)
          testCardWindow.setBounds(newBounds)
          testCardWindowScreen = disp.id
        }
      }
    } else {
      testCardWindow.close()
      setTimeout(manageTestCardWindow, 500)
    }  
  } else if (testCardWindow != null) {
    if (testCardWindow.isFullScreen() || testCardWindow.isSimpleFullScreen()) {
      if (config.windowed) {
        testCardWindow.close()
        setTimeout(manageTestCardWindow, 500)
      }
    } else if (!testCardWindow.isFullScreen() && !testCardWindow.isSimpleFullScreen()) {
      if (!config.windowed) {
        testCardWindow.close()
        setTimeout(manageTestCardWindow, 500) 
      }
    }
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
    if (config.visible) {
      testCardWindow.show()
    } else {
      console.log('A dummy test card is ready to turn into an image')
      testCardWindow.webContents.send('exportCard')
    }
  })

  testCardWindow.on('resize', function() {
    clearTimeout(testCardWindowResizeTimer)
    testCardWindowResizeTimer = setTimeout(handleTestCardResize, 500)
  })

  testCardWindow.on('move', function() {
    let x = testCardWindow.getBounds().x
    let y = testCardWindow.getBounds().y
    let displays = screen.getAllDisplays()

    for (const disp of displays) {
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