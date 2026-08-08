# 02 — Build baseline

*Phase 1 deliverable. A verbatim account of building and running the app as-is, on this machine,
today. No application code, config or lockfile was modified. Where an operation would have
rewritten `package-lock.json`, it was run against a scratch copy outside the repo.*

---

## Machine and toolchain

| | |
|---|---|
| OS | Windows 11 Pro 10.0.26200 |
| Node (in repo, via Volta pin `package.json:116-118`) | **v22.22.0** |
| npm (in repo) | 10.9.4 |
| Node outside the repo (system default) | v24.13.0 |
| npm outside the repo | **v12.0.2** |
| Python (for node-gyp) | 3.12.10 |
| Branch / commit | `feature/modernise` @ `6842bf1` |

Working tree was already dirty before the review started (`package.json` and `package-lock.json`
moving `grandiose` into `optionalDependencies`). That dirt is pre-existing and was left untouched.

---

## Headline result

**The brief's hypothesis that "the build almost certainly won't run on a current Node" is wrong.**

On `feature/modernise` the renderer builds cleanly on Node 22, the Electron app launches and runs,
and `electron-builder` produces a working Windows installer — all without pinning anything beyond
the Volta declaration already in `package.json`.

What *is* broken is narrower and, in two cases, more serious than a toolchain break:

| # | What | Severity |
|---|---|---|
| B-1 | `grandiose` (NDI) cannot be installed — git dependency over **SSH**, and npm ≥12 blocks git deps by default. NDI is silently unavailable in every build produced here. | High |
| B-2 | Output binaries are **unsigned**, and — verified against the published release — **the shipped macOS `.pkg` files are unsigned and un-notarised too**, though the `.app` inside is signed. §4a. | Critical |
| B-3 | The app.asar is **98 MB** because assets are shipped twice — once bundled in `dist/`, once raw in `src/`. Installer is 112 MB. | Medium |
| B-4 | `npm run lint` would rewrite build output and a vendored minified file. | Medium |
| B-5 | `npm ci` emits `EPERM` cleanup warnings on Windows and leaves a partially-removed `node_modules/grandiose`. | Low |

Detail below.

---

## 1. Renderer build — `npx vite build`

**Result: success, ~10.5 s.** Run in the repo (only writes to the git-ignored `dist/`).

```
dist/index.html                     0.66 kB │ gzip:   0.40 kB
dist/assets/main-CcBzKsXd.css     381.79 kB │ gzip:  69.34 kB
dist/assets/main-Bco38l_V.js      909.70 kB │ gzip: 277.58 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 10.50s
```

Plus ~13 MB of individually-emitted `.wav` / `.webm` / font assets.

Observations:

- **No errors, no warnings other than the chunk-size hint.** Sass deprecation noise is suppressed
  by `vite.config.mjs:16-22`, which silences five separate deprecation categories
  (`legacy-js-api`, `import`, `global-builtin`, `color-functions`, `function-units`). Those
  deprecations are real and come from `element-plus 1.0.2-beta.71`'s stylesheets; silencing them
  is a deliberate decision to defer a Sass/element-plus problem, not an absence of one.
- Single 910 kB chunk. No code splitting, no vendor chunk. For a desktop app loading from disk
  this costs startup time but nothing else.

## 2. Fresh install from the lockfile — `npm ci`

Run in a **scratch copy** of the working tree at
`…/scratchpad/kards-fresh` (repo `package-lock.json` verified unmodified afterwards via
`git status --porcelain`).

**Result: completes, with warnings, but `grandiose` does not install.**

```
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely
  publicized security vulnerabilities…
npm warn deprecated glob@10.5.0: …
npm warn deprecated eslint@8.57.1: This version is no longer supported.
npm warn deprecated @element-plus/icons@0.0.11: Please use @element-plus/icons-vue instead.
npm warn cleanup Failed to remove some directories [
npm warn cleanup   [ '…\kards-fresh\node_modules\grandiose\node_modules\got',
npm warn cleanup     [Error: EPERM: operation not permitted, rmdir '…\node_modules\grandiose\node_modules\got'] …

> kards@1.3.1 postinstall
> node scripts/patch-grandiose.js && electron-builder install-app-deps
patch-grandiose: binding.gyp not found, skipping
  • electron-builder  version=24.13.3

added 534 packages, and audited 535 packages in 43s
41 vulnerabilities (1 low, 10 moderate, 28 high, 2 critical)
```

