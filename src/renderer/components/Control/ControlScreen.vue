<template>
  <div> 
    <el-row style="text-align: center">
      <el-radio-group fill="#7BB144" v-model="config.screen" :disabled="config.visible">
        <el-radio-button v-for="scr in screens" :key="scr.id" :label="scr.id">
          <i v-if="scr.id != primaryScreen" class="el-icon-monitor"></i>
          <i v-if="scr.id == primaryScreen" class="el-icon-star-on"></i>
          {{ scr.size.width }} x {{ scr.size.height }}</el-radio-button>
        <el-radio-button label="0"><i class="el-icon-crop"></i> Window</el-radio-button>
      </el-radio-group>
    </el-row>
  </div>
</template>

<script>
const { screen } = require('electron')
  export default {
    props: {
      config: Object
    },
    data: function() {
      return {
        screens: screen.getAllDisplays(),
        primaryScreen: screen.getPrimaryDisplay().id
      }
    },
    methods: {
      updateScreens: function() {
        this.screens = screen.getAllDisplays()
      }
    },
    mounted: function() {
      let vm = this
      screen.on('display-added', function() {
        setTimeout(vm.updateScreens(), 500)
      })
      screen.on('display-removed', function() {
        setTimeout(vm.updateScreens(), 500)
      })
    }
  }
</script>

<style scoped>
  
</style>
