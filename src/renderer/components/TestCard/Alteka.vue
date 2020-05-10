<template>
  <div id="alteka" :class="{gradient : config.alteka.gradient}">

    <div id="centerbox">
      <svg viewBox="-50 -50 100 100" height="100%" width="100%">
        <defs>
          <clipPath id="clipCircle">
            <circle cx="0" cy="0" r="45" />
          </clipPath>
          <linearGradient id="hLuma" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(234,234,234);stop-opacity:1" />
          </linearGradient>
          <linearGradient id="parade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0" stop-color="rgb(234,16,16)"/>
            <stop offset="0.333" stop-color="rgb(234,234,16)"/>
            <stop offset="0.5" stop-color="rgb(16,234,16)"/>
            <stop offset="0.666" stop-color="rgb(16,234,234)"/>
            <stop offset="0.833" stop-color="rgb(16,16,234)"/>
            <stop offset="1" stop-color="rgb(234,16,234)"/>
          </linearGradient>
          <linearGradient id="vLuma" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(234,234,234);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
          </linearGradient>
          <linearGradient id="vAlpha" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(234,234,234);stop-opacity:0" />
            <stop offset="100%" style="stop-color:rgb(234,234,234);stop-opacity:1" />
          </linearGradient>
        </defs>

        <g id="clip-me" clip-path="url('#clipCircle')">  
          <rect x="-45" y="-45" width="90" height="30" fill="url('#hLuma')" />
          <rect x="-45" y="15" width="90" height="30" fill="url('#parade')" />
          <rect x="-45" y="15" width="90" height="30" fill="url('#vLuma')" style="mix-blend-mode: multiply" />
          <text x="0" y="10" w="90" text-anchor="middle" font-size="10px" :style="{fill: config.alteka.textColour}" >{{config.name}}</text>
          <g v-if="config.alteka.animated" id="spinny-box">
            <animateTransform attributeName="transform" type="rotate" dur="5s" from="0" to="360" repeatCount="indefinite" />
            <rect x="0" y="-5" width="50" height="5" fill="url('#vAlpha')" />
          </g>
          <circle cx="0" cy="0" r="45" stroke="white" stroke-width="1" fill="none" />
        </g>
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
    height: 66%;
    width: 66%;
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
