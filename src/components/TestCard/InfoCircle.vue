<template>
  <transition name="fade">
    <div v-if="config.showInfo" class="info" :style="cssVars">
      <div class="infoText" :class="{ biggerText : config.name.length < 11, evenBiggerText : config.name.length < 6}">{{ config.name }}</div>
      <div class="sizeText">{{ info.cardSize }}</div>
      <div v-if="config.showClock" class="clock">{{ info.time }}</div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "InfoCircle",
    props: {
      config: Object,
      info: Object
    },
    computed: {
      cssVars() {
        return {
          '--info-circle-size': this.info.circleSize + 'px'
        }
      }
    },
  }
</script>

<style scoped>
  .info {
    position: absolute;
    font-size: calc(var(--info-circle-size)/8);
    width: var(--info-circle-size);
    height: var(--info-circle-size);
    margin: auto;
    left: calc(50% - var(--info-circle-size)/2);
    top: calc(50% - var(--info-circle-size)/2);
    text-align: center;
    text-shadow: 0px 0px 5px rgba(0, 10, 0, 1);
    background: rgba(0,0,0,0.2);
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.5);
    overflow: hidden;
    z-index: 100;
}
.infoText {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  width: 90%;
  left: 5%;
  max-height: 69%;
  overflow: hidden;
  overflow-wrap: break-word;
}
.biggerText {
  font-size: 120%;
}
.evenBiggerText {
  font-size: 150%;
}
.sizeText {
  position: absolute;
  width: 50%;
  left: 25%;
  top: 5%;
  overflow: hidden;
  font-size: 66%;
}
.sizeText span {
  display: inline-block;
}
.clock {
  position: absolute;
  width: 50%;
  left: 25%;
  bottom: 5%;
  overflow: hidden;
  font-size: 66%;
}
.clock span {
  display: inline-block;
}

 .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
