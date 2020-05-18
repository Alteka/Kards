<template>
  <el-row>
    <el-col :span="8">
      <el-form-item label="Video Rate">
        <el-select v-model="audioSync.rate" placeholder="Select">
            <el-option v-for="item in rates" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :span="16">
      <el-form-item label="Audio Device">
        <el-select v-model="audioSync.deviceId" placeholder="Select">
            <el-option v-for="item in audioDevices" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
        </el-select>
      </el-form-item>
    </el-col>
  </el-row>
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
          this.audioDevices = devices.filter(device => device.kind === 'audiooutput')
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
