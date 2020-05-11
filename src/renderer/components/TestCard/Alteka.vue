<template>
  <div id="alteka" :class="{gradient : config.alteka.gradient}">
    <resize-observer @notify="handleResize" />
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
      <div class="cornerTopLeft" :style="{'border-color': this.config.alteka.cornerColour}"></div>
      <div class="cornerTopRight" :style="{'border-color': this.config.alteka.cornerColour}"></div>
      <div class="cornerBottomLeft" :style="{'border-color': this.config.alteka.cornerColour}"></div>
      <div class="cornerBottomRight" :style="{'border-color': this.config.alteka.cornerColour}"></div>
    </div>

    <div class="arrows">
      <div class="arrowTop" :style="{'border-bottom-color': this.config.alteka.cornerColour}"></div>
      <div class="arrowRight" :style="{'border-left-color': this.config.alteka.cornerColour}"></div>
      <div class="arrowBottom" :style="{'border-top-color': this.config.alteka.cornerColour}"></div>
      <div class="arrowLeft" :style="{'border-right-color': this.config.alteka.cornerColour}"></div>
    </div>

    <div id="pillarLeft" class="pillar">
      <swatch colour="black" ire="-7.5" :showText="false"></swatch>
      <swatch colour="black" ire="0" :showText="false"></swatch>
      <swatch colour="black" ire="10" :showText="false"></swatch>
      <swatch colour="black" ire="20" :showText="false"></swatch>
      <swatch colour="black" ire="30" :showText="false"></swatch>
      <swatch colour="black" ire="40" :showText="false"></swatch>
      <swatch colour="black" ire="50" :showText="false"></swatch>
      <swatch colour="black" ire="60" :showText="false"></swatch>
      <swatch colour="black" ire="70" :showText="false"></swatch>
      <swatch colour="black" ire="80" :showText="false"></swatch>
      <swatch colour="black" ire="90" :showText="false"></swatch>
      <swatch colour="black" ire="100" :showText="false"></swatch>
      <swatch colour="black" ire="109" :showText="false"></swatch>
    </div>

    <div id="pillarRight" class="pillar">
      <div class="stripe-v-1"></div>
      <div class="stripe-v-2"></div>
      <div class="stripe-v-4"></div>
      <div class="stripe-h-4"></div>
      <div class="stripe-h-2"></div>
      <div class="stripe-h-1"></div>
    </div>

    <div class="cornerCircles">
      <svg viewBox="0 0 50 50">
        <defs>
          <clipPath id="clipSmallCircle">
            <circle cx="0" cy="0" r="25" />
          </clipPath>
          <g v-if="config.alteka.animated" id="spinny-radar">
              <animateTransform attributeName="transform" type="rotate" dur="4s" from="0" to="360" repeatCount="indefinite"/>
              <rect x="0" y="-2" width="25" height="2" fill="url('#vAlpha')" />
          </g>
        </defs>
      </svg>
      <div class="circleTopLeft">
        <svg viewBox="-25 -25 50 50" height="100%" width="100%" preserveAspectRatio="xMinYMin meet">
          <g clip-path="url(#clipSmallCircle)">
            <rect x="-25" y="-25" height="26" width="26" fill="rgb(0 0 0)" />
            <rect x="0" y="-25" height="26" width="25" fill="rgb(16 16 16)" />
            <rect x="-25" y="0" height="25" width="26" fill="rgb(16 16 16)" />
            <rect x="0" y="0" height="25" width="25" fill="rgb(0 0 0)" />
            <use href="#spinny-radar" />
            <circle cx="0" cy="0" r="25" stroke="white" stroke-width="1" fill="none" />
          </g>
        </svg>
      </div>
      <div class="circleTopRight">
        <svg viewBox="-25 -25 50 50" height="100%" width="100%" preserveAspectRatio="xMaxYMin meet">
          <g clip-path="url(#clipSmallCircle)">
            <rect x="-25" y="-25" height="26" width="26" fill="rgb(255 255 255)" />
            <rect x="0" y="-25" height="26" width="25" fill="rgb(234 234 234)" />
            <rect x="-25" y="0" height="25" width="26" fill="rgb(234 234 234)" />
            <rect x="0" y="0" height="25" width="25" fill="rgb(255 255 255)" />
            <use href="#spinny-radar" />
            <circle cx="0" cy="0" r="25" stroke="white" stroke-width="1" fill="none" />
          </g>
        </svg>
      </div>
      
      <div class="circleBottomLeft">
        <svg viewBox="-25 -25 50 50" height="100%" width="100%" preserveAspectRatio="xMinYMax meet">
          <g clip-path="url(#clipSmallCircle)">
            <path d='M0,0 L45,0 A45,45 0 0,1 22.5,38.97z' fill="rgb(0 180 180)" />
            <path d='M0,0 L22.5,38.97 A45,45 0 0,1 -22.5,38.97z' fill="rgb(180 0 180)" />
            <path d='M0,0 L-22.5,38.97 A45,45 0 0,1 -45,0z' fill="rgb(180 180 0)" />
            <path d='M0,0 L-45,0 A45,45 0 0,1 -22.5,-38.97z' fill="rgb(0 255 255)" />
            <path d='M0,0 L-22.5,-38.97 A45,45 0 0,1 22.5,-38.97z' fill="rgb(255 0 255)" />
            <path d='M0,0 L22.5,-38.97 A45,45 0 0,1 45,0z' fill="rgb(255 255 0)" />
            <use href="#spinny-radar" />
            <circle cx="0" cy="0" r="25" stroke="white" stroke-width="1" fill="none" />
          </g>
        </svg>
      </div>
      <div class="circleBottomRight">
        <svg viewBox="-25 -25 50 50" height="100%" width="100%" preserveAspectRatio="xMaxYMax meet">
            <g clip-path="url(#clipSmallCircle)">
            <path d='M0,0 L45,0 A45,45 0 0,1 22.5,38.97z' fill="rgb(180 0 0)" />
            <path d='M0,0 L22.5,38.97 A45,45 0 0,1 -22.5,38.97z' fill="rgb(0 180 0)" />
            <path d='M0,0 L-22.5,38.97 A45,45 0 0,1 -45,0z' fill="rgb(0 0 180)" />
            <path d='M0,0 L-45,0 A45,45 0 0,1 -22.5,-38.97z' fill="rgb(235 0 0)" />
            <path d='M0,0 L-22.5,-38.97 A45,45 0 0,1 22.5,-38.97z' fill="rgb(0 235 0)" />
            <path d='M0,0 L22.5,-38.97 A45,45 0 0,1 45,0z' fill="rgb(0 0 235)" />
            <use href="#spinny-radar" />
            <circle cx="0" cy="0" r="25" stroke="white" stroke-width="1" fill="none" />
          </g>
        </svg>
      </div>
    </div>

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
            <stop offset="0" stop-color="rgb(234,16,16)" />
            <stop offset="0.333" stop-color="rgb(234,234,16)" />
            <stop offset="0.5" stop-color="rgb(16,234,16)" />
            <stop offset="0.666" stop-color="rgb(16,234,234)" />
            <stop offset="0.833" stop-color="rgb(16,16,234)" />
            <stop offset="1" stop-color="rgb(234,16,234)" />
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
          <text x="0" y="10" w="90" text-anchor="middle" font-size="10px" :style="{fill: config.alteka.textColour}">{{config.name}}</text>
          <g v-if="config.alteka.animated" id="spinny-box">
            <animateTransform attributeName="transform" type="rotate" dur="4s" from="0" to="360" repeatCount="indefinite" />
            <rect x="0" y="-5" width="50" height="5" fill="url('#vAlpha')" />
          </g>
          <circle cx="0" cy="0" r="45" stroke="white" stroke-width="1" fill="none" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import Swatch from "./Swatch";
