<template>
  <div>
    <el-row>
      <el-col :span="6">
        <el-form-item label="Background" label-width="100">
          <el-color-picker v-model="alteka.bg" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Foreground" label-width="100">
          <el-color-picker v-model="alteka.fg" ></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Center Text" label-width="100">
          <el-color-picker v-model="alteka.textColour" :disabled="!alteka.showLogo" ></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Gradient" label-width="100">
          <el-switch v-model="alteka.gradient"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Custom Logo" label-width="100">
          <el-switch v-model="alteka.showLogo"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="9" v-if="alteka.showLogo">
        <el-button-group>
          <el-tooltip effect="dark" content="Image will be masked to 3:1 aspect ratio" placement="bottom" :open-delay="500">
            <el-button size="small" v-on:click="selectImage"><i class="far fa-image"></i> Select Image</el-button>
          </el-tooltip>
          <el-button size="small" v-on:click="clearImage">Clear</el-button>
        </el-button-group>
      </el-col>
      <el-col  v-if="alteka.showLogo" :span="7">
        <el-image v-if="alteka.logo != ''" style="width: 135px; height: 45px" :src="alteka.logo" fit="cover"></el-image>
      </el-col>
    </el-row>
  </div>
</template>

<script>
// import { ref } from 'vue'
  export default {
    props: {
      modelValue: Object,
      colors: Array
    },
    // data: function() {
    //   return {
    //     predefineColors: ref(this.colors)
    //   }
    // },
    computed: {
      alteka: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
    },
    methods: {
      selectImage: function() {
        window.ipcRenderer.send('selectImage')
      },
      clearImage: function() {
        this.alteka.logo = ""
      }
    }
  }
</script>

<style scoped>
  
</style>
