<template>
  <el-dialog title="Alteka Kards" width="85%" center>
    <el-row style="height: 50px;">
      <el-col :span="24" style="text-align: center;">
        <img src="../../assets/Logo_Dark.png" alt="Logo" height="75px" />
      </el-col>
    </el-row>
    <el-row style="height: 50px;">
      <el-col :span="24" style="text-align: center;">
        Better test cards for the AV Professional.<br />
        Made in the UK by people who actually use it.
      </el-col>
    </el-row>
    
    <el-row style="height: 75px;">
      <el-col :span="24" style="text-align: center;">
        We're proud to release Kards as free and open source software.<br />
        To help us keep it this way, and to support more features and platforms, we'd<br />
        really appreciate any donation you're able to give.<font-awesome-icon icon="fa-solid fa-hand-holding-heart" />
      </el-col>
    </el-row>
    <el-row style="height: 50px;">
      <el-col :span="24" style="text-align: center;">
        <el-button @click="openDonate" type="primary">Donate <i class="fa-solid fa-hand-holding-heart"></i></el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="Version">{{info.version}}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Electron">{{info.electron}}</el-form-item>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-form-item label="Node">{{info.node}}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Vue">{{info.vue}}</el-form-item>
      </el-col>
    </el-row>
    <el-row style="height: 50px;">
      <el-col :span="8" style="text-align: center;">
        <el-link type="primary" @click="openSite">Website</el-link>
      </el-col>
      <el-col :span="8" style="text-align: center;">
        <el-link type="primary" @click="openHelp">Help</el-link>
      </el-col>
      <el-col :span="8" style="text-align: center;">
        <el-link type="primary" @click="openGitHub">GitHub</el-link>
      </el-col>
    </el-row>
  


    
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
    },
    methods: {
      openSite: function() {
        window.ipcRenderer.send('openUrl', 'https://alteka.solutions/kards/')
      },
      openHelp: function() {
        window.ipcRenderer.send('openUrl', 'https://alteka.solutions/kards/help')
      },
      openGitHub: function() {
        window.ipcRenderer.send('openUrl', 'https://github.com/Alteka/Kards')
      },
      openDonate: function() {
        window.ipcRenderer.send('openUrl', 'https://alteka.solutions/donate/p/kards')
      }
    }
  }
</script>

<style scoped>
.el-row {
  height: 25px;
}
</style>
