<template>
  <el-dialog title="Alteka Kards" width="85%" center top="10vh">
    
    <img v-if="darkMode" src="../../assets/Logo_Dark.png" alt="Logo" />
    <img v-else src="../../assets/Logo_Standard.png" alt="Logo" />

    <el-row style="padding-bottom: 20px;">
      <el-col :span="24">
        Better test cards for the AV Professional.<br />
        Made in the UK by people who actually use it.<br />
        <br />
        We're proud to release Kards as free and open source software.<br />
        To help us keep it this way, and to support more features and platforms, we'd<br />
        really appreciate any donation you're able to give.<br />
        <br />
        <el-button @click="openDonate" type="primary">
          <i class="fa-solid fa-hand-holding-heart"></i> Donate
        </el-button>
      </el-col>
    </el-row>

    <el-row class="version">
      <el-col :span="12">
        <el-form-item label="Version">{{info.version}}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Electron">{{info.electron}}</el-form-item>
      </el-col>
    </el-row>
    <el-row class="version">
      <el-col :span="12">
        <el-form-item label="Node">{{info.node}}</el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Vue">{{info.vue}}</el-form-item>
      </el-col>
    </el-row>

    <el-row style="padding-top: 20px;">
      <el-col :span="8" style="text-align: center;">
        <el-button size="small" @click="openSite">
          <i class="fa-solid fa-globe green"></i> Website
        </el-button>
      </el-col>
      <el-col :span="8" style="text-align: center;">
        <el-button size="small" @click="openHelp">
          <i class="fa-solid fa-circle-question green"></i> Help
        </el-button>
      </el-col>
      <el-col :span="8" style="text-align: center;">
        <el-button size="small" @click="openGitHub">
          <i class="fa-brands fa-github green"></i> GitHub
        </el-button>
      </el-col>
    </el-row>

  </el-dialog>
</template>

<script>

  export default {
    props: {
      darkMode: Boolean
    },
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
        window.ipcRenderer.send('openUrl', 'https://alteka.solutions/donateKards')
      }
    }
  }
</script>

<style scoped>
.el-row {
  text-align: center;
  top: -25px;
}
img {
  height: 75px;
  margin: auto;
  width: 100%;
  object-fit: contain;
  position: relative;
  top: -25px;
}

.version {
  width: 75%;
  left: 6.66%;
  height: 25px;
}
</style>
