# 03 — Dependency, platform and toolchain audit

*Phase 3 deliverable. Versions are from `package.json` on `feature/modernise` @ `6842bf1` and
from `node_modules` as installed; "latest" and publish dates were read from the npm registry
on **2026-08-07**.*

---

## 1. Headline

- **629 packages** installed (254 prod / 355 dev / 117 optional).
- `npm audit`: **41 advisories — 2 critical, 28 high, 10 moderate, 1 low.**
- Of those 41, **three matter** in a desktop context: `electron` itself, `axios`, and the
  `electron-builder` → `tar` chain. The rest is either dev-only, build-time-only, or not
  reachable from any input a user or an attacker controls. §4 does that triage explicitly rather
  than reprinting the audit.
- The two genuine blockers to modernisation are **`element-plus` pinned to a 2021 beta**
  (F-012) and **`grandiose` as a git-over-SSH native dependency** (F-011). Neither shows up in
  `npm audit`.
- **Electron 34 is out of support.** Electron maintains the latest three majors; current is 43,
  so 41/42/43 are supported and 34 receives no security fixes.

---

## 2. Runtime dependencies

Risk = risk of *carrying it as-is*. Effort = effort to get to a supported version.

| Package | Current | Latest | Status | Breaking changes on the path | Risk | Effort |
|---|---|---|---|---|---|---|
| **electron** *(dev dep, but it is the runtime)* | `^34.0.0` → 34.5.8 | **43.3.0** | **Out of support.** Electron maintains the latest 3 majors (41–43). 33 advisories listed against it. | 9 major steps. Node bump inside Electron; Chromium colour-management, compositing, HDR and offscreen-rendering changes; `utilityProcess` API refinements (used by `ndi.js`). **This is the step that can silently change rendered output — F-002.** | **High** | **XL** |
| **vue** | `^3.0.0` → 3.5.28 | 3.5.41 | Healthy, actively maintained | None — same major, floating range already resolves close to latest | Low | S |
| **vue-router** | `^4.0.0-0` → 4.x | **5.2.0** | v4 still fine; v5 is current | v4→v5 is a major, but this app has **2 routes and a hash history** (`src/router/index.js`). Trivial. | Low | S |
| **element-plus** | **`1.0.2-beta.71`** (exact pin, published **2021-08-18**) | **2.14.4** | **Effectively abandoned at this version.** Pre-1.0 beta, 5 years old. | Whole-library major: component API changes, icon system replaced (`el-icon-*` strings → `@element-plus/icons-vue`), CSS custom-property theming replaces the ~130 lines of private-class overrides in `Control.vue:398-507`, Sass rewrite. | **High** | **L–XL** |
| **axios** | `0.27.2` (exact pin) | **1.19.0** | 0.x is unmaintained. Many advisories. | 0.27 → 1.x is a documented major (error shapes, `paramsSerializer`, `transformRequest`). **Used at exactly one call site** — `updateChecker.js:14`. | Medium | **S** |
| **express** | `^4.17.2` → 4.21.x | **5.2.1** | 4.x in maintenance; 5.x current | Router rewrite, `req.query` getter, path-to-regexp v8 syntax. This app uses `.get`, `.put`, `.listen` and one `bodyParser.json()`. Note `'/*'` at `rest.js:70` **is** a breaking pattern in Express 5. | Medium | S |
| **body-parser** | `^1.19.1` | **2.3.0** | 1.x superseded | Ships inside Express 5 — drop the direct dependency entirely | Low | S |
| **bonjour** | `^3.5.0` | 3.5.1 (registry entry created **2013**) | **Unmaintained.** Pulls the vulnerable `multicast-dns` → `dns-packet` → `ip` chain. | Successor is **`bonjour-service`** (maintained, TS, near-identical API) | Medium | S |
| **osc-js** | `^2.3.1` | 2.4.1 (last publish **2024-04-21**) | Low activity but functional; no known advisories | Patch-level | Low | S |
| **electron-store** | `^8.0.1` | **11.0.2** | v8 old; v9+ went ESM-only | ESM migration is the blocker — the main process is CommonJS (`require` throughout `src/main/*`). Needs the main process bundled or converted first. | Medium | M |
| **electron-log** | `^4.4.4` | **5.4.4** | v4 superseded | v5 restructures the transports API. `log.transports.file.findLogPath()` (used at `background.js:98`, `ipc.js:31`) changed. | Low | S |
| **wallpaper** | `5.0.1` (exact pin) | **7.3.1** | Pinned because 6+ is **ESM-only** | Same ESM blocker as `electron-store` | Medium | M |
| **say** | `^0.16.0` | 0.16.0 (last publish **2022-06-26**) | **Unmaintained.** Shells out to `say`/`espeak`/PowerShell SAPI. | No maintained successor with the same cross-platform coverage. Electron has no built-in TTS in the main process; the *renderer* has `SpeechSynthesis`, which would remove this dependency entirely and produce better voices. | Medium | M |
| **dom-to-image** | `^2.6.0` | 2.6.0 (published **2017-10-04**) | **Dead — nine years.** | Replace with `webContents.capturePage()`, which the app already uses for NDI (`ndi.js:121`). See F-009. | **High** | M |
| **grandiose** | `rse/grandiose#cf09bb84` (git, **SSH** in the lockfile) | n/a — personal fork, `0.0.4` | **Cannot install** — see F-011. Also pulls `got@11` and `tmp@0.2.1`, both with advisories and `fixAvailable: false`. | Needs replacing with a registry-published, prebuilt binding | **High** | L |
| **compare-versions** | `^4.1.3` | **6.1.1** | v4 old but stable | v5 dropped the default export in favour of named exports — `updateChecker.js:5` uses the default. One-line change. | Low | S |
| **mousetrap** | `^1.6.5` | 1.6.5 (last publish **2025-02-16**) | **Unmaintained** (final release 2017). Works. | Native `keydown` handling, or `hotkeys-js`. ~20 call sites across `Control.vue` and `Testcard.vue`. | Low | M |
| **vue3-resize** | `^0.2.0` | 0.2.0 (published **2020-12-01**) | **Unmaintained**, `0.x` | Used once (`Control.vue:200`) to report the control window's height. Replaceable with a 5-line `ResizeObserver`. | Medium | S |
| **vue3-resize-text** | `^0.1.0` | 0.1.0 (published **2021-07-22**) | **Unmaintained**, `0.x`. **Declared but not imported anywhere** — `grep` finds no usage. | Delete | Low | S |
| **uuid** | `^8.3.2` | **14.0.1** | v8 very old | v9+ named exports. Check whether it is still used at all. | Low | S |
| **mime-types** | `^2.1.34` | 3.0.2 | Maintained | v3 is ESM-friendly; API stable | Low | S |
| **rollbar** | `^2.24.0` | **3.1.0** | v2 old | See F-028 — decide whether to keep telemetry at all before spending effort here | Low | S |
| **core-js** | `^3.6.5` | 3.50.0 | Maintained, but **pointless for an Electron target** — a vue-cli/babel leftover | Delete | Low | S |
| **@electron/universal** | `^1.2.1` (`^2.0.1` on `master`, with a `resolutions` pin back to `^1.2.1`) | **3.0.6** | v1 old. Note `master` and `feature/modernise` disagree — see F-036 note below. | Only needed for macOS universal builds; electron-builder ≥24 pulls its own | Low | S |
| **@fortawesome/fontawesome-free** | `^6.1.1` | **7.3.1** | Maintained | v7 renamed some icon classes. `defaultConfig.json:34-35` stores icon class names **in user config** (`fa-desktop`, `fa-brands fa-spotify`), so a FontAwesome major **breaks saved user settings** — needs a migration step (F-006). | Medium | M |

