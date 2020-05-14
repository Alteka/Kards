<template>
<el-row class="menu">

  <el-col :span="8" style="margin-top: 3px;" :class="{ enabledText: config.visible }">
    Enable <el-switch v-model="config.visible"></el-switch>
  </el-col>

  <el-col :span="8">
      <el-button type="success" size="mini" round v-on:click="drawerAudio = true"><i v-if="config.audio.enabled" class="fas fa-volume-up"></i><i v-if="!config.audio.enabled" class="fas fa-volume-mute"></i> Audio</el-button>
      <el-button type="success" size="mini" round v-on:click="drawerImage = true"><i class="fas fa-image"></i> Export</el-button>
  </el-col>

  <el-col :span="8" style="text-align: right">
    <el-button type="primary" size="mini" round v-on:click="ipcSend('resetDefault')">Reset</el-button>
    <el-button type="primary" size="mini" round v-on:click="openUrl('https://alteka.solutions/kards/help')">Help</el-button>
  </el-col>


  <el-drawer :with-header="false" :visible.sync="drawerAudio" direction="btt">
    <el-row class="drawerContent">
      <el-col :span="8">
        <el-form-item label="Enable Output">
          <el-switch :disabled="config.audio.options.length == 0" v-model="config.audio.enabled"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row class="drawerContent">
      <el-checkbox-group v-model="config.audio.options" size="medium">
        <el-checkbox-button label="voice">Voice</el-checkbox-button>
        <el-checkbox-button label="tone">Tone</el-checkbox-button>
        <el-checkbox-button label="pink">Pink Noise</el-checkbox-button>
        <el-checkbox-button label="white">White Noise</el-checkbox-button>
        <el-checkbox-button label="stereo">Stereo</el-checkbox-button>
        <el-checkbox-button label="phase">Phase</el-checkbox-button>
      </el-checkbox-group>
    </el-row>
  </el-drawer>

  <audio src="~@/assets/audio/stereo.wav" id="stereo" />
  <audio src="~@/assets/audio/phase.wav" id="phase" />
  <audio src="~@/assets/audio/pink.wav" id="pink" />
  <audio src="~@/assets/audio/white.wav" id="white" />
  <audio src="~@/assets/audio/tone.wav" id="tone" />



 <el-drawer :with-header="false" :visible.sync="drawerImage" direction="btt" size="100px">
   <el-row class="drawerContent">
     <el-col :span="10">
       <el-radio-group v-model="imageSource" size="medium" :disabled="!config.visible">
         <el-radio-button label="card">Test Card</el-radio-button>
         <el-radio-button label="canvas" :disabled="config.fullsize">Whole Canvas</el-radio-button>
       </el-radio-group>
     </el-col>
     <el-col :span="11">
       <el-radio-group v-model="imageDest" size="medium" :disabled="!config.visible">
         <el-radio-button label="file">Save to File</el-radio-button>
         <el-radio-button label="wallpaper">Set Wallpaper</el-radio-button>
       </el-radio-group>
     </el-col>
     <el-col :span="3">
       <el-button size="medium" :disabled="!config.visible" v-on:click="exportCard">OK</el-button>
     </el-col>
   </el-row>
   <el-row>
     <el-alert v-if="!config.visible" title="Enable output first" type="success" center show-icon effect="dark" close-text="Enable" @close="enabler"></el-alert>
     <el-alert v-if="config.fullsize && config.screen != 0" title="Disable 'Fill Output' to save test card within larger canvas" type="success" center show-icon effect="light" :closable="false"></el-alert>
     <el-alert v-if="config.screen == 0" title="Use a fullscreen output and disable 'Fill Output' to save test card within larger canvas" type="success" center show-icon effect="light" :closable="false"></el-alert>
  </el-row>
</el-drawer>

</el-row>
</template>

<script>
const log = require('electron-log')

const { ipcRenderer } = require('electron')
  export default {
    props: {
      config: Object
    },
    data: function() {
      return {
        drawerAudio: false,
        drawerImage: false,
        curAudio: null,
        playing: false,
        imageSource: "card",
        imageDest: "file"
      }
    },
    watch: {
      config: {
        handler: function (val, oldVal) { 
            if (val.audio.enabled && !this.playing) {
              log.info('Starting audio output')
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
         },
        deep: true
      },
    },
    methods: {
      ipcSend: function(val) {
        ipcRenderer.send(val)
      },
      exportCard: function() {
        if (this.imageSource=="card") {
          if(this.imageDest=="file") {
            ipcRenderer.send('testCardToPNG')
          }
          else if (this.imageDest=="wallpaper") {
            ipcRenderer.send("testCardToWallpaper")
          }
        }
        else if (this.imageSource=="canvas") {
          if(this.imageDest=="file") {
            ipcRenderer.send("canvasToPNG")
          }
          else if (this.imageDest=="wallpaper") {
            ipcRenderer.send("canvasToWallpaper")
          }
        }
        this.drawerImage = false
      },
      openUrl: function(link) {
        log.info('Opening external url: ' + link)
        require("electron").shell.openExternal(link)
      },
      stopAudio: function() {
        log.info('Stopping audio output')
        window.speechSynthesis.cancel()
        this.stopFile('tone')
        this.stopFile('white')
        this.stopFile('pink')
        this.stopFile('phase')
        this.stopFile('stereo')
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
          if (this.curAudio == 'voice') {
            this.playVoice()
          } else {
            this.playFile(this.curAudio)
          }
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
      playVoice: function() {
        let vm = this
        var utter = new SpeechSynthesisUtterance('This is - ' + this.config.name)
        utter.pitch = 0.8
        utter.rate = 0.8
        window.speechSynthesis.speak(utter)
        utter.addEventListener('end', function(event) { 
          setTimeout(vm.playNext(), 500)
        });
      },
      enabler: function() {
        this.config.visible = true
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
    color: #6AB42F;
  }
  .el-alert {
    width: 95%;
    margin-left: 2.5%;
  }
</style>
