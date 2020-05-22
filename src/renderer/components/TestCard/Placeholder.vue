<template>
  <div id="placeholder" :style="{background : config.placeholder.bg}" :class="{gradient : config.placeholder.gradient}">
    <div v-resize-text="{ratio:1, minFontSize: '10px', maxFontSize: '500px'}" class="name" :style="{color:config.placeholder.fg}">
      <span v-if="config.name != ''" style="font-size: 200%;" class="fas" :class="config.placeholder.icon"></span>
      <br v-if="config.name != ''" />{{ config.name }}
    </div>

    <transition name="fade">
      <div v-if="config.showInfo" id="infoText" :style="{color:config.placeholder.fg}">
        {{cardResolution}}
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
      config: Object
    },
    computed: {
      cardResolution: function() {
        if (this.config.fullsize || this.config.screen == 0) {
          return visualViewport.width + ' x ' + visualViewport.height
        } else {
          return this.config.width + ' x ' + this.config.height
        }
      }
    }
  }
</script>

<style scoped>
  #placeholder {
    background: #d33;
    height: 100%;
    width: 100%;
  }
  #infoText {
    position: absolute;
    width: 100%;
    height: 30px;
    font-size: 26px;
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
  .gradient:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0) 25%, rgba(0,0,0,0.3) 100%);
  }
</style>
