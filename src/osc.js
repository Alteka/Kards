const Server = require('node-osc').Server
const log = require('electron-log')
const EventEmitter = require('events')

class oscServer extends EventEmitter {
    constructor() {
        super()

        this.config ={}
        this.port = 25518

        this._server = null 
    }

    setup() {
        this._server = new Server(this.port, '0.0.0.0', () => {
            log.info("OSC Server has started on port " + this.port)
        })
        this._server.on('message', (msg) => {
            let cmd = msg[0]
            let data = msg[1]
            this._handleMessage(cmd, data)
        })
    }

    _handleMessage(cmd, data) {
        switch(cmd) {
            case '/animated':
            case '/motion':
                this.config.animated = Boolean(data)
                break;
        
            case '/cardType':
                this.config.cardType = String(data)
                break;
        
            case '/showInfo':
                this.config.showInfo = Boolean(data)
                break;
        
            case '/name':
                this.config.name = String(data)
                break;

            case '/visible':
            case '/enabled':
                this.config.visible = Boolean(data)
                break;

            case '/enable':
                this.config.visible = true
                break;
            
            case '/disable':
                this.config.visible = false
                break;
            
            case '/windowed':
                this.config.windowed = Boolean(data)
                break;

            case '/fullsize':
                this.config.fullsize = Boolean(data)
                break;

            case '/screen':
                this.config.screen = Number(data)
                break;

            case '/notFilledCard/width':
                this.config.notFilledCard.width = Number(data)
                break;

            case '/notFilledCard/height':
                this.config.notFilledCard.height = Number(data)
                break;

            case '/notFilledCard/top':
                this.config.notFilledCard.top = Number(data)
                break;

            case '/notFilledCard/left':
                this.config.notFilledCard.left = Number(data)
                break;

            case '/notFilledCard/bounds':
                this.config.notFilledCard.bounds = Boolean(data)
                break;

            case '/window/width':
                this.config.window.width = Number(data)
                break;

            case '/window/height':
                this.config.window.height = Number(data)
                break;

            
            // PLACEHOLDER ENDPOINTS
            case '/placeholder/bg':
            case '/placeholder/background':
            case '/name/bg':
            case '/name/background':
                this.config.placeholder.bg = "#" + String(data)
                break;

            case '/placeholder/fg':
            case '/placeholder/foreground':
            case '/name/fg':
            case '/name/foreground':
                this.config.placeholder.fg = "#" + String(data)
                break;

            case '/placeholder/gradient':
            case '/name/gradient':
                this.config.placeholder.gradient = Boolean(data)
                break;

            case '/placeholder/icon':
            case '/name/icon':
                this.config.placeholder.icon = String(data)
                break;

            case '/placeholder/custom':
            case '/name/custom':
                this.config.placeholder.custom = String(data)
                break;

            // Bars endpoints
            case '/bars/type':
                this.config.bars.type = String(data)
                break;

            case '/bars/overlay':
                this.config.bars.overlay = Boolean(data)
                break;

            case '/bars/level':
                this.config.bars.level = Number(data)
                break;

            // Grid endpoints
            case '/grid/bg':
            case '/grid/background':
                this.config.grid.bg = "#" + String(data)
                break;

            case '/grid/crosshair':
                this.config.grid.crosshair = "#" + String(data)
                break;

            case '/grid/lines':
                this.config.grid.lines = "#" + String(data)
                break;

            case '/grid/circles':
                this.config.grid.circles = Boolean(data)
                break;

            case '/grid/size':
                this.config.grid.size = Number(data)
                break;

            // led endpoints
            case '/led/width':
                this.config.led.width = Number(data)
                break;

            case '/led/height':
                this.config.led.height = Number(data)
                break;

            case '/led/rows':
                this.config.led.rows = Number(data)
                break;

            case '/led/columns':
                this.config.led.columns = Number(data)
                break;
                    
            // audio sync endpoints
            case '/audioSync/device':
                this.config.audioSync.deviceId = String(data)
                break;

            case '/audioSync/rate':
                this.config.audioSync.rate = Number(data)
                break;

            // Alteka Kard Endpoints
            case '/alteka/logo':
                this.config.alteka.logo = String(data)
                break;

            case '/alteka/showLogo':
                this.config.alteka.showLogo = Boolean(data)
                break;

            case '/alteka/bg':
            case '/alteka/background':
                this.config.alteka.bg = "#" + String(data)
                break;

            case '/alteka/fg':
            case '/alteka/foreground':
                this.config.alteka.fg = "#" + String(data)
                break;

            case '/alteka/text':
                this.config.alteka.textColour = "#" + String(data)
                break;

            case '/alteka/gradient':
                this.config.alteka.gradient = Boolean(data)
                break;

            // ramp endpoints
            case '/ramp/direction':
                this.config.ramp.direction = String(data)
                break;

            case '/ramp/reverse':
                this.config.ramp.reverse = Boolean(data)
                break;

            case '/ramp/stepped':
                this.config.ramp.stepped = Boolean(data)
                break;

            case '/ramp/double':
                this.config.ramp.double = Boolean(data)
                break;

            case '/ramp/overlay':
                this.config.ramp.overlay = Boolean(data)
                break;

            // deghost
            case '/deghost/density':
                this.config.deghost.density = Number(data)
                break;

            case '/deghost/speed':
                this.config.deghost.speed = Number(data)
                break;

            // export image settings
            // case '/exportImage/source':
            //     this.config.export.imageSource = String(data)
            //     break;
            
            // case '/exportImage/target':
            //     this.config.export.target = String(data)
            //     break;
            
            // case '/exportImage/toFile':
            //     this.emit('exportImageToFile', data)
            //     break;

            // case '/exportImage/toWallpaper':
            //     this.emit('exportImageToWallpaper')
            //     break;

            // audio settings 
            case '/audio/device':
            case '/audio/deviceId':
                this.config.audio.deviceId = String(data)
                break;
            
            case '/audio/enabled':
                this.config.audio.enabled = Boolean(data)
                break;
            
            case '/audio/options/add':
                if (!this.config.audio.options.includes(String(data))) {
                    this.config.audio.options.push(String(data))
                }
                break;
            
            case '/audio/options/remove':
                const index = this.config.audio.options.indexOf(String(data))
                if (index > -1) {
                    this.config.audio.options.splice(index, 1)
                }
                break;

            case '/audio/prependText':
                this.config.audio.prependText = String(data)
                break;
            
            case '/audio/text':
                this.config.audio.text = String(data)
                break;
            
            case '/audio/file':
                this.emit('audioFile', String(data))
                break;

            default:
                if (!cmd.includes('/predefineColors')) {
                    log.warn('Unknown OSC Command received: ' + cmd + ' -- with data: ' + data)
                } else {
                    let c = cmd.split('/')
                    if (c[1] == 'predefineColors') {
                        this.config.predefineColors[c[2]] = "#" + String(data)
                    }
                }
                break;
        }

        this.emit('updateConfig', this.config)
    }
    
    updateConfig(c) {
        this.config = c
    }
}

module.exports = oscServer