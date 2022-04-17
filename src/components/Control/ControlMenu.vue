<template>
  <el-row class="menu">

    <el-col id="enableLabel" :span="8" style="margin-top: 3px;" :class="{ enabledText: config.visible }">
      <span class="pointer" @click="config.visible = !config.visible">
        <i class="fas fa-power-off pointer" :class="{ green: config.visible, red:!config.visible }"></i> Enable </span>
        <el-switch style="margin-left: 4px;" v-model="config.visible"></el-switch>
    </el-col>

    <el-col :span="8">
        <el-button type="success" size="mini" round v-on:click="drawerAudio = true"><i v-if="config.audio.enabled" class="fas fa-volume-up"></i><i v-if="!config.audio.enabled" class="fas fa-volume-mute"></i> Audio</el-button>
        <el-button type="success" size="mini" round v-on:click="drawerImage = true"><i class="fas fa-image"></i> Export</el-button>
    </el-col>

    <el-col :span="8" style="text-align: right">
      <el-dropdown size="mini" :hide-on-click="false" @visible-change="handleMoreMenuChange">
        <el-button size="mini" type="primary">
          More<i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="showAboutDialog = true"><i class="fas green">V</i>Kards v{{ require('../../../package.json').version }}</el-dropdown-item>
          <el-dropdown-item divided v-if="!confirmResetVisible" @click="confirmResetVisible = true"><i class="fas fa-undo green"></i> Reset</el-dropdown-item>
          <el-dropdown-item divided v-else @click="reset()" style="color: red"><i class="fas fa-undo green"></i> Are You Sure?</el-dropdown-item>
          <el-dropdown-item divided @click="openHelp"><i class="fas fa-question green"></i> Help</el-dropdown-item>
          <el-dropdown-item divided @click="openLogs"><i class="fas fa-clipboard-list green"></i> Logs</el-dropdown-item>
          <el-dropdown-item divided @click="exportSettings"><i class="fas fa-file-export green"></i> Export Settings</el-dropdown-item>
          <el-dropdown-item @click="importSettings"><i class="fas fa-file-import green"></i> Import Settings</el-dropdown-item>
          <el-dropdown-item @click="showShareDialog = true"><i class="fas fa-share green"></i> Share Card</el-dropdown-item>
        </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-col>

    <el-drawer :with-header="false" v-model="drawerAudio" direction="btt" size="150px">
      <el-row class="drawerContent">
        <el-checkbox-group v-model="config.audio.options" size="medium" style="margin: auto;">
          <el-checkbox-button label="voice">Voice</el-checkbox-button>
          <el-checkbox-button label="text">Text</el-checkbox-button>
          <el-checkbox-button label="tone">Tone</el-checkbox-button>
          <el-checkbox-button label="pink">Pink</el-checkbox-button>
          <el-checkbox-button label="white">White</el-checkbox-button>
          <el-checkbox-button label="stereo">Stereo</el-checkbox-button>
          <el-checkbox-button label="phase">Phase</el-checkbox-button>
          <el-tooltip :content="config.audio.fileName" placement="top">
            <el-checkbox-button label="file">File</el-checkbox-button>
          </el-tooltip>
        </el-checkbox-group>
      </el-row>

      <el-row v-if="config.audio.options.includes('text')" style="height: 45px;">
        <el-col :span="23">
          <el-form-item label="Text" label-width="70px">
            <el-input v-model="config.audio.text"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row style="padding-left: 10px; margin-left: 20px; margin-right: 20px;">
        <el-col style="margin-top: 7px; color: #606266;" :span="4" :class="{ enabledText: config.audio.enabled }">
          Enable <el-switch :disabled="config.audio.options.length == 0" v-model="config.audio.enabled"></el-switch>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Device" label-width="70px">
            <el-select v-model="config.audio.deviceId" placeholder="Select" style="width: 310px;">
                <el-option v-for="item in audioDevices" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" size="small" @click="loadAudioFile"><i class="far fa-file-audio"></i> Select File</el-button>
        </el-col>
      </el-row>

    </el-drawer>

    <audio id="stereo" />
    <audio id="phase" />
    <audio id="pink" />
    <audio id="white" />
    <audio id="tone" />
    <audio :src="config.audio.voiceData" id="voice" />
    <audio :src="config.audio.textData" id="text" />
    <audio :src="config.audio.fileData" id="file" />

    <el-drawer :with-header="false" v-model="drawerImage" direction="btt" size="100px">
      <el-row class="drawerContent">
        <el-col :span="10">
          <el-radio-group v-model="config.export.imageSource" size="medium" :disabled="config.cardType=='audioSync' || config.cardType=='deghost'">
            <el-radio-button label="card">Test Card</el-radio-button>
              <el-tooltip :disabled="!config.fullsize" content="Disable 'Fill Output' and 'Windowed' to save test card within larger canvas" placement="bottom" :open-delay="500">
                <el-radio-button label="canvas" :disabled="config.fullsize">Whole Canvas</el-radio-button>
              </el-tooltip>
          </el-radio-group>
        </el-col>
        <el-col :span="11">
          <el-radio-group v-model="config.export.target" size="medium" :disabled="config.cardType=='audioSync' || config.cardType=='deghost'">
            <el-radio-button label="file">Save to File</el-radio-button>
            <el-radio-button label="wallpaper">Set Wallpaper</el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="3">
          <el-button size="medium" type="primary" :disabled="config.cardType=='audioSync' || config.cardType=='deghost'" v-on:click="exportCard">OK</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-alert v-if="config.cardType == 'audioSync'" title = "Choose a different card - We can't save AV Sync to a still image..." type="warning" center show-icon effect="dark" :closable="false"></el-alert>
        <el-alert v-if="config.cardType == 'deghost'" title = "Choose a different card - An image of deghost makes no sense" type="warning" center show-icon effect="dark" :closable="false"></el-alert>
      </el-row>
    </el-drawer>

    <control-share v-model="showShareDialog" :config="config"></control-share>
    <control-about v-model="showAboutDialog" :darkMode="darkMode"></control-about>
  </el-row>
