<template>
    <div id="wrapper" style="position: relative;" :class="{ darkMode : darkMode }">
      
      <el-form ref="form" :model="config" label-width="120px" size="small">

      <control-screen v-model="config"></control-screen>
      <el-divider content-position="center">Select Card Type</el-divider>

      <el-row style="margin-left: 8px; margin-right: 8px;">
        <el-tabs type="border-card"  v-model="config.cardType" :stretch="true" style="height: 165px; width: 100%;">
          
          <el-tab-pane label="Alteka" name="alteka">
            <control-alteka v-model="config.alteka" :colors="config.predefineColors"></control-alteka>
          </el-tab-pane>

          <el-tab-pane label="Bars" name="bars">
            <control-bars v-model="config.bars"></control-bars>
          </el-tab-pane>

          <el-tab-pane label="Grid" name="grid">
            <control-grid v-model="config.grid" :colors="config.predefineColors"></control-grid>
          </el-tab-pane>

          <el-tab-pane label="Ramp" name="ramp">
            <control-ramp v-model="config.ramp"></control-ramp>
          </el-tab-pane>
        
          <el-tab-pane label="Name" name="placeholder">
            <control-placeholder v-model="config.placeholder" :colors="config.predefineColors"></control-placeholder>
          </el-tab-pane>

          <el-tab-pane label="Sync" name="audioSync">
            <control-audio-sync v-model="config.audioSync" :displayFrequency="displayFrequency"></control-audio-sync>
          </el-tab-pane>

          <el-tab-pane label="DeGhost" name="deghost">
            <control-deghost v-model="config.deghost"></control-deghost>
          </el-tab-pane>

          <el-tab-pane label="LED" name="led">
            <control-led v-model="config.led" :colors="config.predefineColors"></control-led>
          </el-tab-pane>

        </el-tabs>
      </el-row>

      <el-divider content-position="center">Output Options</el-divider>

      <el-row>
        <el-col :span="8">
          <el-form-item label="Name" label-width="66px">
            <el-input v-model="config.name" placeholder=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Show Info"><i class="fas fa-info-circle green"></i>
            <el-switch v-model="config.showInfo"></el-switch>
          </el-form-item>
        </el-col>
      <el-col :span="8">
          <el-form-item label="Motion"><i class="fas fa-external-link-square-alt fa-rotate-90 green" style="position: relative; top: 1px; margin-right: 5px;"></i>
            <el-switch v-model="config.animated" :disabled="config.cardType=='audioSync' || config.cardType=='deghost'"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="config.screen!=0">
        <el-col :span="8">
          <el-form-item label="Windowed"><i class="fas fa-window-maximize green"></i>
            <el-switch v-model="config.windowed"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="config.windowed">
          <el-form-item label="Width" label-width="50px">
            <el-input-number v-model="config.window.width" controls-position="right" :step="5" :min="48"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="config.windowed">
          <el-form-item label="Height" label-width="50px">
            <el-input-number v-model="config.window.height" controls-position="right" :step="5" :min="39"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="!config.windowed">
          <el-form-item label="Fill Output"><i class="fas fa-expand-arrows-alt green"></i>
            <el-switch v-model="config.fullsize" :disabled="this.config.cardType == 'led'"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item v-if="!config.fullsize" label="Show Bounds"><i class="fas fa-border-style green"></i>
            <el-switch v-model="config.notFilledCard.bounds"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="!config.fullsize && config.screen!=0">
        <el-col :span="2"></el-col>
        <el-col :span="4">
          <el-form-item label="Card Size">
            <div v-if="config.cardType == 'led'" style="position: relative; min-width: 200px; left: -75px; top: 20px; color: #e6a23c; font-size: 90%;" >Set by LED</div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Width" label-width="80px">
            <el-input-number v-if="config.cardType == 'led'" v-model="this.ledWidth" :disabled="true" controls-position="right"></el-input-number>
            <el-input-number v-else v-model="config.notFilledCard.width" controls-position="right" :step="5" :min="1"></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Height" label-width="80px">
            <el-input-number v-if="config.cardType == 'led'" v-model="this.ledHeight" :disabled="true" controls-position="right"></el-input-number>
            <el-input-number v-else v-model="config.notFilledCard.height" controls-position="right" :step="5" :min="1"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
   
    <el-row v-if="!config.fullsize && config.screen!=0"> 
      <el-col :span="2"></el-col>
      <el-col :span="4">
        <el-form-item label="Card Position"> 
        </el-form-item>
      </el-col>
      <el-col :span="8">
          <el-form-item label="Left" label-width="80px">
            <el-input-number v-model="config.notFilledCard.left" controls-position="right" :step="5"></el-input-number>
          </el-form-item>
      </el-col>
        <el-col :span="8">
        <el-form-item label="Top" label-width="80px">
          <el-input-number v-model="config.notFilledCard.top" controls-position="right" :step="5"></el-input-number>
        </el-form-item>
        </el-col>
      </el-row>

      <control-menu v-model="config"></control-menu>

      </el-form>
    <resize-observer @notify="handleResize" />
  </div>