**Version disagreement between branches.** `master:package.json` declares
`"@electron/universal": "^2.0.1"` with a yarn `resolutions` block pinning it back to `^1.2.1`;
`feature/modernise` declares `^1.2.1` directly and drops `resolutions` (correctly, since it moved
to npm, where `resolutions` is a no-op). Worth a deliberate check when the branches are
reconciled — see `06-branch-reconciliation.md`.

## 3. Build toolchain

| Package | Current | Latest | Notes | Risk | Effort |
|---|---|---|---|---|---|
| **vite** | `^5.0.0` → 5.4.21 | **8.2.1** | 3 majors behind. Advisories against 5.x are dev-server-only (`server.fs.deny` bypass, `.map` path traversal, the esbuild dev-server CORS issue) — **not reachable in a shipped Electron app**, but they matter to anyone running `npm run electron:serve`. | Medium | M |
| **@vitejs/plugin-vue** | `^5.0.0` | 6.0.8 | Moves with Vite | Low | S |
| **electron-builder** | `^24.0.0` → 24.13.3 | **26.15.3** | 24.x pulls the vulnerable `app-builder-lib`/`builder-util-runtime`/`tar` chain. `npm audit` names 26.15.3 as the fix and flags it semver-major. | Medium | M |
| **eslint** | `^8.57.0` → 8.57.1 | **10.8.0** | **npm-deprecated: "This version is no longer supported."** 9.x introduced flat config; the repo uses the legacy `eslintConfig` block in `package.json`. | Medium | M |
| **eslint-plugin-vue** | `^9.0.0` | 10.10.0 | Moves with ESLint | Low | S |
| **prettier** | `^3.8.1` | 3.9.6 | Current | Low | S |
| **sass** | `^1.49.11` | 1.102.0 | Current major, but see F-034 — five deprecation categories are silenced, and `@import`/legacy JS API are slated for removal in Sass 2 | Medium | S |
| **concurrently / cross-env / wait-on** | `^8 / ^7 / ^7.2` | 10.0.4 / 10.1.0 / 9.1.0 | Dev-only glue | Low | S |
| **electron-devtools-installer** | `^3.1.0` | 4.0.0 | Dev-only; downloads a Chrome extension from Google at dev launch (`background.js:108`) | Low | S |
| **npm config** | `.npmrc: legacy-peer-deps=true` | — | **Masks real peer-dependency conflicts.** Worth removing and seeing what falls out before an upgrade campaign, so the peer graph is known rather than suppressed. | Medium | S |