</template>

<script>
import { ElLoading } from 'element-plus'
import { ElNotification } from 'element-plus'
import ControlShare from './ControlShare.vue'
import ControlAbout from './ControlAbout.vue'

let loadingInstance

  export default {
    components: { ControlShare, ControlAbout },
    props: {
      modelValue: Object, // v-model object
      darkMode: Boolean
    },
    computed: {
      config: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      }
    },
    data: function() {
      return {
        confirmResetVisible: false,
        drawerAudio: false,
        drawerImage: false,
        curAudio: null,
        playing: false,
        name: "",
        voiceTimer: null,
        text: "",
        textTimer: null,
        audioDevices: [],
        showShareDialog: false,
        showAboutDialog: false
      }
    },
    mounted: function() {
      this.updateDevices()
      setInterval(this.updateDevices, 5000)
      setTimeout(this.doNameUpdate, 2000)

      document.getElementById('stereo').src = require("@/assets/audio/stereo.wav")
      document.getElementById('pink').src = require("@/assets/audio/pink.wav")
      document.getElementById('phase').src = require("@/assets/audio/phase.wav")
      document.getElementById('tone').src = require("@/assets/audio/tone.wav")
      document.getElementById('white').src = require("@/assets/audio/white.wav")

      window.ipcRenderer.receive('exportCardCompleted', function(msg) {
        if (msg) {
          ElNotification({ title: 'Oops', message: msg, duration: 2500, showClose: false, onClick: function() { this.close() } })
        } 
        loadingInstance.close()
      })

      window.ipcRenderer.receive('importSettings', function(msg) {
        ElNotification({ title: 'Import Settings', message: msg, duration: 2500, showClose: false, onClick: function() { this.close() } })
      })
      
    },
    watch: {
      config: {
        handler: function (val, oldVal) { 
            document.getElementById('stereo').setSinkId(val.audio.deviceId)
            document.getElementById('phase').setSinkId(val.audio.deviceId)
            document.getElementById('pink').setSinkId(val.audio.deviceId)
            document.getElementById('white').setSinkId(val.audio.deviceId)
            document.getElementById('tone').setSinkId(val.audio.deviceId)
            document.getElementById('voice').setSinkId(val.audio.deviceId)
            document.getElementById('text').setSinkId(val.audio.deviceId)
            document.getElementById('file').setSinkId(val.audio.deviceId)

            if (val.name != this.name) {
              this.name = val.name
              this.doNameUpdate()
            }

            if (val.audio.text != this.text) {
              this.text = val.audio.text
              this.doTextUpdate()
            }

            if (val.audio.enabled && !this.playing) {
              console.log('Starting audio output')
              this.curAudio = null // so it starts from the first item
              this.playNext()
            }
            if (val.audio.options.length == 0) {
              this.stopAudio()
              this.config.audio.enabled = false // stop playing if no options selected
            }
            if (!val.audio.enabled && this.playing) {
              this.stopAudio()
            }
            if (val.fullsize == 1) {
              this.imageSource = "card"
            }

            if (val.fullsize || val.windowed ) {
              this.config.export.imageSource = "card"
            }

            let vm = this
            if (val.audio.voiceData != oldVal.audio.voiceData && this.playing && this.curAudio == 'voice') {
              setTimeout(function() {
                vm.curAudio = null
                vm.stopAudio()
                vm.playNext()
              }, 500)
            }
            if (val.audio.textData != oldVal.audio.textData && this.playing && this.curAudio == 'text') {
              setTimeout(function() {
                vm.curAudio = null
                vm.stopAudio()
                vm.playNext()
              }, 500)
            }
            if (val.audio.fileData != oldVal.audio.fileData && this.playing && this.curAudio == 'file') {
              setTimeout(function() {
                vm.curAudio = null
                vm.stopAudio()
                vm.playNext()
              }, 500)
            }
         },
        deep: true
      },
    },
    methods: {
      handleMoreMenuChange: function(visible) {
        if (!visible) {
          this.confirmResetVisible = false
        }
      },
      loadAudioFile: function() {
        window.ipcRenderer.send("loadAudioFile")
      },
      updateDevices: function() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          this.audioDevices = devices.filter(device => device.kind === 'audiooutput').filter(device => device.deviceId != 'communications')
          window.ipcRenderer.send('audioDevices', JSON.parse(JSON.stringify(this.audioDevices)))
        })  
      },
      ipcSend: function(val) {
        window.ipcRenderer.send(val)
      },
      reset: function() {
        window.ipcRenderer.send('resetDefault')
        this.confirmResetVisible = false
      },
      exportCard: function() {
        window.ipcRenderer.send('exportCard')

        loadingInstance = ElLoading.service({ fullscreen: true, text:"Capturing Test Card", background: 'rgba(0, 0, 0, 0.85)'})
        this.drawerImage = false        
      },
      importSettings: function() {
        window.ipcRenderer.send('importSettings')
      },
      exportSettings: function() {
        window.ipcRenderer.send('exportSettings')
      },
      openHelp: function() {
        window.ipcRenderer.send('openUrl', 'https://alteka.solutions/kards/help')
      },
      openLogs: function() {
        window.window.ipcRenderer.send('openLogs')
      },
      stopAudio: function() {
        console.log('Stopping audio output')
        this.stopFile('tone')
        this.stopFile('white')
        this.stopFile('pink')
        this.stopFile('phase')
        this.stopFile('stereo')
        this.stopFile('file')
        this.stopFile('text')
        this.playing = false
      },
      stopFile: function(file) {
        let f = document.getElementById(file);
        f.pause()
        f.currentTime = 0
      },
      playNext: function() {
        if (this.config.audio.enabled) {
          this.playing = true
          let opts = this.config.audio.options

          if (this.curAudio == null && opts.length > 0) {
            this.curAudio = opts[0]
          } else if (opts.length > 0) {
            var curIndex = opts.indexOf(this.curAudio)
            if (opts[curIndex + 1] == undefined) {
              this.curAudio = opts[0]
            } else {
              this.curAudio = opts[curIndex + 1]
            }
          }
    
          this.playFile(this.curAudio)
        } else {
          this.playing = false
        }
      },
      playFile: function(file) {
        let vm = this
        var x = document.getElementById(file)
        x.play()
        x.onended = function() {
          setTimeout(vm.playNext(), 500)
        }
      },
      doNameUpdate: function() {
        clearTimeout(this.voiceTimer)
        this.voiceTimer = setTimeout(this.updateName, 1000)
      },
      updateName: function() {
        window.ipcRenderer.send('createVoice')
      },
      doTextUpdate: function() {
        clearTimeout(this.textTimer)
        this.textTimer = setTimeout(this.updateText, 1000)
      },
      updateText: function() {
        window.ipcRenderer.send('updateAudioText')
      }
    }
  }
</script>

<style scoped>
  .menu {
    padding: 8px;
    background-color: #3D3D3B;
    color: white;
    border-top: 3px solid #6AB42F;
  }
  .drawerContent {
    text-align: center;
    padding: 10px;
    outline: none;
  }
  .enabledText {
    color: #6AB42F !important;
  }
  .pointer:hover {
    cursor:pointer;
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
