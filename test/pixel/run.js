'use strict'

/**
 * Pixel harness — launches Electron, drives the capture matrix, samples specific
 * coordinates and compares them against baseline.json.
 *
 * This file is dual-mode. Run under Node it re-launches itself under Electron;
 * run under Electron it is the harness main process. That keeps the file layout
 * to the four files the specification asks for.
 *
 *   node test/pixel/run.js                 compare against the baseline
 *   node test/pixel/run.js --validate      the day-one acceptance test
 *   node test/pixel/run.js --record        write a fresh baseline
 *   node test/pixel/run.js --case <id>     restrict to one case (repeatable)
 *   node test/pixel/run.js --json          machine-readable report on stdout
 *
 * See README.md.
 */

const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..', '..')
const BASELINE_PATH = path.join(__dirname, 'baseline.json')
const DIST_INDEX = path.join(ROOT, 'dist', 'index.html')

const { BASE_OVERRIDES, CASES, VALIDATION_CASES } = require('./cards')

// Capture geometry and timing. Changing any of these invalidates the baseline.
const SETTLE_MS = 1400 // past Testcard.vue's 1 s re-measure timer
const RAF_TICKS = 3
const STABILITY_ATTEMPTS = 4 // captures compared pairwise before giving up
const UNIFORM_RADIUS = 4 // a sample point must sit in a flat 9x9 block

// ---------------------------------------------------------------------------
// argv
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { mode: 'compare', cases: [], json: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--validate') opts.mode = 'validate'
    else if (a === '--record') opts.mode = 'record'
    else if (a === '--json') opts.json = true
    else if (a === '--case') opts.cases.push(argv[++i])
  }
  return opts
}

// ---------------------------------------------------------------------------
// Node side: re-launch under Electron
// ---------------------------------------------------------------------------

if (!process.versions.electron) {
  const { spawnSync } = require('child_process')
  const electron = require('electron')

  if (!fs.existsSync(DIST_INDEX)) {
    console.error('pixel harness: dist/index.html not found. Run `npm run build` first.')
    process.exit(2)
  }

  const result = spawnSync(electron, [__filename, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env, ELECTRON_DISABLE_SECURITY_WARNINGS: '1' }
  })
  process.exit(result.status === null ? 1 : result.status)
}

// ---------------------------------------------------------------------------
// Electron side
// ---------------------------------------------------------------------------

const { app, BrowserWindow, ipcMain } = require('electron')
const { pathToFileURL } = require('url')

const opts = parseArgs(process.argv.slice(2))

// Deliberate: the harness measures what the app draws, isolated from display
// colour management and from display scaling. What the display then does with it
// is a separate question (plan task D7). Do not conflate them.
app.commandLine.appendSwitch('force-color-profile', 'srgb')
app.commandLine.appendSwitch('force-device-scale-factor', '1')
app.disableHardwareAcceleration()

/** Hides the transient element-plus toast and freezes transitions. Harness-only. */
const HARNESS_CSS = `
  .el-message, .modal { display: none !important; }
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    caret-color: transparent !important;
  }
`

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function mergeDeep(target, source) {
  const out = { ...target }
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    if (isPlainObject(source[key]) && isPlainObject(out[key])) {
      out[key] = mergeDeep(out[key], source[key])
    } else {
      out[key] = source[key]
    }
  }
  return out
}

function configFor(testCase) {
  const defaults = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'defaultConfig.json'), 'utf8'))
  let config = mergeDeep(defaults, BASE_OVERRIDES)
  config = mergeDeep(config, testCase.config)
  config.window = { width: testCase.size[0], height: testCase.size[1] }
  // Testcard.vue auto-exports via dom-to-image unless one of these is set.
  config._captureOnly = true
  return config
}