### Upgrade path — the ordering constraint

These cannot be done independently, which is the point the brief asks the plan to make explicit:

```
  ①  pixel-test harness (F-022)          ← nothing else is safe without this
        │
        ├─► ②  signing + notarisation + release CI (F-003)   ← independent, do in parallel
        │
        ├─► ③  small, isolated deps: axios, compare-versions, electron-log,
        │        vue-router 5, vue 3.5.x, delete core-js / vue3-resize-text
        │
        ├─► ④  Vite 5→8  +  @vitejs/plugin-vue 5→6           ← touches nothing user-visible
        │        │
        │        └─► ⑤  bundle the main process (CJS→ESM boundary)
        │                  │
        │                  └─► ⑥  electron-store 8→11, wallpaper 5→7   (both ESM-only)
        │
        ├─► ⑦  electron-builder 24→26                        ← must land before ⑧
        │        │
        │        └─► ⑧  Electron 34→43, one or two majors at a time, ① run at every step
        │
        └─► ⑨  element-plus 1.0-beta→2.x + dark-mode CSS rewrite  ← the big one, do LAST and ALONE
```

Specific coupling worth calling out:

- **⑧ before ⑨, never together.** If the Electron bump and the element-plus rewrite land in the
  same release you cannot tell which one changed the output.
- **⑤ blocks ⑥.** `electron-store` ≥9 and `wallpaper` ≥6 are ESM-only; `src/main/*` is CommonJS
  throughout. Either bundle the main process (electron-vite does this) or convert it. Bundling is
  the smaller job and also shrinks the asar (F-021).
- **⑦ before ⑧.** electron-builder 24 predates recent Electron versions' packaging expectations.
- **① before everything.** See F-002 — the whole risk of ⑧ is that it changes pixels silently.
- **F-011 (grandiose) sits outside this graph.** It has to be resolved before ② can produce a
  reproducible CI build, or NDI must be cut from the release.

---

## 4. CVEs, triaged for realistic exploitability

`npm audit` reports 41. Reprinting them would be padding, so here is the honest triage.

### Genuinely matters

