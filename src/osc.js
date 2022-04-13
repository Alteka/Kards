const { ipcMain } = require('electron')
const OSC = require('osc-js')
const log = require('electron-log')
const EventEmitter = require('events')
var bonjour = require('bonjour')()
const { hostname } = require('os')

class oscServer extends EventEmitter {
    constructor() {
        super()

        this.config ={}
        this.port = 25518
        this.portReplies = 25519

        this.screens = []
        this.audioDevices = []

        this._server = null 
    }

    setup() {
        log.info("OSC :: Starting Server on port " + this.port)

        ipcMain.on('audioDevices', (_, msg) => {
            this.audioDevices = msg
        })

        this._server = new OSC({
            plugin: new OSC.DatagramPlugin({
                type: 'udp4',         // @param {string} 'udp4' or 'udp6'
                open: {
                    port: this.port,          // @param {number} Port of udp server to bind to
                    exclusive: false      // @param {boolean} Exclusive flag
                },
                send: {
                    port: this.portReplies           // @param {number} Port of udp client for messaging
                }
            })
        })
        this._server.open()

        this._server.on('*', message => {
            if (message.args.length > 0) {
                log.info("OSC Received :: " + message.address + " with argument: " + message.args[0])
            } else {
                log.info("OSC Received :: " + message.address)
            }
        })

        // Special endpoints
        this._server.on('/get/audioDevices', message => {
            this._reply(message.address, JSON.stringify(this.audioDevices))
        })
        this._server.on('/get/screens', message => {
            this._reply(message.address, JSON.stringify(this.screens))
        })
        this._server.on('/get/config', message => {
            let c = JSON.parse(JSON.stringify(this.config))
            delete c.alteka.logo
            delete c.audio.textData
            delete c.audio.fileData
            delete c.audio.voiceData
            this._reply(message.address, JSON.stringify(c))
        })

        this._server.on('/animated', message => {
            if (message.args.length > 0) {
                this.config.animated = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.animated)
        })

        this._server.on('/cardType', message => {
            if (message.args.length > 0) {
                this.config.cardType = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.cardType)
        })

        this._server.on('/showInfo', message => {
            if (message.args.length > 0) {
                this.config.showInfo = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.showInfo)
        })

        this._server.on('/name', message => {
            if (message.args.length > 0) {
                this.config.name = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.name)
        })

        this._server.on('/visible', message => {
            if (message.args.length > 0) {
                this.config.visible = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.visible)
        })

        this._server.on('/showInfo', message => {
            if (message.args.length > 0) {
                this.config.showInfo = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.showInfo)
        })

        this._server.on('/windowed', message => {
            if (message.args.length > 0) {
                this.config.windowed = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.windowed)
        })

        this._server.on('/fullsize', message => {
            if (message.args.length > 0) {
                this.config.fullsize = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.fullsize)
        })

        this._server.on('/screen', message => {
            if (message.args.length > 0) {
                this.config.screen = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.screen)
        })

        // Not filled Card endpoints
        this._server.on('/notFilledCard/width', message => {
            if (message.args.length > 0) {
                this.config.notFilledCard.width = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.notFilledCard.width)
        })
        this._server.on('/notFilledCard/height', message => {
            if (message.args.length > 0) {
                this.config.notFilledCard.height = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.notFilledCard.height)
        })
        this._server.on('/notFilledCard/top', message => {
            if (message.args.length > 0) {
                this.config.notFilledCard.top = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.notFilledCard.top)
        })
        this._server.on('/notFilledCard/left', message => {
            if (message.args.length > 0) {
                this.config.notFilledCard.left = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.notFilledCard.left)
        })
        this._server.on('/notFilledCard/bounds', message => {
            if (message.args.length > 0) {
                this.config.notFilledCard.bounds = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.notFilledCard.bounds)
        })
        
        // window endpoints
        this._server.on('/window/width', message => {
            if (message.args.length > 0) {
                this.config.window.width = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.window.width)
        })
        this._server.on('/window/height', message => {
            if (message.args.length > 0) {
                this.config.window.height = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.window.height)
        })

        // Placeholder Endpoints
        this._server.on('/placeholder/bg', message => {
            if (message.args.length > 0) {
                this.config.placeholder.bg = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.placeholder.bg)
        })
        this._server.on('/placeholder/fg', message => {
            if (message.args.length > 0) {
                this.config.placeholder.fg = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.placeholder.fg)
        })
        this._server.on('/placeholder/gradient', message => {
            if (message.args.length > 0) {
                this.config.placeholder.gradient = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.placeholder.gradient)
        })
        this._server.on('/placeholder/icon', message => {
            if (message.args.length > 0) {
                this.config.placeholder.icon = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.placeholder.icon)
        })
        this._server.on('/placeholder/icon', message => {
            if (message.args.length > 0) {
                this.config.placeholder.icon = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.placeholder.icon)
        })
        this._server.on('/placeholder/custom', message => {
            if (message.args.length > 0) {
                this.config.placeholder.custom = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.placeholder.custom)
        })
        
        // Bars endpoints
        this._server.on('/bars/type', message => {
            if (message.args.length > 0) {
                this.config.bars.type = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.bars.type)
        })
        this._server.on('/bars/overlay', message => {
            if (message.args.length > 0) {
                this.config.bars.overlay = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.bars.overlay)
        })
        this._server.on('/bars/level', message => {
            if (message.args.length > 0) {
                this.config.bars.level = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.bars.level)
        })

        // grid endpoints
        this._server.on('/grid/bg', message => {
            if (message.args.length > 0) {
                this.config.grid.bg = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.grid.bg)
        })
        this._server.on('/grid/crosshair', message => {
            if (message.args.length > 0) {
                this.config.grid.crosshair = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.grid.crosshair)
        })
        this._server.on('/grid/lines', message => {
            if (message.args.length > 0) {
                this.config.grid.lines = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.grid.lines)
        })
        this._server.on('/grid/size', message => {
            if (message.args.length > 0) {
                this.config.grid.size = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.grid.size)
        })
        this._server.on('/grid/circles', message => {
            if (message.args.length > 0) {
                this.config.grid.circles = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.grid.circles)
        })

        // led endpoints
        this._server.on('/led/width', message => {
            if (message.args.length > 0) {
                this.config.led.width = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.led.width)
        })
        this._server.on('/led/height', message => {
            if (message.args.length > 0) {
                this.config.led.height = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.led.height)
        })
        this._server.on('/led/rows', message => {
            if (message.args.length > 0) {
                this.config.led.rows = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.led.rows)
        })
        this._server.on('/led/columns', message => {
            if (message.args.length > 0) {
                this.config.led.columns = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.led.columns)
        })

        // audioSync endpoints
        this._server.on('/audioSync/deviceId', message => {
            if (message.args.length > 0) {
                this.config.audioSync.deviceId = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.audioSync.deviceId)
        })
        this._server.on('/audioSync/rate', message => {
            if (message.args.length > 0) {
                this.config.audioSync.rate = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.audioSync.rate)
        })

        // alteka endpoints
        this._server.on('/alteka/showLogo', message => {
            if (message.args.length > 0) {
                this.config.alteka.showLogo = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.alteka.showLogo)
        })
        this._server.on('/alteka/bg', message => {
            if (message.args.length > 0) {
                this.config.alteka.bg = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.alteka.bg)
        })
        this._server.on('/alteka/fg', message => {
            if (message.args.length > 0) {
                this.config.alteka.fg = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.alteka.fg)
        })
        this._server.on('/alteka/textColour', message => {
            if (message.args.length > 0) {
                this.config.alteka.textColour = "#" + String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.alteka.textColour)
        })
        this._server.on('/alteka/gradient', message => {
            if (message.args.length > 0) {
                this.config.alteka.gradient = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.alteka.gradient)
        })

        // ramp endpoints
        this._server.on('/ramp/direction', message => {
            if (message.args.length > 0) {
                this.config.ramp.direction = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.ramp.direction)
        })
        this._server.on('/ramp/reverse', message => {
            if (message.args.length > 0) {
                this.config.ramp.reverse = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.ramp.reverse)
        })
        this._server.on('/ramp/stepped', message => {
            if (message.args.length > 0) {
                this.config.ramp.stepped = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.ramp.stepped)
        })
        this._server.on('/ramp/double', message => {
            if (message.args.length > 0) {
                this.config.ramp.double = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.ramp.double)
        })

        // deghost endpoints
        this._server.on('/deghost/density', message => {
            if (message.args.length > 0) {
                this.config.deghost.density = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.deghost.density)
        })
        this._server.on('/deghost/speed', message => {
            if (message.args.length > 0) {
                this.config.deghost.speed = Number(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.deghost.speed)
        })

        // audio endpoints
        this._server.on('/audio/deviceId', message => {
            if (message.args.length > 0) {
                this.config.audio.deviceId = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.audio.deviceId)
        })
        this._server.on('/audio/enabled', message => {
            if (message.args.length > 0) {
                this.config.audio.enabled = Boolean(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.audio.enabled)
        })
        this._server.on('/audio/options', message => {
            this._reply(message.address, JSON.stringify(this.config.audio.options))
        })
        this._server.on('/audio/options/add', message => {
            if (message.args.length > 0) {
                if (!this.config.audio.options.includes(String(message.args[0]))) {
                    this.config.audio.options.push(String(message.args[0]))
                }
                this._update()
            } 
            this._reply(message.address, JSON.stringify(this.config.audio.options))
        })
        this._server.on('/audio/options/remove', message => {
            if (message.args.length > 0) {
                const index = this.config.audio.options.indexOf(String(message.args[0]))
                if (index > -1) {
                    this.config.audio.options.splice(index, 1)
                }
                this._update()
            } 
            this._reply(message.address, JSON.stringify(this.config.audio.options))
        })
        this._server.on('/audio/options/empty', message => {
            this.config.audio.options = []
            this._update()
            this._reply(message.address, JSON.stringify(this.config.audio.options))
        })
        this._server.on('/audio/prependText', message => {
            if (message.args.length > 0) {
                this.config.audio.prependText = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.audio.prependText)
        })
        this._server.on('/audio/text', message => {
            if (message.args.length > 0) {
                this.config.audio.text = String(message.args[0])
                this._update()
            } 
            this._reply(message.address, this.config.audio.text)
        })
        this._server.on('/audio/file', message => {
            if (message.args.length > 0) {
                this.emit('audioFile', String(message.args[0]))
            } 
            this._reply(message.address, this.config.audio.deviceId)
        })


        var p = require('../package.json')

        bonjour.publish({ 
            name: 'Kards-' + hostname().split('.')[0],
            type: 'alteka_osc',
            port: this.port,
            txt: {
                version: p.version,
                website: p.homepage,
                description: p.description
            }
        })
    }

    _reply(addr, data) {
        log.info("OSC Reply :: " + addr + " with data: " + data)
        this._server.send(new OSC.Message(addr, data))
    }
    _update() {
        this.emit('updateConfig', this.config)
    }
    
    updateConfig(c) {
        this.config = c
    }

    updateScreens(s) {
        this.screens = s
    }
}

export default oscServer