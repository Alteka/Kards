<template>

    <div id="cardPreview" :style="computedStyle">

      <div class="testcardPreview" :class="{animated: config.animated && config.cardType !='alteka' && config.cardType != 'audioSync' && config.cardType !='led' && config.cardType !='deghost'}">
          <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
          <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
          <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
          <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
          <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
          <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
          <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
          <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
          <AudioSyncTestCard v-if="config.cardType=='audioSync'" :config="config" :info="info" :borderSize="borderSize"></AudioSyncTestCard>
          <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
          <AltekaTestCard v-if="config.cardType == 'alteka'" :config="config" :info="info" :borderSize="borderSize"></AltekaTestCard>
          <LedWallTestCard v-if="config.cardType == 'led'" :config="config" :info="info"></LedWallTestCard>
          <DeghostTestCard v-if="config.cardType == 'deghost'" :config="config" :info="info"></DeghostTestCard>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync' && config.cardType !='led'"  class="testcardPreview" :class="{animatedAbove: config.animated}">
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
        <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
        <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
        <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
        <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
        <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync' && config.cardType !='led'" class="testcardPreview" :class="{animatedLeft: config.animated}">
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
        <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
        <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
        <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
        <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
        <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
      </div>

      <div v-if="config.animated && config.cardType !='alteka' && config.cardType !='audioSync' && config.cardType !='led'" class="testcardPreview" :class="{animatedAboveLeft: config.animated}">
        <GridTestCard v-if="config.cardType == 'grid'" :config="config" :info="info"></GridTestCard>
        <BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" :config="config" :info="info"></BarsSmpteTestCard>
        <BarsAribTestCard v-if="config.cardType == 'bars' && config.bars.type=='arib'" :config="config" :info="info"></BarsAribTestCard>
        <BarsSimpleTestCard v-if="config.cardType == 'bars' && config.bars.type=='simple'" :config="config" :info="info"></BarsSimpleTestCard>
        <BarsHDRTestCard v-if="config.cardType == 'bars' && config.bars.type=='hdr'" :config="config" :info="info"></BarsHDRTestCard>
        <BarsSDITestCard v-if="config.cardType == 'bars' && config.bars.type=='sdi'" :config="config" :info="info"></BarsSDITestCard>
        <BarsSingle v-if="config.cardType == 'bars' && config.bars.type=='single'" :config="config" :info="info"></BarsSingle>
        <RampTestCard v-if="config.cardType == 'ramp'" :config="config" :info="info"></RampTestCard>
        <PlaceholderTestCard v-if="config.cardType == 'placeholder'" :config="config" :info="info"></PlaceholderTestCard>
      </div>

    </div>

</template>

