<template>
  <div id="wrapper">
    <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
    <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
    <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
    <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
    <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
    <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
import Grid from './TestCard/Grid'
import Alteka from './TestCard/Alteka'
import SMPTE from './TestCard/SMPTE'
import ARIB from './TestCard/ARIB'
import Bars from './TestCard/Bars'
import Placeholder from './TestCard/Placeholder'

var Mousetrap = require('mousetrap');
Mousetrap.bind('esc', function() { ipcRenderer.send('closeTestCard') }, 'keyup');

  export default {
    name: 'testcard',
    components: { Grid, Alteka, SMPTE, ARIB, Bars, Placeholder },
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
