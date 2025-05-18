<template>
  <div>
    <div
      v-for="row in config.led.rows"
      :key="row"
      class="row"
      :style="{ width: config.led.columns * config.led.width + 'px' }"
    >
      <led-panel
        v-for="column in config.led.columns"
        :key="column"
        :config="config"
        :row="row"
        :column="column"
      ></led-panel>
    </div>
    <div v-if="config.showInfo" class="infoLine" :style="infoStyle">
      {{ config.name }} - {{ config.led.columns * config.led.width }} x
      {{ config.led.rows * config.led.height }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LedPanel from './LedPanel.vue'
import type { Config } from '@shared/config'
import type { Info } from '@renderer/views/Testcard.vue'

const props = defineProps<{
  config: Config
  info: Info
}>()

const infoStyle = computed(() => {
  let offset = 21
  if (props.config.led.height < 78) {
    offset = 16
  }
  if (props.config.led.height < 62) {
    offset = 12
  }

  let top = Math.min(visualViewport.height, props.config.led.rows * props.config.led.height) / 2
  if (
    visualViewport.height >= props.config.led.rows * props.config.led.height &&
    props.config.led.height > 42
  ) {
    top -= offset * (1 - (props.config.led.rows % 2))
  }

  return {
    left:
      Math.min(visualViewport.width, props.config.led.columns * props.config.led.width) / 2 + 'px',
    top: top + 'px',
    fontSize: offset + 'px'
  }
})
</script>

<style scoped>
.row {
  clear: both;
}
.infoLine {
  position: absolute;
  padding: 3px;
  transform: translate(-50%, -50%);
  font-size: 21px;
  margin: auto;
  text-align: center;
  color: #fff;
  background: rgba(1, 1, 1, 0.5);
  /* text-shadow: 0px 0px 5px #000; */
}
</style>
