<template>
  <div
    id="bounds"
    :class="{ showBounds: config.notFilledCard.bounds && !config.windowed }"
    class="superblack"
    @dblclick="toggleWindowed"
  >
    <div class="drag-region"></div>
    <div
      v-if="config.mask.enabled && config.mask.applyBounds"
      id="overlaymask"
      :style="computedStyle"
    >
      <img :src="config.mask.imageSource" />
    </div>
    <div v-if="config.mask.enabled && !config.mask.applyBounds" id="overlaymask">
      <img :src="config.mask.imageSource" />
    </div>
    <div id="cards" :style="computedStyle">
      <info-circle
        v-if="
          !config.infoCircleAnimated &&
          ((config.cardType == 'bars' && config.bars.type != 'hdr') ||
            config.cardType == 'grid' ||
            config.cardType == 'ramp')
        "
        :config="config"
        :info="info"
      ></info-circle>

      <div
        id="cardForPNG"
        class="testcard"
        :class="{
          animated:
            config.animated &&
            config.cardType != 'alteka' &&
            config.cardType != 'audioSync' &&
            config.cardType != 'led' &&
            config.cardType != 'deghost'
        }"
      >
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'smpte'"
          :config="config"
          :info="info"
        ></BarsSmpteTestCard>
        <BarsAribTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'arib'"
          :config="config"
          :info="info"
        ></BarsAribTestCard>
        <BarsSimpleTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'simple'"
          :config="config"
          :info="info"
        ></BarsSimpleTestCard>
        <BarsHDRTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'hdr'"
          :config="config"
          :info="info"
        ></BarsHDRTestCard>
        <BarsSDITestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'sdi'"
          :config="config"
          :info="info"
        ></BarsSDITestCard>
        <BarsSingle
          v-if="config.cardType == 'bars' && config.bars.type == 'single'"
          :config="config"
          :info="info"
        ></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <AudioSyncTestCard
          v-if="config.cardType == 'audioSync'"
          :config="config"
          :info="info"
          :border-size="borderSize"
        ></AudioSyncTestCard>
        <PlaceholderTestCard
          v-if="config.cardType == 'placeholder'"
          :config="config"
          :info="info"
        ></PlaceholderTestCard>
        <AltekaTestCard
          v-if="config.cardType == 'alteka'"
          :config="config"
          :info="info"
          :border-size="borderSize"
        ></AltekaTestCard>
        <LedWallTestCard
          v-if="config.cardType == 'led'"
          :config="config"
          :info="info"
        ></LedWallTestCard>
        <DeghostTestCard
          v-if="config.cardType == 'deghost'"
          :config="config"
          :info="info"
        ></DeghostTestCard>
      </div>

      <div
        v-if="
          config.animated &&
          config.cardType != 'alteka' &&
          config.cardType != 'audioSync' &&
          config.cardType != 'led'
        "
        class="testcard"
        :class="{ animatedAbove: config.animated }"
      >
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'smpte'"
          :config="config"
          :info="info"
        ></BarsSmpteTestCard>
        <BarsAribTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'arib'"
          :config="config"
          :info="info"
        ></BarsAribTestCard>
        <BarsSimpleTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'simple'"
          :config="config"
          :info="info"
        ></BarsSimpleTestCard>
        <BarsHDRTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'hdr'"
          :config="config"
          :info="info"
        ></BarsHDRTestCard>
        <BarsSDITestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'sdi'"
          :config="config"
          :info="info"
        ></BarsSDITestCard>
        <BarsSingle
          v-if="config.cardType == 'bars' && config.bars.type == 'single'"
          :config="config"
          :info="info"
        ></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard
          v-if="config.cardType == 'placeholder'"
          :config="config"
          :info="info"
        ></PlaceholderTestCard>
      </div>

      <div
        v-if="
          config.animated &&
          config.cardType != 'alteka' &&
          config.cardType != 'audioSync' &&
          config.cardType != 'led'
        "
        class="testcard"
        :class="{ animatedLeft: config.animated }"
      >
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'smpte'"
          :config="config"
          :info="info"
        ></BarsSmpteTestCard>
        <BarsAribTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'arib'"
          :config="config"
          :info="info"
        ></BarsAribTestCard>
        <BarsSimpleTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'simple'"
          :config="config"
          :info="info"
        ></BarsSimpleTestCard>
        <BarsHDRTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'hdr'"
          :config="config"
          :info="info"
        ></BarsHDRTestCard>
        <BarsSDITestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'sdi'"
          :config="config"
          :info="info"
        ></BarsSDITestCard>
        <BarsSingle
          v-if="config.cardType == 'bars' && config.bars.type == 'single'"
          :config="config"
          :info="info"
        ></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard
          v-if="config.cardType == 'placeholder'"
          :config="config"
          :info="info"
        ></PlaceholderTestCard>
      </div>

      <div
        v-if="
          config.animated &&
          config.cardType != 'alteka' &&
          config.cardType != 'audioSync' &&
          config.cardType != 'led'
        "
        class="testcard"
        :class="{ animatedAboveLeft: config.animated }"
      >
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'smpte'"
          :config="config"
          :info="info"
        ></BarsSmpteTestCard>
        <BarsAribTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'arib'"
          :config="config"
          :info="info"
        ></BarsAribTestCard>
        <BarsSimpleTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'simple'"
          :config="config"
          :info="info"
        ></BarsSimpleTestCard>
        <BarsHDRTestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'hdr'"
          :config="config"
          :info="info"
        ></BarsHDRTestCard>
        <BarsSDITestCard
          v-if="config.cardType == 'bars' && config.bars.type == 'sdi'"
          :config="config"
          :info="info"
        ></BarsSDITestCard>
        <BarsSingle
          v-if="config.cardType == 'bars' && config.bars.type == 'single'"
          :config="config"
          :info="info"
        ></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard
          v-if="config.cardType == 'placeholder'"
          :config="config"
          :info="info"
        ></PlaceholderTestCard>
      </div>
    </div>

    <transition name="fade">
      <div v-if="config.notFilledCard.bounds && !config.windowed" class="infoBounds">
        <strong>{{ config.name }}</strong> <br />
        {{ boundsInfo }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Config } from '@renderer/config'