After the run: `node_modules/grandiose` **does not exist**. `patch-grandiose.js` printed
`binding.gyp not found, skipping` and exited 0, so nothing surfaced the failure.

### B-1 — `grandiose` / NDI cannot be installed (High)

Three compounding causes, all observed:

1. **The lockfile pins the SSH transport.** `package-lock.json` resolves
   `node_modules/grandiose` to
   `git+ssh://git@github.com/rse/grandiose.git#cf09bb84dc57fdb9f26ed3177db338e866bfd1ae`.
   Any machine or CI runner without a GitHub SSH key configured cannot fetch it, even though
   `package.json` declares the HTTPS-friendly shorthand `rse/grandiose#cf09bb84`.

2. **npm ≥ 12 blocks git dependencies by default.** Installing it standalone with the system npm:

   ```
   $ npm install "github:rse/grandiose#cf09bb84"
   npm error code EALLOWGIT
   npm error Fetching packages of type "git" have been disabled
   npm error Refusing to fetch "github:rse/grandiose#cf09bb84"
   ```

   `npm@12 config get allow-git` returns `none`, with `globalconfig` pointing at an empty Volta
   npmrc — i.e. this is npm 12's default, not local policy. *(Observed on npm 12.0.2. That
   `allow-git=none` is the shipped default rather than something set elsewhere on this machine is
   inferred from the empty globalconfig; the refusal itself is observed.)*

3. Even where it fetches, it is a **native addon requiring the NDI SDK to be installed on the
   build machine**, pinned to a commit on a third-party personal fork (`rse/grandiose`), last
   published as `0.0.4`. `scripts/patch-grandiose.js` then hand-edits its `binding.gyp` in
   `node_modules` to add a macOS arm64 branch.

