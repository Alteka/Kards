<template>
  <div id="ramp">
    <div id="ramp1" :style="computedBackground"></div>
    <div id="ramp2" v-if="config.ramp.double" :style="secondBackground"></div>
  </div>
</template>

<script>
import Swatch from './Swatch'
  export default {
    components: { Swatch },
    props: {
      config: Object
    },
    computed: {
      gradientAngle: function() {
        let angle
        if (this.config.ramp.direction == 'Horizontal') {
          angle = 90
        } else if (this.config.ramp.direction == 'Vertical') {
          angle = 0
        } else if (this.config.ramp.direction == 'Diagonal') {
          angle = 45
        }
        if (this.config.ramp.reverse) {
          angle += 180
        }
        return angle
      },
      computedColours: function() {
        if (this.config.ramp.stepped) {
          return 'rgb(0,0,0) 10.0%, rgb(26,26,26) 10.0%, rgb(26,26,26) 20.0%, rgb(51,51,51) 20.0%, rgb(51,51,51) 30.0%, rgb(77,77,77) 30.0%, rgb(77,77,77) 40%, rgb(102,102,102) 40%, rgb(102,102,102) 50%, rgb(128,128,128) 50%, rgb(128,128,128) 60%, rgb(153,153,153) 60%, rgb(153,153,153) 70%, rgb(179,179,179) 70%, rgb(179,179,179) 80%, rgb(230,230,230) 80%, rgb(230,230,230) 90%, rgb(255,255,255) 90%'
        } else {
          return 'rgb(0,0,0) 0%, rgb(255,255,255) 100%'
        }
      },
      computedBackground: function() {
        let result
        if (this.config.ramp.direction == 'Radial') {
          if (this.config.ramp.reverse) {
            result = { background: 'radial-gradient(circle, rgb(255,255,255) 0%, rgb(0,0,0) 100%)' }
          } else {
            result = { background: 'radial-gradient(circle, rgb(0,0,0) 0%, rgb(255,255,255) 100%)' }
          }
        } else {
          result = { background: 'linear-gradient(' + this.gradientAngle + 'deg, ' + this.computedColours + ')' }
        }
        if (this.config.ramp.double) {
          result.height = '50%'
        } 
        return result
      },
      secondBackground: function() {
        if (this.config.ramp.direction == 'Radial') {
          if (this.config.ramp.reverse) {
            return { background: 'radial-gradient(circle, rgb(0,0,0) 0%, rgb(255,255,255) 100%)' }
          } else {
            return { background: 'radial-gradient(circle, rgb(255,255,255) 0%, rgb(0,0,0) 100%)' }
          }
        } else {
          return { background: 'linear-gradient(' + (this.gradientAngle - 180) + 'deg, ' + this.computedColours + ')' }
        }
      }
    }
  }
</script>

<style scoped>
  #ramp {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    
    background: black;
  }
  #ramp1 {
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
  }
#ramp2 {
  position: absolute;
  top: 50%;
  height: 50%;
  width: 100%;

}
</style>
