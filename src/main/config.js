'use strict'

const { screen } = require('electron')
const { hostname } = require('os')

const defaultConfigJson = require('../defaultConfig.json')

let _config = null

function getDefaultConfig() {
  const defaultConfig = JSON.parse(JSON.stringify(defaultConfigJson))
  defaultConfig.name = hostname()
    .split('.')[0]
    .replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2')
    .replace(/-|_|\.|\||\+|=|~|<|>|\/|\\/g, ' ')
  defaultConfig.screen = screen.getPrimaryDisplay().id
  return defaultConfig
}

function getConfig() {
  return _config
}

function setConfig(c) {
  _config = c
}

function initConfig(store) {
  _config = {
    ...getDefaultConfig(),
    ...store.get('KardsConfig', getDefaultConfig())
  }
  _config.visible = false
  _config.audio.enabled = false
  return _config
}

function persist(store) {
  if (_config) {
    store.set('KardsConfig', _config)
  }
}

module.exports = {
  getDefaultConfig,
  getConfig,
  setConfig,
  initConfig,
  persist
}
