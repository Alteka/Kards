<template>
  <div id="ramp">
    <info-circle :config="config" :cardSize="cardSize" :time="time"/>
    <div id="ramp1" :style="computedRamp1">
      <div v-if="showSteps" class="steps" :style="computedSteps1">
        <swatch v-for="step in steps" :key="step" colour="white" :ire="step" :showText="config.ramp.overlay"></swatch>
      </div>
    </div>
    <transition name="fade">
      <div id="ramp2" v-if="config.ramp.double" :style="computedRamp2">
        <div v-if="showSteps" class="steps" :style="computedSteps2">
          <swatch v-for="step in steps" :key="step" colour="white" :ire="step" :showText="config.ramp.overlay"></swatch>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Swatch from './Swatch'
import InfoCircle from './InfoCircle'
  export default {
    components: { Swatch, InfoCircle },
    props: {
      config: Object,
      cardSize: String,
      time: String
    },
    data: function() {
      return {
        steps: ['-7.5', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '109']
      }
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
      computedRamp1: function() {
        let result
        if (this.config.ramp.direction == 'Radial') {
          if (this.config.ramp.reverse) {
            if (this.config.ramp.stepped) {
              result = { background: 'radial-gradient(circle, rgb(255,255,255) 10.0%, rgb(230,230,230) 10.0%, rgb(230,230,230) 20.0%, rgb(179,179,179) 20.0%, rgb(179,179,179) 30.0%, rgb(153,153,153) 30.0%, rgb(153,153,153) 40%, rgb(128,128,128) 40%, rgb(128,128,128) 50%, rgb(102,102,102) 50%, rgb(102,102,102) 60%, rgb(77,77,77) 60%, rgb(77,77,77) 70%, rgb(51,51,51) 70%, rgb(51,51,51) 80%, rgb(26,26,26) 80%, rgb(26,26,26) 90%, rgb(0,0,0) 90%)' }
            } else {
              result = { background: 'radial-gradient(circle, rgb(255,255,255) 0%, rgb(0,0,0) 100%)' }
            }
          } else {
            if (this.config.ramp.stepped) {
               result = { background: 'radial-gradient(circle, rgb(0,0,0) 10.0%, rgb(26,26,26) 10.0%, rgb(26,26,26) 20.0%, rgb(51,51,51) 20.0%, rgb(51,51,51) 30.0%, rgb(77,77,77) 30.0%, rgb(77,77,77) 40%, rgb(102,102,102) 40%, rgb(102,102,102) 50%, rgb(128,128,128) 50%, rgb(128,128,128) 60%, rgb(153,153,153) 60%, rgb(153,153,153) 70%, rgb(179,179,179) 70%, rgb(179,179,179) 80%, rgb(230,230,230) 80%, rgb(230,230,230) 90%, rgb(255,255,255) 90%)' }
            } else {
              result = { background: 'radial-gradient(circle, rgb(0,0,0) 0%, rgb(255,255,255) 100%)' }
            }
          }
        } else {
          result = { background: 'linear-gradient(' + this.gradientAngle + 'deg, ' + this.computedColours + ')' }
        }

        if (this.config.ramp.double) {
          if (this.config.ramp.direction == 'Diagonal' || this.config.ramp.direction == 'Radial') {   
            result.height= '50%'
          } else if (this.config.ramp.direction == 'Vertical') {
            result.width = '50%'
          }
        }
        
        return result
      },
      computedRamp2: function() {
        let result
        if (this.config.ramp.direction == 'Radial') {
          if (!this.config.ramp.reverse) {
            if (this.config.ramp.stepped) {
              result = { background: 'radial-gradient(circle, rgb(255,255,255) 10.0%, rgb(230,230,230) 10.0%, rgb(230,230,230) 20.0%, rgb(179,179,179) 20.0%, rgb(179,179,179) 30.0%, rgb(153,153,153) 30.0%, rgb(153,153,153) 40%, rgb(128,128,128) 40%, rgb(128,128,128) 50%, rgb(102,102,102) 50%, rgb(102,102,102) 60%, rgb(77,77,77) 60%, rgb(77,77,77) 70%, rgb(51,51,51) 70%, rgb(51,51,51) 80%, rgb(26,26,26) 80%, rgb(26,26,26) 90%, rgb(0,0,0) 90%)' }
            } else {
              result = { background: 'radial-gradient(circle, rgb(255,255,255) 0%, rgb(0,0,0) 100%)' }
            }
          } else {
            if (this.config.ramp.stepped) {
              result = { background: 'radial-gradient(circle, rgb(0,0,0) 10.0%, rgb(26,26,26) 10.0%, rgb(26,26,26) 20.0%, rgb(51,51,51) 20.0%, rgb(51,51,51) 30.0%, rgb(77,77,77) 30.0%, rgb(77,77,77) 40%, rgb(102,102,102) 40%, rgb(102,102,102) 50%, rgb(128,128,128) 50%, rgb(128,128,128) 60%, rgb(153,153,153) 60%, rgb(153,153,153) 70%, rgb(179,179,179) 70%, rgb(179,179,179) 80%, rgb(230,230,230) 80%, rgb(230,230,230) 90%, rgb(255,255,255) 90%)' }
            } else {
              result = { background: 'radial-gradient(circle, rgb(0,0,0) 0%, rgb(255,255,255) 100%)' }
            }
          }
        } else {
          result = { background: 'linear-gradient(' + (this.gradientAngle - 180) + 'deg, ' + this.computedColours + ')' }
        }

        if (this.config.ramp.double) {
          if (this.config.ramp.direction == 'Vertical') {
            result.top = '0%'
            result.width = '50%'
            result.left = '50%'
            result.height = '100%'
          }
        }
        return result
      },
      computedSteps1: function() {
        let dir
        if (this.config.ramp.direction == 'Vertical') {
          dir =  'column'
        } else {
          dir = 'row'
        }
        if (this.config.ramp.reverse) {
          dir += '-reverse'
        }
        return { 'flex-direction': dir}
      },
      computedSteps2: function() {
        let dir
        if (this.config.ramp.direction == 'Vertical') {
          dir =  'column'
        } else {
          dir = 'row'
        }
        if (!this.config.ramp.reverse) {
          dir += '-reverse'
        }
        return { 'flex-direction': dir}
      },
      showSteps: function() {
        if (this.config.ramp.stepped) {
          if (this.config.ramp.direction == 'Horizontal' || this.config.ramp.direction == 'Vertical') {
            return true
          } else {
            return false
          }
        } else {
          return false
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
  left: 0%;
  height: 50%;
  width: 100%;

}
.steps {
  display: flex;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.steps div {
  width: 100%;
  height: 100%;
}
</style>
