import { app, BrowserWindow, ipcMain } from 'electron'


if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let testCardWindow


function createWindow () {
  const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => { mainWindow = null })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


function showTestCard() {
  if (testCardWindow == null) {
    console.log('showing test card!')
    const testCardUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:9080/#/testcard'
      : `file://${__dirname}/index.html#testcard`
    testCardWindow = new BrowserWindow({ width: 400, height: 320, webPreferences: {webSecurity: false} })
    testCardWindow.on('close', function () { testCardWindow = null })
    testCardWindow.loadURL(testCardUrl)
  } else {
    console.log('already showing window!')
  }
}
function closeTestCard() {
  if (testCardWindow != null) {
  console.log('closing test card')
  testCardWindow.close()
  } else {
    console.log('test card window already closed!')
  }
}

ipcMain.on('command', (event, arg) => {
  switch(arg) {
    case 'openTestCard':
      showTestCard()
    break;
    case 'closeTestCard':
      closeTestCard()
    break;
    default:
      console.log('unknown command: ', arg)
    break;
  }
  
})