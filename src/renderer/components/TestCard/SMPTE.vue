<template>
  <div id="smpte">
    <info-circle :config="config" :cardSize="cardSize" :time="time"/>
    <div class="row">
      <swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="yellow" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="cyan" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="green" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="magenta" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="red" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="blue" ire="75" :showText="config.bars.overlay"></swatch>
    </div>
    <div class="row" style="height: 8.25%">
      <swatch colour="blue" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :showText="config.bars.overlay"></swatch>
      <swatch colour="magenta" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :showText="config.bars.overlay"></swatch>
      <swatch colour="cyan" ire="75" :showText="config.bars.overlay"></swatch>
      <swatch colour="black" ire="0" :showText="config.bars.overlay"></swatch>
      <swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch>
    </div>
    <div class="row">
      <div class="row" style="width: 500%;">
        <swatch colour="ntscInphase" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="ntscQuadrature" :showText="config.bars.overlay"></swatch>
        <swatch colour="black" ire="0" :showText="config.bars.overlay"></swatch>
      </div>
      <div class="row">
        <swatch colour="black" ire="3.5" :showText="config.bars.overlay"></swatch>
        <swatch colour="black" ire="7.5" :showText="config.bars.overlay"></swatch>
        <swatch colour="black" ire="11.5" :showText="config.bars.overlay"></swatch>
      </div>
      <swatch style="padding: 0" colour="black" ire="0" :showText="config.bars.overlay"></swatch>
    </div>
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
    }
  }
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