</template>

<script>
import ControlBars from '../components/Control/ControlBars.vue'
import ControlGrid from '../components/Control/ControlGrid.vue'
import ControlLed from '../components/Control/ControlLed.vue'
import ControlRamp from '../components/Control/ControlRamp.vue'
import ControlPlaceholder from '../components/Control/ControlPlaceholder.vue'
import ControlAlteka from '../components/Control/ControlAlteka.vue'
import ControlAudioSync from '../components/Control/ControlAudioSync.vue'
import ControlMenu from '../components/Control/ControlMenu.vue'
import ControlScreen from '../components/Control/ControlScreen.vue'
import ControlDeghost from '../components/Control/ControlDeghost.vue'

var Mousetrap = require('mousetrap')
Mousetrap.bind('esc', function() { window.ipcRenderer.send('closeTestCard') }, 'keyup')

export default {
  name: 'Control',
  components: {
    ControlBars, ControlGrid, ControlAlteka, ControlRamp, ControlPlaceholder, ControlAudioSync, ControlScreen, ControlMenu, ControlLed, ControlDeghost
  },
  methods: {
    handleResize: function({ width, height }) {
      window.ipcRenderer.send('controlResize', {height: height, width: width})
    }
  },
  data: function () {
    return {
      config: require('../defaultConfig.json'),
      sync: false,
      darkMode: false,
      displayFrequency: 0,
      prevFullsize: true
    }
  },
  created: function() {
    let vm = this
    window.ipcRenderer.receive('closeTestCard', function() {
      vm.config.visible = false
    })
    window.ipcRenderer.receive('config', function(val) {
      vm.config = val
      vm.sync = true
    })
    window.ipcRenderer.receive('darkMode', function(val) {
      vm.darkMode = val
    })
    window.ipcRenderer.receive('screens', function(data) {
      for (const scr of data.all) {
        if (vm.config.screen == scr.id) {
          vm.displayFrequency = scr.displayFrequency
        }
      }

    })
    window.ipcRenderer.send('getScreens')
    window.ipcRenderer.receive('testCardMoveToScreen', function(id) {
      vm.config.screen = id
    })
    window.ipcRenderer.send('getConfigControl')
  },
  mounted: function(){
    let vm = this
    this.$nextTick(function () {
      window.ipcRenderer.send('controlResize', {height: document.getElementById('wrapper').clientHeight})
    })
    Mousetrap.bind(['command+f', 'ctrl+f'], function() {
      vm.config.visible = !vm.config.visible
      return false;
    })
    Mousetrap.bind(['command+i', 'ctrl+i'], function() {
      vm.config.showInfo = !vm.config.showInfo
      return false;
    })
    Mousetrap.bind(['command+m', 'ctrl+m'], function() {
      vm.config.animated = !vm.config.animated
      return false;
    })
    Mousetrap.bind(['1'], function() { vm.config.cardType = 'alteka'; return false; })
    Mousetrap.bind(['2'], function() { vm.config.cardType = 'bars'; return false; })
    Mousetrap.bind(['3'], function() { vm.config.cardType = 'grid'; return false; })
    Mousetrap.bind(['4'], function() { vm.config.cardType = 'led'; return false; })
    Mousetrap.bind(['5'], function() { vm.config.cardType = 'ramp'; return false; })
    Mousetrap.bind(['6'], function() { vm.config.cardType = 'placeholder'; return false; })
    Mousetrap.bind(['7'], function() { vm.config.cardType = 'audioSync'; return false; })
    Mousetrap.bind(['8'], function() { vm.config.cardType = 'deghost'; return false; })
  },
  watch: {
    config: {
      handler: function (val) { 
        if (this.sync) {
          window.ipcRenderer.send('config', JSON.parse(JSON.stringify(this.config)))
        }
        if (val.windowed) {
          this.config.fullsize = true
        }
        if (val.cardType == 'led' && !val.windowed) {
          this.config.fullsize = false
        }
        if (val.cardType == 'led') {
          this.config.notFilledCard.width = val.led.width * val.led.columns
          this.config.notFilledCard.height = val.led.height * val.led.rows
        }
      },
      deep: true
    },
  },
  computed: {
    ledWidth: function() {
      return this.config.led.width * this.config.led.columns
    },
    ledHeight: function() {
      return this.config.led.height * this.config.led.rows
    }
  }
}
</script>

