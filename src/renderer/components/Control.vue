<template>
  <div id="wrapper" style="position: relative;">

   
<el-form ref="form" :model="config" label-width="120px" size="small">

<control-screen :config="config"></control-screen>

     
<el-divider content-position="center">Select Card Type</el-divider>

<el-row style="margin-left: 16px; margin-right: 16px;">
  <el-tabs type="border-card"  v-model="config.cardType" :stretch="true">
    
    <el-tab-pane label="Alteka" name="alteka">
      <control-alteka :alteka="config.alteka"></control-alteka>
    </el-tab-pane>

    <el-tab-pane label="Bars" name="bars">
      <control-bars :bars="config.bars"></control-bars>
    </el-tab-pane>

    <el-tab-pane label="Grid" name="grid">
      <control-grid :grid="config.grid"></control-grid>
    </el-tab-pane>

    <el-tab-pane label="Ramp" name="ramp">
      <control-ramp :ramp="config.ramp"></control-ramp>
    </el-tab-pane>
   
    <el-tab-pane label="Name" name="placeholder">
      <control-placeholder :placeholder="config.placeholder"></control-placeholder>
    </el-tab-pane>

    <el-tab-pane label="AV Sync" name="audiosync">
      <control-audio-sync :audioSync="config.audioSync"></control-audio-sync>
    </el-tab-pane>

  </el-tabs>
</el-row>


<el-divider content-position="center">Output Options</el-divider>

<el-row>
  <el-col :span="8">
    <el-form-item label="Name" label-width="70px">
      <el-input v-model="config.name"></el-input>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Show Info">
      <el-switch v-model="config.showInfo"></el-switch>
    </el-form-item>
  </el-col>
<el-col :span="8">
    <el-form-item label="Motion">
      <el-switch v-model="config.animated"></el-switch>
    </el-form-item>
  </el-col>
</el-row>

<el-row v-if="config.screen!=0">
  <el-col :span="8">
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

<el-row v-if="config.screen==0">
  <el-col :span="6">
  <el-form-item label="Window Size"> 
  </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Width" label-width="80px">
      <el-input-number v-model="config.winWidth" controls-position="right" :step="5" :min="48"></el-input-number>
    
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Height" label-width="80px">
      <el-input-number v-model="config.winHeight" controls-position="right" :step="5" :min="39"></el-input-number>
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

  export default {
    name: 'control',
    components: { ControlBars, ControlGrid, ControlRamp, ControlPlaceholder, ControlAlteka, ControlAudioSync, ControlScreen, ControlMenu },
    data: function () {
    return {
      config: require('../../main/defaultConfig.json'),
      sync: false
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
      ipcRenderer.send('getConfigControl')
    },

    mounted: function(){
      this.$nextTick(function () {
        let h = document.getElementById('wrapper').clientHeight
        let w = document.getElementById('wrapper').clientWidth
        ipcRenderer.send('controlResize', w, h)
      })
    },


    watch: {
      config: {
        handler: function (val, oldVal) { 
          if (this.sync) {
            ipcRenderer.send('config', val)
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
   -webkit-user-select: none;
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
</style>