import GridTestCard from '../components/TestCard/GridCard.vue'
import RampTestCard from '../components/TestCard/RampCard.vue'
import AltekaTestCard from '../components/TestCard/AltekaCard.vue'
import BarsAribTestCard from '../components/TestCard/ARIBCard.vue'
import BarsSimpleTestCard from '../components/TestCard/BarsCard.vue'
import BarsSmpteTestCard from '../components/TestCard/BarsSmpteCard.vue'
import BarsHDRTestCard from '../components/TestCard/BarsHdrCard.vue'
import BarsSingle from '../components/TestCard/BarsSingleCard.vue'
import BarsSDITestCard from '../components/TestCard/BarsSimpleCard.vue'

import LedWallTestCard from '../components/TestCard/LedWallCard.vue'
import AudioSyncTestCard from '../components/TestCard/AudioSyncCard.vue'
import PlaceholderTestCard from '../components/TestCard/PlaceholderCard.vue'
import DeghostTestCard from '../components/TestCard/DeghostCard.vue'

import domtoimage from 'dom-to-image'
import InfoCircle from '../components/TestCard/InfoCircle.vue'

import Mousetrap from 'mousetrap'

Mousetrap.bind(
  ['command+f', 'ctrl+f', 'esc', 'f'],
  function () {
    window.ipcRenderer.send('closeTestCard')
  },
  'keyup'
)
Mousetrap.bind(['command+i', 'ctrl+i', 'i'], function () {
  window.ipcRenderer.send('testCardKeyPress', 'showInfo')
  return false
})
Mousetrap.bind(['command+m', 'ctrl+m', 'm', 'command+a', 'ctrl+a', 'a'], function () {
  window.ipcRenderer.send('testCardKeyPress', 'animated')
  return false
})
Mousetrap.bind(['command+w', 'ctrl+w'], function () {
  window.ipcRenderer.send('testCardKeyPress', 'windowed')
  return false
})
Mousetrap.bind(['command+r', 'ctrl+r'], function () {
  window.ipcRenderer.send('testCardKeyPress', 'raster')
  return false
})
Mousetrap.bind(['command+s', 'ctrl+s'], function () {
  window.ipcRenderer.send('exportCard')
  return false
})

const config = ref<Config>({
  notFilledCard: {
    bounds: false
  },
  mask: {
    enabled: false,
    imageSource: '',
    applyBounds: false
  }
})

export interface Info {
  cardSize: string
  circleSize: number
  displayFrequency: number
  time: string
  network: string[]
  networkIndex: number
}

const boundsInfo = ref(Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height))
const borderSize = ref(25)
const info = ref<Info>({
  cardSize: '',
  circleSize: 500,
  displayFrequency: 0,
  time: '00:00',
  network: ['127.0.0.1'],
  networkIndex: 0
})

