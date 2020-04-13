<template>
  <div id="bars">
    <div class="white75"></div>
    <div class="yellow75"></div>
    <div class="cyan75"></div>
    <div class="green75"></div>
    <div class="magenta75"></div>
    <div class="red75"></div>
    <div class="blue75"></div>
    <div class="black"></div>
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
  #bars {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    display: flex;
    background: black;
  }
  #bars div {
    width: 100%;
    height: 100%;
  }
</style>
