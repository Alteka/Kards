# Releasing Kards

The whole sequence, start to finish. Written so that someone who has never cut a Kards release can
do it from this file alone — that is the point of it existing. Between 2022 and 2024 the release
recipe lived in one person's shell history, and the result was four years of macOS builds signed
with the wrong certificate that nobody noticed.

> **Status:** written during v1.4.0 preparation. Sections 3–5 have **not yet been executed end to
> end** — v1.4.0-beta.1 will be the first run. Anything not yet verified says so explicitly.
> Correct this file as you go rather than after; a release doc written afterwards is fiction.

---

## 0. What you need, and who has it

| | Needed for | Who |
|---|---|---|
| macOS 12+ with Xcode 13+ | signing, notarisation, stapling | Apple developer |
| **Developer ID Application** certificate in the login keychain | signing `Kards.app` | Apple developer |
| **Developer ID Installer** certificate in the login keychain | signing the `.pkg` | Apple developer |
| A `notarytool` credential | notarisation | Apple developer |
| Windows machine with Node 22 | the Windows build | anyone |
| Push access to `Alteka/Kards` | publishing the release | maintainer |

**These cannot all be held by one machine, and that is deliberate.** macOS artifacts have to be
built on a Mac. Windows artifacts are built on Windows. See `docs/signing/apple-certificates.md`
for how the certificates are created, and §8 below for why release CI is not used yet.

### Store the notarisation credential once

Do this on the Mac, once, and never again:

```bash
xcrun notarytool store-credentials "kards" --apple-id "<apple-id>" --team-id D4H96T8MEW
```

It will prompt for an app-specific password and save the whole thing in the keychain. Then export
this in your shell profile:

```bash
export KARDS_NOTARY_PROFILE=kards
```

The build scripts prefer this over the alternatives precisely because it keeps the password out of
your environment, and therefore out of shell history and `ps` output. The alternatives, if you
must: `APPLE_API_KEY` + `APPLE_API_KEY_ID` + `APPLE_API_ISSUER`, or `APPLE_ID` +
`APPLE_APP_SPECIFIC_PASSWORD` + `APPLE_TEAM_ID`.

### Set the signing identities, once

`package.json` ships with deliberate placeholders:

```json
"mac": { "identity": "Developer ID Application: REPLACE ME (D4H96T8MEW)" },
"pkg": { "identity": "Developer ID Installer: REPLACE ME (D4H96T8MEW)" }
```

Replace both with the exact strings from:

```bash
security find-identity -v -p codesigning    # Application certificates
security find-identity -v                   # everything, incl. Installer certificates
```

**Do not delete these keys and do not set them to `null`.** An absent identity makes
electron-builder pick one out of the keychain on its own, silently. That is precisely how an
*Apple Development* certificate ended up signing four years of releases. `scripts/mac/preflight.js`
refuses to build if either is missing or is the wrong kind, but the safest thing is not to create
the situation.

> These two lines carry no explanatory comment in `package.json`, because electron-builder
> validates its `build` block against a strict schema and fails the build on any unknown key —
> `_comment_*` included. Preflight is the enforcement.

---

## 1. Before you build anything

```bash
git checkout feature/modernise      # or master, once this branch has merged
git pull
npm ci
```

Then, in order:

1. **`npm run lint`** — must report 0 errors. Warnings are expected (285 at time of writing) and
   are not a release blocker. `npm run lint:fix` touches `src/components/TestCard/`; do not run it
   as part of a release.

2. **`npm run test:pixel`** — must report **0 failed**. This is the gate on output correctness. If
   a sample has moved and you do not know why, stop: something changed what the cards draw, and
   that is the story. `test/pixel/README.md` explains re-baselining, which you should not be doing
   during a release.

3. **Bump the version** in `package.json`. Nothing derives it from a git tag; the version in
   `package.json` is what ends up in the artifact filenames and in the About box.

4. **Commit the bump on its own** and tag it:

   ```bash
   git commit -am "v1.4.0"
   git tag v1.4.0
   ```

   Do not push the tag until the artifacts exist and pass §5. A tag pointing at a release that was
   never published is a small mess; a published release built from an untagged tree is a bigger one.

---

## 2. macOS build — on the Mac

```bash
npm run release:mac
```

That runs five stages. Each is separately re-runnable, which matters because stage 3 and stage 4
both talk to Apple and Apple is sometimes slow or unavailable.

