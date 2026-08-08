# Review progress — running state file

**STATUS: review COMPLETE, implementation APPROVED and not yet started.**
All nine review deliverables written; phases 0–8 done. Revised three times after maintainer input
— see the revision records at the bottom.

> **New session starting work? Read `09-kickoff.md` first, not this file.**
> This file is the review's state record. `09-kickoff.md` is the implementation handover.

**Repo:** `C:\Users\matt.james\Documents\Repos\Kards` — `https://github.com/Alteka/Kards`
**Reviewed:** `feature/modernise` @ `6842bf1` (checked out) and `master` @ `3948005`
**Date:** reviewed 2026-08-07, revised 2026-08-08

---

## Phase status

| Phase | Status | Deliverable |
|---|---|---|
| 0 — Orientation | ✅ | `01-current-state.md` |
| 1 — Build baseline | ✅ | `02-build-baseline.md` |
| 2 — Architecture & code quality | ✅ | `04-findings.md` |
| 3 — Platform/dependency/toolchain | ✅ | `03-dependency-audit.md` |
| 4 — Output correctness | ✅ | `04-findings.md` (F-001, F-002, F-007–F-009, F-013, F-030) |
| 5 — Security & privacy | ✅ | `04-findings.md` (F-004, F-010, F-020, F-023, F-024, F-028, F-035) |
| 6 — Issue triage | ✅ | `05-issue-triage.md` — all 12 open issues + closed-issue themes |
| 7 — Branch reconciliation | ✅ | `06-branch-reconciliation.md` — all 6 non-default branches |
| 8 — Synthesis | ✅ | `07-plan.md` (incl. §8a migrate-vs-rebuild), `08-summary.md` |
| Questions | ✅ | `questions.md` — 10 questions, each with a default |

**No early checkpoint was raised after Phase 1** — the app builds and runs, so nothing was blocked.

---

## Definition of done — verified

- [x] All nine files exist under `docs/review/`, each readable on its own.
- [x] Every finding has evidence with a file path, line number, command transcript or issue ref.
- [x] All 12 open GitHub issues appear in the triage with a disposition.
- [x] All 6 non-default branches appear in the reconciliation with a recommendation.
- [x] The plan is sequenced with dependencies made explicit (`07-plan.md` "Ordering" diagram).
- [x] `08-summary.md` is one page, stands alone, leads with the three things that matter.
- [x] **No application code, config or lockfile modified.** `git status` shows only `docs/` plus
      `package.json` / `package-lock.json`, which were **already modified before this review
      started** (see below).

### Working-tree state — pre-existing dirt, not caused by this review

`git status` at session start was already:

```
 M package-lock.json     <- moves grandiose into optionalDependencies
 M package.json
?? docs/
```

Verified byte-identical at the end of the review (`git diff --stat` → same 63/4 line counts).

**One side effect to be aware of:** `dist/` in the repo root now contains a Vite build produced by
this review (Phase 1). It is git-ignored and regenerable with `npm run build`. `npm ci`,
`electron-builder` and the asar inspection were all run against a **scratch copy outside the
repo**, so no lockfile was touched.

---

## Findings inventory

**35 findings — 4 Critical, 9 High, 15 Medium, 7 Low.** Full text in `04-findings.md`.

| Critical | |
|---|---|
| F-001 | Colour bars render inactive channels at 0 instead of black level 16 |
| F-002 | Display ICC profile silently rewrites output; no `--force-color-profile` anywhere |
| F-003 | Shipped macOS installers unsigned + un-notarised (**verified against the release**); Windows unsigned by choice |
| F-004 | Unauthenticated LAN HTTP API + **reproduced** prototype pollution |

Highest High is **F-005** — notify-on-launch is the right model, but the notification fires once
at T+10 s and fails silently.

Reproduced (not just inferred): F-004 (pollution + `0.0.0.0` bind), F-011 (grandiose install
failure), F-014 (HTTP 500 on numeric endpoints), F-019 (lint scope), F-021 (98 MB asar),
plus the unsigned binary and the non-sRGB display profiles behind F-002.

---

## Corrections to the brief — carry these forward

1. **Vue 3, not Vue 2.** Vue 2 EOL is irrelevant.
2. **Not dormant in commits** — `master` to 2025-07-16, `feature/modernise` to 2026-08-07.
   Dormant in **releases**: last release v1.3.1, 2024-04-03.
3. **`feature/modernise` already did the Vite migration**, split `background.js` into 14
   `src/main/*` modules, added a Clock card and NDI. Unreleased. ~85% done.
4. **No `electron-updater`, and auto-update is a deliberate omission** (correct for event
   software). The defect is that the notify-on-launch check is unreliable. Windows also has an
   undocumented **WinGet** channel (`AltekaSolutions.Kards`).
5. **Builds and runs on Node 22.22.0.** No pinning needed beyond the existing Volta declaration.
6. **Kards Online is a separate codebase** — `kards.alteka.solutions`, 6 of 9 card types.
   Cards are implemented twice.
7. **~100k figure corroborated** — 100,021 GitHub downloads of v1.3.1 (81% macOS, 19% Windows,
   no Linux artifact ever). But the platform mix inverted vs v1.3.0 — see Q9.

---

## Key facts

- v1.3.1, GPL-3.0-only, appId `solutions.alteka.kards`. Two contributors ever
  (Drew Perry primary, canoemoose).
- 9 card types / 15 renderable variants. Rendering is **DOM + CSS** — no canvas, no WebGL.
- Levels: `Swatch.vue:20-29` maps IRE 0–100 → 16–235. CSS classes at `Testcard.vue:510-527`.
- State: one plain `config` object, no store, no schema, 7+ writers, broadcast on the `'config'`
  IPC channel. Root cause of many findings.
- **No tests, no CI, no `.github/` directory, no TypeScript.**
- REST binds `0.0.0.0:8321` unauthenticated; OSC binds `127.0.0.1:25518` but is mDNS-advertised
  to the LAN.
- Electron reports this machine's 3 displays as **non-sRGB primaries**, `range:FULL`.
- Branches: `Electron16ReWrite` and `hotfix/macclosewindowbug` are **already fully merged** —
  delete. Both dependabot PRs patch a deleted `yarn.lock` — close.
  `feature/modernise` is **missing `3948005`** (diagonal grid lines) from master.

## Recommendation, one line

**Incremental migration, not rebuild** — with the element-plus step scoped as a bounded rebuild of
the control window only. Ship signing first (v1.4.0, still on Electron 34), then the
card fixes, then Electron 43, then the UI. `07-plan.md` §8a states the three facts that would
flip the recommendation.

## If picking this up fresh

Read `08-summary.md`, then `questions.md`, then `07-plan.md`. Everything else is supporting
evidence. **Q1 (Apple Developer Program membership status) is pure lead time and blocks the
critical path — start it before any code work.**

---

## Revision 1 — 2026-08-08, after maintainer input

Three corrections from the maintainers, and what changed as a result.

**1. "We think we signed Mac builds."** Verified directly rather than assumed. Range-fetched and
parsed the xar TOC of all three v1.3.1 `.pkg` assets plus v1.2.0 as a control
(`02-build-baseline.md` §4a, scripts in the session scratchpad):

- **No installer signature and no stapled notarisation ticket** in any of them.
- The payload's Bom **does** contain `Kards.app/Contents/_CodeSignature/CodeResources` — so the
  app bundle was signed and the `.pkg` wrapper never was.
