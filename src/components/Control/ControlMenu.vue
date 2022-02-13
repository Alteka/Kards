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
        <el-dropdown-item v-if="!confirmResetVisible" @click="confirmResetVisible = true"><i class="fas fa-undo"></i> Reset</el-dropdown-item>
        <el-dropdown-item v-if="confirmResetVisible" @click="reset()" style="color: red"><i class="fas fa-undo"></i> Are You Sure?</el-dropdown-item>
        <el-dropdown-item divided @click="openHelp"><i class="fas fa-question"></i> Help</el-dropdown-item>
        <el-dropdown-item divided @click="openLogs"><i class="fas fa-clipboard-list"></i> Logs</el-dropdown-item>
        <el-dropdown-item divided @click="importSettings"><i class="fas fa-file-export"></i> Export Settings</el-dropdown-item>
        <el-dropdown-item @click="window.ipcRenderer.send('importSettings')"><i class="fas fa-file-import"></i> Import Settings</el-dropdown-item>
        <el-dropdown-item @click="showShareDialog = true"><i class="fas fa-share"></i> Share Card</el-dropdown-item>
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
      <el-col :span="22">
        <el-form-item label="Text" label-width="90px">
          <el-input v-model="config.audio.text"></el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row style="padding-left: 10px;">
      <el-col style="margin-top: 7px; color: #606266;" :span="4" :class="{ enabledText: config.audio.enabled }">
        Enable <el-switch :disabled="config.audio.options.length == 0" v-model="config.audio.enabled"></el-switch>
      </el-col>
      <el-col :span="15">
        <el-form-item label="Device" label-width="70px">
          <el-select v-model="config.audio.deviceId" placeholder="Select" style="width: 300px;">
              <el-option v-for="item in audioDevices" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-button type="primary" size="small" round @click="loadAudioFile"><i class="far fa-file-audio"></i> Select File</el-button>
      </el-col>
    </el-row>

  </el-drawer>

  <audio src="~@/assets/audio/stereo.wav" id="stereo" />
  <audio src="~@/assets/audio/phase.wav" id="phase" />
  <audio src="~@/assets/audio/pink.wav" id="pink" />
  <audio src="~@/assets/audio/white.wav" id="white" />
  <audio src="~@/assets/audio/tone.wav" id="tone" />
  <audio :src="config.audio.voiceData" id="voice" />
  <audio :src="config.audio.textData" id="text" />
  <audio :src="config.audio.fileData" id="file" />



 <el-drawer :with-header="false" v-model="drawerImage" direction="btt" size="100px">
   <el-row class="drawerContent">
     <el-col :span="10">
       <el-radio-group v-model="config.export.imageSource" size="medium" :disabled="config.cardType=='audioSync'">
         <el-radio-button label="card">Test Card</el-radio-button>
          <el-tooltip :disabled="!config.fullsize" content="Disable 'Fill Output' and 'Windowed' to save test card within larger canvas" placement="bottom" :open-delay="500">
            <el-radio-button label="canvas" :disabled="config.fullsize">Whole Canvas</el-radio-button>
          </el-tooltip>
       </el-radio-group>
     </el-col>
     <el-col :span="11">
       <el-radio-group v-model="config.export.target" size="medium" :disabled="config.cardType=='audioSync'">
         <el-radio-button label="file">Save to File</el-radio-button>
         <el-radio-button label="wallpaper">Set Wallpaper</el-radio-button>
       </el-radio-group>
     </el-col>
     <el-col :span="3">
       <el-button size="medium" :disabled="config.cardType=='audioSync'" v-on:click="exportCard">OK</el-button>
     </el-col>
   </el-row>
   <el-row>
     <el-alert v-if="config.cardType == 'audioSync'" title = "Choose a different card - Even we can't save AV Sync to a  still image..." type="warning" center show-icon effect="dark" :closable="false"></el-alert>
  </el-row>
</el-drawer>

  <el-dialog v-model="showShareDialog" title="Share Kards Online Link" width="85%">
    <el-form style="text-align: center;" label-width="125px">
      <el-row>
        <el-col :span="24" style="margin-bottom: 16px;">
          Hide controls on load
            <el-switch v-model="hideControls" style="padding-left: 5px;"></el-switch>
         <div style="margin-top: 10px;">(Useful for loading into vMix or OBS)</div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="Full URL">
            <el-input v-model="shareLink" placeholder="">
              <template #append>
                <el-button icon="el-icon-document-copy" @click="copyUrl(shareLink)"></el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24" style="text-align: left;">
          <el-form-item label="Simplified URL">
            <el-input v-model="shareLinkMinimal" placeholder="">
              <template #append>
                <el-button icon="el-icon-document-copy" @click="copyUrl(shareLinkMinimal)"></el-button>
              </template>
            </el-input>
            <br />
            (Only has configuration for the currently selected card)
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showShareDialog = false">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </el-row>
</template>