| Stage | What it does | Script |
|---|---|---|
| 1 | Checks configuration and credentials before anything is built | `scripts/mac/preflight.js` |
| 2 | Builds the renderer | `vite build` |
| 3 | Packages, signs the app, notarises and staples it, builds the signed `.pkg` | `electron-builder` + `scripts/mac/after-sign.js` |
| 4 | Notarises and staples each `.pkg` | `scripts/mac/notarize-and-staple.js` |
| 5 | Verifies the artifacts, not the config | `scripts/mac/verify.js` |

Useful flags:

```bash
npm run release:mac -- --arch=universal        # one architecture while iterating
npm run release:mac -- --skip-build            # redo stages 4-5 against existing artifacts
KARDS_SKIP_NOTARIZE=1 npm run release:mac      # signing only; NOT distributable
```

### Why the app and the package are notarised separately

Apple's guidance for an app distributed inside an installer is to staple both — the app before it
is packaged, the package afterwards. Stapling embeds the notarisation ticket so verification works
**with no network**, which matters because Kards is routinely installed in venues that have none.
electron-builder's own `mac.notarize` notarises the app but never staples anything, so
`mac.notarize` is set `false` and `scripts/mac/after-sign.js` does the job at the only point in the
build where the app can still be stapled before packaging.

The cost is two submissions to Apple per architecture. Three architectures is six round trips, each
typically two to five minutes. Budget half an hour of mostly waiting.

### When it fails

**Preflight fails.** It tells you exactly which of the checks failed and what to set. Nothing has
been built; fix and re-run.

**Notarisation returns `Invalid`.** Apple always gives a specific reason, but not in the output you
just saw. Get it:

```bash
xcrun notarytool log <submission-id> --keychain-profile kards
```

The submission id is in the failing output. The common causes, in the order you should suspect
them:

- *"The binary is not signed with a valid Developer ID certificate"* — usually an executable inside
  `app.asar` that codesign could not reach. `build.asarUnpack` in `package.json` exists for exactly
  this; the `wallpaper` package's `macos-wallpaper` binary is already listed there. If a new
  dependency ships a binary, it needs adding.
- *"The executable does not have the hardened runtime enabled"* — `mac.hardenedRuntime` got turned
  off, or a helper was signed without it.
- *"The signature does not include a secure timestamp"* — the machine could not reach Apple's
  timestamp server when signing. Retry with a working connection.

**Verification fails at stage 5.** Do not publish. The script prints which check failed and the raw
tool output. The one that matters most is `spctl --assess` reporting anything other than
`source=Notarized Developer ID`.

---

## 3. Windows build — on Windows

```bash
npm run build
npx electron-builder --win --x64
```

Produces `dist_electron/Kards-<version>-win-x64.exe`, an NSIS installer, plus a `.blockmap` and
`latest.yml` which are **not** used — Kards has no auto-updater by design.

**Windows builds are currently unsigned.** This is a known, deliberate state, not an oversight —
see Q1b in `docs/review/questions.md` and `docs/signing/windows-code-signing.md`. Users get a
SmartScreen warning. If that changes, this section needs rewriting.

Verified working on Windows 11 with Node 22.22.0 at the time of writing.

---

## 4. Publish the GitHub release

Upload from both machines. Artifacts to attach:

```
Kards-<version>-mac-universal.pkg
Kards-<version>-mac-x64.pkg
Kards-<version>-mac-arm64.pkg
Kards-<version>-win-x64.exe
```

> **Filenames changed in v1.4.0.** v1.3.1 shipped `mac-apple-silicon.pkg` and `mac-intel.pkg`;
> electron-builder 24 resolves `${arch}` to `x64` / `arm64` / `universal`. This breaks nothing that
> was not already broken — the version is in the filename, so every downstream consumer has to be
> updated for a new release regardless. See §7.

```bash
git push && git push --tags
gh release create v1.4.0 dist_electron/Kards-1.4.0-*.pkg dist_electron/Kards-1.4.0-win-x64.exe \
  --title "v1.4.0" --notes-file RELEASE_NOTES.md
```

For a beta, add `--prerelease`. This matters more than it looks: the update checker calls
`/releases/latest`, and the GitHub API **excludes pre-releases from that endpoint**. A pre-release
therefore does not notify the existing install base — it is opt-in by construction. This is the
mechanism that makes `v1.4.0-beta.1` safe to publish.

### Release notes must cover

