const express = require('express')
var bodyParser = require('body-parser')
const log = require('electron-log')
const EventEmitter = require('events')
var bonjour = require('bonjour')()

class restServer extends EventEmitter {
    constructor() {
        super()

        this.config = {}
        this.port = 8321

        this._app = null 

        this._jsonParser = bodyParser.json()
    }

    setup() {
        this._app = express()

        this._app.listen(this.port, () => {
            log.info('REST HTTP Server running and listening on port ' + this.port)

            var p = require('../package.json')

            bonjour.publish({ 
                name: 'Kards',
                type: 'alteka_http',
                port: this.port,
                txt: {
                    version: p.version,
                    website: p.homepage,
                    description: p.description
                }
            })

            bonjour.publish({ 
                name: 'Kards',
                type: 'http',
                port: this.port,
                txt: {
                    version: p.version,
                    website: p.homepage,
                    description: p.description
                }
            })
        })

        this._app.get('/*', this._handleGet.bind(this))
        this._app.put('/', this._jsonParser, this._handlePut.bind(this))
    }

    _handleGet(req, res) {
        let url = req.url.split('/')
        if (req.url == '/') {
            let c = JSON.parse(JSON.stringify(this.config))
            delete c.alteka.logo
            delete c.audio.textData
            delete c.audio.fileData
            delete c.audio.voiceData

            res.send(c)
        } else if (url.length == 2) {
            if (typeof this.config[url[1]] !== "undefined") {
                res.send(this.config[url[1]])
            } else {
                res.send('Endpoint does not exist')
            }
        } else if (url.length == 3) {
            if (typeof this.config[url[1]][url[2]] !== "undefined") {
                res.send(this.config[url[1]][url[2]])
            } else {
                res.send('Endpoint does not exist')
            }
        } else {
            res.send('Request mismatch')
        }
    }

    _handlePut(req, res) {
        log.debug(req.body)
        if (Object.keys(req.body).length > 0) {
            const returnedTarget = Object.assign(this.config, req.body)
            this.emit('updateConfig', returnedTarget)
            res.send(returnedTarget)
        } else {
            res.send('Poorly formatted request')
        }
    }
    
    updateConfig(c) {
        this.config = c
    }
}

module.exports = restServer