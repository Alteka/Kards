<template>
  <div id="bounds" :class="{ showBounds: config.bounds && !config.fullscreen}" class="superblack">
    <div class="drag-region"></div>
    <div id="cards" :style="computedStyle">

      <div id="cardForPNG" class="testcard" :class="{animated: config.animated && config.cardType !='alteka' && config.cardType != 'audioSync'}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize"></Grid>
        <Alteka v-if="config.cardType == 'alteka'" :config="config" :cardSize="cardSize"></Alteka>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize"></Ramp>
        <AudioSync v-if="config.cardType=='audioSync'" :config="config" :cardSize="cardSize"></AudioSync>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize"></Placeholder>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync'" class="testcard" :class="{animatedAbove: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize"></Grid>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize"></Placeholder>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync'" class="testcard" :class="{animatedLeft: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize"></Grid>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize"></Placeholder>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync'" class="testcard" :class="{animatedAboveLeft: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize"></Grid>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize"></Placeholder>
      </div>

    </div>

    <transition name="fade">
      <div v-if="config.bounds" class="infoBounds">
        <strong>{{ config.name}}</strong> <br />
        {{ boundsInfo }}
      </div>
    </transition>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
import Grid from './TestCard/Grid'
import Ramp from './TestCard/Ramp'
import Alteka from './TestCard/Alteka'
import SMPTE from './TestCard/SMPTE'
import ARIB from './TestCard/ARIB'
import Bars from './TestCard/Bars'
import AudioSync from './TestCard/AudioSync'
import Placeholder from './TestCard/Placeholder'

import domtoimage from 'dom-to-image'

var Mousetrap = require('mousetrap')
Mousetrap.bind('esc', function() { ipcRenderer.send('closeTestCard') }, 'keyup')

const log = require('electron-log')

const { remote } = require('electron')
const { Menu, MenuItem } = remote

const menu = new Menu()
menu.append(new MenuItem({ label: 'Alteka Kards', enabled: false }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Close Card', click() {
  ipcRenderer.send('closeTestCard')
} }))



  export default {
    name: 'testcard',
    components: { Grid, Alteka, SMPTE, ARIB, Bars, Placeholder, Ramp, AudioSync },
    data: function() { 
      return {
        config: {
        },
        boundsInfo: visualViewport.width + ' x ' + visualViewport.height,
        cardSize: ''
      }
    },
    computed: {
      computedStyle: function() {
        if (this.config.fullsize || this.config.screen == 0) {
          return {}
        } else {
          return {
            height: this.config.height + 'px',
            width: this.config.width + 'px',
            top: this.config.top + 'px',
            left: this.config.left + 'px',
          }
        }
      }
    },
    methods: {
      closeTestCard: function () {
        ipcRenderer.send('closeTestCard')
      },
      updateCardSize: function() {
        if (this.config.screen == 0) {
          this.cardSize = this.config.winWidth + ' x ' + this.config.winHeight
        } else if (this.config.fullsize) {
          this.cardSize = visualViewport.width + ' x ' + visualViewport.height
        } else {
          this.cardSize = this.config.width + ' x ' + this.config.height
        }
      },
      testCardToPNG: function() {
        var wasAnimated = this.config.animated
        var vm = this
        this.config.animated = false

        log.info('Attempt to capture test card as PNG')
        let size = document.getElementById('cardForPNG').getBoundingClientRect()
        
        domtoimage.toPng(document.getElementById('cardForPNG'), {width: size.width, height: size.height})
          .then(function (dataUrl) {
          ipcRenderer.send('saveAsPNG', dataUrl)
          console.log('Resetting animated to ', wasAnimated)
          vm.config.animated = wasAnimated
        })
      },
      boundsToPNG: function() {
        log.info('Attempt to capture output window as PNG')
        domtoimage.toPng(document.getElementById('bounds'))
          .then(function (dataUrl) {
          ipcRenderer.send('saveAsPNG', dataUrl)
        })
      },
      testCardToWallpaper: function() {
        log.info('Attempt to capture test card and set as Wallpaper')
        let size = document.getElementById('cardForPNG').getBoundingClientRect()
        domtoimage.toPng(document.getElementById('cardForPNG'), {width: size.width, height: size.height})
          .then(function (dataUrl) {
          ipcRenderer.send('setAsWallpaper', dataUrl)
        })
      },
      boundsToWallpaper: function() {
        log.info('Attempt to capture output window and set as Wallpaper')
        domtoimage.toPng(document.getElementById('bounds'))
          .then(function (dataUrl) {
          ipcRenderer.send('setAsWallpaper', dataUrl)
        })
      }
    },
    mounted: function() {
      log.info('Test card mounted')
      let vm = this
      ipcRenderer.on('config', function(event, args) {
        vm.config = args
        vm.updateCardSize()
      })
      vm.updateCardSize()
      setTimeout(vm.updateCardSize, 1000)
      ipcRenderer.send('getConfigTestCard')
      this.$message({customClass: "modal",showClose: true, message: 'Press escape to close test card'});
      window.addEventListener('resize', function() {
        vm.boundsInfo = visualViewport.width + ' x ' + visualViewport.height
      })
      ipcRenderer.on('exportCard', function(event, args) {
        console.log('exportCard', args)
        switch (args) {
          case 'testCardToPNG':
            vm.testCardToPNG()
          break;
          case 'outputToPNG':
            vm.boundsToPNG()
          break
          case 'testCardToWallpaper':
            vm.testCardToWallpaper()
          break
          case 'outputToWallpaper':
            vm.boundsToWallpaper()
          break
        }
      })

      window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        menu.popup({ window: remote.getCurrentWindow() })
      }, false)

    }
  }
