<template>
  <el-row>
    <el-col :span="24">
      <el-form-item label="Overlay Details">
        <el-switch v-model="smpte.overlay"></el-switch>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    props: {
      smpte: Object
    }
  }
</script>

<style scoped>
  
</style>
