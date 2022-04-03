<template>
<div>
  <el-row>
    <el-col :span="9">
      <el-form-item label="Panel Width" label-width="100px">
        <el-input-number v-model="led.width" :min="16" :max="720"></el-input-number>
      </el-form-item>
    </el-col>
    <el-col :span="9">
      <el-form-item label="Panel Height" label-width="120px">
        <el-input-number v-model="led.height" :min="16" :max="720"></el-input-number>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="Border" label-width="100px">
        <el-switch v-model="led.border"></el-switch>
      </el-form-item>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="9">
      <el-form-item label="Columns" label-width="100px">
        <el-input-number v-model="led.columns" :min="1" :max="128"></el-input-number>
      </el-form-item>
    </el-col>
    <el-col :span="9">
      <el-form-item label="Rows" label-width="120px">
        <el-input-number v-model="led.rows" :min="1" :max="128"></el-input-number>
      </el-form-item>
    </el-col>
    <el-col :span="6">
      <el-form-item label="Position" label-width="100px">
        <el-switch v-model="led.position"></el-switch>
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
