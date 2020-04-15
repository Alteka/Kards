<template>
  <div id="wrapper">

    <el-row>
      <el-col :span="11" style="margin-top: 20px; padding-left: 20px;">
        <el-switch active-color="#7BB144" v-model="config.visible" active-text="Enabled">Enable</el-switch>
      </el-col>
      <el-col :span="2">
        <img src="~@/assets/bug.png" width="100%" />
      </el-col>
      <el-col :span="11" style="color: #7BB144; padding-left: 10px;">
        <h2 class="logo">ALTEKA Test Card</h2>
      </el-col>
    </el-row>


<el-divider content-position="center">Select Output</el-divider>

<el-row style="text-align: center">
    <el-radio-group fill="#7BB144" v-model="config.screen" :disabled="config.visible">
      <el-radio-button v-for="scr in screens" :key="scr.id" :label="scr.id">
        <i v-if="scr.id != primaryScreen" class="el-icon-monitor"></i>
        <i v-if="scr.id == primaryScreen" class="el-icon-star-on"></i>
         {{ scr.size.width }} x {{ scr.size.height }}</el-radio-button>
      <el-radio-button label="0"><i class="el-icon-crop"></i> Window</el-radio-button>
    </el-radio-group>
</el-row>

     
<el-divider content-position="center">Select Card Type</el-divider>

<el-form ref="form" :model="config" label-width="120px">

<el-row style="margin-left: 20px; margin-right: 20px;">
  <el-tabs type="border-card"  v-model="config.cardType" :stretch="true">
    <el-tab-pane label="Alteka" name="alteka">

      <el-row>
        <el-col :span="8">
          <el-button type="success" icon="el-icon-picture" v-on:click="selectImage()">Select Image</el-button>
        </el-col>
        <el-col :span="8">
          <el-image style="width: 150px; height: 50px" :src="config.alteka.logoUrl" fit="contain">
            <div slot="error" class="image-slot">
              <img src="~@/assets/bug.png" height="40px" />
            </div>
          </el-image>
        </el-col>
        <el-col :span="8" v-if="config.alteka.logoUrl != false">
          <el-button type="success" icon="el-icon-delete" v-on:click="clearImage()">Clear</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Text colour">
            <el-color-picker v-model="config.alteka.textColour"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Text">
            <el-input v-model="config.alteka.text"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Gradient">
            <el-switch active-color="#7BB144" v-model="config.alteka.gradient"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-checkbox-group  fill="#7BB144" v-model="config.alteka.options">
          <el-checkbox-button label="CPU" name="type"></el-checkbox-button>
          <el-checkbox-button label="RAM" name="type"></el-checkbox-button>
          <el-checkbox-button label="Framerate" name="type"></el-checkbox-button>
        </el-checkbox-group>
      </el-row>
    </el-tab-pane>

    <el-tab-pane label="SMPTE" name="smpte">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Overlay Details">
            <el-switch active-color="#7BB144" v-model="config.smpte.overlay"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="ARIB" name="arib">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Overlay Details">
            <el-switch active-color="#7BB144" v-model="config.arib.overlay"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-tab-pane>

    <el-tab-pane label="Bars" name="bars">
      <el-row>
        <el-col :span="8">
          <el-form-item label="Overlay Details">
            <el-switch active-color="#7BB144" v-model="config.bars.overlay"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Bar Level">
            <el-radio-group fill="#7BB144" v-model="config.bars.level" size="mini">
              <el-radio-button label="75" />
              <el-radio-button label="100" />
              <el-radio-button label="109" />
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-tab-pane>

    <el-tab-pane label="Ramp" name="ramp">
      <el-row>
        <el-col :span="24">
          <el-form-item label="Overlay Details">
            <el-switch active-color="#7BB144" v-model="config.ramp.overlay"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
    </el-tab-pane>

    <el-tab-pane label="Grid" name="grid">
      <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="config.grid.bg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Crosshair">
            <el-color-picker v-model="config.grid.crosshair"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Lines">
            <el-color-picker v-model="config.grid.lines"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Size (pixels)">
            <el-input-number v-model="config.grid.size" :step="5" size="mini"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
    </el-tab-pane>

    <el-tab-pane label="Ramp" name="ramp">

      <el-row>
        <el-col :span="24">
          <el-form-item label="Direction">
            <el-radio-group fill="#7BB144" v-model="config.ramp.direction" size="mini">
              <el-radio-button label="Horizontal" />
              <el-radio-button label="Vertical" />
              <el-radio-button label="Diagonal" />
              <el-radio-button label="Radial" />
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Stepped">
            <el-switch active-color="#7BB144" v-model="config.ramp.stepped"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Double">
            <el-switch active-color="#7BB144" v-model="config.ramp.double"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Reverse">
            <el-switch active-color="#7BB144" v-model="config.ramp.reverse"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

    </el-tab-pane>
   
    <el-tab-pane label="Placeholder" name="placeholder">
      <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="config.placeholder.bg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Foreground">
            <el-color-picker v-model="config.placeholder.fg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Gradient">
            <el-switch active-color="#7BB144" v-model="config.placeholder.gradient"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="Name">
            <el-input v-model="config.placeholder.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Icon">
            <el-input v-model="config.placeholder.icon"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

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
  

  export default {
    name: 'control',
    // components: { SystemInformation },
    data: function () {
    return {
      config: {
        visible: false,
        cardType: 'alteka',
        fullsize: true,
        placeholder: {
          bg: "#d33",
          fg: "#fff",
          gradient: true,
          name: require('os').hostname().split('.')[0],
          icon: ""
        },
        bars: {
          overlay: false,
          level: "75"
        },
        grid: {
          bg: "#000",
          crosshair: "#fff",
          lines: "#aaa",
          size: 50
        },
        arib: {
          overlay: false
        },
        smpte: {
          overlay: false
        },
        ramp: {
          overlay: false
        },
        alteka: {
          logoUrl: "",
          name: require('os').hostname().split('.')[0],
          options: [],
          textColour: "#fff",
          text: "Words",
          gradient: true
        },
        ramp: {
          direction: 'Horizontal',
          reverse: false,
          stepped: false,
          double: false
        },
        width: 1920,
        height: 1080,
        top: 0,
        left: 0,
        screen: screen.getPrimaryDisplay().id,
        bounds: false,
        animated: true,
      },
      screens: screen.getAllDisplays(),
      primaryScreen: screen.getPrimaryDisplay().id
    }
  },
  methods: {
    selectImage: function() {
      ipcRenderer.send('selectImage')
    },
    clearImage: function() {
      // ipcRenderer.send('clearImage')
      this.config.alteka.logoUrl = ""
    }
  },
    mounted: function() {
      let vm = this
      ipcRenderer.on('closeTestCard', function(event, val) {
        vm.config.visible = false
      })
      ipcRenderer.on('logoUrl', function(event, val) {
        vm.config.alteka.logoUrl = val
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
