'use strict'

/**
 * Window and screen management for the Electron main process.
 *
 * This module is intentionally stateful. It receives a shared `state` object
 * from `background.js` which it mutates (e.g. `state.controlWindow`).
 *
 * The config object lives in `background.js`. Access it via the injected
 * `getConfig` function so this module always sees the latest config.
 *
 * Exports a single initializer:
 *
 *   initWindows(state, deps)
 *
 * which:
 * - wires up IPC handlers related to windows, screens, and export
 * - attaches helper functions onto `state`:
 *     - state.createControlWindow()
 *     - state.manageTestCardWindow()
 *     - state.updateScreens()
 */

module.exports = function initWindows(state, deps) {
  const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    screen,
    path,
    log,
    rest,
    touchBar,
    isDevelopment,
    mime,
    fs,
    wallpaper,
    controlMenu,
    osc,
    getConfig
  } = deps

  //==========================//
  //       WINDOW HANDLER     //
  //==========================//

  async function createControlWindow() {
    log.info('Showing control window')
    state.controlWindow = new BrowserWindow({
      width: 620,
      height: 450,
      show: false,
      useContentSize: true,
      maximizable: false,
      title: 'Kards',
      resizable: false,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        preload: path.join(__dirname, '..', 'preload.js')
      }
    })

    state.controlWindow.once('ready-to-show', () => {
      state.controlWindow.show()
    })

    state.controlWindow.on('closed', () => {
      log.info('Control Window closed - Quitting App')
      rest.stop()
      app.quit()
    })

    if (process.env.VITE_DEV_SERVER_URL) {
      await state.controlWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      if (!process.env.IS_TEST) state.controlWindow.webContents.openDevTools()
    } else {
      state.controlWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
    }

    state.controlWindow.setTouchBar(touchBar.touchBar)
    touchBar.setWindow(state.controlWindow)
  }

  ipcMain.on('controlResize', (_, data) => {
    if (state.controlWindow) {
      state.controlWindow.setContentSize(700, data.height)
    }
  })

  //========================//
  //   Screen Management    //
  //========================//

  let screens
  let primaryScreen

  function updateScreens() {
    const config = getConfig()

    screens = screen.getAllDisplays()
    primaryScreen = screen.getPrimaryDisplay().id

    // workaround for Electron's displayFrequency being rounded.
    for (const s in screens) {
      if (screens[s].displayFrequency == 59) {
        screens[s].displayFrequency = 59.94
      }
      if (screens[s].displayFrequency == 29) {
        screens[s].displayFrequency = 29.97
      }
      screens[s].displayFrequency = Math.round(screens[s].displayFrequency * 100) / 100 // force elegant rounding
    }

    if (state.controlWindow != null) {
      state.controlWindow.webContents.send('screens', { all: screens, primary: primaryScreen })
      controlMenu.updateScreens(screens)
      rest.updateScreens(screens)
      osc.updateScreens(screens)
    }
    if (state.testCardWindow != null && config) {
      for (const scr in screens) {
        if (screens[scr].id == config.screen) {
          state.testCardWindow.webContents.send('displayFrequency', screens[scr].displayFrequency)
        }
      }
    }
  }

  ipcMain.on('getScreens', () => {
    updateScreens()
  })

  app.on('ready', function () {
    updateScreens()

    screen.on('display-added', function () {
      setTimeout(updateScreens, 500)
    })
    screen.on('display-removed', function () {
      setTimeout(updateScreens, 500)
    })
    screen.on('display-metrics-changed', function () {
      setTimeout(updateScreens, 500)
    })
  })

  //==========================//
  //   Test Card Management   //
  //==========================//

  function manageTestCardWindow() {
    const config = getConfig()
    if (!config) return

    if (state.testCardWindow == null && config.visible) {
      // Test card doesn't exist, but now needs to
      setupNewTestCardWindow()
    } else if (state.testCardWindow != null && !config.visible && !state.headlessExportMode) {
      // A window exists and shouldn't so lets close it
      closeTestCard()
    } else if (state.testCardWindow != null && config.visible && config.screen != state.testCardWindowScreen) {
      // a different screen as been selected..
      moveTestCardToNewScreen()
    } else if (state.testCardWindow != null) {
      if (state.testCardWindow.isFullScreen() || state.testCardWindow.isSimpleFullScreen()) {
        if (config.windowed) {
          // A full screen test card now needs to be windowed - hard to handle elegantly so close and reopen
          reopenTestCard()
        }
      } else if (!state.testCardWindow.isFullScreen() && !state.testCardWindow.isSimpleFullScreen()) {
        if (!config.windowed) {
          // A windowed test card now needs to be full screen.
          reopenTestCard()
        }
      }
    }
    if (state.testCardWindow !== null && config.visible) {
      if (config.cardType == 'led' && config.windowed) {
        state.testCardWindow.resizable = false
      } else {
        state.testCardWindow.resizable = true
      }
    }
  }

  function setupNewTestCardWindow() {
    const config = getConfig()
    if (!config) return

    let windowConfig = {
      title: 'Kards - Output',
      show: false,
      frame: false,
      width: config.window.width,
      height: config.window.height,
      webPreferences: { preload: path.join(__dirname, '..', 'preload.js') }
    }

    if (!config.windowed) {
      // Setting up for full screen test card
      windowConfig.fullscreen = true

      for (const disp of screen.getAllDisplays()) {
        if (disp.id == config.screen) {
          if (process.platform == 'darwin') {
            // figure out if it's newer macos...
            let version = process.getSystemVersion().split('.')
            let catalina = false
            if (version[0] > 10) {
              catalina = true
            }
            if (version[0] == 10 && version[1] >= 15) {
              catalina = true
            }

            if (disp.bounds.height != disp.workArea.height && catalina) {
              log.info('Running in seperate spaces mode - this is Catalina or newer')
              windowConfig.simpleFullscreen = false
            } else if (!catalina) {
              log.info('Using legacy full screen mode as this is not Catalina (or newer)')
              windowConfig.simpleFullscreen = true
            } else {
              log.info('Using legacy full screen mode')
              windowConfig.simpleFullscreen = true
            }
          } else {
            log.info('Using windows full screen system. Easy.')
          }
          windowConfig.x = disp.bounds.x
          windowConfig.y = disp.bounds.y
          windowConfig.width = disp.bounds.width
          windowConfig.height = disp.bounds.height
        }
      }
    } else {
      windowConfig.roundedCorners = false
      for (const disp of screen.getAllDisplays()) {
        if (disp.id == config.screen) {
          windowConfig.x = disp.bounds.x + (disp.bounds.width - config.window.width) / 2
          windowConfig.y = disp.bounds.y + (disp.bounds.height - config.window.height) / 2
        }
      }
    }
    showTestCardWindow(windowConfig)
  }

  function closeTestCard() {
    log.info('Closing test card')
    if (state.testCardWindow) {
      state.testCardWindow.destroy()
    }
    state.testCardWindow = null
    state.testCardWindowScreen = null
    clearTimeout(state.testCardWindowResizeTimer)
  }

  function reopenTestCard() {
    const config = getConfig()
    if (!config) return

    closeTestCard()
    config.visible = true
    log.info('Setting timer to re-open test card')
    setTimeout(manageTestCardWindow, 500)
  }

  function moveTestCardToNewScreen() {
    const config = getConfig()
    if (!config) return

    if (config.windowed) {
      for (const disp of screen.getAllDisplays()) {
        if (disp.id == config.screen) {
          state.testCardWindowScreen = disp.id
        }
      }
    } else {
      reopenTestCard()
    }
  }

  ipcMain.on('moveWindowTo', (_, arg) => {
    const config = getConfig()
    if (!config || !state.testCardWindow) return

    log.info('Move active window to screen: ', arg)
    for (const disp of screen.getAllDisplays()) {
      if (disp.id == arg) {
        state.testCardWindowScreen = disp.id
        let x = disp.bounds.x + (disp.bounds.width - config.window.width) / 2
        let y = disp.bounds.y + (disp.bounds.height - config.window.height) / 2
        state.testCardWindow.setPosition(Math.round(x), Math.round(y))
      }
    }
  })

  function showTestCardWindow(windowConfig) {
    const config = getConfig()
    if (!config) return

    log.info('Showing test card with config: ', windowConfig)

    state.testCardWindow = new BrowserWindow(windowConfig)
    state.testCardWindowScreen = config.screen

    state.testCardWindow.on('close', function () {
      state.testCardWindow = null
    })

    if (config.windowed || state.headlessExportMode) {
      state.testCardWindow.setBounds({ width: windowConfig.width, height: windowConfig.height })
    }

    if (process.env.VITE_DEV_SERVER_URL) {
      state.testCardWindow.loadURL(process.env.VITE_DEV_SERVER_URL + '#/testcard')
      if (isDevelopment) state.testCardWindow.webContents.openDevTools()
    } else {
      const { pathToFileURL } = require('url')
      const fileUrl = pathToFileURL(path.join(__dirname, '..', '..', 'dist', 'index.html')).href
      state.testCardWindow.loadURL(fileUrl + '#/testcard')
    }

    state.testCardWindow.once('ready-to-show', () => {
      if (config.visible && !state.headlessExportMode && state.testCardWindow) {
        state.testCardWindow.show()
      }
    })

    state.testCardWindow.on('resize', function () {
      clearTimeout(state.testCardWindowResizeTimer)
      state.testCardWindowResizeTimer = setTimeout(handleTestCardResize, 500)
    })

    state.testCardWindow.on('move', function () {
      const config = getConfig()
      if (!config) return

      let x = state.testCardWindow.getBounds().x
      let y = state.testCardWindow.getBounds().y

      for (const disp of screen.getAllDisplays()) {
        if (
          x > disp.bounds.x &&
          x < disp.bounds.x + disp.bounds.width &&
          y > disp.bounds.y &&
          y < disp.bounds.y + disp.bounds.height
        ) {
          if (state.testCardWindowScreen != disp.id) {
            config.screen = disp.id
            if (state.controlWindow) {
              state.controlWindow.webContents.send('config', config)
            }
          }
        }
      }
    })
  }

  function handleTestCardResize() {
    const config = getConfig()
    if (!config) return

    if (state.testCardWindow != null) {
      let bounds = state.testCardWindow.getBounds()
      let t = 2
      if (
        config.window.width < bounds.width - t ||
        config.window.width > bounds.width + t ||
        config.window.height < bounds.height - t ||
        config.window.height > bounds.height + t ||
        process.platform == 'darwin'
      ) {
        config.window.width = bounds.width
        config.window.height = bounds.height
        if (state.controlWindow) {
          state.controlWindow.webContents.send('config', config)
        }
      }
    }
  }

  //========================//
  //   Export PNG Images    //
  //========================//

  ipcMain.on('testCardKeyPress', (_, msg) => {
    const config = getConfig()
    if (!config) return

    config[msg] = !config[msg]
    if (state.controlWindow) {
      state.controlWindow.webContents.send('config', config)
    }
    if (state.testCardWindow != null) {
      state.testCardWindow.webContents.send('config', config)
    }
  })

  ipcMain.on('exportCard', () => {
    const config = getConfig()
    if (!config) return

    if (state.testCardWindow != null) {
      state.testCardWindow.webContents.send('exportCard')
    } else {
      state.headlessExportMode = true
      let c = {
        show: false,
        frame: false,
        width: config.window.width,
        height: config.window.height,
        webPreferences: { preload: path.join(__dirname, '..', 'preload.js') }
      }

      if (config.windowed) {
        c.minWidth = config.window.width
        c.minHeight = config.window.height
      } else {
        for (const disp of screen.getAllDisplays()) {
          if (disp.id == config.screen) {
            c.width = disp.bounds.width
            c.height = disp.bounds.height
            c.minWidth = disp.bounds.width
            c.minHeight = disp.bounds.height
          }
        }
      }
      showTestCardWindow(c)
      log.info('Creating dummy test card window to capture image')
    }
  })

  ipcMain.on('selectImage', () => {
    const config = getConfig()
    if (!config) return

    let result = dialog.showOpenDialogSync({
      title: 'Select Image',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpeg', 'jpg', 'png', 'gif'] }]
    })
    if (result != null && result[0]) {
      let data = fs.readFileSync(result[0], { encoding: 'base64' })
      config.alteka.logo = 'data:' + mime.lookup(result[0]) + ';base64,' + data
      if (state.controlWindow) {
        state.controlWindow.webContents.send('config', config)
      }
    } else {
      log.info('No file selected')
    }
  })

  /**
   * End an export, however it ended.
   *
   * The control window puts up a fullscreen ElLoading mask when it sends
   * `exportCard` and only takes it down on `exportCardCompleted`, so any path
   * that fails to send this leaves the UI permanently masked — the user has to
   * restart the app. Every exit from an export must come through here.
   *
   * This also disposes of the hidden window created purely to render the card
   * for capture. Doing it here rather than synchronously alongside the save
   * means the failure paths clean it up too.
   */
  function finishExport(message) {
    const config = getConfig()
    if (config && !config.visible && state.testCardWindow !== null) {
      log.info('Closing dummy test card window')
      state.testCardWindow.close()
    }
    if (state.controlWindow) {
      state.controlWindow.webContents.send('exportCardCompleted', message)
    }
  }

  // The renderer does the capture, so a capture failure is only visible there.
  ipcMain.on('exportCardFailed', (_, message) => {
    log.error('Test card capture failed: ' + message)
    state.headlessExportMode = false
    finishExport('Could Not Capture Test Card')
  })

  ipcMain.on('saveAsPNG', (_, arg) => {
    const config = getConfig()
    if (!config) return

    state.headlessExportMode = false
    let suffix = config.cardType[0].toUpperCase() + config.cardType.slice(1)
    if (suffix == 'Placeholder') suffix = 'Name'
    if (suffix == 'Led') suffix = 'LED'
    var name = config.name.replace(/ /g, '-') + '-' + suffix + 'Kard.png'
    dialog
      .showSaveDialog(state.controlWindow, {
        title: 'Save PNG',
        defaultPath: name,
        filters: [{ name: 'Images', extensions: ['png'] }]
      })
      .then((result) => {
        if (!result.canceled) {
          var base64Data = arg.replace(/^data:image\/png;base64,/, '')
          fs.writeFile(result.filePath, base64Data, 'base64', function (err) {
            if (err) {
              dialog.showErrorBox('Error Saving File', JSON.stringify(err))
              log.error('Couldnt save file: ', err)
              finishExport('Could Not Write File')
            } else {
              finishExport()
            }
          })
        } else {
          log.info('Save dialog closed')
          finishExport('File Save Cancelled')
        }
      })
      .catch((err) => {
        log.error('Save dialog failed: ', err)
        finishExport('Could Not Save File')
      })
  })

  ipcMain.on('setAsWallpaper', (_, arg) => {
    const config = getConfig()
    if (!config) return

    state.headlessExportMode = false
    let dest = app.getPath('userData') + '/wallpaper' + Math.round(Math.random() * 100000) + '.png'
    var base64Data = arg.replace(/^data:image\/png;base64,/, '')
    fs.writeFile(dest, base64Data, 'base64', (err) => {
      if (err) {
        dialog.showErrorBox('Error Saving Wallpaper', JSON.stringify(err))
        log.error('Couldnt save wallpaper file ', err)
        finishExport('Could not write temporary file')
        return
      }
      wallpaper
        .set(dest)
        .then(() => finishExport())
        .catch((e) => {
          log.error('Couldnt set wallpaper ', e)
          finishExport('Could Not Set Wallpaper')
        })
    })
  })

  // Expose helpers back to the main module
  state.createControlWindow = createControlWindow
  state.manageTestCardWindow = manageTestCardWindow
  state.updateScreens = updateScreens
}
