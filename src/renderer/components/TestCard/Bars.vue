<template>
  <div id="bars">
    <div id="bar1"></div>
    <div id="bar2"></div>
    <div id="bar3"></div>
    <div id="bar4"></div>
    <div id="bar5"></div>
    <div id="bar6"></div>
    <div id="bar7"></div>
    <div id="bar8"></div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
      }
    },
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
    z-index: -100;
    background: black;
  }
  #bars div {
    float:left;
    width: 12.5%;
    height: 100%;
  }
  #bar1 {
    background-color: rgba(255, 255, 255, 0.75)
  }
  #bar2 {
    background-color: rgba(255, 255, 0, 0.75)
  }
  #bar3 {
    background-color: rgba(0, 255, 255, 0.75)
  }
  #bar4 {
    background-color: rgba(0, 255, 0, 0.75)
  }
  #bar5 {
    background-color: rgba(255, 0, 255, 0.75)
  }
  #bar6 {
    background-color: rgba(255, 0, 0, 0.75)
  }
  #bar7 {
    background-color: rgba(0, 0, 255, 0.75)
  }
  #bar8 {
    background-color: rgba(0, 0, 0, 1)
  }
</style>
