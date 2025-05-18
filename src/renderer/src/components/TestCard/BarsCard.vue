<template>
  <div id="bars">
    <info-circle v-if="config.infoCircleAnimated" :config="config" :info="info" />
    <div class="thebars">
      <swatch colour="white" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="yellow" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="cyan" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="green" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="magenta" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="red" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="blue" :ire="config.bars.level" :show-text="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :show-text="config.bars.overlay"></swatch>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swatch from './ColorSwatch.vue'
import InfoCircle from './InfoCircle.vue'
import type { Config } from '@renderer/config'
import type { Info } from '@renderer/views/Testcard.vue'

defineProps<{
  config: Config
  info: Info
}>()
</script>

<style scoped>
#bars {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  background: black;
}
.thebars {
  display: flex;
  height: 100%;
}
.thebars div {
  width: 100%;
  height: 100%;
}
</style>