- Undetermined: whether that app signature is Developer ID or electron-builder's automatic
  macOS-arm64 ad-hoc signature. Both produce identical Bom entries. **Q1** settles it.

Effect: F-003 rewritten and re-grounded on artefact evidence; the fix is *smaller* than first
estimated (a Developer ID **Installer** certificate + `notarytool` + `stapler`, not signing from
scratch). S2 split into S2a (macOS, 3–5 d) and S2b (Windows, 1–2 d); was 5–10 d.

**2. "We deliberately don't auto-update — this is event software."** Accepted; the argument is
better than the one the review made. F-005 rewritten: notify-on-launch is retained as the correct
model, and the finding is narrowed to the notification being unreliable (one attempt at T+10 s, no
retry, no re-check on network-up, silent failure) — which undermines their model rather than
arguing against it. **Severity Critical → High.** S4 dropped from a 4–6 d `electron-updater`
project to a ~1 d reliability fix, plus new S4b (Homebrew cask).

**3. "Never signed Windows, because of cost." / "There's a WinGet package."** Both incorporated.
Windows signing re-priced around Azure Trusted Signing (~$10/month, no hardware token, works on a
stock CI runner) — the old OV-plus-HSM cost objection no longer holds. WinGet
(`AltekaSolutions.Kards 1.3.1`) verified present and documented as an existing hash-verified
update channel that the repo never mentions; it needs a manifest PR per release.

### Net effect on the plan

| | Before | After |
|---|---|---|
| Stabilise | 26–42 d | **21–36 d** |
| Total | 110–180 d | **105–175 d** |
| Rebuild comparison | 92–151 d | **87–145 d** |
| Critical findings | 5 | **4** |
| Headline #1 | "can't ship a fix, and no updater" | **"macOS installers are unsigned — verified"** |

The recommendation (incremental migration) is unchanged; the margin narrows slightly, since
shared release plumbing drops from ~30% to ~20% of the total.

### Files touched in this revision

`01-current-state.md` §0 · `02-build-baseline.md` (B-2 + new §4a) · `03-dependency-audit.md`
§5 macOS/Windows and §6 (rewritten as "Update-channel integrity") · `04-findings.md` F-003, F-005,
index · `05-issue-triage.md` #110 · `07-plan.md` S2a/S2b/S3/S4/S4b, totals, ordering, §8a ·
`08-summary.md` · `questions.md` (Q1 split into Q1/Q1b, Q9 narrowed — now ten questions).

### Still open from this round

- **Q1** — Apple Developer Program membership status. Pure lead time; start before code work.
- **Q1b** — whether to sign Windows at the new price point.
- **Q9** — the macOS download anomaly. WinGet is ruled out as an explanation (it pulls from the
  same GitHub URLs and is Windows-only). A third-party Homebrew cask submitted by someone else
  remains the most likely non-organic explanation and is worth searching for before publishing
  one of your own (S4b).

---

## Revision 2 — 2026-08-08, download-mirror investigation

Triggered by the maintainer asking whether a mirror could be inflating the download numbers.
Two substantive results, one of which resolves a blocking question.

### A. The 100k figure is inflated — measured, not inferred

Sampled the GitHub release-asset counters 22.3 h apart (2026-08-07 13:50 UTC → 2026-08-08 12:10 UTC):

```
mac-apple-silicon.pkg   29567 -> 29663   (+96)     ~103/day
mac-intel.pkg           24753 -> 24845   (+92)     ~99/day
mac-universal.pkg       26879 -> 26973   (+94)     ~101/day
windows-x64.exe         18822 -> 18835   (+13)     ~14/day
```

A second sample 8 minutes later: **+1 on every mac asset, 0 on Windows.** Three variants moving in
lockstep inside one short window. Whatever it is, it enumerates the three `.pkg` files and never
touches the `.exe`.

Cross-sectional corroboration: variant ratios flattened from 1.97 : 1 : 1.57 (v1.3.0) to
1.19 : 1 : 1.09 (v1.3.1), the opposite of organic drift. Fitting silicon+intel and holding out
universal: proportional growth errs 45%; growth ×7.65 plus a constant C ≈ **19,859 per mac asset**
errs **2.7%**. C ÷ ~100/day ≈ 199 days ⇒ activity likely began ~January 2026.

**Corrected estimate: ~40,700 genuine v1.3.1 downloads, ~54% mac / 46% win** (vs 42% and 44% mac
for v1.3.0 / v1.2.0). Caveat: 3 data points, 2 parameters — the 22 h delta is the strong evidence;
the model only dates it.

Candidate: `autopkg/dataJAR-recipes` → `Kards/` (added 2025-02-28), an AutoPkg/Munki recipe pair
using `GitHubReleasesInfoProvider` against `Alteka/Kards` with a per-arch `DOWNLOAD_ARCH`. Fits the
shape; does not fully explain the volume. Ruled out: official Homebrew cask (does not exist),
nixpkgs, MacPorts, Installomator, fleetdm, macadmins, all aggregator/mirror sites, the app's own
update checker, and alteka.solutions itself. Negatives are limited to public repos.

