<template>

  <el-row>
        <el-col :span="8">
          <el-form-item label="Overlay Details">
            <el-switch active-color="#7BB144" v-model="bars.overlay"></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="Bar Level">
            <el-radio-group fill="#7BB144" v-model="bars.level" size="mini">
              <el-radio-button label="75" />
              <el-radio-button label="100" />
              <el-radio-button label="109" />
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

</template>

<script>
  export default {
    props: {
      bars: Object
    }
  }
</script>

<style scoped>
  
</style>
