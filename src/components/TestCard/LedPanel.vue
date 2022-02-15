<template>
  <div class="ledpanel" :style="{width: config.led.width + 'px', height: config.led.height + 'px', backgroundColor: bgCol}" :class="animClass">
    <span v-if="config.led.height > 42 && config.led.width > 42"><i class="fas fa-arrow-down"></i> {{row}}<br />
    <i class="fas fa-arrow-right"></i> {{column}}</span>
  </div>
</template>

<script>
  export default {
    props: {
      config: Object,
      row: Number,
      column: Number
    },
    data: function() {
        return {
            vertical: false
            
        }
    },
    computed: {
        odd: function() {
            if (this.row%2 == 0 && this.column%2 != 0) {
                return false
            } else if (this.row%2 != 0 && this.column%2 == 0) {
                return false
            } else {
                return true
            }
        },
        bgCol: function() {
            if (this.odd) {
                return 'blue'
            } else {
                return 'red'
            }
        },
        animClass: function() {
            if (this.odd && this.config.animated) {
                return 'animatedOdd'
            } else if (this.config.animated) {
                return 'animatedEven'
            } else {
                return 'notAnimated'
            }
        }
    }
  }
</script>

<style scoped>
   .ledpanel {
       border: 1px solid white;
       box-sizing: border-box;
       background: blue;
       float: left;
       padding: 5px;
   }
   .animatedEven {
    background: linear-gradient(90deg, rgba(255,0,0,1) 25%, rgba(0,255,0,1) 25%, rgba(0,255,0,1) 50%, rgba(0,255,0,1) 50%, rgba(0,0,255,1) 50%, rgba(0,0,255,1) 75%, rgba(255,0,0,1) 75%);
    background-size: 400%;
    animation: Animation 10s linear infinite;
}
.animatedOdd {
    background: linear-gradient(90deg, rgba(0,255,0,1) 25%, rgba(0,0,255,1) 25%, rgba(0,0,255,1) 50%, rgba(0,0,255,1) 50%, rgba(255,0,0,1) 50%, rgba(255,0,0,1) 75%, rgba(0,255,0,1) 75%);
    background-size: 400%;
    animation: Animation 10s linear infinite;
}

@keyframes Animation { 
    0%{background-position:0% }
    100%{background-position:100%}
}

</style>