<style>
body {
  font-family: Sansation, Helvetica, sans-serif;
  overflow: hidden !important;
  margin: 0;
}
@font-face {
  font-family: Sansation;
  src: url("~@/assets/Sansation-Regular.ttf");
}
.logo {
  margin-top: 10px;
  margin-bottom: 0px;
  font-family: Sansation;
}
.green {
  color: #6ab42f;
  margin-right: 5px;
}
.darkMode {
  background: #222;
}
.darkMode .el-divider {
  background: #555;
}
.darkMode .el-divider__text {
  background: #222;
  color: #aaa;
}
.darkMode label {
  color: #bbb;
}
.darkMode .el-tabs--border-card {
  background: #333;
  border: 1px solid #111;
}
.darkMode .el-tabs--border-card>.el-tabs__header {
  background: #292929;
  border-bottom: 1px solid #111;
}
.darkMode .el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
  background: #333;
  border-right: 1px solid #111;
  border-left: 1px solid #111;
}
.darkMode .el-color-picker__trigger {
  border: 1px solid #666;
}
 .el-radio-button__inner {
  color: #777;
}
.el-checkbox-button__inner {
  color: #777;
}
.darkMode .el-radio-button__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-radio-button__inner:hover {
  border-color: #6ab42f;
}
.darkMode .el-radio-button:first-child .el-radio-button__inner {
  border-left: 1px solid #666;
}
.darkMode .el-button {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-input__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-input-number__increase {
  background: #292929;
  color: #ddd;
}
.darkMode .el-input-number__decrease {
  background: #292929;
  color: #ddd;
}
.darkMode .el-drawer {
  background: #292929;
  border-top: 3px solid #6ab42f;
  color: #ddd;
}
.darkMode .el-checkbox-button__inner {
  background: none;
}

.el-dialog {
  border: 1.5px solid #6ab42f;
}
.darkMode .el-dialog {
  background: #333;
}
.darkMode .el-dialog__title {
  color: #ddd;
}
.darkMode .el-dialog__body {
  color: #ddd;
}
.darkMode .el-button:hover {
  border-color: #6ab42f;
}
.el-dialog__body {
  padding: 10px;
}
  .darkMode .el-input-group__append {
    background: #3d3d3d;
    border: 1px solid #666;
  }
  .darkMode .el-input-group__append:hover {
    color: #6ab42f;
  }
</style>
