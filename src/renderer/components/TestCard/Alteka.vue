<template>
  <div id="alteka" :class="{gradient : config.gradient}">

    <div id="centerbox">
      <svg viewBox="-50 -50 100 100" height="100%" width="100%">
        <circle cx="0" cy="0" r="45" stroke="white" stroke-width="1" fill="none" />
      </svg>
    </div>
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
   #alteka {
    background: #d33;
    height: 100%;
    width: 100%;
    color: white;
  }

  #centerbox {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 75%;
    width: 75%;
    border: 2px solid white;
    background: black;
    overflow: hidden;
  }

.ramp {
  margin-top: 45%;
  height: 10%;
  width: 100%;
  background: linear-gradient(to right, black, white)
  
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
