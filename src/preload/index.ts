console.log('Preload.js Loaded')

import { contextBridge, ipcRenderer } from 'electron'

export const api = {
  aboutDialogInfo: () => ipcRenderer.invoke('aboutDialogInfo'),
  openUrl: (url: string) => ipcRenderer.send('openUrl', url),
  selectImage: () => ipcRenderer.send('selectImage'),
  audioDevices: (devices: MediaDeviceInfo[]) => ipcRenderer.send('audioDevices', devices)
}

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

contextBridge.exposeInMainWorld('api', api)
