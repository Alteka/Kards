const { app, Menu, MenuItem, ipcMain, shell } = require('electron')
const EventEmitter = require('events')

class altekaMenu extends EventEmitter {
  constructor() {
    super()

    this.config = null
    this.menu = null

    this.screens = []

    this.active = false

    this.audioDevices = []
  }

  setup(c) {
    this.config = c
    
    if (process.platform == 'darwin') {
      this.active = true
    }

    this.buildMenu()
    this.setMenu()

    ipcMain.on('audioDevices', (_, arg) => {
      // console.log('audioDevices', arg)
      this.audioDevices = arg
    })
  }

  buildMenu() {
    this.menu = new Menu()
    
    this.menu.append(new MenuItem({
      label: app.name,
      submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]    
      }))


      this.menu.append(new MenuItem({
        label: 'File',
        submenu: [
            { label: 'Import Settings', accelerator: 'CommandOrControl+o', click: () => { 
                this.emit('importSettings')
              }
            },
            { label: 'Export Settings', accelerator: 'CommandOrControl+s', click: () => { 
              this.emit('exportSettings')
              }
            },
            { type: 'separator' },
            { label: 'Open Logs', click: () => { 
              this.emit('openLogs')
              }
            }
          ]
      }))

      let screensMenu = []
      for (const s in this.screens) { 
        screensMenu.push({
          label: this.screens[s].bounds.width + 'x' + this.screens[s].bounds.height + ' at ' + this.screens[s].displayFrequency + 'Hz',
          type: 'checkbox',
          checked: this.config.screen == this.screens[s].id,
          click: () => { this.config.screen = this.screens[s].id; this.click() }
        })
      }

      this.menu.append(new MenuItem({
        label: 'Card',
        submenu: [
          { label: 'Enable Card', accelerator: 'CommandOrControl+f', type: 'checkbox', checked: this.config.visible, click: () => { this.config.visible = !this.config.visible; this.click()} }, 
          { type: 'separator' },
          { label: 'Show Info', accelerator: 'CommandOrControl+i', type: 'checkbox', checked: this.config.showInfo, click: () => { this.config.showInfo = !this.config.showInfo; this.click()} }, 
          { label: 'Motion', accelerator: 'CommandOrControl+m', enabled: this.config.cardType != 'audioSync' && this.config.cardType != 'deghost', type: 'checkbox', checked: this.config.animated, click: () => { this.config.animated = !this.config.animated; this.click()} }, 
          { label: 'Windowed', accelerator: 'CommandOrControl+w', type: 'checkbox', checked: this.config.windowed, click: () => { this.config.windowed = !this.config.windowed; this.click()} },   
          { type: 'separator' },
          { label: 'Fill Output', accelerator: 'CommandOrControl+g', enabled: !this.config.windowed, type: 'checkbox', checked: this.config.fullsize, click: () => { this.config.fullsize = !this.config.fullsize; this.click()} },   
          { label: 'Show Bounds', accelerator: 'CommandOrControl+b', enabled: !this.config.windowed && !this.config.fullsize, type: 'checkbox', checked: this.config.notFilledCard.bounds, click: () => { this.config.notFilledCard.bounds = !this.config.notFilledCard.bounds; this.click()} },   
          // { label: 'Device', submenu: audioDeviceMenu },
          { type: 'separator' },
          { label: 'Select Screen', submenu: screensMenu },
          { label: 'Card Type', submenu: [
            { label: 'Alteka', accelerator: '1', type: 'radio', checked: this.config.cardType == 'alteka', click: () => { this.config.cardType = 'alteka'; this.click()} },   
            { label: 'Bars', accelerator: '2', type: 'radio', checked: this.config.cardType == 'bars', click: () => { this.config.cardType = 'bars'; this.click()} },   
            { label: 'Grid', accelerator: '3', type: 'radio', checked: this.config.cardType == 'grid', click: () => { this.config.cardType = 'grid'; this.click()} },   
            { label: 'LED', accelerator: '4', type: 'radio', checked: this.config.cardType == 'led', click: () => { this.config.cardType = 'led'; this.click()} },   
            { label: 'Ramp', accelerator: '5', type: 'radio', checked: this.config.cardType == 'ramp', click: () => { this.config.cardType = 'ramp'; this.click()} },   
            { label: 'Name', accelerator: '6', type: 'radio', checked: this.config.cardType == 'placeholder', click: () => { this.config.cardType = 'placeholder'; this.click()} },   
            { label: 'Sync', accelerator: '7', type: 'radio', checked: this.config.cardType == 'audioSync', click: () => { this.config.cardType = 'audioSync'; this.click()} },   
            { label: 'DeGhost', accelerator: '8', type: 'radio', checked: this.config.cardType == 'deghost', click: () => { this.config.cardType = 'deghost'; this.click()} }
          ]}
        ]
      }))

