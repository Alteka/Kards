<template>
  <div ref="wrapper" style="position: relative" :class="{ darkMode: darkMode }">
    <el-form ref="form" :model="config" label-width="120px" size="small">
      <control-screen v-model="config"></control-screen>
      <el-divider content-position="center">Select Card Type</el-divider>

      <el-row style="margin-left: 8px; margin-right: 8px">
        <el-tabs
          v-model="config.cardType"
          type="border-card"
          :stretch="true"
          style="height: 165px; width: 100%"
        >
          <el-tab-pane label="Alteka" name="alteka">
            <control-alteka v-model="config.alteka" :colors="predefineColors" />
          </el-tab-pane>

          <el-tab-pane label="Bars" name="bars">
            <control-bars v-model="config.bars" />
          </el-tab-pane>

          <el-tab-pane label="Grid" name="grid">
            <control-grid v-model="config.grid" :colors="predefineColors" />
          </el-tab-pane>

          <el-tab-pane label="Ramp" name="ramp">
            <control-ramp v-model="config.ramp" />
          </el-tab-pane>

          <el-tab-pane label="Name" name="placeholder">
            <control-placeholder v-model="config.placeholder" :colors="predefineColors" />
          </el-tab-pane>

          <el-tab-pane label="Sync" name="audioSync">
            <control-audio-sync v-model="config.audioSync" :display-frequency="displayFrequency" />
          </el-tab-pane>

          <el-tab-pane label="DeGhost" name="deghost">
            <control-deghost v-model="config.deghost" />
          </el-tab-pane>

          <el-tab-pane label="LED" name="led">
            <control-led v-model="config.led" :colors="predefineColors" />
          </el-tab-pane>
        </el-tabs>
      </el-row>

      <el-divider content-position="center">Output Options</el-divider>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Name" label-width="66px">
            <el-input v-model="config.name" placeholder=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Show Info"
            ><i class="fas fa-info-circle green"></i>
            <el-switch v-model="config.showInfo"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Motion"
            ><i
              class="fas fa-external-link-square-alt fa-rotate-90 green"
              style="position: relative; top: 1px; margin-right: 5px"
            ></i>
            <el-switch
              v-model="config.animated"
              :disabled="config.cardType == 'audioSync' || config.cardType == 'deghost'"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="config.screen != 0">
        <el-col :span="8">
          <el-form-item label="Windowed"
            ><i class="fas fa-window-maximize green"></i>
            <el-switch v-model="config.windowed"></el-switch>
          </el-form-item>
        </el-col>
        <el-col v-if="config.windowed && config.cardType !== 'led'" :span="8">
          <el-form-item label="Width" label-width="50px">
            <el-input-number
              v-model="config.window.width"
              controls-position="right"
              :step="5"
              :min="48"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col v-if="config.windowed && config.cardType !== 'led'" :span="8">
          <el-form-item label="Height" label-width="50px">
            <el-input-number
              v-model="config.window.height"
              controls-position="right"
              :step="5"
              :min="39"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col v-if="config.windowed && config.cardType == 'led'" :span="16">
          <el-form-item label="Card Size Set by LED: " label-width="225px">
            <span style="color: #e6a23c">
              {{ config.led.columns * config.led.width }} x
              {{ config.led.rows * config.led.height }} pixels
            </span>
          </el-form-item>
        </el-col>
        <el-col v-if="!config.windowed" :span="8">
          <el-form-item label="Fill Output"
            ><i class="fas fa-expand-arrows-alt green"></i>
            <el-switch v-model="config.fullsize" :disabled="config.cardType == 'led'"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item v-if="!config.fullsize" label="Show Bounds"
            ><i class="fas fa-border-style green"></i>
            <el-switch v-model="config.notFilledCard.bounds"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="!config.fullsize && config.screen != 0">
        <el-col :span="2"></el-col>
        <el-col :span="4">
          <el-form-item label="Card Size"> </el-form-item>
        </el-col>
        <el-col v-if="config.cardType == 'led'" :span="16">
          <el-form-item label="Set by LED: " label-width="225px">
            <span style="color: #e6a23c">
              {{ config.led.columns * config.led.width }} x
              {{ config.led.rows * config.led.height }} pixels
            </span>
          </el-form-item>
        </el-col>
        <el-col v-if="config.cardType !== 'led'" :span="8">
          <el-form-item label="Width" label-width="80px">
            <el-input-number
              v-model="config.notFilledCard.width"
              controls-position="right"
              :step="5"
              :min="1"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col v-if="config.cardType !== 'led'" :span="8">
          <el-form-item label="Height" label-width="80px">
            <el-input-number
              v-if="config.cardType == 'led'"
              v-model="ledHeight"
              :disabled="true"
              controls-position="right"
            />
            <el-input-number
              v-else
              v-model="config.notFilledCard.height"
              controls-position="right"
              :step="5"
              :min="1"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="!config.fullsize && config.screen != 0">
        <el-col :span="2"></el-col>
        <el-col :span="4">
          <el-form-item label="Card Position"> </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Left" label-width="80px">
            <el-input-number
              v-model="config.notFilledCard.left"
              controls-position="right"
              :step="5"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Top" label-width="80px">
            <el-input-number
              v-model="config.notFilledCard.top"
              controls-position="right"
              :step="5"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="!config.fullsize && config.screen != 0">
        <el-col :span="2"></el-col>
        <el-col :span="4">
          <el-form-item label="Card Rotation"> </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="" label-width="80px">
            <el-radio-group v-model="config.notFilledCard.rotate" size="small">
              <el-radio-button :value="0">0º</el-radio-button>
              <el-radio-button :value="90">90º</el-radio-button>
              <el-radio-button :value="180">180º</el-radio-button>
              <el-radio-button :value="270">270º</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <control-menu v-model="config" :dark-mode="darkMode" />
    </el-form>
  </div>
