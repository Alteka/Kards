<template>
  <div id="grid" :style="{background: config.grid.bg}">
    <div class="quadrant topleft" :style="quadrantStyle"></div>
    <div class="quadrant topright" :style="quadrantStyle"></div>
    <div class="quadrant bottomleft" :style="quadrantStyle"></div>
    <div class="quadrant" :style="quadrantStyle"></div>
    <transition name="fade">
    <div v-if="config.grid.circles">
      <div class="cornerCircles">
        <svg>
          <defs>
            <circle id="smallCircle" cx="0" cy="0" r="130" :stroke="config.grid.crosshair" stroke-width="2" fill="black" fill-opacity="0.5" />
            <circle id="bigCircle" cx="0" cy="0" r="430" :stroke="config.grid.crosshair" stroke-width="2" fill="black" fill-opacity="0.5" />
          </defs>
        </svg>
        <div class="circleTopLeft">
          <svg viewBox="-135 -135 270 270" height="100%" width="100%" preserveAspectRatio="xMinYMin meet">
            <use href="#smallCircle" />
          </svg>
        </div>
        <div class="circleTopRight">
          <svg viewBox="-135 -135 270 270" height="100%" width="100%" preserveAspectRatio="xMaxYMin meet">
            <use href="#smallCircle" />
          </svg>
        </div>
        <div class="circleBottomLeft">
          <svg viewBox="-135 -135 270 270" height="100%" width="100%" preserveAspectRatio="xMinYMax meet">
            <use href="#smallCircle" />
          </svg>
        </div>
        <div class="circleBottomRight">
          <svg viewBox="-135 -135 270 270" height="100%" width="100%" preserveAspectRatio="xMaxYMax meet">
            <use href="#smallCircle" />
          </svg>
        </div>
      </div>
      <div class="centerCircle">
        <svg viewBox="-432 -432 864 864" height="100%" width="100%">
          <use href="#bigCircle" />
        </svg>
      </div>
    </div>
    </transition>
    <info-circle :config="config" :cardSize="cardSize" :time="time"/>
  </div>
</template>

<script>
import InfoCircle from './InfoCircle'
  export default {
    components: { InfoCircle },
    props: {
      config: Object,
      cardSize: String,
      time: String
    },
    computed: {
      quadrantStyle: function() {
        return {
          outline: '1px solid ' + this.config.grid.crosshair,
          'background-size': this.config.grid.size + 'px ' + this.config.grid.size +'px',
          'background-image': `linear-gradient(to right, ${this.config.grid.lines} 1px, transparent 1px), linear-gradient(to bottom, ${this.config.grid.lines} 1px, transparent 1px)`
        }
      }
    }
  }
</script>

<style scoped>
  #grid {
    height: 100%;
    width: 100%;
    background: black;
  }
  .quadrant {
    outline: 1px solid red;
    outline-offset: -1px;
    height: 50%;
    width: 50%;
    float: left;
  }
  .topleft {
    background-position: bottom right;
  }
  .topright {
    background-position: bottom left;
  }
  .bottomleft {
    background-position: top right;
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

.centerCircle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 80%;
  width: 80%;
  overflow: hidden;
  /* border: 2px solid red; */
}
</style>
