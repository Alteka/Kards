<template>
  <div id="wrapper">

    <el-row>
      <el-col :span="8" style="margin-top: 20px; padding-left: 20px;">
        <el-switch active-color="#7BB144" v-model="config.visible" active-text="Enabled">Enable</el-switch>
      </el-col>
      <el-col :span="2">
        <img src="~@/assets/bug.png" width="100%" />
      </el-col>
      <el-col :span="10" style="color: #7BB144; padding-left: 10px;">
        <h2 class="logo">ALTEKA Test Card</h2>
      </el-col>
      <el-col :span="4">
        <el-button type="success" plain size="mini" v-on:click="resetDefault" round><i class="fas fa-undo"></i> Reset</el-button>
      </el-col>
    </el-row>

<el-form ref="form" :model="config" label-width="120px">

<el-divider content-position="center">Select Output</el-divider>
<control-screen :config="config"></control-screen>

     
<el-divider content-position="center">Select Card Type</el-divider>

<el-row style="margin-left: 20px; margin-right: 20px;">
  <el-tabs type="border-card"  v-model="config.cardType" :stretch="true">
    
    <el-tab-pane label="Alteka" name="alteka">
      <control-alteka :alteka="config.alteka"></control-alteka>
    </el-tab-pane>

    <el-tab-pane label="SMPTE" name="smpte">
      <control-smpte :smpte="config.smpte"></control-smpte>
    </el-tab-pane>

    <el-tab-pane label="ARIB" name="arib">
      <control-arib :arib="config.arib"></control-arib>
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
   
    <el-tab-pane label="Placeholder" name="placeholder">
      <control-placeholder :placeholder="config.placeholder"></control-placeholder>
    </el-tab-pane>

  </el-tabs>
</el-row>


<el-divider content-position="center">Output Options</el-divider>

<el-row>
  <el-col :span="8">
    <el-form-item label="Fill Output">
      <el-switch active-color="#7BB144" v-model="config.fullsize"></el-switch>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Animation">
      <el-switch active-color="#7BB144" v-model="config.animated"></el-switch>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item v-if="!config.fullsize" label="Show Bounds">
      <el-switch active-color="#7BB144" v-model="config.bounds"></el-switch>
    </el-form-item>
  </el-col>
</el-row>

  <el-row v-if="!config.fullsize">
    <el-col :span="6">
      <el-form-item label="Canvas Size"> 
      </el-form-item>
    </el-col>
     <el-col :span="8">
       <el-form-item label="Width">
        <el-input v-model="config.width"></el-input>
       </el-form-item>
     </el-col>
      <el-col :span="8">
        <el-form-item label="Height">
          <el-input v-model="config.height"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
   
   <el-row v-if="!config.fullsize"> 
    <el-col :span="6">
      <el-form-item label="Canvas Position"> 
      </el-form-item>
    </el-col>
     <el-col :span="8">
       <el-form-item label="Top">
        <el-input v-model="config.top"></el-input>
       </el-form-item>
     </el-col>
      <el-col :span="8">
        <el-form-item label="Left">
          <el-input v-model="config.left"></el-input>
        </el-form-item>
      </el-col>
    </el-row>


</el-form>

  </div>
</template>

<script>
const { ipcRenderer, screen } = require('electron')
import ControlBars from './Control/ControlBars.vue'
import ControlGrid from './Control/ControlGrid.vue'
import ControlRamp from './Control/ControlRamp.vue'
import ControlPlaceholder from './Control/ControlPlaceholder.vue'
import ControlAlteka from './Control/ControlAlteka.vue'
import ControlArib from './Control/ControlARIB.vue'
import ControlSmpte from './Control/ControlSMPTE.vue'

import ControlScreen from './Control/ControlScreen.vue'

  export default {
    name: 'control',
    components: { ControlBars, ControlGrid, ControlRamp, ControlPlaceholder, ControlAlteka, ControlArib, ControlSmpte, ControlScreen },
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
      ipcRenderer.send('getConfigControl')
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
      resetDefault: function() {
        ipcRenderer.send('resetDefault')
      }
    }
  }
</script>

<style>
 #app {
  font-family: Sansation, Helvetica, sans-serif;
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
