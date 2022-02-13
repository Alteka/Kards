<template>
<div>
  <el-row>
    <el-col :span="24">
      <el-form-item label="Density">
        <el-slider v-model="deghost.density" :min="10" :max="200" show-input></el-slider>
      </el-form-item>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-form-item label="Speed">
        <el-slider v-model="deghost.speed" :min="1" :max="11" show-input></el-slider>
      </el-form-item>
    </el-col>
  </el-row>
  </div>

</template>

<script>
  export default {
    props: {
      modelValue: Object
    },
    computed: {
      deghost: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
    }
  }
</script>

<style scoped>
  
</style>
