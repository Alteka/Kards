'use strict'

/**
 * Simple GitHub-based update checker.
 *
 * Kicks off a single delayed check against the latest GitHub release
 * and, if newer, prompts the user via a dialog.
 */

module.exports = function startUpdateChecker(state, deps) {
  const {
    axios,
    compareVersions,
    version,
    log,
    dialog,
    shell
  } = deps

  setTimeout(function () {
    axios.get('https://api.github.com/repos/alteka/kards/releases/latest')
      .then(function (response) {
        let online = response.data.tag_name
        let status = compareVersions(online, version, '>')
        if (status == 1) {
          log.info('Update :: A newer version (' + online + ') is available. ' + version + ' currently installed.')
          dialog.showMessageBox(state.controlWindow, {
            type: 'question',
            title: 'An Update Is Available',
            message: 'Would you like to download version: ' + online,
            buttons: ['Cancel', 'Yes']
          }).then(function (response) {
            if (response.response == 1) {
              shell.openExternal('https://alteka.solutions/kards')
            }
          });
        } else if (status == 0) {
          log.info('Update :: Running latest version - ' + online)
        } else if (status == -1) {
          log.info('Update :: Running a newer version (' + version + ') than is online: ' + online)
        }
      })
      .catch(function (error) {
        log.error(error);
      })
  }, 10000)
}

