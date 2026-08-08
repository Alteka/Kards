'use strict'

/**
 * One Bonjour instance for the whole main process.
 *
 * `require('bonjour')()` was previously called three times independently — in
 * background.js, rest.js and osc.js — each creating its own mDNS socket and its
 * own registry of published services. The shutdown paths in background.js call
 * `unpublishAll()` and `destroy()`, but only ever on background.js's own
 * instance, so the services actually published by rest.js and osc.js were never
 * unpublished. They went away when the process died, which meant other machines
 * kept the stale advertisement until it aged out.
 *
 * Sharing one instance makes `unpublishAll()` mean what it says.
 *
 * Note for D1: the `bonjour` package's registry entry dates from 2013 and it
 * pulls the multicast-dns -> dns-packet -> ip advisory chain. `bonjour-service`
 * is the maintained successor with a near-identical API. Having the instance in
 * one place is what makes that swap a one-line change.
 */

module.exports = require('bonjour')()
