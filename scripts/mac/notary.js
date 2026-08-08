'use strict'

/**
 * Shared notarisation helpers. Used by the afterSign hook (for the .app) and by
 * notarize-and-staple.js (for the .pkg).
 *
 * Everything goes through `xcrun notarytool` directly rather than through
 * @electron/notarize, for one reason: notarytool can read a credential stored in
 * the keychain (`xcrun notarytool store-credentials`), and electron-builder's
 * wrapper cannot - it only accepts credentials from environment variables. An
 * app-specific password sitting in the environment ends up in shell history and
 * in `ps` output; a keychain profile does not. Given the maintainers are running
 * this by hand on their own Mac, that is the better default.
 */

const { spawnSync } = require('child_process')
const path = require('path')

/**
 * notarytool credential arguments, in order of preference.
 * Throws rather than guessing, so a missing credential fails before a build
 * rather than halfway through one.
 */
function credentialArgs() {
  const env = process.env

  if (env.KARDS_NOTARY_PROFILE) {
    return ['--keychain-profile', env.KARDS_NOTARY_PROFILE]
  }
  if (env.APPLE_API_KEY && env.APPLE_API_KEY_ID && env.APPLE_API_ISSUER) {
    return ['--key', env.APPLE_API_KEY, '--key-id', env.APPLE_API_KEY_ID, '--issuer', env.APPLE_API_ISSUER]
  }
  if (env.APPLE_ID && env.APPLE_APP_SPECIFIC_PASSWORD && env.APPLE_TEAM_ID) {
    return [
      '--apple-id',
      env.APPLE_ID,
      '--password',
      env.APPLE_APP_SPECIFIC_PASSWORD,
      '--team-id',
      env.APPLE_TEAM_ID
    ]
  }

  throw new Error(
    'No notarisation credential found. Set KARDS_NOTARY_PROFILE (see\n' +
      '`xcrun notarytool store-credentials`), or the APPLE_API_KEY / APPLE_ID\n' +
      'variable sets described in docs/RELEASING.md.'
  )
}

function run(cmd, args) {
  console.log(`      $ ${cmd} ${args.join(' ')}`)
  const r = spawnSync(cmd, args, { stdio: 'inherit' })
  if (r.error) throw r.error
  if (r.status !== 0) throw new Error(`${cmd} ${args[0]} exited ${r.status}`)
}

/**
 * Submit to Apple and block until they return a verdict.
 *
 * notarytool only accepts .zip, .pkg and .dmg, so an .app has to be zipped
 * first. ditto with these flags is the only zip that preserves the bundle's
 * symlinks and resource forks - a plain `zip -r` produces an archive Apple
 * rejects.
 */
function notarize(target) {
  const creds = credentialArgs()
  let submission = target
  let cleanup = null

  if (target.endsWith('.app')) {
    submission = target + '.notarise.zip'
    run('ditto', ['-c', '-k', '--keepParent', target, submission])
    cleanup = submission
  }

  try {
    run('xcrun', ['notarytool', 'submit', submission, ...creds, '--wait'])
  } catch (e) {
    console.error(
      '\n      Notarisation failed. Apple returns a specific reason - get it with:\n' +
        `        xcrun notarytool log <submission-id> ${creds.join(' ')}\n` +
        '      The submission id is in the output above.\n'
    )
    throw e
  } finally {
    if (cleanup) {
      spawnSync('rm', ['-f', cleanup])
    }
  }
}

/**
 * Embed the ticket so verification works with no network.
 *
 * Apple's guidance for an app distributed inside an installer is to staple
 * both: the app before it is packaged, and the package afterwards. Only the
 * package ticket is embedded otherwise, and the installed app would need to
 * reach Apple on first launch. Kards gets installed in venues, where there is
 * frequently no internet.
 */
function staple(target) {
  run('xcrun', ['stapler', 'staple', target])
  run('xcrun', ['stapler', 'validate', target])
}

module.exports = { credentialArgs, notarize, staple, run, basename: path.basename }
