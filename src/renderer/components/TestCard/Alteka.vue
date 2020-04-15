<template>
  <div id="alteka" :class="{gradient : config.alteka.gradient}">

    <div id="centerbox">
      <svg viewBox="-50 -50 100 100" height="100%" width="100%">
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(234,234,234);stop-opacity:1" />
        </linearGradient>

        <circle cx="0" cy="0" r="45" stroke="white" stroke-width="1" fill="none" />
        <g id="spinny-box">
          <rect x="-40" y="-5" width="80" height="10" fill="url(#grad1)" />
          <animateTransform v-if="config.animated" attributeName="transform" type="rotate" dur="5s" from="0" to="360" repeatCount="indefinite" />
        </g>
        <text x="0" y="-10" text-anchor="middle" fill="blue" font-size="10px">"Something"</text>
        <text x="0" y="10" text-anchor="middle" font-size="10px" :style="{fill: config.alteka.textColour}">{{config.alteka.text}}</text>
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
