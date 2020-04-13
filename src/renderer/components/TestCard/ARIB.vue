<template>
  <div id="arib">
  
    <div class="row">
      <div class="endbit grey40"></div>
      <div class="centerbit">
          <div class="white"></div>
          <div class="yellow100"></div>
          <div class="cyan100"></div>
          <div class="green100"></div>
          <div class="magenta100"></div>
          <div class="red100"></div>
          <div class="blue100"></div>
      </div>
      <div class="grey40 endbit"></div>
    </div>

    <div class="row" style="height: 50%">
      <div class="endbit grey40"></div>
      <div class="centerbit">
        <div class="white75"></div>
        <div class="yellow75"></div>
        <div class="cyan75"></div>
        <div class="green75"></div>
        <div class="magenta75"></div>
        <div class="red75"></div>
        <div class="blue75"></div>
      </div>
      <div class="grey40 endbit"></div>
    </div>

    <div class="row">
      <div class="white75 endbit"></div>
      <div class="centerbit">
          <div class="superblack"></div>
          <div class="superblack"></div> 
          <div style="background-color:rgba(16,16,16,1)"></div>
          <div style="background-color:rgba(38,38,38,1)"></div>
          <div style="background-color:rgba(60,60,60,1)"></div>
          <div style="background-color:rgba(82,82,82,1)"></div>
          <div style="background-color:rgba(104,104,104,1)"></div>
          <div style="background-color:rgba(125,125,125,1)"></div>
          <div style="background-color:rgba(148,148,148,1)"></div>
          <div style="background-color:rgba(169,169,169,1)"></div>
          <div style="background-color:rgba(191,191,191,1)"></div>
          <div style="background-color:rgba(213,213,213,1)"></div>
          <div style="background-color:rgba(235,235,235,1)"></div>
          <div class="superwhite"></div>
      </div>
      <div class="white75 endbit"></div>
    </div>

    <div class="row">
      <div class="endbit black"></div>
      <div style="width: 87.5%; float: left" class="ramp"></div>
    </div>

    <div class="row" style="height: 25%">
      <div class="centerbit" style="width: 12.5%">
        <div style="background-color: rgb(178,180,79);"></div>
        <div style="background-color: rgb(135,177,180);"></div>
        <div style="background-color: rgb(128,177,74);"></div>
      </div>
      <div class="centerbit">
        <div class="black" style="width: 9.444%;"></div>

        <div class="centerbit" style="width: 24.02%;">
          <div style="background-color: rgb(12,12,12);"></div>
          <div class="black"></div>
          <div style="background-color: rgb(20,20,20);"></div>
          <div class="black"></div>
          <div style="background-color: rgb(25,25,25);"></div>
        </div>

        <div style="width: 16.52777%;" class="black"></div>
        <div style="width: 30.41666%;" class="white75"></div>
        <div style="width: 19.58333%;" class="black"></div>
      </div>
      <div class="centerbit" style="width: 12.5%">
        <div style="background-color: rgb(163,72,176);"></div>
        <div style="background-color: rgb(160,67,41);"></div>
        <div style="background-color: rgb(57,37,176);"></div>
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
    background: black;
  }

  .row {
    height: 8.33333%;
  }
  .row div {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .endbit {
    float: left;
    max-width: 12.5%;
  }
  .centerbit {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 75%;
    float: left;
  }
  .ramp {
    background: linear-gradient(90deg, rgba(0,0,0,1) 29%, rgba(255,255,255,1) 99%);
  }

</style>
