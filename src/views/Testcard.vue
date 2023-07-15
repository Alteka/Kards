<template>
  <div id="bounds" :class="{ showBounds: config.notFilledCard.bounds && !config.windowed}" class="superblack" v-on:dblclick="toggleWindowed">
    <div class="drag-region"></div>
    <div id="overlaymask" v-if="config.mask.enabled && config.mask.applyBounds" :style="computedStyle"><img :src="config.mask.imageSource" /></div>
    <div id="overlaymask" v-if="config.mask.enabled && !config.mask.applyBounds"><img :src="config.mask.imageSource" /></div>
    <div id="cards" :style="computedStyle">

    <info-circle v-if="!config.infoCircleAnimated && ((config.cardType == 'bars' && config.bars.type!='hdr') || config.cardType=='grid' || config.cardType=='ramp')" :config="config" :info="info"></info-circle>

      <div id="cardForPNG" class="testcard" :class="{animated: config.animated && config.cardType !='alteka' && config.cardType != 'audioSync' && config.cardType !='led' && config.cardType !='deghost'}">
          <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
          <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
          <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
          <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
          <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
          <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
          <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
          <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
          <AudioSyncTestCard v-if="config.cardType=='audioSync'" :config="config" :info="info" :borderSize="borderSize"></AudioSyncTestCard>
          <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
          <AltekaTestCard v-if="config.cardType == 'alteka'" :config="config" :info="info" :borderSize="borderSize"></AltekaTestCard>
          <LedWallTestCard v-if="config.cardType == 'led'" :config="config" :info="info"></LedWallTestCard>
          <DeghostTestCard v-if="config.cardType == 'deghost'" :config="config" :info="info"></DeghostTestCard>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync' && config.cardType !='led'"  class="testcard" :class="{animatedAbove: config.animated}">
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
        <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
        <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
        <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
        <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
        <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync' && config.cardType !='led'" class="testcard" :class="{animatedLeft: config.animated}">
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
        <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
        <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
        <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
        <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
        <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync' && config.cardType !='led'" class="testcard" :class="{animatedAboveLeft: config.animated}">
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
        <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
        <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
        <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
        <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
        <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
      </div>

    </div>

    <transition name="fade">
      <div v-if="config.notFilledCard.bounds && !config.windowed" class="infoBounds">
        <strong>{{ config.name}}</strong> <br />
        {{ boundsInfo }}
      </div>
    </transition>
  </div>
</template>

<script>
import GridTestCard from '../components/TestCard/Grid.vue'
import RampTestCard from '../components/TestCard/Ramp.vue'
import AltekaTestCard from '../components/TestCard/Alteka.vue'
import BarsSmpteTestCard from '../components/TestCard/SMPTE.vue'
import BarsAribTestCard from '../components/TestCard/ARIB.vue'
import BarsSimpleTestCard from '../components/TestCard/Bars.vue'
import LedWallTestCard from '../components/TestCard/LedWall.vue'
import AudioSyncTestCard from '../components/TestCard/AudioSync.vue'
import PlaceholderTestCard from '../components/TestCard/Placeholder.vue'
import DeghostTestCard from '../components/TestCard/Deghost.vue'
import BarsHDRTestCard from '../components/TestCard/HDR.vue'
import BarsSDITestCard from '../components/TestCard/SDI.vue'
import BarsSingle from '../components/TestCard/Single.vue'

import domtoimage from 'dom-to-image'
import InfoCircle from '../components/TestCard/InfoCircle.vue'

