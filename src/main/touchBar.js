const { app, BrowserWindow, TouchBar, nativeImage } = require('electron')
const { TouchBarLabel, TouchBarButton, TouchBarSpacer, TouchBarPopover } = TouchBar
const path = require('path')

let config = {}
let window = null

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const enabled = nativeImage.createFromPath(path.join(__static, '/enabled.png')).resize({ width: 20, height: 10})
const disabled = nativeImage.createFromPath(path.join(__static, '/disabled.png')).resize({ width: 20, height: 10})


const enableButton = new TouchBarButton({
    label: 'Card',
    icon: disabled,
    iconPosition: 'left',
    click: () => {
        config.visible = !config.visible
        window.webContents.send('config', config)
    }
  })

  const motionButton = new TouchBarButton({
    label: 'Motion',
    icon: disabled,
    iconPosition: 'left',
    click: () => {
        config.animated = !config.animated
        window.webContents.send('config', config)
    }
  })

  const showInfoButton = new TouchBarButton({
    label: 'Show Info',
    icon: disabled,
    iconPosition: 'left',
    click: () => {
        config.showInfo = !config.showInfo
        window.webContents.send('config', config)
    }
  })

  
  const touchBar = new TouchBar({
    items: [
      enableButton, showInfoButton, motionButton
    ]
  })

  function setConfig(c) {  
    config = c
    
    enableButton.icon = config.visible ? enabled : disabled
    motionButton.icon = config.animated ? enabled : disabled
    showInfoButton.icon = config.showInfo ? enabled : disabled


  }


function setWindow(w) {
    window = w
}

exports.setWindow = setWindow
exports.setConfig = setConfig
exports.touchBar = touchBar
