# Questions

*Batched at the end of Phase 7, per the brief. No early checkpoint was needed after Phase 1 —
the app builds and runs.*

*Revised 2026-08-08. Round 1: maintainer input on signing and update strategy — Q1 split into Q1
(macOS) and Q1b (Windows), both re-grounded on direct inspection of the published v1.3.1
artefacts. Round 2: the download-mirror investigation — **Q9 is now answered** and Q1's remaining
unknown (which certificate signed the app) was resolved from a third-party source. Ten entries,
nine still open.*

Each question has a recommended default. Sorted by what they actually block.

---

## DECISIONS — answered 2026-08-08

`07-plan.md` has been updated to match. Nothing below is still blocking.

| Q | Decision | Effect on the plan |
|---|---|---|
| **Q1** Apple membership | **Current** (parent company, paid up) | **Critical path unblocked** — no renewal lead time. S2a is 3–5 d of configuration. Request Developer ID Application **and** Developer ID Installer certificates. |
| **Q1b** Windows signing | **Deferred to end of project.** Question raised: what happens when you stop paying? | Answered in Q1b below — short version: **already-signed builds keep working forever**, you only lose the ability to sign new ones. S2b moves out of Stabilise into a late decision point. |
| **Q2** v1.4.0 scope | **Clock + update fix + bug fixes** | v1.4.0 and v1.4.1 **merge into one release**. Bigger, but justified after 28 months. Constraint: S1 still lands first, and the Electron bump stays out. |
| **Q3** Network control | **Leave unauthenticated.** Not show-critical; remote control is a nice-to-have. | Accepted — F-004's *binding* half downgraded to accepted risk. The `mergeDeep` prototype-pollution guard **still ships** (S7); that was never the same question. F6 shrinks to schema + validation + `res.json()`. |
| **Q4** NDI | **Park on a branch**, do the rest first | S6 becomes ~0.5 d: extract NDI to `feature/ndi`, fix `getStatus()` to report unavailable, post an honest update on #41. |
| **Q5** Colour management | **C** — preference, default on, release note + one-time notice | M7 as written. |
| **Q6** Colour-bars fix comms | **B** — release note + help-page explainer | F1 as written. |
| **Q7** Multi-output (#62) | **Yes, but ~2.0 or later** | Design the F6 config schema with an `outputs[]` array in mind (~1 d extra). **Does not flip §8a now** — but 2.0 becomes the natural point to re-run the migrate-vs-rebuild decision. See the note added to §8a. |
| **Q8** Rollbar | **A** — keep, add opt-out, scrub, document | Two premises checked and both are wrong; see Q8 below. Scope grows slightly: it *is* collecting an identifier, and the README never told users. |
| **Q9** Download figure | Answered by investigation, not by you | ~40,700 real v1.3.1 downloads, ~54% mac / 46% win. Windows re-weighted upward. |

---

## Blocking

### Q1 — Is your Apple Developer Program membership current?
**Blocks:** S2a → S3 → the entire release path. Pure lead time; the one critical-path item that
cannot be compressed by working harder.

**Since you were unsure, I checked the published artefacts directly** (method and transcript in
`02-build-baseline.md` §4a). The answer is more specific than "did we sign the Mac builds":

- All three v1.3.1 `.pkg` files, and v1.2.0 as a control, have **zero** `<signature>` and
  `<X509Certificate>` elements in their xar TOC, and **no stapled notarisation ticket**. The
  installers were never `productsign`ed or notarised.
- The payload's Bom **does** contain `Kards.app/Contents/_CodeSignature/CodeResources`, so the
  app bundle *was* signed.

So you were half right: **the app got signed, the installer never did.** For a `.pkg` downloaded
from the internet Gatekeeper evaluates the *package*, which is exactly issue #110.

And it turns out the app half is wrong too — see the update below.

**Update — the certificate identity is now known, from a third party.** The
`autopkg/dataJAR-recipes` AutoPkg recipe for Kards (added 2025-02-28) verifies your shipped app
against a requirement string its author read off a real copy of the package:

```
certificate leaf[subject.CN] = "Apple Development: Drew Perry (D4H96T8MEW)"
and certificate 1[field.1.2.840.113635.100.6.2.1]
```

**`Apple Development:` is a development certificate, not `Developer ID Application:`** — scoped
to your own machines and TestFlight, and by design incapable of satisfying Gatekeeper on anyone
else's Mac. The OID confirms it independently: `1.2.840.113635.100.6.2.1` is the Apple WWDR
intermediate (Development / App Store), where Developer ID would be `…6.2.6`.

So the full picture is: **app signed with the wrong certificate type, installer not signed at
all, nothing notarised.** That is a complete explanation of #110.

It also means **the membership was active when v1.3.1 was built** — you cannot get a development
certificate without one. The failure was identity selection in the build, most likely
`electron-builder` auto-picking whatever signing identity was in the build machine's keychain.
That happens silently, and it is why this went unnoticed.

**So the question narrows to just: is the membership still active today?**

- **A. Yes.** Request Developer ID Application + Developer ID Installer certificates now. S2a is
  ~3–5 days: set `mac.identity` explicitly (do not let it auto-select), add `hardenedRuntime` +
  entitlements, `@electron/notarize` on `notarytool`, `xcrun stapler staple`.
- **B. Lapsed.** ~$99/yr, re-verification can take several days. Start before any code work.

**Recommendation:** Check today; plan around **B** until you know. Whichever it is, add an
assertion to the release pipeline that the signing identity begins `Developer ID Application:` —
this class of mistake is silent, and it cost you two years of macOS installs.

*(Windows moved out of this question — see Q1b.)*

---

### Q1b — Will you sign Windows now that it costs ~$120/year?
**Blocks:** S2b, and the shape of your release CI.

You skipped Windows signing on cost, which was a sound call when an OV certificate meant several
hundred pounds a year **plus** a hardware token that made unattended CI signing impossible.

That has changed. **Azure Trusted Signing is roughly $10/month** for small organisations:
Microsoft-operated, no hardware token, runs unattended on a stock GitHub Actions runner, and
accrues SmartScreen reputation. DigiCert KeyLocker is the equivalent fallback.

Worth weighing: unsigned installers accrue **no** SmartScreen reputation at all, so Windows users
get flagged indefinitely rather than for an initial period. You have ~18.8k Windows downloads on
v1.3.1 — and per **Q9** that is very close to the *real* number, whereas the macOS figure is not.
WinGet only partly softens this: it verifies the hash, but SmartScreen still fires at install.

**Options:**
- **A. Azure Trusted Signing (~$120/yr).** Cheapest credible option; works in CI; reputation
  builds over the first few releases.
- **B. EV certificate (~$300–600/yr, token or cloud).** Immediate SmartScreen reputation, no
  build-up period. Worth it only if the first release must be clean on day one.
- **C. Continue unsigned.** Free; permanent SmartScreen friction; and note it also removes the
  option of ever verifying downloads yourself.

### "What happens when we stop paying?" — answered

The short version: **nothing happens to software you have already signed.** This is not a
subscription that holds your shipped installers hostage.

Both platforms sign with an **RFC 3161 timestamp**. Verification asks "was the certificate valid
at the moment of signing?", not "is it valid now". So:

- **Windows / Azure Trusted Signing.** Stop paying and every already-signed installer keeps
  validating indefinitely. You lose only the ability to sign *new* builds. (Azure Trusted Signing
  issues very short-lived certificates that rotate constantly — that is by design and is
  irrelevant to validity, precisely because everything is timestamped.)
- **macOS / Developer ID.** Same principle, plus notarisation tickets do not expire, and a
  **stapled** ticket means the package validates offline forever. If the Apple membership lapses,
  already-shipped, notarised, stapled builds keep launching.

Two real caveats, neither triggered by simply cancelling:

1. **Revocation is different from expiry.** If Apple or the CA *revokes* a certificate — which
   happens for cause, e.g. malware distribution — everything signed with it breaks immediately,
   retroactively. Ceasing to pay is not revocation.
2. **SmartScreen reputation attaches to the publisher identity.** If you stop, then later resume
   with a *different* certificate, reputation restarts from zero. Continuity has value beyond the
   signature itself.

So the commitment you are weighing is "can we sign the next release", not "will v1.4.0 keep
working". That makes deferring the decision genuinely low-risk — which is what you have chosen.

**Recommendation: A**, and more strongly than when this was first written. **Q9 establishes that
Windows is roughly 46% of your real users, not 19%** — the 81% macOS figure was inflated by
automated downloads. That roughly doubles the value of this and undercuts the "macOS is where
everyone is" argument for skipping it. Check organisation eligibility first (Azure Trusted Signing
needs a legal entity with 3+ years of verifiable history, which Alteka should satisfy). macOS is
still first in the queue, because that is where users are actively blocked — but Windows is no
longer a rounding error.

