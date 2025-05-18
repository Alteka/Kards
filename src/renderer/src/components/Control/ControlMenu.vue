<template>
  <el-row class="menu">
    <el-col
      id="enableLabel"
      :span="8"
      style="margin-top: 3px"
      :class="{ enabledText: config.visible }"
    >
      <span class="pointer" @click="config.visible = !config.visible">
        <i
          class="fas fa-power-off pointer"
          :class="{ green: config.visible, red: !config.visible }"
        ></i>
        Enable
      </span>
      <el-switch v-model="config.visible" style="margin-left: 4px"></el-switch>
    </el-col>

    <el-col :span="8">
      <el-button type="success" size="small" round @click="drawerAudio = true"
        ><i v-if="config.audio.enabled" class="fas fa-volume-up"></i
        ><i v-if="!config.audio.enabled" class="fas fa-volume-mute"></i> Audio</el-button
      >
      <el-button type="success" size="small" round @click="drawerImage = true"
        ><i class="fas fa-image"></i> Export</el-button
      >
    </el-col>

    <el-col :span="8" style="text-align: right">
      <el-dropdown size="small" :hide-on-click="false" @visible-change="handleMoreMenuChange">
        <el-button size="small" type="primary">
          More<i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="showAboutDialog = true"
              ><i class="fas fa-info green" style="width: 10px; text-align: center"></i>
              About</el-dropdown-item
            >
            <el-dropdown-item
              v-if="!confirmResetVisible"
              divided
              @click="confirmResetVisible = true"
              ><i class="fas fa-undo green" style="width: 10px; text-align: center"></i>
              Reset</el-dropdown-item
            >
            <el-dropdown-item v-else divided style="color: red" @click="reset()"
              ><i class="fas fa-undo green" style="width: 10px; text-align: center"></i> Are You
              Sure?</el-dropdown-item
            >
            <el-dropdown-item divided @click="openHelp"
              ><i class="fas fa-question green" style="width: 10px; text-align: center"></i>
              Help</el-dropdown-item
            >
            <el-dropdown-item divided @click="openLogs"
              ><i class="fas fa-clipboard-list green" style="width: 10px; text-align: center"></i>
              Logs</el-dropdown-item
            >

            <el-dropdown-item
              v-if="config.infoCircleAnimated"
              :disabled="
                (config.cardType != 'bars' &&
                  config.cardType != 'ramp' &&
                  config.cardType != 'grid') ||
                (config.cardType == 'bars' && config.bars.type == 'hdr')
              "
              divided
              @click="config.infoCircleAnimated = false"
              ><i class="fa-solid fa-circle-info green" style="width: 10px; text-align: center"></i>
              Static Info Circle</el-dropdown-item
            >
            <el-dropdown-item
              v-if="!config.infoCircleAnimated"
              :disabled="
                (config.cardType != 'bars' &&
                  config.cardType != 'ramp' &&
                  config.cardType != 'grid') ||
                (config.cardType == 'bars' && config.bars.type == 'hdr')
              "
              divided
              @click="config.infoCircleAnimated = true"
              ><i class="fa-solid fa-circle-info green" style="width: 10px; text-align: center"></i>
              Animate Info Circle</el-dropdown-item
            >

            <el-dropdown-item
              v-if="config.mask.enabled"
              divided
              @click="config.mask.enabled = false"
              ><i class="fas fa-mask green" style="width: 10px; text-align: center"></i> Disable
              Mask</el-dropdown-item
            >
            <el-dropdown-item
              v-if="!config.mask.enabled && config.mask.imageSource"
              divided
              @click="config.mask.enabled = true"
              ><i class="fas fa-mask green" style="width: 10px; text-align: center"></i> Enable
              Mask</el-dropdown-item
            >

            <el-dropdown-item :divided="!config.mask.imageSource" @click="selectMaskImage"
              ><i class="fas fa-image green" style="width: 10px; text-align: center"></i> Select
              Mask Image</el-dropdown-item
            >
            <el-dropdown-item
              v-if="config.mask.enabled && !config.windowed && !config.fullsize"
              @click="config.mask.applyBounds = !config.mask.applyBounds"
              ><i
                class="fas fa-expand-arrows-alt green"
                style="width: 10px; text-align: center"
              ></i>
              Toggle Mask Size</el-dropdown-item
            >

            <el-dropdown-item
              v-if="config.raster"
              :disabled="config.windowed"
              divided
              @click="config.raster = false"
              ><i class="fas fa-border-all green" style="width: 10px; text-align: center"></i>
              Disable Raster Box</el-dropdown-item
            >
            <el-dropdown-item
              v-else
              :disabled="config.windowed"
              divided
              @click="config.raster = true"
              ><i class="fas fa-border-all green" style="width: 10px; text-align: center"></i>
              Enable Raster Box</el-dropdown-item
            >

            <el-dropdown-item divided @click="exportSettings"
              ><i class="fas fa-file-export green" style="width: 10px; text-align: center"></i>
              Export Settings</el-dropdown-item
            >
            <el-dropdown-item @click="importSettings"
              ><i class="fas fa-file-import green" style="width: 10px; text-align: center"></i>
              Import Settings</el-dropdown-item
            >
            <el-dropdown-item @click="showShareDialog = true"
              ><i class="fas fa-share green" style="width: 10px; text-align: center"></i> Share
              Card</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>

    <el-drawer v-model="drawerAudio" :with-header="false" direction="btt" size="150px">
      <el-row class="drawerContent">
        <el-checkbox-group v-model="config.audio.options" size="small" style="margin: auto">
          <el-checkbox-button value="voice">Name</el-checkbox-button>
          <el-checkbox-button value="text">Text</el-checkbox-button>
          <el-checkbox-button value="tone">Tone</el-checkbox-button>
          <el-checkbox-button value="pink">Pink</el-checkbox-button>
          <el-checkbox-button value="white">White</el-checkbox-button>
          <el-checkbox-button value="stereo">Stereo</el-checkbox-button>
          <el-checkbox-button value="phase">Phase</el-checkbox-button>
          <el-tooltip content="20Hz - 20kHz" placement="top">
            <el-checkbox-button value="sweep">Sweep</el-checkbox-button>
          </el-tooltip>
          <el-tooltip :content="config.audio.fileName" placement="top">
            <el-checkbox-button value="file">File</el-checkbox-button>
          </el-tooltip>
        </el-checkbox-group>
      </el-row>

      <el-row v-if="config.audio.options.includes('text')" style="height: 45px">
        <el-col :span="23">
          <el-form-item label="Text" label-width="70px">
            <el-input v-model="config.audio.text"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row style="padding-left: 10px; margin-left: 20px; margin-right: 20px">
        <el-col
          style="margin-top: 7px; color: #606266"
          :span="4"
          :class="{ enabledText: config.audio.enabled }"
        >
          Enable
          <el-switch
            v-model="config.audio.enabled"
            :disabled="config.audio.options.length == 0"
          ></el-switch>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Device" label-width="70px">
            <el-select v-model="config.audio.deviceId" placeholder="Select" style="width: 310px">
              <el-option
                v-for="item in audioDevices"
                :key="item.deviceId"
                :label="item.label"
                :value="item.deviceId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="small" @click="loadAudioFile"
            ><i class="far fa-file-audio"></i> Select File</el-button
          >
        </el-col>
      </el-row>
    </el-drawer>

    <audio id="stereo" />
    <audio id="phase" />
    <audio id="pink" />
    <audio id="white" />
    <audio id="tone" />
    <audio id="sweep" />
    <audio id="voice" :src="config.audio.voiceData" />
    <audio id="text" :src="config.audio.textData" />
    <audio id="file" :src="config.audio.fileData" />

    <el-drawer v-model="drawerImage" :with-header="false" direction="btt" size="100px">
      <el-row class="drawerContent">
        <el-col :span="10">
          <el-radio-group
            v-model="config.export.imageSource"
            size="medium"
            :disabled="config.cardType == 'audioSync' || config.cardType == 'deghost'"
          >
            <el-radio-button value="card">Test Card</el-radio-button>
            <el-tooltip
              :disabled="!config.fullsize"
              content="Disable 'Fill Output' and 'Windowed' to save test card within larger canvas"
              placement="bottom"
              :open-delay="500"
            >
              <el-radio-button value="canvas" :disabled="config.fullsize"
                >Whole Canvas</el-radio-button
              >
            </el-tooltip>
          </el-radio-group>
        </el-col>
        <el-col :span="11">
          <el-radio-group
            v-model="config.export.target"
            size="medium"
            :disabled="config.cardType == 'audioSync' || config.cardType == 'deghost'"
          >
            <el-radio-button value="file">Save to File</el-radio-button>
            <el-radio-button value="wallpaper">Set Wallpaper</el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="3">
          <el-button
            size="medium"
            type="primary"
            :disabled="config.cardType == 'audioSync' || config.cardType == 'deghost'"
            @click="exportCard"
            >OK</el-button
          >
        </el-col>
      </el-row>
      <el-row>
        <el-alert
          v-if="config.cardType == 'audioSync'"
          title="Choose a different card - We can't save AV Sync to a still image..."
          type="warning"
          center
          show-icon
          effect="dark"
          :closable="false"
        ></el-alert>
        <el-alert
          v-if="config.cardType == 'deghost'"
          title="Choose a different card - An image of deghost makes no sense"
          type="warning"
          center
          show-icon
          effect="dark"
          :closable="false"
        ></el-alert>
      </el-row>
    </el-drawer>

    <control-share v-model="showShareDialog" :config="config"></control-share>
    <control-about v-model="showAboutDialog" :dark-mode="darkMode"></control-about>
  </el-row>
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { ElNotification } from 'element-plus'
import ControlShare from './ControlShare.vue'
import ControlAbout from './ControlAbout.vue'

