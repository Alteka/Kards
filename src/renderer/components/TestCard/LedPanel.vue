<template>
  <div class="ledpanel" :style="{width: led.width + 'px', height: led.height + 'px', backgroundColor: bgCol}">
    <i class="fas fa-arrow-down"></i> {{row}}<br />
    <i class="fas fa-arrow-right"></i> {{column}}
  </div>
</template>

<script>
  export default {
    props: {
      led: Object,
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
</style>
