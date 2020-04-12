import { app, BrowserWindow, ipcMain, webContents, dialog } from 'electron'
const fs = require('fs')

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
    width: 1000,
    webPreferences: {
      webSecurity: false
     }
  })
  controlWindow.loadURL(winURL)
  controlWindow.on('closed', () => { 
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
   }
})