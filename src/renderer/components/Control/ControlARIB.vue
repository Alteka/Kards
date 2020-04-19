<template>
  <el-row>
    <el-col :span="24">
      <el-form-item label="Overlay Details">
        <el-switch active-color="#7BB144" v-model="arib.overlay"></el-switch>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    props: {
      arib: Object
    }
  }
</script>

<style scoped>
  
</style>
