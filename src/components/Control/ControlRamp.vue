<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Stepped">
          <el-switch v-model="ramp.stepped"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Double">
          <el-switch v-model="ramp.double"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Reverse">
          <el-switch v-model="ramp.reverse"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="18">
        <el-form-item label="Direction">
          <el-radio-group v-model="ramp.direction" size="mini">
            <el-radio-button label="Horizontal" />
            <el-radio-button label="Vertical" />
            <el-radio-button label="Diagonal" />
            <el-radio-button label="Radial" />
          </el-radio-group>
        </el-form-item>
      </el-col>
        <el-col :span="6">
        <el-form-item v-if="ramp.stepped && (ramp.direction == 'Horizontal' || ramp.direction == 'Vertical')" label="Overlay" label-width="80">
          <el-switch v-model="ramp.overlay"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
    props: {
      modelValue: Object, // v-model object
    },
    computed: {
      ramp: {
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
