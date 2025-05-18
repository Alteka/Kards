<template>
  <div
    class="ledpanel"
    :style="{
      width: config.led.width + 'px',
      height: config.led.height + 'px',
      backgroundColor: bgCol,
      border: config.led.border ? '1px solid white' : 'none'
    }"
    :class="animClass"
  >
    <transition name="fade">
      <span v-if="config.led.height > 42 && config.led.width > 42 && config.led.position">
        <i class="fas fa-arrow-down"></i> {{ row }}<br />
        <i class="fas fa-arrow-right"></i> {{ column }}
      </span>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Config } from '@shared/config'

const props = defineProps<{
  config: Config
  row: number
  column: number
}>()

const odd = computed(() => {
  if (props.row % 2 == 0 && props.column % 2 != 0) {
    return false
  } else {
    return !(props.row % 2 != 0 && props.column % 2 == 0)
  }
})

const bgCol = computed(() => {
  if (odd.value) {
    return 'blue'
  } else {
    return 'red'
  }
})

const animClass = computed(() => {
  if (odd.value && props.config.animated) {
    return 'animatedOdd'
  } else if (props.config.animated) {
    return 'animatedEven'
  } else {
    return 'notAnimated'
  }
})
</script>

<style scoped>
.ledpanel {
  box-sizing: border-box;
  background: blue;
  float: left;
  padding: 5px;
}
.animatedEven {
  background: linear-gradient(
    90deg,
    rgba(255, 0, 0, 1) 25%,
    rgba(0, 255, 0, 1) 25%,
    rgba(0, 255, 0, 1) 50%,
    rgba(0, 255, 0, 1) 50%,
    rgba(0, 0, 255, 1) 50%,
    rgba(0, 0, 255, 1) 75%,
    rgba(255, 0, 0, 1) 75%
  );
  background-size: 400%;
  animation: Animation 10s linear infinite;
}
.animatedOdd {
  background: linear-gradient(
    90deg,
    rgba(0, 255, 0, 1) 25%,
    rgba(0, 0, 255, 1) 25%,
    rgba(0, 0, 255, 1) 50%,
    rgba(0, 0, 255, 1) 50%,
    rgba(255, 0, 0, 1) 50%,
    rgba(255, 0, 0, 1) 75%,
    rgba(0, 255, 0, 1) 75%
  );
  background-size: 400%;
  animation: Animation 10s linear infinite;
}

@keyframes Animation {
  0% {
    background-position: 0%;
  }
  100% {
    background-position: 100%;
  }
}
</style>
