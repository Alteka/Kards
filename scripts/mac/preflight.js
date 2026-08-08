#!/usr/bin/env node
'use strict'

/**
 * Pre-build checks for `npm run release:mac`.
 *
 * This is the guard whose absence caused the bug this whole release exists to
 * fix. Between 2022 and 2024 every macOS build was signed with an *Apple
 * Development* certificate instead of *Developer ID Application*, because the
 * build tool auto-selected an identity from the keychain and said nothing. The
 * result shipped to users as a malware warning and went unnoticed for four
 * years.
 *
 * So: the identity is named explicitly in package.json, and this script refuses
 * to start a build unless that name is a Developer ID one and the certificate
 * is actually present. `scripts/mac/verify.js` then checks what really signed
 * the output, because a correct configuration is not the same as a correct
 * result.
 *
 * Exits non-zero, loudly, on the first problem it finds.
 */

const { execFileSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..', '..')
const pkg = require(path.join(ROOT, 'package.json'))

const APP_IDENTITY_PREFIX = 'Developer ID Application:'
const INSTALLER_IDENTITY_PREFIX = 'Developer ID Installer:'

const problems = []

function fail(message, detail) {
  problems.push(detail ? `${message}\n      ${detail.split('\n').join('\n      ')}` : message)
}

function security(args) {
  try {
    return execFileSync('security', args, { encoding: 'utf8' })
  } catch (e) {
    return ''
  }
}

// ---------------------------------------------------------------------------
// 1. Platform
// ---------------------------------------------------------------------------

if (process.platform !== 'darwin') {
  console.error('\nrelease:mac must run on macOS.')
  console.error('Signing, notarisation and stapling all require Apple tooling that exists')
  console.error('nowhere else. See docs/RELEASING.md.\n')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 2. Identities are named explicitly, and are the right kind
// ---------------------------------------------------------------------------

const appIdentity = pkg.build && pkg.build.mac && pkg.build.mac.identity
const installerIdentity = pkg.build && pkg.build.pkg && pkg.build.pkg.identity

if (!appIdentity) {
  fail(
    'package.json build.mac.identity is not set.',
    'Leaving it unset lets electron-builder pick an identity out of the keychain,\n' +
      'which is exactly how a development certificate got shipped for four years.\n' +
      'Set it to the full string from: security find-identity -v -p codesigning'
  )
} else if (!appIdentity.startsWith(APP_IDENTITY_PREFIX)) {
  fail(
    `build.mac.identity is not a Developer ID Application certificate.`,
    `got:      ${appIdentity}\nexpected: a string beginning "${APP_IDENTITY_PREFIX}"\n\n` +
      'An "Apple Development:" certificate will sign without complaint and then fail\n' +
      'Gatekeeper on every machine that is not a registered development device.'
  )
}

if (!installerIdentity) {
  fail(
    'package.json build.pkg.identity is not set.',
    'The .pkg needs a Developer ID *Installer* certificate. This is a different\n' +
      'certificate from the Application one and cannot be substituted. Kards has\n' +
      'never had one, which is why the installer has never been signed.'
  )
} else if (!installerIdentity.startsWith(INSTALLER_IDENTITY_PREFIX)) {
  fail(
    'build.pkg.identity is not a Developer ID Installer certificate.',
    `got:      ${installerIdentity}\nexpected: a string beginning "${INSTALLER_IDENTITY_PREFIX}"`
  )
}

// ---------------------------------------------------------------------------
// 3. Those certificates are actually in the keychain
// ---------------------------------------------------------------------------
//
// Application certificates appear under -p codesigning. Installer certificates
// do not - they are not codesigning identities - so they need the unfiltered
// list.

const codesigningIdentities = security(['find-identity', '-v', '-p', 'codesigning'])
const allIdentities = security(['find-identity', '-v'])

if (appIdentity && appIdentity.startsWith(APP_IDENTITY_PREFIX) && !codesigningIdentities.includes(appIdentity)) {
  fail(
    'The configured Developer ID Application certificate is not in the keychain.',
    `looking for: ${appIdentity}\n\nsecurity find-identity -v -p codesigning says:\n${codesigningIdentities.trim() || '  (nothing)'}`
  )
}

if (
  installerIdentity &&
  installerIdentity.startsWith(INSTALLER_IDENTITY_PREFIX) &&
  !allIdentities.includes(installerIdentity)
) {
  fail(
    'The configured Developer ID Installer certificate is not in the keychain.',
    `looking for: ${installerIdentity}\n\nsecurity find-identity -v says:\n${allIdentities.trim() || '  (nothing)'}`
  )
}

// ---------------------------------------------------------------------------
// 4. Hardened runtime and entitlements are configured
// ---------------------------------------------------------------------------

const mac = (pkg.build && pkg.build.mac) || {}

if (mac.hardenedRuntime !== true) {
  fail('build.mac.hardenedRuntime is not true. Apple will refuse to notarise the build.')
}

// Notarisation is ours, not electron-builder's, so the .app gets stapled before
// it is packaged. Leaving mac.notarize on would notarise it a second time and
// still not staple it.
if (mac.notarize !== false) {
  fail(
    'build.mac.notarize must be false.',
    'scripts/mac/after-sign.js does the notarisation, because it also needs to\n' +
      'staple the .app before the .pkg is built. electron-builder never staples.'
  )
}

if (!pkg.build.afterSign) {
  fail(
    'build.afterSign is not set.',
    'Without it nothing notarises or staples the .app, and the installed app\n' +
      'would need to reach Apple on first launch to verify.'
  )
}

for (const key of ['entitlements', 'entitlementsInherit']) {
  if (!mac[key]) {
    fail(`build.mac.${key} is not set.`)
  } else if (!fs.existsSync(path.join(ROOT, mac[key]))) {
    fail(`build.mac.${key} points at a file that does not exist: ${mac[key]}`)
  }
}

// The `wallpaper` package execFile()s a bundled Mach-O binary, `macos-wallpaper`,
// from its own directory. Left inside app.asar it *runs* - Electron patches
// child_process to extract asar-internal executables to a temp directory first,
// verified on Windows - but codesign cannot reach into an archive to sign it.
// An unsigned Mach-O executable inside the bundle is what Apple's notary service
// rejects with "The binary is not signed with a valid Developer ID certificate".
const unpack = pkg.build && pkg.build.asarUnpack
if (!unpack || !unpack.some((p) => p.includes('wallpaper'))) {
  fail(
    'build.asarUnpack does not unpack the `wallpaper` package.',
    'Its macos-wallpaper binary has to sit on the real filesystem for codesign to\n' +
      'sign it. Unsigned executables inside the bundle fail notarisation.'
  )
}

// ---------------------------------------------------------------------------
// 5. Notarisation tooling and credentials
// ---------------------------------------------------------------------------

try {
  execFileSync('xcrun', ['notarytool', '--version'], { stdio: 'ignore' })
} catch (e) {
  fail(
    'xcrun notarytool is not available.',
    'Needs Xcode 13 or later. Apple retired the older altool route in November 2023.'
  )
}

const keychainProfile = process.env.KARDS_NOTARY_PROFILE
const hasApiKey = process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID && process.env.APPLE_API_ISSUER
const hasAppleId = process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID

if (!keychainProfile && !hasApiKey && !hasAppleId) {
  fail(
    'No notarisation credential found.',
    'Set one of:\n' +
      '  KARDS_NOTARY_PROFILE       a profile saved with `xcrun notarytool store-credentials`\n' +
      '                             (recommended - nothing lives in your shell history)\n' +
      '  APPLE_API_KEY, APPLE_API_KEY_ID, APPLE_API_ISSUER      App Store Connect API key\n' +
      '  APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID   app-specific password\n\n' +
      'See docs/signing/apple-certificates.md section 3.3.'
  )
}

// ---------------------------------------------------------------------------

if (problems.length > 0) {
  console.error('\n  Cannot start a release build. ' + problems.length + ' problem(s):\n')
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`))
  console.error('  Nothing has been built. Fix the above and run again.\n')
  process.exit(1)
}

console.log('  preflight ok')
console.log(`    app signing identity: ${appIdentity}`)
console.log(`    pkg signing identity: ${installerIdentity}`)
console.log(
  `    notarisation:         ${keychainProfile ? 'keychain profile ' + keychainProfile : hasApiKey ? 'App Store Connect API key' : 'app-specific password'}`
)
