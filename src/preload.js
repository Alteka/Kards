console.log('Preload.js Loaded')

import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => {
    // whitelist channels
    // let validChannels = ['controlResize', 'getConfig', 'showMode', 'configMode', 'openLogs']
    // if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    // }
  },
  receive: (channel, func) => {
    // let validChannels = ['darkMode', 'config', 'appControls', 'networkInfo', 'vtStatus', 'obsStatus', 'timer', 'percentage', 'warning', 'cueName']
    // if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    // }
  }
})