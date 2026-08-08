<template>
  <div id="bounds" :class="{ showBounds: showBoundsOverlay }" class="superblack" @dblclick="toggleWindowed">
    <div class="drag-region"></div>
    <div id="overlaymask-bounds" v-if="config.mask.enabled && config.mask.applyBounds" :style="computedStyle">
      <img :src="config.mask.imageSource" />
    </div>
    <div id="overlaymask-full" v-if="config.mask.enabled && !config.mask.applyBounds">
      <img :src="config.mask.imageSource" />
    </div>
    <div id="cards" :style="computedStyle">
      <info-circle v-if="showInfoCircle" :config="config" :info="info" />

      <div id="cardForPNG" class="testcard" :class="{ animated: useAnimatedLayers }">
        <component v-if="cardComponent" :is="cardComponent" :config="config" :info="info" :borderSize="borderSize" />
      </div>

      <template v-if="useAnimatedLayers">
        <div v-for="layer in animatedLayerClasses" :key="layer" class="testcard" :class="{ [layer]: config.animated }">
          <component :is="cardComponent" :config="config" :info="info" :borderSize="borderSize" />
        </div>
      </template>
    </div>

    <transition name="fade">
      <div v-if="showBoundsOverlay" class="infoBounds">
        <strong>{{ config.name }}</strong> <br />
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
import ClockTestCard from '../components/TestCard/Clock.vue'

/** Card types that do not use the diagonal animation layers */
const CARD_TYPES_NO_ANIMATION = ['alteka', 'audioSync', 'led', 'deghost', 'clock']

/** Card type (or bars subtype) → component for dynamic <component :is="..."> rendering */
const CARD_COMPONENT_MAP = {
  grid: GridTestCard,
  'bars-smpte': BarsSmpteTestCard,
  'bars-arib': BarsAribTestCard,
  'bars-simple': BarsSimpleTestCard,
  'bars-hdr': BarsHDRTestCard,
  'bars-sdi': BarsSDITestCard,
  'bars-single': BarsSingle,
  ramp: RampTestCard,
  audioSync: AudioSyncTestCard,
  placeholder: PlaceholderTestCard,
  alteka: AltekaTestCard,
  led: LedWallTestCard,
  deghost: DeghostTestCard,
  clock: ClockTestCard
}

import domtoimage from 'dom-to-image'
import InfoCircle from '../components/TestCard/InfoCircle.vue'
import Mousetrap from 'mousetrap'

