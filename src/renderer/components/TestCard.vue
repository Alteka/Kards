<template>
  <div id="bounds" :class="{ showBounds: config.bounds && !config.fullscreen }">
    <div id="cards" :style="computedStyle">
      <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
      <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
      <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
      <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
      <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
      <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
    </div>
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
    computed: {
      computedStyle: function() {
        if (this.config.fullsize) {
          return {}
        } else {
          return {
            height: this.config.height + 'px',
            width: this.config.width + 'px',
            top: this.config.top + 'px',
            left: this.config.left + 'px',
          }
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
#cards {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  color: white;
  overflow: hidden;
}
#bounds {
  position: absolute;
  top: 0px;
  left: 0px;
  background: black;
  width: 100%;
  height: 100%;
  overflow: overlay;
  background-size: 50% 50%;
    background-image:
      linear-gradient(to right, red 1px, transparent 1px),
      linear-gradient(to bottom, red 1px, transparent 1px);
}
.showBounds {
  outline: 1px solid red;
  outline-offset: -1px;
}


 .black {
    background-color: rgb(16,16,16);
  }
  .superblack {
    background-color: rgb(0,0,0)
  }
  .grey40 {
    background-color: rgb(104,104,104);
  }
  .superwhite {
    background-color: rgb(255,255,255);
  }
  .white {
    background-color: rgb(235,235,235);
  }
  .white75 {
    background-color: rgb(180,180,180);
  }
  .yellow100 {
    background-color: rgb(235,235,0);
  }
  .yellow75 {
    background-color: rgb(180,180,0);
  }
  .cyan100 {
    background-color: rgb(0,235,235);
  }
  .cyan75 {
    background-color: rgb(0,180,180);
  }
  .green100 {
    background-color: rgb(0,235,0);
  }
  .green75 {
    background-color: rgb(0,180,0);
  }
  .magenta100 {
    background-color: rgb(235,0,235);
  }
  .magenta75 {
    background-color: rgb(180,0,180);
  }
  .red100 {
    background-color: rgb(235,0,0);
  }
  .red75 {
    background-color: rgb(180,0,0);
  }
  .blue100 {
    background-color: rgb(0,0,235);
  }
  .blue75 {
    background-color: rgb(0,0,180);
  }


  .step10 {
    background-color:rgb(38,38,38);
  }
  .step20 {
    background-color:rgb(60,60,60);
  }
  .step30 {
    background-color:rgb(82,82,82);
  }
  .step40 {
    background-color:rgb(104,104,104);
  }
  .step50 {
    background-color:rgb(125,125,125);
  }
  .step60 {
    background-color:rgb(148,148,148);
  }
  .step70 {
    background-color:rgb(169,169,169);
  }
  .step80 {
    background-color:rgb(191,191,191);
  }
  .step90 {
    background-color:rgb(213,213,213);
  }


  .rec709yellow { background-color: rgb(178,180,79); }
  .rec709cyan { background-color: rgb(135,177,180); }
  .rec709green { background-color: rgb(128,177,74); }
  .rec709magenta { background-color: rgb(163,72,176); }
  .rec709red { background-color: rgb(160,67,41); }
  .rec709blue { background-color: rgb(57,37,176); }
</style>
