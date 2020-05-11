<template>

<div> 
  
      <el-row>
        <el-col :span="12">
          <el-form-item label="Text Colour">
            <el-color-picker v-model="alteka.textColour"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Corner Colour">
            <el-color-picker v-model="alteka.cornerColour"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row>
        <el-col :span="12">
          <el-form-item label="Audio Sync">
            <el-switch v-model="alteka.audioSync"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Custom Logo">
            <el-switch v-model="alteka.showLogo"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

       <el-row v-if="alteka.showLogo" style="text-align: center;">
        <el-col :span="8">
          <el-button type="primary" icon="el-icon-picture" v-on:click="selectImage()">Select Image</el-button>
        </el-col>
        <el-col :span="8">
          <el-image v-if="alteka.logoUrl != ''" style="width: 150px; height: 50px" :src="alteka.logoUrl" fit="contain"></el-image>
        </el-col>
        <el-col :span="8" v-if="alteka.logoUrl != false">
          <el-button type="primary" icon="el-icon-delete" v-on:click="clearImage()">Clear</el-button>
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
