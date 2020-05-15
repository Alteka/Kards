<template>
  <div> 
    <el-row>
      <el-col :span="6">
        <el-form-item label="Background" label-width="100">
          <el-color-picker v-model="alteka.bg"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Foreground" label-width="100">
          <el-color-picker v-model="alteka.fg"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Center Text" label-width="100">
          <el-color-picker v-model="alteka.textColour"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Gradient" label-width="100">
          <el-switch v-model="alteka.gradient"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Custom Logo" label-width="100">
          <el-switch v-model="alteka.showLogo"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="9" v-if="alteka.showLogo">
        <el-button-group>
        <el-button icon="el-icon-picture" size="small" v-on:click="selectImage()">Select Image</el-button>
        <el-button size="small" v-on:click="clearImage()">Clear</el-button>
        </el-button-group>
      </el-col>
      <el-col  v-if="alteka.showLogo" :span="7">
        <el-image v-if="alteka.logoUrl != ''" style="width: 135px; height: 45px" :src="alteka.logoUrl" fit="cover"></el-image>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
  export default {
    props: {
      alteka: Object
    },
    methods: {
      selectImage: function() {
        ipcRenderer.send('selectImage')
      },
      clearImage: function() {
        this.alteka.logoUrl = ""
      }
    },
    mounted: function() {
      let vm = this
      ipcRenderer.on('logoUrl', function(event, val) {
        vm.alteka.logoUrl = val
      })
    }
  }
</script>

<style scoped>
  
</style>
