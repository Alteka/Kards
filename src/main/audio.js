'use strict'

/**
 * Audio and text-to-speech handling for the Electron main process.
 *
 * Wires IPC handlers:
 * - createVoice
 * - updateAudioText
 * - loadAudioFile
 *
 * Uses a `getConfig` callback so it always sees the latest config object.
 * Mutates the config in place and notifies the control window via `state.controlWindow`.
 */

module.exports = function initAudio(ipcMain, state, deps) {
  const {
    app,
    dialog,
    fs,
    say,
    log,
    getConfig
  } = deps

  function resetAudio() {
    setTimeout(createVoice, 5000)
    setTimeout(createTextAudio, 5000)
  }

  let lastCreatedVoice = ''

  function createVoice() {
    const config = getConfig()
    if (!config) return

    let dest = app.getPath('userData') + '/voice.wav'
    let voice = config.audio.prependText + config.name

    say.export(voice, null, null, dest, (err) => {
      if (err) {
        return log.error(err)
      }
      log.info('Audio :: Updated name (' + config.name + ') has been saved to ', dest)
      config.audio.voiceData = 'data:audio/wav;base64,' + fs.readFileSync(dest, { encoding: 'base64' })
      if (state.controlWindow) {
        state.controlWindow.webContents.send('config', config)
      }
    })
  }

  function createTextAudio() {
    const config = getConfig()
    if (!config) return

    let dest = app.getPath('userData') + '/text.wav'
    say.export(config.audio.text, null, null, dest, (err) => {
      if (err) {
        return log.error(err)
      }
      log.info('Audio :: Updated audio text (' + config.audio.text + ') has been saved to ', dest)
      config.audio.textData = 'data:audio/wav;base64,' + fs.readFileSync(dest, { encoding: 'base64' })
      if (state.controlWindow) {
        state.controlWindow.webContents.send('config', config)
      }
    })
  }

  let textToSpeechCount = 0
  function textToSpeachData(text) {
    const config = getConfig()
    if (!config) return ''

    let dest = app.getPath('userData') + '/tts0' + textToSpeechCount + '.wav'
    textToSpeechCount++
    say.export(config.audio.text, null, null, dest, (err) => {
      if (err) {
        log.error(err)
        return ''
      }
      return 'data:audio/wav;base64,' + fs.readFileSync(dest, { encoding: 'base64' })
    })
  }

  function loadAudioFile() {
    const config = getConfig()
    if (!config || !state.controlWindow) return

    dialog.showOpenDialog(state.controlWindow, {
      title: 'Open Audio File',
      filters: [{ name: "Audio", extensions: ['wav', 'mp3', 'ogg', 'aac'] }]
    }).then(result => {
      if (!result.canceled) {
        let path = result.filePaths[0]
        config.audio.fileData = 'data:audio/' + path.split('.').pop() + ';base64,' + fs.readFileSync(path, { encoding: 'base64' })
        config.audio.fileName = 'Opened ' + path
        if (state.controlWindow) {
          state.controlWindow.webContents.send('config', config)
        }
        log.info('Audio :: Audio file imported - ' + path)
      } else {
        log.info('Audio :: Save dialog closed')
      }
    })
  }

  // IPC wiring
  ipcMain.on('createVoice', () => {
    createVoice()
  })
  ipcMain.on('updateAudioText', () => {
    createTextAudio()
  })
  ipcMain.on('loadAudioFile', () => {
    loadAudioFile()
  })

  return {
    resetAudio,
    createVoice,
    createTextAudio,
    loadAudioFile
  }
}

