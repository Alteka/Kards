<template>
  <div id="wrapper">
    <h1>Test Card Control</h1>
    
    <el-radio-group v-model="config.screen">
      <el-radio-button label="0">Window</el-radio-button>
      <el-radio-button v-for="scr in screens" :label="scr.id">{{ scr.size.width }} x {{ scr.size.height }}</el-radio-button>
    </el-radio-group>

<el-switch v-model="config.visible">
</el-switch>
      
      <hr>

    <el-radio-group v-model="config.cardType">
      <el-radio-button label="alteka">Alteka</el-radio-button>
      <el-radio-button label="smpte">SMPTE</el-radio-button>
      <el-radio-button label="arib">ARIB</el-radio-button>
      <el-radio-button label="bars">75% Bars</el-radio-button>
      <el-radio-button label="placeholder">Placeholder</el-radio-button>
    </el-radio-group>
<hr>
 {{ config }}
  </div>
</template>

<script>
const { ipcRenderer, screen } = require('electron')
  // import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'control',
    // components: { SystemInformation },
    data: function () {
    return {
      config: {
        visible: false,
        cardType: 'alteka',
        screen: 0
      },
      screens: screen.getAllDisplays()
    }
  },
    mounted: function() {
      let vm = this
      ipcRenderer.on('closeTestCard', function(event, val) {
        vm.config.visible = false
      })
    },
    watch: {
      config: {
        handler: function (val, oldVal) { 
          ipcRenderer.send('config', val)
         },
        deep: true
      },
    }
  }
</script>

<style>
 #app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}
</style>
