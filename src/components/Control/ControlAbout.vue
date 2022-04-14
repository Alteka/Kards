<template>
  <el-dialog v-model="showAboutDialog" title="About Kards" width="85%" center>
  

    <el-alert show-icon center :closable="false" title="About box" type="warning" effect="dark"> </el-alert>

    
  </el-dialog>
</template>

<script>
  export default {
    props: {
      modelValue: Boolean, // v-model object
      config: Object
    },
    data: function() {
      return {
      }
    },
    computed: {
      showAboutDialog: {
        get() {
          return this.modelValue // return v-model
        },
        set(value) {
          this.$emit('update:modelValue', value) // update the v-model object to parent component
        }
      },
      
    },
    methods: {
    }
  }
</script>

<style scoped>

</style>