Recommended identification method: attach a throwaway extra `.pkg` to the next release and see
whether the traffic follows it (anything `asset_regex`-driven will; a hard-coded mirror won't).

### B. Q1 resolved — the app was signed with a *development* certificate

The dataJAR recipe's `CodeSignatureVerifier` records the shipped bundle's actual signature:

```
certificate leaf[subject.CN] = "Apple Development: Drew Perry (D4H96T8MEW)"
and certificate 1[field.1.2.840.113635.100.6.2.1]
```

- `Apple Development:` is a **development** certificate, not `Developer ID Application:`. It
  cannot satisfy Gatekeeper on third-party machines, by design.
- OID `1.2.840.113635.100.6.2.1` is the Apple **WWDR** intermediate (Development / App Store);
  Developer ID chains carry `…6.2.6`. Certificate type confirmed twice, independently.

So v1.3.1 macOS = app signed with the wrong certificate type, installer unsigned, nothing
notarised. Complete explanation of #110, no gaps. It also proves the **Apple membership was active
at build time** — the failure was identity selection, most likely `electron-builder` auto-picking
from the build machine's keychain. Q1 narrows to "is the membership *still* active?", and S2a
gains a concrete requirement: set `mac.identity` explicitly and assert it starts
`Developer ID Application:` in CI.

### Internal note

`Event-Engineering/ProjectReady` (private, own org) has
`electron/mac/applications/sudo/install_kards.sh` curling a hard-coded
`Kards-1.3.1-mac-apple-silicon.pkg`. One-shot and single-arch, so not the cause — but the pinned
version will break when v1.4.0 ships.

### Effect on the plan

No sequencing change. **Weighting changes: Windows is ~46% of real users, not 19%** — strengthens
Q1b (Windows signing) and raises the priority of F-007 (DPI, issues #112/#111), which this review
had discounted as affecting a smaller group.

### Files touched

`02-build-baseline.md` §4a · `04-findings.md` F-003 · `questions.md` Q1, Q1b, Q9 (Q9 now ANSWERED) ·
`08-summary.md` · this file.

### Unverified claims carried forward

- That AutoPkg's conditional requests increment GitHub's counter even on a 304 — plausible,
  reported by the research agent, **not verified**.
- The ~January 2026 start date is a model output, not an observation.

---

## Revision 3 — 2026-08-08, maintainer decisions on Q1–Q8

All questions now answered. `questions.md` carries a DECISIONS table at the top; `07-plan.md`
has been restructured to match. Summary of what changed:

| Q | Decision | Plan effect |
|---|---|---|
| Q1 Apple membership | **Current** (parent company) | Critical path clear; S2a 3–5 d, no lead time |
| Q1b Windows signing | **Deferred to end** | S2b struck from Stabilise (−1–2 d) |
| Q2 v1.4.0 scope | Clock + updates + **bug fixes** | v1.4.0 and v1.4.1 **merge**; combined 39–64 d |
| Q3 Network control | **Leave unauthenticated** | F-004 splits; F6 descoped (−1–2 d) |
| Q4 NDI | **Park on a branch** | S6 → ~0.5 d (−5–8 d) |
| Q5 Colour management | **C** (preference, default on) | M7 fixed as written |
| Q6 Bars-fix comms | **B** (note + help page) | F1 fixed as written |
| Q7 Multi-output | **Yes, ~2.0+** | Schema shaped for `outputs[]`; **rebuild decision relocated to 2.0** |
| Q8 Rollbar | **A** (keep, scrub, disclose) | New **S10**, ~1 d |

### Two maintainer premises checked and found wrong (Q8)

1. **"We don't collect anything identifiable."** `node_modules/rollbar/src/server/rollbar.js:733`
   — `Rollbar.defaultOptions = { host: os.hostname(), … }`, and `src/main/rollbar.js:12-18` does
   not override it. The hostname is sent on every report, and `config.js:12-15` makes the hostname
   the app's display name too. Stack traces can also carry the OS username via `userData` and
   user-selected file paths (`audio.js:29,48,66`, `services.js:26-28`, `windows.js:447`,
   `ipc.js:114`).
2. **"We used to have a note in the readme."** `git log -S` across all branches: one commit,
   `39203c4` (2026-02-13), on the **unreleased** `feature/modernise`, and it is a *build*
   instruction, not a user disclosure. `git show master:README.md` has no mention of Rollbar,
   telemetry or privacy at all. No shipped version ever told users.

### F-004 split (Q3)

The unauthenticated LAN binding is now **accepted risk** — the maintainers' argument (diagnostic
tool, not show-critical; the API mutates config and nothing else) is sound and the original
Critical rating over-weighted network exposure. The **prototype-pollution guard still ships**
(S7); that was always a separate question. Consequence carried forward: F-024 (OSC arbitrary file
read) must still be fixed **before** anyone changes the OSC bind address, and F-015 is now a
functionality bug rather than a security one.

### Answered for the record: "what happens when we stop paying?" (Q1b)

Signatures are RFC 3161 timestamped on both platforms, so **already-signed builds keep validating
indefinitely**; you lose only the ability to sign new ones. Notarisation tickets do not expire and
a stapled ticket validates offline forever. Caveats: certificate *revocation* (for cause, not
cancellation) breaks things retroactively, and SmartScreen reputation restarts if you later resume
under a different identity.

### Files touched

`04-findings.md` (F-004 decision block, F-028 verified facts) · `07-plan.md` (S2a, S2b struck,
S6, S10 added, F1, F6, M7, totals, ordering diagram redrawn, §8a flip condition 1 rewritten) ·
`questions.md` (DECISIONS table, Q1b "stop paying" answer, Q8 verification) · `08-summary.md`
(release table) · this file.

### Open

Nothing blocking. Q9's residual — *identifying* the automated downloader — is still open and
non-blocking; recommended method is a canary `.pkg` attached to the v1.4.0 release.

---

## Handover to implementation — 2026-08-08

Review phase closed. Implementation approved by the maintainers. Handover written to
**`09-kickoff.md`**, which supersedes this file as the entry point for new sessions.

**First session's work order** (detail and acceptance criteria in `09-kickoff.md` §4):

| | Task | Effort | Gate |
|---|---|---|---|
| A1 | Park NDI on `feature/ndi`; take the uncommitted `package.json`/`package-lock.json` changes with it; make `getNdiStatus` honest; post a status update on #41 | ~0.5 d | — |
| A2 | Delete the two already-merged branches, close both dependabot PRs, **cherry-pick `3948005`**, add `dependabot.yml` | ~0.5 d | — |
| A3 | **Pixel harness.** Reuse the `ndi.js:60-146` shape. Launch with `--force-color-profile=srgb`. | 3–5 d | **Validates itself against F-001**: must reproduce `235,235,235` for 100% white *and* detect that 75% yellow is `180,180,0` rather than `180,180,16`. If it cannot, stop. |
| A4 | Levels fixes F1/F2/F3 | 2–3 d | Only after A3 is green |

**Human actions in parallel, starting now:** request the **Developer ID Application** *and*
**Developer ID Installer** certificates. v1.3.1 was signed with an `Apple Development`
certificate, which is the root cause of #110. Membership confirmed current (Q1), so there is no
renewal lead time.

**The rule that does not bend:** the pixel harness lands before anything that can change output.
With the signing fix and the levels change shipping in the same release (Q2), it is the only thing
that separates "we fixed the bars" from "something else moved too".

**Working-tree note carried forward:** `package.json` and `package-lock.json` are still modified
from before the review began (moving `grandiose` to `optionalDependencies`). They are correct, and
they belong on `feature/ndi` — task A1.

---

## Revision 4 — 2026-08-08, session close: scope decision + handover

Session ends here. Review complete, implementation approved and specified, nothing started.

### Scope decision — one release, not three

Maintainers: *"we will not be releasing the halfway-house 1.4.0 without everything being dragged
kicking and screaming up to date as of today"*, and asked me to choose between wrapping the
modernisation into v1.4.0 or doing a v1.4.1 immediately after.

**Decided: one release, v1.4.0, containing everything — Stabilise + Fix + Modernise, including
Electron 43 and the element-plus rebuild. No v1.4.1 chaser.** Preceded by a signed
`v1.4.0-beta.1` **pre-release** to validate the signing chain on real Macs.

Reasoning, in full, in `09-kickoff.md` §2. The load-bearing part: my original argument for staging
was to preserve a bisection point between "we deliberately changed the colour bars" and "Electron
43 silently changed the pixels" — but **that bisection point needs to be a commit with a green
pixel harness, not a release.** Release granularity was the wrong tool; commit granularity is
finer and cheaper. Once that was clear the case for staging collapsed.

Costs, recorded honestly: Electron 43 raises the macOS floor from 11 to 12, dropping Big Sur and
any remaining 10.15 users. Those users are already effectively stranded (unsigned installer,
unreliable notification), so shipping them one more Electron 34 build they also cannot install
helps nobody — but it is a deliberate choice and belongs in the release notes.

element-plus (M8/D8) is in scope but carries a **cut line**: it touches only the control window,
nothing depends on it, and it can be dropped late without unpicking anything. If it isn't stable
when everything else is ready, ship without it.

Useful property verified: the update checker calls `/releases/latest`, which the GitHub API
**excludes pre-releases from** — so the beta will not notify the existing install base. Opt-in by
construction.

### Durations re-costed for an AI-assisted workflow

`07-plan.md`'s figures are human-developer-days and are now marked as such. `09-kickoff.md` §5
re-costs everything in session-days: **~18–31 sessions** across four phases.

What compressed 2–4×: harness, levels fixes, dependency bumps, schema/OSC generation, cleanups.

What did **not** compress: certificate procurement (external), notarisation iteration
(unpredictable), anything needing visual judgement, and the element-plus rebuild.

**The constraint that reshaped the ordering: this machine is Windows.** I cannot build, sign,
notarise or test macOS locally. So **release CI (B1) moves early** — a GitHub Actions macOS runner
is the only route to a macOS artifact — and final acceptance requires a human with a Mac. Recorded
prominently in `09-kickoff.md` §3 rather than left as an assumption.

### New documents

| File | For |
|---|---|
| `docs/signing/apple-certificates.md` | Whoever administers the Apple Developer account (Team ID D4H96T8MEW). Self-contained: the problem, the evidence, exactly which two certificates to create and how, notarisation credential options, how to transfer secrets safely, and the verification commands. |
| `docs/signing/windows-code-signing.md` | Matt. Plain-English: what signing does, why the cost calculation changed, the four options, the "what happens when we stop paying" answer, what signing does *not* fix. |
| `docs/SESSION-PROMPTS.md` | Copy-paste session-start prompts — one for the next session, one reusable, plus variants. |
| `docs/review/09-kickoff.md` | Rewritten: scope decision, Windows-machine constraint, four-phase work order with re-costed estimates, harness spec, definition of done, traps. |

`07-plan.md` and `08-summary.md` carry SUPERSEDED banners pointing at `09-kickoff.md` §2. Their
items and ordering still stand; only release boundaries moved.

### Committed

`docs/` committed to `feature/modernise`. **`package.json` and `package-lock.json` deliberately
left uncommitted** — they move `grandiose` to `optionalDependencies` and belong on `feature/ndi`
as part of task A1.

### Next action

Start a session with §1 of `docs/SESSION-PROMPTS.md`. In parallel, send
`docs/signing/apple-certificates.md` to the Apple account administrator — the certificates are
the only hard external dependency and Phase B cannot start without them.

---

## Revision 5 — 2026-08-08, build location: local Mac, not CI (yet)

Maintainer question: *"do we want to set up GitHub Actions yet? The alternative is the Apple
developer builds the release on his machine."*

**Decided: the Apple developer builds macOS releases on their own Mac for v1.4.0. GitHub Actions
deferred until after the release.**

**I had this wrong, and the reason matters.** Release CI was scheduled early because it was *my*
only route to a macOS artifact from a Windows machine — a constraint of the assistant, not of the
project. With a human Mac in the loop that reason disappears entirely.

Case for local:

- Certificates never leave the keychain — no `.p12` export, no password transfer, no secrets
  stored anywhere. Removes the most awkward section of `apple-certificates.md`.
- Notarisation is the highest-variance task in the plan (costed 1–3 sessions with the caveat that
  3 was not a ceiling). Locally the loop is seconds instead of push-wait-read-logs.
- They can verify Gatekeeper actually accepts the result by double-clicking it. Green CI proves
  nothing about that.

**The objection it has to answer:** the original failure — a build silently selecting a
development certificate from a keychain — is precisely a local-build failure mode, and it survived
four years because the knowledge lived in one person's keychain. So local is acceptable **only**
with two mitigations, both of which work on a laptop and neither of which needs CI:

1. A committed, scripted build (`npm run release:mac`) with `mac.identity` set **explicitly**.
2. A preflight check that **fails the build** if the resolved identity does not begin
   `Developer ID Application:`.

Plus `docs/RELEASING.md` written *as* the first release happens, not after.

### Changes

- `docs/signing/apple-certificates.md` — §3.4 became "Nothing to export"; new §4 "What you will
  actually do to cut a release"; new §8 flagging the later CI move and that `.p12` export will be
  asked for separately, then. Note added about not revoking an existing Developer ID certificate,
  and about the private key needing to be on the building machine.
- `09-kickoff.md` §3 — constraint reframed; §5 Phase B rebuilt as B1–B6 with **B7 (CI) struck and
  deferred**; definition of done now requires the identity preflight check to be *verified to fail*
  on a wrong certificate.
- `SESSION-PROMPTS.md` — Phase B variant rewritten; reusable prompt's macOS constraint updated.

### Estimate effect

Phase B: 3–6.5 → **3–4.5 sessions**. Total **~18–29**. Some of that cost moves to the Apple
developer rather than disappearing — budget a few hours of their time, mostly on the first signed
build.

**Revisit after v1.4.0 ships.** Porting a known-good signing recipe to Actions is mechanical;
debugging an unknown one through a runner is where the time goes.

---

## Session record — 2026-08-08 — Phase A complete (A1–A4)

First implementation session. Read-only rule lifted. All work on `feature/modernise`; six commits,
`77ab43b..3a68a6f`. Nothing pushed, nothing deleted, nothing closed.

### A1 — NDI parked

`feature/ndi` created at `77ab43b` (local only, **not pushed**) and carries the uncommitted
`grandiose` → `optionalDependencies` change as `f565670`. It is currently the only copy of that
work outside this machine's working tree — worth pushing before `feature/modernise` merges.

Removed from the release line (`87b7181`): `ndi.js`, `ndi-worker.js`, `scripts/patch-grandiose.js`,
the `postinstall` hook that ran it, the `grandiose` dependency and ~240 lines of transitive
lockfile, the NDI drawer and toolbar button in `ControlMenu.vue`, and the `state.ndi.updateConfig`
fan-out in `ipc.js` and `windows.js`. `getNdiStatus` now returns `{available: false, active: false}`
unconditionally rather than relying on `state.ndi` being absent — the handler is kept deliberately
so anything still asking gets a definite answer.

A status update for issue #41 is **drafted but not posted**, per the brief. It says plainly why NDI
is not in v1.4.0, what has to happen before it can be, and does not commit to a version or a date.

### A2 — git hygiene

- `a6f8428` cherry-picks `3948005` (diagonal grid lines). Conflicts were formatting only — master's
  copy predates the Prettier pass on this branch. Diff stat matches the original exactly (23/21/4).
  `grid.diagonals` defaults to false, so no card renders differently until a user turns it on; that
  is why it could land ahead of the harness.
- `40ff643` adds `.github/dependabot.yml`. There was no `.github` directory at all, so Dependabot
  has been running on GitHub's defaults. Grouped weekly, capped at five, with `electron` and
  `electron-builder` **major** bumps excluded — D5/D6 step those by hand with the harness run
  between each, and an unattended multi-major jump is exactly F-002's risk. **Caveat: GitHub reads
  this file from the default branch only, so it does nothing until `feature/modernise` reaches
  `master`.**
- Branch deletions and dependabot PR closures are **prepared but not executed** — commands handed to
  the maintainer for approval. Two branches (`Electron16ReWrite`, `hotfix/macclosewindowbug`) are 0
  commits ahead and safe. `feature/previewwindow` is **1 commit ahead** and is deliberately excluded
  from the batch.

**Gap found in the review, recorded in `c5c2347`.** `06-branch-reconciliation.md` enumerated remote
branches, not pull requests, so it missed **PR #119** — an outside contributor (`zusorio`, May 2025,
123 files) doing substantially what `feature/modernise` does, plus WIP TypeScript and Zod config
validation that overlaps plan task C6. A maintainer replied warmly and proposed a call; the thread
has been silent since. **It must not be closed as branch hygiene.** It needs a reply and a decision.
A note with the evidence is appended to `06-branch-reconciliation.md`; nothing has been posted on
the PR.

