<template>
<div>
  <el-row>
    <el-col :span="24">
      <el-form-item label="Density">
        <el-radio-group v-model="deghost.density" size="small">
          <el-radio-button :label="33">Low</el-radio-button>
          <el-radio-button :label="75">Medium</el-radio-button>
          <el-radio-button :label="125">High</el-radio-button>
          <el-radio-button :label="166">Maximum</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="24">
      <el-form-item label="Speed">
        <el-radio-group v-model="deghost.speed" size="small">
          <el-radio-button :label="1">Low</el-radio-button>
          <el-radio-button :label="3">Medium</el-radio-button>
          <el-radio-button :label="6">High</el-radio-button>
          <el-radio-button :label="11">Maximum</el-radio-button>
        </el-radio-group>
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