For v1.4.0 specifically, and none of these are optional:

- The macOS malware warning is fixed, and what caused it.
- **macOS 12 is now the minimum.** Electron 43 raises the floor and this drops Big Sur users. State
  it plainly rather than footnoting it.
- **The colour bars changed, and why** — link the reference values (Q6).
- **The stepped ramp changed** — 13 bands rather than 10.
- Windows: signed, or explicitly noted as unsigned.

---

## 5. Verify what you published

Not what you built — what a user actually downloads. Download the assets back from the release page
and, on a Mac that has never seen this build:

```bash
pkgutil --check-signature Kards-1.4.0-mac-universal.pkg     # Developer ID Installer
xcrun stapler validate Kards-1.4.0-mac-universal.pkg        # "The validate action worked!"
```

Then install it by **double-clicking**, and launch the app. No automated check substitutes for
this; Gatekeeper acceptance of a real download is the only test that counts, because the download
carries a quarantine attribute that a locally built file does not.

**Also test first launch with networking disabled.** That is what proves the stapling arrangement
is right. If it fails there but succeeds online, the ticket is not embedded where it needs to be.

---

## 6. After publishing

- [ ] Close or update the issues the release fixes — #110 (signing) at minimum.
- [ ] **WinGet manifest PR** to `microsoft/winget-pkgs` for `AltekaSolutions.Kards`. Needs the new
      version, URL and SHA256. Undocumented channel until now; it exists and people use it.
- [ ] **Homebrew cask bump** in `github.com/Alteka/homebrew-tap` — our own tap, not
      `homebrew/homebrew-cask` (decided 2026-08-08). Bump `version`, paste the new `sha256`, push.
      No PR to wait on. `docs/homebrew/README.md` covers the one-time tap setup.

      ```bash
      shasum -a 256 dist_electron/Kards-1.4.0-mac-universal.pkg
      ```
- [ ] Update `Event-Engineering/ProjectReady`, which hard-codes
      `Kards-1.3.1-mac-apple-silicon.pkg` and breaks on the day this ships.

### People to warn *before* you publish, not after

- **dataJAR.** Their AutoPkg recipe (`github.com/autopkg/dataJAR-recipes/tree/main/Kards`) pins the
  *old* signing identity in its verification requirement, so it will fail the moment a correctly
  signed build lands. They distribute Kards to managed Mac fleets. Give them notice.

---

## 7. Downstream consumers

Everything that breaks when a release ships, so nobody has to rediscover the list:

| Consumer | What breaks | Owner |
|---|---|---|
| dataJAR AutoPkg recipe | pinned signing identity **and** filename | dataJAR, external |
| `Event-Engineering/ProjectReady` | hard-coded `Kards-1.3.1-mac-apple-silicon.pkg` | us, private repo |
| WinGet `AltekaSolutions.Kards` | needs a manifest PR per version | us |
| Homebrew cask, `Alteka/homebrew-tap` | needs a version + SHA bump per release | us |
| Kards Online | separate codebase, separate deploy; card changes do not propagate (F-027) | us |

---

## 8. Why this is not in CI yet

Release CI is deferred until after v1.4.0. Not because CI is wrong — it is the right destination,
and the current arrangement is exactly the single-machine dependency that let the original mistake
survive four years.

The reasoning is narrower than that: porting a signing recipe that is *known to work* is
mechanical, while debugging an unknown one through a runner costs minutes per attempt instead of
seconds. And moving to CI requires exporting the certificates as password-protected `.p12` files
into GitHub secrets — copying private keys somewhere new, which is not worth doing until the recipe
is proven.

What makes local builds acceptable in the meantime is specifically the two things in this
repository: the committed, reviewable build script, and the identity preflight. Neither needs CI,
and together they are most of what CI would have given us. **Do not remove either as part of moving
to CI.**

---

## 9. Things that will catch you out

- **`npm run lint:fix` touches `src/components/TestCard/`.** Never during a release.
- **A stale `dist/` silently tests the previous commit's code.** The `test:pixel` scripts rebuild
  first on purpose; do not "optimise" that away.
- **electron-builder rejects unknown keys in the `build` block**, `_comment_*` included. It fails
  the whole build, and the error does not name the key up front.
- **`env.json` is optional** despite what older docs said, and it must never be committed.
  `.gitignore` covers it; check anyway.
- **Never commit certificates, `.p12` files or API keys.** There is no situation in which one of
  those belongs in this repository.
