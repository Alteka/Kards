<template>
  <el-menu
  :default-active="activeIndex2"
  class="el-menu"
  mode="horizontal"
  background-color="#545c64"
  text-color="#fff"
  active-text-color="#7BB144">
 
  <el-menu-item>Enabled <el-switch active-color="#7BB144" v-model="config.visible"></el-switch></el-menu-item>

<el-submenu index="2">
    <template slot="title"><i class="fas fa-volume-up"></i> Sound</template>
    <el-menu-item index="2-1">item one</el-menu-item>
    <el-menu-item index="2-2">item two</el-menu-item>
    <el-menu-item index="2-3">item three</el-menu-item>
    <el-submenu index="2-4">
      <template slot="title">item four</template>
      <el-menu-item index="2-4-1">item one</el-menu-item>
      <el-menu-item index="2-4-2">item two</el-menu-item>
      <el-menu-item index="2-4-3">item three</el-menu-item>
    </el-submenu>
  </el-submenu>

  <el-menu-item v-on:click="resetDefault"><i class="fas fa-undo"></i> Reset</el-menu-item>
</el-menu>
</template>

<script>
  export default {
    props: {
      config: Object
    }
  }
</script>

<style scoped>
  .el-menu {
    margin-bottom: 8px;
  }
</style>
