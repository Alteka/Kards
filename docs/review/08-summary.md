# 08 — Executive summary

**Alteka Kards · v1.3.1 · reviewed 2026-08-07, revised 2026-08-08 · branches `master` @ `3948005` and `feature/modernise` @ `6842bf1`**

---

## The three things that matter

**1. The macOS build is signed with the wrong kind of certificate, inside an unsigned installer —
so macOS tells users the app is malware.** Verified against the published release: all three
v1.3.1 `.pkg` files carry **zero** signature elements in their xar TOC and no notarisation ticket.
The `.app` inside *is* signed — but with an **`Apple Development`** certificate, chaining through
Apple's WWDR intermediate. That is a *development* certificate; it cannot satisfy Gatekeeper on
anyone else's Mac, by design. Most likely `electron-builder` auto-selected whatever identity was
in the build machine's keychain, silently. Issue #110 has been open 22 months, with three users
saying they cannot run the software and `sudo installer` as the standing workaround. Windows has
never been signed — a reasonable call on cost that is now worth revisiting. Until this is fixed,
every other fix in this review is undeliverable. *(F-003)*

**2. The colour bars are wrong, and have been for years.** Every non-greyscale bar renders its
inactive channels at **0** instead of the black level **16** — 75% yellow is `rgb(180,180,0)`
where a reference generator gives `rgb(180,180,16)`. Greyscale is correct, which is why the
README's "100% white is 235,235,235" claim holds while every colour bar is off. Separately, the
stepped ramp is missing a step (179 jumps to 230, skipping 204), and the ramp runs 0–255 while
every other card runs 16–235. **Nothing in this project ever looks at a pixel** — there are no
tests and no CI. *(F-001, F-008, F-013, F-022)*

**3. The modernisation is already ~85% done and unreleased.** The brief's premise — Vue 2, dead
toolchain, won't build on a current Node — is out of date. The app is Vue 3, and
`feature/modernise` has already migrated to Vite, split the monolith into 14 modules, added a
Clock card and built NDI output. **It builds in 10 seconds on Node 22 and the packaged app runs.**
The problem is not engineering capability; it is that nothing has been released since April 2024.
*(01, 02, 06)*

---

## What I got wrong in the brief, corrected

| Brief assumed | Actually |
|---|---|
| Vue 2, EOL Dec 2023 | **Vue 3** since v1.2.0 (2022). Not a factor. |
| Won't build on current Node | Builds and runs on **Node 22.22.0**, Volta-pinned. |
| Unmaintained ~2 years | Unreleased 2y4m; **commits through 2026-08-07**. |
| `electron-updater` on a possibly-dead feed | **No updater, deliberately** — notify-on-launch is the right model for event software. The defect is that the notification is unreliable, not that it exists. |
| Signing "probably broken" | **Confirmed for macOS by inspecting the published `.pkg` files**; Windows was never signed, on cost grounds. |
| Electron several majors behind | **34 → 43.** Out of support, but not ancient. |
| Kards Online may share the codebase | **It does not** — a separate implementation of the same cards, already behind on 3 card types. |
| ~100k installs | **Inflated.** 100,021 GitHub downloads, but something automated pulls all three macOS `.pkg` files ~100×/day each and never touches the `.exe` — measured, not inferred. **Real v1.3.1 installs ≈ 40,700, split ~54% mac / 46% win.** |

---

## Findings

**35 findings.** 4 Critical, 9 High, 15 Medium, 7 Low.

| Critical | |
|---|---|
| F-001 | Colour bars render inactive channels at 0, not 16 |
| F-002 | Display ICC profiles silently rewrite output; no `--force-color-profile` is set |
| F-003 | Shipped macOS installers unsigned and un-notarised (**verified**); Windows unsigned by choice |
| F-004 | Unauthenticated LAN HTTP API on `0.0.0.0:8321`, with **reproduced prototype pollution** |

The highest High is **F-005** — update handling is deliberately notify-on-launch, which is the
right model for event software, but the notification fires once at T+10 s and fails silently,
which is exactly what happens on a laptop still joining a venue network.