export default {
  components: { Swatch },
  data() {
    return {
      electron: process.versions.electron,
      name: this.$route.name
    };
  },
  props: {
    config: Object
  },
  methods: {
    handleResize: function({ width, height }) {
      let w = Math.round((width / 50) * 0.066) * 50;
      document.getElementById("pillarLeft").style.width = w + "px";
      document.getElementById("pillarRight").style.width = w + "px";

      let h = Math.round((height / 100) * 0.66) * 100;
      document.getElementById("pillarLeft").style.height = h + "px";
      document.getElementById("pillarRight").style.height = h + "px";

      let circleWidth = document
        .getElementById("clipCircle")
        .getBoundingClientRect().width;
      let left = Math.ceil(circleWidth / 2 / 50) * 50 + width / 2;
      document.getElementById("pillarRight").style.left = left + "px";
      document.getElementById("pillarLeft").style.left =
        width - left - w + "px";
    }
  },
  mounted: function() {
    let size = {
      width: document.getElementById("alteka").getBoundingClientRect().width,
      height: document.getElementById("alteka").getBoundingClientRect().height
    };
    this.handleResize(size);
  }
};
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
  background-image: linear-gradient(to right, #666 1px, transparent 1px),
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
  top: 0;
  left: 0;
}
.corners div {
  width: 50px;
  height: 50px;
  position: absolute;
}
.cornerTopLeft {
  top: 0;
  left: 0;
  border-top: 25px solid red;
  border-left: 25px solid red;
}
.cornerTopRight {
  top: 0;
  right: 0;
  border-top: 25px solid red;
  border-right: 25px solid red;
}
.cornerBottomLeft {
  bottom: 0;
  left: 0;
  border-bottom: 25px solid red;
  border-left: 25px solid red;
}
.cornerBottomRight {
  bottom: 0;
  right: 0;
  border-bottom: 25px solid red;
  border-right: 25px solid red;
}