</template>

<script setup lang="ts">
import ControlBars from '../components/Control/ControlBars.vue'
import ControlGrid from '../components/Control/ControlGrid.vue'
import ControlLed from '../components/Control/ControlLed.vue'
import ControlRamp from '../components/Control/ControlRamp.vue'
import ControlPlaceholder from '../components/Control/ControlPlaceholder.vue'
import ControlAlteka from '../components/Control/ControlAlteka.vue'
import ControlAudioSync from '../components/Control/ControlAudioSync.vue'
import ControlMenu from '../components/Control/ControlMenu.vue'
import ControlScreen from '../components/Control/ControlScreen.vue'
import ControlDeghost from '../components/Control/ControlDeghost.vue'
import defaultConfig from '@shared/defaultConfig.json'
import Mousetrap from 'mousetrap'
import {
  computed,
  onBeforeMount,
  onMounted,
  ref,
  watch,
  nextTick,
  watchEffect,
  useTemplateRef
} from 'vue'
import { useElementSize } from '@vueuse/core'
import type { Config } from '@shared/config'

Mousetrap.bind(
  'esc',
  function () {
    window.ipcRenderer.send('closeTestCard')
  },
  'keyup'
)

const config = ref<Config>(defaultConfig as Config)
const sync = ref(false)
const darkMode = ref(false)
const displayFrequency = ref(0)

const predefineColors = ref([
  '#ffffff',
  '#d3d3d3',
  '#7f7f7f',
  '#3e3e3e',
  '#000000',
  '#ff0000',
  '#ff7f00',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#ff00ff',
  '#BF3030',
  '#BF9B30',
  '#78BF30',
  '#30BF54',
  '#30BFBF',
  '#3054BF',
  '#7830BF',
  '#BF309B'
])

const wrapper = useTemplateRef<HTMLDivElement>('wrapper')

const ledHeight = computed(() => {
  return config.value.led.height * config.value.led.rows
})

watch(
  config,
  (val) => {
    if (sync.value) {
      window.ipcRenderer.send('config', JSON.parse(JSON.stringify(config.value)))
    }
    if (val.windowed) {
      config.value.fullsize = true
    }
    if (val.cardType == 'led' && !val.windowed) {
      config.value.fullsize = false
    }
    if (val.cardType == 'led' && val.windowed) {
      config.value.window.width = val.led.width * val.led.columns
      config.value.window.height = val.led.height * val.led.rows
    }
    if (val.cardType == 'led') {
      config.value.notFilledCard.width = val.led.width * val.led.columns
      config.value.notFilledCard.height = val.led.height * val.led.rows
    }
  },
  { deep: true }
)

onBeforeMount(() => {
  window.ipcRenderer.receive('closeTestCard', function () {
    config.value.visible = false
  })
  window.ipcRenderer.receive('config', function (val) {
    config.value = val
    sync.value = true
  })
  window.ipcRenderer.receive('darkMode', function (val) {
    darkMode.value = val
  })
  window.ipcRenderer.receive('screens', function (data) {
    for (const scr of data.all) {
      if (config.value.screen == scr.id) {
        displayFrequency.value = scr.displayFrequency
      }
    }
  })
  window.ipcRenderer.send('getScreens')
  window.ipcRenderer.send('getConfigControl')
})

