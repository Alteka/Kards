<template>
  <div id="smpte">
    <div class="row">
      <div class="white75"></div>
      <div class="yellow75"></div>
      <div class="cyan75"></div>
      <div class="green75"></div>
      <div class="magenta75"></div>
      <div class="red75"></div>
      <div class="blue75"></div>
    </div>
    <div class="row" style="height: 8.25%">
      <div class="blue75"></div>
      <div class="black"></div>
      <div class="magenta75"></div>
      <div class="black"></div>
      <div class="cyan75"></div>
      <div class="black"></div>
      <div class="white75"></div>
    </div>
    <div class="row">
      <div class="row" style="flex-grow: 4; width: 500%;">
        <div style="background-color:#00214c"></div>
        <div class="white"></div>
        <div style="background-color:#31006b"></div>
        <div class="black"></div>
      </div>
      <div class="row">
        <div class="superblack"></div>
        <div class="black"></div>
        <div style="background-color:rgb(29,29,29)"></div>
      </div>
      <div class="black"></div>
    </div>
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
  #smpte {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: grey;
  }
  .row {
    height: 66.66%;
    display: flex;
  }
  .row div {
    height: 100%;
    width: 100%;
  }
</style>
