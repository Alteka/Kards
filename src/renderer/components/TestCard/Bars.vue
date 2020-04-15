<template>
  <div id="bars">
    <div class="thebars">
        <swatch colour="white" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="yellow" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="cyan" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="green" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="magenta" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="red" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="blue" :ire="config.bars.level" :showText="config.bars.overlay"></swatch>
        <swatch colour="black" ire="0" :showText="config.bars.overlay"></swatch>
    </div>
  </div>
</template>

<script>
import Swatch from './Swatch'
  export default {
    components: { Swatch },
    props: {
      config: Object
    }
  }
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
  }
  #bars div {
    width: 100%;
    height: 100%;
  }
</style>
