<template>
  <div id="arib">
  
    <div class="row">
      <div class="grey40" style="width: 12.5%;"></div>
      <div style="width: 75%">
          <div class="white"></div>
          <div class="yellow100"></div>
          <div class="cyan100"></div>
          <div class="green100"></div>
          <div class="magenta100"></div>
          <div class="red100"></div>
          <div class="blue100"></div>
      </div>
      <div class="grey40" style="width: 12.5%;"></div>
    </div>

    <div class="row" style="height: 50%">
      <div class="grey40" style="width: 12.5%;"></div>
      <div style="width: 75%">
        <div class="white75"></div>
        <div class="yellow75"></div>
        <div class="cyan75"></div>
        <div class="green75"></div>
        <div class="magenta75"></div>
        <div class="red75"></div>
        <div class="blue75"></div>
      </div>
      <div class="grey40" style="width: 12.5%;"></div>
    </div>

    <div class="row">
      <div class="white75" style="width: 12.5%"></div>
      <div style="width: 75%">
          <div class="superblack"></div> 
          <div style="width: 7.14285%; background-color:rgba(16,16,16,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(38,38,38,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(60,60,60,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(82,82,82,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(104,104,104,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(125,125,125,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(148,148,148,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(169,169,169,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(191,191,191,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(213,213,213,1)"></div>
          <div style="width: 7.14285%; background-color:rgba(235,235,235,1)"></div>
          <div style="width: 7.14285%;" class="superwhite"></div>
      </div>
      <div style="width: 12.5%" class="white75"></div>
    </div>

    <div class="row">
      <div style="width: 12.5%;" class="black"></div>
      <div style="width: 87.5%" class="ramp"></div>
    </div>

    <div class="row" style="height: 25%">
      <div style="width: 12.5%">
        <div style="width: 33%; background-color: rgb(178,180,79);"></div>
        <div style="width: 33%; background-color: rgb(135,177,180);"></div>
        <div style="width: 33%; background-color: rgb(128,177,74);"></div>
      </div>
      <div style="width: 75%">
        <div class="black" style="width: 7.083333333%;"></div>
        <div style="width: 3.64583%; background-color: rgb(12,12,12);"></div>
        <div style="width: 3.541666%;" class="black"></div>
        <div style="width: 3.64583%; background-color: rgb(20,20,20);"></div>
        <div style="width: 3.541666%;" class="black"></div>
        <div style="width: 3.64583%; background-color: rgb(25,25,25);"></div>

        <div style="width: 12.395833%;" class="black"></div>
        <div style="width: 22.8125%;" class="white75"></div>
        <div style="width: 14.6875%;" class="black"></div>
      </div>
      <div style="width: 12.5%">
        <div style="width: 33%; background-color: rgb(163,72,176);"></div>
        <div style="width: 33%; background-color: rgb(160,67,41);"></div>
        <div style="width: 33%; background-color: rgb(57,37,176);"></div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    props: {
      config: Object
    }
  }
</script>

<style scoped>
  #arib {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    z-index: -100;
    background: black;
  }
.row {
  height: 8.33333%;
}
  .row div {
    width: 14.285%;
    height: 100%;
    float: left;
  }

.ramp {
  background: linear-gradient(90deg, rgba(0,0,0,1) 29%, rgba(255,255,255,1) 99%);
}
  .black {
    background-color: rgba(255,255,255,0.0625);
  }
  .superblack {
    background-color: rgba(0,0,0,1)
  }
  .grey40 {
    background-color: rgba(255,255,255,0.404);
  }
  .superwhite {
    background-color: rgba(255,255,255,1);
  }
  .white {
    background-color: rgba(255,255,255,0.918);
  }
  .white75 {
    background-color: rgba(255,255,255,0.704);
  }
  .yellow100 {
    background-color: rgba(255,255,0,0.918);
  }
  .yellow75 {
    background-color: rgba(255,255,0,0.704);
  }
  .cyan100 {
    background-color: rgba(0,255,255,0.918);
  }
  .cyan75 {
    background-color: rgba(0,255,255,0.704);
  }
  .green100 {
    background-color: rgba(0,255,0,0.918);
  }
  .green75 {
    background-color: rgba(0,255,0,0.704);
  }
  .magenta100 {
    background-color: rgba(255,0,255,0.918);
  }
  .magenta75 {
    background-color: rgba(255,0,255,0.704);
  }
  .red100 {
    background-color: rgba(255,0,0,0.918);
  }
  .red75 {
    background-color: rgba(255,0,0,0.704);
  }
  .blue100 {
    background-color: rgba(0,0,255,0.918);
  }
  .blue75 {
    background-color: rgba(0,0,255,0.704);
  }

</style>
