<template>
  <div id="wrapper">
    <h1>Test Card. Yup.</h1>
    <el-button v-on:click="command('closeTestCard')" type="danger" icon="el-icon-close" circle></el-button>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')

  export default {
    name: 'testcard',
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
