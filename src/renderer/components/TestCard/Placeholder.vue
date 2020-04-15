<template>
  <div id="placeholder" :style="{background : config.placeholder.bg}" :class="{gradient : config.placeholder.gradient}">
    <div v-resize-text="{ratio:1, minFontSize: '10px', maxFontSize: '500px'}" class="name" :style="{color:config.placeholder.fg}">
      <span v-if="config.placeholder.name != ''" style="font-size: 200%;" class="fas" :class="config.placeholder.icon"></span>
      <br v-if="config.placeholder.name != ''" />{{ config.placeholder.name }}
    </div>
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
    }
  }
</script>

<style scoped>
  #placeholder {
    background: #d33;
    height: 100%;
    width: 100%;
  }
  .name {
    position: absolute;
    vertical-align: middle;
    top: 40%;
    width: 100%;
    height: 20%;
    text-align: center;
  }
  .name span {
    font-size: 10%;
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
