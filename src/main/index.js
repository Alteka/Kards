import { app, BrowserWindow, ipcMain, webContents, nativeTheme, dialog, screen, TouchBar, Menu, MenuItem } from 'electron'
import { create } from 'domain';
const wallpaper = require('wallpaper');
const fs = require('fs')
const say = require('say')
const Store = require('electron-store')
const touchBar = require('./touchBar.js')
const menu = require('./menu.js').menu
const log = require('electron-log')

let env = require('./env.json')

const Nucleus = require('nucleus-nodejs')
Nucleus.init(env.nucleus)

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
  const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

  controlWindow = new BrowserWindow({
    show: false,
    height: 450,
    resizable: false,
    maximizable: false,
    useContentSize: true,
    width: 620,
    webPreferences: {
      nodeIntegration: true
     }
  })

  if (process.platform == 'darwin') {
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }

  if (env.nucleus == '') {
    dialog.showErrorBox('ERROR', 'You need to set nucleus environment variable')
  }
  Nucleus.appStarted()
  
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
  log.info('Loaded Config')
  updateScreens()
  createWindow()

  screen.on('display-added', function() {
    setTimeout(updateScreens(), 500)
  })
  screen.on('display-removed', function() {
    setTimeout(updateScreens(), 500)
  })
  screen.on('display-metrics-changed', function() {
    setTimeout(updateScreens(), 500)
  })
})


app.on('activate', () => {
  if (controlWindow === null) {
    createWindow()
  }
})

ipcMain.on('config', (event, arg) => {
  config = arg
  manageTestCardWindow()
  updateAnalytics()
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
  controlWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)
})

ipcMain.on('closeTestCard', (event, arg) => {
  controlWindow.webContents.send('closeTestCard')
})

ipcMain.on('controlResize', (event, w, h) => {
  controlWindow.setContentSize(620, h)
})


let headlessExportMode = false

ipcMain.on('exportCard', (event) => {
  if (testCardWindow != null) {
    testCardWindow.webContents.send('exportCard')
    Nucleus.track("Exported Card", { 
      type: config.export.target,
      mode: config.export.imageSource,
      width: testCardWindow.getBounds().width,
      height: testCardWindow.getBounds().height,
      windowed: config.windowed,
      cardType: config.cardType,
      headless: false
    })
  } else {
    headlessExportMode = true
    let c = {show: false, frame: false, width: config.winWidth, height: config.winHeight, webPreferences: { nodeIntegration: true }}
    if (!config.windowed) {
      for (const disp of screen.getAllDisplays()) {
        if (disp.id == config.screen) {
          console.log(disp.bounds)
          c.x = disp.bounds.x
          c.y = disp.bounds.y
          c.width = disp.bounds.width
          c.height = disp.bounds.height
        }
      }
    } 
    showTestCardWindow(c) 
    log.info('Creating dummy test card window to capture image')
    Nucleus.track("Exported Card", { 
      type: config.export.target,
      mode: config.export.imageSource,
      width: c.width,
      height: c.height,
      windowed: config.windowed,
      cardType: config.cardType,
      headless: true
    })
    // once shown it will make the image, and once that's made the window will be closed. 
  }
  
})


ipcMain.on('saveAsPNG', (event, arg) => {
  headlessExportMode = false
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
  Nucleus.track("Reset Defaults")
  log.info('Resetting to default')
})

function getDefaultConfig() {
  let defaultConfig = require('./defaultConfig.json')
  defaultConfig.name = require('os').hostname().split('.')[0].replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, "$1 $2").replace(/-|_|\.|\||\+|=|~|<|>|\/|\\/g, ' ')
  defaultConfig.screen = screen.getPrimaryDisplay().id
  return defaultConfig
}




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
}

function setupNewTestCardWindow() {
  let windowConfig = { show: false, frame: false,
    width: config.winWidth,
    height: config.winHeight,
    webPreferences: { nodeIntegration: true } 
  }  
    
  if (!config.windowed) { // Setting up for full screen test card
    windowConfig.fullscreen = true
    
    for (const disp of screen.getAllDisplays()) {
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
  } else { // need to set it up for windowed mode
    for (const disp of screen.getAllDisplays()) { // find display so window launches on selected screen.
      if (disp.id == config.screen) {
        windowConfig.x = disp.bounds.x + (disp.bounds.width - config.winWidth)/2
        windowConfig.y = disp.bounds.y + (disp.bounds.height - config.winHeight)/2

        // TODO - Check that the window isn't too big for the screen selected.
      }
    }
  }

  // All setup is finished, so lets show the window.
  showTestCardWindow(windowConfig)
  Nucleus.track("Output", { windowed: config.windowed, width: windowConfig.width, height: windowConfig.height  })
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
    reopenTestCard()
  }  
}


function showTestCardWindow(windowConfig) {
  log.info('Showing test card with config: ', windowConfig)  

  const testCardUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/#/testcard' : `file://${__dirname}/index.html#testcard`
  testCardWindow = new BrowserWindow(windowConfig)
  testCardWindowScreen = config.screen

  testCardWindow.on('close', function () { 
    testCardWindow = null 
  })

  if(config.windowed){
    testCardWindow.setBounds({
      width: config.winWidth, height: config.winHeight
    })
  }

  testCardWindow.loadURL(testCardUrl)

  testCardWindow.once('ready-to-show', () => {
    if (config.visible && !headlessExportMode) {
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
    let data = fs.readFileSync(result[0], { encoding: 'base64' })
    let mime = require('mime').getType(result[0])
    config.alteka.logo = 'data:' + mime + ';base64,' + data
    controlWindow.webContents.send('config', config)
  } else {
    log.info('No file selected')
  }
})

ipcMain.on('createVoice', (event, arg) => {
  let dest = app.getPath('userData') + '/voice.wav'  
  say.export(config.audio.prependText + config.name, null, null, dest, (err) => {
    if (err) {
      return console.error(err)
    }
    console.log('Updated name (' + config.name + ') has been saved to ', dest)
    config.audio.voiceData = 'data:audio/wav;base64,' + fs.readFileSync(dest, {encoding: 'base64'})
    controlWindow.webContents.send('config', config)
  })
})

let screens = []
let primaryScreen = {}

function updateScreens() {
  screens = screen.getAllDisplays()
  primaryScreen = screen.getPrimaryDisplay().id

  if (controlWindow != null) {
    controlWindow.webContents.send('screens', screens, primaryScreen)  
  }
}

ipcMain.on('getScreens', (event, arg) => {
  updateScreens()
})


let prevConfig = null
function updateAnalytics() {

  if (prevConfig !== null &&  config !== null) {
    if (config.cardType != prevConfig.cardType) {
      Nucleus.track("Card Type", { cardType: config.cardType })
    }

    if (config.audio.enabled && config.audio.enabled != prevConfig.audio.enabled) {
      Nucleus.track("Audio Output Enabled", { 'Selected Options': config.audio.options })
    }
  }

  prevConfig = config
}