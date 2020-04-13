<template>
  <div id="grid">
   <div class="quadrant topleft"></div>
   <div class="quadrant topright"></div>
   <div class="quadrant bottomleft"></div>
   <div class="quadrant"></div>
  </div>
</template>

<script>
  export default {
    props: {
      config: Object
    }
  }
</script>

<style scoped>
  #grid {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: black;
  }
  .quadrant {
    height: calc(50% - 2px);
    width: calc(50% - 2px);
    border: 1px solid white;
    float: left;
    background-size: 50px 50px;
    background-image:
      linear-gradient(to right, grey 1px, transparent 1px),
      linear-gradient(to bottom, grey 1px, transparent 1px);
  }
  .topleft {
    background-position: bottom right;
  }
  .topright {
    background-position: bottom left;
  }
  .bottomleft {
    background-position: top right;
  }
</style>
