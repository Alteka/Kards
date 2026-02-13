'use strict'

const oscServer = require('./osc.js')
const restServer = require('./rest.js')

/**
 * Creates OSC and REST server instances and wires their events to the control window.
 * Caller is responsible for calling osc.setup() and rest.setup() in app.on('ready').
 */
function createServices(state, deps) {
  const { getConfig, fs, log } = deps

  const osc = new oscServer()
  const rest = new restServer()

  osc.on('updateConfig', (c) => {
    if (state.controlWindow) {
      state.controlWindow.webContents.send('config', c)
    }
  })

  osc.on('audioFile', (filePath) => {
    log.debug('Audio File!', filePath)
    const config = getConfig()
    if (!config) return
    if (fs.lstatSync(filePath).isFile()) {
      config.audio.fileData =
        'data:audio/' + filePath.split('.').pop() + ';base64,' + fs.readFileSync(filePath, { encoding: 'base64' })
      config.audio.fileName = 'Opened ' + filePath
      if (state.controlWindow) {
        state.controlWindow.webContents.send('config', config)
      }
    } else {
      log.warning('Selected audio file does not exist')
    }
  })

  rest.on('updateConfig', (c) => {
    if (state.controlWindow) {
      state.controlWindow.webContents.send('config', c)
    }
  })

  return { osc, rest }
}

module.exports = { createServices }
