<template>
  <div id="wrapper" style="position: relative;" :class="{ darkMode : require('electron').remote.nativeTheme.shouldUseDarkColors }">

   
<el-form ref="form" :model="config" label-width="120px" size="small">

<control-screen :config="config"></control-screen>

     
<el-divider content-position="center">Select Card Type</el-divider>

<el-row style="margin-left: 16px; margin-right: 16px;">
  <el-tabs type="border-card"  v-model="config.cardType" :stretch="true" style="height: 165px;">
    
    <el-tab-pane label="Alteka" name="alteka">
      <control-alteka :alteka="config.alteka" :colors="predefineColors"></control-alteka>
    </el-tab-pane>

    <el-tab-pane label="Bars" name="bars">
      <control-bars :bars="config.bars"></control-bars>
    </el-tab-pane>

    <el-tab-pane label="Grid" name="grid">
      <control-grid :grid="config.grid" :colors="predefineColors"></control-grid>
    </el-tab-pane>

    <el-tab-pane label="Ramp" name="ramp">
      <control-ramp :ramp="config.ramp"></control-ramp>
    </el-tab-pane>
   
    <el-tab-pane label="Name" name="placeholder">
      <control-placeholder :placeholder="config.placeholder" :colors="predefineColors"></control-placeholder>
    </el-tab-pane>

    <el-tab-pane label="AV Sync" name="audioSync">
      <control-audio-sync :audioSync="config.audioSync"></control-audio-sync>
    </el-tab-pane>

  </el-tabs>
</el-row>


<el-divider content-position="center">Output Options</el-divider>

<el-row>
  <el-col :span="8">
    <el-form-item label="Name" label-width="70px">
      <el-input v-model="config.name" placeholder=""></el-input>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Show Info">
      <el-switch v-model="config.showInfo"></el-switch>
    </el-form-item>
  </el-col>
<el-col :span="8">
    <el-form-item label="Motion">
      <el-switch v-model="config.animated" :disabled="config.cardType=='audioSync'"></el-switch>
    </el-form-item>
  </el-col>
</el-row>

<el-row v-if="config.screen!=0">
  <el-col :span="8">
    <el-form-item label="Windowed">
      <el-switch v-model="config.windowed"></el-switch>
    </el-form-item>
  </el-col>
  <el-col :span="8" v-if="config.windowed">
    <el-form-item label="Width" label-width="50px">
      <el-input-number v-model="config.winWidth" controls-position="right" :step="5" :min="48"></el-input-number>
    </el-form-item>
  </el-col>
  <el-col :span="8" v-if="config.windowed">
    <el-form-item label="Height" label-width="50px">
      <el-input-number v-model="config.winHeight" controls-position="right" :step="5" :min="39"></el-input-number>
    </el-form-item>
  </el-col>
  <el-col :span="8" v-if="!config.windowed">
    <el-form-item label="Fill Output">
      <el-switch v-model="config.fullsize"></el-switch>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item v-if="!config.fullsize" label="Show Bounds">
      <el-switch v-model="config.bounds"></el-switch>
    </el-form-item>
  </el-col>
</el-row>

  <el-row v-if="!config.fullsize && config.screen!=0">
    <el-col :span="6">
      <el-form-item label="Card Size"> 
      </el-form-item>
    </el-col>
     <el-col :span="8">
       <el-form-item label="Width" label-width="80px">
        <el-input-number v-model="config.width" controls-position="right" :step="5" :min="1"></el-input-number>
       </el-form-item>
     </el-col>
      <el-col :span="8">
        <el-form-item label="Height" label-width="80px">
          <el-input-number v-model="config.height" controls-position="right" :step="5" :min="1"></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
   
   <el-row v-if="!config.fullsize && config.screen!=0"> 
    <el-col :span="6">
      <el-form-item label="Card Position"> 
      </el-form-item>
    </el-col>
     <el-col :span="8">
        <el-form-item label="Left" label-width="80px">
          <el-input-number v-model="config.left" controls-position="right" :step="5"></el-input-number>
        </el-form-item>
     </el-col>
      <el-col :span="8">
       <el-form-item label="Top" label-width="80px">
        <el-input-number v-model="config.top" controls-position="right" :step="5"></el-input-number>
       </el-form-item>
      </el-col>
    </el-row>

   


 <control-menu :config="config"></control-menu>



</el-form>
<resize-observer @notify="handleResize" />
  </div>
</template>

<script>
const { ipcRenderer, screen } = require('electron')
import ControlBars from './Control/ControlBars.vue'
import ControlGrid from './Control/ControlGrid.vue'
import ControlRamp from './Control/ControlRamp.vue'
import ControlPlaceholder from './Control/ControlPlaceholder.vue'
import ControlAlteka from './Control/ControlAlteka.vue'
import ControlAudioSync from './Control/ControlAudioSync.vue'
import ControlMenu from './Control/ControlMenu.vue'

import ControlScreen from './Control/ControlScreen.vue'

var Mousetrap = require('mousetrap')
Mousetrap.bind('esc', function() { ipcRenderer.send('closeTestCard') }, 'keyup')

  export default {
    name: 'control',
    components: { ControlBars, ControlGrid, ControlRamp, ControlPlaceholder, ControlAlteka, ControlAudioSync, ControlScreen, ControlMenu },
    data: function () {
    return {
      config: require('../../main/defaultConfig.json'),
      sync: false,
      predefineColors: ['#ffffff', '#7f7f7f', '#000000', '#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff']
    }
  },
    created: function() {
      let vm = this
      ipcRenderer.on('closeTestCard', function(event, val) {
        vm.config.visible = false
      })
      ipcRenderer.on('config', function(event, val) {
        vm.config = val
        vm.sync = true
      })
      ipcRenderer.on('testCardResize', function(event, w, h) {
        vm.config.winWidth = w
        vm.config.winHeight = h
      })
      ipcRenderer.on('testCardMoveToScreen', function(event, id) {
        vm.config.screen = id
      })
      ipcRenderer.send('getConfigControl')
    },

    mounted: function(){
      let vm = this
      this.$nextTick(function () {
        let h = document.getElementById('wrapper').clientHeight
        let w = document.getElementById('wrapper').clientWidth
        ipcRenderer.send('controlResize', w, h)
      })
      Mousetrap.bind(['command+f', 'ctrl+f'], function() {
        vm.config.visible = !vm.config.visible
        return false;
      })
    },


    watch: {
      config: {
        handler: function (val, oldVal) { 
          if (this.sync) {
            ipcRenderer.send('config', val)
          }
          if (val.windowed) {
            this.config.fullsize = true
          }
         },
        deep: true
      },
    },
    methods: {
      handleResize: function({ width, height }) {
        ipcRenderer.send('controlResize', width, height)
      }
    }
  }
</script>

<style>
 body {
  font-family: Sansation, Helvetica, sans-serif;
  overflow: hidden !important;
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
.darkMode .el-radio-button__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
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
</style>
