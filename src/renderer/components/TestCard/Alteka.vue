<template>
  <div id="alteka" :class="{gradient : config.gradient}">

   <div id="centercircle">
     <div class="ramp"></div>
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

  #centercircle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: 75%;
    max-width: 75%;
    height: 75vw;
    width: 75vh;
    border: 2px solid white;
    background: black;
    border-radius: 50%;
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
