const { app, Menu, MenuItem } = require('electron')
const EventEmitter = require('events')

class altekaMenu extends EventEmitter {
  constructor() {
    super()

    this.config = null
    this.menu = null

    this.active = false
  }

  setup(c) {
    this.config = c
    
    if (process.platform == 'darwin') {
      this.active = true
    }

    this.buildMenu()
    this.setMenu()
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
        label: 'Audio',
        submenu: [
            this.config.audio.enabled ? 
              { label: 'Disable Audio', click: () => { this.config.audio.enabled = false; this.click()} } :
              { label: 'Enable Audio', click: () => { this.config.audio.enabled = true; this.click()} },
            { type: 'separator' },
            this.config.audio.options.includes('voice') ?
              { label: 'Voice', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('voice'), 1); this.click() } } :
              { label: 'Voice', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('voice'); this.click() } },
            this.config.audio.options.includes('text') ?
              { label: 'Text', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('text'), 1); this.click() } } :
              { label: 'Text', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('text'); this.click() } },
            this.config.audio.options.includes('tone') ?
              { label: 'Tone', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('tone'), 1); this.click() } } :
              { label: 'Tone', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('tone'); this.click() } },
            this.config.audio.options.includes('pink') ?
              { label: 'Pink', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('pink'), 1); this.click() } } :
              { label: 'Pink', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('pink'); this.click() } },
            this.config.audio.options.includes('white') ?
              { label: 'White', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('white'), 1); this.click() } } :
              { label: 'White', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('white'); this.click() } },
            this.config.audio.options.includes('stereo') ?
              { label: 'Stereo', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('stereo'), 1); this.click() } } :
              { label: 'Stereo', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('stereo'); this.click() } },
            this.config.audio.options.includes('phase') ?
              { label: 'Phase', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('phase'), 1); this.click() } } :
              { label: 'Phase', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('phase'); this.click() } },
            this.config.audio.options.includes('file') ?
              { label: 'File', type: 'checkbox', checked: true, click: () => {this.config.audio.options.splice(this.config.audio.options.indexOf('file'), 1); this.click() } } :
              { label: 'File', type: 'checkbox', checked: false, click: () => {this.config.audio.options.push('file'); this.click() } },
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

  setMenu() {
    if (process.platform == 'darwin') {
      Menu.setApplicationMenu(this.menu)
    } else {
      Menu.setApplicationMenu(null)
    }
  }
}

export default altekaMenu

// const menu = new Menu()

// menu.append(new MenuItem({
//     label: app.name,
//     submenu: [
//         { role: 'about' },
//         { type: 'separator' },
//         { role: 'services' },
//         { type: 'separator' },
//         { role: 'hide' },
//         { role: 'hideothers' },
//         { role: 'unhide' },
//         { type: 'separator' },
//         { role: 'quit' }
//       ]    
//     }))


// menu.append(new MenuItem({
//     label: 'Edit',
//     submenu: [
//         { role: 'cut' },
//         { role: 'copy' },
//         { role: 'paste' },
//         { type: 'separator' },
//         { role: 'selectAll' }
//       ]
// }))

// menu.append(new MenuItem({
//   label: 'Settings',
//   submenu: [
//       { label: 'Enable' },
//       { label: 'Motion' }
//     ]
// }))

// menu.append(new MenuItem({
//   label: 'Audio',
//   submenu: [
//       { label: 'Enable' },
//       { label: 'Motion' }
//     ]
// }))


// exports.menu = menu