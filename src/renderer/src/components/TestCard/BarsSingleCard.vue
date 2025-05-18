<template>
  <div id="single">
    <info-circle v-if="config.infoCircleAnimated" :config="config" :info="info" />
    <div class="thebars">
      <swatch
        :colour="config.bars.color.toLowerCase()"
        :ire="config.bars.level"
        :show-text="config.bars.overlay"
      ></swatch>
    </div>
  </div>
</template>

<script setup lang="ts">
import Swatch from './ColorSwatch.vue'
import InfoCircle from './InfoCircle.vue'
import type { Config } from '@shared/config'
import type { Info } from '@renderer/views/Testcard.vue'

defineProps<{
  config: Config
  info: Info
}>()
</script>

<style scoped>
#single {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
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