**Consequence:** every build produced from this branch on a machine like this one ships with
`getNdiStatus` reachable but the worker unable to `require('grandiose')`
(`src/main/ndi-worker.js:13-17`). NDI — the feature this branch adds, and the single
longest-standing feature request (issue #41, open since 2021-01-08) — is dead on arrival,
and the only signal is a line in the log.

**Recommendation:** see F-011 in `04-findings.md`.

## 3. Running the app — `NODE_ENV=production npx electron .`

**Result: launches and runs correctly.**

```
14:28:20.258 > No Rollbar token has been set!
14:28:20.327 > Launching Kards
Hiding Menu in windows
14:28:20.334 > Loaded Config
14:28:20.335 > OSC :: Starting Server on port 25518
14:28:20.341 > Showing control window
14:28:20.409 > REST :: HTTP Server running and listening on port 8321
14:28:22.084 > Audio :: Updated audio text (You are listening to Kards!) has been saved to  …/text.wav
14:28:22.087 > Audio :: Updated name (MJJ Pro Art) has been saved to  …/voice.wav
14:28:23.990 > Audio :: Updated name (MJJ Pro Art) has been saved to  …/voice.wav
14:28:30.465 > Update :: Running latest version - v1.3.1
```

Notes from the log:

- **No `env.json` is required.** The README says it is "required for the app to start"
  (`README.md:43`); in fact `background.js:33-37` try/catches the require and falls back to
  `{ rollbarToken: '' }`. Documentation defect only.
- **`createVoice()` runs twice** (22.087 and 23.990). Both the initial config push and a
  subsequent one trigger TTS regeneration, each shelling out to the OS speech engine and
  base64-ing a wav into the config object. Traced to the config broadcast loop — see F-008.
- `Update :: Running latest version - v1.3.1` — the update check works. It compares the GitHub
  `tag_name` (`v1.3.1`) against `package.json` version (`1.3.1`); `compare-versions` tolerates
  the `v` prefix, so this happens to work despite the repo's inconsistent tag naming.
- The `Network service crashed` / `GPU process exited unexpectedly: exit_code=143` lines at the
  end are the result of the `SIGTERM` used to stop the run, not a fault.

### Live service surface, observed

```
$ netstat -ano | grep -E "8321|25518"
  TCP    0.0.0.0:8321           0.0.0.0:0    LISTENING
  TCP    [::]:8321              [::]:0       LISTENING
  UDP    127.0.0.1:25518        *:*
```

- **REST/HTTP binds `0.0.0.0` — every interface, no authentication.** Confirmed by
  `curl http://127.0.0.1:8321/` returning the full config, and `PUT /` accepting an
  unauthenticated body and returning 200. Advertised on the LAN via Bonjour as
  `Kards-<hostname>._http._tcp` and `._alteka_http._tcp` (`rest.js:34-54`).
- **OSC binds `127.0.0.1` only** — yet it is advertised on the LAN as `._alteka_osc._tcp`
  (`osc.js:490-499`). Remote OSC control is therefore discoverable but non-functional.
  See F-013.

### Reproduced API defects

```
$ curl http://127.0.0.1:8321/name
MJJ Pro Art                                            [HTTP 200]  ✓

$ curl http://127.0.0.1:8321/showInfo
true                                                   [HTTP 200]  ✓

$ curl http://127.0.0.1:8321/window/width
<pre>Internal Server Error</pre>                       [HTTP 500]  ✗
$ curl http://127.0.0.1:8321/grid/size
                                                       [HTTP 500]  ✗
```

**Every REST endpoint whose value is a number returns HTTP 500.** `rest.js:99` calls
`res.send(c[url[1]][url[2]])` with a JavaScript number, which Express interprets as a status
code. Affects `/window/width`, `/window/height`, `/grid/size`, `/screen`, `/led/{width,height,rows,columns}`,
`/notFilledCard/{width,height,top,left,rotate}`, `/deghost/{density,speed}`, `/audioSync/rate`.
See F-012.

```
$ curl http://127.0.0.1:8321/nonexistent
Endpoint does not exist                                [HTTP 200]  ← 200, not 404
```

### Prototype pollution — reproduced

`rest.js:142-157` `mergeDeep()` is called with the raw `JSON.parse`d request body
(`rest.js:110`). Extracted verbatim and run in isolation
(`…/scratchpad/pp-test.js`):

```
before: ({}).polluted = undefined
after : ({}).polluted = "yes"
RESULT: POLLUTED — Object.prototype was modified
```

The corresponding live request (`PUT /` with `{"__proto__":{"…":"…"}}`) is accepted and returns
HTTP 200 without authentication. See F-002.

### Display information Electron reports on this machine

Relevant to Phase 4 — captured from `GET /screens`:

```
display 1: scaleFactor 1.25, 2304x1440, depthPerComponent 8,
  colorSpace {r:[0.6800,0.3200] g:[0.2370,0.7230] b:[0.1400,0.0500] w:[0.3127,0.3290]},
             transfer:SRGB, matrix:RGB, range:FULL
display 2: scaleFactor 1,    2560x1440, depthPerComponent 8,
  colorSpace {r:[0.6652,0.3222] g:[0.2878,0.6203] b:[0.1411,0.0552] w:[0.3127,0.3290]},
             transfer:SRGB, matrix:RGB, range:FULL
display 3: identical to display 2
```

None of these three displays has sRGB primaries (sRGB is r:[0.640,0.330] g:[0.300,0.600]
b:[0.150,0.060]). Chromium colour-manages CSS colours into the display profile, and the app sets
**no** `--force-color-profile` switch — `grep` for `appendSwitch|commandLine|force-color-profile`
across `src/` on both `feature/modernise` and `master` returns nothing. This is the concrete
mechanism behind the brief's highest-risk concern. See F-001 and F-004.

## 4. Packaging — `electron-builder`

Run in the scratch copy.

```
$ npx electron-builder --win --dir
  • electron-builder  version=24.13.3 os=10.0.26200
  • packaging       platform=win32 arch=x64 electron=34.5.8 appOutDir=dist_electron\win-unpacked
  • downloading     url=…/electron-v34.5.8-win32-x64.zip size=116 MB parts=8
  ✓ (no errors)

$ npx electron-builder --win
  • building        target=nsis file=dist_electron\Kards-1.3.1-win-x64.exe archs=x64 oneClick=false perMachine=false
  • building block map
  ✓ (no errors)
```

**Result: success.** Windows NSIS installer produced.

### B-2 — Output is unsigned (Critical)

```
$ Get-AuthenticodeSignature dist_electron/win-unpacked/Kards.exe
Status        : NotSigned
```

Expected for a local build with no certificate — but there is **no signing configuration in the
repo at all**: no `win.certificateFile`/`certificateSubjectName`/`signingHashAlgorithms`, no
`mac.hardenedRuntime`, no `mac.entitlements`, no `afterSign` notarisation hook. Nothing records
how v1.3.1 was actually signed. Whoever ships the next release has to rediscover it.

The maintainers confirm **Windows has never been signed**, on cost grounds. For macOS they
believed builds were signed — §4a below establishes what is actually true of the published
artefacts. See F-003.

## 4a. Signature status of the *published* v1.3.1 artefacts

The local build says nothing about what users actually downloaded, so the released packages were
inspected directly. **Method — read-only, no execution, no full download:** HTTP range requests
for the first 512 KB of each `.pkg` from its GitHub release URL, then parse the xar header
(28-byte big-endian: magic, header size, version, compressed/uncompressed TOC lengths) and inflate
the TOC. A `productsign`-signed package carries `<signature style="RSA">` with a `<KeyInfo>`
certificate chain in that TOC — this is exactly what `pkgutil --check-signature` reads.
Scripts: `…/scratchpad/xar-sig.js`, `…/scratchpad/bomcheck.js`.

```
Kards-1.3.1-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-apple-silicon.pkg   <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-intel.pkg           <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.2.0-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false   (control)
```

**None of the shipped macOS installers is signed.** The TOC file list —
`Distribution`, `solutions.alteka.kards.pkg`, `Bom`, `Payload`, `PackageInfo` — also contains **no
stapled notarisation ticket**.

The payload's Bom (path manifest, 90 KB inflated, fetched by a second range request at the TOC's
recorded offset) tells the other half of the story:

