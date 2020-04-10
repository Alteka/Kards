<template>
  <div id="wrapper">
    <h1>Test Card Control</h1>
    
    <el-radio-group v-model="config.screen">
      <el-radio-button label="0">Window</el-radio-button>
      <el-radio-button v-for="scr in screens" label="scr.id">{{ scr.size.width }} x {{ scr.size.height }}</el-radio-button>
    </el-radio-group>

      <el-button v-on:click="command('openTestCard')">Open Test Card</el-button>
      <el-button v-on:click="command('closeTestCard')">Close Test Card</el-button>


    <el-radio-group v-model="config.cardType">
      <el-radio-button label="Alteka"></el-radio-button>
      <el-radio-button label="SMPTE"></el-radio-button>
      <el-radio-button label="ARIB"></el-radio-button>
      <el-radio-button label="75% Bars"></el-radio-button>
      <el-radio-button label="100% Bars"></el-radio-button>
      <el-radio-button label="Placeholder"></el-radio-button>
    </el-radio-group>
<hr>
 {{ screens }}
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
        cardType: 'Alteka',
        screen: 0
      },
      screens: screen.getAllDisplays()
    }
  },
    methods: {
      command: function (cmd) {
        ipcRenderer.send('command', cmd)
      }
    }
  }
</script>

<style>
 #app {
  font-family: Helvetica, sans-serif;
  text-align: center;
}
</style>
