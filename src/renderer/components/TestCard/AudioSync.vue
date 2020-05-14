<template>
  <div id="audioSync">

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

  </div>
</template>

<script>
export default {
  props: {
    config: Object
  }
}
</script>

<style scoped>

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
  left: calc(50% - 25px);
  border-right: 25px solid transparent;
  border-bottom: 25px solid #6ab42e;
  border-left: 25px solid transparent;
}
.arrowBottom {
  left: calc(50% - 25px);
  bottom: 0;
  border-right: 25px solid transparent;
  border-top: 25px solid #6ab42e;
  border-left: 25px solid transparent;
}
.arrowLeft {
  top: calc(50% - 25px);
  border-top: 25px solid transparent;
  border-right: 25px solid #6ab42e;
  border-bottom: 25px solid transparent;
}
.arrowRight {
  top: calc(50% - 25px);
  right: 0;
  border-top: 25px solid transparent;
  border-left: 25px solid #6ab42e;
  border-bottom: 25px solid transparent;
}

#audioSync {
  background: #3d3d3d;
  height: 100%;
  width: 100%;
  color: white;
}

</style>
