# 09 — Implementation kickoff

**Read this first if you are a new session picking up Alteka Kards.**

The review phase is complete and was **read-only**. This document starts the implementation
phase, which the maintainers have approved. Everything here is downstream of decisions already
made — do not re-open them without being asked.

---

## 1. Orientation — read in this order

| Order | File | Why |
|---|---|---|
| 1 | **this file** | scope, work order, and what not to break |
| 2 | `08-summary.md` | one page, the whole picture |
| 3 | `questions.md` → **DECISIONS table at the top** | every decision, already made |
| 4 | `07-plan.md` | the sequenced plan; §"Ordering" is the dependency graph |
| 5 | `04-findings.md` | look up findings **on demand**, not front to back — it is 11k words |
| — | `../signing/apple-certificates.md` | hand to whoever holds the Apple account |
| — | `../signing/windows-code-signing.md` | plain-English Windows guide for Matt |

`01`–`03`, `05`, `06` are supporting evidence. `progress.md` is the running state file; its
revision records at the bottom explain anything here that looks inconsistent.

**Do not re-derive the review.** If you are re-reading `src/` to work out what the app does, read
`01-current-state.md` §3 instead.

---

## 2. Scope decision — one release, everything current

**Superseding the staged v1.4.0 / v1.5.0 / v1.6.0 plan in `07-plan.md`.** The maintainers
(2026-08-08): *"we will not be releasing the halfway-house 1.4.0 without everything being dragged
kicking and screaming up to date as of today."*

**Decision: one release — v1.4.0 — containing everything, including Electron 43 and the
element-plus migration. No v1.4.1 chaser.** Preceded by a signed **pre-release beta** to validate
the signing chain.

### Why one release rather than two back-to-back

1. **Shipping on Electron 34 undercuts the message.** Electron 34 is out of support with 33 open
   advisories. Announcing "we're back, it's fixed and signed" on an unsupported runtime invites
   the obvious question.
2. **A second release cycle is not free.** Signing, notarisation, stapling, release notes, WinGet
   manifest PR, Homebrew cask bump — all of it repeats, for no user-visible benefit.
3. **My original objection dissolves.** I argued for staging so you could tell "we deliberately
   changed the colour bars" from "Electron 43 silently changed the pixels". That is still the real
   risk — but **the bisection point needs to be a commit with a green pixel harness, not a
   release.** Build the harness first, run it either side of every pixel-affecting change, and by
   the time you ship you already know exactly what moved what. Release granularity was the wrong
   tool.
4. After 28 months of silence, one confident release beats two hesitant ones.

### What this costs, stated plainly

**Electron 43 raises the macOS floor from 11 to 12.** That drops macOS 11 (Big Sur) users, and any
still on 10.15 that v1.3.1 supported. Honest assessment: those users are *already* stranded — the
installer they'd download is unsigned and won't run, and the update notification frequently never
fires. Shipping them one more Electron 34 build they also cannot install helps nobody. But it is a
deliberate choice and belongs in the release notes explicitly, not as a footnote.

### The beta

Cut **`v1.4.0-beta.1` as a GitHub pre-release**, signed and notarised, once S2a lands.

The point is to validate the signing chain on real Macs before the full release, which is the one
thing that cannot be tested any other way. Useful property, verified: the update checker calls
`/releases/latest`, and the GitHub API **excludes pre-releases** from that endpoint — so a beta
will not notify the existing install base. It is opt-in by construction, exactly as wanted.

### element-plus is in, but it is the droppable one

M8 (rebuilding the control window off element-plus 1.0.2-beta.71, published 2021) is in scope —
it is the most egregiously out-of-date thing in the tree and "up to date as of today" doesn't hold
without it. Two things make it safe to include:

- It touches **only the control window**. It does not go near `src/components/TestCard/`, so it
  carries no output-correctness risk.
- **Nothing else depends on it.** It is the last item, and it can be cut late without unpicking
  anything else.

**So it gets a cut line.** If it isn't done and stable by the point everything else is ready,
drop it and ship. Do not let it hold the release hostage — that is exactly how a modernisation
turns into a rewrite by accident (`07-plan.md` §8a).

---

## 3. State of the world

- **Repo:** `C:\Users\matt.james\Documents\Repos\Kards` → `github.com/Alteka/Kards`
- **Working branch:** `feature/modernise` @ `6842bf1` — the baseline, **not** `master`.
- **`master`** @ `3948005` has one commit `feature/modernise` lacks. See A2.
- **Last release:** v1.3.1, 2024-04-03.
- **Build works:** `npm run build` ≈ 10 s on Node 22.22.0 (Volta-pinned). `npx electron .` runs.
- Working tree has `package.json` / `package-lock.json` modified **from before the review**
  (moving `grandiose` to `optionalDependencies`). They are correct and they belong on
  `feature/ndi` — task A1. Do not commit them to the release line.

