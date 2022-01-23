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

      <el-row style="position: relative; top: -10px; left: 10px;">
            <el-radio-group v-model="placeholder.icon" size="mini">
              <el-radio-button label="">Blank</el-radio-button>
              <el-radio-button v-for="icon in icons" :key="icon" :label="icon"><i class="fas" :class="icon"></i></el-radio-button>
              <el-radio-button label="custom">Other</el-radio-button>
            </el-radio-group>
      </el-row>

      <el-row v-if="placeholder.icon == 'custom'" style="position: relative; top: -12px;">
            <el-form-item label="Font Awesome Icon" label-width="400px" size="small">
            <el-input v-model="placeholder.custom" size="small" :input-style="smallInput"></el-input>
          </el-form-item>
      </el-row>

      </div>
</template>

<script>
  export default {
    props: {
      modelValue: Object, // v-model object
      colors: Array
    },
    computed: {
      placeholder: {
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
        icons: ['fa-desktop','fa-phone','fa-chart-line','fa-image', 'fa-cloud', 'fa-camera', 'fa-comment-dots', 'fa-microphone', 'fa-clock'],
        smallInput: {
          height: '24px',
          fontSize: '80%'
        }
      }
    }
  }
</script>

<style scoped>

</style>
