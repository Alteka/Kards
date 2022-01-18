<template>
<div>
  <el-row>
    <el-col :span="12">
      <el-form-item label="Panel Width">
        <el-input-number v-model="led.width"></el-input-number>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="Panel Height">
        <el-input-number v-model="led.height"></el-input-number>
      </el-form-item>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="12">
      <el-form-item label="Columns">
        <el-input-number v-model="led.columns"></el-input-number>
      </el-form-item>
    </el-col>
    <el-col :span="12">
      <el-form-item label="Rows">
        <el-input-number v-model="led.rows"></el-input-number>
      </el-form-item>
    </el-col>
  </el-row>
  </div>

</template>

<script>
  export default {
    props: {
      modelValue: Object,
      colors: Array
    },
    computed: {
      led: {
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