### The constraint that shapes everything: this machine is Windows

**I cannot build, sign, notarise or test a macOS build locally.** That is not a small caveat on a
product where macOS is the platform users are blocked on. Consequences:

- **Release CI (S3) moves early**, because a GitHub Actions macOS runner is the *only* route to a
  macOS artifact. It stops being "nice hygiene for later" and becomes a prerequisite.
- Every macOS signing iteration is push → wait for runner → read logs. Minutes per attempt, not
  seconds. Budget for it.
- **macOS behaviour cannot be verified by me at all**: fullscreen/spaces handling
  (`windows.js:205-235`), Touch Bar, the `.pkg` install experience, Gatekeeper acceptance. Someone
  with a Mac must do final acceptance. Flag this rather than quietly assuming CI green means
  working.
- DPI work (F4) is partly testable here — this machine reports a 1.25 scale factor on one of three
  displays — but 150%/200% and the macOS Retina path are not.

---

## 4. Ground rules

The review's read-only rule is lifted. These replace it.

1. **The pixel harness lands before anything that can change output.** F1/F2/F3 (levels), F4
   (DPI), M6 (Electron 43), M7 (colour policy). With everything in one release this is now the
   *only* mechanism separating intended changes from regressions. It does not bend.
2. **Run the harness either side of every pixel-affecting commit**, and record what moved in the
   commit message. That is what replaces staged releases.
3. **Do not modify `src/components/TestCard/` without a failing pixel test and a specific
   reason.** Those 17 files are the product. `Alteka.vue` being 742 lines is not a reason.
4. **One concern per commit, real commit messages.** The branch currently contains
   `6842bf1 "Claude stuff and thigns"` — the whole NDI implementation plus a dependency change.
   Do not extend that pattern.
5. **Ask before anything outward-facing:** deleting remote branches, closing PRs or issues,
   pushing to `master`, force-pushing, publishing a release, opening the WinGet or Homebrew PRs.
6. **`docs/review/` is a record.** Append to `progress.md`; do not rewrite findings to match what
   you did. If a finding is wrong, add a note with evidence.
7. **Never commit certificates, `.p12` files, API keys or `env.json`.** They go in GitHub Actions
   secrets. `.gitignore` already covers `env.json`; check before every commit anyway.

---

## 5. Work order

Sequenced. Estimates are **session-days for me**, re-costed from the review's
human-developer-days. Where they differ sharply from `07-plan.md`, that is why.

### Phase A — foundations (no external dependencies, start immediately)

