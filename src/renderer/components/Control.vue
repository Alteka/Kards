<template>
  <div id="wrapper">
    <h1>Test Card Control</h1>
    
      <el-button v-on:click="command('openTestCard')">Open Test Card</el-button>
      <el-button v-on:click="command('closeTestCard')">Close Test Card</el-button>

  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
  // import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'control',
    // components: { SystemInformation },
    methods: {
      command: function (cmd) {
        ipcRenderer.send('command', cmd)
      }
    }
  }
</script>

<style>
 
</style>
