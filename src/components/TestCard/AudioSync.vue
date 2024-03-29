<template>
  <div id="audioSync" :style="cssVars">

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

    <video id="vt24" v-if="config.audioSync.rate == 24" src="~@/assets/audiosync/24.webm" loop autoplay class="vt" />
    <video id="vt25" v-if="config.audioSync.rate == 25" src="~@/assets/audiosync/25.webm" loop autoplay class="vt" />
    <video id="vt29-97" v-if="config.audioSync.rate == 29.97" src="~@/assets/audiosync/29.97.webm" loop autoplay class="vt" />
    <video id="vt30" v-if="config.audioSync.rate == 30" src="~@/assets/audiosync/30.webm" loop autoplay class="vt" />
    <video id="vt50" v-if="config.audioSync.rate == 50" src="~@/assets/audiosync/50.webm" loop autoplay class="vt" />
    <video id="vt59-94" v-if="config.audioSync.rate == 59.94" src="~@/assets/audiosync/59.94.webm" loop autoplay class="vt" />
    <video id="vt60" v-if="config.audioSync.rate == 60" src="~@/assets/audiosync/60.webm" loop autoplay class="vt" />
    <video id="vt100" v-if="config.audioSync.rate == 100" src="~@/assets/audiosync/100.webm" loop autoplay class="vt" />
    <video id="vt120" v-if="config.audioSync.rate == 120" src="~@/assets/audiosync/120.webm" loop autoplay class="vt" />

    <div id="middleClock">
      <span  v-if="config.showClock" style="text-align: center">{{ info.time }}</span>
    </div>

    <div id="topText" class="textRow" v-if="config.showInfo">
      <span v-resize-text="{ratio:1.5, maxFontSize: '50px'}" style="text-align: left">{{ config.audioSync.rate }} FPS</span>
      <span v-resize-text="{ratio:2, maxFontSize: '50px'}" style="text-align: right">{{ config.name }}</span>
    </div>

    <div id="topText" class="textRow" v-if="!config.showInfo">
      <span v-resize-text="{ratio:1.5, maxFontSize: '50px'}" v-if="!config.showInfo">{{ config.audioSync.rate }} FPS</span>
    </div>

    <div id="bottomText" class="textRow" v-if="config.showInfo">
      <span v-resize-text="{ratio:2, maxFontSize: '32px'}" style="text-align: left">{{ info.cardSize }} - {{info.displayFrequency}}Hz</span>
      <span v-resize-text="{ratio:3, maxFontSize: '32px'}" style="text-align: center"><i class="fas fa-volume-up" /> {{ description }}</span>
      <span v-resize-text="{ratio:2, maxFontSize: '32px'}" style="text-align: right">{{ info.network[info.networkIndex] }}</span>
    </div>

  </div>
</template>

<script>
import VueResizeText from 'vue3-resize-text'
export default {
  name: "AudioSyncTestCard",
  directives: { 
    ResizeText: VueResizeText.ResizeText
   },
  props: {
    config: Object,
    info: Object,
    borderSize: Number
  },
  data: function() {
    return {
      description: "Default Interface",
      rates: ['24', '25', '29-97', '30', '50', '59-94', '60' ]
    }
  },
  computed: {
    cssVars() {
      return {
        '--border-size': this.borderSize + 'px'
      }
    }
  },
  watch: {
      config: {
        handler: function (val) { 
          this.updateDeviceName(val)
         },
        deep: true
      },
    },
    methods: {
      updateDeviceName: function(val) {
        for (const rate in this.rates) {
          let element = document.getElementById('vt' + this.rates[rate])
          if (element !== null) {
            element.setSinkId(val.audioSync.deviceId)
          }
        }
        
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
    mounted: function() {
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

#middleClock {
  position: absolute;
  font-size: 100px;
  display: flex;
  text-align: center;
  height: 80px;
  top: 50%;
  left: 0;
  width: 100%;
  color: #6ab42f;
}
#middleClock span {
  position: relative;
  font-size: min(calc(4vh), calc(4vw));
  width: 20%;
  left: 40%;
}

#topText {
  top: 30px;
  height: 50px;
}
.textRow span {
  width: 100%;
  vertical-align: bottom;
}

#bottomText {
  bottom: var(--border-size);
}

.vt {
  position: absolute;
  width: calc(100% - 100px);
  height: calc(100% - 120px);
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
  background-size: calc(var(--border-size)*4) calc(var(--border-size)*4);
  background-position: 50%;
}
.borderTop {
  background: black;
  background-image: linear-gradient(270deg, transparent 50%, currentColor 50%);
  height: var(--border-size);
  width: 100%;
  top: 0px;
}
.borderBottom {
  background: black;
  background-image: linear-gradient(90deg, transparent 50%, currentColor 50%);
  height: var(--border-size);
  bottom: 0px;
  width: 100%;
}
.borderLeft {
  left: 0;
  width: var(--border-size);
  height: 100%;
  background: black;
  background-image: linear-gradient(0deg, transparent 50%, currentColor 50%);
}
.borderRight {
  right: 0;
  width: var(--border-size);
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
  width: calc(var(--border-size) * 2);
  height: calc(var(--border-size) * 2);
  position: absolute;
}
.cornerTopLeft {
  top: 0;
  left: 0;
  border-top: var(--border-size) solid #6ab42e;
  border-left: var(--border-size) solid #6ab42e;
}
.cornerTopRight {
  top: 0;
  right: 0;
  border-top: var(--border-size) solid #6ab42e;
  border-right: var(--border-size) solid #6ab42e;
}
.cornerBottomLeft {
  bottom: 0;
  left: 0;
  border-bottom: var(--border-size) solid #6ab42e;
  border-left: var(--border-size) solid #6ab42e;
}
.cornerBottomRight {
  bottom: 0;
  right: 0;
  border-bottom: var(--border-size) solid #6ab42e;
  border-right: var(--border-size) solid #6ab42e;
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
  left: calc(50% - var(--border-size));
  border-right: var(--border-size) solid transparent;
  border-bottom: var(--border-size) solid #6ab42e;
  border-left: var(--border-size) solid transparent;
}
.arrowBottom {
  left: calc(50% - var(--border-size));
  bottom: 0;
  border-right: var(--border-size) solid transparent;
  border-top: var(--border-size) solid #6ab42e;
  border-left: var(--border-size) solid transparent;
}
.arrowLeft {
  top: calc(50% - var(--border-size));
  border-top: var(--border-size) solid transparent;
  border-right: var(--border-size) solid #6ab42e;
  border-bottom: var(--border-size) solid transparent;
}
.arrowRight {
  top: calc(50% - var(--border-size));
  right: 0;
  border-top: var(--border-size) solid transparent;
  border-left: var(--border-size) solid #6ab42e;
  border-bottom: var(--border-size) solid transparent;
}

#audioSync {
  background: #272727;
  height: 100%;
  width: 100%;
  color: white;
  font-size: 16px;
}

</style>
