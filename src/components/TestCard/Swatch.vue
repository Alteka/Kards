<template>
  <div class="swatch" :style="bgCol" ref="swatch">
    <transition name="fade">
      <div class="text" v-if="showText == true">
        <strong>{{ colName }}</strong> <span class="subtitle" v-if="ire != null">{{ ire }}%</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { BLACK_LEVEL, ireToDecimal } from '@/levels'

export default {
  name: 'ColorSwatch',
  props: {
    colour: String,
    ire: String,
    showText: Boolean
  },
  computed: {
    bgCol: function () {
      let bg

      if (this.colour.includes('rec709') || this.colour.includes('ntsc')) {
        bg = this.colours[this.colour]
      } else {
        const dec = ireToDecimal(this.ire)
        // F-001: a channel that is "off" sits at black level, not at zero. This
        // used to multiply `dec` by a 0/1 unit vector, which put the inactive
        // channels of every colour bar 16 code values *below* black — so yellow
        // at 75% was 180,180,0 where it should be 180,180,16.
        //
        // The min() matters only below IRE 0, where `dec` is already under the
        // black level and an off channel must not end up brighter than an on one.
        const off = Math.min(BLACK_LEVEL, dec)
        const channels = this.colours[this.colour]
        const level = (on) => (on ? dec : off)
        bg = 'rgb(' + level(channels[0]) + ', ' + level(channels[1]) + ', ' + level(channels[2]) + ')'
      }

      let color = 'white'
      if (this.ire > 50) {
        color = 'black'
      }
      return {
        'background-color': bg,
        color: color
      }
    },
    colName: function () {
      let col = this.colour
      if (this.colour == 'white' && this.ire < 75 && this.ire > 10) {
        col = 'grey'
      } else if (this.colour == 'white' && this.ire < 11) {
        col = 'black'
      } else if (this.colour == 'ntscQuadrature') {
        col = '+Q'
      } else if (this.colour == 'ntscInphase') {
        col = '-I'
      }
      if (col.includes('rec709')) {
        return 'Rec 709 ' + col.charAt(6).toUpperCase() + col.slice(7)
      } else {
        return col.charAt(0).toUpperCase() + col.slice(1)
      }
    }
  },
  data: function () {
    return {
      vertical: false,
      colours: {
        red: [1, 0, 0],
        magenta: [1, 0, 1],
        yellow: [1, 1, 0],
        blue: [0, 0, 1],
        green: [0, 1, 0],
        cyan: [0, 1, 1],
        white: [1, 1, 1],
        grey: [1, 1, 1],
        black: [1, 1, 1],
        superblack: [1, 1, 1],
        rec709yellow: 'rgb(178,180,79)',
        rec709cyan: 'rgb(135,177,180)',
        rec709green: 'rgb(128,177,74)',
        rec709magenta: 'rgb(163,72,176)',
        rec709red: 'rgb(160,67,41)',
        rec709blue: 'rgb(57,37,176)',
        ntscQuadrature: '#31006b',
        ntscInphase: '#00214c'
      }
    }
  }
}
</script>

<style scoped>
.swatch {
  border: none;
  margin: 0;
  padding: 1px;
  overflow: hidden;
}
.text {
  margin: auto;
  width: 90%;
  text-align: center;
  margin-top: 6px;
  z-index: +100;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
