const { app, BrowserWindow, TouchBar } = require('electron')
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar


const enableButton = new TouchBarButton({
    label: 'Enable',
    click: () => {
      enableButton.label = "Disable"
    }
  })

  
  const touchBar = new TouchBar({
    items: [
      enableButton
    ]
  })


exports.touchBar = touchBar