<script>
import GridTestCard from '../components/TestCard/Grid.vue'
import RampTestCard from '../components/TestCard/Ramp.vue'
import AltekaTestCard from '../components/TestCard/Alteka.vue'
import BarsSmpteTestCard from '../components/TestCard/SMPTE.vue'
import BarsAribTestCard from '../components/TestCard/ARIB.vue'
import BarsSimpleTestCard from '../components/TestCard/Bars.vue'
import LedWallTestCard from '../components/TestCard/LedWall.vue'
import AudioSyncTestCard from '../components/TestCard/AudioSync.vue'
import PlaceholderTestCard from '../components/TestCard/Placeholder.vue'
import DeghostTestCard from '../components/TestCard/Deghost.vue'
import BarsHDRTestCard from '../components/TestCard/HDR.vue'
import BarsSDITestCard from '../components/TestCard/SDI.vue'
import BarsSingle from '../components/TestCard/Single.vue'


  export default {
    name: 'TestCard',
    components: { GridTestCard, AltekaTestCard, BarsSmpteTestCard, BarsAribTestCard, BarsSimpleTestCard, PlaceholderTestCard, RampTestCard, AudioSyncTestCard, LedWallTestCard, DeghostTestCard, BarsHDRTestCard, BarsSDITestCard, BarsSingle },
    props: {
      modelValue: Object, // v-model object
    },
    
    data: function() { 
      return {
        boundsInfo: Math.round(visualViewport.width) + ' x ' + Math.round(visualViewport.height),
        borderSize: 25,
        info: {
          cardSize: '',
          circleSize: 500,
          displayFrequency: 0,
          time: '00:00',
          network: ['127.0.0.1'],
          networkIndex: 0
        }
      }
    },
    computed: {
      config: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
      computedStyle: function() {
        let r = {}
        if (!this.config.fullsize && this.config.screen != 0) {
          r.height = this.config.notFilledCard.height + 'px' 
          r.width = this.config.notFilledCard.width + 'px'
          r.top = this.config.notFilledCard.top + 'px'
          r.left = this.config.notFilledCard.left + 'px'
        } 
        if (this.config.raster && !this.config.windowed) {
          r.border = '1px solid white'
        } else {
          r.border = 'none'
        }
        return r;
      }
    },
    methods: {
      updateTime: function() {
        var cd = new Date()
        this.info.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
      },
      zeroPadding: function(num, digit) {
          var zero = '';
          for(var i = 0; i < digit; i++) {
              zero += '0';
          }
          return (zero + num).slice(-digit);
      },
      updateCardSize: function() {
        let w = 1280
        let h = 720
        if (this.config.windowed) {
          w = this.config.window.width
          h = this.config.window.height
        } else if (!this.config.fullsize) {
          w = this.config.notFilledCard.width
          h = this.config.notFilledCard.height
        } else {
          // need to be fr the selected screen...
        }
        this.info.cardSize = w + ' x ' + h
        this.updateBorderSize(w, h)
        this.updateInfoCircleSize(w, h)
      },
      updateBorderSize: function(w, h) {
        this.borderSize = 25
          if (w < 720 || h < 720) {
            this.borderSize = 20
          }
          if (w < 600 || h < 600) {
            this.borderSize = 15
          }
          if (w < 400 || h < 400) {
            this.borderSize = 10
          }
          if (w < 250 || h < 250) {
            this.borderSize = 6
          }
      },
      updateInfoCircleSize: function(w,h) {
        this.info.circleSize = 500
        if (w < 1600 || h < 1600) {
          this.info.circleSize = 400
        }
        if (w < 1300 || h < 1300) {
          this.info.circleSize = 300
        }
        if (w < 900 || h < 900) {
          this.info.circleSize = 200
        }
        if (w < 500 || h < 500) {
          this.info.circleSize = 150
        }
        if (w < 300 || h < 300) {
          this.info.circleSize = 100
        }
      },
    },
    mounted: function() {
      console.log('Test card mounted')
      let vm = this
        
      window.ipcRenderer.receive('displayFrequency', function(args) {
        vm.info.displayFrequency = args
      })  
      window.ipcRenderer.send('getScreens')  

      vm.updateCardSize()
      setTimeout(vm.updateCardSize, 1000)
      vm.updateTime()
      setInterval(vm.updateTime, 1000)

      // vm.updateNetworkInfo()
      // setInterval(vm.updateNetworkInfo, 10000)
      // window.ipcRenderer.receive('networkInfo', function(networkInfo) {
      //   vm.info.network = networkInfo
      // })
      setInterval(function() {
      vm.info.networkIndex++
      if (vm.info.networkIndex >= vm.info.network.length) {
        vm.info.networkIndex = 0
      }
    }, 5000)
           
    }
  }
  </script>

<style>
@font-face {
  font-family: Sansation;
  src: url("~@/assets/Sansation-Regular.ttf");
}
#cardPreview {
  
  height: 300px;
  margin: auto;
  color: white;
  overflow: hidden;
  border: 2px solid white;
  box-sizing: border-box;
}


.testcardPreview {
  height: 100%;
  width: 100%;
  /* position: absolute;
  top: 0;
  left: 0;
  overflow: hidden; */
}
.animated {
  animation: diagonal 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonal {
    0%       { transform: translatex(0%) translatey(0%) }
    100%     { transform: translatex(100%) translatey(100%) }
}

.animatedAbove {
  animation: diagonalAbove 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAbove {
    0%       { transform: translatex(0%) translatey(-100%) }
    100%     { transform: translatex(100%) translatey(0%) }
}

.animatedLeft {
  animation: diagonalLeft 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalLeft {
    0%       { transform: translatex(-100%) translatey(0%) }
    100%     { transform: translatex(0%) translatey(100%) }
}

.animatedAboveLeft {
  animation: diagonalAboveLeft 30s infinite;
  animation-timing-function: linear;
}
@keyframes diagonalAboveLeft {
    0%       { transform: translatex(-100%) translatey(-100%) }
    100%     { transform: translatex(0%) translatey(0%) }
}

.showBounds {
  outline: 2px solid red;
  outline-offset: -2px;
  background-size: 50% 50%;
  background-image:
    linear-gradient(to right, red 1px, transparent 1px),
    linear-gradient(to bottom, red 1px, transparent 1px);
}
.modal {
  font-family: Sansation;
  font-size: 200%;
}

 .black {
    background-color: rgb(16,16,16);
  }
  .superblack {
    background-color: rgba(0,0,0,1)
  }
  .grey40 {
    background-color: rgb(104,104,104);
  }
  .superwhite {
    background-color: rgb(255,255,255);
  }
  .white {
    background-color: rgb(235,235,235);
  }
  .white75 {
    background-color: rgb(180,180,180);
  }
 

 .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>
