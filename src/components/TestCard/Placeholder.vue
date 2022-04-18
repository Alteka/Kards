<template>
  <div id="placeholder" :style="{ background : config.placeholder.bg }">
    <transition name="fade">
      <div id="gradient" v-if="config.placeholder.gradient"></div>
    </transition>
    <div v-resize-text="{ratio:1, minFontSize: '10px', maxFontSize: '500px'}" class="name" :style="{ color:config.placeholder.fg }">
      <i v-if="config.placeholder.icon != 'custom'" style="font-size: 200%;" class="fa-solid" :class="config.placeholder.icon"></i>
      <i v-else style="font-size: 200%;" class="fa-solid" :class="config.placeholder.custom"></i>
      
      <br v-if="config.placeholder.icon != ''" />
      
      {{ config.name }}
      
    </div>

    <transition name="fade">
      <div v-resize-text="{ratio:4}" v-if="config.showInfo" id="infoText" :style="{color:config.placeholder.fg}">
        {{ info.cardSize }}
      </div>
    </transition>
    <transition name="fade">
      <div v-resize-text="{ratio:4}" v-if="config.showInfo" id="time" :style="{color:config.placeholder.fg}">
        <div style="width: 45%; text-align: left; display: inline-block">{{ config.showClock ? info.time : "" }}</div>
        <div style="width: 45%; text-align: right; display: inline-block">{{ info.network[info.networkIndex] }}</div>
      </div>
    </transition>
  </div>
</template>

<script>
import VueResizeText from 'vue3-resize-text'
  export default {
    name: "PlaceholderTestCard",
    directives: {
      ResizeText: VueResizeText.ResizeText
    },
    props: {
      config: Object,
      info: Object
    }
  }
</script>

<style scoped>
  #placeholder {
    background: #d33;
    height: 100%;
    width: 100%;
    font-size: 26px;
  }
  #infoText {
    position: absolute;
    width: 100%;
    top: 10px;
    text-align: center;
  }
  #time {
    position: absolute;
    width: 100%;
    bottom: 10px;
    text-align: center;
  }
  .name {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    text-align: center;
  }
  .name i {
    font-size: 1%;
  }
  #gradient {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0) 25%, rgba(0,0,0,0.4) 100%);
  }
</style>