function testCardUrl() {
  return pathToFileURL(DIST_INDEX).href + '#/testcard'
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------

/** A captured frame, normalised to straight RGB lookups. */
class Frame {
  constructor(buffer, logicalWidth, logicalHeight) {
    this.buffer = buffer
    this.logicalWidth = logicalWidth
    this.logicalHeight = logicalHeight

    const expected = logicalWidth * logicalHeight * 4
    if (buffer.length === expected) {
      this.scale = 1
    } else {
      const ratio = Math.sqrt(buffer.length / expected)
      this.scale = Math.round(ratio * 100) / 100
      if (Math.abs(this.scale - Math.round(this.scale)) > 0.001) {
        throw new Error(
          `capture is ${buffer.length} bytes for a ${logicalWidth}x${logicalHeight} window ` +
            `(non-integer scale ${ratio}). Device scale factor is not being forced to 1.`
        )
      }
      this.scale = Math.round(this.scale)
    }
    this.pixelWidth = logicalWidth * this.scale
  }

  /** RGB at a logical coordinate. Returns null if out of bounds. */
  at(x, y) {
    const px = Math.round(x * this.scale)
    const py = Math.round(y * this.scale)
    const i = (py * this.pixelWidth + px) * 4
    if (i < 0 || i + 3 >= this.buffer.length) return null
    // capturePage gives BGRA
    return [this.buffer[i + 2], this.buffer[i + 1], this.buffer[i]]
  }

  /** True if every pixel in the (2r+1) square around x,y is identical. */
  isUniform(x, y, r) {
    const centre = this.at(x, y)
    if (!centre) return false
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const p = this.at(x + dx, y + dy)
        if (!p || p[0] !== centre[0] || p[1] !== centre[1] || p[2] !== centre[2]) return false
      }
    }
    return true
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function captureCase(testCase) {
  const [width, height] = testCase.size
  const config = configFor(testCase)

  const win = new BrowserWindow({
    show: false,
    width,
    height,
    useContentSize: true,
    webPreferences: {
      preload: path.join(ROOT, 'src', 'preload.js'),
      offscreen: false,
      backgroundThrottling: false
    }
  })

  try {
    win.webContents.setAudioMuted(true)

    const loaded = new Promise((resolve, reject) => {
      win.webContents.once('did-finish-load', resolve)
      win.webContents.once('did-fail-load', (_e, code, desc) => reject(new Error(`load failed ${code} ${desc}`)))
    })
    win.loadURL(testCardUrl())
    await loaded

    await win.webContents.insertCSS(HARNESS_CSS)
    win.webContents.send('config', config)

    // A render tick, then past the 1 s re-measure timer in Testcard.vue.
    await win.webContents.executeJavaScript(
      `new Promise(r => { let n = ${RAF_TICKS}; const tick = () => (--n <= 0 ? r(true) : requestAnimationFrame(tick)); requestAnimationFrame(tick) })`
    )
    await sleep(SETTLE_MS)

    // Two identical consecutive captures, or we do not trust the frame.
    let previous = null
    for (let attempt = 0; attempt < STABILITY_ATTEMPTS; attempt++) {
      const image = await win.webContents.capturePage({ x: 0, y: 0, width, height })
      const frame = new Frame(image.toBitmap(), width, height)
      if (previous && previous.buffer.equals(frame.buffer)) return { frame, settled: true }
      previous = frame
      await sleep(250)
    }
    // Animated cards never settle. Return the last frame and say so.
    return { frame: previous, settled: false }
  } finally {
    if (!win.isDestroyed()) win.destroy()
  }
}

// ---------------------------------------------------------------------------
// Sample point selection (--record)
// ---------------------------------------------------------------------------

/**
 * Candidate lattice. The 16ths across are deliberate: they land exactly on the
 * centres of the eight bars in the bars cards.
 */
function candidatePoints(width, height) {
  const points = []
  const ys = [Math.round(height / 6), Math.round(height / 2), Math.round((height * 5) / 6)]
  for (let k = 0; k < 8; k++) {
    const x = Math.round((width * (2 * k + 1)) / 16)
    for (const y of ys) points.push([x, y])
  }
  return points
}

function recordCase(testCase, frameA, frameB) {
  const [width, height] = testCase.size
  const radius = testCase.uniformRadius !== undefined ? testCase.uniformRadius : UNIFORM_RADIUS
  const samples = []
  for (const [x, y] of candidatePoints(width, height)) {
    if (!frameA.isUniform(x, y, radius)) continue // on an edge or on text
    const a = frameA.at(x, y)
    const b = frameB.at(x, y)
    if (!a || !b) continue
    if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) continue // not stable
    samples.push({ name: `x${x}y${y}`, point: [x, y], expected: a, source: 'recorded' })
  }
  return samples
}