### A3 — pixel harness (`0dd8690`)

`test/pixel/{run.js,cards.js,baseline.json,README.md}`, plus `npm run test:pixel[:validate|:record]`.
Each npm script rebuilds first on purpose — a stale `dist/` silently tests the previous commit.

**The day-one gate passed on the first run, and on four consecutive runs.** It reproduced
`235,235,235` for 100% white *and* detected that 75% yellow was `180,180,0` rather than the correct
`180,180,16`. Both assertions matter: one that only agrees with the app measures nothing, one that
only disagrees is broken.

Determinism measures, in rough order of importance: two byte-identical consecutive captures required
before sampling; `--force-device-scale-factor=1` and hardware acceleration off;
`--force-color-profile=srgb` (measures what the app *draws*, deliberately not what a display does
with it — that is D7/Q5); specific coordinates rather than whole-image hashes; and `--record` keeps a
point only if its 9×9 neighbourhood is flat, which rejects edges, text and antialiasing without
anyone needing to know what each card looks like.

Samples carry provenance. `source: 'spec'` means hand-authored from a documented value, and
`--record` will not overwrite those — so re-baselining cannot quietly erase a known-correct number.

Baseline recorded across the full matrix on **Electron 34.5.8 / Chrome 132, win32 x64** before any
fix. That is the reference point D6 steps away from.

