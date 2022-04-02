<template>
  <div id="alteka" :class="{gradient : config.alteka.gradient}" :style="{background : config.alteka.bg}" >
    <resize-observer @notify="handleResize" />
    <div class="grid">
      <div class="gridQuadrant gridtopleft" :style="grid"></div>
      <div class="gridQuadrant gridtopright" :style="grid"></div>
      <div class="gridQuadrant gridbottomleft" :style="grid"></div>
      <div class="gridQuadrant" :style="grid"></div>
    </div>

    <div class="border">
      <div class="borderTop" :class="{borderAnimatedl2r : config.animated}"></div>
      <div class="borderBottom" :class="{borderAnimatedr2l : config.animated}"></div>
      <div class="borderLeft" :class="{borderAnimatedbtt : config.animated}"></div>
      <div class="borderRight" :class="{borderAnimatedttb : config.animated}"></div>
    </div>

    <div class="corners">
      <div class="cornerTopLeft" :style="{'border-color': this.config.alteka.fg}"></div>
      <div class="cornerTopRight" :style="{'border-color': this.config.alteka.fg}"></div>
      <div class="cornerBottomLeft" :style="{'border-color': this.config.alteka.fg}"></div>
      <div class="cornerBottomRight" :style="{'border-color': this.config.alteka.fg}"></div>
    </div>

    <div class="arrows">
      <div class="arrowTop" :style="{'border-bottom-color': this.config.alteka.fg}"></div>
      <div class="arrowRight" :style="{'border-left-color': this.config.alteka.fg}"></div>
      <div class="arrowBottom" :style="{'border-top-color': this.config.alteka.fg}"></div>
      <div class="arrowLeft" :style="{'border-right-color': this.config.alteka.fg}"></div>
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
      <div class="stripe-v-4"></div>
      <div class="stripe-v-2"></div>
      <div class="stripe-v-1"></div>
      <div class="stripe-h-1"></div>
      <div class="stripe-h-2"></div>
      <div class="stripe-h-4"></div>
    </div>

    <div class="cornerCircles">
      <svg viewBox="0 0 50 50">
        <defs>
          <clipPath id="clipSmallCircle">
            <circle cx="0" cy="0" r="25" />
          </clipPath>
          <transition name="fade">
            <g v-if="config.animated" id="spinny-radar" >
                <animateTransform attributeName="transform" type="rotate" dur="4s" from="0" to="360" repeatCount="indefinite"/>
                <path d='M0,0 L25,0 A25,25 0 0,1 24.9,2.18z' />
            </g>
          </transition>
          <linearGradient id="vAlphaB" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(0 0 0);stop-opacity:0" />
            <stop offset="100%" style="stop-color:rgb(0 0 0);stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
      <div class="circleTopLeft">
        <svg viewBox="-25 -25 50 50" height="100%" width="100%" preserveAspectRatio="xMinYMin meet">
          <g clip-path="url(#clipSmallCircle)">
            <rect x="-25" y="-25" height="26" width="26" fill="rgb(0 0 0)" />
            <rect x="0" y="-25" height="26" width="25" fill="rgb(16 16 16)" />
            <rect x="-25" y="0" height="25" width="26" fill="rgb(16 16 16)" />
            <rect x="0" y="0" height="25" width="25" fill="rgb(0 0 0)" />
            <use href="#spinny-radar" fill="url('#vAlpha')"/>
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
            <use href="#spinny-radar" fill="url('#vAlphaB')" />
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
            <use href="#spinny-radar" fill="url('#vAlphaB')"/>
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
            <use href="#spinny-radar" fill="url('#vAlpha')"/>
            <circle cx="0" cy="0" r="25" stroke="white" stroke-width="1" fill="none" />
          </g>
        </svg>
      </div>
    </div>

    <div id="centerbox">
      <transition name="fade">
        <img v-if="config.alteka.logo != ''" id="customLogo" :src="config.alteka.logo" />      
      </transition>

      <svg viewBox="-50 -50 100 100" height="100%" width="100%">
        <defs>
          <clipPath id="clipCircle">
            <circle cx="0" cy="0" r="45" />
          </clipPath>
          <linearGradient id="hLuma" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(16,16,16);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(235,235,235);stop-opacity:1" />
          </linearGradient>
          <linearGradient id="parade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0" stop-color="rgb(235 0 0)" />
            <stop offset="0.333" stop-color="rgb(235 235 0)" />
            <stop offset="0.5" stop-color="rgb(0 235 0)" />
            <stop offset="0.666" stop-color="rgb(0 235 235)" />
            <stop offset="0.833" stop-color="rgb(0 0 235)" />
            <stop offset="1" stop-color="rgb(235 0 235)" />
          </linearGradient>
          <linearGradient id="vLuma" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(235 235 235);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(16 16 16);stop-opacity:1" />
          </linearGradient>
          <linearGradient id="vAlpha" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(235 235 235);stop-opacity:0" />
            <stop offset="100%" style="stop-color:rgb(235 235 235);stop-opacity:1" />
          </linearGradient>
        </defs>

        <g id="clip-me" clip-path="url('#clipCircle')">
          <transition name="fade">
            <svg v-if="!config.alteka.showLogo || config.alteka.logo == ''" viewBox="0 0 850.39 283.46" x="-45" y="-15" width="90" height="30">
              <rect style="fill:#6ab42f;" width="850.39" height="283.46"/>
              <path style="fill:#fff;" d="M253.29,141.73h-6l19-44.69h6.41l19.07,44.69h-6.41l-5.78-14.06H264.76l1.6-4.69h11.25l-8.35-20.26Z"/>
              <path style="fill:#fff;" d="M303.61,97v40H327v4.69H297.83V97Z"/>
              <path style="fill:#fff;" d="M354.65,97v4.68H340.59v40h-5.78v-40H320.74V97Z"/>
              <path style="fill:#fff;" d="M390.76,97v4.68H367.31v15h22.35v4.69H367.31V137h23.91v4.69H361.53V97Z"/>
              <path style="fill:#fff;" d="M405.76,97v44.69H400V97Zm31.44,0-20.13,21.09,20.57,23.6h-8l-18.23-21.5v-3.5L429.89,97Z"/>
              <path style="fill:#fff;" d="M445.2,141.73h-6l19-44.69h6.41l19.07,44.69h-6.41l-5.78-14.06H456.67l1.6-4.69h11.25l-8.35-20.26Z"/>
              <path style="fill:#fff;" d="M300.75,184.33v-2.67a22.55,22.55,0,0,0,7.64,1.25q5.81,0,5.8-4.24,0-3.61-4.28-3.62H307q-7.06,0-7.06-6.13,0-6.45,9-6.45a27,27,0,0,1,7.31.95v2.67a20.75,20.75,0,0,0-7.31-1.26c-4.09,0-6.13,1.37-6.13,4.09q0,3.62,4.15,3.62h2.89q7.18,0,7.19,6.13,0,6.6-8.71,6.6A29.45,29.45,0,0,1,300.75,184.33Z"/>
              <path style="fill:#fff;" d="M320.56,173.9q0-11.43,11.29-11.43,11.11,0,11.11,11.43t-11.11,11.37Q320.55,185.27,320.56,173.9Zm11.29,9q8,0,8-9.1t-8-9q-8.24,0-8.23,9T331.85,182.91Z"/>
              <path style="fill:#fff;" d="M350.43,162.63v20.13h11.76v2.36H347.52V162.63Z"/>
              <path style="fill:#fff;" d="M365.49,176.44V162.63h2.91v13.81q0,6.48,6.45,6.47t6.44-6.47V162.63h2.91v13.81q0,8.84-9.35,8.83T365.49,176.44Z"/>
              <path style="fill:#fff;" d="M404.57,162.63V165h-7.08v20.13h-2.91V165h-7.07v-2.36Z"/>
              <path style="fill:#fff;" d="M411.4,162.63v22.49h-2.9V162.63Z"/>
              <path style="fill:#fff;" d="M416.44,173.9q0-11.43,11.29-11.43,11.11,0,11.11,11.43t-11.11,11.37Q416.43,185.27,416.44,173.9Zm11.29,9q8,0,8-9.1t-8-9q-8.24,0-8.23,9T427.73,182.91Z"/>
              <path style="fill:#fff;" d="M443.4,185.12V162.63h2.91l13.76,18.11V162.63h2.75v22.49h-2.91l-13.76-18.27v18.27Z"/>
              <path style="fill:#fff;" d="M467.85,184.33v-2.67a22.63,22.63,0,0,0,7.64,1.25q5.81,0,5.8-4.24,0-3.61-4.27-3.62h-2.9q-7,0-7.06-6.13,0-6.45,9.05-6.45a27.09,27.09,0,0,1,7.31.95v2.67a20.79,20.79,0,0,0-7.31-1.26c-4.09,0-6.14,1.37-6.14,4.09,0,2.41,1.39,3.62,4.15,3.62H477q7.19,0,7.18,6.13,0,6.6-8.71,6.6A29.56,29.56,0,0,1,467.85,184.33Z"/>
              <path style="fill:#fff;" d="M546.48,166.41c-2.54-1.55-4.88-3.08-7.3-4.43-6.69-3.75-13.28-7.67-19.93-11.47-4.56-2.61-9.05-5.37-13.75-7.75a2.74,2.74,0,0,1-1.66-2.85q.07-30.63,0-61.24c0-2.17,0-2.18,1.86-1.12l45,25.92c2.11,1.22,2.12,1.52,0,2.72-10.31,6-20.59,12-31,17.79-1.86,1-2.68,2.19-2.4,4.27a27.09,27.09,0,0,1,0,3.25c0,2.1,0,2.14,1.93,1q19.08-11,38.14-22a4.78,4.78,0,0,1,5.5-.06c17.17,10,34.44,19.92,51.67,29.86a4.16,4.16,0,0,1,1.91,1.47c-2.67,1.56-5.32,3.12-8,4.65l-38.87,22.38c-2.06,1.19-2.08,1.18-2.08-1.12,0-12.14,0-24.28,0-36.42,0-1.75-.38-2.93-2.18-3.48s-2.88-2.38-5.07-2.48v2.49c0,14.78,0,29.56,0,44.35a3,3,0,0,1-1.72,3.05Q532,190.54,505.29,206c-.34.19-.71.35-1.25.62V150.42c.9-.11,1.55.58,2.26,1q15.66,9,31.26,18.08a3,3,0,0,0,3.66-.05C542.83,168.35,544.59,167.49,546.48,166.41Z"/>
            </svg>
          </transition>
          <rect x="-45" y="-45" width="90" height="30.1" fill="url('#hLuma')" />
          <rect x="-45" y="15" width="90" height="30.1" fill="url('#parade')" />
          <rect x="-45" y="15" width="90" height="30.1" fill="url('#vLuma')" style="mix-blend-mode: multiply" />
          <transition name="fade">
            <g v-if="config.showInfo">
            <g v-if="config.alteka.showLogo && !config.alteka.logo == ''" :fill="config.alteka.bg" fill-opacity="75%">
              <rect x="-45" y="10" width="90" height="5" />
              <rect x="-45" y="-15" width="90" height="7" />
            </g>
            <text x="0" y="-9.5" w="50" text-anchor="middle" font-size="5px" :style="{fill: text}">{{config.name}}</text>
            <text x="-40" y="14" w="50" text-anchor="start" font-size="3px" :style="{fill: text}">{{ info.network[info.networkIndex] }}</text>
            <text x="40" y="14" w="50" text-anchor="end" font-size="3px" :style="{fill: text}">{{info.cardSize}} - {{info.displayFrequency}}Hz</text>
            <text v-if="config.showClock" x="0" y="14" w="50" text-anchor="middle" font-size="3px" :style="{fill: text}">{{info.time}}</text>
          </g>
          </transition>
          <transition name="fade">
          <g v-if="config.animated" id="spinny-box">
            <animateTransform attributeName="transform" type="rotate" dur="4s" from="0" to="360" repeatCount="indefinite" />
            <path d='M0,0 L45,0 A45,45 0 0,1 44.83,3.92z' fill="url('#vAlpha')" />
          </g>
          </transition>
          <circle cx="0" cy="0" r="45" stroke="white" stroke-width="1" fill="none" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import Swatch from "./Swatch"
