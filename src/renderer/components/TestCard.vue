<template>
  <div id="bounds" :class="{ showBounds: config.bounds && !config.fullscreen}" class="superblack">
    <div id="cards" :style="computedStyle">

      <div class="testcard" :class="{animated: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
        <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
        <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
        <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
        <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
      </div>



      <div v-if="config.animated" class="testcard" :class="{animatedAbove: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
        <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
        <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
        <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
        <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
      </div>

      <div v-if="config.animated" class="testcard" :class="{animatedLeft: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
        <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
        <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
        <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
        <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
      </div>

      <div v-if="config.animated" class="testcard" :class="{animatedAboveLeft: config.animated}">
        <Grid v-if="config.cardType == 'grid'" :config="config"></Grid>
        <Alteka v-if="config.cardType == 'alteka'" :config="config"></Alteka>
        <SMPTE v-if="config.cardType == 'smpte'" :config="config"></SMPTE>
        <ARIB v-if="config.cardType == 'arib'" :config="config"></ARIB>
        <Bars v-if="config.cardType == 'bars'" :config="config"></Bars>
        <Ramp v-if="config.cardType == 'ramp'" :config="config"></Ramp>
        <Placeholder v-if="config.cardType == 'placeholder'" :config="config"></Placeholder>
      </div>
    
    
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
      ipcRenderer.send('getConfigTestCard')
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
.testcard {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}
.animated {
  animation: diagonal 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonal {
    0%       { transform: translatex(0%) translatey(0%) }
    100%     { transform: translatex(100%) translatey(100%) }
}

.animatedAbove {
  animation: diagonalAbove 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAbove {
    0%       { transform: translatex(0%) translatey(-100%) }
    100%     { transform: translatex(100%) translatey(0%) }
}

.animatedLeft {
  animation: diagonalLeft 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalLeft {
    0%       { transform: translatex(-100%) translatey(0%) }
    100%     { transform: translatex(0%) translatey(100%) }
}

.animatedAboveLeft {
  animation: diagonalAboveLeft 10s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAboveLeft {
    0%       { transform: translatex(-100%) translatey(-100%) }
    100%     { transform: translatex(0%) translatey(0%) }
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
