#!/usr/bin/env node
'use strict'

/**
 * Post-build verification for `npm run release:mac`.
 *
 * `preflight.js` checks the configuration is right. This checks the *result* is
 * right, which is not the same thing and is the check that would actually have
 * caught the 2022 mistake: the config back then was simply absent, but a build
 * that is misconfigured in some new way would still sail past preflight. This
 * asks the artifacts themselves what signed them.
 *
 * Every check here is one a maintainer can run by hand - they are listed in
 * docs/signing/apple-certificates.md section 5 - so nothing depends on trusting
 * this script.
 *
 * Usage:  node scripts/mac/verify.js
 */

const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..', '..')
const OUT = path.join(ROOT, 'dist_electron')
const TEAM_ID = 'D4H96T8MEW'

const failures = []

function capture(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  return ((r.stdout || '') + (r.stderr || '')).trim()
}

function check(label, ok, detail) {
  console.log(`    ${ok ? 'ok  ' : 'FAIL'}  ${label}`)
  if (!ok) {
    failures.push(`${label}\n${detail.split('\n').map((l) => '        ' + l).join('\n')}`)
  }
}

// ---------------------------------------------------------------------------
// The .app bundles
// ---------------------------------------------------------------------------

const appBundles = fs
  .readdirSync(OUT)
  .filter((d) => fs.existsSync(path.join(OUT, d, 'Kards.app')))
  .map((d) => path.join(OUT, d, 'Kards.app'))

if (appBundles.length === 0) {
  console.error('No Kards.app found under dist_electron/. Nothing to verify.')
  process.exit(1)
}

for (const app of appBundles) {
  console.log(`\n  ${path.relative(OUT, app)}`)

  const codesign = capture('codesign', ['-dvvv', app])

  // The whole point. "Apple Development:" here is the original bug.
  const authority = (codesign.match(/^Authority=(.+)$/m) || [])[1] || '(none)'
  check(
    `signed by Developer ID Application (got: ${authority})`,
    authority.startsWith('Developer ID Application:'),
    codesign
  )
  check(`signing authority names team ${TEAM_ID}`, authority.includes(TEAM_ID), authority)

  // runtime flag == hardened runtime is on. Notarisation requires it.
  check('hardened runtime enabled', /flags=.*runtime/.test(codesign), codesign)

  // Verifies the seal over every file in the bundle, so it catches anything
  // added or altered after signing.
  const deep = capture('codesign', ['--verify', '--deep', '--strict', '--verbose=2', app])
  check('bundle seal intact (codesign --verify --deep --strict)', /satisfies its Designated Requirement|valid on disk/.test(deep) && !/invalid|failed/i.test(deep), deep)

  // The only check that answers "will this run on a stranger's Mac".
  // source=Notarized Developer ID is the string to want; anything else,
  // including a bare "accepted", is not good enough.
  const assess = capture('spctl', ['--assess', '--type', 'execute', '-vv', app])
  check('Gatekeeper accepts it as Notarized Developer ID', /source=Notarized Developer ID/.test(assess), assess)
}

// ---------------------------------------------------------------------------
// The .pkg installers
// ---------------------------------------------------------------------------

const pkgs = fs
  .readdirSync(OUT)
  .filter((f) => f.endsWith('.pkg'))
  .map((f) => path.join(OUT, f))

if (pkgs.length === 0) {
  failures.push('No .pkg produced. The mac target is `pkg`; this should not be empty.')
}

for (const pkg of pkgs) {
  console.log(`\n  ${path.basename(pkg)}`)

  // Every published Kards .pkg to date has failed this one.
  const sig = capture('pkgutil', ['--check-signature', pkg])
  check('signed by Developer ID Installer', /Developer ID Installer:/.test(sig), sig)
  check(`installer certificate names team ${TEAM_ID}`, sig.includes(TEAM_ID), sig)

  // Stapled == validates with no network. Kards gets installed in venues.
  const staple = capture('xcrun', ['stapler', 'validate', pkg])
  check('notarisation ticket stapled', /The validate action worked/.test(staple), staple)
}

// ---------------------------------------------------------------------------

console.log('')
if (failures.length > 0) {
  console.error(`  ${failures.length} verification failure(s). DO NOT PUBLISH THIS BUILD.\n`)
  failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`))
  process.exit(1)
}

console.log('  all signing checks passed')
console.log('  Still needs a human: double-click the .pkg on a Mac that has never seen this')
console.log('  build and confirm it installs without a warning. No automated check proves that.')
