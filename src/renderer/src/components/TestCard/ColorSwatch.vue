<template>
  <div ref="swatch" class="swatch" :style="bgCol">
    <transition name="fade">
      <div v-if="showText == true" class="text">
        <strong>{{ colName }}</strong> <span v-if="ire != null" class="subtitle">{{ ire }}%</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  colour: string
  ire: string
  showText: boolean
}>()

const colours = {
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

const bgCol = computed(() => {
  let bg

  if (props.colour.includes('rec709') || props.colour.includes('ntsc')) {
    bg = colours[props.colour]
  } else {
    let dec = ireToDecimal(props.ire)
    let r = dec * colours[props.colour][0]
    let g = dec * colours[props.colour][1]
    let b = dec * colours[props.colour][2]
    bg = 'rgb(' + r + ', ' + g + ', ' + b + ')'
  }

  let color = 'white'
  if (props.ire > 50) {
    color = 'black'
  }
  return {
    'background-color': bg,
    color: color
  }
})

const colName = computed(() => {
  let col = props.colour
  if (props.colour == 'white' && props.ire < 75 && props.ire > 10) {
    col = 'grey'
  } else if (props.colour == 'white' && props.ire < 11) {
    col = 'black'
  } else if (props.colour == 'ntscQuadrature') {
    col = '+Q'
  } else if (props.colour == 'ntscInphase') {
    col = '-I'
  }
  if (col.includes('rec709')) {
    return 'Rec 709 ' + col.charAt(6).toUpperCase() + col.slice(7)
  } else {
    return col.charAt(0).toUpperCase() + col.slice(1)
  }
})

function ireToDecimal(ire: string) {
  // give it an ire percentage and it returns the 0-255 value you need.
  let r1 = [0, 100] // ire range
  let r2 = [16, 235] // dec range
  let result = ((ire - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0]
  if (result < 0) {
    result = 0
  }
  return Math.round(result)
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
