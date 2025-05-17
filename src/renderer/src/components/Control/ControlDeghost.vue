<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-form-item label="Density">
          <el-radio-group v-model="deghost.density" size="small">
            <el-radio-button :value="33">Low</el-radio-button>
            <el-radio-button :value="75">Medium</el-radio-button>
            <el-radio-button :value="125">High</el-radio-button>
            <el-radio-button :value="166">Maximum</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-form-item label="Speed">
          <el-radio-group v-model="deghost.speed" size="small">
            <el-radio-button :value="1">Low</el-radio-button>
            <el-radio-button :value="3">Medium</el-radio-button>
            <el-radio-button :value="6">High</el-radio-button>
            <el-radio-button :value="11">Maximum</el-radio-button>
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
    }
  }
}
</script>

<style scoped></style>