Of the 12 open GitHub issues, three (#110, #112, #111) have root causes identified here, and two
of those share one. Six years of closed issues cluster into four themes — PNG export (11 issues),
window/display management (8), info-circle layout (4) and config plumbing (4) — and three of those
four are exactly where this review's serious findings sit.

`npm audit` reports 41 advisories. **Three matter** (`electron`, `axios`, `tar` under
electron-builder); the rest is dev-only or unreachable. The two worst security problems are
application code, not dependencies, and no `npm audit fix` touches them.

---

## The plan

Three releases, each independently shippable. **~105–175 developer-days, ~7–10 months at current
capacity.**

| | Release | Contains | Effort |
|---|---|---|---|
| **Stabilise + Fix** | **v1.4.0** — *on Electron 34, deliberately* | Pixel harness · macOS signing + notarisation · release CI · reliable update notification · Homebrew cask · Clock card · config migration · Rollbar scrub + opt-out · **colour bars · ramp steps · level range · DPI sizing · `capturePage` export · IPC hardening** | 39–64 d |
| **Modernise** | **v1.5.0** | Isolated dep bumps · Vite 5→8 · bundle main process · electron-builder 24→26 · **Electron 34→43** · colour-management preference | 28–53 d |
| **Modernise** | **v1.6.0** | element-plus 1.0-beta → rebuilt control window | 10–20 d |
| **Improve** | ongoing | CI pixel tests · Linux + Windows portable · shared card package · TypeScript in `src/main` | 33–53 d |
| **Later** | **2.0** | Multi-output (#62) — and the point at which to re-run the migrate-vs-rebuild decision | — |

**Deferred by decision:** Windows signing (revisit at the end); NDI (parked on a branch).

> **Superseded 2026-08-08:** the three releases above are now **one — v1.4.0 — containing
> everything**, preceded by a signed `v1.4.0-beta.1` pre-release. The maintainers will not ship a
> halfway house. Items and ordering are unchanged; only the release boundaries moved. Electron 43
> raises the macOS floor to 12, which is a deliberate, release-noted choice. See
> `09-kickoff.md` §2.

**Why the colour-bars fix ships with the signing fix rather than before it:** a fix nobody can
install is worth nothing. The one constraint that does not bend is that the pixel harness lands
first — with signing and the levels change in the same build, it is the only thing that separates
"we fixed the bars" from "something else moved too".

**Why v1.4.0 stays on Electron 34:** Electron 43 raises the macOS floor from 11 to 12. Get a
signed, installable build to people *before* raising the floor, or Big Sur users stay on v1.3.1
with the wrong colour bars and no reliable way of being told.

---

## Migrate or rebuild

**Recommendation: incremental migration — with the element-plus step scoped as a deliberate,
bounded rebuild of the control window only.**

Migration ~105–175 days; rebuild ~87–145 days. The numbers are closer than they look, because the
card components port nearly verbatim either way and **signing plus release plumbing (~20% of the
total) is identical under both**. Four reasons the migration wins:

1. It is already 85% done, and the hard part went well.
2. A rebuild delays signing — the thing actually blocking users today.
3. Two people have ever committed to this repo. A rebuild is a 12–18 month no-ship gap on top of
   the 2y4m already elapsed. The migration ships something useful at month 2–3.
4. F-001 is proof that subtle level errors survive years unnoticed here. A rebuild is 15 fresh
   opportunities to introduce another one.

**Three facts that would flip it:** if multi-output (#62) becomes a committed roadmap item; if a
second full-time developer joins; or if Kards Online is also due a rewrite — in which case build
the shared card package once and put two thin shells on it.

---

## What I would advise against

Don't bump Electron and migrate element-plus in the same release — you lose the ability to bisect
an output change. Don't chase `npm audit` to zero. Don't ship NDI broken to an issue thread that
has waited five years. Don't build the iPad port. Don't delete the REST API to fix its security
hole — bind it to loopback and add a token. Don't tidy the card components while you're in there:
they are the product's real asset and every change needs a failing pixel test first.

---

## What you need to decide

Ten questions in `questions.md`, each with a recommended default; **"go with your defaults" is a
valid reply.** Two are on the critical path:

- **Q1 — is your Apple Developer Program membership current?** It decides whether a Developer ID
  Installer certificate can be issued today or has to wait on a renewal. Pure lead time — the one
  critical-path item that cannot be compressed by working harder.
- **Q4 — NDI.** `grandiose` currently cannot install at all; the recommendation is to cut it from
  v1.4.0 and post an honest update on #41.

---

## One number to correct before you quote it anywhere

The "100,000 installs" figure does not survive contact with the data. Sampling the release
counters 22 hours apart shows all three macOS `.pkg` variants gaining within four downloads of
each other (+96 / +92 / +94) while Windows gained 13; an 8-minute re-sample showed +1 on each mac
asset and 0 on Windows. Humans pick one variant. Something automated enumerates all three, ~100
times a day each, and never touches the `.exe`.

Best estimate of genuine v1.3.1 downloads: **~40,700 — about 54% macOS, 46% Windows**, consistent
with v1.3.0 (42% mac) and v1.2.0 (44% mac). The prime public candidate is the
`autopkg/dataJAR-recipes` AutoPkg recipe for Kards, though it does not fully account for the
volume. A throwaway extra `.pkg` attached to the next release would identify the culprit in a day.
Full working in `questions.md` → Q9.

This changes weighting, not the plan: **Windows is roughly half your users, not a fifth**, which
strengthens the case for Windows signing and for fixing the Windows-specific DPI defect (F-007,
issues #112/#111).

---

*Deliverables: `01-current-state.md` · `02-build-baseline.md` · `03-dependency-audit.md` ·
`04-findings.md` · `05-issue-triage.md` · `06-branch-reconciliation.md` · `07-plan.md` ·
`08-summary.md` · `questions.md` · `progress.md`. No application code, config or lockfile was
modified.*