      let audioDeviceMenu = []
      for (const d in this.audioDevices) {
        audioDeviceMenu.push({
          label: this.audioDevices[d].label,
          click: () => { this.config.audio.deviceId = this.audioDevices[d].deviceId; this.click() }
        })
      }
  
      this.menu.append(new MenuItem({
        label: 'Audio',
        submenu: [
          { label: 'Enable Audio', accelerator: 'CommandOrControl+a', type: 'checkbox', checked: this.config.audio.enabled, click: () => { this.config.audio.enabled = !this.config.audio.enabled; this.click()} }, 
            { type: 'separator' },
            this.config.audio.options.includes('voice') ?
              { label: 'Voice', type: 'checkbox', accelerator: 'CommandOrControl+Shift+1', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('voice'), 1); this.click() } } :
              { label: 'Voice', type: 'checkbox', accelerator: 'CommandOrControl+Shift+1', checked: false, click: () => {this.config.audio.options.push('voice'); this.click() } },
            this.config.audio.options.includes('text') ?
              { label: 'Text', type: 'checkbox', accelerator: 'CommandOrControl+Shift+2', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('text'), 1); this.click() } } :
              { label: 'Text', type: 'checkbox', accelerator: 'CommandOrControl+Shift+2', checked: false, click: () => {this.config.audio.options.push('text'); this.click() } },
            this.config.audio.options.includes('tone') ?
              { label: 'Tone', type: 'checkbox', accelerator: 'CommandOrControl+Shift+3', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('tone'), 1); this.click() } } :
              { label: 'Tone', type: 'checkbox', accelerator: 'CommandOrControl+Shift+3', checked: false, click: () => {this.config.audio.options.push('tone'); this.click() } },
            this.config.audio.options.includes('pink') ?
              { label: 'Pink', type: 'checkbox', accelerator: 'CommandOrControl+Shift+4', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('pink'), 1); this.click() } } :
              { label: 'Pink', type: 'checkbox', accelerator: 'CommandOrControl+Shift+4', checked: false, click: () => {this.config.audio.options.push('pink'); this.click() } },
            this.config.audio.options.includes('white') ?
              { label: 'White', type: 'checkbox', accelerator: 'CommandOrControl+Shift+5', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('white'), 1); this.click() } } :
              { label: 'White', type: 'checkbox', accelerator: 'CommandOrControl+Shift+5', checked: false, click: () => {this.config.audio.options.push('white'); this.click() } },
            this.config.audio.options.includes('stereo') ?
              { label: 'Stereo', type: 'checkbox', accelerator: 'CommandOrControl+Shift+6', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('stereo'), 1); this.click() } } :
              { label: 'Stereo', type: 'checkbox', accelerator: 'CommandOrControl+Shift+6', checked: false, click: () => {this.config.audio.options.push('stereo'); this.click() } },
            this.config.audio.options.includes('phase') ?
              { label: 'Phase', type: 'checkbox', accelerator: 'CommandOrControl+Shift+7', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('phase'), 1); this.click() } } :
              { label: 'Phase', type: 'checkbox', accelerator: 'CommandOrControl+Shift+7', checked: false, click: () => {this.config.audio.options.push('phase'); this.click() } },
            this.config.audio.options.includes('file') ?
              { label: 'File', type: 'checkbox', accelerator: 'CommandOrControl+Shift+8', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('file'), 1); this.click() } } :
              { label: 'File', type: 'checkbox', accelerator: 'CommandOrControl+Shift+8', checked: false, click: () => {this.config.audio.options.push('file'); this.click() } },
            { type: 'separator' },
            { label: 'Device', submenu: audioDeviceMenu },
            { type: 'separator' },
            { label: 'Open Audio File', click: () => { this.emit("loadAudioFile") }}
          ]
      }))

      this.menu.append(new MenuItem({
        label: 'Help',
        submenu: [
            { label: 'Version ' + require('../package.json').version, enabled: false },
            { type: 'separator' },
            { label: 'Open Help Site', click: () => { 
              shell.openExternal('http://www.alteka.solutions/kards/help')
              }
            }
          ]
      }))

  }

  click() {
    this.emit('menuClick', this.config)
  }

  updateConfig(c) {
    if (this.active) {
      this.config = c
      this.buildMenu()
      this.setMenu()
    }
  }

  updateScreens(s) {
    this.screens = s
    this.updateConfig(this.config)
  }

  setMenu() {
    if (process.platform == 'darwin') {
      Menu.setApplicationMenu(this.menu)
    } else {
      Menu.setApplicationMenu(null)
    }
  }
}

export default altekaMenu