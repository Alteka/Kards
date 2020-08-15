<template>

<div> 
   <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="placeholder.bg" :predefine="colors"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Foreground">
            <el-color-picker v-model="placeholder.fg" :predefine="colors"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Gradient">
            <el-switch v-model="placeholder.gradient"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
            <el-radio-group v-model="placeholder.icon" size="mini">
              <el-radio-button label="">Blank</el-radio-button>
              <el-radio-button v-for="icon in icons" :key="icon" :label="icon"><i :class="icon"></i></el-radio-button>
            </el-radio-group>
      </el-row>
      </div>
</template>

<script>
  export default {
    props: {
      placeholder: Object,
      colors: Array
    },
    data: function() {
      return {
        icons: ['el-icon-picture-outline', 'el-icon-phone-outline', 'el-icon-upload', 'el-icon-video-camera', 'el-icon-monitor', 'el-icon-data-analysis', 'el-icon-chat-dot-round', 'el-icon-mic', 'el-icon-alarm-clock', 'el-icon-timer', 'el-icon-service']
      }
    }
  }
</script>

<style scoped>
  
</style>
