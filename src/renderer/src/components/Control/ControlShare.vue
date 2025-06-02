<template>
  <el-dialog v-model="showShareDialog" title="Share Kards Online Link" width="85%">
    <el-form
      v-if="supportedCards.includes(config.cardType)"
      style="text-align: center"
      label-width="125px"
    >
      <el-row>
        <el-col :span="24" style="margin-bottom: 16px">
          Hide controls on load
          <el-switch v-model="hideControls" style="padding-left: 5px"></el-switch>
          <div style="margin-top: 10px">(Useful for loading into vMix or OBS)</div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="Full URL">
            <el-input v-model="shareLink" placeholder="">
              <template #append>
                <el-button icon="el-icon-document-copy" @click="copyUrl(shareLink)"></el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24" style="text-align: left">
          <el-form-item label="Simplified URL">
            <el-input v-model="shareLinkMinimal" placeholder="">
              <template #append>
                <el-button
                  icon="el-icon-document-copy"
                  @click="copyUrl(shareLinkMinimal)"
                ></el-button>
              </template>
            </el-input>
            <br />
            (Only has configuration for the currently selected card)
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-alert
      v-else
      show-icon
      center
      :closable="false"
      title="The selected card is not yet supported by Kards Online"
      type="warning"
      effect="dark"
    >
    </el-alert>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="showShareDialog = false">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Config } from '@shared/config'

const showShareDialog = defineModel<boolean>()

const props = defineProps<{ config: Config }>()

const hideControls = ref(true)
const supportedCards = ['alteka', 'bars', 'grid', 'ramp', 'placeholder', 'audioSync']

const shareLink = computed(() => {
  let c = JSON.parse(JSON.stringify(props.config)) // I know... so lazy right?
  delete c.predefineColors
  delete c.visible
  delete c.showClock
  delete c.windowed
  delete c.fullsize
  delete c.audioSync.device
  delete c.export
  delete c.notFilledCard
  delete c.window
  delete c.audio
  delete c.alteka.logo
  delete c.alteka.showLogo

  delete c['']
  c.controlVisible = !hideControls.value
  return 'https://kards.alteka.solutions/?' + encode(c)
})

const shareLinkMinimal = computed(() => {
  let c = JSON.parse(JSON.stringify(props.config)) // I know... still so lazy right?
  delete c.predefineColors
  delete c.visible
  delete c.showClock
  delete c.windowed
  delete c.fullsize
  delete c.audioSync.device
  delete c.export
  delete c.notFilledCard
  delete c.window
  delete c.audio
  delete c.alteka.logo
  delete c.alteka.showLogo

  delete c['']

  if (c.cardType == 'alteka') {
    delete c.bars
    delete c.grid
    delete c.audioSync
    delete c.ramp
    delete c.placeholder
    delete c.led
    delete c.deghost
  } else if (c.cardType == 'bars') {
    delete c.alteka
    delete c.grid
    delete c.audioSync
    delete c.ramp
    delete c.placeholder
    delete c.led
    delete c.deghost
  } else if (c.cardType == 'grid') {
    delete c.alteka
    delete c.bars
    delete c.audioSync
    delete c.ramp
    delete c.placeholder
    delete c.led
    delete c.deghost
  } else if (c.cardType == 'audioSync') {
    delete c.alteka
    delete c.grid
    delete c.bars
    delete c.ramp
    delete c.placeholder
    delete c.led
    delete c.deghost
  } else if (c.cardType == 'ramp') {
    delete c.alteka
    delete c.grid
    delete c.audioSync
    delete c.bars
    delete c.placeholder
    delete c.led
    delete c.deghost
  } else if (c.cardType == 'placeholder') {
    delete c.alteka
    delete c.grid
    delete c.audioSync
    delete c.ramp
    delete c.bars
    delete c.led
    delete c.deghost
  } else if (c.cardType == 'deghost') {
    delete c.alteka
    delete c.grid
    delete c.audioSync
    delete c.ramp
    delete c.bars
    delete c.led
    delete c.placeholder
  } else if (c.cardType == 'led') {
    delete c.alteka
    delete c.grid
    delete c.audioSync
    delete c.ramp
    delete c.bars
    delete c.placeholder
    delete c.deghost
  }

  c.controlVisible = !hideControls.value
  return 'https://kards.alteka.solutions/?' + this.encode(c)
})

function encode(queryObj, nesting = '') {
  // this is heavily based on Nick Drane's work here: https://nickdrane.com/build-your-own-nested-query-string-encoder/
  const pairs = Object.entries(queryObj).map(([key, val]) => {
    // Handle the nested, recursive case, where the value to encode is an object itself
    if (typeof val === 'object') {
      return encode(val, nesting + `${key}.`)
    } else {
      // Handle base case, where the value to encode is simply a string.
      return [nesting + key, val].map(escape).join('=')
    }
  })
  return pairs.join('&')
}

function copyUrl(value) {
  const el = document.createElement('textarea')
  el.value = value
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  const selected =
    document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}
</script>
