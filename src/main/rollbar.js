'use strict'

/**
 * Optional Rollbar error reporting. No-op when token is missing or in development.
 */
function initRollbar(env, version, isDevelopment, log) {
  if (!env.rollbarToken || env.rollbarToken === '') {
    log.warn('No Rollbar token has been set!')
    return
  }
  if (isDevelopment) return
  const Rollbar = require('rollbar')
  return new Rollbar({
    accessToken: env.rollbarToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: { version }
  })
}

module.exports = { initRollbar }
