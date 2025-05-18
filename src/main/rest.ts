import { dialog, ipcMain } from 'electron'
import express, { Express } from 'express'
import bodyParser from 'body-parser'
import log from 'electron-log'
import EventEmitter from 'events'
import { hostname } from 'os'
import { defu } from 'defu'

import type { Bonjour } from 'bonjour-service'
import type { Server } from 'http'
import type { Config } from './config'

export class RESTServer extends EventEmitter {
  config: Config = {}
  port = 8321

  _jsonParser = bodyParser.json()
  _app: Express | null = null
  _server: Server | null = null

  screens: Electron.Display[] = []
  audioDevices: unknown[] = []

  setup(bonjour: Bonjour) {
    this._app = express()

    this._server = this._app
      .listen(this.port, () => {
        log.info('REST :: HTTP Server running and listening on port ' + this.port)

        var p = require('../../package.json')

        bonjour.publish({
          name: 'Kards-' + hostname().split('.')[0],
          type: 'alteka_http',
          port: this.port,
          txt: {
            version: p.version,
            website: p.homepage,
            description: p.description
          }
        })

        bonjour.publish({
          name: 'Kards-' + hostname().split('.')[0],
          type: 'http',
          port: this.port,
          txt: {
            version: p.version,
            website: p.homepage,
            description: p.description
          }
        })
      })
      .on('error', function (err) {
        log.warn("Can't start up REST Server!", err)
        dialog.showErrorBox(
          'REST :: HTTP Server Error',
          'An error has occured starting the HTTP / REST API Server: ' + err
        )
      })

    ipcMain.on('audioDevices', (_, msg) => {
      this.audioDevices = msg
    })

    this._app.get('/screens', this._handleScreens.bind(this))
    this._app.get('/audioDevices', this._handleAudioDevices.bind(this))
    this._app.get('/*', this._handleGet.bind(this))
    this._app.put('/', this._jsonParser, this._handlePut.bind(this))
  }

  stop() {
    this._server?.close()
    log.info('Stopping Rest Server')
  }

  _handleGet(req, res) {
    const url = req.url.split('/')
    const c = JSON.parse(JSON.stringify(this.config))
    delete c.alteka.logo
    delete c.audio.textData
    delete c.audio.fileData
    delete c.audio.voiceData

    if (req.url == '/') {
      res.send(c)
    } else if (url.length == 2) {
      if (typeof c[url[1]] !== 'undefined') {
        res.send(c[url[1]])
      } else {
        res.send('Endpoint does not exist')
      }
    } else if (url.length == 3) {
      if (typeof c[url[1]][url[2]] !== 'undefined') {
        res.send(c[url[1]][url[2]])
      } else {
        res.send('Endpoint does not exist')
      }
    } else {
      res.send('Request mismatch')
    }
  }

  _handlePut(req, res) {
    if (Object.keys(req.body).length > 0) {
      const returnedTarget = defu(req.body, this.config) // TODO not sure if this is the right way round, double check
      this.emit('updateConfig', returnedTarget)

      delete returnedTarget.alteka.logo
      delete returnedTarget.audio.textData
      delete returnedTarget.audio.fileData
      delete returnedTarget.audio.voiceData
      res.send(returnedTarget)
    } else {
      res.send('Poorly formatted request')
    }
  }

  _handleScreens(_, res) {
    res.send(this.screens)
  }
  _handleAudioDevices(_, res) {
    res.send(this.audioDevices)
  }

  updateConfig(c: Config) {
    this.config = c
  }

  updateScreens(s: Electron.Display[]) {
    this.screens = s
  }
}
