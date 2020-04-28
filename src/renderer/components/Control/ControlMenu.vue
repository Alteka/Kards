<template>
<el-row class="menu">

  <el-col :span="8">
    Enable <el-switch active-color="#7BB144" v-model="config.visible"></el-switch>
  </el-col>
  

  <el-col :span="8">
      <el-button type="success" size="mini" round v-on:click="drawerAudio = true"><i v-if="config.audio.enabled" class="fas fa-volume-up"></i><i v-if="!config.audio.enabled" class="fas fa-volume-mute"></i> Audio</el-button>
      <el-button type="success" size="mini" round v-on:click="drawerImage = true"><i class="fas fa-image"></i> Image</el-button>
  </el-col>

  <el-col :span="8" style="text-align: right">
    <el-button type="success" size="mini" round v-on:click="ipcSend('resetDefault')">Reset</el-button>
  </el-col>




  <el-drawer :with-header="false" :visible.sync="drawerAudio" direction="btt">
    <el-row class="drawerContent">
      <el-col :span="8">
        <el-form-item label="Enable Output">
          <el-switch active-color="#7BB144" v-model="config.audio.enabled"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
  </el-drawer>




 <el-drawer :with-header="false" :visible.sync="drawerImage" direction="btt">
   <el-row class="drawerContent">
     <el-col :span="12">
      <el-button type="success" :disabled="!config.visible" v-on:click="ipcSend('testCardToPNG')">Test Card to PNG</el-button>
     </el-col>
     <el-col :span="12">
      <el-button type="success" :disabled="!config.visible" v-on:click="ipcSend('outputToPNG')">Output to PNG</el-button>
     </el-col>
   </el-row>
   <el-row class="drawerContent">
     <el-col :span="12">
      <el-button type="success" :disabled="!config.visible" v-on:click="ipcSend('testCardToWallpaper')">Test Card to Wallpaper</el-button>
     </el-col>
     <el-col :span="12">
      <el-button type="success" :disabled="!config.visible" v-on:click="ipcSend('outputToWallpaper')">Output to Wallpaper</el-button>
     </el-col>
   </el-row>
</el-drawer>

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
        timer: null,
        voices: window.speechSynthesis.getVoices(),
        drawerAudio: false,
        drawerImage: false
      }
    },
     watch: {
      config: {
        handler: function (val, oldVal) { 
          if (val.audio.enabled) {
            this.startAudio()
          } else {
            this.stopAudio()
          }
         },
        deep: true
      },
    },
    mounted: function() {
      this.voices = window.speechSynthesis.getVoices()

    },
    methods: {
      ipcSend: function(val) {
        ipcRenderer.send(val)
        this.drawerImage = false
      },
      startAudio: function() {
        this.timer = setInterval(this.playAudio, 8000)
      },
      stopAudio: function() {
        clearInterval(this.timer)
      },
      playAudio: function() {
        var utter = new SpeechSynthesisUtterance('This is audio from - ' + this.config.name)
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
    background-color: #545c64;
    color: white;
    border-top: 3px solid #7BB144;
  }
  .drawerContent {
    text-align: center;
    padding: 10px;
    outline: none;
  }
</style>
