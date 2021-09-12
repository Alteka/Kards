<template>
  <div id="led">

    <div v-for="row in config.led.rows" :key="row" class="row" :style="{width: config.led.columns*config.led.width + 'px'}">
      <led-panel v-for="column in config.led.columns" :key="column" :led="config.led" :row="row" :column="column"></led-panel>
    </div>
    
    <info-circle :config="config" :info="info"/>
  </div>
</template>

<script>
import InfoCircle from './InfoCircle'
import LedPanel from './LedPanel.vue'

  export default {
    components: { InfoCircle, LedPanel },
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
</style>