| Advisory | Reachability | Action |
|---|---|---|
| **`electron` — 33 advisories against 34.x** (ASAR integrity bypass GHSA-vmqv-hx8q-j7mg, context-isolation bypass via `Function.prototype.bind` GHSA-h7rp-cf8h-j98x, HTTP redirect into local file loader GHSA-v64r-4m7r-3mvq, several use-after-frees, `shell.openPath` null-byte bypass GHSA-5c9j-mhmv-5xgx, …) | **34 is out of support and will receive no further fixes.** Most of these need attacker-controlled content in a renderer, which this app doesn't load today — but the ASAR integrity and context-isolation ones are the ones that would matter alongside F-010 and F-020. | Upgrade to 43 (step ⑧). This is the single most valuable dependency change in the list. |
| **`axios` 0.27.2 — ~40 advisories**, incl. prototype-pollution gadgets in `mergeConfig` (GHSA-43fc-jf86-j433, GHSA-3g43-6gmg-66jw) and SSRF/`NO_PROXY` bypasses | Reachable in principle: exactly one call, to a fixed `api.github.com` URL (`updateChecker.js:14`), so no attacker-controlled URL and no proxy credentials in play. But the app **already has a live prototype-pollution vector** (F-004) — carrying a second library full of pollution *gadgets* in the same process is how a gadget chain gets built. | Upgrade to 1.19.0, or **drop axios entirely** — one `fetch()` call replaces it and removes 40 advisories and a dependency. **Recommended.** |
| **`tar` (critical ×12) / `app-builder-lib` / `builder-util-runtime`** under `electron-builder@24` | **Build-time only.** Path-traversal on archive extraction, credential leak on cross-origin redirect. Not shipped to users. Matters if CI ever extracts an untrusted archive. | Upgrade electron-builder to 26 (step ⑦). Not urgent for users; is urgent for CI hygiene. |

### Does not realistically matter here

- **`vite` / `esbuild` / `rollup` / `postcss`** — dev-server and build-time. `esbuild`
  GHSA-67mh-4wv8-2f99 (any website can read dev-server responses) is real for a developer running
  `npm run electron:serve` on an untrusted network, and nothing else. Not shipped.
- **`shell-quote` (critical), `minimatch`, `picomatch`, `brace-expansion`, `js-yaml`, `flatted`,
  `immutable`, `ajv`, `fast-uri`, `joi`, `lodash`, `@xmldom/xmldom`, `@tootallnate/once`** — all
  transitive under `electron-builder` / `eslint` / `sass`. Build and lint time. Not shipped.
- **`qs` / `body-parser` / `express` / `path-to-regexp` ReDoS** — *these are shipped and reachable*
  over the LAN via the REST server, but the DoS ceiling is "crash the local Kards process", and
  anyone who can reach the endpoint can already reconfigure the app arbitrarily (F-004). **F-004
  is strictly the bigger problem; fix that and these become uninteresting.**
- **`follow-redirects`, `form-data`, `ip`, `dns-packet`, `multicast-dns`** — under `axios` and
  `bonjour`. Resolved by replacing those two.
- **`got@11` / `tmp@0.2.1` under `grandiose`** — both `fixAvailable: false`, because grandiose
  is a pinned git dep. Resolved only by F-011.
- **`uuid` v8 buffer bounds** — needs a caller passing `buf`; nothing here does.

### Not covered by `npm audit`

Worth stating, because the audit gives false comfort:

- `element-plus@1.0.2-beta.71`, `dom-to-image@2.6.0`, `say@0.16.0`, `mousetrap@1.6.5`,
  `vue3-resize@0.2.0`, `bonjour@3.5.0` are all **unmaintained with no advisories**, which means
  no-one is looking. Absence of CVEs in a dead package is not evidence of safety.
- The two most serious security findings in this review — the unauthenticated LAN API with
  prototype pollution (F-004) and the disabled IPC allow-list (F-010) — are **application code**,
  not dependencies. No amount of `npm audit fix` touches them.

---

## 5. Per-platform concerns

### macOS — the primary platform (81% of v1.3.1 downloads)