export default {
  components: { Swatch },
  props: {
    config: Object,
    info: Object
  },
  watch: {
      config: {
        handler: function (val, oldVal) { 
          if (val.alteka != oldVal.alteka) {
            let vm = this
            setTimeout(function(){
              let size = {
                width: document.getElementById("alteka").getBoundingClientRect().width,
                height: document.getElementById("alteka").getBoundingClientRect().height
              }
              vm.handleResize(size)
            }, 250)
            
          }
         },
        deep: true
      },
    },
  computed: {
    text: function() {
      if (this.config.alteka.showLogo && this.config.alteka.logo != '') {
        return this.config.alteka.textColour
      } else {
        return "#fff"
      }
    },
    grid: function() {
      var luma = this.toLuma(this.config.alteka.bg)
      if (luma > 127) {
        return {
          'outline': '2px solid #000',
          'background-size': '50px 50px',
          'background-image': `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`
        }
      } else {
        return {
          'outline': '2px solid white',
          'background-size': '50px 50px',
          'background-image': `linear-gradient(to right, #bbb 1px, transparent 1px), linear-gradient(to bottom, #bbb 1px, transparent 1px)`
        }
      }
    }
  },
  methods: {
    toLuma: function(hex) {
      var c = hex.substring(1)
      var rgb = parseInt(c, 16)
      var r = (rgb >> 16) & 0xff
      var g = (rgb >>  8) & 0xff
      var b = (rgb >>  0) & 0xff
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    },
    handleResize: function({ width, height }) {
      let ratio = width/height
      
      let pillarLeft = document.getElementById("pillarLeft")
      let pillarRight = document.getElementById("pillarRight")
      let circle = document.getElementById("clipCircle")
      let customLogo = document.getElementById("customLogo")
      let circleWidth = circle.getBoundingClientRect().width

      if (customLogo) {
        customLogo.style.width = circleWidth + 'px'
        customLogo.style.height = (circle.getBoundingClientRect().height / 3) + 2 + 'px'
      }

      if (ratio >= 1) {
        let pillarWidth = Math.round((width / 50) * 0.055) * 50
        let pillarHeight = (Math.floor((height / 100) * 0.6)) * 100

        if (ratio > 2 && height > 300) { pillarHeight += 100 }
        if (ratio > 3 && width > 800) { pillarWidth += 50 }

        pillarWidth -= 1;
        pillarHeight -= 1;

        pillarLeft.style.width = pillarWidth + "px"
        pillarRight.style.width = pillarWidth + "px"
        pillarLeft.style.height = pillarHeight + "px"
        pillarRight.style.height = pillarHeight + "px"
        pillarLeft.style.flexDirection = "column"
        pillarRight.style.flexDirection = "column"
        pillarLeft.style.bottom = '50%'
        pillarLeft.style.transform = 'none'
        pillarLeft.style.transform = 'translateY(calc(+50% + 1px))'
        pillarRight.style.top = 'calc(50% + 1px)'
        pillarRight.style.transform = 'translateY(-50%)'
        
        let gap = 0
        if (ratio > 1.1 && width > 1400) { gap = 50 }
        if (ratio > 1.5 && width > 1000) { gap = 50 }
        if (ratio > 1.8 && width > 800) { gap = 50 }
        if (ratio > 2.2) { gap = 100 }
        if (ratio > 3) { gap = 150 }

        let left = (Math.ceil(circleWidth / 2 / 50) * 50 + width / 2) + gap
        pillarRight.style.left = left + 1 + "px"
        pillarLeft.style.left = width - left - pillarWidth + "px"
      } else {
        let pillarWidth = Math.floor((width / 100) * 0.6) * 100
        let pillarHeight = (Math.floor((height / 50) * 0.1)) * 50

        pillarHeight -= 1;
        pillarWidth -= 1;

        pillarLeft.style.width = pillarWidth + "px"
        pillarRight.style.width = pillarWidth + "px"
        pillarLeft.style.height = pillarHeight + "px"
        pillarRight.style.height = pillarHeight + "px"

        pillarLeft.style.flexDirection = "row"
        pillarRight.style.flexDirection = "row"

        pillarLeft.style.left = 'calc(50% + 1px)'
        pillarRight.style.left = 'calc(50% + 1px)'
        pillarLeft.style.transform = 'translateX(-50%)'
        pillarRight.style.transform = 'translateX(-50%)'

        let gap = 0
        if (ratio < 0.8) { gap = 50 }
        if (ratio < 0.6) { gap = 100 }
        if (ratio < 0.4) { gap = 150 }

        let leftBottom = (height/2) + (Math.ceil(circleWidth / 2 / 50) * 50) + gap
        pillarLeft.style.bottom = leftBottom + 'px'
        pillarRight.style.top = leftBottom + 1 + 'px'
      }
    }
  },
  mounted: function() {
    let size = {
      width: document.getElementById("alteka").getBoundingClientRect().width,
      height: document.getElementById("alteka").getBoundingClientRect().height
    };
    this.handleResize(size);
  }
}
</script>

