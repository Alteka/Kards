<template>
  <div>
    <el-row>
      <el-col :span="18">
      <el-form-item label="Bars Style" label-width="90px">
        <el-radio-group v-model="bars.type" size="mini">
          <el-radio-button label="simple">Simple</el-radio-button>
          <el-radio-button label="smpte">SMPTE</el-radio-button>
          <el-radio-button label="arib">ARIB</el-radio-button>
          <el-radio-button label="hdr">HDR</el-radio-button>
          <el-radio-button label="sdi">SDI</el-radio-button>
          <el-radio-button label="single">Single</el-radio-button>
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
      <el-col :span="12" v-if="bars.type=='simple'">
        <el-form-item label="Level" label-width="90px">
          <el-radio-group v-model="bars.level" size="mini">
            <el-radio-button label="75" />
            <el-radio-button label="100" />
            <el-radio-button label="109" />
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="10" v-if="bars.type=='single'">
        <el-form-item label="Color" label-width="90px">
          <!-- Solid R/B/G/C/M/Y/ White 100%/ White 109/Black 0/black - -->
          <el-select v-model="bars.color" placeholder="Color" size="small" >
            <el-option v-for="color in simpleColors" :key="color" :label="color" :value="color"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="14" v-if="bars.type=='single' && bars.color!='Black'">
        <el-form-item label="Level" label-width="90px">
          <el-radio-group v-model="bars.level" size="mini">
            <el-radio-button label="-9" />
            <el-radio-button label="0" />
            <el-radio-button label="75" />
            <el-radio-button label="100" />
            <el-radio-button label="109" />
          </el-radio-group>
        </el-form-item>
      </el-col>      
    </el-row>

  </div>
</template>

<script>
  export default {
    props: {
      modelValue: Object
    },
    computed: {
      bars: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
    },
    data: function() {
      return {
        simpleColors: ["Red", "Green", "Blue", "Cyan", "Magenta", "Yellow", "White"]
      }
    }
  }
</script>

<style scoped>
  
</style>