import stereo from '@assets/audio/stereo.wav'
import pink from '@assets/audio/pink.wav'
import phase from '@assets/audio/phase.wav'
import tone from '@assets/audio/tone.wav'
import white from '@assets/audio/white.wav'
import sweep from '@assets/audio/sweep.wav'
import type { Config } from '@renderer/src/types/config'
import { onMounted, ref, watch } from 'vue'

let loadingInstance

const config = defineModel<Config>({ required: true })
defineProps<{ darkMode: boolean }>()

const confirmResetVisible = ref(false)
const drawerAudio = ref(false)
const drawerImage = ref(false)
const curAudio = ref(null)
const playing = ref(false)
const name = ref('')
const voiceTimer = ref(null)
const text = ref('')
const textTimer = ref(null)
const audioDevices = ref<MediaDeviceInfo[]>([])
const showShareDialog = ref(false)
const showAboutDialog = ref(false)

watch(
  config,
  (val, oldVal) => {
    document.getElementById('stereo').setSinkId(val.audio.deviceId)
    document.getElementById('phase').setSinkId(val.audio.deviceId)
    document.getElementById('pink').setSinkId(val.audio.deviceId)
    document.getElementById('white').setSinkId(val.audio.deviceId)
    document.getElementById('tone').setSinkId(val.audio.deviceId)
    document.getElementById('sweep').setSinkId(val.audio.deviceId)
    document.getElementById('voice').setSinkId(val.audio.deviceId)
    document.getElementById('text').setSinkId(val.audio.deviceId)
    document.getElementById('file').setSinkId(val.audio.deviceId)

    if (val.name != name.value) {
      name.value = val.name
      doNameUpdate()
    }

    if (val.audio.text != text.value) {
      text.value = val.audio.text
      doTextUpdate()
    }

    if (val.audio.enabled && !playing.value) {
      console.log('Starting audio output')
      curAudio.value = null // so it starts from the first item
      playNext()
    }
    if (val.audio.options.length == 0) {
      stopAudio()
      config.value.audio.enabled = false // stop playing if no options selected
    }
    if (!val.audio.enabled && playing.value) {
      stopAudio()
    }
    if (val.fullsize == 1) {
      // imageSource.value = 'card' // TODO no idea why it was like this?
    }

    if (val.fullsize || val.windowed) {
      config.value.export.imageSource = 'card'
    }

    if (
      val.audio.voiceData != oldVal.audio.voiceData &&
      playing.value &&
      curAudio.value == 'voice'
    ) {
      setTimeout(function () {
        curAudio.value = null
        stopAudio()
        playNext()
      }, 500)
    }
    if (val.audio.textData != oldVal.audio.textData && playing.value && curAudio.value == 'text') {
      setTimeout(function () {
        curAudio.value = null
        stopAudio()
        playNext()
      }, 500)
    }
    if (val.audio.fileData != oldVal.audio.fileData && playing.value && curAudio.value == 'file') {
      setTimeout(function () {
        curAudio.value = null
        stopAudio()
        playNext()
      }, 500)
    }
  },
  { deep: true }
)

