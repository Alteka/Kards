<template>
  <div id="bounds" :class="{ showBounds: config.bounds && !config.fullscreen}" class="superblack">
    <div class="drag-region"></div>
    <div id="cards" :style="computedStyle">

      <div id="cardForPNG" class="testcard" :class="{animated: config.animated && config.cardType !='alteka' && config.cardType != 'audioSync'}">
          <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize" :time="time"></Grid>
          <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize" :time="time"></SMPTE>
          <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize" :time="time"></ARIB>
          <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize" :time="time"></Bars>
          <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize" :time="time"></Ramp>
          <AudioSync v-if="config.cardType=='audioSync'" :config="config" :cardSize="cardSize" :time="time"></AudioSync>
          <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize" :time="time"></Placeholder>
          <Alteka v-if="config.cardType == 'alteka'" :config="config" :cardSize="cardSize" :time="time"></Alteka>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync'" class="testcard" :class="{animatedAbove: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize" :time="time"></Grid>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize" :time="time"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize" :time="time"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize" :time="time"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize" :time="time"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize" :time="time"></Placeholder>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync'" class="testcard" :class="{animatedLeft: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize" :time="time"></Grid>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize" :time="time"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize" :time="time"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize" :time="time"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize" :time="time"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize" :time="time"></Placeholder>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync'" class="testcard" :class="{animatedAboveLeft: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config" :cardSize="cardSize" :time="time"></Grid>
        <SMPTE v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :cardSize="cardSize" :time="time"></SMPTE>
        <ARIB v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :cardSize="cardSize" :time="time"></ARIB>
        <Bars v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :cardSize="cardSize" :time="time"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config" :cardSize="cardSize" :time="time"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config" :cardSize="cardSize" :time="time"></Placeholder>
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
Mousetrap.bind(['command+f', 'ctrl+f', 'esc'], function() { ipcRenderer.send('closeTestCard') }, 'keyup')
Mousetrap.bind(['command+i', 'ctrl+i'], function() {
  ipcRenderer.send('testCardKeyPress', 'showInfo')
  return false;
})
Mousetrap.bind(['command+m', 'ctrl+m'], function() {
  ipcRenderer.send('testCardKeyPress', 'animated')
  return false;
})
Mousetrap.bind(['command+w', 'ctrl+w'], function() {
  ipcRenderer.send('testCardKeyPress', 'windowed')
  return false;
})
Mousetrap.bind(['command+s', 'ctrl+s'], function() {
  ipcRenderer.send('exportCard')
  return false;
})

const log = require('electron-log')

  export default {
    name: 'testcard',
    components: { Grid, Alteka, SMPTE, ARIB, Bars, Placeholder, Ramp, AudioSync },
    data: function() { 
      return {
        config: {
        },
        boundsInfo: Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height),
        cardSize: '',
        time: '00:00'
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
      updateTime: function() {
        var cd = new Date()
        this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
      },
      zeroPadding: function(num, digit) {
          var zero = '';
          for(var i = 0; i < digit; i++) {
              zero += '0';
          }
          return (zero + num).slice(-digit);
      },
      closeTestCard: function () {
        ipcRenderer.send('closeTestCard')
      },
      updateCardSize: function() {
        if (this.config.windowed) {
          this.cardSize = this.config.winWidth + ' x ' + this.config.winHeight
        } else {
          this.cardSize = this.config.width + ' x ' + this.config.height
        }
      },
      exportTestCard: function(settings) {
        var wasAnimated = this.config.animated
        var vm = this
        this.config.animated = false // stop animations in order to capture image

        log.info('Attempt to capture ' + settings.imageSource + ' as ' + settings.target)
        
        let opts = {}
        let element = 'bounds'

        if (settings.imageSource == 'card') {
          let size = document.getElementById('cardForPNG').getBoundingClientRect()
          opts.width = size.width
          opts.height = size.height
          element = 'cardForPNG'
        }
        
        domtoimage.toPng(document.getElementById(element), opts).then(function (dataUrl) {
          if (settings.target == 'file') {
            ipcRenderer.send('saveAsPNG', dataUrl)
          } else {
            ipcRenderer.send('setAsWallpaper', dataUrl)
          }
          console.log('Resetting animated to ', wasAnimated)
          vm.config.animated = wasAnimated
        })
      }
    },
    mounted: function() {
      log.info('Test card mounted')
      let vm = this
      ipcRenderer.on('config', function(event, args) {
        vm.config = args
        vm.updateCardSize()
        if(!vm.config.visible) vm.exportTestCard(args.export)
      })
      vm.updateCardSize()
      setTimeout(vm.updateCardSize, 1000)
      vm.updateTime()
      setInterval(vm.updateTime, 1000)
      ipcRenderer.send('getConfigTestCard')
      this.$message({customClass: "modal",showClose: false, duration: 3000, message: 'Press escape to close test card'});
      window.addEventListener('resize', function() {
        vm.boundsInfo = Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height)
      })
      ipcRenderer.on('exportCard', function(event) {
        console.log('exportCard', vm.config.export)
        vm.exportTestCard(vm.config.export)
      })

      window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
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
  animation: diagonal 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonal {
    0%       { transform: translatex(0%) translatey(0%) }
    100%     { transform: translatex(100%) translatey(100%) }
}

.animatedAbove {
  animation: diagonalAbove 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAbove {
    0%       { transform: translatex(0%) translatey(-100%) }
    100%     { transform: translatex(100%) translatey(0%) }
}

.animatedLeft {
  animation: diagonalLeft 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalLeft {
    0%       { transform: translatex(-100%) translatey(0%) }
    100%     { transform: translatex(0%) translatey(100%) }
}

.animatedAboveLeft {
  animation: diagonalAboveLeft 30s infinite;
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
    background-color: rgba(0,0,0,1)
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
