<template>
  <div id="placeholder" :style="{background : config.colourPri}" :class="{gradient : config.gradient}">
   <h1 class="name" :style="{color:config.colourSec}">{{ config.displayName }}</h1>
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
  #placeholder {
    background: #d33;
    height: 100%;
    width: 100%;
  }
  .name {
    position: absolute;
    vertical-align: middle;
    top: 40%;
    width: 100%;
    height: 20%;
    text-align: center;
    font-size: 300%;
  }
  .gradient:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%);
  }
</style>
