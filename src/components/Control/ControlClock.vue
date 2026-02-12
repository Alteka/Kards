<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Background">
          <el-color-picker v-model="clock.bg" size="small" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Clock">
          <el-color-picker v-model="clock.fg" size="small" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Gradient">
          <el-switch v-model="clock.gradient"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const DEFAULT_CLOCK = { bg: '#000000', fg: '#00ff00', gradient: false }

export default {
  props: {
    modelValue: Object,
    colors: Array
  },
  computed: {
    clock: {
      get() {
        return this.modelValue || DEFAULT_CLOCK
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  mounted() {
    if (!this.modelValue || typeof this.modelValue !== 'object') {
      this.$emit('update:modelValue', { ...DEFAULT_CLOCK })
    }
  }
}
</script>

<style scoped>
.color-value {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}
.hint {
  font-size: 12px;
  color: #909399;
  margin: 0;
  padding: 0 8px;
}
</style>
