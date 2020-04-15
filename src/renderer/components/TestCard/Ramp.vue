<template>
  <div id="ramp">
    <div class="ramp"></div>
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
  #ramp {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    
    background: black;
  }
 .ramp {
    background: linear-gradient(90deg,black,white);
  }
  #ramp div {
    width: 100%;
    height: 100%;
  }
</style>