### A4 — levels fixes

**F1 (`8a38ff0`)** — `Swatch.vue` multiplied the level by a 0/1 unit vector, so an inactive channel
landed on 0, sixteen code values *below* black. Now selects between the level and the black floor.
Level convention extracted to `src/levels.js`, which is what let F3 share it.

*What moved:* 101 of 398 samples, and every one is a channel going 0 → 16. Verified mechanically,
not by eye — no sample changed in any other way. Affected: all four `bars-simple` cases, `smpte`,
`arib`, `hdr`. Unaffected: everything else, including `bars-sdi` and `bars-single`.

**F2 + F3 (`3a68a6f`)** — done as one change, as F-013 recommends: no point restoring a missing step
in a 0-255 series that should be 16-235. Stops are now generated from the IRE step list already in
the file, giving `0, 16, 38, 60, 82, 104, 126, 147, 169, 191, 213, 235, 255` — even across the legal
range, with the existing -7.5 and 109 IRE sub-black/super-white markers at the ends.

*What moved:* 45 samples on the smooth ramps (compressed 0-255 → 16-235, matching 16 + 219x exactly),
and 42 on two **newly added** cases.

**Worth knowing:** `ramp-stepped` showed *zero* change, and that is not an oversight. The horizontal
and vertical stepped ramps draw swatch labels over the entire gradient, so what a user sees there was
already on the 16-235 scale — the gradient behind it has simply stopped disagreeing with it.
`showSteps` is false for Diagonal and Radial, which makes those the only variants where the stepped
gradient is visible and therefore the only place F-008's missing step was ever seen. Both were added
to the matrix and **recorded on the pre-fix code first**, so the change is measured rather than
asserted.

Final state: **440 samples across 22 cases, 0 failed.** `--validate` green.

Mismatches on `deghost` and `audioSync` are now **advisory rather than failures**. Both animate by
design, never produce two identical consecutive captures, and were flipping samples at random. They
are still captured and printed as WARN, just not gated on. Those two cards are effectively uncovered;
if that matters, give them a deterministic mode rather than loosening the harness.

### Judgement calls a reviewer might want to reverse

1. **The stepped ramp now has 13 bands, not 10.** Restoring only the missing 204 would have been a
   smaller change. 13 comes from deriving the bands from the step list already in the file, which is
   what makes the labels and the gradient agree and removes the duplication F-008 blames. It is more
   visible change than "restore one step", and users have learned this card's appearance.
2. **The harness forces `showInfo: false`**, so no text is measured anywhere. This is what keeps it
   from breaking on font rendering, but it means the info circle is not covered at all.
3. **`src/levels.js` is ESM** and imported via the `@` alias. Fine today (renderer only); worth
   noting before D3 bundles the main process.

### Still open from this session

- Push `feature/ndi`; post the #41 draft; run the prepared branch/PR commands. All need approval.
- **PR #119 needs a maintainer decision.** Oldest outstanding item created by this session.
- F1/F2/F3 are both user-visible and both belong in the release notes — Q6 decided the comms for the
  bars; the ramp change needs the same treatment and does not have it yet.
- Not started: A5 (small cleanups), and all of Phases B, C, D.

### Addendum — same session, after maintainer review

The record above was written at the end of A4. Everything below happened during review of that
work, and **three of the four items came from the maintainer reading the output, not from the
harness**. Worth carrying into Phase C: the harness catches what *changed*, not what was wrong to
begin with.

**1. The smooth ramp change was wrong and is reverted (`39ef429`).**

I had narrowed the smooth ramp to 16-235 under F3. The maintainer rejected it: the stepped variant
spans 0 to 255 at its extremes, so narrowing only the smooth one meant toggling `stepped` changed
where the card started and finished. I had introduced the exact inconsistency I claimed to be
fixing. My argument for it — that an unlabelled dark excursion "doesn't tell you anything" — was
also backwards: a ramp starting at 16 has no sub-black content, so a display that crushes below
black has nothing to crush and the fault becomes invisible.

All 48 smooth-ramp samples now reproduce the pre-fix baseline at `0dd8690` exactly. Both variants
take their extent from the same step list, so they cannot drift apart again.

**F-013 carries a note recording this.** Its diagnosis was right; half its prescription was wrong.
This matters because F3 in `07-plan.md` reads "ramp gradients on 16-235 like everything else" —
without the note, Phase D would reapply the mistake straight from the plan text. **Read F3 as
"make the ramp internally consistent and derived from one source", which is done.**

**2. New finding F-036 — Simple bars at -9 IRE inverts black and white.**

Found by the maintainer. `Bars.vue` drives bars 1-7 from `config.bars.level` and hardcodes bar 8 to
`ire="0"`. `ControlBars.vue` has *two* level controls writing one key: Simple offers 75/100/109,
Single offers -9/0/75/100/109. So -9 reaches Simple by being set on Single and switching type.

Measured (`bars-simple-minus9`): bars 1-7 are `0,0,0`, bar 8 is `16,16,16`. **The bar labelled
Black renders brighter than the bar labelled White.** Not a regression from F1 — identical before
and after it.

Fixed via option 1 of three (`6b6655f`): `ControlBars.vue` snaps an out-of-domain level back to 75.
Maintainer chose "1 leading to 3", so **option 3 — per-card-type valid domains in the config
schema, validated on load — is the agreed destination and belongs to C6.**

Note for whoever does that: watching `bars.type` alone is *not* enough, and the case it misses is
the one that matters. Switching Single→Simple changes the type and leaves a stale level; a config
saved in the bad state and loaded later changes the level while the type stays put, so no type
watcher fires. The second is what an existing install hits. Verified by driving the real control
window and reading back the config it emits over IPC — not by reasoning about the watcher, which
is how the gap was found.

