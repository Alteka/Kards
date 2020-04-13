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
          <div class="black"></div>
          <div class="step10"></div>
          <div class="step20"></div>
          <div class="step30"></div>
          <div class="step40"></div>
          <div class="step50"></div>
          <div class="step60"></div>
          <div class="step70"></div>
          <div class="step80"></div>
          <div class="step90"></div>
          <div class="white"></div>
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
        <div class="rec709yellow"></div>
        <div class="rec709cyan"></div>
        <div class="rec709green"></div>
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
        <div class="rec709magenta"></div>
        <div class="rec709red"></div>
        <div class="rec709blue"></div>
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
    background: grey;
  }
  .row {
    height: 8.33333%;
  }
  .row div {
    height: 100%;
    width: 100%;
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
