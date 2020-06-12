<template>
  <div> 
  <svg :view-box.camel="viewBox" style="width: 90%; margin-left: 5%; margin-top: 10px; height: 150px;">
    <g v-for="scr in screens" :key="scr.id" v-on:click="config.screen = scr.id">
      <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" style="stroke-width:1%;stroke:rgb(200,200,200);fill:#3d3d3d;" />
      <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" style="stroke-width:1%;stroke:rgb(200,200,200);fill:#6ab42f;" v-if="config.screen == scr.id" />
      <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/2" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.height/6" text-anchor="middle" fill="white">{{ scr.description }}</text>
      <text v-if="scr.id == primaryScreen" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*7/8" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/6">Primary</text>
      <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*1/8" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/6" class="fa">&#xf040;</text>
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
        }

        let pri = screen.getPrimaryDisplay()
        this.viewBox = left + " " + top + " " + Math.abs((right + pri.bounds.width) - left) + " " + Math.abs(bottom - top)

        this.screens.push({
          id: 0,
          bounds: {
            x: right,
            y: pri.bounds.y,
            height: pri.bounds.height,
            width: pri.bounds.width,
          },
          description: "Windowed"
        })
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
      this.updateScreens()
    }
  }
</script>

<style scoped>
  .fa {
    font-family: FontAwesome;
  }
</style>
