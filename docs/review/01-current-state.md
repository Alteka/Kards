# 01 — Current state

*Phase 0 deliverable. Everything here is observed from the repo at commit `6842bf1`
(branch `feature/modernise`) and `3948005` (branch `master`) unless stated otherwise.*

---

## 0. Corrections to the brief

The brief's Section 1 and Section 4 framing is materially out of date. Correcting it up front,
because several of its hypotheses would send the work in the wrong direction.

| Brief says | Actually |
|---|---|
| "Vue 2 reached EOL Dec 2023 … the modern path is Vite-based" | **The app has been Vue 3 since at least v1.2.0.** `master:package.json` pins `vue: ^3.0.0`, `vue-router: ^4`, `element-plus`. Vue 2 EOL is irrelevant. |
| "vue-cli … effectively unmaintained; the modern path is Vite" | Correct for `master`, but **`feature/modernise` has already done the Vite migration** (`636c57d`, 2026-02-12). |
| "unmaintained for about two years" | Correct about **releases** (last release v1.3.1, 2024-04-03), wrong about **commits** — `master` has work through 2025-07-16 and `feature/modernise` through 2026-08-07. |
| "Electron is likely several major versions behind" | True, but less so than implied: **Electron 34** (Jan 2025), not Electron 12. Current is 43. |
| "Node 16 is long past EOL. The build almost certainly won't run on a current Node" | **The build runs cleanly on Node 22.22.0.** See `02-build-baseline.md`. |
| "Auto-update (likely `electron-updater`)" | **No `electron-updater`, and auto-update is a deliberate omission** — the maintainers judge it wrong for event software, which is correct. `src/main/updateChecker.js` polls the GitHub releases API once, 10 s after launch, and offers to open a web page. The defect is that the notification is unreliable, not that it exists (F-005). Windows also has an unmentioned second channel: a **WinGet** package. |
| "There is a web build (Kards Online). Determine whether it shares this codebase" | **It does not.** `src/components/Control/ControlShare.vue:96` builds `https://kards.alteka.solutions/?<encoded config>`. Kards Online is a separate codebase with a **separate implementation of the same cards**. It supports 6 of 9 card types (`ControlShare.vue:66`). |
| "roughly 100,000 installs" | **Corroborated** — v1.3.1 GitHub release assets alone total 100,021 downloads (81% macOS). The maintainers confirm GitHub is the only download origin they know of; there is also a **WinGet** package, which pulls from the same GitHub URLs. |

The install-count and dormancy framing does still drive the right conclusions — see `08-summary.md`.

---

## 1. What the app is

Alteka Kards is an Electron desktop app that puts a **reference test pattern full-screen on a
chosen display** so an AV technician can check a signal chain, a projector, an LED wall or a
capture path. Version `1.3.1`, `appId` `solutions.alteka.kards`, GPL-3.0-only,
`Alteka/Kards` on GitHub.

Its value proposition is that the patterns are *correct* — the README states 100% white is
rendered as 235,235,235 (`README.md:17`), i.e. legal/studio range in an 8-bit RGB container.

### Card types (9 top-level, 15 renderable variants)

| Card | `config.cardType` | Component | Notes |
|---|---|---|---|
| Alteka | `alteka` | `TestCard/Alteka.vue` (742 lines) | Branded card, custom logo, pillars, info line. The default. |
| Bars | `bars` | dispatches on `config.bars.type` | 6 subtypes — see below |
| Grid | `grid` | `TestCard/Grid.vue` | Geometry/convergence grid, crosshair, optional circles, diagonals |
| Ramp | `ramp` | `TestCard/Ramp.vue` | Greyscale ramp: linear/stepped, H/V/diagonal/radial, single/double |
| Name | `placeholder` | `TestCard/Placeholder.vue` | Big machine name + FontAwesome icon on a colour |
| Sync | `audioSync` | `TestCard/AudioSync.vue` | A/V sync: `.webm` clips at 24/25/29.97/30/50/59.94/60/100/120 |
| LED | `led` | `TestCard/LedWall.vue` + `LedPanel.vue` | Panel-grid card sized in physical LED panels |
| Clock | `clock` | `TestCard/Clock.vue` | **New on `feature/modernise` only** (`65d5c7e`) |
| DeGhost | `deghost` | `TestCard/Deghost.vue` | Rapid colour cycling to clear LED/plasma image retention |

