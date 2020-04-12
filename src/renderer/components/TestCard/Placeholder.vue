<template>
  <div id="placeholder">
   <h1 class="name">{{ config.displayName }}</h1>
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
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: -100;
  }
  .name {
    position: absolute;
    vertical-align: middle;
    top: 40%;
    width: 100%;
    height: 20%;
    text-align: center;
    font-size: 500%;
  }
</style>
