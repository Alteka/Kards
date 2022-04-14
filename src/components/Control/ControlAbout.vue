<template>
  <el-dialog title="About Kards" width="85%" center>
  

    <el-alert show-icon center :closable="false" title="About box" type="info" effect="dark"> 
    </el-alert>
     
{{info}}

    
  </el-dialog>
</template>

<script>
  export default {
    data: function() {
      return {
        info: {}
      }
    },
    mounted: function() {
      let vm = this
      window.ipcRenderer.receive('aboutDialogInfo', function(i) {
        vm.info = i
      })
      window.ipcRenderer.send('aboutDialogInfo')
    }
  }
</script>

<style scoped>

</style>
