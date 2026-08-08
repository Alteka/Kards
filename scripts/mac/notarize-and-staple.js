#!/usr/bin/env node
'use strict'

/**
 * Notarise and staple the built .pkg installers.
 *
 * The .app inside was already notarised and stapled by the afterSign hook. This
 * is the second half: the installer is a separate distributable and Apple
 * notarises it separately. An unnotarised .pkg is what produces the malware
 * warning at install time - the symptom users have been reporting since 2024 -
 * regardless of how well signed the app inside it is.
 *
 * Usage:  node scripts/mac/notarize-and-staple.js [pkg...]
 * With no arguments it processes every .pkg in dist_electron/.
 */

const path = require('path')
const fs = require('fs')

const { notarize, staple } = require('./notary')

const OUT = path.join(__dirname, '..', '..', 'dist_electron')

const targets =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : fs.existsSync(OUT)
      ? fs
          .readdirSync(OUT)
          .filter((f) => f.endsWith('.pkg'))
          .map((f) => path.join(OUT, f))
      : []

if (targets.length === 0) {
  console.error('\n  No .pkg files found in dist_electron/.')
  console.error('  The mac target is `pkg`, so a successful build should have produced some.\n')
  process.exit(1)
}

for (const pkg of targets) {
  console.log(`\n  notarising ${path.basename(pkg)}`)
  notarize(pkg)
  console.log(`  stapling ${path.basename(pkg)}`)
  staple(pkg)
}

console.log(`\n  ${targets.length} package(s) notarised and stapled`)
