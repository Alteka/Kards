<template>
  <div id="smpte">
    <info-circle v-if="config.infoCircleAnimated" :config="config" :info="info" />
    <div class="row">
      <swatch colour="white" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="yellow" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="cyan" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="green" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="magenta" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="red" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="blue" ire="75" :show-text="config.bars.overlay"></swatch>
    </div>
    <div class="row" style="height: 8.25%">
      <swatch colour="blue" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :show-text="config.bars.overlay"></swatch>
      <swatch colour="magenta" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :show-text="config.bars.overlay"></swatch>
      <swatch colour="cyan" ire="75" :show-text="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :show-text="config.bars.overlay"></swatch>
      <swatch colour="white" ire="75" :show-text="config.bars.overlay"></swatch>
    </div>
    <div class="row" style="height: 25.1%">
      <div class="row" style="width: 500%">
        <swatch colour="ntscInphase" :show-text="config.bars.overlay"></swatch>
        <swatch colour="white" ire="100" :show-text="config.bars.overlay"></swatch>
        <swatch colour="ntscQuadrature" :show-text="config.bars.overlay"></swatch>
        <swatch colour="black" ire="0" :show-text="config.bars.overlay"></swatch>
      </div>
      <div class="row">
        <swatch colour="black" ire="3.5" :show-text="config.bars.overlay"></swatch>
        <swatch colour="black" ire="7.5" :show-text="config.bars.overlay"></swatch>
        <swatch colour="black" ire="11.5" :show-text="config.bars.overlay"></swatch>
      </div>
      <swatch style="padding: 0" colour="black" ire="0" :show-text="config.bars.overlay"></swatch>
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
#smpte {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  background: grey;
}
.row {
  height: 66.66%;
  display: flex;
}
.row div {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