var Mousetrap = require('mousetrap')
Mousetrap.bind(['command+f', 'ctrl+f', 'esc', 'f'], function() { window.ipcRenderer.send('closeTestCard') }, 'keyup')
Mousetrap.bind(['command+i', 'ctrl+i', 'i'], function() {
  window.ipcRenderer.send('testCardKeyPress', 'showInfo')
  return false;
})
Mousetrap.bind(['command+m', 'ctrl+m', 'm', 'command+a', 'ctrl+a', 'a'], function() {
  window.ipcRenderer.send('testCardKeyPress', 'animated')
  return false;
})
Mousetrap.bind(['command+w', 'ctrl+w'], function() {
  window.ipcRenderer.send('testCardKeyPress', 'windowed')
  return false;
})
Mousetrap.bind(['command+r', 'ctrl+r'], function() {
  window.ipcRenderer.send('testCardKeyPress', 'raster')
  return false;
})
Mousetrap.bind(['command+s', 'ctrl+s'], function() {
  window.ipcRenderer.send('exportCard')
  return false;
})


  export default {
    name: 'TestCard',
    components: { GridTestCard, AltekaTestCard, BarsSmpteTestCard, BarsAribTestCard, BarsSimpleTestCard, PlaceholderTestCard, RampTestCard, AudioSyncTestCard, LedWallTestCard, DeghostTestCard, BarsHDRTestCard, BarsSDITestCard, BarsSingle, InfoCircle },
    data: function() { 
      return {
        config: {
          notFilledCard: {
            bounds: false
          },
          mask: {
            enabled: false,
            imageSource: '',
            applyBounds: false
          }
        },
        boundsInfo: Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height),
        borderSize: 25,
        info: {
          cardSize: '',
          circleSize: 500,
          displayFrequency: 0,
          time: '00:00',
          network: ['127.0.0.1'],
          networkIndex: 0
        }
      }
    },
    computed: {
      computedStyle: function() {
        let r = {}
        if (!this.config.fullsize && this.config.screen != 0) {
          r.height = this.config.notFilledCard.height + 'px' 
          r.width = this.config.notFilledCard.width + 'px'
          r.top = this.config.notFilledCard.top + 'px'
          r.left = this.config.notFilledCard.left + 'px'
        } 
        if (this.config.raster && !this.config.windowed) {
          r.border = '1px solid white'
        } else {
          r.border = 'none'
        }
        return r;
      }
    },
    methods: {
      toggleWindowed: function() {
        window.ipcRenderer.send('testCardKeyPress', 'windowed')
      },
      updateTime: function() {
        var cd = new Date()
        this.info.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
      },
      zeroPadding: function(num, digit) {
          var zero = '';
          for(var i = 0; i < digit; i++) {
              zero += '0';
          }
          return (zero + num).slice(-digit);
      },
      closeTestCard: function () {
        window.ipcRenderer.send('closeTestCard')
      },
      updateCardSize: function() {
        let w = 1280
        let h = 720
        if (this.config.windowed) {
          w = this.config.window.width
          h = this.config.window.height
        } else if (!this.config.fullsize) {
          w = this.config.notFilledCard.width
          h = this.config.notFilledCard.height
        } else {
          w = Math.round(visualViewport.width)
          h = Math.round(visualViewport.height)
        }
        this.info.cardSize = w + ' x ' + h
        this.updateBorderSize(w, h)
        this.updateInfoCircleSize(w, h)
      },
      updateBorderSize: function(w, h) {
        this.borderSize = 25
          if (w < 720 || h < 720) {
            this.borderSize = 20
          }
          if (w < 600 || h < 600) {
            this.borderSize = 15
          }
          if (w < 400 || h < 400) {
            this.borderSize = 10
          }
          if (w < 250 || h < 250) {
            this.borderSize = 6
          }
      },
      updateInfoCircleSize: function(w,h) {
        this.info.circleSize = 500
        if (w < 1600 || h < 1600) {
          this.info.circleSize = 400
        }
        if (w < 1300 || h < 1300) {
          this.info.circleSize = 300
        }
        if (w < 900 || h < 900) {
          this.info.circleSize = 200
        }
        if (w < 500 || h < 500) {
          this.info.circleSize = 150
        }
        if (w < 300 || h < 300) {
          this.info.circleSize = 100
        }
      },
      exportTestCard: function(settings) {
        var wasAnimated = this.config.animated
        var wasShowingClock = this.config.showClock
        var vm = this
        this.config.animated = false // stop animations in order to capture image
        this.config.showClock = false // hide the clock
        this.info.networkIndex = 0 // show hostname during screenshot

        console.log('Attempt to capture ' + settings.imageSource + ' as ' + settings.target)
        
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
            window.ipcRenderer.send('saveAsPNG', dataUrl)
          } else {
            window.ipcRenderer.send('setAsWallpaper', dataUrl)
          }
          console.log('Resetting animated to ', wasAnimated)
          vm.config.animated = wasAnimated
          vm.config.showClock = wasShowingClock
        })
      },
      updateNetworkInfo: function() {
        window.ipcRenderer.send('networkInfo')
      }
    },
    mounted: function() {
      console.log('Test card mounted')
      let vm = this
      window.ipcRenderer.receive('config', function(args) {
        vm.config = args
        vm.updateCardSize()
        if(!vm.config.visible) vm.exportTestCard(args.export)
      })  

      window.ipcRenderer.receive('displayFrequency', function(args) {
        vm.info.displayFrequency = args
      })  
      window.ipcRenderer.send('getScreens')  

      vm.updateCardSize()
      setTimeout(vm.updateCardSize, 1000)
      vm.updateTime()
      setInterval(vm.updateTime, 1000)

      vm.updateNetworkInfo()
      setInterval(vm.updateNetworkInfo, 10000)
      window.ipcRenderer.receive('networkInfo', function(networkInfo) {
        vm.info.network = networkInfo
      })
      setInterval(function() {
      vm.info.networkIndex++
      if (vm.info.networkIndex >= vm.info.network.length) {
        vm.info.networkIndex = 0
      }
    }, 5000)
     

      window.ipcRenderer.send('getConfigTestCard')
      this.$message({customClass: "modal",showClose: false, duration: 3000, message: 'Press escape to close test card'});
      window.addEventListener('resize', function() {
        vm.boundsInfo = Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height)
      })
      window.ipcRenderer.receive('exportCard', function() {
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
  border: 0px solid white;
  box-sizing: border-box;
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

#overlaymask {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 10;
  user-drag: none;  
   user-select: none;
   -webkit-user-drag: none;
   -webkit-user-select: none;
   mix-blend-mode: darken;
}

#overlaymask img {
  width: 100%;
  height: 100%;
  user-drag: none;  
   user-select: none;
   -webkit-user-drag: none;
   -webkit-user-select: none;
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
  right: 0;
  bottom: 0;
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
