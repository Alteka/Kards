<template>
  <div id="grid" :style="{background: config.grid.bg}">
   <div class="quadrant topleft" :style="quadrantStyle"></div>
   <div class="quadrant topright" :style="quadrantStyle"></div>
   <div class="quadrant bottomleft" :style="quadrantStyle"></div>
   <div class="quadrant" :style="quadrantStyle"></div>
  </div>
</template>

<script>
  export default {
    props: {
      config: Object
    },
    computed: {
      quadrantStyle: function() {
        return {
          outline: '1px solid ' + this.config.grid.crosshair,
          'background-size': this.config.grid.size + 'px ' + this.config.grid.size +'px',
          'background-image': `linear-gradient(to right, ${this.config.grid.lines} 1px, transparent 1px), linear-gradient(to bottom, ${this.config.grid.lines} 1px, transparent 1px)`
        }
      }
    }
  }
</script>

<style scoped>
  #grid {
    height: 100%;
    width: 100%;
    background: black;
  }
  .quadrant {
    outline: 1px solid red;
    outline-offset: -1px;
    height: 50%;
    width: 50%;
    float: left;
  }
  .topleft {
    background-position: bottom right;
  }
  .topright {
    background-position: bottom left;
  }
  .bottomleft {
    background-position: top right;
  }
</style>
