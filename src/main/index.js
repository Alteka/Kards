import { app, BrowserWindow, ipcMain, webContents } from 'electron'


if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let controlWindow
let testCardWindow
let config

let testCardWindowScreen

function createWindow () {
  const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

  controlWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  controlWindow.loadURL(winURL)
  controlWindow.on('closed', () => { 
    if (testCardWindow != null) { testCardWindow.close() }
    
    app.quit()
   })
}

app.on('ready', createWindow)

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
})

ipcMain.on('getConfig', (event, arg) => {
  testCardWindow.webContents.send('config', config)
})

ipcMain.on('closeTestCard', (event, arg) => {
  controlWindow.webContents.send('closeTestCard')
})


function manageTestCardWindow() {
  if (testCardWindow == null && config.visible) {
    console.log('showing test card!')
    const testCardUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9080/#/testcard' : `file://${__dirname}/index.html#testcard`

    let fs = config.screen == 0 ? false : true

    testCardWindow = new BrowserWindow({
       width: 900,
       height: 600,
       fullscreen: fs,
       simpleFullscreen: fs,
       webPreferences: {
         webSecurity: false
        } 
      })
    testCardWindowScreen = config.screen
    testCardWindow.on('close', function () { 
      testCardWindow = null 
      controlWindow.webContents.send('closeTestCard')
    })
    testCardWindow.loadURL(testCardUrl)
  } else if (testCardWindow != null && !config.visible) {
    console.log('closing test card')
    testCardWindow.close()
  }

  if (testCardWindow != null && config.screen != testCardWindowScreen) {
    // window has been changed screen. Do something about it.
    console.log('moving test card... maybe...')
  }
}