Still uncovered by option 1, all needing C6: configs persisted bad on disk beyond the moment the
control window loads them; OSC/REST writes with no control window open; and the renderer itself,
which still produces the inverted output if handed that config directly. Harness case
`bars-simple-minus9` deliberately bypasses the UI and keeps recording `0,0,0` x7 plus `16` as
documentation of exactly that.

**3. OPEN AND NOT DECIDED — the black floor above IRE 100.**

F1 landed the 16 floor unconditionally. At 75% and 100% that is unambiguous and matches reference
values. Above 100 it is open. Shipped behaviour is `255,255,16` at level 109; it was `255,255,0`.

The maintainer's framing, which is the useful part and is recorded as a note on F-001:

> Full range versus reduced range is a property of the **whole scale** — it moves both ends at
> once, 0-255 against 16-235. But 75/100/109% are statements about the **white end only**. They say
> nothing about what is happening at the black end.

So "109 therefore full range therefore black is 0" does not follow. Level and range convention are
**orthogonal axes**, and the app has a control for one and none for the other. Choosing 0 or 16
here is picking a default for an axis the user cannot see or set — which is the same missing
concept as F-013's Full/Legal switch and M7/Q5. **Settle all three together, not piecemeal.**
Covered by `bars-simple-109` and `bars-single-yellow-109`; flipping it is contained to re-recording
those two.

**4. Outward-facing actions — executed, with approval.**

- `feature/ndi` **pushed**. No longer a single-machine copy.
- PRs **#117 and #115 closed** with comments explaining the yarn→npm move.
- Branches `Electron16ReWrite` and `hotfix/macclosewindowbug` **deleted** (both 0 ahead, re-checked
  immediately before).
- The two dependabot branch deletions **errored — already gone.** Dependabot deletes its own branch
  when its PR closes. For the runbook: closing the PR is sufficient, the delete is redundant.
- `feature/previewwindow` **deliberately not deleted** — 1 commit ahead, that commit exists nowhere
  else. File the preview idea as its own issue first.

Remote is now `master`, `feature/modernise`, `feature/ndi`, `feature/previewwindow`. One open PR:
**#119**, still needing a maintainer reply.

GitHub reported on push: **242 vulnerabilities on the default branch** (11 critical, 101 high).
That is `master`. D1 alone should clear ~40. The count will not move until `feature/modernise`
merges — and neither will `.github/dependabot.yml`, which GitHub reads from the default branch only.

**5. Status drafts committed (`9978406`).**

`docs/review/drafts/issue-41-ndi-status.md` and `issue-110-signing-status.md`. **Neither posted.**
Each carries its sources and a notes section that is explicitly not for posting.

The #110 draft has one real decision in it: it publicly states the root cause — installer never
signed or notarised, app signed with a *development* certificate rather than Developer ID. Already
public via the dataJAR AutoPkg recipe, so vagueness costs more than candour; the draft names no
individual. Both paragraphs cut to one line without weakening the rest. It also invites the three
affected users to test the signed pre-release, which is worth keeping — the signing chain cannot be
validated from Windows and they are self-selected volunteers.

### State at end of session

12 commits, `77ab43b..9978406`, working tree clean, `feature/modernise` **not pushed**.
Harness: **560 samples across 27 cases, 0 failed.** `--validate` green.

### Next session, in order (SUPERSEDED — see the final section of this file)

1. **A5** — the only unstarted Phase A work. Lint hygiene first (`npm run lint` still rewrites
   `dist/` and `particles.min.js`), then dead files, `mask.image`→`imageSource`, bonjour instances,
   wallpaper temp files. Plus `ramp.overlay` missing from `defaultConfig.json`, parked deliberately.
2. **Phase B** is gated on certificates and on an Apple developer's time, not on engineering.
3. Needing a maintainer, not a commit: **PR #119**; the **109 decision**; posting either draft;
   release-note wording for the stepped-ramp change (F1 has agreed comms under Q6, the ramp does
   not); and the **dataJAR heads-up** before B2 ships.

---

## A5 — partially done (same session)

Four commits, `e9d6488..5701211`. Build clean, lint clean, harness 560 samples 0 failed, tree clean.

### Done

**Lint hygiene, S9 — the documented trap is gone (`e9d6488`, `61d690c`).**

Two separate faults made `npm run lint` something you had to know not to run:

1. No ignore file, so `eslint .` walked `dist/`, `dist_electron/` and the vendored
   `src/assets/particles.min.js`. Nearly every reported error came from minified build output,
   burying the eight real ones.
2. `--fix` was baked into the default script, so the documented way to *check* the code silently
   rewrote it — build output and vendored bundles included.

Now: `.eslintignore` added; `lint` reports and changes nothing; `lint:fix` is opt-in.
**8 errors → 0.** The 285 warnings remain, nearly all `vue/attributes-order` and
`vue/require-default-prop`; they need a separate pass and a decision on enforce-vs-relax, and
`lint:fix` would handle 217 of them mechanically. **Do not run `lint:fix` across the tree without
the harness green either side** — it touches `src/components/TestCard/`.

Two of the eight errors were hiding something:

- `audio.js` — `textToSpeachData()` was not merely unused, it was **broken by construction**:
  it returns undefined immediately while the `say.export` callback returns into nothing. It could
  never have worked, which is presumably why `createTextAudio` exists alongside it. Removed with
  `lastCreatedVoice` and `textToSpeechCount`.
- `Testcard.vue` — five `_`-prefixed keys in `data()`. **Vue 3 does not proxy `_` or `$` prefixed
  data properties onto the instance**, so `this._timeIntervalId = ...` in `mounted()` wrote a plain
  instance property unrelated to the `_timeIntervalId: null` declared in `data()`. The declarations
  were inert; teardown worked only because both sides happened to touch the same non-reactive
  property. Renamed so the declaration and the usage are the same thing.

**F-029 (`12bd09a`)** — `defaultConfig.json` declared `mask.image`; every consumer uses
`mask.imageSource`. The key was renamed in code and the defaults never followed, so the mask had no
default at all and `GET /mask/imageSource` reported "Endpoint does not exist" until an image was
chosen. Fixed. **An existing install still has a stale `mask.image` persisted** — harmless, but it
wants pruning by C1's migration ladder rather than a one-off here.

That is now the third instance of the same shape, and they should be treated as one problem in C1/C6
rather than three fixes: `mask.image` vs `imageSource`, `ramp.overlay` bound to a control but absent
from defaults, and F-036's per-type level domains. **The default config and the code drift and
nothing checks.**

**Shared Bonjour instance (`5701211`)** — `require('bonjour')()` was called three times
independently (background.js, rest.js, osc.js), so the process held three mDNS sockets with three
separate service registries. That made shutdown *wrong*, not just wasteful: background.js calls
`unpublishAll()`/`destroy()` on its own instance, but the services actually advertised on the LAN
are published by rest.js and osc.js on the other two, so they were never unpublished — other
machines kept a stale advertisement pointing at a dead Kards until it aged out. Now one instance in
`src/main/bonjour.js`.

Bonus for D1: `bonjour`'s registry entry dates from **2013** and pulls the
multicast-dns → dns-packet → ip advisory chain. `bonjour-service` is the maintained near-drop-in
successor, and with the instance in one place that swap is now a one-line change.

