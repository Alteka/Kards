'use strict'

/**
 * Registers all main-process IPC handlers. Expects config to be initialised (initConfig called)
 * and state.createControlWindow / state.manageTestCardWindow / state.updateScreens to be set by initWindows.
 */
function initIpc(ipcMain, state, deps) {
  const {
    getConfig,
    setConfig,
    getDefaultConfig,
    persist,
    store,
    controlMenu,
    osc,
    rest,
    touchBar,
    nativeTheme,
    version,
    dialog,
    shell,
    fs,
    mime,
    networkInterfaces,
    hostname,
    log,
    audio
  } = deps

  function openLogs() {
    const logPath = log.transports.file.findLogPath()
    shell.showItemInFolder(logPath)
  }

  // ---- config ----
  ipcMain.on('config', (_, arg) => {
    setConfig(arg)
    persist(store)
    const config = getConfig()
    if (!config) return
    if (state.manageTestCardWindow) state.manageTestCardWindow()
    if (state.testCardWindow != null) {
      state.testCardWindow.webContents.send('config', config)
      if (config.windowed && config.window.width > 0) {
        state.testCardWindow.setContentSize(parseInt(config.window.width), parseInt(config.window.height))
      }
    }
    controlMenu.updateConfig(config)
    osc.updateConfig(config)
    rest.updateConfig(config)
    touchBar.setConfig(config)
    if (state.ndi && state.ndi.updateConfig) state.ndi.updateConfig(config)
    if (state.updateScreens) state.updateScreens()
  })

  ipcMain.on('getConfigTestCard', () => {
    const config = getConfig()
    if (state.testCardWindow && config) {
      state.testCardWindow.webContents.send('config', config)
    }
    if (state.ndi && state.ndi.updateConfig && config) state.ndi.updateConfig(config)
  })

  ipcMain.on('getConfigControl', () => {
    const config = getConfig()
    if (state.controlWindow && config) {
      state.controlWindow.webContents.send('config', config)
      state.controlWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)
    }
  })

  ipcMain.on('resetDefault', () => {
    if (state.controlWindow) {
      state.controlWindow.webContents.send('config', getDefaultConfig())
    }
    if (audio) audio.resetAudio()
  })

  // ---- dialogs / misc ----
  ipcMain.on('aboutDialogInfo', () => {
    const about = {
      version,
      electron: process.versions.electron,
      node: process.versions.node,
      vue: require('vue/package.json').version
    }
    if (state.controlWindow) {
      state.controlWindow.webContents.send('aboutDialogInfo', about)
    }
  })

  ipcMain.on('closeTestCard', () => {
    if (state.controlWindow) {
      state.controlWindow.webContents.send('closeTestCard')
    }
  })

  ipcMain.on('openLogs', () => openLogs())

  ipcMain.on('openUrl', (_, arg) => {
    shell.openExternal(arg)
    log.info('open url', arg)
  })

  ipcMain.on('selectMaskImage', () => {
    const config = getConfig()
    if (!config) return
    const result = dialog.showOpenDialogSync({
      title: 'Select Image',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg'] }]
    })
    if (result != null && result[0]) {
      const data = fs.readFileSync(result[0], { encoding: 'base64' })
      config.mask.imageSource = 'data:' + mime.lookup(result[0]) + ';base64,' + data
      config.mask.enabled = true
      if (state.controlWindow) {
        state.controlWindow.webContents.send('config', config)
      }
    } else {
      log.info('No file selected')
    }
  })

  ipcMain.on('networkInfo', () => {
    const nets = networkInterfaces()
    const results = ['Kards v' + version, hostname().split('.')[0]]
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          results.push(name + ': ' + net.address)
        }
      }
    }
    if (state.testCardWindow != null) {
      state.testCardWindow.webContents.send('networkInfo', results)
    }
  })

  ipcMain.handle('getNdiStatus', () => {
    if (state.ndi && state.ndi.getStatus) {
      return state.ndi.getStatus()
    }
    return { available: false, active: false }
  })

  ipcMain.on('startNdi', () => {
    if (state.ndi && state.ndi.start) state.ndi.start()
  })
}

module.exports = { initIpc }
