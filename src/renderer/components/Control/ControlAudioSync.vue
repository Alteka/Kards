<template>
  <el-row>
      <el-form-item label="Play" label-width="80">
        <el-switch v-model="audioSync.play"></el-switch>
      </el-form-item>
  </el-row>
</template>

<script>
  export default {
    props: {
      audioSync: Object
    }
  }
</script>

<style scoped>
  
</style>