| Concern | State |
|---|---|
| Apple silicon | Handled — separate `mac-apple-silicon`, `mac-intel` and `mac-universal` pkgs shipped for v1.3.1 |
| Universal binaries | `@electron/universal` present, `electron:build:universal` script exists |
| **App bundle signature** | **Present.** `Kards.app/Contents/_CodeSignature/CodeResources` is in the shipped payload (`02-build-baseline.md` §4a). Whether it is Developer ID or electron-builder's automatic arm64 ad-hoc signature is undetermined — **Q1**. |
| **Installer signature** | **Absent, verified.** All three v1.3.1 `.pkg` files (and v1.2.0) have zero `<signature>` / `<X509Certificate>` elements in their xar TOC. Signing the app inside an unsigned wrapper does not help: Gatekeeper evaluates the *package*. **This needs a Developer ID *Installer* certificate — a different cert type from the Application one.** |
| **Hardened runtime** | **Not configured.** No `mac.hardenedRuntime`, no entitlements plist. |
| **Notarisation** | **Not configured, and confirmed absent from the artefacts** — no stapled ticket in any shipped `.pkg`. Apple retired `altool` in Nov 2023 (after v1.3.0, before v1.3.1), so this must be set up on `notarytool`, with `xcrun stapler staple` so the package validates **offline** — which matters a lot at a venue. |
| Certificates | Membership status unconfirmed — **Q1**, and it is pure lead time (~$99/yr, days if re-verification is needed). Issue #110 (Oct 2024) is a user hypothesising expiry; the maintainer's reply confirms it is known and offers `sudo installer -pkg …` as the workaround. |
| Target format | `pkg` only. No `dmg`, no zip. Fine given auto-update is deliberately not used (F-005) — a `zip` target would only be needed for `electron-updater`. A **Homebrew cask** is the recommended addition instead. |
| Minimum OS | Not declared. Electron 34 requires macOS ≥11 (Big Sur); Electron 43 requires **macOS ≥12 (Monterey)**. The upgrade drops Big Sur users, who are hard to reach at the best of times (F-005). Needs a release note, and argues for one last Electron-34 release first. |
| `simpleFullscreen` handling | `windows.js:205-235` branches on `process.getSystemVersion()` and tests `version[0] > 10` for Catalina-or-newer. This is 2019-era logic on a 2026 codebase; every supported macOS now takes the same branch, and the two `else` arms are dead. Worth simplifying, carefully, because closed issue **#19** and hotfix branch `hotfix/macclosewindowbug` are both about this code. |

### Windows — 19% of v1.3.1 downloads

| Concern | State |
|---|---|
| Signing | **Never done, by choice** — the maintainers judged OV certificates too expensive, which was reasonable when they meant several hundred pounds a year *plus* a hardware token. **Re-price it:** Azure Trusted Signing is ~**$10/month** for small organisations — Microsoft-operated, no token, works unattended on a stock CI runner, and accrues SmartScreen reputation. Eligibility needs an org with 3+ years of verifiable history; DigiCert KeyLocker is the fallback. At ~$120/yr against ~19k Windows downloads the cost argument no longer holds. |
| SmartScreen reputation | Unsigned installers accrue **no** reputation at all, so every release is flagged indefinitely rather than temporarily. Any non-EV certificate starts a reputation-building period; EV skips it. |
| Defender | Issue **#110** covers macOS, but electron-builder NSIS installers are periodically false-positived by Defender too. Unsigned makes it near-certain. |
| Installer | NSIS, `oneClick: false`, `perMachine: false`, no desktop shortcut. Builds cleanly. |
| **WinGet** | `AltekaSolutions.Kards 1.3.1` is published in the WinGet community repo — an existing, hash-verified, user-initiated update channel that the repository does not mention anywhere. Needs a manifest PR per release; add it to `docs/RELEASING.md`. |
| **Portable build** | Requested in issue **#104** (AV techs on client laptops where installing is not permitted — a very well-targeted request for this product). electron-builder supports `target: "portable"` for near-zero effort. |
| DPI scaling | **Broken** — see F-007, issues #112, #111, #30. This is the most-reported Windows-specific defect. |
| Arch | x64 only. No arm64 Windows build, despite arm64 Windows laptops now being common. Low effort in electron-builder. |

### Linux — 0% because nothing has ever shipped

| Concern | State |
|---|---|
| Packaging | **No `linux` block in `build` config, and no Linux artifact in any release.** electron-builder would fall back to defaults if asked. |
| Requests | Issues **#68** (2022, "Linux distribution", with a user reporting they got it to compile) and **#105** (2023, "deb or flathub version for Ubuntu"). |
| Raspberry Pi | Issue #68 asks for ARM/Pi support with GPIO and an I2C OLED. **This is not viable** — Electron dropped 32-bit ARM Linux support, and a Pi Zero 2 W cannot run a Chromium compositor at a usable frame rate for a full-screen test pattern. It should be declined explicitly rather than left open for another four years. The README makes no Pi claim, so nothing needs correcting there. |
| Effort | AppImage + deb is genuinely cheap (a `linux` block and a CI job). Flatpak is more work. **Nothing about the app is platform-specific except `say` (TTS) and `wallpaper`**, both of which have Linux paths of varying reliability. |