| | Task | Plan ref | Est. | Notes |
|---|---|---|---|---|
| **A1** | **Park NDI on `feature/ndi`.** Move `ndi.js`, `ndi-worker.js`, `patch-grandiose.js`, the `grandiose` dep, the `postinstall` hook, the NDI drawer in `ControlMenu.vue`, `startNdi`/`getNdiStatus`. **Take the uncommitted `package.json`/`package-lock.json` changes with it.** On the release line make `getNdiStatus` return `available: false`. | S6 | **0.5** | Draft a status update for issue #41 — *you post it*, I don't. |
| **A2** | **Git hygiene.** Cherry-pick `3948005` (diagonal grid lines — `feature/modernise` lacks it and merging without it silently reverts a shipped feature). Add `.github/dependabot.yml`. Prepare — but do not execute — the branch deletions and dependabot PR closures. | — | **0.5** | Branch deletes and PR closes need your go-ahead. |
| **A3** | **Pixel harness.** See §6. | S1 | **1–2** | Writing it is fast; making it non-flaky is the cost. |
| **A4** | **Levels fixes** F1 (bars 0→16), F2 (ramp's missing 204), F3 (unify 16–235). | F1–F3 | **0.5–1** | Only once A3 is green. Harness expectations updated in the same commit as each fix. |
| **A5** | **Small, isolated cleanups:** lint hygiene (S9), dead files, `mask.image`→`imageSource`, bonjour instances, wallpaper temp files (F-011/F-025/F-026/F-029/F-031). | S9, F11 | **0.5** | Good filler while waiting on certificates. |

### Phase B — release pipeline (gated on certificates)

| | Task | Plan ref | Est. | Notes |
|---|---|---|---|---|
| **B1** | **Release CI.** GitHub Actions, macOS + Windows runners, `docs/RELEASING.md`. **Moved early — it is my only route to a macOS build.** | S3 | **1–2** | Iteration is push-and-wait. |
| **B2** | **macOS signing + notarisation.** `mac.identity` set explicitly, `hardenedRuntime`, entitlements, `@electron/notarize` on `notarytool`, `xcrun stapler staple`, plus a CI assertion that the identity starts `Developer ID Application:`. | S2a | **1–3** | **Hard-gated on certificates.** Notarisation trial-and-error is unpredictable; 3 is not a pessimistic ceiling. |
| **B3** | **`v1.4.0-beta.1` pre-release** — validate the chain on real Macs. | — | **0.5** | Needs a human with a Mac to confirm. |
| **B4** | **Update notification reliability** (retry, re-check on network-up, visible failure, manual check) + **Homebrew cask**. | S4, S4b | **0.5–1** | Cask PR needs your go-ahead. |

### Phase C — correctness and data safety

| | Task | Plan ref | Est. | Notes |
|---|---|---|---|---|
| **C1** | **Config migration ladder** — `configVersion`, recursive defaults merge, per-step migrations, `default: () => ({})` on every card prop. Tested against `defaultConfig.json` from every release tag. | S8 | **1** | Highest-value test in the project for an existing install base. |
| **C2** | **`mergeDeep` prototype-pollution guard.** | S7 | **0.25** | Ships regardless of the Q3 risk acceptance. |
| **C3** | **Rollbar** — replace hostname with a random install id, scrub paths, disclose in README + About, opt-out in More menu. | S10 | **0.5** | |
| **C4** | **DPI/device-pixel sizing** (F4) — fixes #112, #111, #30. | F4 | **1** | Partly verifiable here; 150%/200% and Retina are not. |
| **C5** | **PNG export via `capturePage`**, replacing `dom-to-image` (F5). Closes an eleven-issue saga by construction. | F5 | **0.5–1** | Reuses the harness's capture path. |
| **C6** | **F9 before F6**, then config schema + generated OSC handlers + `res.json()` (F-014/15/16). Shape the schema as `{global, outputs[]}` for 2.0. | F6, F9 | **1–2** | Q3 descoped the auth work. |
| **C7** | **IPC + Electron hardening** (F7, F8) — allow-lists, explicit `webPreferences`, CSP, `setWindowOpenHandler`, `will-navigate`, validated `openExternal`. | F7, F8 | **0.5** | |

### Phase D — bring everything up to date

| | Task | Plan ref | Est. | Notes |
|---|---|---|---|---|
| **D1** | Isolated dep bumps; **drop `axios` for `fetch`** (one call site, removes ~40 advisories); delete `core-js`, `vue3-resize-text`, `browserslist`. | M1 | **0.5** | |
| **D2** | **Vite 5→8**, `@vitejs/plugin-vue` 5→6. | M2 | **0.5** | |
| **D3** | **Bundle the main process** (electron-vite). Narrow `build.files` — kills the 98 MB asar (F-021). | M3 | **1–2** | Real integration risk. |
| **D4** | ESM-only deps: `electron-store` 8→11, `wallpaper` 5→7. Blocked on D3. | M4 | **0.5** | |
| **D5** | **electron-builder 24→26.** Must precede D6. | M5 | **0.5** | |
| **D6** | **Electron 34→43.** One or two majors at a time, **harness run at every step**. Re-evaluate HDR (F-030) here. | M6 | **1–3** | Where F-002's silent-drift risk lives. |
| **D7** | **Colour-management preference** — "Accurate levels", default on, `--force-color-profile=srgb` (Q5). | M7 | **0.5** | |
| **D8** | **element-plus → rebuilt control window.** **Cut line applies.** | M8 | **3–5** | Least compressible — needs your visual judgement on the result. |

### Totals

| Phase | Est. sessions |
|---|---|
| A — foundations | 3–4.5 |
| B — release pipeline | 3–6.5 |
| C — correctness | 4.75–7.25 |
| D — up to date | 7.5–13 |
| **Total** | **~18–31 sessions** |

**How to read that.** These are working sessions, not calendar days, and they assume a human is
available to review, approve outward-facing actions, and test on a Mac. The wide ranges are honest:
B2 (notarisation), D3 (main-process bundling), D6 (Electron 43) and D8 (element-plus) are the four
that can surprise. If three of them go badly, the top of the range is optimistic.

**What did *not* compress** relative to `07-plan.md`'s human-developer estimates: certificate
procurement, notarisation iteration, anything needing a Mac, anything needing your visual
judgement, and the element-plus rebuild. Roughly everything else compressed 2–4×.

---

## 6. The pixel harness, specified

Everything hangs on this, so here it is properly. `src/main/ndi.js:60-146` already does 90% of it:
hidden `BrowserWindow` → load `#/testcard` → push config over IPC → `capturePage()` → bitmap.

```
test/pixel/
  run.js          launches electron, drives the matrix
  cards.js        card type × variant × size
  baseline.json   { card, variant, samplePoints:[[x,y]], expected:[r,g,b] }
  README.md       how to run, how to re-baseline
```

- Launch with **`--force-color-profile=srgb`**. Deliberate: the harness measures *what the app
  draws*, isolated from display colour management. What the display does with it is D7's problem,
  decided separately in Q5. Do not conflate them.
- Fixed window size, `show: false`, `setAudioMuted(true)`.
- Wait for `did-finish-load` **and** a render tick — the cards use CSS transitions and
  `Testcard.vue` re-measures on a 1 s timer.
- Force `config.animated = false` and `config.showClock = false` for every capture.
- **Sample specific coordinates, not whole-image hashes.** Whole-image comparison will break the
  first time a font renders half a pixel differently, and then nobody will trust it.

### Day-one validation — do this before trusting it for anything

You already know one correct value and one wrong one. Use them as the harness's own acceptance
test:

| Card | Sample | Expected | Meaning |
|---|---|---|---|
| Bars/simple, 100% white | centre of bar 1 | `235,235,235` | **must pass** — the app's documented claim |
| Bars/simple, 75% yellow | centre of bar 2 | `180,180,0` | **must currently FAIL** against `180,180,16` — this is F-001 |

If it reproduces the documented value *and* detects the known bug, it works. If it cannot, **stop
and fix the harness — do not proceed to A4**, and treat the difficulty as information about the
whole plan (`07-plan.md` §8a closes on exactly this point).

Then record the full Electron 34 baseline across all 15 variants **before any fix**. That baseline
is what makes D6 safe.

---

## 7. Definition of done for v1.4.0

- [ ] Signed **Developer ID Application**, packaged **Developer ID Installer**, notarised via
      `notarytool`, **stapled**; CI asserts the identity string
- [ ] Windows: signed if Q1b resolved yes, otherwise explicitly noted as unsigned
- [ ] Release CI green on both runners; `docs/RELEASING.md` incl. WinGet manifest + Homebrew cask
- [ ] Update notification reliable; manual "Check for updates" present
- [ ] Clock card — verified for an **upgrading** user, not just a fresh install (F-006)
- [ ] Config migration ladder, tested against every historical `defaultConfig.json`
- [ ] Prototype-pollution guard; Rollbar scrubbed, disclosed, opt-out present
- [ ] Colour bars, ramp steps, level range, DPI sizing, `capturePage` export
- [ ] **Electron 43**, Vite 8, electron-builder 26, main process bundled
- [ ] element-plus migrated **or** consciously cut at the cut line
- [ ] Pixel harness green in CI, baseline committed, every deliberate change documented
- [ ] `v1.4.0-beta.1` validated on a real Mac by a human
- [ ] Release notes cover: malware warning fixed · colour bars changed and why (Q6, link the
      reference values) · ramp changed · **macOS 12 minimum**

---

## 8. Traps

- **`npm run lint` rewrites files.** `eslint . --fix` with no ignore config, so it walks `dist/`
  and `src/assets/particles.min.js`. Fix in A5 before running it.
- **`src/main/windows.js` is where the bugs live** — eight closed issues plus #112 from one
  534-line file, coordinated by three `setTimeout(…, 500)` calls.
- **F-024 before any OSC bind change.** OSC `/audio/file` reads an arbitrary local file and is
  loopback-only today; changing the bind first turns a local issue into a LAN-reachable one.
- **The dataJAR AutoPkg recipe pins the old signing identity** and will fail when B2 lands. Give
  them a heads-up — they distribute Kards to managed Mac fleets.
  `github.com/autopkg/dataJAR-recipes/tree/main/Kards`
- **`Event-Engineering/ProjectReady`** (your own private repo) hard-codes
  `Kards-1.3.1-mac-apple-silicon.pkg`. It breaks on v1.4.0.
- **Config is shuttled whole over IPC on every keystroke**, base64 blobs included. If something
  feels slow, that is F-018 and it is known.

---

## 9. Open, non-blocking

- **Identify the automated downloader** (Q9). ~100/day on each macOS `.pkg`, none on Windows; real
  v1.3.1 installs ≈ 40,700, not 100k. Cheapest method: attach a throwaway extra `.pkg` to the
  v1.4.0 release and see whether the traffic follows it.
- **Full git-history secret scan** for a Rollbar token committed before `ccf1597`. Not done during
  the review — an explicit gap, not a clean bill of health.
- **2.0** is where multi-output (#62) lands and where migrate-vs-rebuild gets re-run. Not now.

---

## 10. If you are compacted or cleared mid-session

Append what you did to `progress.md` **before** running out of room, in the style of the revision
records already there: what changed, what it means, what is still open. That file plus this one
should let the next session continue without re-reading the codebase.
