<template>
  <div>
   Grid.
  </div>
</template>

<script>
  export default {
    data () {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
        node: process.versions.node,
        path: this.$route.path,
        platform: require('os').platform(),
        vue: require('vue/package.json').version
      }
    },
    props: {
      config: Object
    }
  }
</script>

<style scoped>
  
</style>
