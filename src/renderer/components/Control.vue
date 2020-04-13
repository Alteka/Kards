<template>
  <div id="wrapper">

    <el-row style="text-align: center;">
      <el-col :span="11" style="margin-top: 20px;">
        <el-switch v-model="config.visible" active-text="Enabled" inactive-text="Disabled">Enable</el-switch>
      </el-col>
      <el-col :span="2">
        <img src="~@/assets/bug.png" width="100%" />
      </el-col>
      <el-col :span="11" style="color: #7BB144;">
        <h2 class="logo">ALTEKA Test Card</h2>
      </el-col>
    </el-row>


<el-divider content-position="center">Select Output</el-divider>

<el-row style="text-align: center">
    <el-radio-group v-model="config.screen" :disabled="config.visible">
      <el-radio-button label="0"><i class="el-icon-crop"></i> Window</el-radio-button>
      <el-radio-button v-for="scr in screens" :label="scr.id"><i class="el-icon-monitor"></i> {{ scr.size.width }} x {{ scr.size.height }}</el-radio-button>
    </el-radio-group>
</el-row>

     
<el-divider content-position="center">Select Card Type</el-divider>

<el-row style="text-align: center">
    <el-radio-group v-model="config.cardType">
      <el-radio-button label="alteka">Alteka</el-radio-button>
      <el-radio-button label="smpte">SMPTE</el-radio-button>
      <el-radio-button label="arib">ARIB</el-radio-button>
      <el-radio-button label="grid">Grid</el-radio-button>
      <el-radio-button label="bars">75% Bars</el-radio-button>
      <el-radio-button label="placeholder">Placeholder</el-radio-button>
    </el-radio-group>
</el-row>


<el-divider content-position="center">Options</el-divider>


<el-form ref="form" :model="config" label-width="120px">

<el-row>
  <el-col :span="8">
    <el-form-item label="Primary Colour">
      <el-color-picker v-model="config.colourPri"></el-color-picker>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Second Colour">
      <el-color-picker v-model="config.colourSec"></el-color-picker>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Gradient">
      <el-switch v-model="config.gradient"></el-switch>
    </el-form-item>
  </el-col>
</el-row>
  


<el-row>
  <el-col :span="24">
    <el-form-item label="Name">
      <el-input v-model="config.displayName"></el-input>
    </el-form-item>
  </el-col>
</el-row>



<el-row>
  <el-col :span="8">
    <el-form-item label="Fill Output">
      <el-switch v-model="config.fullsize"></el-switch>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item label="Animation">
      <el-switch v-model="config.animated"></el-switch>
    </el-form-item>
  </el-col>
  <el-col :span="8">
    <el-form-item v-if="!config.fullsize" label="Show Bounds">
      <el-switch v-model="config.bounds"></el-switch>
    </el-form-item>
  </el-col>
</el-row>



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


<el-row>
  <el-col :span="8">
    <el-button type="primary" icon="el-icon-picture" v-on:click="selectImage()">Select Image</el-button>
  </el-col>
  <el-col :span="8">
    <el-image style="width: 150px; height: 50px" :src="config.logoUrl" fit="contain">
      <div slot="error" class="image-slot">
        Using Alteka Logo
      </div>
    </el-image>
  </el-col>
  <el-col :span="8" v-if="config.logoUrl != false">
    <el-button type="primary" icon="el-icon-delete" v-on:click="clearImage()">Clear</el-button>
  </el-col>
</el-row>




<el-form-item label="Options">
    <el-checkbox-group v-model="config.options">
      <el-checkbox label="CPU" name="type"></el-checkbox>
      <el-checkbox label="RAM" name="type"></el-checkbox>
      <el-checkbox label="Framerate" name="type"></el-checkbox>
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
        gradient: true,
        bounds: false,
        animated: true,
        logoUrl: "",
        colourSec: '#aaa',
        colourPri: '#d33',
        options: [],
        displayName: require('os').hostname().split('.')[0],
        
      },
      screens: screen.getAllDisplays()
    }
  },
  methods: {
    selectImage: function() {
      ipcRenderer.send('selectImage')
    },
    clearImage: function() {
      // ipcRenderer.send('clearImage')
      this.config.logoUrl = ""
    }
  },
    mounted: function() {
      let vm = this
      ipcRenderer.on('closeTestCard', function(event, val) {
        vm.config.visible = false
      })
      ipcRenderer.on('logoUrl', function(event, val) {
        vm.config.logoUrl = val
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
  font-family: Sansation, Helvetica, sans-serif;
  /* text-align: center; */
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
