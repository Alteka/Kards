<template>
<el-row class="menu">

  <el-col :span="8" style="margin-top: 3px;" :class="{ enabledText: config.visible }">
    Enable <el-switch v-model="config.visible"></el-switch>
  </el-col>
  

  <el-col :span="8">
      <el-button type="success" size="mini" round v-on:click="drawerAudio = true"><i v-if="config.audio.enabled" class="fas fa-volume-up"></i><i v-if="!config.audio.enabled" class="fas fa-volume-mute"></i> Audio</el-button>
      <el-button type="success" size="mini" round v-on:click="drawerImage = true"><i class="fas fa-image"></i> Image</el-button>
  </el-col>

  <el-col :span="8" style="text-align: right">
    <el-button type="primary" size="mini" round v-on:click="ipcSend('resetDefault')">Reset</el-button>
  </el-col>




  <el-drawer :with-header="false" :visible.sync="drawerAudio" direction="btt">
    <el-row class="drawerContent">
      <el-col :span="8">
        <el-form-item label="Enable Output">
          <el-switch v-model="config.audio.enabled"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row class="drawerContent">
      <el-checkbox-group v-model="config.audio.options">
        <el-checkbox label="voice">Voice</el-checkbox>
        <el-checkbox label="tone">1KHz Tone</el-checkbox>
        <el-checkbox label="pink">Pink Noise</el-checkbox>
        <el-checkbox label="white">White Noise</el-checkbox>
        <el-checkbox label="stereo">Stereo</el-checkbox>
        <el-checkbox label="phase">Phase</el-checkbox>
      </el-checkbox-group>
    </el-row>
  </el-drawer>




 <el-drawer :with-header="false" :visible.sync="drawerImage" direction="btt">
   <el-row class="drawerContent">
     <el-col :span="12">
      <el-button :disabled="!config.visible" v-on:click="ipcSend('testCardToPNG')">Test Card to PNG</el-button>
     </el-col>
     <el-col :span="12">
      <el-button :disabled="!config.visible" v-on:click="ipcSend('outputToPNG')">Output to PNG</el-button>
     </el-col>
   </el-row>
   <el-row class="drawerContent">
     <el-col :span="12">
      <el-button :disabled="!config.visible" v-on:click="ipcSend('testCardToWallpaper')">Test Card to Wallpaper</el-button>
     </el-col>
     <el-col :span="12">
      <el-button :disabled="!config.visible" v-on:click="ipcSend('outputToWallpaper')">Output to Wallpaper</el-button>
     </el-col>
   </el-row>
   <el-row v-if="!config.visible" style="text-align: center; color: grey;">
     <span>Must enable output first</span>
   </el-row>
</el-drawer>

<audio src="~@/assets/audio/stereo.wav" id="stereo" />
<audio src="~@/assets/audio/phase.wav" id="phase" />
<audio src="~@/assets/audio/pink.wav" id="pink" />
<audio src="~@/assets/audio/white.wav" id="white" />
<audio src="~@/assets/audio/tone.wav" id="tone" />

</el-row>
</template>

<script>
const { ipcRenderer } = require('electron')
  export default {
    props: {
      config: Object
    },
    data: function() {
      return {
        drawerAudio: false,
        drawerImage: false,
        curAudio: null
      }
    },
    mounted: function() {
      setInterval(this.audioTick, 3000)
    },
    methods: {
      ipcSend: function(val) {
        ipcRenderer.send(val)
        this.drawerImage = false
      },
      audioTick: function() {
        if (this.config.audio.enabled && !window.speechSynthesis.speaking) {
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
        }
      },
      playFile: function(file) {
        var x = document.getElementById(file)
        x.play()
        setTimeout(function() { x.pause() }, 2000)
      },
      playVoice: function() {
        var utter = new SpeechSynthesisUtterance('This is - ' + this.config.name)
        utter.pitch = 0.8
        utter.rate = 0.8
        window.speechSynthesis.speak(utter)
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
</style>
