'use strict'

/**
 * NDI output: renders the test card in a hidden window and sends video frames via NDI.
 * The NDI sender runs in a utilityProcess (pure Node.js child, no Chromium renderer)
 * so the grandiose native addon does not crash the Electron main or renderer processes
 * on macOS.
 */

const { hostname } = require('os')
const { pathToFileURL } = require('url')
const path = require('path')

const NDI_FPS = 25
const NDI_FRAME_INTERVAL_MS = 1000 / NDI_FPS
const FOURCC_BGRA = 1095911234
const FORMAT_TYPE_PROGRESSIVE = 1

function getTestCardUrl(devServerUrl, distPath) {
  if (devServerUrl) {
    return devServerUrl + '#/testcard'
  }
  const fileUrl = pathToFileURL(path.join(distPath, 'index.html')).href
  return fileUrl + '#/testcard'
}

function initNdi(state, deps) {
  const { app, BrowserWindow, getConfig, path: pathModule, log } = deps
  const { utilityProcess } = require('electron')
  const preloadPath = pathModule.join(__dirname, '..', 'preload.js')
  const distPath = pathModule.join(__dirname, '..', '..', 'dist')
  const workerScript = pathModule.join(__dirname, 'ndi-worker.js')
  const devServerUrl = process.env.VITE_DEV_SERVER_URL

  let ndiWorker = null
  let ndiWindow = null
  let workerReady = false
  let captureInterval = null
  let ndiStopping = false
  const senderName = 'Kards - ' + hostname().split('.')[0]

  function sendToWorker(msg) {
    if (ndiStopping || !ndiWorker) return false
    try {
      ndiWorker.postMessage(msg)
      return true
    } catch (err) {
      if (!ndiStopping) log.warn('NDI worker send failed:', err && err.message ? err.message : err)
      return false
    }
  }

  function getDimensions(config) {
    if (!config || !config.window) return { width: 1920, height: 1080 }
    const w = Math.max(1, parseInt(config.window.width, 10) || 1920)
    const h = Math.max(1, parseInt(config.window.height, 10) || 1080)
    return { width: w, height: h }
  }

  function ensureCaptureWindow() {
    const config = getConfig()
    if (!config) return null
    const { width, height } = getDimensions(config)

    if (ndiWindow && !ndiWindow.isDestroyed()) {
      const [curW, curH] = ndiWindow.getContentSize()
      if (curW !== width || curH !== height) {
        ndiWindow.setContentSize(width, height)
      }
      return ndiWindow
    }

    ndiWindow = new BrowserWindow({
      show: false,
      width,
      height,
      webPreferences: {
        preload: preloadPath,
        offscreen: false
      }
    })

    // Ensure the hidden NDI capture window never plays audible audio
    try {
      ndiWindow.webContents.setAudioMuted(true)
    } catch (_) {
      // ignore if not supported
    }

    const testCardUrl = getTestCardUrl(devServerUrl, distPath)
    ndiWindow.loadURL(testCardUrl)

    ndiWindow.webContents.once('did-finish-load', () => {
      const c = getConfig()
      if (c && ndiWindow && !ndiWindow.isDestroyed()) {
        const configForNdi = { ...c, _captureOnly: true }
        ndiWindow.webContents.send('config', configForNdi)
      }
    })

    ndiWindow.on('closed', () => {
      ndiWindow = null
    })

    return ndiWindow
  }

  function sendConfigToCaptureWindow(config) {
    if (ndiWindow && !ndiWindow.isDestroyed() && config) {
      const configForNdi = { ...config, _captureOnly: true }
      ndiWindow.webContents.send('config', configForNdi)
    }
  }

  function captureAndSend() {
    const config = getConfig()
    if (!config) return
    const { width, height } = getDimensions(config)
    if (ndiStopping || !ndiWindow || ndiWindow.isDestroyed() || !ndiWorker || !workerReady) return

    ndiWindow.webContents
      .capturePage({ x: 0, y: 0, width, height })
      .then((nativeImage) => {
        if (ndiStopping || !workerReady || !ndiWorker) return
        const bitmap = nativeImage.toBitmap()
        const size = nativeImage.getSize()
        const w = size.width
        const h = size.height
        if (w < 1 || h < 1) return
        const frame = {
          xres: w,
          yres: h,
          frameRateN: NDI_FPS,
          frameRateD: 1,
          fourCC: FOURCC_BGRA,
          pictureAspectRatio: w / h,
          frameFormatType: FORMAT_TYPE_PROGRESSIVE,
          lineStrideBytes: w * 4,
          data: bitmap
        }
        sendToWorker({ type: 'ndi-frame', frame })
      })
      .catch((err) => {
        if (!ndiStopping) log.warn('NDI capture error:', err && err.message ? err.message : err)
      })
  }

  function startCaptureLoop() {
    if (captureInterval) return
    captureInterval = setInterval(captureAndSend, NDI_FRAME_INTERVAL_MS)
    log.info('NDI: capture loop started')
  }

  function stopCaptureLoop() {
    if (captureInterval) {
      clearInterval(captureInterval)
      captureInterval = null
      log.info('NDI: capture loop stopped')
    }
  }

  function start() {
    if (workerReady && ndiWorker) return
    ndiStopping = false

    ndiWorker = utilityProcess.fork(workerScript)

    ndiWorker.on('message', (msg) => {
      if (!msg || !msg.type) return
      if (msg.type === 'ndi-worker-ready') {
        // Worker has loaded grandiose and is ready to receive commands
        sendToWorker({ type: 'ndi-start', name: senderName })
      } else if (msg.type === 'ndi-ready') {
        workerReady = true
        ensureCaptureWindow()
        startCaptureLoop()
        log.info('NDI: sender started as "' + senderName + '"')
      } else if (msg.type === 'ndi-error') {
        log.error('NDI: worker error:', msg.message)
        workerReady = false
      } else if (msg.type === 'ndi-debug') {
        log.info('NDI worker:', msg.message)
      }
    })

    ndiWorker.on('exit', (code) => {
      log.info('NDI: worker exited with code', code)
      workerReady = false
      ndiWorker = null
      stopCaptureLoop()
    })
  }

  function stop() {
    ndiStopping = true
    stopCaptureLoop()
    workerReady = false
    if (ndiWorker) {
      sendToWorker({ type: 'ndi-stop' })
      const w = ndiWorker
      ndiWorker = null
      setTimeout(() => {
        try { w.kill() } catch (e) { /* already exited */ }
        ndiStopping = false
      }, 200)
    } else {
      ndiStopping = false
    }
    if (ndiWindow && !ndiWindow.isDestroyed()) {
      ndiWindow.close()
      ndiWindow = null
    }
    log.info('NDI: stopped')
  }

  function updateConfig(config) {
    if (!config) return
    const { width, height } = getDimensions(config)
    sendConfigToCaptureWindow(config)
    if (ndiWindow && !ndiWindow.isDestroyed()) {
      const [curW, curH] = ndiWindow.getContentSize()
      if (curW !== width || curH !== height) {
        ndiWindow.setContentSize(width, height)
      }
    }
  }

  function getStatus() {
    const config = getConfig()
    const dims = config ? getDimensions(config) : { width: 0, height: 0 }
    return {
      available: true,
      active: workerReady && !!ndiWorker,
      senderName: workerReady ? senderName : null,
      width: dims.width,
      height: dims.height
    }
  }

  state.ndi = { start, stop, updateConfig, getStatus }
  return { start, stop, updateConfig, getStatus }
}

module.exports = { initNdi }
