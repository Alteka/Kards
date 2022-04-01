<template>
  <div>
    <div v-for="row in config.led.rows" :key="row" class="row" :style="{width: config.led.columns*config.led.width + 'px'}">
      <led-panel v-for="column in config.led.columns" :key="column" :config="config" :row="row" :column="column"></led-panel>
    </div>
    <div v-if="config.showInfo" class="infoLine" :style="infoStyle">
      {{config.name}} - {{ config.led.columns*config.led.width }} x {{ config.led.rows*config.led.height}}
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
      infoStyle: function() {
        let offset = 21
        if (this.config.led.height < 78) {
          offset = 16
        } 
        if (this.config.led.height < 62) {
          offset = 12
        }

        let top = (Math.min(visualViewport.height, this.config.led.rows*this.config.led.height)/2)
        if (visualViewport.height >= this.config.led.rows*this.config.led.height && this.config.led.height > 42) {
          top -= (offset * (1-this.config.led.rows%2))
        }
        
        return {
          left: Math.min(visualViewport.width, this.config.led.columns*this.config.led.width)/2 + 'px',
          top: top + 'px',
          fontSize: offset + 'px'
        }
      },
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
  .row {
    clear: both;
  }
  .infoLine {
    position: absolute;
    padding: 3px;
    transform:translate(-50%, -50%);
    font-size: 21px;
    margin: auto;
    text-align: center;
    color: #fff;
    background: rgba(1,1,1,0.5);
    /* text-shadow: 0px 0px 5px #000; */
  }
</style>
