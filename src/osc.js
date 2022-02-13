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
            case '/animated', '/motion':
            this.config.animated = Boolean(data)
            break;
        
            case '/showInfo':
            this.config.showInfo = Boolean(data)
            break;
        
            case '/name':
            this.config.name = String(data)
            break;
        
            case '/cardType':
            this.config.cardType = String(data)
            break;

            default:
                log.warn('Unknown OSC Command received: ' + cmd + ' -- with data: ' + data)
                break;
        }

        this.emit('updateConfig', this.config)
    }
    
    updateConfig(c) {
        this.config = c
    }
}

module.exports = oscServer