onMounted(() => {
  updateDevices()
  setInterval(updateDevices, 5000)
  setTimeout(doNameUpdate, 2000)

  document.getElementById('stereo').src = stereo
  document.getElementById('pink').src = pink
  document.getElementById('phase').src = phase
  document.getElementById('tone').src = tone
  document.getElementById('white').src = white
  document.getElementById('sweep').src = sweep

  window.ipcRenderer.receive('exportCardCompleted', function (msg) {
    if (msg) {
      ElNotification({
        title: 'Oops',
        message: msg,
        duration: 2500,
        showClose: false,
        onClick: function () {
          close()
        }
      })
    }
    loadingInstance.close()
  })

  window.ipcRenderer.receive('importSettings', function (msg) {
    ElNotification({
      title: 'Import Settings',
      message: msg,
      duration: 2500,
      showClose: false,
      onClick: function () {
        close()
      }
    })
  })

  window.ipcRenderer.receive('aboutDialog', function () {
    showAboutDialog.value = true
  })
})

function handleMoreMenuChange(visible) {
  if (!visible) {
    confirmResetVisible.value = false
  }
}
function loadAudioFile() {
  window.ipcRenderer.send('loadAudioFile')
}
function updateDevices() {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    audioDevices.value = devices
      .filter((device) => device.kind === 'audiooutput')
      .filter((device) => device.deviceId != 'communications')
    window.ipcRenderer.send('audioDevices', JSON.parse(JSON.stringify(audioDevices.value)))
  })
}
function ipcSend(val) {
  window.ipcRenderer.send(val)
}
function reset() {
  window.ipcRenderer.send('resetDefault')
  confirmResetVisible.value = false
}
function exportCard() {
  window.ipcRenderer.send('exportCard')

  loadingInstance = ElLoading.service({
    fullscreen: true,
    text: 'Capturing Test Card',
    background: 'rgba(0, 0, 0, 0.85)'
  })
  drawerImage.value = false
}
function importSettings() {
  window.ipcRenderer.send('importSettings')
}
function exportSettings() {
  window.ipcRenderer.send('exportSettings')
}
function selectMaskImage() {
  window.ipcRenderer.send('selectMaskImage')
}
function openHelp() {
  window.ipcRenderer.send('openUrl', 'https://alteka.solutions/kards/help')
}
function openLogs() {
  window.window.ipcRenderer.send('openLogs')
}
function stopAudio() {
  console.log('Stopping audio output')
  stopFile('tone')
  stopFile('white')
  stopFile('pink')
  stopFile('phase')
  stopFile('sweep')
  stopFile('stereo')
  stopFile('file')
  stopFile('text')
  playing.value = false
}