Bars subtypes (`Testcard.vue:53-68`): `simple` (8-bar), `smpte` (`SMPTE.vue`),
`arib` (`ARIB.vue`), `hdr` (`HDR.vue`), `sdi` (`SDI.vue`, pathological), `single` (`Single.vue`).

### Load-bearing features for AV professionals

Ranked by how much damage a regression would do:

1. **Correct pixel levels** on bars, ramp and the greyscale swatches. This is the product.
2. **Putting the card on the right display, full-screen, edge to edge** — `windows.js:188-247`.
   Multi-display selection, per-display fullscreen, and the macOS "separate spaces" handling.
3. **Fill Output vs. fixed card size + position + rotation** (`notFilledCard`) — used to match a
   projector's active raster or a scaler's output window.
4. **Escape closes the card.** An AV tech with a card stuck full-screen on a show display is a
   disaster (`Testcard.vue:273`, and closed issue #48).
5. **A/V sync clips and tone/TTS audio** — the sync test is the reason many people install it.
6. **LED card sized in panels** — LED techs size the card by panel count, not pixels.
7. **Remote control** — OSC and REST/HTTP, discoverable over Bonjour. Used to drive Kards from a
   show control system.
8. **NDI output** — new on `feature/modernise`; long-requested (issue #41, open since 2021).
9. **Export to PNG / set as desktop wallpaper.**
10. **Settings import/export**, Touch Bar, keyboard shortcuts, dark mode.

---

## 2. Actual stack and versions

### `master` — the shipped state (v1.3.1 + 5 unreleased commits)

| | |
|---|---|
| Build | `@vue/cli-service ~4.5.0` + `vue-cli-plugin-electron-builder ~2.1.1` |
| Entry | `background.js` (repo root) — single monolithic main process |
| Electron | `^34.0.0` |
| Vue | `^3.0.0` / `vue-router ^4` / `element-plus 1.0.2-beta.71` |
| Lint | `eslint ^7.32.0`, `plugin:vue/vue3-essential` |
| Package manager | yarn (commit messages reference `yarn.lock`; `resolutions` block present) |

### `feature/modernise` — checked out, in flight, **not released**

| | |
|---|---|
| Build | **Vite `^5.0.0`** + `@vitejs/plugin-vue ^5`, `electron-builder ^24` |
| Entry | `src/background.js` — split into 14 `src/main/*` modules |
| Dev | `concurrently` + `wait-on` + `cross-env VITE_DEV_SERVER_URL` |
| Node | `volta.node = 22.22.0` |
| Lint/format | `eslint ^8.57.0` (`vue3-recommended` + `prettier`), `prettier ^3.8.1` |
| Package manager | npm (`package-lock.json`, `.npmrc` with `legacy-peer-deps=true`) |
| New features | Clock card, NDI output via `grandiose` in a `utilityProcess` |

**Installed versions confirmed in `node_modules`:** electron 34.5.8, vue 3.5.28, vite 5.4.21,
element-plus 1.0.2-beta.71. `grandiose` is **not installed** — see `02-build-baseline.md`.

### Release history (`gh release list`)

```
v1.3.1  2024-04-03   <- latest
v1.3.0  2023-07-19
v1.2.0  2022-04-18
1.1.0   2020-12-23
1.0.0   2020-08-16
0.8.0 / v0.6.0 / v0.5.0 / 0.4.0 / v0.3.0   (2020 alpha/beta run)
```

Cadence: heavy in 2020, then roughly annual, then nothing for **2 years 4 months**.
Tag naming is inconsistent (`v1.3.1` vs `1.1.0` vs `1.2.0-beta`) — this matters because
`updateChecker.js` compares `tag_name` directly.

### Contributors (`git log`)

Two people: **Drew Perry** (the large majority) and **canoemoose**, plus dependabot.
This is a two-person project with one primary author. That is the single most important
input to the migrate-vs-rebuild decision in `07-plan.md`.

---

## 3. Architecture map

```
                      ┌─────────────────────────── MAIN PROCESS ──────────────────────────┐
                      │ src/background.js  (wiring only, 241 lines)                        │
                      │                                                                    │
  OSC :25518/udp ────►│ main/osc.js ──┐                                                    │
  HTTP :8321/tcp ────►│ main/rest.js ─┤                                                    │
  Bonjour/mDNS  ◄─────│               │                                                    │
                      │               ├──► main/config.js   _config  (single mutable obj)   │
  macOS Touch Bar ───►│ main/touchBar │        │       ▲                                    │
  App menu ──────────►│ main/menu.js  │        │       │   electron-store 'KardsConfig'     │
                      │               │        ▼       │                                    │
                      │ main/ipc.js ──┴──► ipcMain 'config' ──────────────┐                 │
                      │ main/windows.js  (BrowserWindow lifecycle)        │                 │
                      │ main/audio.js    (say → wav → base64 into config) │                 │
                      │ main/settings.js (import/export json)             │                 │
                      │ main/updateChecker.js (GitHub releases poll)      │                 │
                      │ main/ndi.js ──► utilityProcess ndi-worker.js ──► grandiose ──► NDI  │
                      └───────────────────────────────┬───────────────────┼─────────────────┘
                                                      │ IPC 'config'      │ capturePage @25fps
                      ┌───────────────────────────────▼───────────────────▼─────────────────┐
                      │ RENDERER (Vue 3, hash router, preload.js contextBridge)             │
                      │                                                                     │
                      │  #/          views/Control.vue   ── 13 × components/Control/*.vue    │
                      │  #/testcard  views/Testcard.vue  ── 17 × components/TestCard/*.vue   │
                      │                                     + dom-to-image (PNG export)      │
                      └─────────────────────────────────────────────────────────────────────┘
```

### Windows

Up to three `BrowserWindow`s:

- **Control window** — `windows.js:48-84`. Fixed 620×450, non-resizable, auto-resized to the
  Vue tree's height via a `controlResize` IPC round-trip (`windows.js:86-90`).
- **Test card window** — `windows.js:188-247`, `299-359`. Frameless. Fullscreen on the selected
  display, or a centred window. Also created *hidden* for headless PNG export
  (`windows.js:403-435`, `state.headlessExportMode`).
- **NDI capture window** — `ndi.js:73-106`. Hidden, muted, loads `#/testcard`, `capturePage()`d
  at 25 fps and the BGRA bitmap posted to the worker.

### State model

There is **no state library**. A single plain-object `config` is the entire application state.

- Canonical copy lives in `src/main/config.js` module scope (`_config`).
- Seeded from `src/defaultConfig.json` merged over `electron-store`'s `KardsConfig`
  (`config.js:28-36`). `visible` and `audio.enabled` are forced false at boot.
- Mutated by: the control renderer (`Control.vue:338` deep watcher → `ipcRenderer.send('config')`),
  OSC (`osc.js`), REST PUT (`rest.js:108`), the app menu, the Touch Bar, keyboard shortcuts in the
  test card window (`windows.js:389`), and several main-process modules that mutate `getConfig()`
  in place (`audio.js:37`, `ipc.js:115`, `windows.js:448`).
- Broadcast back out on the `'config'` channel to whichever windows exist.

Every writer mutates the same object and then re-broadcasts it. There is no schema, no validation,
no versioning and no single owner. This is the root cause of a large share of the findings in
`04-findings.md`.

### IPC surface

`src/preload.js` exposes `window.ipcRenderer` with `send` / `receive` / `invoke`. The channel
allow-lists are present but **commented out** (`preload.js:10-11`, `16-17`), so the renderer can
address any channel.

Main-process listeners, by module:

| Module | Channels |
|---|---|
| `windows.js` | `controlResize`, `getScreens`, `moveWindowTo`, `testCardKeyPress`, `exportCard`, `selectImage`, `saveAsPNG`, `setAsWallpaper` |
| `ipc.js` | `config`, `getConfigTestCard`, `getConfigControl`, `resetDefault`, `aboutDialogInfo`, `closeTestCard`, `openLogs`, `openUrl`, `selectMaskImage`, `networkInfo`, `startNdi`, `getNdiStatus` (handle) |
| `audio.js` | `createVoice`, `updateAudioText`, `loadAudioFile` |
| `settings.js` | `exportSettings`, `importSettings` |
| `rest.js` / `osc.js` | `audioDevices` (registered **twice**, once in each) |

Renderer→main is fire-and-forget `send` for everything except `getNdiStatus`. There is no
request/response discipline and no error channel.

### Where the test card actually gets rendered

**In the DOM, with CSS.** There is no `<canvas>` and no WebGL anywhere in the card path.

- `views/Testcard.vue:13-21` renders `<component :is="cardComponent">` inside `#cardForPNG`,
  plus up to three duplicate layers for the diagonal "motion" animation
  (`Testcard.vue:17-21`, CSS keyframes at `:446-496`).
- Levels come from `components/TestCard/Swatch.vue:20-29` — `ireToDecimal()` maps IRE 0–100 to
  decimal 16–235, then multiplies a per-colour unit vector (`Swatch.vue:75-94`).
- Fixed CSS level classes live at `Testcard.vue:510-527`
  (`.white` = `rgb(235,235,235)`, `.white75` = `rgb(180,180,180)`, `.black` = `rgb(16,16,16)`,
  `.superblack` = `rgb(0,0,0)`, `.superwhite` = `rgb(255,255,255)`, `.grey40` = `rgb(104,104,104)`).
- Ramps are CSS `linear-gradient` / `radial-gradient` (`Ramp.vue:49-127`).
- PNG export is `dom-to-image` (`Testcard.vue:249`) — DOM → SVG `<foreignObject>` → `<img>` →
  `<canvas>` → `toDataURL('image/png')`.

This is significant: **every pixel the user is checking is produced by Chromium's CSS/compositing
pipeline and then colour-managed to the display profile.** See Phase 4 in `04-findings.md`.

### Persistence and file locations

- Settings: `electron-store` → `%APPDATA%/kards/config.json` (Windows) / `~/Library/Application Support/kards`.
  Key `KardsConfig`. Includes base64 blobs: custom logo, mask image, TTS wavs, imported audio file.
- Generated audio: `<userData>/voice.wav`, `<userData>/text.wav`, `<userData>/tts0N.wav` (`audio.js:29,48,66`).
- Wallpapers: `<userData>/wallpaper<random>.png` (`windows.js:506`) — **never cleaned up**.
- Logs: `electron-log` default path, exposed via the More menu → Logs.

---

## 4. How to build and run it today

Verified working on this machine (Windows 11, Node 22.22.0, npm 10.9.4) — see `02-build-baseline.md`
for the full account.

```bash
npm install                       # node_modules was already present; see 02 for the caveat
cp env.example.json env.json      # optional in practice — background.js:33-37 try/catches it
npm run electron:serve            # vite dev server + electron
npm run electron:build            # vite build && electron-builder
```

`npm run build` (renderer only) succeeds in ~10s and emits `dist/` (909 kB JS / 382 kB CSS,
single chunk, plus ~13 MB of audio and video assets inlined as separate files).

---

## 5. Dead code, duplication and files nobody should have to read

**Dead / orphaned:**

| Path | Why it's dead |
|---|---|
| `about.html` | References `./src/renderer.js` and `./styles/ui.css`, neither of which exists. Not in the `build.files` glob. Leftover from an `electron-about-window`-era setup. |
| `env.json.example` | Superseded by `env.example.json` (added `eebe793`). Two files, same content, different formatting. |
| `src/assets/particles.min.js` | Vendored, minified particles.js. Nothing references it — the DeGhost card imports the *unminified* copy instead (`Deghost.vue:10` → `../../../public/particles.js`). Dead, and it is what makes `npm run lint` dangerous — see below. (`public/particles.js` itself is **live**, but importing a module out of Vite's `publicDir` is against Vite's own guidance: the file ends up both bundled into `main.js` and copied verbatim to `dist/`.) |
| `defaultConfig.json:28` `mask.image` | Every consumer uses `mask.imageSource` (`ipc.js:115`, `Testcard.vue:5,8`, `ControlMenu.vue:73`). `mask.image` is written by nothing and read by nothing. |
| `src/main/audio.js:61-75` `textToSpeachData()` | Not exported, not called. Also returns from inside a callback, so it would return `undefined` regardless. |
| `package.json:16` `postinstall` → `patch-grandiose.js` | Patches `node_modules/grandiose/binding.gyp` for macOS arm64. Silently no-ops when grandiose isn't installed, which is the current state on this machine. |
| `browserslist` in `package.json:105-109` | Meaningless for an Electron target; a vue-cli leftover. |

**Duplication:**

- **Card rendering is implemented twice** — once here, once in the separate Kards Online web app
  at `kards.alteka.solutions`. `ControlShare.vue:66` shows Kards Online supports only
  `alteka, bars, grid, ramp, placeholder, audioSync` — it has already fallen behind on `led`,
  `deghost` and `clock`.
- `bonjour` is instantiated **three times** independently (`background.js:11`, `rest.js:6`,
  `osc.js:5`), and `bonjour.unpublishAll()` / `destroy()` is called on the `background.js`
  instance only (`background.js:71-72`), while `rest.stop()` calls it on the `rest.js` instance
  (`rest.js:75-76`). The `osc.js` instance is never cleaned up.
- `ipcMain.on('audioDevices')` is registered in both `rest.js:64` and `osc.js:25`.
- The 10-step ramp gradient string is written out four times verbatim
  (`Ramp.vue:51,63,72,99,108`) — ~1.5 kB of duplicated colour stops.
- `Ramp.vue:56-127` — `computedRamp1` and `computedRamp2` are near-identical inverted copies.

**Files nobody should have to read:**

- `src/components/TestCard/Alteka.vue` — 742 lines, single file, template + script + scoped SCSS.
- `src/main/osc.js` — 519 lines, of which ~460 are a hand-written, copy-pasted endpoint per config
  key. Contains at least two accidental duplicate registrations (`/showInfo` at `:83` and `:107`,
  `/placeholder/icon` at `:214` and `:221`).
- `src/main/menu.js` — 526 lines.
- `src/components/Control/ControlMenu.vue` — 616 lines.

### Tests, CI, types, i18n, a11y

- **Tests: none.** No test runner in `package.json`, no `*.test.*`, no `*.spec.*`, no fixtures.
- **CI: none.** No `.github/` directory at all — no workflows, no issue templates, no dependabot
  config (though dependabot PRs exist, so it is enabled at the org/repo settings level).
- **TypeScript: none.** No `tsconfig.json`, no JSDoc type annotations.
- **i18n: none.** All strings are hard-coded English in templates.
- **Accessibility: not addressed.** `App.vue` disables text selection globally; the test card
  window suppresses the context menu; no ARIA anywhere. For a full-screen test pattern this is
  largely defensible, but the *control* window is a normal form UI and has no keyboard/labelling story.
- **Linting: configured but broken.** See finding F-016 — `npm run lint` runs `eslint . --fix`
  with no ignore configuration, so it lints and would rewrite `dist/` build output and the
  vendored `src/assets/particles.min.js`.

---

## 6. Per-platform packaging as configured

`package.json:63-87`:

- `mac`: target `pkg` only, icon `public/icon.png`. **No `hardenedRuntime`, no `entitlements`,
  no `notarize` block, no `category`.**
- `win`: icon only. `nsis` configured `oneClick: false`, no desktop shortcut, menu category.
  **No `signingHashAlgorithms`, no certificate configuration.**
- `linux`: **no `linux` block at all** — electron-builder would fall back to defaults
  (AppImage + snap + deb depending on version). Issues #68 and #105 ask for Linux packaging.
- `files: ["dist/**", "src/**", "package.json"]` — ships the **entire `src/` tree**, including
  every `.vue` source file and the ~13 MB of raw `assets/`, alongside the already-bundled `dist/`.
  The audio and video assets are therefore shipped twice.
- No `publish` block, so `electron-builder` has no update feed configured. Consistent with there
  being no auto-updater — which is a deliberate choice, not an oversight (F-005). Note there is
  also a WinGet package (`AltekaSolutions.Kards`) that the repository never mentions.
- `artifactName: ${productName}-${version}-${os}-${arch}.${ext}`.

There is no `README` or script covering signing, notarisation or release; nothing in the repo
records how v1.3.1 was actually produced.
