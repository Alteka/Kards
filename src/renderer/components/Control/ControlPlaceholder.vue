<template>

<div> 
   <el-row>
        <el-col :span="8">
          <el-form-item label="Background">
            <el-color-picker v-model="placeholder.bg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Foreground">
            <el-color-picker v-model="placeholder.fg"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Gradient">
            <el-switch active-color="#7BB144" v-model="placeholder.gradient"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="Name">
            <el-input v-model="placeholder.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Icon">
            <el-input v-model="placeholder.icon"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      </div>
</template>

<script>
  export default {
    props: {
      placeholder: Object
    }
  }
</script>

<style scoped>
  
</style>
