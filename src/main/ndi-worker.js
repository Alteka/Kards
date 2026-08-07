/**
 * NDI worker: runs as an Electron utilityProcess (pure Node.js, no Chromium renderer)
 * so that the grandiose native addon does not crash Electron's main or renderer processes
 * on macOS. Communicates with the main process via parentPort messages.
 */
'use strict'

let grandiose = null
let sender = null
let frameCount = 0
let errorCount = 0

try {
  grandiose = require('grandiose')
} catch (e) {
  process.parentPort.postMessage({ type: 'ndi-error', message: 'grandiose not loaded: ' + e.message })
}

if (grandiose && typeof grandiose.send === 'function') {
  process.parentPort.postMessage({ type: 'ndi-worker-ready' })
} else if (grandiose) {
  process.parentPort.postMessage({ type: 'ndi-error', message: 'grandiose.send not available' })
}

process.parentPort.on('message', async ({ data }) => {
  if (!data || !data.type) return

  if (data.type === 'ndi-start') {
    if (sender) return
    try {
      if (typeof grandiose.initialize === 'function' && grandiose.isSupportedCPU()) {
        grandiose.initialize()
      }
      const result = grandiose.send({
        name: data.name,
        clockVideo: false,
        clockAudio: false
      })
      if (result && typeof result.then === 'function') {
        sender = await result
      } else {
        sender = result
      }
      process.parentPort.postMessage({ type: 'ndi-ready' })
    } catch (err) {
      process.parentPort.postMessage({ type: 'ndi-error', message: err && err.message ? err.message : String(err) })
    }
  }

  if (data.type === 'ndi-frame') {
    if (!sender || !data.frame) return
    const frame = data.frame

    // utilityProcess structured clone converts Buffer to Uint8Array; convert back
    if (frame.data && !Buffer.isBuffer(frame.data)) {
      frame.data = Buffer.from(frame.data)
    }

    try {
      const result = sender.video(frame)
      if (result && typeof result.then === 'function') {
        result.then(() => {
          frameCount++
          if (frameCount === 1 || frameCount % 250 === 0) {
            process.parentPort.postMessage({ type: 'ndi-debug', message: 'frames sent: ' + frameCount })
          }
        }).catch((err) => {
          errorCount++
          if (errorCount <= 5) {
            process.parentPort.postMessage({ type: 'ndi-debug', message: 'video send error: ' + (err && err.message ? err.message : String(err)) })
          }
        })
      } else {
        frameCount++
      }
    } catch (e) {
      errorCount++
      if (errorCount <= 5) {
        process.parentPort.postMessage({ type: 'ndi-debug', message: 'video send exception: ' + (e && e.message ? e.message : String(e)) })
      }
    }
  }

  if (data.type === 'ndi-stop') {
    if (sender) {
      try {
        if (typeof sender.destroy === 'function') {
          const d = sender.destroy()
          if (d && typeof d.catch === 'function') await d.catch(() => {})
        }
      } catch (e) { /* ignore */ }
    }
    sender = null
    frameCount = 0
    errorCount = 0
  }
})