<script>
import { ElLoading } from 'element-plus'
let loadingInstance

  export default {
    props: {
      modelValue: Object, // v-model object
    },
    computed: {
      config: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
      shareLink: function() {
        let c = JSON.parse(JSON.stringify(this.modelValue)) // I know... so lazy right?
        delete c.predefineColors
        delete c.visible
        delete c.showClock
        delete c.windowed
        delete c.fullsize
        delete c.audioSync.device
        delete c.export
        delete c.width
        delete c.height
        delete c.top
        delete c.left
        delete c.screen
        delete c.bounds
        delete c.winWidth
        delete c.winHeight
        delete c.audio
        delete c.alteka.logo

        delete c['']
        c.controlVisible = !this.hideControls
        return 'https://kards.alteka.solutions/?' + this.encode(c)
      },
      shareLinkMinimal: function() {
        let c = JSON.parse(JSON.stringify(this.modelValue)) // I know... still so lazy right?
        delete c.predefineColors
        delete c.visible
        delete c.showClock
        delete c.windowed
        delete c.fullsize
        delete c.audioSync.device
        delete c.export
        delete c.width
        delete c.height
        delete c.top
        delete c.left
        delete c.screen
        delete c.bounds
        delete c.winWidth
        delete c.winHeight
        delete c.audio
        delete c.alteka.logo

        delete c['']

        if (c.cardType == "alteka") {
          delete c.bars
          delete c.grid
          delete c.audioSync
          delete c.ramp
          delete c.placeholder
          delete c.led
          delete c.deghost
        } else if (c.cardType == 'bars') {
          delete c.alteka
          delete c.grid
          delete c.audioSync
          delete c.ramp
          delete c.placeholder
          delete c.led
          delete c.deghost
        }else if (c.cardType == 'grid') {
          delete c.alteka
          delete c.bars
          delete c.audioSync
          delete c.ramp
          delete c.placeholder
          delete c.led
          delete c.deghost
        } else if (c.cardType == 'audioSync') {
          delete c.alteka
          delete c.grid
          delete c.bars
          delete c.ramp
          delete c.placeholder
          delete c.led
          delete c.deghost
        } else if (c.cardType == 'ramp') {
          delete c.alteka
          delete c.grid
          delete c.audioSync
          delete c.bars
          delete c.placeholder
          delete c.led
          delete c.deghost
        } else if (c.cardType == 'placeholder') {
          delete c.alteka
          delete c.grid
          delete c.audioSync
          delete c.ramp
          delete c.bars
          delete c.led
          delete c.deghost
        } else if (c.cardType == 'deghost') {
          delete c.alteka
          delete c.grid
          delete c.audioSync
          delete c.ramp
          delete c.bars
          delete c.led
          delete c.placeholder
        } else if (c.cardType == 'led') {
          delete c.alteka
          delete c.grid
          delete c.audioSync
          delete c.ramp
          delete c.bars
          delete c.placeholder
          delete c.deghost
        }

        c.controlVisible = !this.hideControls
        return 'https://kards.alteka.solutions/?' + this.encode(c)
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
        hideControls: true
      }
    },
    mounted: function() {
      this.updateDevices()
      setInterval(this.updateDevices, 5000)
      setTimeout(this.doNameUpdate, 2000)

      window.ipcRenderer.receive('exportCardCompleted', function(msg) {
        if (msg) {
          Notification.warning({title: 'Oops', message: msg, showClose: false, duration: 2500, onClick: function() { this.close() }})
        } 
        loadingInstance.close()
      })

      window.ipcRenderer.receive('importSettings', function(msg) {
        Notification.info({title: 'Import Settings', message: msg, showClose: false, duration: 2500, onClick: function() { this.close() }})
      })
      
    },
    watch: {
      config: {
        handler: function (val) { 
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
         },
        deep: true
      },
    },
    methods: {
      encode: function(queryObj, nesting = "") {
        // this is heavily based on Nick Drane's work here: https://nickdrane.com/build-your-own-nested-query-string-encoder/
        const pairs = Object.entries(queryObj).map(([key, val]) => {
          // Handle the nested, recursive case, where the value to encode is an object itself
          if (typeof val === "object") {
            return this.encode(val, nesting + `${key}.`);
          } else {
            // Handle base case, where the value to encode is simply a string.
            return [nesting + key, val].map(escape).join("=");
          }
        })
        return pairs.join("&");
      },
      copyUrl: function(value) {
        const el = document.createElement('textarea');  
        el.value = value;                                 
        el.setAttribute('readonly', '');                
        el.style.position = 'absolute';                     
        el.style.left = '-9999px';                      
        document.body.appendChild(el);                  
        const selected =  document.getSelection().rangeCount > 0  ? document.getSelection().getRangeAt(0) : false;                                    
        el.select();                                    
        document.execCommand('copy');                   
        document.body.removeChild(el);                  
        if (selected) {                                 
          document.getSelection().removeAllRanges();    
          document.getSelection().addRange(selected);   
        }
      },
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
