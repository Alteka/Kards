<template>

<div>
      <el-row>
        <el-col :span="18">
          <el-form-item label="Direction" label-width="80">
            <el-radio-group v-model="ramp.direction" size="mini">
              <el-radio-button label="Horizontal" />
              <el-radio-button label="Vertical" />
              <el-radio-button label="Diagonal" />
              <el-radio-button label="Radial" />
            </el-radio-group>
          </el-form-item>
        </el-col>
         <el-col :span="6">
          <el-form-item v-if="ramp.stepped && (ramp.direction == 'Horizontal' || ramp.direction == 'Vertical')" label="Overlay" label-width="80">
            <el-switch v-model="ramp.overlay"></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="9">
          <el-form-item label="Stepped" label-width="80">
            <el-switch v-model="ramp.stepped"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item label="Double" label-width="80">
            <el-switch v-model="ramp.double"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Reverse" label-width="80">
            <el-switch v-model="ramp.reverse"></el-switch>
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
