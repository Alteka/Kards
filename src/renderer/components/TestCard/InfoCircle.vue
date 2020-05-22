<template>
      <transition name="fade">
      <div v-if="config.showInfo" class="info">
        <div class="infoText">
          <strong>{{ config.name}}</strong><br />
          {{ cardResolution }}
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
      config: Object
    },
    computed: {
      cardResolution: function() {
        if (this.config.fullsize || this.config.screen == 0) {
          return this.config.winWidth + ' x ' + this.config.winHeight
        } else {
          return this.config.width + ' x ' + this.config.height
        }
      }
    }
  }
</script>

<style scoped>
  .info {
    position: absolute;
    font-size: 26px;
    width: 200px;
    height: 200px;
    margin: auto;
    left: calc(50% - 100px);
    top: calc(50% - 100px);
    text-align: center;
    background: rgba(0,0,0,0.2);
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.5);
    overflow: hidden;
}
.infoText {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
 .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
