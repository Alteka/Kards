<template>
  <div id="single">
    <info-circle v-if="config.infoCircleAnimated" :config="config" :info="info" />
    <div class="thebars">
        <swatch :colour="config.bars.color.toLowerCase()" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
    </div>
  </div>
</template>

<script>
import Swatch from './Swatch'
import InfoCircle from './InfoCircle'
  export default {
    name: "BarsSingleTestCard",
    components: { Swatch, InfoCircle },
    props: {
      config: Object,
      info: Object
    }
  }
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
