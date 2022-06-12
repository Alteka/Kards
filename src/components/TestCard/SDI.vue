<template>
  <div id="bars">
    <info-circle :config="config" :info="info" />
    <div class="top">
      <transition name="fade">
        <div v-if="config.bars.overlay" class="text">
          SDI Pathological Test
        </div>
      </transition>
    </div>
    <div class="bottom"></div>
  </div>
</template>

<script>
import InfoCircle from './InfoCircle'
  export default {
    name: "BarsSimpleTestCard",
    components: { InfoCircle },
    props: {
      config: Object,
      info: Object
    }
  }
</script>

<style scoped>
  #bars {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background: black;
  }
  .top {
    background-color: rgb(215, 52, 235);
    width: 100%;
    height: 50%;
  }
  .bottom {
    background-color: rgb(61, 61, 61);
    width: 100%;
    height: 50%;
  }
  
  .text {
    padding: 10px;
  }

  .top .text {
    position: absolute;
    bottom: 50%;
  }
</style>