// ---------------------------------------------------------------------------
// Baseline
// ---------------------------------------------------------------------------

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return { meta: {}, cases: {} }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
}

function saveBaseline(baseline) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n')
}

function eq(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

function rgb(c) {
  return c ? c.join(',') : 'out of bounds'
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

function selectedCases() {
  if (opts.mode === 'validate') return CASES.filter((c) => VALIDATION_CASES.includes(c.id))
  if (opts.cases.length) return CASES.filter((c) => opts.cases.includes(c.id))
  return CASES
}

async function runCompare() {
  const baseline = loadBaseline()
  const report = { pass: [], fail: [], unstable: [], missing: [], unsettled: [] }

  for (const testCase of selectedCases()) {
    const { frame, settled } = await captureCase(testCase)
    if (!settled) report.unsettled.push(testCase.id)

    const entry = baseline.cases[testCase.id]
    if (!entry) {
      report.missing.push(testCase.id)
      continue
    }
    for (const sample of entry.samples) {
      const actual = frame.at(sample.point[0], sample.point[1])
      const record = {
        case: testCase.id,
        sample: sample.name,
        point: sample.point,
        expected: sample.expected,
        actual,
        note: sample.note
      }
      if (eq(actual, sample.expected)) report.pass.push(record)
      // A case whose frame never settled is animating. Its mismatches are
      // reported but cannot fail the run — otherwise the harness cries wolf on
      // deghost and audioSync, and a harness nobody trusts is worse than none.
      else if (!settled) report.unstable.push(record)
      else report.fail.push(record)
    }
  }
  return report
}

async function runRecord() {
  const baseline = loadBaseline()
  const preserved = {}

  // Hand-authored samples (source: 'spec') are documented truth, not observation.
  // Recording must never silently overwrite them.
  for (const [id, entry] of Object.entries(baseline.cases || {})) {
    preserved[id] = (entry.samples || []).filter((s) => s.source === 'spec')
  }

  const cases = {}
  for (const testCase of selectedCases()) {
    const first = await captureCase(testCase)
    const second = await captureCase(testCase)
    const recorded = recordCase(testCase, first.frame, second.frame)
    const spec = preserved[testCase.id] || []
    const specPoints = new Set(spec.map((s) => s.point.join(',')))

    cases[testCase.id] = {
      card: testCase.card,
      variant: testCase.variant,
      size: testCase.size,
      settled: first.settled && second.settled,
      samples: [...spec, ...recorded.filter((s) => !specPoints.has(s.point.join(',')))]
    }
    console.log(
      `recorded ${testCase.id}: ${recorded.length} stable of ${candidatePoints(...testCase.size).length} candidates` +
        (spec.length ? `, ${spec.length} spec sample(s) preserved` : '') +
        (first.settled ? '' : '  [frame never settled]')
    )
  }

  // Only replace the cases we actually ran.
  const merged = { ...(baseline.cases || {}), ...cases }
  saveBaseline({
    meta: {
      note: 'Generated by test/pixel/run.js --record. See README.md before editing by hand.',
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      platform: process.platform,
      arch: process.arch,
      settleMs: SETTLE_MS,
      forcedSwitches: ['force-color-profile=srgb', 'force-device-scale-factor=1']
    },
    cases: merged
  })
  console.log(`\nbaseline written to ${path.relative(ROOT, BASELINE_PATH)}`)
  return 0
}

/**
 * The day-one acceptance test from docs/review/09-kickoff.md section 6.
 *
 * The harness is only trustworthy if it can do both of these at once:
 *   1. reproduce a value the app documents and gets right   (100% white = 235)
 *   2. detect a value the app gets wrong                    (75% yellow blue channel)
 *
 * Passing 1 alone would mean it agrees with the app; passing 2 alone would mean
 * it disagrees with everything. Both together is the only useful signal.
 *
 * Check 2 has since changed sense. At commit 0dd8690, before F1, it asserted the
 * yellow bar was 180,180,0 — the wrong value — and passed, which is what proved
 * the harness detects a real defect rather than merely agreeing with the app.
 * F1 fixed that channel, so the same sample now asserts the correct 180,180,16
 * and doubles as the regression guard against F1 being undone.
 */
async function runValidate() {
  const hundred = CASES.find((c) => c.id === 'bars-simple-100')
  const seventyFive = CASES.find((c) => c.id === 'bars-simple-75')

  const [w] = hundred.size
  const barCentre = (index) => [Math.round((w * (2 * index + 1)) / 16), Math.round(hundred.size[1] / 2)]

  const a = await captureCase(hundred)
  const b = await captureCase(seventyFive)

  const white = a.frame.at(...barCentre(0)) // bar 1, white
  const yellow = b.frame.at(...barCentre(1)) // bar 2, yellow

  const checks = [
    {
      name: 'reproduces the documented value',
      detail: 'bars/simple @ 100%, centre of bar 1 (white) === 235,235,235',
      ok: eq(white, [235, 235, 235]),
      expected: '235,235,235',
      actual: rgb(white)
    },
    {
      name: 'inactive channels sit at black level (F1)',
      detail: 'bars/simple @ 75%, centre of bar 2 (yellow) is 180,180,16 and NOT the old 180,180,0',
      ok: eq(yellow, [180, 180, 16]) && !eq(yellow, [180, 180, 0]),
      expected: '180,180,16',
      actual: rgb(yellow)
    },
    {
      name: 'frames settle',
      detail: 'two consecutive captures identical for both cases',
      ok: a.settled && b.settled,
      expected: 'settled',
      actual: `${hundred.id}=${a.settled}, ${seventyFive.id}=${b.settled}`
    }
  ]

  console.log('\nDay-one validation (docs/review/09-kickoff.md section 6)\n')
  for (const c of checks) {
    console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}`)
    console.log(`        ${c.detail}`)
    console.log(`        expected ${c.expected}`)
    console.log(`        actual   ${c.actual}\n`)
  }

  const allOk = checks.every((c) => c.ok)
  console.log(
    allOk
      ? 'Validation passed. Documented value reproduced, F1 in place, frames deterministic.\n'
      : 'VALIDATION FAILED. Either the harness is broken or a levels fix has been undone.\n' +
          'Find out which before trusting any other result from this harness.\n'
  )
  return allOk ? 0 : 1
}

function printReport(report) {
  for (const f of report.fail) {
    console.log(`FAIL  ${f.case}  ${f.sample} at ${f.point}: expected ${rgb(f.expected)}, got ${rgb(f.actual)}`)
    if (f.note) console.log(`        note: ${f.note}`)
  }
  for (const u of report.unstable) {
    console.log(`WARN  ${u.case}  ${u.sample} at ${u.point}: expected ${rgb(u.expected)}, got ${rgb(u.actual)}`)
  }
  for (const id of report.missing) console.log(`MISS  ${id}: no baseline entry — run --record`)
  for (const id of report.unsettled) {
    console.log(`WARN  ${id}: animates by design; its mismatches are advisory and do not fail the run`)
  }
  console.log(
    `\n${report.pass.length} passed, ${report.fail.length} failed, ` +
      `${report.unstable.length} advisory (animated cards), ${report.missing.length} without baseline`
  )
}

// ---------------------------------------------------------------------------

app.on('window-all-closed', () => {})

app.whenReady().then(async () => {
  // The test card sends these on mount; swallow them so nothing is left pending.
  ipcMain.on('getScreens', () => {})
  ipcMain.on('networkInfo', () => {})
  ipcMain.on('getConfigTestCard', () => {})

  let code = 1
  try {
    if (opts.mode === 'validate') {
      code = await runValidate()
    } else if (opts.mode === 'record') {
      code = await runRecord()
    } else {
      const report = await runCompare()
      if (opts.json) console.log(JSON.stringify(report, null, 2))
      else printReport(report)
      code = report.fail.length === 0 && report.missing.length === 0 ? 0 : 1
    }
  } catch (err) {
    console.error('pixel harness error:', err && err.stack ? err.stack : err)
    code = 2
  }
  app.exit(code)
})
