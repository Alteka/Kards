<template>
  <div> 
    <el-row style="text-align: center; margin-top: 10px;">
      <el-radio-group v-model="config.screen" :disabled="config.visible">
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
    watch: {
      config: {
        handler: function (val, oldVal) { 
            this.setOutputToMatchScreen()
         },
        deep: true
      },
    },
    methods: {
      updateScreens: function() {
        this.screens = screen.getAllDisplays()
      },
      setOutputToMatchScreen: function() {
        if (this.config.screen !=0 && this.config.fullsize) {
          for (const scr of this.screens) {
            if (scr.id == this.config.screen) {
              console.log(scr)
              this.config.top = 0
              this.config.left = 0
              this.config.width = scr.size.width
              this.config.height = scr.size.height
            }
          }
        }
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
      this.setOutputToMatchScreen()
    }
  }
</script>

<style scoped>
  
</style>
