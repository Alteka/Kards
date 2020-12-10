<template>
  <div id="placeholder" :style="{ background : config.placeholder.bg }">
    <transition name="fade">
      <div id="gradient" v-if="config.placeholder.gradient"></div>
    </transition>
    <div v-resize-text="{ratio:1, minFontSize: '10px', maxFontSize: '500px'}" class="name" :style="{ color:config.placeholder.fg }">
      <transition name="fade">
        <span v-if="config.placeholder.icon" style="font-size: 200%;" class="fas" :class="config.placeholder.icon"></span>
      </transition>
      <transition name="fade">
        <br v-if="config.placeholder.icon != ''" />
      </transition>
      {{ config.name }}
      
    </div>

    <transition name="fade">
      <div v-resize-text="{ratio:4}" v-if="config.showInfo" id="infoText" :style="{color:config.placeholder.fg}">
        {{ cardSize }}
      </div>
    </transition>
    <transition name="fade">
      <div v-resize-text="{ratio:4}" v-if="config.showInfo" id="time" :style="{color:config.placeholder.fg}">
        {{ time }}
      </div>
    </transition>
  </div>
</template>

<script>
import ResizeText from 'vue-resize-text'
  export default {
    directives: {
      ResizeText
    },
    props: {
      config: Object,
      cardSize: String,
      time: String
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
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .name span {
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
