<template>
  <div>
    <svg
      :view-box.camel="viewBox"
      style="width: 90%; margin-left: 5%; margin-top: 10px; height: 125px"
    >
      <g v-for="scr in screens" :key="scr.id" @click="selectScreen(scr.id)">
        <rect
          :x="scr.bounds.x"
          :y="scr.bounds.y"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          fill="#555"
          style="stroke-width: 25; stroke: #3d3d3d"
        />
        <rect
          v-if="config.screen == scr.id"
          :x="scr.bounds.x"
          :y="scr.bounds.y"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          fill="#6ab42f"
          style="stroke-width: 25; stroke: #3d3d3d"
        />

        <text
          v-if="!scr.portrait"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height / 1.4"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          font-family="Verdana"
          :font-size="scr.bounds.height / 5"
          text-anchor="middle"
          fill="white"
        >
          {{ scr.description }}
        </text>
        <text
          v-if="!scr.portrait"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height / 1.1"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          font-family="Verdana"
          :font-size="scr.bounds.height / 8"
          text-anchor="middle"
          fill="white"
        >
          {{ scr.displayFrequency }}Hz
        </text>
        <text
          v-if="scr.portrait"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height / 1.55"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          font-family="Verdana"
          :font-size="scr.bounds.width / 4"
          text-anchor="middle"
          fill="white"
        >
          {{ scr.bounds.width }}
        </text>
        <text
          v-if="scr.portrait"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height / 1.31"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          font-family="Verdana"
          :font-size="scr.bounds.width / 4"
          text-anchor="middle"
          fill="white"
        >
          x
        </text>
        <text
          v-if="scr.portrait"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height / 1.1"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          font-family="Verdana"
          :font-size="scr.bounds.width / 4"
          text-anchor="middle"
          fill="white"
        >
          {{ scr.bounds.height }}
        </text>

        <text
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height * 0.4 - scr.bounds.height * 0.05 * scr.portrait"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          text-anchor="middle"
          fill="white"
          :font-size="scr.bounds.height / 3"
          class="fa"
        >
          {{ scr.icon }}
        </text>
        <text
          v-if="config.screen == scr.id && config.visible && scr.primary"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height * 0.32 - scr.bounds.height * 0.05 * scr.portrait"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          text-anchor="middle"
          fill="white"
          :font-size="scr.bounds.height / 6"
          class="fa"
        >
          {{ '\uf00c' }}
        </text>
        <text
          v-if="config.screen == scr.id && config.visible && !scr.primary"
          :x="scr.bounds.x + scr.bounds.width / 2"
          :y="scr.bounds.y + scr.bounds.height * 0.28 - scr.bounds.height * 0.05 * scr.portrait"
          :width="scr.bounds.width"
          :height="scr.bounds.height"
          text-anchor="middle"
          fill="white"
          :font-size="scr.bounds.height / 6"
          class="fa"
        >
          {{ '\uf00c' }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { Config } from '@shared/config'

const config = defineModel<Config>()

const screens = ref([])
const primaryScreen = ref(null)
const viewBox = ref('0 0 0 0')

onMounted(() => {
  window.ipcRenderer.receive('screens', function (data) {
    screens.value = data.all
    primaryScreen.value = data.primary

    updateScreens()
  })
  window.ipcRenderer.send('getScreens')
})

function updateScreens() {
  let left = 0
  let right = 0
  let top = 0
  let bottom = 0

  for (const scr of screens.value) {
    if (scr.bounds.x < left) {
      left = scr.bounds.x
    }
    if (scr.bounds.y < top) {
      top = scr.bounds.y
    }

    if (scr.bounds.x + scr.bounds.width > right) {
      right = scr.bounds.x + scr.bounds.width
    }

    if (scr.bounds.y + scr.bounds.height > bottom) {
      bottom = scr.bounds.y + scr.bounds.height
    }
    scr.portrait = scr.bounds.width < scr.bounds.height ? true : false
    scr.description = scr.size.width + ' x ' + scr.size.height

    if (scr.internal || scr.id == primaryScreen.value) {
      scr.icon = '\uf109'
      scr.primary = true
    } else {
      scr.icon = '\uf108'
      scr.primary = false
    }
  }

  viewBox.value =
    left -
    25 +
    ' ' +
    (top - 25) +
    ' ' +
    (Math.abs(right - left) + 50) +
    ' ' +
    (Math.abs(bottom - top) + 50)
  setOutputToMatchScreen()
}

function selectScreen(id) {
  if (config.value.windowed && config.value.visible && config.value.screen != id) {
    window.ipcRenderer.send('moveWindowTo', id)
  }
  config.value.screen = id
}

function setOutputToMatchScreen() {
  if (!config.value.windowed && config.value.fullsize) {
    for (const scr of screens.value) {
      if (scr.id == config.value.screen) {
        config.value.notFilledCard.top = 0
        config.value.notFilledCard.left = 0
        config.value.notFilledCard.width = scr.size.width
        config.value.notFilledCard.height = scr.size.height
      }
    }
  }
  let exists = false
  for (const scr of screens.value) {
    if (scr.id == config.value.screen) {
      exists = true
    }
  }
  if (!exists) {
    console.log('Update screen as selected screen doesnt exist...', primaryScreen.value)
    config.value.screen = primaryScreen.value
  }
}

watch(config, setOutputToMatchScreen, { deep: true })
</script>
