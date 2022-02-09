<template>
<div>
  <el-row>
    <el-form-item label="Audio Device" label-width="140px">
      <el-select v-model="audioSync.deviceId" placeholder="Select" style="width: 353px;">
          <el-option v-for="item in audioDevices" :key="item.deviceId" :label="item.label" :value="item.deviceId"></el-option>
      </el-select>
    </el-form-item>
  </el-row>
  <el-row>
    <el-form-item label="Rate FPS" label-width="140px">
      <el-radio-group v-model="audioSync.rate" size="small">
          <el-radio-button v-for="item in rates" :key="item" :label="item"><i v-if="item == displayFrequency" class="fas fa-star"></i> {{item}}</el-radio-button>
      </el-radio-group>
      <span v-if="audioSync.rate != displayFrequency" class="audioSyncWarning"><i class="fas fa-exclamation-circle"></i> Video rate does not match screen</span>
      <span v-if="audioSync.rate > 60" class="audioSyncWarning" style="float: right;"><i class="fas fa-exclamation-circle"></i> May require high performace computer</span>
    </el-form-item>
  </el-row>
</div>
</template>

<script>

  export default {
    props: {
      modelValue: Object,
      displayFrequency: Number
    },
    computed: {
      audioSync: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
    },
    data: function() {
      return {
        audioDevices: [],
        rates: [24, 25, 29.97, 30, 50, 59.94, 60, 100, 120]
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
  .audioSyncWarning {
    position: relative;
    color: #e6a23c;
    font-size: 80%;
    top: -5px;
  }
</style>
