<template>
  <transition name="fade">
    <div v-if="config.showInfo" class="info">
      <div class="infoText">
        <strong>{{ config.name}}</strong><br />
        {{ cardSize }}
      </div>
    </div>
  </transition>
</template>

<script>
import ResizeText from 'vue-resize-text'
  export default {
    directives: {
      ResizeText
    },
    props: {
      config: Object,
      cardSize: String
    }
  }
</script>

<style scoped>
  .info {
    position: absolute;
    font-size: 24px;
    width: 200px;
    height: 200px;
    margin: auto;
    left: calc(50% - 100px);
    top: calc(50% - 100px);
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
  width: calc(100% - 40px);
  left: 20px;
}
 .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
