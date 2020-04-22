<template>

<div>
      <el-row>
        <el-col :span="18">
          <el-form-item label="Direction">
            <el-radio-group fill="#7BB144" v-model="ramp.direction" size="mini">
              <el-radio-button label="Horizontal" />
              <el-radio-button label="Vertical" />
              <el-radio-button label="Diagonal" />
              <el-radio-button label="Radial" />
            </el-radio-group>
          </el-form-item>
        </el-col>
         <el-col :span="6">
          <el-form-item label="Overlay">
            <el-switch active-color="#7BB144" v-model="ramp.overlay"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="Stepped">
            <el-switch active-color="#7BB144" v-model="ramp.stepped"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Double">
            <el-switch active-color="#7BB144" v-model="ramp.double"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Reverse">
            <el-switch active-color="#7BB144" v-model="ramp.reverse"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      </div>
</template>

<script>
  export default {
    props: {
      ramp: Object
    }
  }
</script>

<style scoped>
  
</style>
