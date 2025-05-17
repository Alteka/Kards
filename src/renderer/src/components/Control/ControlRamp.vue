<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-form-item label="Stepped">
          <el-switch v-model="ramp.stepped"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Double">
          <el-switch v-model="ramp.double"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Reverse">
          <el-switch v-model="ramp.reverse"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="18">
        <el-form-item label="Direction">
          <el-radio-group v-model="ramp.direction" size="small">
            <el-radio-button value="Horizontal" />
            <el-radio-button value="Vertical" />
            <el-radio-button value="Diagonal" />
            <el-radio-button value="Radial" />
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item
          v-if="ramp.stepped && (ramp.direction == 'Horizontal' || ramp.direction == 'Vertical')"
          label="Overlay"
          label-width="80"
        >
          <el-switch v-model="ramp.overlay"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const ramp = defineModel({ type: Object })
</script>