```
inflated: 90071  magic: "BOMStore"
FOUND   Kards.app
FOUND   _CodeSignature
FOUND   CodeResources
absent  embedded.provisionprofile
```

**The `.app` bundle inside *is* signed; the `.pkg` wrapper never was, and nothing was notarised
or stapled.** For a `.pkg` delivered over the internet Gatekeeper evaluates the *package*, so
signing the app inside an unsigned, un-notarised wrapper buys nothing at the point where users
are blocked. That is the direct, confirmed cause of issues #110 and #107.

**Which certificate signed it — resolved from a third-party source.** The Bom proves the bundle
carries *a* signature, not *whose*; the CodeDirectory blob sits inside a 189 MB payload that was
not fetched. But the `autopkg/dataJAR-recipes` AutoPkg recipe for Kards (added 2025-02-28) was
written by someone who *did* have the package, and it records the signature verbatim:

```xml
<key>requirement</key>
<string>identifier "solutions.alteka.kards" and anchor apple generic
  and certificate leaf[subject.CN] = "Apple Development: Drew Perry (D4H96T8MEW)"
  and certificate 1[field.1.2.840.113635.100.6.2.1]</string>
```

- **`Apple Development:` is a development certificate**, not `Developer ID Application:`. It is
  scoped to the team's own machines and TestFlight and **cannot satisfy Gatekeeper elsewhere**.
- **OID `1.2.840.113635.100.6.2.1` is the Apple WWDR intermediate** — the chain used by
  Development and App Store certificates. Developer ID chains carry `…6.2.6`. So the certificate
  type is confirmed twice, independently of the CN string.

The membership was therefore active at build time (development certificates require one); the
build simply selected the wrong identity. See F-003.

### WinGet — a Windows channel that already exists

```
$ winget search Kards
Name   Id                     Version  Source
Kards  AltekaSolutions.Kards  1.3.1    winget
```

Windows users can already `winget upgrade`, and WinGet validates the download against a SHA-256
in its manifest, so it is not wholly dependent on code signing. It requires a manifest PR to
`microsoft/winget-pkgs` per release, which belongs on the release checklist. **There is no macOS
equivalent** — the wrong way round, given macOS is 81% of downloads. See F-005.

Note this does not explain the download anomaly in §6: WinGet installs pull from the same GitHub
release URLs and so are already counted, and they are Windows-only — the Windows figures are the
low ones.

### B-3 — 112 MB installer, 98 MB asar (Medium)

```
dist_electron/Kards-1.3.1-win-x64.exe            112 MB
dist_electron/win-unpacked/resources/app.asar     98 MB
```

`package.json:66-70` sets `files: ["dist/**", "src/**", "package.json"]`. Both are shipped, so
every audio and video asset appears twice in the asar:

```
\src\assets\audiosync\100.webm      \dist\assets\100-CJlKyNKW.webm
\src\assets\audiosync\120.webm      \dist\assets\120-BvXpd9x6.webm
…                                   …
\src\assets\audio\phase.wav         \dist\assets\phase-uQF2Tj9v.wav
```

Roughly 13 MB of assets duplicated, plus the entire uncompiled `.vue` source tree (which also
means the app ships its own source — fine under GPL-3.0, but unintended). `src/` is on the list
because `main` is `src/background.js`; the fix is a narrower glob, not removing `src/` wholesale.

### Not tested here

