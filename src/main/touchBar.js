const { app, BrowserWindow, TouchBar, nativeImage } = require('electron')
const { TouchBarLabel, TouchBarButton, TouchBarSpacer, TouchBarPopover } = TouchBar
const path = require('path')

let config = {}
let window = null

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

  const cardPopover = new TouchBarPopover({
      label: 'Card Type',
      items: [
        new TouchBarButton({
            label: 'Alteka',
            click: () => {
                config.cardType = 'alteka'
                window.webContents.send('config', config)
            }
          }),
          new TouchBarButton({
            label: 'SMPTE',
            click: () => {
                config.cardType = 'smpte'
                window.webContents.send('config', config)
            }
          }),
          new TouchBarButton({
            label: 'ARIB',
            click: () => {
                config.cardType = 'arib'
                window.webContents.send('config', config)
            }
          }),
          new TouchBarButton({
            label: 'Bars',
            click: () => {
                config.cardType = 'bars'
                window.webContents.send('config', config)
            }
          }),
          new TouchBarButton({
            label: 'Grid',
            click: () => {
                config.cardType = 'grid'
                window.webContents.send('config', config)
            }
          }),
          new TouchBarButton({
            label: 'Ramp',
            click: () => {
                config.cardType = 'ramp'
                window.webContents.send('config', config)
            }
          }),
          new TouchBarButton({
            label: 'Placeholder',
            click: () => {
                config.cardType = 'placeholder'
                window.webContents.send('config', config)
            }
          })
      ]
  })

  
  const touchBar = new TouchBar({
    items: [
      enableButton, motionButton, showInfoButton, cardPopover
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
