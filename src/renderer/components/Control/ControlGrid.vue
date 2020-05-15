<template>
<div>
 <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="grid.bg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Crosshair">
            <el-color-picker v-model="grid.crosshair"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Lines">
            <el-color-picker v-model="grid.lines"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="16">
          <el-form-item label="Size (pixels)">
            <el-input-number v-model="grid.size" :step="5" size="mini" controls-position="right"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      </div>

</template>

<script>
  export default {
    props: {
      grid: Object
    }
  }
</script>

<style scoped>
  
</style>
