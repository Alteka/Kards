'use strict'

/**
 * GitHub-based update checker.
 *
 * Kards deliberately has no auto-updater. It is event software: downloading
 * 112 MB and asking for a restart while an engineer is patching a show is
 * actively harmful. Notify-on-launch, then send the user to the website, is the
 * right model and is not what this module changes.
 *
 * What it changes is that the notification used to miss the users it was for.
 * The previous implementation made exactly one attempt, ten seconds after
 * launch, and logged failures to a file behind More -> Logs. An AV laptop ten
 * seconds after launch is usually being plugged into house Ethernet, waiting on
 * DHCP, or joining venue Wi-Fi - so the single most common condition for this
 * software was the one condition guaranteed to miss. See F-005.
 *
 * So:
 *
 * - Retry with backoff instead of one shot.
 * - Re-check when the network actually appears, which is when the user can act.
 * - Keep a status the UI can show, so "it never told me" is distinguishable
 *   from "it told me and I ignored it".
 * - Let the user check on demand. For event software this is arguably the most
 *   important entry point: the engineer checks the day before a show, not
 *   whenever the app happened to launch.
 *
 * The dialog itself still only ever appears once per run.
 */

// 10s, 1min, 5min, 15min, then hourly.
//
// Worth answering, because it looks redundant: if we re-check when the network
// appears, why retry on a timer at all? Because the network signal cannot be
// relied on, and the two mechanisms cover different failures.
//
// `navigator.onLine` - which is what raises the renderer's `online` event -
// reports whether Chromium has *a route*, not whether the internet is
// reachable. So:
//
// - A laptop plugged into a venue switch reports online the moment the link
//   comes up, before DHCP or DNS. The event fires once, the check fails, and
//   no second event ever arrives.
// - A machine already "online" at launch behind a captive portal or a proxy
//   never transitions, so no event fires at all - there is nothing to
//   transition from.
// - Failures with no network transition behind them at all: GitHub 5xx, or a
//   403 rate limit that clears an hour later.
//
// The network signal is what makes recovery *fast* in the clean case. The
// timer is what makes recovery *happen* in the messy ones, which are the
// common ones for this software. Dropping either leaves a real gap.
//
// The shape is a backoff rather than a flat interval because the first few
// minutes after launch are when the venue network is most likely to come up,
// so it pays to be eager early - but a flat 5-minute retry would be 12
// requests/hour/machine, and five machines behind one venue's NAT would sit
// exactly on GitHub's unauthenticated limit of 60/hour/IP. Settling to hourly
// is what keeps it safe on a big show.
const RETRY_SCHEDULE_MS = [10_000, 60_000, 300_000, 900_000]
const RETRY_INTERVAL_MS = 3_600_000

const REQUEST_TIMEOUT_MS = 15_000

const RELEASES_URL = 'https://api.github.com/repos/alteka/kards/releases/latest'
const DOWNLOAD_URL = 'https://alteka.solutions/kards'