---

### Q2 — What ships in v1.4.0: just the release plumbing, or the unreleased features too?
**Blocks:** S5, S6 and the shape of the first release.

`feature/modernise` carries the Vite migration, the module split, a **Clock card** (issue #116)
and **NDI output** (issue #41 — the oldest and most-requested item in the tracker). All of it is
unreleased. The plan currently ships v1.4.0 as "signed and notarised, nothing else you can see."

**Options:**
- **A. Plumbing only.** Cleanest possible first release. Clock and NDI wait for v1.4.1. Easiest
  to debug if signing/updating goes wrong, because nothing user-visible changed.
- **B. Plumbing + Clock.** The Clock card is low-risk and closes an open issue. Adds one thing to
  the release notes that users will actually be pleased about after 2 years 4 months of silence.
- **C. Plumbing + Clock + NDI.** Only viable if Q4 resolves in favour of shipping NDI, and only
  after it has been verified working in a *packaged, signed* build on both platforms.

**Recommendation: B.** After a 28-month gap, a release that visibly does nothing is a hard sell,
and the Clock card is genuinely low-risk (a new card type, additive, no shared code paths). Hold
NDI until it can be proven to work in a packaged build — see Q4.

---

### Q3 — Should network remote control stay on by default?
**Blocks:** F6, and it is the behaviour change most likely to generate support mail.

Today the REST/HTTP API binds **every interface with no authentication** and is advertised on the
LAN over Bonjour (F-004 — prototype pollution reproduced). OSC is inconsistent: it binds
**loopback only** but is *also* LAN-advertised, so remote OSC control is discoverable and
non-functional (F-015).

Some users are certainly driving Kards from show-control systems today (issues #66, #67, #83).
Any change here can break a working show setup.

**Options:**
- **A. Default to loopback; explicit "Allow network control" toggle; token required when enabled.**
  Secure by default. **Breaks existing remote-control setups on upgrade** unless the toggle is
  surfaced prominently — a one-time notice on first launch after upgrade would cover it.
- **B. Keep binding all interfaces, add a token, add an off switch.** Nothing breaks; still
  exposed to anyone who guesses or omits the token; a token that defaults to on is another way to
  break existing setups.
- **C. Keep the current behaviour, fix only the prototype pollution.** Zero breakage, leaves an
  unauthenticated LAN control surface on ~100k machines.

**Recommendation: A**, with a one-time upgrade notice and a clearly visible toggle plus token in
the More menu. AV machines sit on show networks and guest Wi-Fi; secure-by-default is right, and
the cost is one dialog. The `mergeDeep` guard (S7) ships regardless and immediately, under all
three options — that part is not up for discussion.

Also note: whichever you choose, **fix F-024 (OSC `/audio/file` reads any local file) before
changing the OSC bind address**, or you turn a local-only issue into a LAN-reachable one.

---

### Q4 — Is NDI shipping, and if so how is `grandiose` going to install?
**Blocks:** S6, S3 (CI can't build reproducibly), and closing issue #41.

`grandiose` **cannot be installed** on this machine (F-011): the lockfile pins `git+ssh://`, and
npm ≥12 blocks git dependencies by default (`allow-git=none`). `npm ci` leaves no
`node_modules/grandiose`; the postinstall patch script prints "skipping" and exits 0; the app
still reports NDI as available. It would ship silently dead.

**Options:**
- **A. Publish a prebuilt fork to npm (or a private registry)** with per-platform binaries via
  `prebuild-install`. Removes the git dep, the SSH transport, the node-gyp requirement and the
  `binding.gyp` patch in one move. ~5–8 days. Also needs the **NDI SDK's redistribution terms
  checked against GPL-3.0-only** before shipping `libndi` in a signed bundle.
- **B. Cut NDI from v1.4.0**, fix `getStatus()` to tell the truth, post an honest update on #41.
  0.5 days.
- **C. Ship it as-is.** Not recommended — see below.

**Recommendation: B now, A next.** Issue #41 has nine comments over five years including an unmet
"give me a week or so" from 2021. That audience will take "it slipped again, here's why, here's
the plan" much better than a feature that silently does nothing. And C makes CI
non-reproducible, which blocks S3.

If you strongly prefer to ship NDI in v1.4.0, A must complete first, and NDI must be verified in
a **packaged, signed** build on both macOS and Windows — not in a dev run.

---

## Non-blocking — decide before the relevant step

### Q5 — What should the colour-management default be?
**Blocks:** M7. Not urgent, but decide before the Electron bump so the baseline means something.

Chromium colour-manages the app's CSS colours into the display's ICC profile. All three displays
on this machine report **non-sRGB primaries**, and the app sets **no** `--force-color-profile`
switch (F-002). So the app's headline claim — 100% white is 235,235,235 — is not true end-to-end
today, and an Electron bump could shift it further without anyone noticing.

**Options:**
- **A. `--force-color-profile=srgb` by default.** Makes output deterministic and matches what a
  reference generator does. **Will visibly change output on wide-gamut displays** for users who
  have been calibrating against current behaviour.
- **B. Add an "Accurate levels" preference, default off** (current behaviour preserved). Nobody is
  surprised; most users never find the switch and keep the wrong behaviour.
- **C. Add the preference, default on**, with a release note and a one-time notice.
- **D. Change nothing; document precisely what the app does and does not guarantee.**

**Recommendation: C.** A is correct in principle but too abrupt for a silent 100k install base;
B leaves the app's central claim untrue for almost everyone. C gets the right default with an
escape hatch and an explanation. Whichever you pick, the pixel baseline (S1) must be recorded on
Electron 34 **before** M6, or you lose the ability to tell an intentional change from a
regression.

---

### Q6 — How should the colour-bars fix (F-001) be communicated?
**Blocks:** F1's release notes. The fix itself is not in question.

Every non-greyscale bar currently renders its inactive channels at **0** instead of the black
level **16** — so 75% yellow is `rgb(180,180,0)` where it should be `rgb(180,180,16)`. This
affects every bars card and has been the behaviour for years. Fixing it is unambiguous; the
question is how loudly to say so.

**Options:**
- **A. Fix quietly, one line in the release notes.** Least alarming. Anyone who has documented
  measurements against the old output gets no warning.
- **B. Fix, with a clear release note and a short explainer on the Kards help page** describing
  the old and new values. Some users will ask whether their past measurements were wrong. They
  were, slightly, and it is better to say so.
- **C. Fix, and add a "legacy levels" compatibility toggle.** Nobody is disrupted; you have now
  committed to maintaining two colour models forever.

**Recommendation: B.** The users are AV professionals — they will respect a straight account of a
levels bug far more than a quiet fix they discover later. C is a trap: a compatibility toggle for
a defect is a permanent tax. Pair the note with a link to whatever you use as the reference
(e.g. the SMPTE/EBU bar values) so people can verify it themselves.

---

### Q7 — Is "multiple simultaneous outputs" (#62) on the roadmap?
**Blocks:** nothing immediately, but it is one of the three facts that flips §8a.

`07-plan.md` §8a recommends **incremental migration**. Multi-output is the single change most
likely to reverse that: retrofitting `{global, outputs[]}` onto one mutable config read by seven
writers is most of a state-layer rewrite, and it also touches the window manager — the other thing
a rebuild would want to redo.

**Options:**
- **A. Not planned.** Close #62 with an explanation. Incremental migration stands.
- **B. Wanted eventually, no date.** Design the F6 config schema with an outputs array in mind
  even if only one is used — cheap insurance, roughly a day of extra design.
- **C. Committed for the next major.** Re-open the rebuild question in §8a; the numbers get close.

**Recommendation: B.** It costs almost nothing to shape the schema for it, and it keeps the option
open without committing to the rebuild. But answer it honestly — B chosen as a way of avoiding
the decision is worse than a clean A.

---

### Q8 — Keep Rollbar error reporting?
**Blocks:** nothing. Answer at your convenience.

`initRollbar` sends every uncaught exception and unhandled rejection to a third party with
`captureUncaught` and `captureUnhandledRejections` (F-028). There is no consent prompt, no
opt-out, no mention in the README and no privacy policy. Payloads can contain user file paths
(`audio.js:95`, `services.js:27` log full paths) and the machine hostname, which is `config.name`
by design.

No secret is exposed — `env.json` is correctly git-ignored and the example token is empty.

**Options:**
- **A. Keep it, add an opt-out in the More menu, scrub paths and hostname, document it in the README.**
- **B. Make it opt-in.** Most privacy-respecting; you will get very little data.
- **C. Remove it.** You currently get no data anyway (nothing has shipped since 2024), and
  `electron-log` already writes local logs the user can send you via More → Logs.

**Recommendation: A.** After 28 months without a release you are about to ship a lot of change,
and crash telemetry is genuinely useful for exactly that. But scrubbing and disclosure are not
optional — if the app is distributed in the EU/UK, unannounced error telemetry with device
identifiers is a compliance question rather than a courtesy.

### DECIDED: A. But both premises behind the answer are wrong — checked, 2026-08-08

You said *"I thought we didn't collect anything identifiable anyway, and I'm sure we used to have
a note in the readme."* Neither holds up.

**1. It does send an identifier — the hostname, unconditionally.** The Rollbar Node SDK's default
options are, verbatim from the installed package:

```js
// node_modules/rollbar/src/server/rollbar.js:732-734
Rollbar.defaultOptions = {
  host: os.hostname(),
  environment: process.env.NODE_ENV || 'development',
```

`src/main/rollbar.js:12-18` does not override `host`, so every report carries the machine name.
And in this app that is not incidental: **`config.name` is derived from the hostname by design**
(`src/main/config.js:12-15`) — the machine name is the thing the app puts on screen *and* the
thing Rollbar reports. For a venue laptop that is usually a company name plus an asset tag.

Stack traces can also carry the OS username, because several error paths embed a `userData` or
user-selected file path: `audio.js:29,48,66` (`.../Users/<user>/Library/Application Support/...`),
`services.js:26-28` (`lstatSync` on an OSC-supplied path), `windows.js:447` and `ipc.js:114`
(user-selected image). Those throw with the full path in the error object.

**2. The README never told users.** `git log -S` across all branches finds exactly one commit
touching README with any Rollbar wording — `39203c4` (2026-02-13), on `feature/modernise`, which
is **unreleased**. And it is a *build* instruction, not a disclosure:

> "leave `rollbarToken` empty unless you use Rollbar for error reporting"

That is aimed at someone compiling the app, not at someone running it. `git show master:README.md`
has **no** mention of Rollbar, error reporting, telemetry or privacy at all. So no shipped version
has ever disclosed this. Your memory is real — it is just a memory of the developer note.

**Consequence for the plan.** Option A's scope grows a little, and it moves from "good hygiene"
to "should be done before the next release":

- Set `host` to a stable random install id, or omit it. Do not send the hostname.
- Scrub absolute paths before send (Rollbar's `transform` / `checkIgnore` hooks, or catch and
  rewrite at the call sites above).
- Add a real user-facing note in the README **and** in the About dialog, plus an opt-out in the
  More menu.
- ~1 day, up from the ~0.5 day this was carrying.

Separately and regardless: **run a full git-history secret scan** (`gitleaks` / `trufflehog`).
Commits `ccf1597` ("Put rollbar into an env file") and `9eb40bb` ("Rollbar token stuff") suggest
the token was moved *into* `env.json` at some point, which raises the question of whether it was
committed before that. I did not scan history in this pass — that is an explicit gap in
`04-findings.md`, not a clean bill of health.

---

### Q9 — [ANSWERED] The 100k download figure is inflated. Real v1.3.1 installs are ~40k.
**Blocks:** nothing. Kept as a question only because one part — *what* is doing it — is still open.

**This is no longer a question about whether. It is measured.** Sampling the GitHub release-asset
counters twice, 22.3 hours apart (2026-08-07 13:50 UTC → 2026-08-08 12:10 UTC):

| Asset | Then | Now | Δ | per 24 h |
|---|---|---|---|---|
| `Kards-1.3.1-mac-apple-silicon.pkg` | 29,567 | 29,663 | **+96** | ~103 |
| `Kards-1.3.1-mac-intel.pkg` | 24,753 | 24,845 | **+92** | ~99 |
| `Kards-1.3.1-mac-universal.pkg` | 26,879 | 26,973 | **+94** | ~101 |
| `Kards-1.3.1-windows-x64.exe` | 18,822 | 18,835 | +13 | ~14 |

Three different macOS variants gaining within four downloads of each other in a day is not human
behaviour — a person picks one, and an Apple Silicon user does not also fetch the Intel build and
the 181 MB universal build. A second sample eight minutes later made it tighter still:
**+1 on every macOS asset, 0 on Windows** — all three moving in lockstep inside one short window.

Whatever it is, it is **macOS-specific**: it enumerates the three `.pkg` files and never touches
the `.exe`. That rules out a generic "fetch every release asset" crawler.

**Corroboration from the cross-sectional data.** The variant ratios also flattened in a way
organic drift cannot explain — Apple Silicon share rising through 2024–26 should have made them
*more* uneven, not less:

```
v1.3.0   silicon : intel : universal  =  1.97 : 1 : 1.57
v1.3.1   silicon : intel : universal  =  1.19 : 1 : 1.09
```

Fitting to silicon+intel and holding out universal as an independent check:

- **Pure proportional growth** predicts universal 39,058 vs actual 26,973 — **45% error.** Rejected.
- **Organic growth ×7.65 plus a constant C per mac asset**: C ≈ **19,859**, predicts universal
  27,698 vs actual 26,973 — **2.7% error.**

And 19,859 ÷ ~100/day ≈ **199 days ≈ 6.6 months**, implying the activity began around
**January 2026**. Two independent methods agreeing is worth more than either alone — though note
the model has 3 data points and 2 parameters, so treat the start date as an estimate.

### Corrected numbers

| | Reported | Estimated genuine |
|---|---|---|
| macOS | 81,199 | **~21,900** |
| Windows | 18,835 | ~18,800 |
| **Total** | **100,021** | **~40,700** |
| Split | 81% mac | **54% mac / 46% win** — consistent with v1.3.0's 42% and v1.2.0's 44% |

### What is doing it — best candidate, not proven

**`autopkg/dataJAR-recipes` → `Kards/`** (added 2025-02-28). An AutoPkg download + Munki recipe
pair, inside the official `autopkg` org, maintained by dataJAR (a UK Apple-focused MSP). It uses
`GitHubReleasesInfoProvider` against `Alteka/Kards` with:

```
asset_regex:  Kards-([0-9]+(\.[0-9]+)+)-mac-%DOWNLOAD_ARCH%\.pkg$
DOWNLOAD_ARCH: universal | apple-silicon | intel
```

It fits the shape: macOS-only, knows all three variants as interchangeable options, and AutoPkg is
built to run on a daily cron across Mac fleets. It is also the source that established the
signing-certificate finding in F-003, so its author demonstrably had a real copy of the package.

**But it does not fully account for the volume.** One recipe run fetches one architecture, so
~100/day on each of three variants needs consumers running all three overrides in near-equal
numbers. AutoPkg overrides live in private repos, so this is unfalsifiable from outside — GitHub
code search finds no public override referencing the recipe.

**A cleaner reading of the data:** ~4/hour on each asset, moving in lockstep, looks like **one
automated actor iterating the three assets on a short cycle**, not ~100 independent Mac admins
each waking once a day (which would be noisy and skewed toward Apple Silicon, matching organic
preference). No public source explains that.

**Ruled out** (all searched, all negative): official Homebrew cask (does not exist — `formulae.brew.sh`
404, zero hits in `Homebrew/homebrew-cask`); nixpkgs; MacPorts; Installomator; fleetdm; the
`macadmins` org; any other AutoPkg recipe; download-aggregator and mirror sites (MacUpdate,
Softpedia, FileHorse, Uptodown and Russian/Chinese equivalents — none rehost or hotlink the mac
pkgs); Kards' own update checker (hits the API only, never an asset); and `alteka.solutions/kards`
itself (links to all four assets exactly once, no prefetch — and a crawler following that page
would hit the `.exe`, which is not happening).

One weak hit: `resonative/homebrew-proaudio`, a 3-star third-party tap with a Kards cask added
2025-11-11 — **universal only**, and its CI has no cron. Cannot produce the pattern.

**Caveat on the negatives:** GitHub code search only indexes public default branches. AutoPkg
overrides, Munki repos, and Jamf/Kandji/Mosyle catalogues are overwhelmingly private, so "no hits"
means "not public", not "does not exist".

### How to actually identify it

The GitHub counter exposes no user-agent or IP, so this cannot be resolved by searching. Two
options that would settle it in a day:

- **A. Redirector.** Point the Mac download buttons on `alteka.solutions/kards` at a URL you
  control that 302s to GitHub, and read the user-agents. Catches anything following your site;
  misses anything hitting the GitHub URL directly (which the AutoPkg recipe does).
- **B. Canary asset.** Attach a throwaway extra `.pkg` to the next release and watch whether the
  mystery traffic picks it up. Anything driven by `asset_regex` will follow it; a hard-coded
  mirror will not. **This is the more diagnostic of the two** and costs nothing.
- **C. Just ask dataJAR.** They are named, contactable, and responsive. One email establishes
  whether their runners pull all three arches on a schedule.

**Recommendation: B, folded into the v1.4.0 release, plus C in parallel.** Neither blocks anything.

### Why this matters to the plan

It does not change what needs doing — macOS still needs signing, that is #110. It changes
**weighting**: Windows is roughly **46%** of your real users, not 19%. That makes **Q1b** (Windows
signing at ~$120/yr) a stronger yes, and it raises the priority of the Windows-specific DPI defect
(F-007, issues #112/#111), which this review had discounted as affecting "a smaller but more vocal
group." They are not smaller.

Also worth an internal look: your own private `Event-Engineering/ProjectReady` has
`electron/mac/applications/sudo/install_kards.sh`, which curls `Kards-1.3.1-mac-apple-silicon.pkg`
with a hard-coded v1.3.1 URL. It is one-shot and single-arch so it cannot produce the pattern, but
if it ever runs in CI or a loop it will show up on one variant — and the pinned version will break
when you ship v1.4.0.

---

## Non-questions — decisions I made and proceeded on

Recording these so you can override them rather than discover them:

- **I reviewed `feature/modernise` as the baseline**, not `master`, because it is checked out,
  builds and runs, and contains ~85% of the modernisation. `master` is covered where the two
  differ (notably the missing `3948005` — see `06-branch-reconciliation.md`).
- **I did not run a git-history secret scan.** Flagged in F-028 and Q8 as a gap.
- **I did not build for macOS** — impossible from Windows. It is the least-verified path in this
  review and the majority platform, which is why Q1 leads.
- **I ran the app and probed its own REST API on this machine** to turn inferences into
  reproductions (the prototype pollution, the `0.0.0.0` bind, the HTTP 500s, the display colour
  profiles). Nothing was written to the repo; the app was stopped afterwards.
- **`npm ci`, `electron-builder` and the asar inspection were run against a scratch copy**
  outside the repo, so no lockfile was touched. `git status` is clean apart from `docs/review/`
  and the two files that were already modified before this review began.