</script>

<style>
@font-face {
  font-family: Sansation;
  src: url("~@/assets/Sansation-Regular.ttf");
}
#cards {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  color: white;
  overflow: hidden;
}
#bounds {
  font-family: Sansation, Helvetica, sans-serif;
  overflow: hidden !important;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: overlay;
  z-index: -10;
}

.drag-region {
  top: 4px;
  left: 4px;
  display: block;
  position: absolute;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  z-index: -1;
  -webkit-app-region: drag;
}

.infoBounds {
  position: absolute;
  font-size: 20px;
  width: 150px;
  height: 95px;
  padding-top: 55px;
  margin: auto;
  left: calc(50% - 75px);
  top: calc(50% - 75px);
  text-align: center;
  border-radius: 50%;
  overflow: hidden;
  color: red;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,0,0,1);
  z-index: -1;
}
.testcard {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}
.animated {
  animation: diagonal 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonal {
    0%       { transform: translatex(0%) translatey(0%) }
    100%     { transform: translatex(100%) translatey(100%) }
}

.animatedAbove {
  animation: diagonalAbove 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAbove {
    0%       { transform: translatex(0%) translatey(-100%) }
    100%     { transform: translatex(100%) translatey(0%) }
}

.animatedLeft {
  animation: diagonalLeft 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalLeft {
    0%       { transform: translatex(-100%) translatey(0%) }
    100%     { transform: translatex(0%) translatey(100%) }
}

.animatedAboveLeft {
  animation: diagonalAboveLeft 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAboveLeft {
    0%       { transform: translatex(-100%) translatey(-100%) }
    100%     { transform: translatex(0%) translatey(0%) }
}

.showBounds {
  outline: 2px solid red;
  outline-offset: -2px;
  background-size: 50% 50%;
  background-image:
    linear-gradient(to right, red 1px, transparent 1px),
    linear-gradient(to bottom, red 1px, transparent 1px);
}
.modal {
  font-family: Sansation;
  font-size: 200%;
}

 .black {
    background-color: rgb(16,16,16);
  }
  .superblack {
    background-color: rgb(0,0,0)
  }
  .grey40 {
    background-color: rgb(104,104,104);
  }
  .superwhite {
    background-color: rgb(255,255,255);
  }
  .white {
    background-color: rgb(235,235,235);
  }
  .white75 {
    background-color: rgb(180,180,180);
  }
 

 .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>
