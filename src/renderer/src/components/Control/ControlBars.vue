<template>
  <div>
    <el-row>
      <el-col :span="18">
        <el-form-item label="Bars Style" label-width="90px">
          <el-radio-group v-model="bars.type" size="small">
            <el-radio-button value="simple">Simple</el-radio-button>
            <el-radio-button value="smpte">SMPTE</el-radio-button>
            <el-radio-button value="arib">ARIB</el-radio-button>
            <el-radio-button value="hdr">HDR</el-radio-button>
            <el-radio-button value="sdi">SDI</el-radio-button>
            <el-radio-button value="single">Single</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="5">
        <el-form-item label="Details" label-width="90px">
          <el-switch v-model="bars.overlay"></el-switch>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row>
      <el-col v-if="bars.type === 'simple'" :span="12">
        <el-form-item label="Level" label-width="90px">
          <el-radio-group v-model="bars.level" size="small">
            <el-radio-button value="75" />
            <el-radio-button value="100" />
            <el-radio-button value="109" />
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col v-if="bars.type === 'single'" :span="10">
        <el-form-item label="Color" label-width="90px">
          <!-- Solid R/B/G/C/M/Y/ White 100%/ White 109/Black 0/black - -->
          <el-select v-model="bars.color" placeholder="Color" size="small">
            <el-option
              v-for="color in simpleColors"
              :key="color"
              :label="color"
              :value="color"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col v-if="bars.type === 'single' && bars.color !== 'Black'" :span="14">
        <el-form-item label="Level" label-width="90px">
          <el-radio-group v-model="bars.level" size="small">
            <el-radio-button value="-9" />
            <el-radio-button value="0" />
            <el-radio-button value="75" />
            <el-radio-button value="100" />
            <el-radio-button value="109" />
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import type { Bars } from '@renderer/config'

const simpleColors = ['Red', 'Green', 'Blue', 'Cyan', 'Magenta', 'Yellow', 'White']

const bars = defineModel<Bars>()
</script>
