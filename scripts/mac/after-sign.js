'use strict'

/**
 * electron-builder `afterSign` hook: notarise and staple the .app.
 *
 * Ordering is why this is a hook rather than a step in release.js.
 * electron-builder runs: pack -> sign the app -> afterSign -> build the .pkg.
 * The app has to be stapled *before* it is packaged, so this is the only point
 * at which it can happen. Doing it afterwards would mean rebuilding the package.
 *
 * The .pkg gets its own notarisation and staple later, in
 * scripts/mac/notarize-and-staple.js. Both are needed - see notary.js.
 */

const path = require('path')
const { notarize, staple } = require('./notary')

module.exports = async function afterSign(context) {
  const { electronPlatformName, appOutDir, packager } = context

  if (electronPlatformName !== 'darwin') {
    return
  }

  if (process.env.KARDS_SKIP_NOTARIZE === '1') {
    console.log('\n  KARDS_SKIP_NOTARIZE=1 - skipping notarisation of the .app.')
    console.log('  The build will NOT be distributable. For iterating on signing only.\n')
    return
  }

  const appPath = path.join(appOutDir, `${packager.appInfo.productFilename}.app`)

  console.log(`\n  afterSign: notarising ${path.basename(appPath)}`)
  console.log('    This is a round trip to Apple and usually takes a few minutes.')
  notarize(appPath)

  console.log(`  afterSign: stapling ${path.basename(appPath)}`)
  staple(appPath)
}
