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

    <div id="topText" class="textRow">
      <span v-resize-text="{ratio:1.5, maxFontSize: '64px'}" style="text-align: left">Audio Sync</span>
      <span v-resize-text="{ratio:1.5, maxFontSize: '64px'}" v-if="config.showInfo">{{ cardResolution }}</span>
      <span v-resize-text="{ratio:1.5, maxFontSize: '64px'}" style="text-align: right">{{ config.audioSync.rate }} FPS</span>
    </div>

    <div id="bottomText" class="textRow" v-if="config.showInfo">
      <span v-resize-text="{ratio:2, maxFontSize: '32px'}" style="text-align: left"><i class="fas fa-volume-up" /> {{ description }}</span>
      <span v-resize-text="{ratio:2, maxFontSize: '32px'}" style="text-align: right">{{ config.name }}</span>
    </div>

  </div>
</template>

<script>
import ResizeText from 'vue-resize-text'
export default {
  directives: { ResizeText },
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

.textRow {
  position: absolute;
  font-size: 28px;
  width: calc(100% - 80px);
  left: 40px;
  right: 40px;
  text-align: center;
  opacity: 0.8;
  display: flex;
  height: 38px;
  overflow: hidden;
  vertical-align: bottom;
}

#topText {
  top: 30px;
  
}
.textRow span {
  width: 100%;
  vertical-align: bottom;
}

#bottomText {
  bottom: 25px;
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

@media screen and (max-height: 600px), (max-width: 600px) {
  .borderLeft {
    width: 15px;
  }
  .borderRight {
    width: 15px;
  }
  .borderTop {
    height: 15px;
  }
  .borderBottom {
    height: 15px;
  }
  #bottomText {
    bottom: 15px;
  }
  #topText {
    bottom: 15px;
  }

  .corners div {
    height: 30px;
    width: 30px;
  }
  .cornerTopLeft {
    border-width: 15px;
  }
  .cornerTopRight {
    border-width: 15px;
  }
  .cornerBottomLeft {
    border-width: 15px;
  }
  .cornerBottomRight {
    border-width: 15px;
  }

  .arrowTop {
    border-width: 15px;
    left: calc(50% - 15px)
  }
  .arrowBottom {
    border-width: 15px;
    left: calc(50% - 15px)
  }
  .arrowLeft {
    border-width: 15px;
    top: calc(50% - 15px)
  }
  .arrowRight {
    border-width: 15px;
    top: calc(50% - 15px)
  }
}

#audioSync {
  background: #272727;
  height: 100%;
  width: 100%;
  color: white;
  font-size: 16px;
}

</style>
