<template>

<div> 
   <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="placeholder.bg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Foreground">
            <el-color-picker v-model="placeholder.fg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Gradient">
            <el-switch active-color="#7BB144" v-model="placeholder.gradient"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="16">
          <el-form-item label="Icon">
            <el-radio-group v-model="placeholder.icon" size="mini">
              <el-radio-button v-for="icon in icons" :key="icon" :label="icon"><i :class="icon"></i></el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">

            <el-input v-model="placeholder.icon"></el-input>

        </el-col>
      </el-row>
      </div>
</template>

<script>
  export default {
    props: {
      placeholder: Object
    },
    data: function() {
      return {
        icons: ['el-icon-s-opportunity', 'el-icon-picture-outline', 'el-icon-phone-outline', 'el-icon-upload', 'el-icon-video-camera', 'el-icon-monitor', 'el-icon-data-analysis', 'el-icon-chat-dot-round', 'el-icon-mic', 'el-icon-alarm-clock', 'el-icon-timer', 'el-icon-service']
      }
    }
  }
</script>

<style scoped>
  
</style>
