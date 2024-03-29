<template>
  <div> 
    <svg :view-box.camel="viewBox" style="width: 90%; margin-left: 5%; margin-top: 10px; height: 125px;">
      <g v-for="scr in screens" :key="scr.id" v-on:click="selectScreen(scr.id)">
        <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" fill="#555" style="stroke-width:25;stroke:#3d3d3d;" />
        <rect :x="scr.bounds.x" :y="scr.bounds.y" :width="scr.bounds.width" :height="scr.bounds.height" fill="#6ab42f" style="stroke-width:25;stroke:#3d3d3d;" v-if="config.screen == scr.id" />
        
        <text v-if="!scr.portrait" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/1.4" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.height/5" text-anchor="middle" fill="white">{{ scr.description }}</text>
        <text v-if="!scr.portrait" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/1.1" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.height/8" text-anchor="middle" fill="white">{{ scr.displayFrequency }}Hz</text>
        <text v-if="scr.portrait" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/1.55" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.width/4" text-anchor="middle" fill="white">{{ scr.bounds.width }}</text>
        <text v-if="scr.portrait" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/1.31" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.width/4" text-anchor="middle" fill="white">x</text>
        <text v-if="scr.portrait" :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height/1.1" :width="scr.bounds.width" :height="scr.bounds.height" font-family="Verdana" :font-size="scr.bounds.width/4" text-anchor="middle" fill="white">{{ scr.bounds.height }}</text>

        <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*0.4 - (scr.bounds.height*0.05 * scr.portrait)" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/3" class="fa">{{ scr.icon }}</text>
        <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*0.32 - (scr.bounds.height*0.05 * scr.portrait)" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/6" class="fa" v-if="config.screen == scr.id && config.visible && scr.primary">{{ "\uf00c" }}</text>
        <text :x="scr.bounds.x + scr.bounds.width/2" :y="scr.bounds.y + scr.bounds.height*0.28 - (scr.bounds.height*0.05 * scr.portrait)" :width="scr.bounds.width" :height="scr.bounds.height" text-anchor="middle" fill="white" :font-size="scr.bounds.height/6" class="fa" v-if="config.screen == scr.id && config.visible && !scr.primary">{{ "\uf00c" }}</text>
      </g>
    </svg>
  </div>
</template>

<script>
  export default {
    props: {
      modelValue: Object, // v-model object
    },
    computed: {
      config: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
    },
    data: function() {
      return {
        screens: [],
        primaryScreen: null,
        check: "\uf00c",
        viewBox: '0 0 0 0'
      }
    },
    watch: {
      config: {
        handler: function() { 
            this.setOutputToMatchScreen()
         },
        deep: true
      },
    },
    methods: {
      updateScreens: function() {
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
          scr.portrait = (scr.bounds.width < scr.bounds.height) ? true : false;
          scr.description = scr.size.width + ' x ' + scr.size.height

          if (scr.internal || scr.id == this.primaryScreen) {
            scr.icon = "\uf109"
            scr.primary = true
          } else {
            scr.icon = "\uf108"
            scr.primary = false
          }
        }
        
        this.viewBox = (left - 25) + " " + (top - 25) + " " + (Math.abs(right - left) + 50) + " " + (Math.abs(bottom - top) + 50)
        this.setOutputToMatchScreen()
      },
      selectScreen: function(id) { 
        if (this.config.windowed && this.config.visible && this.config.screen != id) {
          window.ipcRenderer.send('moveWindowTo', id)
        }
        this.config.screen = id
      },
      setOutputToMatchScreen: function() {
        if (!this.config.windowed && this.config.fullsize) {
          for (const scr of this.screens) {
            if (scr.id == this.config.screen) {
              this.config.notFilledCard.top = 0
              this.config.notFilledCard.left = 0
              this.config.notFilledCard.width = scr.size.width
              this.config.notFilledCard.height = scr.size.height
            }
          }
        }
        let exists = false
        for (const scr of this.screens) {
          if (scr.id == this.config.screen) {
            exists = true
          }
        }
        if (!exists) {
          console.log('Update screen as selected screen doesnt exist...', this.primaryScreen)
          this.config.screen = this.primaryScreen
        }
      }
    },
    mounted: function() {
      let vm = this
      window.ipcRenderer.receive('screens', function(data) {
        vm.screens = data.all
        vm.primaryScreen = data.primary

        vm.updateScreens()
      })
      window.ipcRenderer.send('getScreens')
    }
  }
</script>

<style scoped>

</style>
