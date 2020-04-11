<template>
  <div id="wrapper">

    <el-row style="text-align: center; vertical-align: middle;">
      <el-col :span="12" style="margin-top: 20px;">
        <el-switch v-model="config.visible" active-text="Enabled" inactive-text="Disabled">Enable</el-switch>
      </el-col>
      <el-col :span="12">
        <h3>Alteka Test Card</h3>
      </el-col>
    </el-row>


<el-divider content-position="center">Select Output</el-divider>

    <el-radio-group v-model="config.screen" :disabled="config.visible">
      <el-radio-button label="0"><i class="el-icon-crop"></i> Window</el-radio-button>
      <el-radio-button v-for="scr in screens" :label="scr.id"><i class="el-icon-monitor"></i> {{ scr.size.width }} x {{ scr.size.height }}</el-radio-button>
    </el-radio-group>


     
<el-divider content-position="center">Select Card Type</el-divider>


    <el-radio-group v-model="config.cardType">
      <el-radio-button label="alteka">Alteka</el-radio-button>
      <el-radio-button label="smpte">SMPTE</el-radio-button>
      <el-radio-button label="arib">ARIB</el-radio-button>
      <el-radio-button label="grid">Grid</el-radio-button>
      <el-radio-button label="bars">75% Bars</el-radio-button>
      <el-radio-button label="placeholder">Placeholder</el-radio-button>
    </el-radio-group>


<el-divider content-position="center">Options</el-divider>


<el-form ref="form" :model="config" label-width="120px">

  <el-form-item label="Colour Choices">
    <el-color-picker v-model="config.colourPri"></el-color-picker>
    <el-color-picker v-model="config.colourSec"></el-color-picker>
  </el-form-item>

  <el-form-item label="Name">
    <el-input v-model="config.displayName"></el-input>
  </el-form-item>

<el-form-item label="Fill Output">
 <el-switch v-model="config.fullsize"></el-switch>
</el-form-item>

  <el-form-item v-if="!config.fullsize" label="Canvas Size">
    <el-col :span="3" align="right">Width</el-col>
     <el-col :span="8">
      <el-input v-model="config.width"></el-input>
     </el-col>
     <el-col :span="3" align="right">Height</el-col>
      <el-col :span="8">
    <el-input v-model="config.height"></el-input>
      </el-col>
  </el-form-item>

    <el-form-item v-if="!config.fullsize" label="Canvas Offset">
    <el-col :span="3" align="right">Top</el-col>
     <el-col :span="8">
      <el-input v-model="config.top"></el-input>
     </el-col>
     <el-col :span="3" align="right">Left</el-col>
      <el-col :span="8">
    <el-input v-model="config.left"></el-input>
      </el-col>
  </el-form-item>

<el-form-item label="Options">
    <el-checkbox-group v-model="config.options">
      <el-checkbox label="CPU" name="type"></el-checkbox>
      <el-checkbox label="RAM" name="type"></el-checkbox>
      <el-checkbox label="Framerate" name="type"></el-checkbox>
      <el-checkbox label="Animated" name="type"></el-checkbox>
      <el-checkbox label="Bounds" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>




</el-form>

 

  </div>
</template>

<script>
const { ipcRenderer, screen } = require('electron')
  

  export default {
    name: 'control',
    // components: { SystemInformation },
    data: function () {
    return {
      config: {
        visible: false,
        cardType: 'alteka',
        fullsize: true,
        width: 1920,
        height: 1080,
        screen: 0,
        colourSec: '#aaa',
        colourPri: '#d33',
        options: [],
        displayName: require('os').hostname().split('.')[0],
        
      },
      screens: screen.getAllDisplays()
    }
  },
    mounted: function() {
      let vm = this
      ipcRenderer.on('closeTestCard', function(event, val) {
        vm.config.visible = false
      })
    },
    watch: {
      config: {
        handler: function (val, oldVal) { 
          ipcRenderer.send('config', val)
         },
        deep: true
      },
    }
  }
</script>

<style>
 #app {
  font-family: Helvetica, sans-serif;
  /* text-align: center; */
}
</style>