- **macOS build** — cannot be produced on Windows. `mac.target` is `pkg` only, with no
  `hardenedRuntime`/`entitlements`/notarisation. macOS is the majority platform (see below), so
  this is the most important untested path. The certificate question that gates it is **Q1** in
  `questions.md`.
- **Linux build** — no `linux` block in `build` config and no Linux artifact in any release,
  despite issues #68 and #105.
- **`npm run electron:serve`** (Vite dev server + Electron) — not exercised end to end; the
  production path was tested instead because that is what users get.

---

## 5. Static analysis, as configured

### `npx eslint . --ext .vue,.js,.jsx,.cjs,.mjs`

```
✖ 1240 problems (950 errors, 290 warnings)
```

That number is almost entirely noise, and the reason is itself the finding:

| File | errors/warnings |
|---|---|
| `dist/assets/main-Bco38l_V.js` (build output) | **906** / 0 |
| `src/assets/particles.min.js` (vendored, minified, unused) | **35** / 0 |
| `src/views/Testcard.vue` | 5 / 7 |
| `src/main/audio.js` | 3 / 0 |
| `src/main/ndi.js` | 1 / 0 |
| everything else | 0 errors, 278 warnings |

### B-4 — `npm run lint` can corrupt vendored files (Medium)

There is no `.eslintignore` and no `ignorePatterns` in the `eslintConfig` block
(`package.json:88-104`), so ESLint walks `dist/` and `src/assets/particles.min.js`. The npm
script is `eslint . --ext … --fix` (`package.json:10`) — **with `--fix`**. Running the project's
own lint script rewrites minified build output and a vendored minified library in place. See F-016.

Excluding those two files, the genuine source problems are small and tractable:

| Rule | Count | Where |
|---|---|---|
| `vue/no-reserved-keys` | 5 | `Testcard.vue:99-103` — `_timeIntervalId` etc. in `data()` |
| `no-unused-vars` | 3 | `audio.js` (incl. dead `textToSpeachData`), `ndi.js` |
| `vue/attribute-hyphenation` | 123 | templates |
| `vue/require-default-prop` | 55 | all card components take `config: Object` with no default |
| `vue/attributes-order` | 60 | templates |
| `vue/order-in-components` | 21 | |
| `vue/this-in-template` | 11 | `Control.vue:112,149` — `this.config` inside a template |

`vue/require-default-prop` at 55 occurrences is worth noting beyond style: every test card takes
`config: Object` with no default and no validator, and dereferences deep paths
(`config.bars.color.toLowerCase()`, `Single.vue:6`) with no guard. That is the mechanism by which
the config-merge defect in F-005 turns into a blank card.

### `npm audit`

```
41 vulnerabilities (1 low, 10 moderate, 28 high, 2 critical)
prod 254 / dev 355 / optional 117 = 629 total dependencies
```

Full triage — including which of these are actually reachable from user input in a desktop
context and which are `npm audit` noise — is in `03-dependency-audit.md`. The short version:
almost all of it is dev-only or unreachable; the ones that matter are `electron` itself,
`axios`, and the transitive `tar`/`app-builder-lib` chain under `electron-builder`.

---

## 6. Distribution reality check

From `gh release view`, download counts per artifact:

| Release | macOS | Windows | Linux | Total |
|---|---|---|---|---|
| **v1.3.1** (2024-04-03, current) | 81,199 (81%) | 18,822 | — | **100,021** |
| v1.3.0 (2023-07-19) | 2,959 (42%) | 4,051 | — | 7,010 |
| v1.2.0 (2022-04-18) | 3,498 (44%) | 4,457 | — | 7,955 |

Two things follow.

1. **The ~100k figure in the brief is corroborated** by GitHub release downloads alone, for the
   current release, ignoring any other distribution channel.
2. **The platform mix inverted.** Windows was the majority for v1.2.0 and v1.3.0; macOS is 81% of
   v1.3.1. Some of that is v1.3.1 having been current for 2 years 4 months versus 9–15 months for
   its predecessors — but that accounts for roughly 3× on volume, not 14×, and it does not explain
   the platform flip. It is worth knowing whether the macOS figure reflects real users or an
   automated mirror (a Homebrew cask, an aggregator) before planning around it. Raised as **Q9**
   in `questions.md` — non-blocking, but it changes how you'd weight macOS work.

Either way, **macOS is at minimum an equal-priority platform and probably the primary one**, and
macOS is the platform whose build path is least verified in this review and whose signing story
(notarytool migration, expired certificates) is most likely to be broken. There is still **no
Linux artifact** in any release.