export default {
  name: 'TestCard',
  components: { ...CARD_COMPONENT_MAP, InfoCircle },
  data: function () {
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
      },
      timeIntervalId: null,
      networkIntervalId: null,
      networkIndexIntervalId: null,
      resizeHandler: null,
      contextmenuHandler: null
    }
  },
  computed: {
    cardKey() {
      if (this.config.cardType === 'bars' && this.config.bars && this.config.bars.type) {
        return 'bars-' + this.config.bars.type
      }
      return this.config.cardType || ''
    },
    cardComponent() {
      return CARD_COMPONENT_MAP[this.cardKey] || null
    },
    /** Whether diagonal animation is used (main layer + three extra layers; grid, bars, ramp, placeholder only) */
    useAnimatedLayers() {
      return this.config.animated && !CARD_TYPES_NO_ANIMATION.includes(this.config.cardType)
    },
    /** Whether to show the bounds overlay and info (not in windowed mode) */
    showBoundsOverlay() {
      return this.config.notFilledCard?.bounds && !this.config.windowed
    },
    /** Class names for the three diagonal animation layers */
    animatedLayerClasses() {
      return ['animatedAbove', 'animatedLeft', 'animatedAboveLeft']
    },
    /** Whether to show the info circle (grid, ramp, or bars-not-hdr, and not animated info circle) */
    showInfoCircle() {
      if (this.config.infoCircleAnimated) return false
      if (this.config.cardType === 'grid' || this.config.cardType === 'ramp') return true
      return this.config.cardType === 'bars' && this.config.bars && this.config.bars.type !== 'hdr'
    },
    computedStyle: function () {
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

      if (this.config.notFilledCard.rotate == 90) {
        r.transform = 'rotate(90deg) translateY(-100%)'
        r.transformOrigin = 'top left'
      } else if (this.config.notFilledCard.rotate == 180) {
        r.transform = 'rotate(180deg)'
        // r.transformOrigin = '50% 50%'
      } else if (this.config.notFilledCard.rotate == 270) {
        r.transform = 'rotate(270deg) translateX(-100%)'
        r.transformOrigin = 'top left'
      }

      return r
    }
  },
  methods: {
    toggleWindowed: function () {
      window.ipcRenderer.send('testCardKeyPress', 'windowed')
    },
    updateTime: function () {
      var cd = new Date()
      this.info.time =
        this.zeroPadding(cd.getHours(), 2) +
        ':' +
        this.zeroPadding(cd.getMinutes(), 2) +
        ':' +
        this.zeroPadding(cd.getSeconds(), 2)
    },
    zeroPadding(num, digit) {
      return String(num).padStart(digit, '0')
    },
    closeTestCard: function () {
      window.ipcRenderer.send('closeTestCard')
    },
    updateCardSize: function () {
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
    updateBorderSize: function (w, h) {
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
    updateInfoCircleSize: function (w, h) {
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
    exportTestCard: function (settings) {
      var wasAnimated = this.config.animated
      var wasShowingClock = this.config.showClock
      var vm = this
      this.config.animated = false // stop animations in order to capture image
      this.config.showClock = false // hide the clock
      this.info.networkIndex = 0 // show hostname during screenshot

      let opts = {}
      let element = 'bounds'

      if (settings.imageSource == 'card') {
        let size = document.getElementById('cardForPNG').getBoundingClientRect()
        opts.width = size.width
        opts.height = size.height
        element = 'cardForPNG'
      }

      domtoimage
        .toPng(document.getElementById(element), opts)
        .then((dataUrl) => {
          if (settings.target === 'file') {
            window.ipcRenderer.send('saveAsPNG', dataUrl)
          } else {
            window.ipcRenderer.send('setAsWallpaper', dataUrl)
          }
          vm.config.animated = wasAnimated
          vm.config.showClock = wasShowingClock
        })
        .catch((err) => {
          vm.config.animated = wasAnimated
          vm.config.showClock = wasShowingClock
          console.error('Export failed:', err)
          // Without this the main process never hears back, so the control
          // window's loading mask stays up until the app is restarted.
          window.ipcRenderer.send('exportCardFailed', String(err && err.message ? err.message : err))
        })
    },
    updateNetworkInfo: function () {
      window.ipcRenderer.send('networkInfo')
    }
  },
  mounted() {
    const vm = this

    Mousetrap.bind(['command+f', 'ctrl+f', 'esc', 'f'], () => window.ipcRenderer.send('closeTestCard'), 'keyup')
    Mousetrap.bind(['command+i', 'ctrl+i', 'i'], () => {
      window.ipcRenderer.send('testCardKeyPress', 'showInfo')
      return false
    })
    Mousetrap.bind(['command+m', 'ctrl+m', 'm', 'command+a', 'ctrl+a', 'a'], () => {
      window.ipcRenderer.send('testCardKeyPress', 'animated')
      return false
    })
    Mousetrap.bind(['command+w', 'ctrl+w'], () => {
      window.ipcRenderer.send('testCardKeyPress', 'windowed')
      return false
    })
    Mousetrap.bind(['command+r', 'ctrl+r'], () => {
      window.ipcRenderer.send('testCardKeyPress', 'raster')
      return false
    })
    Mousetrap.bind(['command+s', 'ctrl+s'], () => {
      window.ipcRenderer.send('exportCard')
      return false
    })

    window.ipcRenderer.receive('config', (args) => {
      const { _captureOnly, ...config } = args
      vm.config = config
      vm.updateCardSize()
      // Only auto-export when this is the headless export dummy window (visible=false, not NDI capture)
      if (!config.visible && !_captureOnly) vm.exportTestCard(args.export)
    })
    window.ipcRenderer.receive('displayFrequency', (args) => {
      vm.info.displayFrequency = args
    })
    window.ipcRenderer.receive('networkInfo', (networkInfo) => {
      vm.info.network = networkInfo
    })
    window.ipcRenderer.receive('exportCard', () => {
      vm.exportTestCard(vm.config.export)
    })

    window.ipcRenderer.send('getScreens')
    window.ipcRenderer.send('getConfigTestCard')

    vm.updateCardSize()
    setTimeout(vm.updateCardSize, 1000)
    vm.updateTime()
    this.timeIntervalId = setInterval(vm.updateTime, 1000)
    vm.updateNetworkInfo()
    this.networkIntervalId = setInterval(vm.updateNetworkInfo, 10000)
    this.networkIndexIntervalId = setInterval(() => {
      vm.info.networkIndex++
      if (vm.info.networkIndex >= vm.info.network.length) vm.info.networkIndex = 0
    }, 5000)

    this.resizeHandler = () => {
      vm.boundsInfo = Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height)
    }
    window.addEventListener('resize', this.resizeHandler)
    this.contextmenuHandler = (e) => e.preventDefault()
    window.addEventListener('contextmenu', this.contextmenuHandler, false)

    this.$message({
      customClass: 'modal',
      showClose: false,
      duration: 3000,
      message: 'Press escape to close test card'
    })
  },
  beforeUnmount() {
    if (this.timeIntervalId) clearInterval(this.timeIntervalId)
    if (this.networkIntervalId) clearInterval(this.networkIntervalId)
    if (this.networkIndexIntervalId) clearInterval(this.networkIndexIntervalId)
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler)
    if (this.contextmenuHandler) window.removeEventListener('contextmenu', this.contextmenuHandler, false)
    Mousetrap.unbind(['command+f', 'ctrl+f', 'esc', 'f'], 'keyup')
    Mousetrap.unbind(['command+i', 'ctrl+i', 'i'])
    Mousetrap.unbind(['command+m', 'ctrl+m', 'm', 'command+a', 'ctrl+a', 'a'])
    Mousetrap.unbind(['command+w', 'ctrl+w'])
    Mousetrap.unbind(['command+r', 'ctrl+r'])
    Mousetrap.unbind(['command+s', 'ctrl+s'])
  }
}
</script>

