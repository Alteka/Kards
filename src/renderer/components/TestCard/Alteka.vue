<template>
  <div id="alteka" :class="{gradient : config.alteka.gradient}">

    <div class="grid">
      <div class="gridQuadrant" style="background-position: bottom right"></div>
      <div class="gridQuadrant" style="background-position: bottom left"></div>
      <div class="gridQuadrant" style="background-position: top right"></div>
      <div class="gridQuadrant"></div>
    </div>

    <div class="border">
      <div class="borderTop"></div>
      <div class="borderBottom"></div>
      <div class="borderLeft"></div>
      <div class="borderRight"></div>
    </div>

    <div class="corners">
      <div class="cornerTopLeft" :style="cornerStyle"></div>
      <div class="cornerTopRight" :style="cornerStyle"></div>
      <div class="cornerBottomLeft" :style="cornerStyle"></div>
      <div class="cornerBottomRight" :style="cornerStyle"></div>
    </div>

    <div id="centerbox">

      <svg viewBox="-50 -50 100 100" height="100%" width="100%">

        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(234,234,234);stop-opacity:1" />
        </linearGradient>

        <circle cx="0" cy="0" r="45" stroke="white" stroke-width="1" fill="black" />
        

        <g id="spinny-box">
          <rect x="-45" y="-5" width="90" height="10" fill="url(#grad1)" />
          <animateTransform v-if="config.animated" attributeName="transform" type="rotate" dur="5s" from="0" to="360" repeatCount="indefinite" />
        </g>

        <text x="0" y="10" w="90" text-anchor="middle" font-size="10px" :style="{fill: config.alteka.textColour}">{{config.name}}</text>

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
    },
    computed: {
      cornerStyle: function() {
        return {
          'border-color': this.config.alteka.cornerColour
        }
      }
    }
  }
</script>

<style scoped>

  .grid {
    height: 100%;
    width: 100%;
  }
  .gridQuadrant {
    height: 50%;
    width: 50%;
    outline: 2px solid white;
    outline-offset: -2px;
    float: left;
    background-size: 50px 50px;
    background-image:
      linear-gradient(to right, #666 1px, transparent 1px),
      linear-gradient(to bottom, #666 1px, transparent 1px);
  }

  .border {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
  }
  .border div {
    position: absolute;
    background-size: 100px 100px;
    background-position: 50%;
  }
  .borderTop {
    background: black;
    background-image: linear-gradient(270deg, transparent 50%, currentColor 50%);
    height: 25px;
    width: 100%;
    top: 0px;
  }
  .borderBottom {
    background: black;
    background-image: linear-gradient(90deg, transparent 50%, currentColor 50%);
    height: 25px;
    bottom: 0px;
    width: 100%;
  }
  .borderLeft {
    left: 0;
    width: 25px;
    height: 100%;
    background: black;
    background-image: linear-gradient(0deg, transparent 50%, currentColor 50%);
  }
  .borderRight {
    right: 0;
    width: 25px;
    height: 100%;
    background: black;
    background-image: linear-gradient(180deg, transparent 50%, currentColor 50%);
  }
  
.corners {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; left: 0;
}
.corners div {
  width: 50px;
  height: 50px;
  position: absolute;
}
.cornerTopLeft {
  top: 0; left: 0;
  border-top: 25px solid red;
  border-left: 25px solid red;
}
.cornerTopRight {
  top: 0; right: 0;
  border-top: 25px solid red;
  border-right: 25px solid red;
}
.cornerBottomLeft {
  bottom: 0; left: 0;
  border-bottom: 25px solid red;
  border-left: 25px solid red;
}
.cornerBottomRight {
  bottom: 0; right: 0;
  border-bottom: 25px solid red;
  border-right: 25px solid red;
}

   #alteka {
    background: #3d3d3d;
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