### Not done — remaining A5

**Dead files (F-031) — DONE after all, in `f82449e`.** The reference check that had been cut short
completed in the background; every occurrence of these paths anywhere in the repository turned out
to be documentation describing them as dead, with no code references. `env.json.example` and
`env.example.json` confirmed same content, differing only in indentation and a trailing newline;
README points at `env.example.json`, which stays. `Deghost.vue:10` confirmed importing
`../../../public/particles.js`, the live unminified copy. All four deleted:

| Path | Why |
|---|---|
| `about.html` | references `./src/renderer.js` and `./styles/ui.css`, neither of which exists; not in `build.files` |
| `env.json.example` | superseded by `env.example.json` (`eebe793`) — **confirm they are identical first** |
| `src/assets/particles.min.js` | nothing imports it; `Deghost.vue:10` imports `public/particles.js` instead. Also the file that makes F-019 dangerous |
| `Swatch.vue:71` `vertical: false` | set, never read |

Warning learned the hard way: a recursive `grep -rn` from the repo root walks `node_modules` and
hangs. Use the Grep tool or scope the path.

Note `Swatch.vue` is under `src/components/TestCard/`, which ground rule 3 protects. Removing an
unread data key cannot change output and the harness confirmed it — 560 samples, 0 failed, identical
either side.

Also still open from F-031 and not started: `browserslist` in package.json (meaningless for an
Electron target, vue-cli leftover — belongs with D1), the `README.md:43` claim that `env.json` is
"required for the app to start" when `background.js:33-37` try/catches it, and `Deghost.vue:10`
importing out of Vite's `publicDir` so particles.js is both bundled and copied verbatim.

**Wallpaper temp files (F-025/F-026)** — not started.

**`ramp.overlay` missing from `defaultConfig.json`** — parked deliberately at the maintainer's
request; fold into the C1 work above.

---

## START HERE — state at end of 2026-08-08 session (SUPERSEDED — see the final section)

**Branch `feature/modernise`, 21 commits ahead of `origin/feature/modernise` (`77ab43b..56cf9e7`).**
Working tree clean. Build clean. `npm run lint` clean (0 errors, 285 warnings). Pixel harness
**560 samples across 27 cases, 0 failed**; `npm run test:pixel:validate` green.

**Phase A is complete.** A1 NDI parked · A2 git hygiene · A3 pixel harness · A4 levels fixes ·
A5 mostly done. Phases B, C, D not started.

### Do this first

1. **`npm run test:pixel`** before touching anything. If it is not 560/0, something changed
   underneath you and that is the story, not whatever you were about to do.
2. Read the three "judgement calls" and the F-013 note below before Phase D.

### Traps that will bite you specifically

- **Do not read F3 in `07-plan.md` literally.** "Ramp gradients on 16-235 like everything else" is
  the half of F-013 that was wrong and was reverted. The finding carries a note. Read F3 as "make
  the ramp internally consistent and derived from one source" — already done.
- **`npm run lint` is now safe** (it no longer rewrites). `npm run lint:fix` would clear 217 of the
  285 warnings mechanically, but it touches `src/components/TestCard/` — **run the harness either
  side** and expect to justify anything that moves.
- **A recursive `grep -rn` from the repo root walks `node_modules` and hangs.** Use the Grep tool or
  scope the path.
- `.github/dependabot.yml` is inert until this branch reaches `master` — GitHub reads it from the
  default branch only.

### Remaining work, in order

1. **Finish A5** — wallpaper temp files (F-025/F-026); `browserslist` removal (fold into D1); the
   `README.md:43` claim that `env.json` is "required for the app to start" when `background.js:33-37`
   try/catches it; `Deghost.vue:10` importing out of Vite's `publicDir`.
2. **Phase B** is gated on certificates and an Apple developer's time, not on engineering effort.
   B1 (the scripted signed build) can be written before they are available.
3. **Phase C.** Note that C1/C6 should absorb three findings as one problem — `mask.image`,
   `ramp.overlay`, and F-036's per-type level domains are all the default config and the code
   drifting with nothing checking.

### Needs a human, not a commit

- **PR #119** — outside contributor, ~15 months silent after a maintainer proposed a call.
  Overlaps C6. Needs a reply and a decision.
- **The IRE 109 question** — whether the black floor stays 16 above IRE 100. Changes shipped output.
  Settle with F-013's Full/Legal switch and M7/Q5 together, not alone. Note on F-001.