function stopFile(file) {
  let f = document.getElementById(file)
  f.pause()
  f.currentTime = 0
}

function playNext() {
  if (config.value.audio.enabled) {
    playing.value = true
    let opts = config.value.audio.options

    if (curAudio.value == null && opts.length > 0) {
      curAudio.value = opts[0]
    } else if (opts.length > 0) {
      const curIndex = opts.indexOf(curAudio.value)
      if (opts[curIndex + 1] == undefined) {
        curAudio.value = opts[0]
      } else {
        curAudio.value = opts[curIndex + 1]
      }
    }

    playFile(curAudio.value)
  } else {
    playing.value = false
  }
}
function playFile(file) {
  var x = document.getElementById(file)
  x.play()
  x.onended = function () {
    setTimeout(playNext, 500)
  }
}
function doNameUpdate() {
  clearTimeout(voiceTimer.value)
  voiceTimer.value = setTimeout(updateName, 1000)
}
function updateName() {
  window.ipcRenderer.send('createVoice')
}
function doTextUpdate() {
  clearTimeout(textTimer.value)
  textTimer.value = setTimeout(updateText, 1000)
}

function updateText() {
  window.ipcRenderer.send('updateAudioText')
}
</script>

<style scoped>
.menu {
  padding: 8px;
  background-color: #3d3d3b;
  color: white;
  border-top: 3px solid #6ab42f;
}
.drawerContent {
  text-align: center;
  padding: 10px;
  outline: none;
}
.enabledText {
  color: #6ab42f !important;
}
.pointer:hover {
  cursor: pointer;
}
.el-alert {
  width: 95%;
  margin-left: 2.5%;
  margin-bottom: 10px;
}
.red {
  color: #d11;
  margin-right: 5px;
}
</style>
