<template>
  <div id="wrapper">
    <h1>Test Card. Yup.</h1>
    <el-button v-on:click="closeTestCard()" type="danger" icon="el-icon-close" circle></el-button>
    {{ config }}
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
var Mousetrap = require('mousetrap');

Mousetrap.bind('up up down down left right left right b a enter', () => {
  alert('Well done for trying the Konami code. We like you. Like... a lot.')
})
Mousetrap.bind('esc', function() { ipcRenderer.send('closeTestCard') }, 'keyup');

  export default {
    name: 'testcard',
    // components: { SystemInformation },
    data: function() { 
      return {
        config: {
        }
      }
    },
    methods: {
      closeTestCard: function () {
        ipcRenderer.send('closeTestCard')
      }
    },
    mounted: function() {
      let vm = this
      ipcRenderer.on('config', function(event, args) {
        vm.config = args
      })
      ipcRenderer.send('getConfig')
    }
  }
</script>

<style>
 
</style>
