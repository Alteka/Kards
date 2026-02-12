<template>
  <div>
    <el-row>
      <el-col :span="12">
        <el-form-item label="Background">
          <el-color-picker v-model="clock.bg" size="small"></el-color-picker>
          <span class="color-value">{{ clock.bg }}</span>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Clock colour">
          <el-color-picker v-model="clock.fg" size="small"></el-color-picker>
          <span class="color-value">{{ clock.fg }}</span>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <p class="hint">Broadcast-style clock using monospace time. Use “Show Info” in Output Options to show name and resolution.</p>
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
    clock: {
      get() {
        return this.modelValue || { bg: '#000000', fg: '#00ff00' }
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
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