<style scoped>
#customLogo {
  position: absolute;
  z-index: -10;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  object-fit: cover;
  clip-path: circle(66.7%);
  background-color: #6ab42e;
}
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
.gridtopleft {
    background-position: bottom right;
  }
  .gridtopright {
    background-position: bottom left;
  }
  .gridbottomleft {
    background-position: top right;
  }
.gradient:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0.4) 100%);
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
@media screen and (max-height: 700px), (max-width: 700px) {
  .borderLeft {
    width: 16px;
  }
  .borderRight {
    width: 16px;
  }
  .borderTop {
    height: 16px;
  }
  .borderBottom {
    height: 16px;
  }
}
@media screen and (max-height: 500px), (max-width: 500px) {
  .borderLeft {
    width: 10px;
  }
  .borderRight {
    width: 10px;
  }
  .borderTop {
    height: 10px;
  }
  .borderBottom {
    height: 10px;
  }
}

.borderAnimatedl2r {
  animation: left-to-right 4s infinite;
  animation-timing-function: linear;
}
.borderAnimatedr2l {
  animation: right-to-left 4s infinite;
  animation-timing-function: linear;
}
.borderAnimatedbtt {
  animation: bottom-to-top 4s infinite;
  animation-timing-function: linear;
}
.borderAnimatedttb {
  animation: top-to-bottom 4s infinite;
  animation-timing-function: linear;
}
@keyframes left-to-right {
    0%       { background-position: 0%; }
    100%     { background-position: 100px; }
}
@keyframes right-to-left {
    0%       { background-position: 100px; }
    100%     { background-position: 0%; }
}
@keyframes top-to-bottom {
    0%       { background-position: 0 0%; }
    100%     { background-position: 0 100px; }
}
@keyframes bottom-to-top {
    0%       { background-position: 0 100px; }
    100%     { background-position: 0 0%; }
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
@media screen and (max-height: 700px), (max-width: 700px) {
  .corners div {
    height: 32px;
    width: 32px;
  }
  .cornerTopLeft {
    border-width: 16px;
  }
  .cornerTopRight {
    border-width: 16px;
  }
  .cornerBottomLeft {
    border-width: 16px;
  }
  .cornerBottomRight {
    border-width: 16px;
  }
}
@media screen and (max-height: 500px), (max-width: 500px) {
  .corners div {
    height: 20px;
    width: 20px;
  }
  .cornerTopLeft {
    border-width: 10px;
  }
  .cornerTopRight {
    border-width: 10px;
  }
  .cornerBottomLeft {
    border-width: 10px;
  }
  .cornerBottomRight {
    border-width: 10px;
  }
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
@media screen and (max-height: 700px), (max-width: 700px) {
  .arrowTop {
    border-width: 20px;
    left: calc(50% - 20px)
  }
  .arrowBottom {
    border-width: 20px;
    left: calc(50% - 20px)
  }
  .arrowLeft {
    border-width: 20px;
    top: calc(50% - 20px)
  }
  .arrowRight {
    border-width: 20px;
    top: calc(50% - 20px)
  }
}

@media screen and (max-height: 500px), (max-width: 500px) {
  .arrowTop {
    border-width: 15px;
    left: calc(50% - 15px)
  }
  .arrowBottom {
    border-width: 15px;
    left: calc(50% - 15px)
  }
  .arrowLeft {
    border-width: 15px;
    top: calc(50% - 15px)
  }
  .arrowRight {
    border-width: 15px;
    top: calc(50% - 15px)
  }
}

.pillar {
  position: absolute;
  display: flex;
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

@media screen and (max-height: 700px), (max-width: 700px) {
  .circleTopLeft {
    top: 32px;
    left: 32px;
  }
  .circleTopRight {
    top: 32px;
    right: 32px;
  }
  .circleBottomLeft {
    bottom: 32px;
    left: 32px;
  }
  .circleBottomRight {
    bottom: 32px;
    right: 32px;
  }
}

@media screen and (max-height: 500px), (max-width: 500px) {
    .circleTopLeft {
    top: 20px;
    left: 20px;
  }
  .circleTopRight {
    top: 20px;
    right: 20px;
  }
  .circleBottomLeft {
    bottom: 20px;
    left: 20px;
  }
  .circleBottomRight {
    bottom: 20px;
    right: 20px;
  }
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