const computedStyle = computed(() => {
  let r = {}
  if (!config.value.fullsize && config.value.screen != 0) {
    r.height = config.value.notFilledCard.height + 'px'
    r.width = config.value.notFilledCard.width + 'px'
    r.top = config.value.notFilledCard.top + 'px'
    r.left = config.value.notFilledCard.left + 'px'
  }
  if (config.value.raster && !config.value.windowed) {
    r.border = '1px solid white'
  } else {
    r.border = 'none'
  }

  if (config.value.notFilledCard.rotate == 90) {
    r.transform = 'rotate(90deg) translateY(-100%)'
    r.transformOrigin = 'top left'
  } else if (config.value.notFilledCard.rotate == 180) {
    r.transform = 'rotate(180deg)'
    // r.transformOrigin = '50% 50%'
  } else if (config.value.notFilledCard.rotate == 270) {
    r.transform = 'rotate(270deg) translateX(-100%)'
    r.transformOrigin = 'top left'
  }

  return r
})

onMounted(() => {
  console.log('Test card mounted')
  window.ipcRenderer.receive('config', function (args) {
    config.value = args
    updateCardSize()
    if (!config.value.visible) exportTestCard(args.export)
  })

  window.ipcRenderer.receive('displayFrequency', function (args) {
    info.value.displayFrequency = args
  })
  window.ipcRenderer.send('getScreens')

  updateCardSize()
  setTimeout(updateCardSize, 1000)
  updateTime()
  setInterval(updateTime, 1000)

  updateNetworkInfo()
  setInterval(updateNetworkInfo, 10000)
  window.ipcRenderer.receive('networkInfo', function (networkInfo) {
    info.value.network = networkInfo
  })
  setInterval(function () {
    info.value.networkIndex++
    if (info.value.networkIndex >= info.value.network.length) {
      info.value.networkIndex = 0
    }
  }, 5000)

  window.ipcRenderer.send('getConfigTestCard')

  // TODO re-add this
  // $message({
  //   customClass: 'modal',
  //   showClose: false,
  //   duration: 3000,
  //   message: 'Press escape to close test card'
  // })
  window.addEventListener('resize', function () {
    boundsInfo.value = Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height)
  })
  window.ipcRenderer.receive('exportCard', function () {
    console.log('exportCard', config.value.export)
    exportTestCard(config.value.export)
  })

  window.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault()
    },
    false
  )
})

function toggleWindowed() {
  window.ipcRenderer.send('testCardKeyPress', 'windowed')
}

function updateTime() {
  const cd = new Date()
  info.value.time =
    zeroPadding(cd.getHours(), 2) +
    ':' +
    zeroPadding(cd.getMinutes(), 2) +
    ':' +
    zeroPadding(cd.getSeconds(), 2)
}

function zeroPadding(num, digit) {
  let zero = ''
  for (let i = 0; i < digit; i++) {
    zero += '0'
  }
  return (zero + num).slice(-digit)
}

function closeTestCard() {
  window.ipcRenderer.send('closeTestCard')
}

function updateCardSize() {
  let w = 1280
  let h = 720
  if (config.value.windowed) {
    w = config.value.window.width
    h = config.value.window.height
  } else if (!config.value.fullsize) {
    w = config.value.notFilledCard.width
    h = config.value.notFilledCard.height
  } else {
    w = Math.round(visualViewport.width)
    h = Math.round(visualViewport.height)
  }
  info.value.cardSize = w + ' x ' + h
  updateBorderSize(w, h)
  updateInfoCircleSize(w, h)
}

function updateBorderSize(w, h) {
  borderSize.value = 25
  if (w < 720 || h < 720) {
    borderSize.value = 20
  }
  if (w < 600 || h < 600) {
    borderSize.value = 15
  }
  if (w < 400 || h < 400) {
    borderSize.value = 10
  }
  if (w < 250 || h < 250) {
    borderSize.value = 6
  }
}

function updateInfoCircleSize(w, h) {
  info.value.circleSize = 500
  if (w < 1600 || h < 1600) {
    info.value.circleSize = 400
  }
  if (w < 1300 || h < 1300) {
    info.value.circleSize = 300
  }
  if (w < 900 || h < 900) {
    info.value.circleSize = 200
  }
  if (w < 500 || h < 500) {
    info.value.circleSize = 150
  }
  if (w < 300 || h < 300) {
    info.value.circleSize = 100
  }
}

function exportTestCard(settings) {
  const wasAnimated = config.value.animated
  const wasShowingClock = config.value.showClock
  config.value.animated = false // stop animations in order to capture image
  config.value.showClock = false // hide the clock
  info.value.networkIndex = 0 // show hostname during screenshot

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
    config.value.animated = wasAnimated
    config.value.showClock = wasShowingClock
  })
}

function updateNetworkInfo() {
  window.ipcRenderer.send('networkInfo')
}
</script>

<style>
@font-face {
  font-family: Sansation;
  src: url('@assets/Sansation-Regular.ttf');
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
    linear-gradient(to right, red 1px, transparent 1px),
    linear-gradient(to bottom, red 1px, transparent 1px);
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
