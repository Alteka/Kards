<template>
  <div id="bounds" :class="{ showBounds: config.bounds && !config.fullscreen}" class="superblack">
    <div id="cards" :style="computedStyle">
      <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
      <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
      <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
      <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
      <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
      <Ramp v-if="config.cardType == 'ramp'" :config="config"></Ramp>
      <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
      <Ramp v-if="config.cardType =='ramp'" :config="config"></Ramp>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
import Grid from './TestCard/Grid'
import Ramp from './TestCard/Ramp'
import Alteka from './TestCard/Alteka'
import SMPTE from './TestCard/SMPTE'
import ARIB from './TestCard/ARIB'
import Bars from './TestCard/Bars'
import Placeholder from './TestCard/Placeholder'
import Ramp from './TestCard/Ramp'

var Mousetrap = require('mousetrap');
Mousetrap.bind('esc', function() { ipcRenderer.send('closeTestCard') }, 'keyup');

  export default {
    name: 'testcard',
    components: { Grid, Alteka, SMPTE, ARIB, Bars, Placeholder, Ramp },
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
      this.$message({customClass: "modal",showClose: true, message: 'Press escape to close test card'});
    }
  }
</script>

<style>
@font-face {
  font-family: Sansation;
  src: url("~@/assets/Sansation-Regular.ttf");
}
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
  font-family: Sansation, Helvetica, sans-serif;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: overlay;
}
.showBounds {
  outline: 2px solid red;
  outline-offset: -2px;
  background-size: 50% 50%;
    background-image:
      linear-gradient(to right, red 1px, transparent 1px),
      linear-gradient(to bottom, red 1px, transparent 1px);
}
.modal {
  font-family: Sansation;
  font-size: 200%;
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
 

</style>
