# 07 — Sequenced plan

*Phase 8 deliverable. Effort is in **developer-days for one experienced developer already
familiar with this codebase**. Ranges are wide where the work is discovery-heavy. "Unblocks"
names what cannot start until the item is done.*

---

> ## ⚠ SUPERSEDED IN PART — read `09-kickoff.md` §2 first
>
> **2026-08-08.** The maintainers will not ship a halfway-house release: *"everything dragged
> kicking and screaming up to date as of today."* So the staged **v1.4.0 / v1.5.0 / v1.6.0**
> structure below is **replaced by a single v1.4.0** containing everything — Stabilise, Fix and
> Modernise together, including Electron 43 and the element-plus rebuild — preceded by a signed
> `v1.4.0-beta.1` pre-release to validate the signing chain.
>
> The **items, dependencies and ordering below all still hold.** Only the release boundaries
> changed. The reason staging was safe to drop: the bisection point for an output change needs to
> be a *commit with a green pixel harness*, not a release — which is cheaper and finer-grained
> than what this document proposed.
>
> Effort figures below are **human-developer-days**. `09-kickoff.md` §5 re-costs everything in
> session-days for an AI-assisted workflow, which is the number to plan against now.

## The shape of the problem

Before the item list, the one thing that should drive sequencing:

> **This is not primarily an engineering backlog. It is a release-process failure with an
> engineering backlog attached.**

The modernisation is roughly 85% done and sitting unreleased on `feature/modernise`
(`06-branch-reconciliation.md`). The app builds and runs on a current toolchain today
(`02-build-baseline.md`). What is actually broken is the path from a fix to a user:

