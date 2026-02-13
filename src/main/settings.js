'use strict'

/**
 * Import/export of Kards settings.
 *
 * Wires:
 * - IPC: exportSettings, importSettings
 * - Menu events: controlMenu.on('exportSettings' / 'importSettings')
 *
 * Uses `getConfig` to read the current config and mutates it in place on import.
 */

module.exports = function initSettings(ipcMain, controlMenu, state, deps) {
  const {
    dialog,
    fs,
    log,
    version,
    getConfig,
    audio
  } = deps

  function exportSettings() {
    const config = getConfig()
    if (!config) return

    dialog.showSaveDialog({
      title: 'Export Settings',
      buttonLabel: 'Export',
      defaultPath: 'KardsSettings.json',
      filters: [{ extensions: ['json'] }]
    }).then(result => {
      if (!result.canceled) {
        let path = result.filePath
        let cfg = { ...config }
        cfg.audio = { ...config.audio, voiceData: '', textData: '' } // clear audio blobs
        cfg.createdBy = 'Kards'
        cfg.exportedVersion = version

        let data = JSON.stringify(cfg, null, 2)

        fs.writeFile(path, data, function (err) {
          if (err) {
            dialog.showErrorBox('Error Saving File', JSON.stringify(err))
            log.error('Couldnt save file: ', err)
          }
        })
      } else {
        log.info('Save dialog closed')
      }
    })
  }

  function importSettings() {
    const config = getConfig()
    if (!config) return

    let result = dialog.showOpenDialogSync({
      title: "Import Settings",
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json', 'JSON'] }]
    })
    if (result != null) {
      fs.readFile(result[0], (err, data) => {
        if (err) throw err;
        let d = JSON.parse(data)
        let count = 0

        if (d.createdBy == 'Kards') {
          if (d.exportedVersion == version) {
            for (let key in config) {
              if (d[key] != undefined && key != 'visible' && key != 'exportedVersion' && key != 'createdBy' && typeof d[key] === typeof config[key]) {
                config[key] = d[key]
                count++
              }
            }
            audio.createVoice() // recreate voice data after importing settings.
            audio.createTextAudio()
            if (state.controlWindow) {
              state.controlWindow.webContents.send('config', config)
              state.controlWindow.webContents.send('importSettings', 'Imported ' + count + ' settings')
            }
          } else {
            if (state.controlWindow) {
              state.controlWindow.webContents.send('importSettings', 'Skipping - The file is from a different version of Kards')
            }
          }
        } else {
          if (state.controlWindow) {
            state.controlWindow.webContents.send('importSettings', 'Failed - That file was not made by Kards')
          }
        }
      })
    } else {
      log.info('No file selected')
    }
  }

  // IPC wiring
  ipcMain.on('exportSettings', () => {
    exportSettings()
  })

  ipcMain.on('importSettings', () => {
    importSettings()
  })

  // Menu wiring
  controlMenu.on('importSettings', () => {
    importSettings()
  })

  controlMenu.on('exportSettings', () => {
    exportSettings()
  })
}