module.exports = function startUpdateChecker(state, deps) {
  const { compareVersions, version, log, dialog, shell, ipcMain, powerMonitor } = deps

  /**
   * What the last check did. Exposed to the renderer so the More menu can show
   * it. `result` is one of: never | checking | up-to-date | update-available |
   * ahead | error.
   */
  const status = {
    result: 'never',
    lastCheckedAt: null,
    latestVersion: null,
    currentVersion: version,
    error: null
  }

  let attempt = 0
  let timer = null
  let inFlight = false
  let dialogShown = false

  function publishStatus() {
    if (state.controlWindow && !state.controlWindow.isDestroyed()) {
      state.controlWindow.webContents.send('updateStatus', { ...status })
    }
  }

  function setStatus(patch) {
    Object.assign(status, patch)
    publishStatus()
  }

  /**
   * `/releases/latest` deliberately excludes pre-releases, so a beta never
   * notifies the existing install base. That is what makes v1.4.0-beta.1 safe
   * to publish; do not "fix" this by switching to /releases.
   */
  async function fetchLatestTag() {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(RELEASES_URL, {
        signal: controller.signal,
        headers: {
          Accept: 'application/vnd.github+json',
          // GitHub asks for this and is entitled to throttle requests without
          // one. It also makes Kards traffic identifiable in their logs, which
          // is relevant to the open question about the automated downloader.
          'User-Agent': `Kards/${version} (+${DOWNLOAD_URL})`
        }
      })
      if (!response.ok) {
        // 403 here is almost always the unauthenticated rate limit - several
        // machines behind one venue's NAT is enough to hit it.
        throw new Error(`GitHub returned HTTP ${response.status}`)
      }
      const body = await response.json()
      if (!body || typeof body.tag_name !== 'string') {
        throw new Error('No tag_name in the GitHub response')
      }
      return body.tag_name
    } finally {
      clearTimeout(timeout)
    }
  }

  function promptToDownload(online) {
    // Only ever once per run. A retry loop that re-prompts every hour would be
    // exactly the interruption this product avoids on purpose.
    if (dialogShown) return
    dialogShown = true

    dialog
      .showMessageBox(state.controlWindow, {
        type: 'question',
        title: 'An Update Is Available',
        message: 'Would you like to download version: ' + online,
        buttons: ['Cancel', 'Yes']
      })
      .then(function (response) {
        if (response.response === 1) {
          shell.openExternal(DOWNLOAD_URL)
        }
      })
      .catch(function (e) {
        log.error('Update :: could not show the update dialog', e)
      })
  }

  /**
   * @param {boolean} manual  a user-initiated check reports its outcome even
   *                          when that outcome is "you are up to date", which
   *                          an automatic one has no business interrupting for.
   */
  async function check({ manual = false } = {}) {
    if (inFlight) return
    inFlight = true
    setStatus({ result: 'checking', error: null })

    try {
      const online = await fetchLatestTag()
      const comparison = compareVersions(online, version, '>')

      setStatus({
        lastCheckedAt: new Date().toISOString(),
        latestVersion: online,
        error: null,
        result: comparison === 1 ? 'update-available' : comparison === 0 ? 'up-to-date' : 'ahead'
      })

      if (comparison === 1) {
        log.info(`Update :: A newer version (${online}) is available. ${version} currently installed.`)
        promptToDownload(online)
      } else if (comparison === 0) {
        log.info('Update :: Running latest version - ' + online)
        if (manual) {
          dialog.showMessageBox(state.controlWindow, {
            type: 'info',
            title: 'No Update Available',
            message: `Kards ${version} is the latest version.`,
            buttons: ['OK']
          })
        }
      } else {
        log.info(`Update :: Running a newer version (${version}) than is online: ${online}`)
      }

      stopRetrying()
      return true
    } catch (e) {
      const message = e.name === 'AbortError' ? 'The check timed out' : e.message
      log.error('Update :: check failed - ' + message)
      setStatus({ lastCheckedAt: new Date().toISOString(), error: message, result: 'error' })

      // A failure the user asked for is a failure the user should see. An
      // automatic one stays quiet and is visible in the More menu instead.
      if (manual) {
        dialog.showMessageBox(state.controlWindow, {
          type: 'warning',
          title: 'Could Not Check For Updates',
          message: 'Kards could not reach GitHub to check for updates.',
          detail: `${message}\n\nYou can always download the latest version from ${DOWNLOAD_URL}`,
          buttons: ['OK']
        })
      }
      return false
    } finally {
      inFlight = false
    }
  }

  function stopRetrying() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  /** Schedule the next automatic attempt, backing off and then settling hourly. */
  function scheduleNext() {
    stopRetrying()
    const delay = attempt < RETRY_SCHEDULE_MS.length ? RETRY_SCHEDULE_MS[attempt] : RETRY_INTERVAL_MS
    attempt++
    timer = setTimeout(async () => {
      const succeeded = await check()
      if (!succeeded) scheduleNext()
    }, delay)
    // Never hold the app open just to check for an update.
    if (timer.unref) timer.unref()
  }

  /**
   * Re-check when something suggests the network may have changed.
   *
   * Electron's main process has no `online` event, so the reliable signal comes
   * from the renderer, which does - see ControlMenu.vue. `powerMonitor` covers
   * the other common case: a laptop that was asleep in a flight case and is now
   * plugged into house Ethernet.
   */
  function onNetworkMayHaveChanged(reason) {
    if (status.result === 'update-available' || inFlight) return
    log.info('Update :: re-checking (' + reason + ')')
    attempt = 0
    check().then((succeeded) => {
      if (!succeeded) scheduleNext()
    })
  }

  if (powerMonitor) {
    powerMonitor.on('resume', () => onNetworkMayHaveChanged('system resumed'))
  }

  ipcMain.on('rendererOnline', () => onNetworkMayHaveChanged('renderer reports network up'))

  ipcMain.on('checkForUpdates', () => {
    stopRetrying()
    attempt = 0
    check({ manual: true }).then((succeeded) => {
      if (!succeeded) scheduleNext()
    })
  })

  ipcMain.handle('getUpdateStatus', () => ({ ...status }))

  // Exposed so the macOS application menu can trigger a check too.
  state.checkForUpdates = () => check({ manual: true })

  scheduleNext()
}