---

## 6. Update-channel integrity, end to end

**Auto-update is deliberately not implemented.** The maintainers' position — Kards is event
software, and an updater that downloads 112 MB and asks for a restart mid-show is actively
harmful — is sound, and this section audits the model they chose rather than arguing for a
different one. See **F-005**.

There are, in fact, **two** channels. Only one of them was designed.

### Channel 1 — in-app notify-on-launch (macOS and Windows)

```
app start
  └─ +10s ─► axios GET https://api.github.com/repos/alteka/kards/releases/latest   (unauthenticated, TLS)
              ├─ ok  ─► compare-versions(tag_name, version) ─► dialog ─► shell.openExternal('https://alteka.solutions/kards')
              └─ err ─► log.error()   [silent to the user, never retried]
```

- **Transport:** HTTPS to `api.github.com`, so the version check is not trivially spoofable
  without a CA compromise or a proxy MITM. Fine.
- **Artefact integrity: none, and this is the weak link.** The user is sent to a web page to
  download an installer by hand. There is no verification step in the app — and per §4a of
  `02-build-baseline.md`, **the shipped macOS `.pkg` is unsigned and un-notarised**, so the OS
  cannot verify it either. The entire chain of trust is "the user recognises the website", and
  the OS actively tells them not to trust the result (issues #110, #107).
- **Availability:** one attempt at T+10 s, no retry, no re-check when the network appears,
  rate-limited shared endpoint (60/hr/IP unauthenticated), silent failure. For a laptop being
  set up in a venue this is the condition most likely to obtain.
- **Rollback / downgrade:** not applicable.

### Channel 2 — WinGet (Windows only, and undocumented in the repo)

`AltekaSolutions.Kards` is published in the WinGet community repository at version `1.3.1`
(verified: `winget search Kards`). This is a genuine second channel that nothing in the
repository mentions.

- **Artefact integrity: better than channel 1.** WinGet verifies the download against a SHA-256
  recorded in the manifest at `microsoft/winget-pkgs`, so tampering in transit or at the release
  URL is detected even though the installer is unsigned. It does not stop SmartScreen warning at
  install time.
- **Availability:** good — `winget upgrade` is user-initiated, which fits the project's chosen
  philosophy exactly.
- **Maintenance:** requires a manifest PR per release. Nothing in the repo records this, so it
  will be missed. It belongs in `docs/RELEASING.md`.
- **There is no macOS equivalent.** A **Homebrew cask** would provide the same properties
  (user-initiated, hash-verified, no in-app interruption) for the platform that is 81% of
  downloads and the one currently blocked by Gatekeeper. This is the highest-value, lowest-cost
  addition to the update story.

### What to fix

In priority order, none of which involves adopting an auto-updater:

1. **Sign and notarise** (F-003). Every other improvement here is downstream of the OS being
   willing to install what the user downloads.
2. **Make channel 1 reliable** (F-005): retry with backoff, re-check on network-up, surface
   failures, add a manual "Check for updates" menu item.
3. **Add a Homebrew cask**; keep the WinGet manifest current as a release step.
4. Optionally serve the version check from a small static JSON file on `alteka.solutions` rather
   than the GitHub API — no rate limit, and it decouples "latest release" from "latest Git tag",
   which matters given the repo's inconsistent tag naming (`v1.3.1` vs `1.1.0`).

---

## 7. Minimum supported OS — then and now

| | v1.3.1 era (Electron ~29–34, 2024) | Electron 43 (current) |
|---|---|---|
| macOS | 10.15 Catalina → 11 Big Sur | **12 Monterey** |
| Windows | 10 (1809+) | **10 (1809+)** — unchanged; Windows 7/8 support ended at Electron 23 |
| Linux | glibc-era Ubuntu 18.04+ | Ubuntu 20.04+ / glibc 2.31+ |

The macOS floor is the one that moves. Anyone still on Big Sur or earlier will be stranded — and
because the update notification is best-effort and silently skipped when the machine is offline
at launch (F-005), they are likely to be stranded *without ever being told*, still running v1.3.1
with F-001's wrong colour bars. That is an argument for fixing F-003 and F-005 first and shipping
one last **Electron-34-based** release carrying the signing fix and the card fixes, before the
Electron bump raises the floor. It is called out in the sequencing in `07-plan.md`.
