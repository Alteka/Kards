<template>
<div>
  <el-row>
    <el-form-item label="Audio Device">
      <el-select v-model="audioSync.deviceId" placeholder="Select" style="width: 360px;">
          <el-option v-for="item in audioDevices" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
      </el-select>
    </el-form-item>
  </el-row>
  <el-row>
    <el-form-item label="Video Rate">
      <el-select v-model="audioSync.rate" placeholder="Select" style="width: 110px;">
          <el-option v-for="item in rates" :key="item" :label="item + ' FPS'" :value="item"></el-option>
      </el-select>
    </el-form-item>
  </el-row>
</div>
</template>

<script>

  export default {
    props: {
      audioSync: Object
    },
    data: function() {
      return {
        audioDevices: [],
        rates: [24, 25, 29.97, 30, 50, 59.94, 60]
      }
    },
    methods: {
      updateDevices: function() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          this.audioDevices = devices.filter(device => device.kind === 'audiooutput').filter(device => device.deviceId != 'communications')
        })  
      }
    },
    mounted: function() {
      this.updateDevices()
      setInterval(this.updateDevices, 5000)
    }
  }
</script>

<style scoped>
  
</style>
