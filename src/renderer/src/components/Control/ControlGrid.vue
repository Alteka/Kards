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
      <el-col :span="8">
        <el-form-item label="Show Circles">
          <el-switch v-model="grid.circles"></el-switch>
        </el-form-item>
      </el-col>
      <el-col :span="3"></el-col>
      <el-col :span="12">
        <el-form-item label-width="auto" label="Grid Spacing (pixels)">
          <el-input-number
            v-model="grid.size"
            :step="5"
            :min="1"
            size="small"
            controls-position="right"
          ></el-input-number>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { Grid } from '@renderer/config'

defineProps<{
  colors: string[]
}>()

const grid = defineModel<Grid>({ required: true })
</script>
