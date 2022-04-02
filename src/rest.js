const { ipcMain } = require('electron')
const express = require('express')
var bodyParser = require('body-parser')
const log = require('electron-log')
const EventEmitter = require('events')
var bonjour = require('bonjour')()
const { hostname } = require('os')

class restServer extends EventEmitter {
    constructor() {
        super()

        this.config = {}
        this.port = 8321

        this._app = null 

        this.screens = []
        this.audioDevices = []

        this._jsonParser = bodyParser.json()
    }

    setup() {
        this._app = express()

        this._app.listen(this.port, () => {
            log.info('REST HTTP Server running and listening on port ' + this.port)

            var p = require('../package.json')

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

        ipcMain.on('audioDevices', (_, msg) => {
            this.audioDevices = msg
        })

        this._app.get('/screens', this._handleScreens.bind(this))
        this._app.get('/audioDevices', this._handleAudioDevices.bind(this))
        this._app.get('/*', this._handleGet.bind(this))
        this._app.put('/', this._jsonParser, this._handlePut.bind(this))
    }

    _handleGet(req, res) {
        let url = req.url.split('/')
        let c = JSON.parse(JSON.stringify(this.config))
        delete c.alteka.logo
        delete c.audio.textData
        delete c.audio.fileData
        delete c.audio.voiceData

        if (req.url == '/') {
            res.send(c)
        } else if (url.length == 2) {
            if (typeof c[url[1]] !== "undefined") {
                res.send(c[url[1]])
            } else {
                res.send('Endpoint does not exist')
            }
        } else if (url.length == 3) {
            if (typeof c[url[1]][url[2]] !== "undefined") {
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
            const returnedTarget = this.mergeDeep(this.config, req.body)
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
    
    updateConfig(c) {
        this.config = c
    }

    updateScreens(s) {
        this.screens = s
      }

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
  
    mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
  
        if (this.isObject(target) && this.isObject(source)) {
        for (const key in source) {
            if (this.isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return this.mergeDeep(target, ...sources);
    }
}

export default restServer