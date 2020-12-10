<template>
  <transition name="fade">
    <div v-if="config.showInfo" class="info" :class="{ fullsize : !config.fullsize }">
      <div class="infoText" :class="{ biggerText : config.name.length < 20, evenBiggerText : config.name.length < 12}">{{ config.name }}</div>
      <div class="sizeText">{{ cardSize }}</div>
      <div class="clock">{{ time }}</div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      config: Object,
      cardSize: String,
      time: String
    }
  }
</script>

<style scoped>
  .info {
    position: absolute;
    font-size: 56px;
    width: 500px;
    height: 500px;
    margin: auto;
    left: calc(50% - 250px);
    top: calc(50% - 250px);
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
  font-size: 150%;
}
.evenBiggerText {
  font-size: 200%;
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


@media screen and (max-height: 1600px), (max-width: 1600px) {
  .info {
    font-size: 48px;
    width: 400px;
    height: 400px;
    left: calc(50% - 200px);
    top: calc(50% - 200px);
  }
}
@media screen and (max-height: 1300px), (max-width: 1300px) {
  .info {
    font-size: 36px;
    width: 300px;
    height: 300px;
    left: calc(50% - 150px);
    top: calc(50% - 150px);
  }
}
@media screen and (max-height: 900px), (max-width: 900px) {
  .info {
    font-size: 24px;
    width: 200px;
    height: 200px;
    left: calc(50% - 100px);
    top: calc(50% - 100px);
  }
}
@media screen and (max-height: 500px), (max-width: 500px) {
  .info {
    font-size: 18px;
    width: 150px;
    height: 150px;
    left: calc(50% - 75px);
    top: calc(50% - 75px);
  }
}
@media screen and (max-height: 300px), (max-width: 300px) {
  .info {
    font-size: 12px;
    width: 100px;
    height: 100px;
    left: calc(50% - 50px);
    top: calc(50% - 50px);
  }
}
.fullsize {
    font-size: 24px;
    width: 200px;
    height: 200px;
    left: calc(50% - 100px);
    top: calc(50% - 100px);
  }
</style>
