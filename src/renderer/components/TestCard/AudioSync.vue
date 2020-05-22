<template>
  <div id="audioSync">

    <div class="border">
      <div class="borderTop"></div>
      <div class="borderBottom"></div>
      <div class="borderLeft"></div>
      <div class="borderRight"></div>
    </div>

    <div class="corners">
      <div class="cornerTopLeft"></div>
      <div class="cornerTopRight"></div>
      <div class="cornerBottomLeft"></div>
      <div class="cornerBottomRight"></div>
    </div>

    <div class="arrows">
      <div class="arrowTop"></div>
      <div class="arrowRight"></div>
      <div class="arrowBottom"></div>
      <div class="arrowLeft"></div>
    </div>

    <video id="vt" :src="videoSource" loop autoplay />

    <span id="cardName">Kards - Audio Sync</span>
    <span id="frameRate">{{ config.audioSync.rate }} FPS</span>

    <transition name="fade">
      <div v-if="config.showInfo">
        <div id="deviceLabel"><i class="fas fa-volume-up" /> {{ description }}</div>
        <div id="infoText">{{ config.name }}<br />{{cardResolution}}</div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    config: Object
  },
  data: function() {
    return {
      description: "Default Interface"
    }
  },
  watch: {
      config: {
        handler: function (val, oldVal) { 
          this.updateDeviceName(val)
         },
        deep: true
      },
    },
    methods: {
      updateDeviceName: function(val) {
        let vt = document.getElementById('vt')
        vt.setSinkId(val.audioSync.deviceId)
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          devices = devices.filter(device => device.kind === 'audiooutput')
          for (const dev of devices) {
            if (dev.deviceId == val.audioSync.deviceId) {
              this.description = dev.label
            }
          }
        })
      }
    },
    computed: {
      videoSource: function() {
        return 'file://' + __static + '/audiosync/' + this.config.audioSync.rate + '.webm'
      },
      cardResolution: function() {
        if (this.config.fullsize || this.config.screen == 0) {
          return this.config.winWidth + ' x ' + this.config.winHeight
        } else {
          return this.config.width + ' x ' + this.config.height
        }
      }
    },
    mounted: function() {
      document.getElementById('vt').setSinkId(this.config.audioSync.deviceId)
      this.updateDeviceName(this.config)
    }
}
</script>

<style scoped>

#cardName {
  position: absolute;
  top: 30px;
  font-size: 200%;
  width: 50%;
  left: 50px;
  text-align: left;
  opacity: 0.8;
}
#frameRate {
  position: absolute;
  top: 30px;
  right: 50px;
  font-size: 200%;
  width: 33%;
  opacity: 0.8;
  text-align: right;
}
#deviceLabel {
  position: absolute;
  width: calc(50% - 50px);
  height: 40px;
  bottom: 20px;
  left: 50px;
  text-align: left;
}
#infoText {
  position: absolute;
  width: calc(50% - 50px);
  height: 38px;
  bottom: 26px;
  right: 50px;
  text-align: right;
}

#vt {
  position: absolute;
  width: calc(100% - 100px);
  height: calc(100% - 100px);
  top: 50px;
  left: 50px;
  right: 50px;
  bottom: 50px;
}

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
  border-top: 25px solid #6ab42e;
  border-left: 25px solid #6ab42e;
}
.cornerTopRight {
  top: 0;
  right: 0;
  border-top: 25px solid #6ab42e;
  border-right: 25px solid #6ab42e;
}
.cornerBottomLeft {
  bottom: 0;
  left: 0;
  border-bottom: 25px solid #6ab42e;
  border-left: 25px solid #6ab42e;
}
.cornerBottomRight {
  bottom: 0;
  right: 0;
  border-bottom: 25px solid #6ab42e;
  border-right: 25px solid #6ab42e;
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
  background: #272727;
  height: 100%;
  width: 100%;
  color: white;
  font-size: 16px;
}

</style>
