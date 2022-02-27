<template>
  <div class="swatch" :style="bgCol" ref="swatch">
    <transition name="fade">
      <div class="text" v-if="showText == true">
          <strong>{{ colName }}</strong> <span class="subtitle" v-if="ire != null">{{ ire }}%</span>
      </div>
    </transition>
  </div>
</template>

<script>
  export default {
    props: {
      colour: String,
      ire: String,
      showText: Boolean
    },
    methods: {
        ireToDecimal: function(ire) { // give it an ire percentage and it returns the 0-255 value you need.
            let r1 = [0, 100]; // ire range
            let r2 = [16, 235]; // dec range
            let result =  ( ire - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
            if (result < 0) {result = 0}
            return Math.round(result)
        },
    },
    computed: {
        bgCol: function() {
            let bg

            if (this.colour.includes('rec709') || this.colour.includes('ntsc')) {
                bg = this.colours[this.colour]
            } else {
                let dec = this.ireToDecimal(this.ire)
                let r = dec * this.colours[this.colour][0]
                let g = dec * this.colours[this.colour][1]
                let b = dec * this.colours[this.colour][2]
                bg = 'rgb(' + r + ', ' + g + ', ' + b + ')'
            }

            let color = 'white'
            if (this.ire > 50) {
                color = 'black'
            }
            return {
                'background-color': bg,
                'color': color
            }
        },
        colName: function() {
            let col = this.colour
            if (this.colour == 'white' && this.ire < 75 && this.ire > 10) {
                col = 'grey'
            } else if (this.colour == 'white' && this.ire < 11) {
                col = 'black'
            } else if (this.colour == 'ntscQuadrature') {
                col = '+Q'
            } else if (this.colour == 'ntscInphase') {
                col = '-I'
            }
            if (col.includes('rec709')) {
                return 'Rec 709 ' + col.charAt(6).toUpperCase() + col.slice(7)
            } else {
                return col.charAt(0).toUpperCase() + col.slice(1)
            }
        }
    },
    data: function() {
        return {
            vertical: false,
            colours: {
                red: [1, 0, 0],
                magenta: [1, 0, 1],
                yellow: [1, 1, 0],
                blue: [0, 0, 1],
                green: [0, 1, 0],
                cyan: [0, 1, 1],
                white: [1, 1, 1],
                grey: [1, 1, 1],
                black: [1, 1, 1],
                superblack: [1,1,1],
                rec709yellow: 'rgb(178,180,79)',
                rec709cyan: 'rgb(135,177,180)',
                rec709green: 'rgb(128,177,74)',
                rec709magenta: 'rgb(163,72,176)',
                rec709red: 'rgb(160,67,41)',
                rec709blue: 'rgb(57,37,176)',
                ntscQuadrature: '#31006b',
                ntscInphase: '#00214c',
            }
        }
    }
  }
</script>

<style scoped>
   .swatch {
       border: none;
       margin: 0;
       padding: 5px;
       overflow: hidden;
   }
   .text {
        margin: auto;
        text-align: center;
   }
   .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
