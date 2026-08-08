# 05 — GitHub issue triage

*Phase 6 deliverable. Source: `gh issue list --repo Alteka/Kards --state all --limit 500`,
retrieved 2026-08-07. **77 issues total — 12 open, 65 closed.** Every open issue appears below
with a disposition.*

Dispositions used: **Confirmed** · **Already fixed (unreleased)** · **Not reproducible** ·
**Stale** · **Needs info** · **Won't fix** · **Accept (feature)**.

---

## Summary

| Disposition | Count | Issues |
|---|---|---|
| Already fixed, unreleased | 2 | #116, #41 (fixed but **ships broken** — see F-011) |
| Confirmed — root cause located | 3 | #112, #111, #110 |
| Accept — feature, viable | 4 | #121, #104, #105, #62 |
| Won't fix / decline explicitly | 2 | #120, #68 (the Raspberry Pi half) |
| Needs info | 1 | #40 |

**Three of the twelve open issues (#110, #112, #111) have a root cause identified in
`04-findings.md`, and two of those three share one.** The single most valuable observation from
the triage is at the bottom: the closed-issue history shows the same architectural weaknesses
producing bugs over and over.

---

## Open issues

### #121 — Config Shown Info
*Opened 2025-09-13 · 0 comments*

**Summary.** Requests a menu to choose *which* items the "Show Info" overlay displays
(resolution, framerate, clock, hostname, IP, name, audio device) rather than all-or-nothing per
card type, plus the ability to pick which network interface's address is shown instead of cycling
through all of them.

**Responsible code.** `src/components/TestCard/InfoCircle.vue`; the per-card info boxes
(e.g. `HDR.vue:73-80`); `src/main/ipc.js:125-138` (`networkInfo` — builds the list of every
non-internal IPv4 address); `src/views/Testcard.vue:321-324` (the 5-second rotation through them);
`config.showInfo` / `config.showClock` in `defaultConfig.json:6,10`.

**Reproduction.** N/A — feature request, and the described behaviour is exactly what the code
does. The interface-cycling complaint is well-founded: `ipc.js:128-134` pushes *every* non-internal
IPv4 address, so a laptop with Wi-Fi, Ethernet, a VPN and a Docker bridge cycles through four
addresses at 5-second intervals.

**Disposition: Accept (feature).** Well-scoped, clearly motivated by real venue use, and cheap.
It becomes almost free once the config schema work in F-004/F-006 exists: add
`config.info.{resolution, framerate, clock, hostname, ip, name, audioDevice}` booleans and an
interface filter. Effort **M**. Do it in the *Fix/Improve* wave, after the schema exists — doing
it before means adding another hand-maintained set of OSC/REST endpoints (F-016).

**Related:** F-006, F-016, closed #58 ("Display IP address with info") which introduced the
cycling behaviour being complained about.

---

### #120 — IPad Pro release [Feature Request]
*Opened 2025-06-07 · 0 comments*

**Summary.** Requests an iPadOS port, correctly noting Electron cannot target iPadOS and
suggesting React Native, and linking Apple's connected-display API.

**Responsible code.** N/A.

**Disposition: Won't fix — but say so.** A React Native port is a **from-scratch second
application**, not a port: none of the Electron main process (windows, OSC, REST, Bonjour, NDI,
TTS, wallpaper, PNG export) survives, and the card components would need re-implementing against
React. That is comparable in size to the rebuild option in `07-plan.md` §8a, for a third platform,
before the two existing platforms are back in a shippable state.

**However**, the user's actual need — a test pattern on a display driven from an iPad — is
already 80% met by **Kards Online** (`kards.alteka.solutions`), which runs in Safari on iPadOS
and supports 6 of the 9 card types. That is the answer to give, and it is also an argument for
the shared-card-package work in **F-027**: investing there makes Kards Online a first-class
answer to this class of request instead of a poor relation.

Recommend: reply pointing at Kards Online, note the card-type gap, close as "not planned",
and link it from the F-027 work.

---

### #116 — Clock card type
*Opened 2025-01-21 · 0 comments*

**Summary.** "A nice looking, customisable, broadcastish clock card output."

**Responsible code.** `src/components/TestCard/Clock.vue` (228 lines),
`src/components/Control/ControlClock.vue`, `config.clock` (`defaultConfig.json:80-84`),
registered at `Testcard.vue:67` and `Control.vue:37-39`, `Ctrl+9` shortcut at `Control.vue:332`.

**Disposition: Already fixed — unreleased.** Implemented on `feature/modernise` in commits
`65d5c7e` ("Add basic clock card type") and `b9a54dc` ("More clock things"), 2026-02-12. It has
never shipped, because the last release is v1.3.1 from 2024-04-03.

Two caveats before closing it:

1. `config.clock` is a **new top-level key**, and the shallow config merge (F-006) is why
   `Control.vue:262` needs a hand-patch for it. That patch covers the control window only, not
   the test card window. Verify the clock card actually works for an upgrading user, not just a
   fresh install, before claiming this closed.
2. The issue asks for "broadcastish" and "customisable"; the implementation offers bg/fg colours
   and a gradient toggle. Worth checking with the reporter whether that meets the ask.

---

### #112 — Under Windows, with Display Scaling (125% DPI), cards are generated at lower resolution
*Opened 2025-01-17 · 3 comments*

**Summary.** Two 4K monitors at 3840×2160 with 125% scaling; Kards reports both as 3072×1728
(exactly 3840 ÷ 1.25) and cannot export a true UHD card. Maintainers replied that this is
expected and suggested windowed mode; the reporter pushed back that fullscreen apps normally get
the native resolution.

**Responsible code.** `src/main/windows.js:203-244` (uses `disp.bounds`, which is in DIPs),
`src/main/ipc.js:45` (`setContentSize`, DIPs), `src/views/Testcard.vue:191-192` (`visualViewport`,
CSS pixels).

**Reproduction.** Not reproduced end-to-end, but **the mechanism is confirmed on this machine**:
`GET /screens` reports `scaleFactor: 1.25` on one display, and every sizing call in the app is in
device-independent pixels. 3840 ÷ 1.25 = 3072 exactly matches the reporter's screenshot.

**Disposition: Confirmed — and the maintainer replies are wrong.**

The reporter is right. This is not inherent to Electron: `screen.getAllDisplays()[].bounds` and
`setContentSize()` are documented as DIPs, and the app can and should divide by `scaleFactor`
(or set `webContents.setZoomFactor(1 / scaleFactor)`) to get native output. Chromium renders at
`deviceScaleFactor`, so the physical pixels *are* available — the app just never asks for them.
The suggested workaround (windowed mode + type a resolution) has the same defect: a 3840-wide
*windowed* card on a 125% display is 4800 device pixels, resampled.

The root cause is **F-007**, which also explains **#111** and closed **#30**.

Recommend: reopen the conversation with the reporter, fix per F-007, and verify against the
pixel harness (F-022) at 100%, 125%, 150% and 200% scaling.

**Related:** F-007, F-009, #111, closed #30.

---

### #111 — Incorrect output resolution
*Opened 2024-12-03 · 1 comment*

**Summary.** Exported PNGs come out one pixel larger in each dimension — a 1920×1080 card exports
as 1921×1081. Subtracting a pixel fixes the file but then the card labels itself one pixel under.
Maintainer could not replicate and asked for OS and settings file; no reply.

**Responsible code.** `src/views/Testcard.vue:242-247`:

```js
let size = document.getElementById('cardForPNG').getBoundingClientRect()
opts.width = size.width      // a float
opts.height = size.height
```

then `dom-to-image` builds its SVG/canvas from those floats.

**Reproduction.** Not reproduced (needs the reporter's DPI setting). **Cause identified with high
confidence, and it explains why the maintainer couldn't replicate it:**
`getBoundingClientRect()` returns fractional CSS pixels whenever the layout doesn't land on an
integer boundary, which is exactly what a non-integer `scaleFactor` (125% = 1.25, 150% = 1.5)
causes. `dom-to-image` then rounds up when sizing its canvas → +1 in each dimension. On a 100%-DPI
machine — which the maintainer, a self-described non-Windows user, would have been testing on —
the rect lands on integers and the bug does not appear.

**This is the same root cause as #112**, seen from the export path instead of the display path.

**Disposition: Confirmed (cause identified, symptom not reproduced).** Fix via F-007
(size in device pixels) + F-009 (replace `dom-to-image` with `capturePage`, which cannot produce
a fractional size because it captures a real framebuffer). Add `Math.round()` on
`opts.width/height` as an immediate mitigation if the full fix is deferred.

**Related:** F-007, F-009, #112.

---

### #110 — Kards 1.3.1 flagged as potential malware
*Opened 2024-10-18 · 5 comments*

**Summary.** macOS refuses to run the `.pkg` from the Kards site. Three separate users confirm it
across Universal, Apple Silicon and Intel packages. The reporter hypothesises an expired Apple
Developer account. The maintainer confirms it is known, says a better solution will take a while,
and offers `sudo installer -pkg … -target /` as a workaround.

**Responsible code.** `package.json:75-78` — the `mac` build block, which has **no
`hardenedRuntime`, no entitlements, no notarisation hook**. And the absence of any release
automation or `docs/RELEASING.md`.

**Reproduction: the cause is confirmed directly from the published artefacts.** The Gatekeeper
dialog itself cannot be reproduced here (no macOS), but it does not need to be. Range-fetching
and parsing the xar TOC of all three v1.3.1 `.pkg` assets (`02-build-baseline.md` §4a) shows:

```
Kards-1.3.1-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-apple-silicon.pkg   <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-intel.pkg           <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
```

No installer signature, and no stapled notarisation ticket. The payload's Bom does contain
`Kards.app/Contents/_CodeSignature/CodeResources`, so **the app was signed and the installer was
not** — and for a `.pkg` downloaded from the internet, Gatekeeper evaluates the package. That is
precisely this dialog.

**So the reporter's guess was close but not quite right.** They hypothesised an expired developer
account; the actual defect is that the `.pkg` was never `productsign`ed or notarised in the first
place — v1.2.0 shows the same, so this predates any expiry. Whether the membership has *also*
lapsed is still worth confirming (**Q1**), because it determines whether a Developer ID Installer
certificate can be issued today or has to wait on a renewal.

**Disposition: Confirmed, with the root cause identified — and this is the highest-priority open
issue in the tracker.**

It has been open for 22 months, three users have said they cannot use the software, one said
"I'd like to use this software, but can't right now", and the v1.3.1 release notes describe an
earlier instance of the same failure "leading to installs being deleted." With ~81,000 macOS
downloads of v1.3.1, the number of people who hit this and simply gave up without opening an
issue is the real figure.

The workaround offered (`sudo installer`) asks a user to bypass Gatekeeper with sudo on the
strength of a GitHub comment. That is not a workaround that should be the standing answer.

Fix is **F-003**, and it is item 1 in the Stabilise phase of `07-plan.md`. Two notes:

- It is a **smaller** job than "set up signing from scratch": the app-signing half already works.
  What is missing is a Developer ID *Installer* certificate, `notarytool`, and `stapler`.
- Getting the fixed build to the people who already hit this depends on **F-005** — the
  notify-on-launch check is the only route, and it silently skips anyone offline at launch.

**Related:** F-003, F-005, closed #107 (same problem, April 2024).

---

### #105 — deb or flathub version for Ubuntu
*Opened 2023-10-21 · 0 comments*

**Summary.** Requests deb/Flathub packages for Ubuntu and other distributions.

**Responsible code.** `package.json:63-87` — no `linux` block; no Linux artifact in any release.

**Disposition: Accept (feature) — deb and AppImage; defer Flatpak.**

electron-builder produces AppImage and `.deb` from a `linux` block with very little work; the app
has no Windows/macOS-only code paths except `say` (TTS) and `wallpaper`, both of which have Linux
implementations of varying reliability, and the macOS-only Touch Bar (already guarded). Flatpak
is meaningfully more work (sandbox permissions for mDNS, the HTTP server port, and display
enumeration) and should be a separate decision.

Effort **M** for AppImage + deb, once release CI exists (F-003). Sequence it after signing, since
it is another artefact to build in the same workflow.

Practical caveat to test: `wallpaper` on Linux supports a limited set of desktop environments, and
`say` requires `espeak`/`festival` to be installed. Both features should degrade gracefully rather
than throw.

**Related:** F-003, #68.

---

### #104 — Kards Portable for Windows
*Opened 2023-10-21 · 1 comment · label: enhancement*

**Summary.** AV techs work on client laptops where installing software is often not permitted or
not wanted; a portable build would let them run Kards without an install. Maintainer replied that
1.4 aims to improve install and rollout options.

**Responsible code.** `package.json:82-86` — NSIS only.

**Disposition: Accept (feature) — and it is the cheapest high-value item in the tracker.**

electron-builder supports `target: ["nsis", "portable"]` out of the box. Effort **S**. The
motivation is exactly right for this product: a test card generator is by nature something you
carry to someone else's machine.

Two things to handle:

- `electron-store` writes to `%APPDATA%` by default, so a "portable" build would still leave
  settings behind. Set `cwd` to the executable's directory for the portable target if genuinely
  portable behaviour is wanted — worth asking the reporter which they mean.
- The REST and OSC servers bind ports on launch (F-004, F-015). On a client's machine that is a
  more sensitive default than on your own. Another reason to default network control to off
  (F-004 recommendation 3).

**Related:** F-004, F-021 (a 112 MB portable exe is a poor experience — worth fixing the asar
bloat before shipping this).

---

### #68 — Linux distribution (with Raspberry Pi GPIO / I2C OLED)
*Opened 2022-01-10 · 2 comments · label: enhancement*

**Summary.** Two requests in one: (a) a working Linux distribution, ideally ARM; (b) Raspberry Pi
support with GPIO buttons and a 128×64 I2C OLED control screen. A commenter wants to run it on a
battery-backed Pi Zero 2 W as a pocket test generator, and reports getting it to compile on Linux
("Compiled successfully in 160217ms").

**Disposition: Split it.**

- **(a) Linux distribution — Accept.** Merge with #105 and track there. The commenter's report
  that it compiles is a useful signal.
- **(b) Raspberry Pi / GPIO / OLED — Won't fix, and say so plainly.** Electron dropped 32-bit ARM
  Linux support; a Pi Zero 2 W cannot drive a Chromium compositor at a usable frame rate for a
  full-screen animated test pattern; and GPIO/I2C hardware control is a different product. The
  commenter's own workaround — a video loop of the Kards interface on a dedicated Pi OS image — is
  honestly a better fit for that need than Electron would be.

  This has been open for four and a half years. Closing it with a clear "no, and here's why" is
  better for the requester than a fifth year of silence. Note the README makes no Raspberry Pi
  claim, so nothing needs correcting there — the brief's assumption that Pi is "still claimed" is
  not borne out.

**Related:** #105, `03-dependency-audit.md` §5.

---

### #62 — Allow multiple outputs
*Opened 2022-01-10 · 1 comment · label: enhancement*

**Summary.** Multiple simultaneous test card outputs with different settings on different
displays. A commenter adds that multiple render windows in LED mode, even on the same output,
would be useful.

**Responsible code.** This is blocked by the app's core state model. `src/main/config.js` holds
**one** `_config`; `state.testCardWindow` is **one** window (`background.js:41`); OSC, REST, the
menu, the Touch Bar and both renderers all read and write that single object.

**Disposition: Accept (feature) — but recognise what it costs.**

This is the largest architectural change requested anywhere in the tracker. Delivering it means
config becoming `{ global, outputs: [ {...}, {...} ] }`, with every consumer — main process,
control UI, OSC (~460 hand-written handlers, F-016), REST, menu, Touch Bar, NDI — updated to
address an output by id.

That makes it a genuinely important input to `07-plan.md` §8a: **if multiple outputs is on the
roadmap, it argues for the rebuild**, because retrofitting multi-output onto the current
single-mutable-object model is most of the work of rebuilding the state layer anyway, with none
of the benefit. If it is not on the roadmap, say so and close it.

Recommend: defer the decision to the §8a outcome, and label it accordingly rather than leaving
it open and unanswered for another four years.

**Related:** F-004, F-016, F-018, `07-plan.md` §8a.

---

### #41 — NDI output
*Opened 2021-01-08 · 9 comments · label: enhancement*

**Summary.** The single most-requested feature in the tracker, five years old, with sustained
user pressure across nine comments. The maintainer's own comments track the journey: initially
"beyond the realm of an Electron app", then a proposed local-URL workaround, then (2021)
"I've made some serious progress… give me a week or so", then "progress is happening", then
silence.

**Responsible code.** `src/main/ndi.js` (244 lines), `src/main/ndi-worker.js` (97 lines),
`scripts/patch-grandiose.js`, `package.json:45-47`, and the NDI drawer in
`ControlMenu.vue:256`.

**Disposition: Already fixed (unreleased) — but it ships broken.**

The implementation on `feature/modernise` is genuinely good work: the `grandiose` native addon
runs in an Electron `utilityProcess` specifically to stop it SIGSEGV-ing the main process on
macOS (`ndi.js:4-8`), a hidden `BrowserWindow` renders the card, and `capturePage()` feeds BGRA
frames to the worker at 25 fps.

But **`grandiose` cannot be installed** — see **F-011**. On this machine `npm ci` leaves no
`node_modules/grandiose`, `patch-grandiose.js` prints "binding.gyp not found, skipping" and exits
0, and `getStatus()` still reports `available: true` (`ndi.js:228-238`). Shipping as-is would
deliver a five-year-awaited feature that silently does nothing, to the most vocal group of users
in the tracker.

Two further gaps worth flagging before this is announced:

- **25 fps is hardcoded** (`ndi.js:14`). NDI consumers will expect to choose, and 25 is a
  European broadcast rate — a US user will get 25 fps NDI by default. Given that the app itself
  is a *frame rate test tool*, that is an awkward default.
- **No audio.** The maintainer flagged this in the issue thread in 2021 ("I'm not sure how audio
  will work yet, both in terms of AV Sync but also audio tests"). It is still not there, and
  `ndiWindow.webContents.setAudioMuted(true)` (`ndi.js:85`) makes it explicit. The A/V sync card
  over NDI without audio is of limited use — say so in the release notes rather than letting
  users discover it.

Recommend: do **not** close this issue until F-011 is resolved and NDI has been verified working
in a packaged build on macOS and Windows. If that cannot be done in the next release, cut NDI
from it and say why in the thread — the users in this thread have waited five years and will take
an honest update better than a broken feature.

**Related:** F-011, F-009 (shares the capture path), #40.

---

### #40 — SDI output using Blackmagic hardware
*Opened 2021-01-08 · 7 comments · label: enhancement*

**Summary.** SDI output via Blackmagic DeckLink hardware, using the `macadam` library. The thread
contains real technical discussion: the blocker was always getting RGBA frames out of a Chromium
renderer at a reliable rate, and the maintainer's last substantive comment says *"Once we're
updated to electron 16 I'll revisit this request. Taking the same virtual window buffer that
Grandiose needs we could pipe the same thing to Macadam."* A user asked again with no reply since.

**Disposition: Needs info — but the technical blocker has been removed.**

The stated precondition is met and then some (the app is on Electron 34, not 16), and more
importantly **the frame pipeline the maintainer said was the hard part now exists**: `ndi.js`
already captures the card to a BGRA buffer in a hidden window and posts it to a `utilityProcess`.
Pointing that same buffer at `macadam` instead of `grandiose` is a variation on solved work, not
new work.

What genuinely needs deciding before this can be triaged properly:

1. **Is it wanted?** DeckLink output is a niche within a niche, and it commits the project to a
   second native addon with the same install fragility as F-011 — which is currently unsolved.
   Resolve F-011 first; if a maintained NDI binding can't be found, a DeckLink one is worse.
2. **Reliable frame rate.** The maintainer's concern was right and remains untested. NDI tolerates
   jitter; SDI does not — a dropped frame on an SDI feed is a visible glitch on a show output.
   `capturePage()` at 25 fps from a `setInterval` (`ndi.js:150`) is not a genlocked source and
   will not hold frame timing.
3. Whether the honest answer is the one already given in the thread: use Kards Online in OBS and
   output SDI from there.

Recommend: post a status update saying the frame pipeline now exists via NDI, that SDI is gated
on NDI shipping and on frame-timing work, and ask whether users need genlocked output or would
accept best-effort. Do not promise a date — the thread already contains one unmet promise from
2021, which is why it has the tone it has.

**Related:** F-011, #41.

---

## Closed issues — recurring themes

The brief asks what the closed issues say about where the architecture is weak. 65 closed issues
cluster very tightly:

### Theme 1 — PNG export / wallpaper (7 issues: #1, #2, #3, #6, #7, #28, #29, #65, #90, #88)

> #1 custom logo missing from PNG · #2 capture doesn't save the file · #3 wallpaper comes out
> square with the card at the top · #6 info circle absent from exported card · #7 text alignment
> differs between card and PNG · #28 export wrong size when not enabled · #29 export transparent
> or black when not enabled · #65 hide clock when generating wallpaper

**Ten issues against one 30-line function** (`Testcard.vue:231-265`) and its `dom-to-image`
dependency. Each was fixed individually; the approach was never changed. #111 is the eleventh,
still open. This is the clearest signal in the whole tracker that **F-009 is a design problem,
not a bug backlog** — and it is why the recommendation is to replace the export path with
`capturePage()` rather than fix #111 in isolation.

### Theme 2 — display/window management (8 issues: #19, #30, #31, #48, #81, #102, #103, #106)

> #19 output doesn't show on the selected screen on a Mac · #30 windowed card grows when moved
> between monitors of different DPI · #31 card flashes between screens if displays change faster
> than the UI · #48 can't close a fullscreen card on a single-screen device with no keyboard ·
> #81 LED card in windowed mode · #102 card appears on primary monitor when first enabled ·
> #103 Kards does not close · #106 rotate card in "not fill output" mode

Plus open #112 and a whole hotfix branch (`hotfix/macclosewindowbug`). `src/main/windows.js` is
534 lines mixing window lifecycle, screen enumeration, DPI-naive geometry, PNG export and
wallpaper setting, driven by `setTimeout(…, 500)` in three places (`windows.js:139,142,145,266`)
and `manageTestCardWindow()`'s five-branch if/else (`:157-186`). **This module is where the bugs
live**, and F-007 is only the currently-visible one.

### Theme 3 — the info circle / long names (4 issues: #13, #14, #17, #39)

> #13 info circle crashes over the name/icon · #14 Alteka pillars overlapped by corner circles at
> some resolutions · #17 long names cause vertical alignment issues · #39 long names linewrap
> awkwardly

Layout is done with hand-tuned percentage breakpoints and step functions
(`Testcard.vue:198-230` — `borderSize` and `circleSize` chosen by a ladder of `if (w < N)`).
Every new resolution or name length is a new opportunity. Open #121 touches the same component.

### Theme 4 — audio / TTS (4 issues: #22, #34, #42, #69)

> #22 computer-name audio needs generating at launch · #34 remove pause in voice audio ·
> #42 free-text TTS output · #69 custom audio file

All resolved by moving more base64 audio into the config object — which is F-018's root cause.

### Theme 5 — the remote APIs (4 issues: #66, #67, #78, #83)

> #66 add OSC API · #67 add REST HTTP API · #78 add Bonjour services for OSC and HTTP ·
> **#83 "REST API doesn't respect sending partial objects"**

#83 is worth singling out: it is the issue that produced `mergeDeep` — the function that is
prototype-pollution vulnerable (F-004). A correct fix to a real usability complaint introduced a
security hole, because there was no schema to merge against. That is the argument for fixing
F-004 with a schema rather than a `__proto__` guard.

### What this tells you

The four hottest areas in six years of bug reports are **export**, **window/display management**,
**info-circle layout** and **config plumbing**. Three of those four are exactly where this
review's High and Critical findings sit. None of them is covered by a test, because there are no
tests (F-022).

That correlation is the strongest single argument in this document for building the pixel harness
*before* touching anything else.