.arrows {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}
.arrows div {
  position: absolute;
  width: 0;
  height: 0;
}
.arrowTop {
  left: calc(50% - 50px);
  border-right: 50px solid transparent;
  border-bottom: 50px solid #6ab42e;
  border-left: 50px solid transparent;
}
.arrowBottom {
  left: calc(50% - 50px);
  bottom: 0;
  border-right: 50px solid transparent;
  border-top: 50px solid #6ab42e;
  border-left: 50px solid transparent;
}
.arrowLeft {
  top: calc(50% - 50px);
  border-top: 50px solid transparent;
  border-right: 50px solid #6ab42e;
  border-bottom: 50px solid transparent;
}
.arrowRight {
  top: calc(50% - 50px);
  right: 0;
  border-top: 50px solid transparent;
  border-left: 50px solid #6ab42e;
  border-bottom: 50px solid transparent;
}
.pillar {
  position: absolute;
  width: 100px;
  height: 75%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
}
.pillar div {
  width: 100%;
  height: 100%;
  padding: 0;
}
.stripe-v-1 {
  background-image: repeating-linear-gradient(
    0deg,
    white,
    white 1px,
    black 1px,
    black
  );
  background-size: 2px 2px;
}
.stripe-v-2 {
  background-image: repeating-linear-gradient(
    0deg,
    white,
    white 2px,
    black 2px,
    black
  );
  background-size: 4px 4px;
}
.stripe-v-4 {
  background-image: repeating-linear-gradient(
    0deg,
    white,
    white 4px,
    black 4px,
    black
  );
  background-size: 8px 8px;
}
.stripe-h-1 {
  background-image: repeating-linear-gradient(
    90deg,
    white,
    white 1px,
    black 1px,
    black
  );
  background-size: 2px 2px;
}
.stripe-h-2 {
  background-image: repeating-linear-gradient(
    90deg,
    white,
    white 2px,
    black 2px,
    black
  );
  background-size: 4px 4px;
}
.stripe-h-4 {
  background-image: repeating-linear-gradient(
    90deg,
    white,
    white 4px,
    black 4px,
    black
  );
  background-size: 8px 8px;
}

.cornerCircles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.cornerCircles div {
  /* these are a ratio of 9:16 to each other to make the scaling work sensibly */
  width: 14%;
  height: 25%;
  position: absolute;
  /* border: 2px solid red; */
}

.circleTopLeft {
  top: 50px;
  left: 50px;
}
.circleTopRight {
  top: 50px;
  right: 50px;
}
.circleBottomLeft {
  bottom: 50px;
  left: 50px;
}
.circleBottomRight {
  bottom: 50px;
  right: 50px;
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
  background: linear-gradient(to right, black, white);
}

.gradient:before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
}
</style>