- **Two drafts in `docs/review/drafts/`**, neither posted (#41 and #110). The #110 one has a real
  decision in it about how publicly to state the root cause.
- **Release-note wording** for the stepped-ramp change. F1 has agreed comms under Q6; the ramp does not.
- **dataJAR heads-up** before B2 ships — their AutoPkg recipe pins the old signing identity and will
  fail. `Event-Engineering/ProjectReady` hard-codes the v1.3.1 filename and breaks the same day.
- **242 vulnerabilities reported on `master`** (11 critical, 101 high) as of 2026-08-08. D1 alone
  should clear ~40. The count will not move until this branch merges.

### The observation most worth carrying forward

Three of the four substantive corrections in this session came from the maintainer reading the
output, not from the harness. **The harness catches what changed; it does not catch what was wrong
to begin with.** Phase C's config migration ladder has no equivalent safety net at all.

---

## A5 finished, B1 written — 2026-08-08, second session

Six commits, `5e9e1df..fbdf084`, none pushed. Working tree clean. Build clean, `npm run lint` clean (0 errors,
285 warnings, unchanged), pixel harness **560 samples, 0 failed** at every gate.

### A5 — now complete

**Export completion is reported on every path (`2fb9b25`).** Not on the A5 list; found while
reading the wallpaper handlers for F-026, and it is the more serious of the two. The control
window puts up a fullscreen `ElLoading` mask when it sends `exportCard` and only removes it on
`exportCardCompleted`. Three paths never sent it:

- `wallpaper.set()` was awaited in a bare async IIFE with no catch — any rejection became an
  unhandled rejection and the export never finished.
- `showSaveDialog()` had no `.catch()`.
- `dom-to-image` failing in the renderer logged to console and told the main process nothing.

Each leaves the control window **permanently masked until the app is restarted**. If anyone has
ever reported Kards "hanging when you export", this is a candidate, and the wallpaper one is the
most likely to fire in the field. All three now route through one `finishExport(message)`, which
also closes the hidden capture window — picking up the third part of F-026, whose cleanup ran
synchronously alongside the save and therefore never ran on a failure at all.

**F-026 (`57d190f`).** Two fixed slots, `kards-wallpaper-a.png` / `-b.png`, used alternately by
mtime. Two rather than one because Windows and macOS both cache the desktop picture by path.
mtime rather than a counter because it survives a restart with nothing persisted. Legacy
`wallpaper<digits>.png` files are swept **only after a successful set**, when none of them can
still be the active background — a startup sweep would risk clearing the desktop of someone who
upgraded and has not exported since. Consequence, stated plainly: a user who never uses the
feature again keeps their existing pile; it just stops growing.

Verified by driving the **real handler** with stubbed deps against a scratch userData dir
(`windows.js` takes everything through injected `deps`, so this needs no Electron). Four exports
used a → b → a → b, left exactly two files, removed all three planted legacy files, and left
`wallpaper.png`, `wallpaperNotANumber.png` and `config.json` alone.

**README (`306291c`).** Three false claims: `env.json` "required for the app to start" (it is
try/caught with a fallback); an NDI section describing a feature A1 parked on `feature/ndi`, so
the release line documented an NDI sender that does not start; and "node 16+" against a Volta pin
of 22.22.0. Also added a pointer to the pixel harness, which had no mention in the README at all.

**F-031 `particles.js` (`2c34178`).** `Deghost.vue` imported `../../../public/particles.js`, so
Vite copied it verbatim *and* Rollup bundled it — the same 44 KB shipped twice, both inside the
asar. Moved to `src/assets/`. Worth noting why the green harness means something here rather than
being circular: `deghost` is one of the two animated cards whose mismatches are only advisory, so
"0 failed" alone would prove little — but `Deghost.vue:100` calls `window.particlesJS(...)`
unconditionally in `mounted()`, so a broken import throws and the card loses its canvas. Deghost
reported **zero mismatched samples**, not merely zero failures.

**Still deferred from A5:** `browserslist` removal, left folded into D1 as the previous session
decided — it belongs with deleting `core-js` and `vue3-resize-text` in one commit.

### B1 — scripted macOS release build (`6c82a39`, fixed in `fbdf084`)

`npm run release:mac`: preflight → vite build → electron-builder per arch → notarise/staple the
pkg → verify. Plus `build/entitlements.mac.plist`, an inherit variant for the helpers, and
`asarUnpack`.

**The guard is tested, not just written.** `scripts/mac/preflight.js` was driven on Windows with a
faked `process.platform` against eight mutated configs. Every one is caught with a specific
message, including the actual 2022 bug — an `Apple Development:` identity — and the omitted and
`null` identity cases that let electron-builder auto-select. The committed config reports no
configuration problems. Untested here: the keychain-presence and `notarytool` checks, because
`security` and `xcrun` do not exist on Windows.

`scripts/mac/verify.js` interrogates the **artifacts**, not the config: `codesign -dvvv`
Authority, hardened-runtime flag, deep seal, `spctl --assess` for `source=Notarized Developer ID`,
`pkgutil --check-signature`, `stapler validate`. A correct config is not a correct result.

**Two design decisions a reviewer might want to reverse:**

1. **Notarisation is an `afterSign` hook, and `mac.notarize` is `false`.** electron-builder
   notarises the `.app` but never staples it, and Apple's guidance for an app inside an installer
   is to staple both — the app before packaging, the package after. Stapling is what makes
   verification work with **no network**, which matters because Kards gets installed in venues.
   `afterSign` is the only hook that runs after signing and before the pkg target, so it is the
   only place the app can be stapled. Cost: two Apple submissions per architecture.
2. **`xcrun notarytool` directly, not `@electron/notarize`.** notarytool can read a credential
   stored in the keychain; electron-builder's wrapper only accepts environment variables. An
   app-specific password in the environment lands in shell history and `ps` output.

**One assumption corrected by testing.** I had written that `wallpaper`'s bundled binary inside
`app.asar` broke the feature at runtime. It does not — Electron patches `child_process` to
extract asar-internal executables to a temp dir first, verified by exec'ing the real packaged
`app.asar` on Windows. `asarUnpack` is still required, but **for signing only**: codesign cannot
reach into an archive, and an unsigned Mach-O in the bundle is what Apple's notary rejects.

**A trap that cost a build, and will cost the next person one too.** electron-builder validates
its config against a strict schema and **rejects unknown keys**, so `_comment_*` annotations
inside the `build` block fail the build outright — `configuration.mac has an unknown property`.
They are fine in npm's `scripts` block (`_comment_pixel` is still there), which is what made it
look safe. All the rationale that would have sat next to `mac.identity` now lives in
`scripts/mac/preflight.js` and the commit messages instead. **The identity line in `package.json`
therefore carries no warning at its own site**, and it is the most dangerous line in the
repository — preflight is the only thing standing between a wrong certificate and a release. That
is a real argument for moving the build config to `electron-builder.yml`, where comments are
legal. Not done; flagged.

### Needs the Apple developer — batch these, do not drip-feed

Everything below is unverifiable from Windows. B1 is written on the assumption that each is fine;
**none of it is confirmed, and none of it should be reported as working.**

1. **The exact identity strings.** `package.json` ships placeholders reading
   `Developer ID Application: REPLACE ME (D4H96T8MEW)` and the Installer equivalent. Preflight
   fails until they are real. From `security find-identity -v -p codesigning` and
   `security find-identity -v`.
2. **Whether the entitlement set is sufficient.** Four hardened-runtime entitlements, all
   Chromium's requirements rather than Kards'. Deliberately no `com.apple.security.device.*`.
3. **Whether the two-submission scheme works** — app notarised and stapled in `afterSign`, then
   pkg notarised and stapled. This is the least-certain part of B1.
4. **A real double-click install** on a Mac that has never seen the build. No automated check
   proves Gatekeeper acceptance.
5. **First launch with networking disabled** — the specific test that settles whether the
   stapling arrangement is right. If it fails, the fix is known: staple the app, rebuild the pkg.
6. **Whether audio output device names are visible on macOS.** `ControlMenu.vue:406` uses
   `navigator.mediaDevices.enumerateDevices()`, and macOS withholds device *labels* without
   microphone permission. If that dropdown is blank there, it is a macOS-only bug nobody has
   filed, and the fix is not obvious — asking for mic permission in a playback-only app is a bad
   trade. Cheap for them to check, impossible here.

### Artifact filenames will change, and it does not matter

electron-builder 24's `${arch}` resolves to `x64` / `arm64` / `universal`
(`builder-util/out/arch.js`, `getArtifactArchName`). v1.3.1 shipped `mac-apple-silicon.pkg` and
`mac-intel.pkg`, so the names move. This is harmless because the version is in the filename too —
every consumer breaks on v1.4.0 regardless. Relevant to the dataJAR recipe,
`Event-Engineering/ProjectReady` and the Homebrew cask, all already on the list. The update
checker is unaffected: `updateChecker.js:17` reads only `tag_name`.

### Next session, in order

1. **B6 `docs/RELEASING.md`** — the one Phase B item needing neither certificates nor a Mac, and
   the kickoff says it should be written **as** B1–B4 happen, not after. B1 is fresh now.
2. **B4 Windows release build.** The build is confirmed working here — `--win --x64` produces
   `Kards-1.3.1-win-x64.exe` (NSIS). What remains is the signed-vs-unsigned decision (Q1b) and
   documenting it.
3. **B5 update-notification reliability.** No external dependency, and F-005 is the highest High.
4. **Phase C** whenever Phase B stalls on other people. C1/C6 still need to absorb `mask.image`,
   `ramp.overlay` and F-036's per-type level domains as one problem.

### Unchanged and still open

PR #119 · the IRE 109 decision · both drafts in `docs/review/drafts/` unposted · release-note
wording for the stepped ramp · the dataJAR heads-up · 242 vulnerabilities on `master`. None of it
moved this session; see the previous section for detail.

**Correction to the previous handover:** it says `feature/modernise` is "not pushed". It is —
`origin/feature/modernise` is at `5e9e1df`, so all 21 of those commits reached the remote after
that block was written. This session's six are **not** pushed; the branch is 6 ahead. Pushing is
outward-facing and was not asked for.
