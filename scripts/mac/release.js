#!/usr/bin/env node
'use strict'

/**
 * `npm run release:mac` - the whole signed macOS release, in one command.
 *
 * This exists so the release recipe lives in the repository rather than in one
 * person's shell history, which is how Kards shipped four years of builds
 * signed with the wrong certificate without anyone noticing.
 *
 * Stages, each independently re-runnable if a later one fails:
 *
 *   1  node scripts/mac/preflight.js            configuration and credentials
 *   2  vite build                               renderer
 *   3  electron-builder --mac                   sign app, notarise app, build pkg
 *   4  node scripts/mac/notarize-and-staple.js  notarise and staple the pkg
 *   5  node scripts/mac/verify.js               check the artifacts, not the config
 *
 * Options:
 *   --skip-build     go straight to stage 4, reusing what is in dist_electron/
 *   --arch=<list>    comma-separated: universal,x64,arm64  (default: all three)
 */

const { spawnSync } = require('child_process')
const path = require('path')

const ROOT = path.join(__dirname, '..', '..')
const argv = process.argv.slice(2)

const skipBuild = argv.includes('--skip-build')
const archArg = (argv.find((a) => a.startsWith('--arch=')) || '--arch=universal,x64,arm64').split('=')[1]
const arches = archArg.split(',').filter(Boolean)

const VALID_ARCHES = ['universal', 'x64', 'arm64']
for (const a of arches) {
  if (!VALID_ARCHES.includes(a)) {
    console.error(`Unknown arch "${a}". Valid: ${VALID_ARCHES.join(', ')}`)
    process.exit(1)
  }
}

function stage(n, title) {
  console.log(`\n${'='.repeat(70)}\n  ${n}. ${title}\n${'='.repeat(70)}`)
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, shell: process.platform === 'win32' })
  if (r.status !== 0) {
    console.error(`\n  Stage failed: ${cmd} ${args.join(' ')} exited ${r.status}`)
    console.error('  Nothing further has run. See docs/RELEASING.md for what to do next.\n')
    process.exit(r.status || 1)
  }
}

stage(1, 'Preflight')
run(process.execPath, [path.join(__dirname, 'preflight.js')])

if (!skipBuild) {
  stage(2, 'Build renderer')
  run('npx', ['vite', 'build'])

  stage(3, `Package and sign (${arches.join(', ')})`)
  // Each arch is a separate electron-builder invocation on purpose. A single
  // combined run reports the first failure and abandons the rest, which makes
  // an arch-specific signing problem look like a total failure.
  for (const arch of arches) {
    console.log(`\n  --- ${arch} ---`)
    run('npx', ['electron-builder', '--mac', `--${arch}`])
  }
} else {
  console.log('\n  --skip-build: reusing the existing dist_electron/')
}

stage(4, 'Notarise and staple the installers')
run(process.execPath, [path.join(__dirname, 'notarize-and-staple.js')])

stage(5, 'Verify the artifacts')
run(process.execPath, [path.join(__dirname, 'verify.js')])

console.log(`\n${'='.repeat(70)}`)
console.log('  Release build complete. Artifacts in dist_electron/.')
console.log('  Not done yet: docs/RELEASING.md covers the GitHub release, the WinGet')
console.log('  manifest PR and the Homebrew cask bump.')
console.log(`${'='.repeat(70)}\n`)
