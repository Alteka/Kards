import type { IpcRenderer, ElectronAPI } from '@electron-toolkit/preload'
import { api } from './index'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
    api: typeof api
  }
}
