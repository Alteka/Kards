<template>
  <div id="arib">

    <info-circle :config="config" :cardSize="cardSize" :time="time" />
  
    <div class="row grey40">
      <div class="endbit"><swatch colour="white" ire="40" :showText="config.bars.overlay"></swatch></div>
      <div class="centerbit">
          <swatch colour="white" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="yellow" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="cyan" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="green" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="magenta" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="red" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="blue" ire="100" :showText="config.bars.overlay"></swatch>
      </div>
      <div class="endbit"><swatch colour="white" ire="40" :showText="config.bars.overlay"></swatch></div>
    </div>

    <div class="row grey40" style="height: 50%">
      <div class="endbit"><swatch colour="white" ire="40" :showText="false"></swatch></div>
      <div class="centerbit">
        <swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch>
          <swatch colour="yellow" ire="75" :showText="config.bars.overlay"></swatch>
          <swatch colour="cyan" ire="75" :showText="config.bars.overlay"></swatch>
          <swatch colour="green" ire="75" :showText="config.bars.overlay"></swatch>
          <swatch colour="magenta" ire="75" :showText="config.bars.overlay"></swatch>
          <swatch colour="red" ire="75" :showText="config.bars.overlay"></swatch>
          <swatch colour="blue" ire="75" :showText="config.bars.overlay"></swatch>
      </div>
      <div class="endbit"><swatch colour="white" ire="40" :showText="false"></swatch></div>
    </div>

    <div class="row">
      <div class="endbit"><swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch></div>
      <div class="centerbit">
          <swatch colour="white" ire="-7" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="-7" :showText="false"></swatch>
          <swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="10" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="20" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="30" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="40" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="50" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="60" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="70" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="80" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="90" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="100" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="109" :showText="config.bars.overlay"></swatch>
          
      </div>
      <div class="endbit"><swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch></div>
    </div>

    <div class="row">
      <div class="endbit"><swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch></div>
      <div style="width: 87.5%; float: left" class="ramp"></div>
    </div>

    <div class="row black" style="height: 25%">
      <div class="centerbit" style="width: 12.5%">
        <swatch colour="rec709yellow" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="rec709cyan" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="rec709green" ire="75" :showText="config.bars.overlay"></swatch>
      </div>
      <div class="centerbit">
        <div style="width: 9.444%;"><swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch></div>
        <div class="centerbit" style="width: 24.02%;">
          <swatch colour="white" ire="-2" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="2" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch>
          <swatch colour="white" ire="4" :showText="config.bars.overlay"></swatch>
        </div>
        <div style="width: 16.52777%;"><swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch></div>
        <div style="width: 30.41666%;"><swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch></div>
        <div style="width: 19.58333%;"><swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch></div>
      </div>
      <div class="centerbit" style="width: 12.5%">
        <swatch colour="rec709magenta" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="rec709red" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="rec709blue" ire="75" :showText="config.bars.overlay"></swatch>
      </div>
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
  #arib {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: grey;
  }
  .row {
    height: 8.33333%;
  }
  .row div {
    height: 100%;
    width: 100%;
  }
  .endbit {
    float: left;
    max-width: 12.5%;
  }
  .centerbit {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 75%;
    width: 75%;
    float: left;
  }
  .ramp {
    background: linear-gradient(90deg, rgba(0,0,0,1) 29%, rgba(255,255,255,1) 99%);
  }
</style>
