<template>
  <div id="led">

    <div v-for="row in config.led.rows" :key="row" class="row" :style="{width: config.led.columns*config.led.width + 'px'}">
      <led-panel v-for="column in config.led.columns" :key="column" :config="config" :row="row" :column="column"></led-panel>

      <div v-if="row == Math.ceil(config.led.rows/2)" class="infoLine">
      {{config.name}} - {{ config.led.rows*config.led.width }} x {{ config.led.columns*config.led.height}} on {{info.cardSize}}
      </div>

    </div>
    
  </div>
</template>

<script>
import LedPanel from './LedPanel.vue'

  export default {
    components: { LedPanel },
    props: {
      config: Object,
      info: Object
    },
    computed: {
      quadrantStyle: function() {
        return {
          outline: '1px solid red',
          'background-size': this.config.led.width + 'px ' + this.config.led.height +'px',
          'background-image': `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`
        }
      }
    }
  }
</script>

<style scoped>
  #led {

  }
  .row {
    clear: both;
  }
  .infoLine {
    position: relative;
    height: 32px;
    top: -25px;
    font-size: 21px;
    width: 100%;
    text-align: center;
    color: #000;
    /* text-shadow: 0px 0px 5px #000; */
  }
</style>
