<template>
  <div> 
    <svg :view-box.camel="viewBox" style="width: 90%; margin-left: 5%; margin-top: 10px; height: 125px;">
      <g v-for="scr in screens" :key="scr.id" v-on:click="config.screen = scr.id">
        <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" style="stroke-width:25;stroke:#3d3d3d;fill:#666;" />
        <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" style="stroke-width:25;stroke:#3d3d3d;fill:#6ab42f;" v-if="config.screen == scr.id" />
        <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/1.25" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.height/5" text-anchor="middle" fill="white">{{ scr.description }}</text>
        <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*0.45" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/3" class="fa">{{ scr.icon }}</text>
      </g>
    </svg>
  </div>
</template>

<script>
const { screen } = require('electron').remote
  export default {
    props: {
      config: Object
    },
    data: function() {
      return {
        screens: screen.getAllDisplays(),
        primaryScreen: screen.getPrimaryDisplay().id,
        viewBox: '0 0 0 0'
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

        let left = 0
        let right = 0
        let top = 0
        let bottom = 0

        for (const scr of this.screens) {
          if (scr.bounds.x < left) {
            left = scr.bounds.x
          } 
          if (scr.bounds.y < top) {
            top = scr.bounds.y
          }

          if ((scr.bounds.x + scr.bounds.width) > right) {
            right = scr.bounds.x + scr.bounds.width
          }
          
          if ((scr.bounds.y + scr.bounds.height) > bottom) {
            bottom = scr.bounds.y + scr.bounds.height
          }
          scr.description = scr.size.width + ' x ' + scr.size.height

          if (scr.internal || scr.id == this.primaryScreen) {
            scr.icon = "\uf109"
          } else {
            scr.icon = "\uf108"
          }
        }
        
        this.viewBox = (left - 25) + " " + (top - 25) + " " + (Math.abs(right - left) + 50) + " " + (Math.abs(bottom - top) + 50)
        this.setOutputToMatchScreen()
      },
      setOutputToMatchScreen: function() {
        if (!this.config.windowed && this.config.fullsize) {
          for (const scr of this.screens) {
            if (scr.id == this.config.screen) {
              this.config.top = 0
              this.config.left = 0
              this.config.width = scr.size.width
              this.config.height = scr.size.height
              this.config.maxWidth = scr.size.width
              this.config.maxHeight = scr.size.height
            }
          }
        }
        if (!this.screens.includes(this.config.screen)) {
          this.config.screen = this.primaryScreen
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
      screen.on('display-metrics-changed', function() {
        setTimeout(vm.updateScreens(), 500)
      })
      this.setOutputToMatchScreen()
      this.updateScreens()
    }
  }
</script>

<style scoped>

</style>
