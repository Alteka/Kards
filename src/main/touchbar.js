import {TouchBar} from "electron";

const {TouchBarButton} = TouchBar

let config = {}
let window = null

const enableButton = new TouchBarButton({
  label: config.visible ? 'Disable Card' : 'Enable Card',
  click: () => {
    config.visible = !config.visible
    window.webContents.send('config', config)
  }
})

const motionButton = new TouchBarButton({
  label: 'Motion',
  click: () => {
    config.animated = !config.animated
    window.webContents.send('config', config)
  }
})

const showInfoButton = new TouchBarButton({
  label: 'Show Info',
  click: () => {
    config.showInfo = !config.showInfo
    window.webContents.send('config', config)
  }
})

const windowedButton = new TouchBarButton({
  label: 'Windowed',
  click: () => {
    config.windowed = !config.windowed
    window.webContents.send('config', config)
  }
})

export const touchBar = new TouchBar({
  items: [
    enableButton, showInfoButton, motionButton, windowedButton
  ]
})

export function setTouchbarConfig(c) {
  config = c

  enableButton.label = config.visible ? 'Disable Card' : 'Enable Card'
  motionButton.label = config.animated ? 'Disable Motion' : 'Enable Motion'
  showInfoButton.label = config.showInfo ? 'Hide Info' : 'Show Info'
  windowedButton.label = config.windowed ? 'Disable Windowed' : 'Enable Windowed'
}

export function setTouchbarWindow(w) {
  window = w
}