onMounted(() => {
  nextTick(() => {
    window.ipcRenderer.send('controlResize', {
      height: wrapper.value!.clientHeight
    })
  })
  Mousetrap.bind(['command+f', 'ctrl+f'], function () {
    config.value.visible = !config.value.visible
    return false
  })
  Mousetrap.bind(['command+i', 'ctrl+i'], function () {
    config.value.showInfo = !config.value.showInfo
    return false
  })
  Mousetrap.bind(['command+m', 'ctrl+m'], function () {
    config.value.animated = !config.value.animated
    return false
  })
  // bindings for windows...
  Mousetrap.bind(['ctrl+1'], function () {
    config.value.cardType = 'alteka'
    return false
  })
  Mousetrap.bind(['ctrl+2'], function () {
    config.value.cardType = 'bars'
    return false
  })
  Mousetrap.bind(['ctrl+3'], function () {
    config.value.cardType = 'grid'
    return false
  })
  Mousetrap.bind(['ctrl+4'], function () {
    config.value.cardType = 'ramp'
    return false
  })
  Mousetrap.bind(['ctrl+5'], function () {
    config.value.cardType = 'placeholder'
    return false
  })
  Mousetrap.bind(['ctrl+6'], function () {
    config.value.cardType = 'audioSync'
    return false
  })
  Mousetrap.bind(['ctrl+7'], function () {
    config.value.cardType = 'deghost'
    return false
  })
  Mousetrap.bind(['ctrl+8'], function () {
    config.value.cardType = 'led'
    return false
  })
})

const { width, height } = useElementSize(wrapper)

watchEffect(() => {
  if (!width.value || !height.value) return
  window.ipcRenderer.send('controlResize', {
    height: Math.round(height.value),
    width: Math.round(width.value)
  })
})
</script>

<style>
body {
  font-family: Sansation, Helvetica, sans-serif;
  overflow: hidden !important;
  margin: 0;
}
@font-face {
  font-family: Sansation;
  src: url('@assets/Sansation-Regular.ttf');
}
.logo {
  margin-top: 10px;
  margin-bottom: 0px;
  font-family: Sansation;
}
.green {
  color: #6ab42f;
  margin-right: 5px;
}
.darkMode {
  background: #222;
}
.darkMode .el-divider {
  background: #555;
}
.darkMode .el-divider__text {
  background: #222;
  color: #aaa;
}
.darkMode label {
  color: #bbb;
}
.darkMode .el-tabs--border-card {
  background: #333;
  border: 1px solid #111;
}
.darkMode .el-tabs--border-card > .el-tabs__header {
  background: #292929;
  border-bottom: 1px solid #111;
}
.darkMode .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  background: #333;
  border-right: 1px solid #111;
  border-left: 1px solid #111;
}
.darkMode .el-color-picker__trigger {
  border: 1px solid #666;
}
.el-radio-button__inner {
  color: #777;
}
.el-checkbox-button__inner {
  color: #777;
}
.darkMode .el-radio-button__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-radio-button__inner:hover {
  border-color: #6ab42f;
}
.darkMode .el-radio-button:first-child .el-radio-button__inner {
  border-left: 1px solid #666;
}
.darkMode .el-button :not(.el-button--primary, span, i) {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-button.el-button--default {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-input__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-input-number__increase {
  background: #292929;
  color: #ddd;
}
.darkMode .el-input-number__decrease {
  background: #292929;
  color: #ddd;
}
.darkMode .el-drawer {
  background: #292929;
  border-top: 3px solid #6ab42f;
  color: #ddd;
}
.darkMode .el-checkbox-button__inner {
  background: none;
}

.el-dialog {
  border: 1.5px solid #6ab42f;
}
.darkMode .el-dialog {
  background: #333;
}
.darkMode .el-dialog__title {
  color: #ddd;
}
.darkMode .el-dialog__body {
  color: #ddd;
  padding-top: 5px;
  padding-bottom: 5px;
}
.el-dialog--center .el-dialog__body {
  padding-top: 5px;
  padding-bottom: 5px;
}
.darkMode .el-button:hover {
  border-color: #6ab42f;
}
.el-dialog__body {
  padding: 10px;
}
.darkMode .el-input-group__append {
  background: #3d3d3d;
  border: 1px solid #666;
}
.darkMode .el-input-group__append:hover {
  color: #6ab42f;
}
.darkMode .el-input.is-disabled .el-input__inner {
  background: #444;
}
</style>
