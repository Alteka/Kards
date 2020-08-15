<template>
<div>
 <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="grid.bg" :predefine="colors"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Crosshair">
            <el-color-picker v-model="grid.crosshair" :predefine="colors"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Lines">
            <el-color-picker v-model="grid.lines" :predefine="colors"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="Show Circles">
            <el-switch v-model="grid.circles"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label-width="auto" label="Grid Spacing (pixels)">
            <el-input-number v-model="grid.size" :step="5" :min="1" size="mini" controls-position="right"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      </div>

</template>

<script>
  export default {
    props: {
      grid: Object,
      colors: Array
    }
  }
</script>

<style scoped>
  
</style>
