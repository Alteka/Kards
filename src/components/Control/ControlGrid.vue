<template>
  <div>
    <el-row>
      <el-col :span="6">
        <el-form-item label="Background">
          <el-color-picker v-model="grid.bg" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Crosshair">
          <el-color-picker v-model="grid.crosshair" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Lines">
          <el-color-picker v-model="grid.lines" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="Diagonals">
          <el-color-picker v-model="grid.diagColour" :predefine="colors"></el-color-picker>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <el-form-item label="Show Diagonals">
          <el-switch v-model="grid.diagonals"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="7">
        <el-form-item label="Show Circles">
          <el-switch v-model="grid.circles"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="10">
        <el-form-item label-width="auto" label="Grid Spacing (px)">
          <el-input-number
            v-model="grid.size"
            :step="5"
            :min="1"
            size="mini"
            controls-position="right"
          ></el-input-number>
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
    grid: {
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