<style>
@font-face {
  font-family: Sansation;
  src: url('@/assets/Sansation-Regular.ttf');
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

#overlaymask-bounds,
#overlaymask-full {
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

#overlaymask-bounds img,
#overlaymask-full img {
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
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 0, 0, 1);
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
  0% {
    transform: translatex(0%) translatey(0%);
  }
  100% {
    transform: translatex(100%) translatey(100%);
  }
}

.animatedAbove {
  animation: diagonalAbove 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAbove {
  0% {
    transform: translatex(0%) translatey(-100%);
  }
  100% {
    transform: translatex(100%) translatey(0%);
  }
}

.animatedLeft {
  animation: diagonalLeft 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalLeft {
  0% {
    transform: translatex(-100%) translatey(0%);
  }
  100% {
    transform: translatex(0%) translatey(100%);
  }
}

.animatedAboveLeft {
  animation: diagonalAboveLeft 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAboveLeft {
  0% {
    transform: translatex(-100%) translatey(-100%);
  }
  100% {
    transform: translatex(0%) translatey(0%);
  }
}

.showBounds {
  outline: 2px solid red;
  outline-offset: -2px;
  background-size: 50% 50%;
  background-image:
    linear-gradient(to right, red 1px, transparent 1px), linear-gradient(to bottom, red 1px, transparent 1px);
}
.modal {
  font-family: Sansation;
  font-size: 200%;
}

.black {
  background-color: rgb(16, 16, 16);
}
.superblack {
  background-color: rgba(0, 0, 0, 1);
}
.grey40 {
  background-color: rgb(104, 104, 104);
}
.superwhite {
  background-color: rgb(255, 255, 255);
}
.white {
  background-color: rgb(235, 235, 235);
}
.white75 {
  background-color: rgb(180, 180, 180);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
