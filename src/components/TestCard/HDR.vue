<template>
  <div id="hdr">

    <div class="row" style="height: 10%;">
        <swatch colour="white" ire="-7" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="yellow" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="cyan" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="green" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="magenta" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="red" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="blue" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="100" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="109" :showText="config.bars.overlay"></swatch>
    </div>
    <div class="row" style="height: 10%;">
        <swatch colour="white" ire="0" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="-7" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="yellow" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="cyan" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="green" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="magenta" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="red" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="blue" ire="75" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="109" :showText="config.bars.overlay"></swatch>
        <swatch colour="white" ire="100" :showText="config.bars.overlay"></swatch>
    </div>

    <div class="grad">
      <transition name="fade">
        <span v-if="config.bars.overlay" style="padding: 10px;">Ramp from 0% IRE (64/1024) to 100% IRE (940/1024) with 10x reversed pluges</span>
      </transition>
    </div>
    <div class="grad">
      <div class="gap"></div>
      <div class="rev rev1"></div>
      <div class="gap"></div>
      <div class="rev rev2"></div>
      <div class="gap"></div>
      <div class="rev rev3"></div>
      <div class="gap"></div>
      <div class="rev rev4"></div>
      <div class="gap"></div>
      <div class="rev rev5"></div>
      <div class="gap"></div>
      <div class="rev rev6"></div>
      <div class="gap"></div>
      <div class="rev rev7"></div>
      <div class="gap"></div>
      <div class="rev rev8"></div>
      <div class="gap"></div>
      <div class="rev rev9"></div>
      <div class="gap"></div>
      <div class="rev rev10"></div>
      <div class="gap"></div>
    </div>
    <div class="grad"></div>

      <transition name="fade">
        <span v-if="config.bars.overlay" class="sharpnessText">Sharpness Indication</span>
      </transition>
    <div class="row sharpness">
      <div class="sharp s1"></div>
      <div class="sharp s2"></div>
      <div class="sharp s3"></div>
      <div class="sharp s4"></div>
      <div class="sharp s5"></div>
    </div>


    <div class="row last">
      <div v-if="config.showInfo" class="infoBox">
        <div>{{ info.cardSize }} - {{info.displayFrequency}}Hz</div>
        <div>{{config.name}}</div>
        <div>{{ info.network[info.networkIndex] }}</div>
        <div v-if="config.showClock">{{ info.time }}</div> 
      </div>
      <div class="stripe-v-1" style="width: 50%;"></div>
      <div class="stripe-h-1" style="width: 50%;"></div>
      <div class="rainbow"></div>
    </div>


  </div>
</template>

<script>
import Swatch from './Swatch'
  export default {
    name: "BarsHDRTestCard",
    components: { Swatch },
    props: {
      config: Object,
      info: Object
    }
  }
</script>

<style scoped>
  #hdr {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: grey;
  }

  .infoBox {
    background-color: #000;
    color: #6ab42f;
    width: 30%;
    display: flex;
    padding: 10px;
    flex-direction: column;
    justify-content: space-around;
    text-align: center;
    font-size: 3vh;
  }
 
 
  .row  {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  
  .row .swatch {
    width: 100%;
  }

  .grad {
    height: 10%;
    background: linear-gradient(90deg, hsl(0deg, 0%, 6.25%) 0%, hsl(0deg, 0% ,91.79%) 100%);
    display: flex;
    justify-content: space-between;
  }
  .rev {
    height: 100%;
    width: 5%;
  }

  .gap {
    width: 5%;
  }

  .rev1 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 14.397%,1) 0%, hsl(0deg, 0%, 10.323%) 100%);
  }
  .rev2 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 22.544%,1) 0%, hsl(0deg, 0%, 18.471%) 100%);
  }
  .rev3 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 30.692%,1) 0%, hsl(0deg, 0%, 26.618%) 100%);
  }
  .rev4 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 38.839%,1) 0%, hsl(0deg, 0%, 34.766%) 100%);
  }
  .rev5 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 46.987%,1) 0%, hsl(0deg, 0%, 42.913%) 100%);
  }
  .rev6 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 55.134%,1) 0%, hsl(0deg, 0%, 51.060%) 100%);
  }
  .rev7 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 63.281%,1) 0%, hsl(0deg, 0%, 59.208%) 100%);
  }
  .rev8 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 71.429%,1) 0%, hsl(0deg, 0%, 67.355%) 100%);
  }
  .rev9 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 79.576%,1) 0%, hsl(0deg, 0%, 75.502%) 100%);
  }
  .rev10 {
    background: linear-gradient(90deg, hsl(0deg, 0%, 87.732%,1) 0%, hsl(0deg, 0%, 83.650%) 100%);
  }

  .sharpness {
    background: hsl(0deg, 0% ,6.25%);
    height: 25%;
    display: flex;
    justify-content:space-around;
    align-items:center;
  }
  .sharpnessText {
    position: relative;
    top: 10px;
    left: 10px;
    height: 0px;
    margin: 0;
    display: block;
  }
  .sharp {
    background: hsl(0deg, 0% ,91.796%);
  }

  .s1 {
    width: 0.5vw;
    height: 0.5vw;
  }
  .s2 {
    width: 1.25vw;
    height: 1.25vw;
  }

  .s3 {
    width: 2vw;
    height: 2vw;
  }

  .s4 {
    width: 3vw;
    height: 3vw;
  }
  .s5 {
    width: 4vw;
    height: 4vw;
  }

.last {
  height: 25%;
}
.last div {
  height: 100%;
  width: 100%;
}

  .stripe-h-1 {
  background-image: repeating-linear-gradient(
    90deg,
    white,
    white 1px,
    black 1px,
    black
  );
  background-size: 2px 2px;
}
.stripe-v-1 {
  background-image: repeating-linear-gradient(
    0deg,
    white,
    white 1px,
    black 1px,
    black
  );
  background-size: 2px 2px;
}
.rainbow {
  background: linear-gradient(90deg, hsl(0deg, 87.3%, 50%) 0%, hsl(60deg, 87.3%, 50%) 20%, hsl(120deg, 87.3%, 50%) 40%, hsl(180, 87.3%, 50%) 60%, hsl(240deg, 87.3%, 50%) 80%, hsl(300deg, 87.3%, 50%) 100%);
}
</style>
