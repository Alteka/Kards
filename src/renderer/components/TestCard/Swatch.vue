<template>
  <div class="swatch" :style="bgCol">
      <div class="text" v-if="showText == true">
          {{ colName }}
          <br />
          {{ ire }}% IRE
      </div>
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
        }
    },
    computed: {
        bgCol: function() {
            let dec = this.ireToDecimal(this.ire)
            let r = dec * this.colours[this.colour][0]
            let g = dec * this.colours[this.colour][1]
            let b = dec * this.colours[this.colour][2]

            let color = 'white'
            if ((r+g+b) > 300) {
                color = 'black'
            }
            return {
                'background-color': 'rgb(' + r + ', ' + g + ', ' + b + ')',
                'color': color
            }
        },
        colName: function() {
            let col = this.colour
            if (this.colour == 'white' && this.ire < 75 && this.ire > 10) {
                col = 'grey'
            } else if (this.colour == 'white' && this.ire < 11) {
                col = 'black'
            }
            return col.charAt(0).toUpperCase() + col.slice(1)
        }
    },
    data: function() {
        return {
            colours: {
                red: [1, 0, 0],
                magenta: [1, 0, 1],
                yellow: [1, 1, 0],
                blue: [0, 0, 1],
                green: [0, 1, 0],
                cyan: [0, 1, 1],
                white: [1, 1, 1],
                black: [0, 0, 0],
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
</style>
