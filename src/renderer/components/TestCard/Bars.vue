<template>
  <div id="bars">
    <div class="thebars">
        <div style="background: #ffffff" :style="{opacity: opacity}"></div>
        <div style="background: #ffff00" :style="{opacity: opacity}"></div>
        <div style="background: #00ffff" :style="{opacity: opacity}"></div>
        <div style="background: #00ff00" :style="{opacity: opacity}"></div>
        <div style="background: #ff00ff" :style="{opacity: opacity}"></div>
        <div style="background: #ff0000" :style="{opacity: opacity}"></div>
        <div style="background: #0000ff" :style="{opacity: opacity}"></div>
        <div class="black"></div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      config: Object
    },
    computed: {
      opacity: function() {
        var LUT={"75%":0.7059, "100%":0.9215, "109%":1};
        return LUT[this.config.bars.level];
      }
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
