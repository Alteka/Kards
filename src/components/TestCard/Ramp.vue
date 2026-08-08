<template>
  <div id="ramp">
    <info-circle v-if="config.infoCircleAnimated" :config="config" :info="info" />
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
import Swatch from './Swatch.vue'
import InfoCircle from './InfoCircle.vue'
import { BLACK_LEVEL, WHITE_LEVEL, ireToDecimal, greyString } from '@/levels'
export default {
  name: 'RampTestCard',
  components: { Swatch, InfoCircle },
  props: {
    config: Object,
    info: Object
  },
  data: function () {
    return {
      // IRE, not code values. -7.5 and 109 are deliberate sub-black and
      // super-white markers; the rest is an even 0-100 in tens. These drive both
      // the stepped gradient and the labels drawn over it, which is what stops
      // the two from disagreeing (F-013).
      steps: ['-7.5', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '109']
    }
  },
  computed: {
    /** The code value for each step, on the same scale as the swatch labels. */
    stepLevels: function () {
      return this.steps.map(ireToDecimal)
    },
    gradientAngle: function () {
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
    computedColours: function () {
      return this.rampStops(false)
    },
    computedRamp1: function () {
      let result
      if (this.config.ramp.direction == 'Radial') {
        result = { background: 'radial-gradient(circle, ' + this.rampStops(this.config.ramp.reverse) + ')' }
      } else {
        result = { background: 'linear-gradient(' + this.gradientAngle + 'deg, ' + this.computedColours + ')' }
      }

      if (this.config.ramp.double) {
        if (this.config.ramp.direction == 'Diagonal' || this.config.ramp.direction == 'Radial') {
          result.height = '50%'
        } else if (this.config.ramp.direction == 'Vertical') {
          result.width = '50%'
        }
      }

      return result
    },
    computedRamp2: function () {
      let result
      if (this.config.ramp.direction == 'Radial') {
        // The second ramp mirrors the first, so its radial gradient runs the
        // opposite way round.
        result = { background: 'radial-gradient(circle, ' + this.rampStops(!this.config.ramp.reverse) + ')' }
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
    computedSteps1: function () {
      let dir
      if (this.config.ramp.direction == 'Vertical') {
        dir = 'column'
      } else {
        dir = 'row'
      }
      if (this.config.ramp.reverse) {
        dir += '-reverse'
      }
      return { 'flex-direction': dir }
    },
    computedSteps2: function () {
      let dir
      if (this.config.ramp.direction == 'Vertical') {
        dir = 'column'
      } else {
        dir = 'row'
      }
      if (!this.config.ramp.reverse) {
        dir += '-reverse'
      }
      return { 'flex-direction': dir }
    },
    showSteps: function () {
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
  },
  methods: {
    /**
     * Hard-stop gradient stops: one equal-width band per step, no interpolation.
     *
     * Generated rather than hand-written. The old version was the same string
     * typed out five times, and one copy of it was missing a step (F-008), which
     * is precisely the failure mode duplication produces.
     */
    bandStops: function (levels) {
      const n = levels.length
      return levels
        .map((dec, i) => {
          const colour = greyString(dec)
          const from = ((i * 100) / n).toFixed(4)
          const to = (((i + 1) * 100) / n).toFixed(4)
          return colour + ' ' + from + '%, ' + colour + ' ' + to + '%'
        })
        .join(', ')
    },
    /** Smooth black-to-white stops on the studio range (F-013). */
    smoothStops: function (descending) {
      const first = descending ? WHITE_LEVEL : BLACK_LEVEL
      const last = descending ? BLACK_LEVEL : WHITE_LEVEL
      return greyString(first) + ' 0%, ' + greyString(last) + ' 100%'
    },
    /** The gradient body for one ramp, ascending or descending. */
    rampStops: function (descending) {
      if (!this.config.ramp.stepped) return this.smoothStops(descending)
      const levels = descending ? [...this.stepLevels].reverse() : this.stepLevels
      return this.bandStops(levels)
    }
  }
}
</script>

<style scoped>
#ramp {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  height: 100.2%;
  width: 100.2%;
  overflow: hidden;
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
