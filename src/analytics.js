import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'
const Store = require('electron-store')
const { v4: uuidv4 } = require('uuid')
const log = require('electron-log')
const EventEmitter = require('events')

class altekaAnalytics extends EventEmitter {
    constructor() {
        super()

        this.trackingId = 'UA-183734846-4'
        this.appName = 'Kards'

        this.config = null
        this.prevConfig = null
        this._analyticsDebounce = null
        this._width = 0
        this._height = 0

        this._installId =  'notset'

        this._analytics = null // created in setup

        this._store = null // created in setup
    }

    setup() {
        this._store = new Store()

        this._analytics = Analytics({
            app: this.appName,
            version: 100,
            plugins: [
                googleAnalytics({
                trackingId: this.trackingId,
                tasks: {
                    checkProtocolTask: null,
                }
              })
            ]
        })

        if (!this._store.has('KardsInstallID-1.3')) {
            this._installId = uuidv4()
            log.info('Analytics :: First Runtime and created Install ID: ' + this._installId)
            this._store.set('KardsInstallID-1.3', this._installId)
        } else {
            this._installId = this._store.get('KardsInstallID-1.3')
            log.info('Analytics :: Install ID: ' + this._installId)
        }

        this._analytics.identify(this._store.get('KardsInstallID-1.3'), {
            firstName: 'Version',
            lastName: require('./../package.json').version
        }, () => {
            console.log('Analytics :: Install Version registered with google')
        })

        this._analytics.track('AppLaunched')

        this.emit('setup')
    }

    track(e, msg='') {
        this._analytics.track(e)
        log.info('Analytics :: ' + e + ' :: ' + msg)
    }

    setSize(w, h) {
        this._width = w
        this._height = h
    }

    updateConfig(c) {
        this.config = c

        if (this.prevConfig !== null && this.config !== null) {

            clearTimeout(this._analyticsDebounce) // config changed so kill timer
            this._analyticsDebounce = setTimeout(this._debounce.bind(this), 30000)
        }

        this.prevConfig = c
    }

    _debounce() {
        if (this.config.visible) {
            let type = this.config.cardType
            if (type == 'bars') {
                type = 'bars-' + this.config.bars.type
            }
            this._analytics.page({
              url: 'url-' + type,
              title: 'windowed-' + this.config.windowed,
              path: type,
              href: 'href-' + type,
              search: 'showInfo-' + String(this.config.showInfo),
              width: this._width,
              height: this._height
            })
            log.info('Analytics :: Card Usage Tracked As Page :: ' + type)
          }
    
        if (this.config.audio.enabled) {
            this._triggerAudioEnabled = false
            this._analytics.track('AudioEnabled')
            log.info('Analytics :: AudioEnabled :: Audio has been outputting for over 30 seconds')
        }
    }
}

export default altekaAnalytics