- The shipped macOS `.pkg` files are **unsigned and un-notarised** — verified directly against the
  published v1.3.1 artefacts (`02-build-baseline.md` §4a). macOS is 81% of downloads, and those
  users are being told the app is malware (F-003, issue #110, open 22 months). Windows has never
  been signed, deliberately, on cost grounds — a judgement worth revisiting now that Azure Trusted
  Signing is ~$10/month rather than several hundred pounds plus a hardware token.
- Update handling is **notify-on-launch by design** — the right model for event software, since
  nobody wants a 112 MB download and a restart prompt mid-show. But the notification fires once,
  ten seconds after launch, and fails silently: exactly what happens on a laptop still joining a
  venue network (F-005).

Every correctness fix in this document is worth nothing until those are solved. So they come
first, before the Electron bump, before the dependency work, and before the card fixes — even
though the card fixes are the more serious defects.

Note the causal order: **signing is the blocker, not updates.** Notify-then-download works fine
right up to the point where the OS refuses to install what was downloaded.

---

## Stabilise

*Goal: a release you could ship tomorrow that changes nothing users can see — signed, notarised,
reliably announced, and building reproducibly in CI.*

| # | Item | Effort | Risk | User-visible impact | Unblocks |
|---|---|---|---|---|---|
| S1 | **Pixel-test harness** (F-022). Headless Electron, hidden window, push config, `capturePage()`, assert sampled RGB per card/variant. Reuse `ndi.js:60-146`, which already does all of it. Record today's Electron 34 output as the baseline. | 3–5 d | Low | None | **Everything.** Nothing below is safe without it. |
| S2a | **macOS signing + notarisation** (F-003). **Apple membership confirmed current (Q1) — no renewal lead time.** Request Developer ID **Application** *and* Developer ID **Installer** certificates; v1.3.1 used an `Apple Development` certificate, which is the root cause. Set `mac.identity` explicitly (never auto-select), add `hardenedRuntime` + entitlements, `@electron/notarize` via `afterSign` on **`notarytool`**, `xcrun stapler staple`. Assert in CI that the identity starts `Developer ID Application:`. | 3–5 d | **High** — cannot be fully tested until the certificates are issued | **Fixes issue #110** | S3, and every release after |
| ~~S2b~~ | **Windows signing — DEFERRED to end of project by decision (Q1b).** Azure Trusted Signing (~$10/mo, no token, stock CI runner). Note for when it is revisited: already-signed builds keep validating forever if you later stop paying, because signatures are timestamped — you only lose the ability to sign new ones. Windows is ~46% of real users (Q9), not 19%. | 1–2 d whenever taken | Medium | Removes permanent SmartScreen flagging | — |
| S3 | **Release CI** (F-003). GitHub Actions: macOS runner for mac targets, Windows runner for win. `docs/RELEASING.md` — including the **WinGet manifest PR**, which is currently an undocumented manual step. Add `.github/dependabot.yml` targeting npm. | 3–5 d | Medium | None | Everything after |
| S4 | **Make the update notification reliable** (F-005). Keep notify-on-launch — **do not** adopt an auto-updater. Retry with backoff, re-check on network-up (`powerMonitor` resume + `net.isOnline`), surface failures, add a manual "Check for updates" menu item. | ~1 d | Low | Users actually get told a fix exists | Every future fix reaching users |
| S4b | **Homebrew cask for macOS.** Same philosophy as WinGet on Windows — user-initiated, hash-verified, nothing interrupts a show. Gives the 81% platform the `brew upgrade` route it currently lacks. | 1–2 d | Low | Meaningfully better reach on the majority platform | — |
| S5 | **Finish `feature/modernise`** (`06-branch-reconciliation.md`): cherry-pick `3948005` (diagonal grid lines — currently a silent regression), split/re-message `6842bf1`, run S1 against the merge to prove the refactor was behaviour-neutral. | 2–3 d | Medium | None | Merging to `master` |
| S6 | **Park NDI on a branch** (F-011) — decided (Q4). Extract the NDI work from `6842bf1` onto `feature/ndi` (take the uncommitted `grandiose` → `optionalDependencies` change with it), remove it from the release line, fix `getStatus()` to report `available: false`, and post an honest status update on issue #41. Resume it once `grandiose` can install reproducibly. | ~0.5 d | Low | Issue #41 slips again — say so plainly | S3 (CI can now build reproducibly) |
| S7 | **`mergeDeep` prototype-pollution guard** (F-004, part 1). Reject `__proto__`/`constructor`/`prototype`. One line; do not carry a known-vulnerable merge across a branch boundary. | 0.5 d | Low | None | — |
| S8 | **Config migration ladder** (F-006). `configVersion` + per-step migration + recursive defaults merge + `default: () => ({})` on every card's `config` prop. Test against `git show v1.0.0:src/defaultConfig.json` … `v1.3.1`. | 3–4 d | Medium — **this is the item most likely to break existing users** | Fixes silently-missing settings for anyone who has ever upgraded | S9, F-029, #121 |
| S9 | **Lint hygiene** (F-019): `ignorePatterns`, split `lint` from `lint:fix`, fix the 9 real errors. | 0.5 d | Low | None | Useful CI signal |
| S10 | **Rollbar: stop sending the hostname, scrub paths, disclose, add opt-out** (F-028, Q8). The SDK sends `os.hostname()` by default and nothing overrides it; no shipped README has ever mentioned telemetry. Replace `host` with a random install id, scrub absolute paths, note it in the README and About dialog, add a More-menu toggle. | ~1 d | Low | A visible opt-out, and an honest README | — |

**Stabilise total: ~19–32 days.** Windows signing deferred out (Q1b, −1–2 d), NDI cut to a parking
job (Q4, −5–8 d), Rollbar work added (Q8, +1 d).

> **v1.4.0 now merges what was v1.4.0 + v1.4.1** — decided in Q2: *"Clock + updates + bug fixes."*
> Stabilise and Fix ship together. **Combined: ~39–64 days.**
>
> That is the right call after 28 months — a release that visibly does nothing is a hard sell —
> but be clear about the trade you are making: **the signing fix and the colour-bars change land
> in the same build.** If something looks wrong afterwards you have more variables to bisect. Two
> mitigations, both cheap:
>
> - **S1 must land first and be trusted.** It is the only thing separating "we fixed the bars"
>   from "something else changed the output too."
> - **Keep the Electron bump out.** That constraint does not move. The whole point of shipping on
>   34 is that the only deliberate output change in this release is F1/F2/F3.

> **Ship v1.4.0 on Electron 34, not 43.** Electron 43 raises the macOS floor from 11 to 12
> (`03-dependency-audit.md` §7). Get a *signed, installable* build into people's hands before
> raising the floor — otherwise Big Sur users stay on v1.3.1 with the wrong colour bars and no
> reliable way of being told.

> **Critical path is clear.** Q1 confirmed the parent company's Apple Developer membership is
> current, so S2a carries no renewal lead time. Request the Developer ID Application and
> Developer ID Installer certificates and start.

---

## Modernise

*Goal: current toolchain, with output-correctness verification gating each step.*

Do these **in order**. The dependency graph in `03-dependency-audit.md` §3 explains why; the
short version is that four of these six steps can change rendered pixels, and if two land
together you cannot tell which one did it.

| # | Item | Effort | Risk | User-visible impact | Unblocks |
|---|---|---|---|---|---|
| M1 | **Isolated dependency bumps**: `vue` 3.5.x, `vue-router` 4→5 (two routes, hash history — trivial), `electron-log` 4→5, `compare-versions` 4→6, **drop `axios` for `fetch`** (one call site; removes ~40 advisories), delete `core-js`, `vue3-resize-text` (unused), `browserslist`. | 2–3 d | Low | None | Reduces noise for everything after |
| M2 | **Vite 5 → 8**, `@vitejs/plugin-vue` 5 → 6. | 1–2 d | Low | None | M3 |
| M3 | **Bundle the main process** (electron-vite or a Vite lib build). Also fixes the 98 MB asar (F-021) — narrow `build.files` at the same time. | 3–5 d | Medium | Installer drops from 112 MB to ~60–70 MB | M4, and makes updates smaller |
| M4 | **ESM-only deps**: `electron-store` 8→11, `wallpaper` 5→7. Blocked on M3. | 1–2 d | Low | None | — |
| M5 | **`electron-builder` 24 → 26.** Must precede M6. | 1–2 d | Medium | None | M6 |
| M6 | **Electron 34 → 43**, one or two majors at a time, **running S1 at every step**. This is where F-002's silent-drift risk lives. Raises macOS floor to 12 — needs a release note and, ideally, a final Electron-34 build left available for Big Sur. Also re-evaluate HDR here (F-030) — Chromium's HDR support moved substantially across this range. | 8–15 d | **High** | Possible — that is the whole point of S1 | M7, and closes 33 advisories |
| M7 | **Colour management** (F-002). **Decided (Q5, option C):** an "Accurate levels" preference, **default on**, applying `--force-color-profile=srgb`, with a release note and a one-time notice. A deliberate, announced behaviour change on wide-gamut displays. | 2–4 d | **High** | Yes — intentionally | The app's central claim finally being true |
| M8 | **`element-plus` 1.0-beta → 2.x** — component APIs, icon system, and rewriting the ~130 lines of private-class dark-mode overrides (`Control.vue:398-507`) against 2.x CSS custom properties. Resolves the silenced Sass deprecations (F-034) for free. **Do this last, and alone.** | 10–20 d | **High** | Control window will look subtly different | Everything downstream of the UI |

**Modernise total: ~28–53 days.**

---

## Fix

*Goal: the defects, prioritised. Most of these are small; they are late in the list only because
they need S1 to verify and S4 to reach anyone.*

| # | Item | Finding | Effort | Risk | Impact |
|---|---|---|---|---|---|
| F1 | **Colour bars: inactive channels at 16, not 0.** Comms decided (**Q6, option B**): clear release note plus a short explainer on the Kards help page, with a link to the reference values so people can verify it themselves. | F-001 | 1 d + verification | **High** — changes long-standing output | **The most serious correctness defect in the app.** Every colour bar on every bars card. |
| F2 | **Stepped ramp: restore the missing 204 step** and generate the stops rather than hand-writing them 5×. | F-008 | 0.5 d | Medium | One greyscale band is currently double-width |
| F3 | **Unify the level range** — ramp gradients on 16–235 like everything else, or an explicit Full/Legal switch (which would be a genuinely good feature). | F-013 | 1–2 d | Medium | Removes a self-contradiction visible on one screen |
| F4 | **DPI/device-pixel sizing.** `scaleFactor` division and/or `setZoomFactor(1/scaleFactor)`; report real resolution in the info circle. | F-007 | 2–3 d | Medium | **Fixes issues #112, #111, and closed-but-recurring #30.** LED and grid cards become pixel-exact again |
| F5 | **Replace `dom-to-image` with `capturePage()`** for PNG export and wallpaper. | F-009 | 2–3 d | Medium | Closes the eleven-issue export saga (#1,2,3,6,7,28,29,65,88,90,111) by construction |
| F6 | **Config schema + validated REST/OSC.** **Descoped by Q3** — the network binding stays as-is; no loopback default, no token. What remains: a config schema, validation of `PUT` bodies against it, generated OSC handlers (kills F-016's duplicates and the 460 hand-written lines), `res.json()` and real status codes. Design the schema with an `outputs[]` array in mind (**Q7** — multi-output at ~2.0). | F-014, F-015, F-016 | 4–6 d | Low — no user-visible behaviour change now | Makes the API usable; absorbs multi-output later |
| F7 | **Restrict the IPC surface**: uncomment/complete the allow-lists, or better, replace the generic bridge with a typed API. Explicit `webPreferences` on all four windows. | F-010, F-023 | 2–3 d | Low | None |
| F8 | **Electron hardening**: CSP, `setWindowOpenHandler`, `will-navigate`, `sandbox: true`, validate `shell.openExternal`. | F-020, F-035 | 1–2 d | Low | None |
| F9 | **File-read hardening** on OSC `/audio/file`, `selectImage`, `selectMaskImage` — extension allow-list, size cap, try/catch. **Must land before F6 changes the OSC bind address.** | F-024 | 1 d | Low | None |
| F10 | **Move base64 blobs out of `config`**; debounce the watcher. | F-018 | 2–3 d | Medium | No more disk write per keystroke; unblocks larger assets |
| F11 | **Housekeeping**: one shared Bonjour instance + `bonjour-service` + unique service names (#86); single wallpaper temp file; `mask.image` → `mask.imageSource` (+ migration); delete dead files; reword the HDR overlay. | F-025, F-026, F-029, F-030, F-031 | 2–3 d | Low | Minor |

**Fix total: ~20–32 days.**

---

## Improve

*Goal: make the next two-year gap less painful.*

| # | Item | Effort | Why |
|---|---|---|---|
| I1 | **Extend the pixel harness** to all 15 card variants × {100%, 125%, 150%, 200%} DPI × light/dark, running in CI on every PR. | 3–5 d | This is the project's missing safety net. It is what would have caught F-001, F-008 and F-013 six years ago. |
| I2 | **Config-migration test corpus** — synthesise saved configs from `defaultConfig.json` at every release tag, assert each migrates cleanly. | 2 d | Highest-value test per hour for a 100k-install base |
| I3 | **Simplify `windows.js`** — split window lifecycle / screen management / export / wallpaper; replace the `setTimeout(…, 500)` coordination with events. Carefully: this is where 8 closed issues came from. | 4–6 d | `05-issue-triage.md` "Theme 2" — this module is where the bugs live |
| I4 | **Linux packaging** (AppImage + deb) — issues #68, #105. Verify `say` and `wallpaper` degrade gracefully. | 3–4 d | Two open issues, ~4 years old, cheap once S3 exists |
| I5 | **Windows portable target** — issue #104. `target: ["nsis","portable"]`. Decide whether settings should be portable too. | 1 d | Cheapest high-value item in the tracker; perfectly targeted at the product's actual use |
| I6 | **Windows arm64 build.** | 0.5 d | arm64 Windows laptops are now common |
| I7 | **Configurable "Show Info"** — issue #121. Nearly free once F6's schema exists. | 2–3 d | Well-argued, well-scoped user request |
| I8 | **Control-window live preview** — re-implement `feature/previewwindow`'s idea on the refactored `Testcard.vue`. | 1 d | Real product value: set the card up before putting it on a show display |
| I9 | **Extract cards into a shared package** consumed by both this app and Kards Online (F-027). | 10–20 d | Stops every card fix having to be made twice; makes Kards Online the answer to #120 |
| I10 | **TypeScript on `src/main/` only**, incrementally. Not the whole codebase. | 5–8 d | The main process is where the type errors would have caught real bugs (F-016's `String` vs `Boolean`, F-029's key mismatch) |
| I11 | **Contributor experience**: `CONTRIBUTING.md`, fix the README's incorrect claim that `env.json` is required (F-031), document the level conventions the app uses. | 1–2 d | Two people have ever committed to this repo |

**Improve total: ~33–53 days** (I9 dominates and is optional).

---

## Consider

Worth evaluating, not obviously worth doing:

- ~~**Multiple simultaneous outputs (#62).**~~ **Moved out of Consider — decided (Q7): yes, but no
  earlier than 2.0.** Action now is cheap: shape the F6 config schema as `{global, outputs[]}`
  even while only one output exists (~1 d). See the note added to §8a — this does not flip the
  recommendation today, but it makes **2.0 the natural point to re-run the migrate-vs-rebuild
  decision**, with a working pixel harness and a modern toolchain in hand.
- **SDI / DeckLink output (#40).** The frame pipeline now exists via NDI, but SDI needs frame
  timing that `setInterval`-driven `capturePage()` cannot give. Gated on NDI actually shipping.
- **Drop `element-plus` entirely** rather than migrating to 2.x. The control window is ~15 form
  controls. Hand-rolling them removes 380 kB of CSS, the Sass deprecations and the theming fight
  permanently. Genuinely competitive with M8 on effort, and better afterwards.
- **Replace `say` with the renderer's `SpeechSynthesis` API.** Removes an unmaintained
  shell-out dependency and gives better voices.
- **Proper HDR support (#64).** Chromium's HDR handling moved a lot across Electron 34→43.
  Re-evaluate at M6.
- ~~**Telemetry decision (F-028).**~~ **Decided (Q8, option A):** keep Rollbar, add an opt-out,
  scrub, disclose. Moved into Stabilise as **S10** — it turned out to be sending the hostname
  unconditionally, and no shipped README has ever mentioned it, so it is not merely hygiene.
- **Full git-history secret scan** (`gitleaks`/`trufflehog`) for a Rollbar token committed before
  `ccf1597`. Not done in this review — see the caveat in F-028.

---

## What I would advise against

The most valuable part of this section, per the brief.

1. **Do not do the Electron bump (M6) and the element-plus migration (M8) in the same release.**
   Both can change rendered output. If they land together and something looks wrong, you have no
   bisection point. This is the single most likely way this project ends up stuck.

2. **Do not fix the colour bars (F1) before signing works (S2).** It is the most serious
   defect in the app, and I still want it *second*. A fix nobody receives is worth nothing, and
   changing long-standing output for the ~7k users who happen to update manually — while 93k keep
   the old behaviour — creates a support situation where two people looking at "the same card"
   see different things.

3. **Do not chase `npm audit` to zero.** 38 of the 41 advisories are dev-only or unreachable
   (`03-dependency-audit.md` §4). Fixing `shell-quote` under `eslint` costs a day and buys
   nothing. The three that matter — `electron`, `axios`, `tar` under electron-builder — are
   already in the plan. Anyone reporting "41 vulnerabilities!" should be shown §4.

4. **Do not ship NDI broken (S6).** Issue #41 has nine comments over five years including one
   unmet "give me a week" from 2021. Shipping a feature that silently does nothing to that
   audience is worse than saying it slipped again.

5. **Do not build the iPad version (#120).** It is a from-scratch second application on a
   different stack for a third platform, before the two existing platforms are shippable. Kards
   Online already answers 80% of that need in Safari.

6. **Do not pursue Raspberry Pi (#68b).** Electron dropped 32-bit ARM Linux; a Pi Zero 2 W cannot
   drive a Chromium compositor at a usable rate for a full-screen animated pattern. Decline it
   explicitly — it has been open four and a half years.

7. **Do not "tidy up" the card components while you are in there.** The 17 files in
   `components/TestCard/` are the product's actual asset — six years of accumulated correctness
   decisions, most of them undocumented. Change them only with a failing pixel test in hand and
   a specific reason. `Alteka.vue` being 742 lines is not a reason.

8. **Do not delete the REST/OSC API to fix F-004.** It is a valued, deliberately-built feature
   (#66, #67) and people are driving Kards from show-control systems today. Bind it to loopback
   by default and add a token — do not remove the capability.

9. **Do not add TypeScript across the whole codebase as an early move.** It is a large diff over
   every file that makes the git history unbisectable exactly when you most need to bisect
   output changes (M6, M7). `src/main/` only, later (I10).

10. **Do not adopt `--force-color-profile=srgb` (M7) silently.** It is the right default, and it
    will visibly change output on wide-gamut displays for users who have been calibrating against
    the current behaviour. It needs a release note, a preference, and ideally a one-time notice.

11. **Do not merge the two open dependabot PRs.** Both patch a `yarn.lock` that no longer exists
    (`06-branch-reconciliation.md`).

---

## Ordering, with the hard dependencies made explicit

Updated for the Q1–Q9 decisions. v1.4.0 and v1.4.1 are now one release (Q2).

```
S1 pixel harness ─────────────────────────────────────────────┐
   │   (gates everything that can change pixels: F1 F2 F3 F4,  │
   │    and later M6 M7 M8 — must land FIRST and be trusted)   │
   │                                                           │
   ├─► S6 park NDI on feature/ndi ──┐                          │
   │                                ▼                          │
   ├─► S5 finish feature/modernise ──► merge to master         │
   │       (cherry-pick 3948005)                               │
   │                                                           │
   ├─► S2a macOS signing ─► S3 release CI ─► S4 notify         │
   │                            └─► S4b Homebrew cask          │
   │                                                           │
   ├─► S7 mergeDeep guard    S8 config migration    S9 lint    │
   │   S10 Rollbar scrub + disclose                            │
   │                                                           │
   └─► F9 ─► F6 schema  ·  F1 F2 F3 (levels)  ·  F4 DPI        │
            (F9 must precede F6)  F5 export  F7 F8 F10 F11     │
                                                               │
                       ★ SHIP v1.4.0 ★ ◄────────────────────────┘
              signed · notarised · Clock · reliable notify
              · colour bars · ramp · DPI · export — ON ELECTRON 34
                              │
        M1 ─► M2 ─► M3 ─► M4  │
                    └─► M5 ─► M6 ─► M7        ★ SHIP v1.5.0 ★
                                              (Electron 43 + colour policy)
                              │
                             M8                ★ SHIP v1.6.0 ★
                                               (control window rebuilt)
                              │
                    I1…I11 · Consider · #62 multi-output at 2.0
                              │
                    ┌─────────▼──────────────────────────────┐
                    │ 2.0 — RE-RUN THE MIGRATE-VS-REBUILD    │
                    │ DECISION HERE (Q7). See §8a.           │
                    └────────────────────────────────────────┘
```

**Two releases before the UI framework is touched**, and each is independently shippable and
revertible. `~~S2b~~` (Windows signing) is deliberately absent — deferred to the end by Q1b.

The one ordering rule that must not bend: **S1 before anything that touches pixels.** With F1/F2/F3
now shipping alongside the signing fix, it is the only thing that will let you tell a deliberate
change from a regression.

Rough calendar for one experienced developer at ~60% capacity:
**v1.4.0 in ~2–3 months, v1.4.1 ~1 month later, v1.5.0 ~2–3 months after that, v1.6.0 ~1–2 months
after that.** Total ~7–10 months elapsed, ~105–175 developer-days.

---

# §8a — Migrate or rebuild

Costed on the same basis so the two are comparable.

## Option A — Incremental migration

**Effort: ~105–175 developer-days** (Stabilise 21–36 + Modernise 28–53 + Fix 20–32 + Improve
33–53, with I9 optional).

**Riskiest steps, in order:**

1. **M8 — element-plus 1.0-beta → 2.x (10–20 d).** The largest single item, and it is a rewrite
   of the entire control window's component usage plus its dark-mode stylesheet. It is also the
   item most likely to overrun, because the current dark mode is ~130 lines of overrides against
   *private class names* that 2.x has moved. There is no incremental path: the library's API,
   icon system and theming all change at once.
2. **M6 — Electron 34 → 43 (8–15 d).** Nine majors of Chromium colour-management, compositing and
   HDR changes, on an app whose value is pixel-exact output. Bounded by S1, but only if S1 is good.
3. **S2 — signing (5–10 d).** Hard to estimate because it is procurement plus trial-and-error,
   and cannot be tested until the certificates exist.

**How much of the existing code actually survives?** Honest accounting:

| Area | Lines (approx) | Survives incremental migration |
|---|---|---|
| 17 × `components/TestCard/*.vue` | ~2,700 | **~90%** — the real asset, largely untouched |
| 13 × `components/Control/*.vue` | ~1,700 | **~40%** — M8 rewrites the element-plus usage |
| `views/Control.vue` | 508 | **~30%** — the dark-mode CSS block alone is 130 lines that go |
| `views/Testcard.vue` | 536 | **~85%** |
| `main/windows.js`, `menu.js` | 1,060 | **~70%** (I3 restructures `windows.js`) |
| `main/osc.js` | 519 | **~10%** — F6 regenerates it from a schema |
| `main/rest.js` | 160 | **~30%** — F6 replaces the merge and the handlers |
| `main/{config,settings,audio,ndi,ipc,services,rollbar,touchBar,updateChecker}.js` | ~1,100 | **~75%** |
| **Overall** | **~8,300** | **≈ 60–65%** |

**The failure mode to watch.** Step-by-step migration quietly becoming a rewrite anyway, just
slower and without a clean target. The specific place it happens here is **M8 + F6 + I3 landing
in sequence**: between them they rewrite the control UI, the state/API layer and the window
manager. That is ~40% of the codebase rewritten piecemeal, over months, with no coherent target
architecture — the worst of both options. **Mitigation: decide the target shape of the config
schema (F6) up front, in writing, before starting M8.** If you are going to rewrite the state
layer anyway, know what you are rewriting it *into*.

## Option B — Rebuild

**What it looks like:** `electron-vite` + Vue 3 + TypeScript, no heavyweight component library,
a typed config schema with migrations from day one, cards extracted into a shared package
consumed by both the desktop app and Kards Online, and the pixel harness as the acceptance
criterion from commit one.

**Scope to feature parity** — this is the honest list, and it is longer than it feels:

| Area | Notes | Days |
|---|---|---|
| Shell: electron-vite, main/preload/renderer, build, signing, update notification | Same S2/S3/S4 work as Option A — **not saved by rebuilding** | (21–36, shared) |
| 9 card types / 15 variants | Ports nearly verbatim as Vue SFCs — this is the big carry-over | 8–15 |
| Control UI (13 panels, tabs, colour pickers, number inputs, dialogs, drawer, dark mode) | Rebuilt without element-plus | 15–25 |
| Config schema, store, migrations from v1.x saved configs | Done right, once | 5–8 |
| Window/screen management, multi-display, fullscreen, macOS spaces, DPI | **The genuinely hard part** — six years of platform edge cases (#19, #30, #31, #48, #81, #102, #103, #106) | 12–20 |
| OSC + REST + Bonjour, generated from the schema | Much smaller than 679 hand-written lines | 4–6 |
| Audio: tone/pink/phase/sweep, A/V sync clips, TTS | Assets carry over; `SpeechSynthesis` replaces `say` | 4–7 |
| PNG export + wallpaper via `capturePage` | Simpler than today | 3–4 |
| Menu, Touch Bar, keyboard shortcuts, settings import/export, share links | | 5–8 |
| NDI | Same F-011 problem either way | 5–8 |
| Pixel harness + CI | | 5–8 |
| **Parity subtotal (excl. shared shell work)** | | **66–109** |
| **Plus shared shell/signing/notification** | | **21–36** |
| **Total** | | **~87–145 d** |

**What genuinely carries over:**

- **The card components** — near-verbatim if the rebuild stays on Vue 3. This is why the rebuild
  number is not much larger than the migration number.
- **The colour maths and level conventions** (`Swatch.vue`, the CSS level classes) — with F-001,
  F-008 and F-013 fixed on the way in rather than as separate migrations.
- **All assets** — fonts, audio, the nine A/V sync clips, icons, the Alteka branding.
- **`defaultConfig.json`** as the seed of a typed schema.
- **The accumulated knowledge in 65 closed issues** — `05-issue-triage.md`'s theme analysis is
  effectively a requirements document for the window-management layer, which is the part a
  rebuild would otherwise get wrong.

**What does not carry over:** the element-plus-shaped control UI, `osc.js`'s 519 hand-written
lines, `rest.js`'s merge, and the single-mutable-config state model.

**De-risking a rebuild against 100k existing installs:**

- **Settings migration is non-negotiable.** Read the existing `electron-store` `KardsConfig`
  including v1.0-era shapes. Same work as S8, so it is not extra cost — but a rebuild cannot skip
  it, and a rebuild that loses people's saved logo, name and card preferences will be judged
  harshly by an audience that never asked for a rewrite.
- **Ship in parallel for a period.** Feasible, but **only once F-005 exists** — you need an update
  channel to move people, and a channel to move them *back*. Ship the rebuild as an opt-in beta
  under a separate appId, with the same settings store, for a full event season (AV usage is
  seasonal; a February beta tests nothing).
- **The pixel harness is the acceptance gate.** Every card must match the v1.4.x baseline
  bit-for-bit except where a fix deliberately changed it. This is the thing that makes a rebuild
  survivable for this product, and it is worth building **even under Option A** — which is why
  S1 is item one in both plans.

## Recommendation

**Incremental migration (Option A) — with M8 scoped as a deliberate, bounded rebuild of the
control window only.**

The reasoning, in order of weight:

1. **The migration is already 85% done and the hard part went well.** `feature/modernise` moved
   to Vite, split the monolith, and builds and runs on Node 22 today. Rebuilding means discarding
   completed, working work to re-solve the same problems.
2. **The blocking problems are identical under both options.** Signing (S2) and release plumbing
   (S4) are ~30% of the total effort, and a rebuild does not avoid a single day of it. A rebuild
   *delays* them, which is the wrong trade when 81k macOS users are currently told the app is
   malware.
3. **Team capacity.** Two people have ever committed to this repo, one of them dominantly, and
   the project has averaged roughly one release a year. An 87–145 day rebuild at that capacity is
   a 12–18 month gap with nothing shipped, on top of the 2 years 4 months already elapsed. The
   migration ships something useful at month 2–3.
4. **A rebuild puts output correctness back on the table for all 15 card variants.** The brief is
   right that the well-specified, small surface lowers rewrite cost — but F-001 is proof that
   subtle level errors survive six years unnoticed in this codebase. A rebuild is 15 fresh
   opportunities to introduce another one.
5. **The rebuild's real prize is available without rebuilding.** The genuinely attractive parts —
   a typed config schema, generated OSC/REST, a shared card package — are F6, I9 and I10 in the
   plan above. They can be taken incrementally, in that order, without a big bang.

**Scoping M8 honestly:** element-plus 1.0-beta → 2.x (10–20 d) versus rebuilding the control
window without a component library (15–25 d) is close enough that the second is the better buy —
you end up with no framework pin, no Sass deprecations, no private-class theming, and 380 kB less
CSS. **Treat M8 as "rebuild the control window", not "upgrade element-plus."** That is the one
place where rewriting beats migrating, and it is bounded to 13 files that contain no
correctness-critical code.

## The two or three facts that would flip this

State them so the decision is re-checkable rather than a matter of taste:

1. ~~**If multiple simultaneous outputs (#62) becomes a committed roadmap item, rebuild.**~~
   **Now answered (Q7): yes, but no earlier than 2.0.** That is far enough out that it does *not*
   flip the recommendation today — the F6 config schema can be shaped as `{global, outputs[]}`
   from the start for about a day's extra design, which defuses most of the retrofit cost.

   But it does relocate the decision: **2.0 is where migrate-vs-rebuild should be re-run**, not
   now. By then you will have a pixel harness, a current toolchain, signed releases and a schema —
   i.e. all the things that make a rebuild survivable, and most of the things that make it
   unnecessary. Re-read this section then rather than treating today's answer as permanent.
2. **If a second full-time developer joins, rebuild becomes affordable.** The recommendation is
   heavily weighted by a 12–18 month no-ship gap at current capacity. At two developers that gap
   roughly halves, and the calculus changes.
3. **If Kards Online is also due a rewrite, do both at once as one shared-core project.** The
   duplicated card implementations (F-027) are the single worst structural fact about this
   product. If the web app is being rebuilt anyway, building the shared card package first and
   two thin shells on top of it is better than either option here — and it makes #120 (iPad)
   answerable for free.

A fourth, weaker signal: **if S1's pixel harness turns out to be hard to make reliable**, both
options get materially more expensive and the rebuild gets *relatively* worse, because a rebuild
depends on it far more heavily. Build S1 first, and treat difficulty there as information about
the whole plan.
