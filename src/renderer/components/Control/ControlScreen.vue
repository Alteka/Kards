<template>
  <div> 
  <svg :view-box.camel="viewBox" style="width: 90%; margin-left: 5%; margin-top: 10px; height: 150px;">
    <g v-for="scr in screens" :key="scr.id" v-on:click="config.screen = scr.id">
      <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" style="stroke-width:1%;stroke:rgb(200,200,200);fill:#3d3d3d;" />
      <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" style="stroke-width:1%;stroke:rgb(200,200,200);fill:#6ab42f;" v-if="config.screen == scr.id" />
      <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/2" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.height/6" text-anchor="middle" fill="white">{{ scr.size.width }} x {{ scr.size.height }}</text>
      <text v-if="scr.id == primaryScreen" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*7/8" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/6">Primary</text>
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
        primaryScreen: screen.getPrimaryDisplay().id
      }
    },
    computed: {
      viewBox: function() {
        let minX = 0
        let maxX = 0
        let minY = 0
        let maxY = 0

        for (const scr of this.screens) {
          if (scr.bounds.x < minX) {
            minX = scr.bounds.x
          } 
          if ((Math.abs(scr.bounds.x) + scr.bounds.width) > maxX) {
            maxX = Math.abs(scr.bounds.x) + scr.bounds.width
          }
          if (scr.bounds.y < minY) {
            minY = scr.bounds.y
          }
          if ((Math.abs(scr.bounds.y) + scr.bounds.height) > maxY) {
            maxY = Math.abs(scr.bounds.y) + scr.bounds.height
          }
        }
        return minX + " " + minY + " " + maxX + " " + (maxY + minY)
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
              this.config.top = 0
              this.config.left = 0
              this.config.width = scr.size.width
              this.config.height = scr.size.height
              this.config.maxWidth = scr.size.width
              this.config.maxHeight = scr.size.height
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
