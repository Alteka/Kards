<template>

<div> 
      <el-row>
        <el-col :span="8">
          <el-button type="success" icon="el-icon-picture" v-on:click="selectImage()">Select Image</el-button>
        </el-col>
        <el-col :span="8">
          <el-image style="width: 150px; height: 50px" :src="alteka.logoUrl" fit="contain">
            <div slot="error" class="image-slot">
              <img src="~@/assets/bug.png" height="40px" />
            </div>
          </el-image>
        </el-col>
        <el-col :span="8" v-if="alteka.logoUrl != false">
          <el-button type="success" icon="el-icon-delete" v-on:click="clearImage()">Clear</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Text colour">
            <el-color-picker v-model="alteka.textColour"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Gradient">
            <el-switch active-color="#7BB144" v-model="alteka.gradient"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-checkbox-group  fill="#7BB144" v-model="alteka.options">
          <el-checkbox-button label="CPU" name="type"></el-checkbox-button>
          <el-checkbox-button label="RAM" name="type"></el-checkbox-button>
          <el-checkbox-button label="Framerate" name="type"></el-checkbox-button>
        </el-checkbox-group>
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
