# 04 — Findings

*Phases 2 (architecture & code quality), 4 (output correctness) and 5 (security & privacy).*

All line references are to `feature/modernise` @ `6842bf1` unless a finding says `master`.
Confidence is one of **Reproduced** (I made it happen on this machine), **Observed** (read
directly out of the code or a tool's output, deterministic), or **Inferred** (reasoned, not
demonstrated — treat as a lead).

## Index

| ID | Severity | Category | Title |
|---|---|---|---|
| [F-001](#f-001) | Critical | Correctness | Colour bars render the inactive channels at 0 instead of black level 16 |
| [F-002](#f-002) | Critical | Correctness | Rendered levels are silently rewritten by the display ICC profile |
| [F-003](#f-003) | Critical | Build/Release | Shipped macOS installers are unsigned and un-notarised; Windows is unsigned by choice |
| [F-004](#f-004) | Critical → **split** | Security | Prototype pollution via `mergeDeep` (**Critical, being fixed**); unauthenticated LAN binding (**risk accepted by maintainers**) |
| [F-005](#f-005) | High | Build/Release | The update notification is best-effort and fails silently in exactly the conditions it is for |
| [F-006](#f-006) | High | Correctness | Config merge on upgrade is shallow — new nested keys are lost for existing users |
| [F-007](#f-007) | High | Correctness | Windowed and LED cards are sized in logical pixels, not device pixels |
| [F-008](#f-008) | High | Correctness | The stepped ramp skips a step: 179 → 230 |
| [F-009](#f-009) | High | Correctness | PNG export goes through `dom-to-image` and does not reproduce the card |
| [F-010](#f-010) | High | Security | The preload's IPC allow-lists are commented out |
| [F-011](#f-011) | High | Build/Release | NDI (`grandiose`) cannot be installed and fails silently |
| [F-012](#f-012) | High | Maintainability | `element-plus` is pinned to a 5-year-old pre-1.0 beta |
| [F-013](#f-013) | High | Correctness | Ramp gradients run 0–255 while every other card runs 16–235 |
| [F-014](#f-014) | Medium | UX | Every numeric REST endpoint returns HTTP 500 |
| [F-015](#f-015) | Medium | UX | OSC is advertised on the LAN but only listens on loopback |
| [F-016](#f-016) | Medium | Correctness | Duplicate OSC handlers; `/showInfo` coerces to String |
| [F-017](#f-017) | Medium | UX | Settings import refuses any file not from the exact same version |
| [F-018](#f-018) | Medium | Performance | Whole config — including multi-MB base64 blobs — is re-broadcast on every keystroke |
| [F-019](#f-019) | Medium | Build/Release | `npm run lint` rewrites build output and a vendored minified file |
| [F-020](#f-020) | Medium | Security | No CSP, no navigation handler, no window-open handler, no permission handler |
| [F-021](#f-021) | Medium | Build/Release | 98 MB asar — every asset shipped twice |
| [F-022](#f-022) | Medium | Maintainability | No tests, no CI, no `.github/` directory at all |
| [F-023](#f-023) | Medium | Security | `nodeIntegration` is driven by an environment variable that no longer exists |
| [F-024](#f-024) | Medium | Security | OSC `/audio/file` reads an arbitrary local file on an unauthenticated UDP packet |
| [F-025](#f-025) | Medium | Maintainability | Three independent Bonjour instances; one is never cleaned up |
| [F-026](#f-026) | Medium | Maintainability | Wallpaper temp files accumulate in userData forever |
| [F-027](#f-027) | Medium | Maintainability | Card rendering is implemented twice — here and in Kards Online |
| [F-028](#f-028) | Medium | Privacy | Rollbar captures uncaught errors with no consent surface or opt-out |
| [F-029](#f-029) | Low | Correctness | `defaultConfig.json` declares `mask.image`; every consumer uses `mask.imageSource` |
| [F-030](#f-030) | Low | Correctness | The HDR card advertises 10-bit code values it cannot produce |
| [F-031](#f-031) | Low | Maintainability | Dead files and dead code |
| [F-032](#f-032) | Low | Maintainability | Four 500+ line files carrying most of the complexity |
| [F-033](#f-033) | Low | UX | DeGhost sweeps saturated hues full-screen with no warning or opt-out |
| [F-034](#f-034) | Low | Build/Release | Five Sass deprecation categories are silenced rather than fixed |
| [F-035](#f-035) | Low | Security | `shell.openExternal` takes an unvalidated string from the renderer |

---

## Critical

### F-001
**Colour bars render the inactive channels at 0 instead of black level 16**

- **Severity:** Critical
- **Confidence:** Observed (deterministic arithmetic in the source; not visually verified against a scope)
- **Category:** Correctness
- **Effort:** S (<0.5d) — the fix is three lines; the verification is the work
- **Evidence:** `src/components/TestCard/Swatch.vue:20-29` and `:32-43`

**Description.** `ireToDecimal()` correctly maps IRE 0–100 onto the studio-range 16–235:

```js
// Swatch.vue:20-29
let r1 = [0, 100]      // ire range
let r2 = [16, 235]     // dec range
let result = ((ire - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0]
```

But the colour is then formed by **multiplying that value by a 0/1 unit vector**:

```js
// Swatch.vue:38-42
let dec = this.ireToDecimal(this.ire)
let r = dec * this.colours[this.colour][0]      // e.g. yellow = [1, 1, 0]
let g = dec * this.colours[this.colour][1]
let b = dec * this.colours[this.colour][2]
bg = 'rgb(' + r + ', ' + g + ', ' + b + ')'
```

Multiplying by zero produces **0**, not the black level of **16**. So at 75% IRE:

| Bar | Rendered | Correct (studio range) |
|---|---|---|
| White | `rgb(180,180,180)` ✓ | 180,180,180 |
| Yellow | `rgb(180,180,`**`0`**`)` ✗ | 180,180,**16** |
| Cyan | `rgb(`**`0`**`,180,180)` ✗ | **16**,180,180 |
| Green | `rgb(`**`0`**`,180,`**`0`**`)` ✗ | **16**,180,**16** |
| Magenta | `rgb(180,`**`0`**`,180)` ✗ | 180,**16**,180 |
| Red | `rgb(180,`**`0`**`,`**`0`**`)` ✗ | 180,**16**,**16** |
| Blue | `rgb(`**`0`**`,`**`0`**`,180)` ✗ | **16**,**16**,180 |

Greyscale bars are unaffected, because `white`, `grey`, `black` and `superblack` are all
`[1,1,1]` (`Swatch.vue:82-85`) and so never multiply by zero. That is why the headline claim in
the README — 100% white is 235,235,235 — holds while every *colour* bar is wrong.

**Impact.** This is the app's core output, and it is wrong on every card that uses `Swatch` with
a saturated colour: Bars/simple, Bars/SMPTE (`SMPTE.vue:5-21`), Bars/HDR (`HDR.vue:4-27`),
Bars/single. A technician using Kards to set up a chain sees each colour bar's inactive channels
sitting 16 code values *below* black. Through a full-range→legal-range conversion those values
clip; on a waveform/vectorscope the bars do not land where a reference generator would put them;
and any measurement taken against this card is off. For an app whose entire value proposition is
"the levels are right", this is the single most serious finding in the review.

**Recommendation.** Change `Swatch.vue:38-42` to interpolate between the black level and the
target level rather than multiplying:

```js
const black = 16
const dec = this.ireToDecimal(this.ire)
const ch = (on) => Math.round(on ? dec : black)
```

Guard the change with a pixel test (see F-022 and `07-plan.md` → Improve): render each bars
variant headlessly, `capturePage()`, and assert the sampled RGB at the centre of each bar.
That test is what makes the rest of the modernisation safe, so build it here first.

**Note on scope.** Decide deliberately whether `black` and `superblack` swatches should also be
re-based — they are correct today (`ire="0"` → 16, and `.superblack` is an explicit
`rgb(0,0,0)` CSS class used for the page background, `Testcard.vue:513`). Only the
multiply-by-zero path is wrong.

**Related.** F-013 (ramp uses a different range again), F-030, F-022.

---

### F-002
**Rendered levels are silently rewritten by the display ICC profile**

- **Severity:** Critical
- **Confidence:** Observed (Electron reports non-sRGB display profiles on this machine; no colour switch is set anywhere). The *magnitude* of the resulting shift is Inferred — it was not measured with a probe.
- **Category:** Correctness
- **Effort:** M (0.5–2d) to pin the behaviour; L to verify it properly
- **Evidence:** `GET /screens` output in `02-build-baseline.md` §3; `grep -rn "appendSwitch\|commandLine\|force-color-profile" src/` returns nothing on either `feature/modernise` or `master`

**Description.** Every card is drawn with CSS colours in the DOM (there is no canvas and no
WebGL anywhere in the card path). Chromium treats untagged CSS colours as sRGB and
**colour-manages them into the display's ICC profile** before they reach the framebuffer.
On this machine Electron reports:

```
display 1: colorSpace {r:[0.6800,0.3200] g:[0.2370,0.7230] b:[0.1400,0.0500] w:[0.3127,0.3290]}
display 2: colorSpace {r:[0.6652,0.3222] g:[0.2878,0.6203] b:[0.1411,0.0552] w:[0.3127,0.3290]}
display 3: identical to display 2
```

sRGB primaries are `r:[0.640,0.330] g:[0.300,0.600] b:[0.150,0.060]`. **None of these three
displays is sRGB.** A `rgb(180,180,0)` yellow authored in sRGB will therefore not leave the GPU
as 180,180,0 on any of them.

Chromium exposes `--force-color-profile=srgb`, which makes it treat the output as sRGB and skip
the conversion. **The app sets no command-line switches at all** — there is no
`app.commandLine.appendSwitch` anywhere in the tree, on either branch.

The README acknowledges the general problem ("display profiles and operating system settings can
override these settings", `README.md:17`) and reasonably argues that any other app is subject to
the same. That is a fair defence for *some* of the pipeline, but not for the part Kards controls:
the conversion Chromium performs on Kards' own output is Kards' to opt out of.

**Impact.** The app's headline claim — that it renders reference levels — is not true end-to-end
on a colour-managed display, and today the app does nothing to make it true. This is also the
change most likely to be *introduced silently by an Electron upgrade*: Chromium's colour
management, HDR handling and compositor paths have all moved between 34 and 43, and nothing in
this repo would detect a shift. That is the specific risk the brief was pointing at, and it is
real.

**Recommendation.**

1. **Establish the baseline before upgrading anything.** Add a headless capture harness (see
   F-022) that renders each card, `capturePage()`s it, and asserts sampled pixel values. Run it
   against Electron 34 *now* to record what today's output actually is.
2. **Decide and document the colour policy.** Options, in order of preference:
   - `app.commandLine.appendSwitch('force-color-profile', 'srgb')` — makes output deterministic
     and matches what a reference generator does. This *will change what current users see* on
     wide-gamut displays, so it needs to be a considered, documented, release-noted change, and
     probably a user-visible toggle with the current behaviour as an option.
   - Leave managed by default, add the switch behind an "Accurate levels" preference.
   - Do nothing and document precisely what the app does and does not guarantee.
3. Gate every subsequent Electron/Chromium bump on the pixel test from (1).

**Related.** F-007 (DPI), F-009 (export path), F-030, F-022.

---

### F-003
**The shipped macOS installers are unsigned and un-notarised; Windows is unsigned by choice**

- **Severity:** Critical
- **Confidence:** **Reproduced** — the released v1.3.1 `.pkg` files were fetched and inspected
- **Category:** Build/Release
- **Effort:** M–L (3–6d) on macOS; S (1–2d) on Windows once a certificate exists
- **Evidence:** xar TOC inspection of all three v1.3.1 mac `.pkg` assets and v1.2.0
  (`02-build-baseline.md` §4a); `package.json:63-87`; `Get-AuthenticodeSignature` →
  `Status: NotSigned`; issues **#110**, **#107**; v1.3.1 release notes

**Description.** The `build` block configures product name, appId, icons, an artifact-name
template and NSIS options — and nothing else. No `mac.hardenedRuntime`, no `mac.entitlements`,
no `afterSign` notarisation hook, no Windows certificate configuration, no `linux` block, and no
CI workflow (there is no `.github/` directory at all).

**The published artefacts confirm what that implies.** Range-fetching the xar header and TOC of
the released packages (method and full transcript in `02-build-baseline.md` §4a):

```
Kards-1.3.1-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-apple-silicon.pkg   <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-intel.pkg           <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.2.0-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
```

A `productsign`-signed package carries `<signature style="RSA">` with a `<KeyInfo>` certificate
chain in its TOC — that is exactly what `pkgutil --check-signature` reads. There is none. The
TOC file list is also free of any stapled notarisation ticket.

**The `.app` inside the payload *is* signed, however.** Extracting the Bom (the payload's path
manifest) shows `Kards.app/Contents/_CodeSignature/CodeResources` present. So the app bundle was
signed; the **installer wrapper never was**, and nothing was notarised or stapled.

> **Resolved: the app was signed with a *development* certificate.** The Bom alone could not say
> *whose* signature it was. A third party settles it. The `autopkg/dataJAR-recipes` AutoPkg
> recipe for Kards (added 2025-02-28) verifies the shipped bundle against this requirement string
> — written by someone who had a real copy of the package and read its actual signature:
>
> ```
> identifier "solutions.alteka.kards" and anchor apple generic
>   and certificate leaf[subject.CN] = "Apple Development: Drew Perry (D4H96T8MEW)"
>   and certificate 1[field.1.2.840.113635.100.6.2.1]
> ```
>
> Two things follow, and both matter:
>
> - **`Apple Development:` is a development certificate, not `Developer ID Application:`.**
>   Development certificates are for the team's own machines and TestFlight. Software signed with
>   one **cannot satisfy Gatekeeper on anybody else's Mac**, by design.
> - **OID `1.2.840.113635.100.6.2.1` is the Apple Worldwide Developer Relations (WWDR)
>   intermediate**, which is the chain used by Development and App Store certificates. A
>   Developer ID chain would carry `1.2.840.113635.100.6.2.6` instead. So the certificate *type*
>   is confirmed twice over, independently of the CN string.
>
> So the v1.3.1 macOS build is signed — with the wrong certificate, for the wrong purpose,
> through the wrong chain — inside an unsigned, un-notarised installer. That is a complete
> explanation of issue #110 with no gaps left.
>
> It also tells us the **Apple Developer Program membership was active at build time** — a
> development certificate cannot be issued without one. The defect was identity selection in the
> build, not an expired account. Whether the membership is *still* active is the only part left
> open (**Q1**).

**Windows has never been signed**, confirmed by the maintainers, on cost grounds — a defensible
call when an OV certificate meant several hundred pounds a year plus a hardware token. See the
recommendation below; that calculation has changed.

**Impact.**

1. **It has already bitten users, repeatedly.** #107 ("Mac OSD detecting your software as
   malware", April 2024) and #110 ("Kards 1.3.1 flagged as potential malware", Oct 2024, 5
   comments, three separate users unable to run the app) are precisely this. The v1.3.1 release
   notes describe an earlier instance "leading to **installs being deleted**." Gatekeeper
   evaluates the *package* for a `.pkg` delivered over the internet — so signing the app inside
   an unsigned, un-notarised wrapper buys nothing at the point where the user is blocked.
2. **It breaks the project's own update strategy.** Update handling is deliberately
   notify-on-launch-then-send-to-the-website (see F-005). That model is sound, but its final step
   is a download the OS refuses to install. The strategy is broken at delivery, not at
   notification.
3. **Windows SmartScreen.** Unsigned NSIS installers accrue no reputation at all, so every
   release is flagged indefinitely rather than temporarily. ~19k Windows downloads on v1.3.1.
4. **Nothing records how any of this was ever done**, so each release re-derives it.

**Recommendation.**

*macOS (the priority — the platform users are actively blocked on):*

- Confirm the Apple Developer Program membership is **still** active (**Q1**). It was active when
  v1.3.1 was built. Renewal is ~$99/yr and can take days if re-verification is needed — pure lead
  time, so start it first.
- You need **two certificates, and neither is the one that was used**:
  *Developer ID **Application*** (signs the `.app` — v1.3.1 used an *Apple Development*
  certificate instead, which is the root cause) and *Developer ID **Installer*** (signs the
  `.pkg` — never used at all).
- In `electron-builder`, set `mac.identity` explicitly to the Developer ID Application identity
  rather than letting it auto-select. Auto-selection picking a development certificate off the
  build machine's keychain is exactly how this happens, and it happens silently.
- Add `mac.hardenedRuntime: true` and an entitlements plist, then `@electron/notarize` via
  `afterSign` using **`notarytool`** (Apple retired `altool` in November 2023), and
  `xcrun stapler staple` the resulting `.pkg` so it validates offline — which matters a great
  deal at a venue.

*Windows:*

- **Re-price this.** Azure Trusted Signing is roughly **$10/month** for small organisations:
  Microsoft-operated, no hardware token, works unattended in CI, and builds SmartScreen
  reputation. That is about a tenth of the old OV-cert-plus-HSM cost that made this not worth
  doing, and it removes the constraint that signing cannot run on a stock runner. Eligibility
  requires an organisation with 3+ years of verifiable history — worth checking before planning
  around it. DigiCert KeyLocker is the fallback.
- At ~$120/yr against ~19k Windows downloads, the cost argument that justified skipping this no
  longer holds.

*Both:*

- Commit a GitHub Actions release workflow (macOS runner for mac targets, Windows runner for win)
  and a `docs/RELEASING.md`, so the next gap does not lose the knowledge again.

**Related.** F-005, F-021, issues #110, #107, #104.

---

### F-004
**Unauthenticated LAN HTTP API grants full control and is prototype-pollution vulnerable**

- **Severity:** Critical
- **Confidence:** Reproduced
- **Category:** Security
- **Effort:** M (0.5–2d)
- **Evidence:** `src/main/rest.js:29` (bind), `:71` (PUT route), `:108-121` (handler),
  `:142-157` (`mergeDeep`); `netstat` and `curl` transcripts in `02-build-baseline.md` §3

**Description.** Three issues compound.

1. **The server binds every interface with no authentication.** `this._app.listen(this.port)`
   (`rest.js:29`) with no host argument binds `0.0.0.0`. Observed:
   ```
   TCP    0.0.0.0:8321    0.0.0.0:0    LISTENING
   TCP    [::]:8321       [::]:0       LISTENING
   ```
   It is then **actively advertised** to the LAN over mDNS as both `._alteka_http._tcp` and
   `._http._tcp` (`rest.js:34-54`), with the version, description and website in the TXT record.
   Anyone on the same network can enumerate it and drive it.

2. **`PUT /` accepts arbitrary config.** `_handlePut` (`rest.js:108`) deep-merges the request
   body straight into the live config and emits `updateConfig`, which the main process pushes to
   the control window and thence back through the normal config path. No auth, no origin check,
   no schema. An unauthenticated attacker on the LAN can put a full-screen card on any display,
   change what it says, set the machine's wallpaper, or turn the audio test tone on.

3. **`mergeDeep` is prototype-pollution vulnerable (CWE-1321).**
   ```js
   // rest.js:145-153
   for (const key in source) {
     if (this.isObject(source[key])) {
       if (!target[key]) Object.assign(target, { [key]: {} })
       this.mergeDeep(target[key], source[key])
     } else {
       Object.assign(target, { [key]: source[key] })
     }
   }
   ```
   `JSON.parse('{"__proto__":{…}}')` creates an *own, enumerable* `__proto__` property, so
   `for…in` visits it; `target['__proto__']` resolves to `Object.prototype`, which is truthy, so
   the recursion assigns onto `Object.prototype`. Extracted verbatim and run
   (`…/scratchpad/pp-test.js`):
   ```
   before: ({}).polluted = undefined
   after : ({}).polluted = "yes"
   RESULT: POLLUTED — Object.prototype was modified
   ```
   And the live endpoint accepts the request:
   ```
   $ curl -X PUT -H 'Content-Type: application/json' \
       -d '{"__proto__":{"pollutedByReview":"yes"}}' http://127.0.0.1:8321/
   [HTTP 200]
   ```

**Impact.** In an AV context the machines running Kards sit on show networks alongside kit
belonging to other vendors and, at some venues, guest Wi-Fi. Unauthenticated remote control of
what appears full-screen on a show display is bad on its own. Prototype pollution in the
Electron **main** process is worse: it corrupts every object in a Node process that has `fs`,
`shell.openExternal`, `dialog` and `child_process` in scope. Turning that into code execution
requires a gadget, which is why this is rated Critical-with-caveat rather than
"remote code execution" — but `mergeDeep` is called on attacker-controlled input in the most
privileged process in the app, and that is not a position to be in.

Note that the remote-control API is a **deliberate, valued feature** (issues #66, #67, both
closed as implemented) and several users will be driving Kards from show-control systems. The
fix must not simply delete it.

> ### Maintainer decision, 2026-08-08 (Q3)
>
> *"This isn't show-critical software, the remote control being un-authed isn't necessarily the
> issue you think it is. More a nice-to-have."*
>
> **Accepted, and the point is fair.** Kards is a diagnostic tool, not something a show output
> depends on; the worst outcome of an unauthenticated `PUT` is that somebody on your LAN changes
> what your test card says. Rating it as a Critical security issue over-weighted the network
> exposure relative to what the API can actually do — it mutates config and nothing else. It
> cannot write to arbitrary paths, and the one arbitrary-file-read path (F-024) is on **OSC**,
> which binds loopback only.
>
> **This finding therefore splits:**
>
> - **The prototype pollution stays Critical and is still being fixed** (recommendation 1 below,
>   plan item S7). That was never the same question: it is a one-line guard against corrupting
>   `Object.prototype` in a Node process holding `fs`, `shell` and `dialog`, and the maintainers
>   agreed it ships regardless.
> - **The unauthenticated binding is accepted risk.** Recommendations 3 and 4 below are
>   **not being actioned**. Recorded here so the decision is visible and re-checkable rather than
>   silently dropped.
>
> **Two consequences worth carrying forward.** First, F-015 (OSC advertised on the LAN but bound
> to loopback) is now purely a *functionality* bug — and fixing it would expose F-024 to the
> network, so **F-024 must be fixed first regardless**. Second, if remote control is a
> nice-to-have rather than load-bearing, that is also an argument for not spending the 5–8 days
> that recommendations 3–4 would have cost. F6 shrinks accordingly.

**Recommendation.**

1. Fix `mergeDeep` immediately and unconditionally — reject `__proto__`, `constructor` and
   `prototype` keys, or replace the whole function with a schema-driven setter that only writes
   known config paths. This is a one-line guard and a strictly-better whole-function rewrite;
   there is no reason to defer it.
2. Add a config schema and validate `PUT` bodies against it. This also fixes F-014 and F-016 and
   is the same schema the config-migration work in F-006 needs — do it once.
3. Make the bind address a user setting, defaulting to **loopback**, with an explicit
   "Allow network control" toggle that surfaces the security trade-off. This is the behaviour
   change most likely to annoy existing users, so it needs release notes and probably a
   one-time prompt on upgrade — see **Q3** in `questions.md`.
4. When network control is enabled, require a shared token (header or query param) generated on
   first run and shown in the UI next to the toggle.

**Related.** F-010, F-014, F-016, F-024, closed issues #66, #67, #83.

---

## High

### F-005
**The update notification is best-effort and fails silently in exactly the conditions it is for**

- **Severity:** High *(downgraded from Critical — see the note below)*
- **Confidence:** Observed
- **Category:** Build/Release
- **Evidence:** `src/main/updateChecker.js` (whole file)
- **Effort:** S (~1d)

> **Note on the original framing.** This finding first argued for adopting `electron-updater`.
> The maintainers pushed back, and they are right: Kards is event software, and an updater that
> decides to download 112 MB and ask for a restart while an engineer is patching a show is
> actively harmful. **Notify-on-launch is the correct model for this product**, and the
> recommendation below no longer proposes changing it. What remains is that the notification
> itself is unreliable — which undermines the chosen model rather than arguing against it.
> Severity drops Critical → High accordingly.

**Description.** `updateChecker.js` does exactly one thing, once, ten seconds after launch:

```js
setTimeout(function () {
  axios.get('https://api.github.com/repos/alteka/kards/releases/latest')
    .then(…)   // if newer: dialog → shell.openExternal('https://alteka.solutions/kards')
    .catch(function (error) { log.error(error) })
}, 10000)
```

Three failure modes, all observed in the code:

- **One attempt, ever, at T+10s.** An AV laptop is very often not on a usable network ten seconds
  after launch — it is being plugged into house Ethernet, waiting on DHCP, or joining venue
  Wi-Fi. When that check fails there is no retry, no re-check when the network comes up, and no
  further notification for the entire session. The single most common real-world condition for
  this software is the one condition in which the check is guaranteed to miss.
- **Failures are silent.** `.catch(log.error)` writes to a log file behind More → Logs. The user
  has no way to know a check was ever attempted, let alone that it failed.
- **Unauthenticated GitHub API**, rate-limited to 60 requests/hour/IP. Several Kards machines
  behind one venue's NAT — routine on a large show — get HTTP 403, which takes the same silent
  path. So does any corporate proxy that blocks `api.github.com`.

**Impact.** The delivery model is deliberate and sound, but the mechanism implementing it misses
precisely the users it is aimed at. Combined with F-003, the practical result today is that the
only reliable route from a bug fix to a user is that they happen to visit the website, happen to
notice a new version, and then get past an OS malware warning.

**What already works, and is worth knowing.** Windows has a second channel that partly covers
this: **`AltekaSolutions.Kards` is published in the WinGet community repository** (confirmed:
`winget search Kards` → version `1.3.1`). WinGet users get `winget upgrade`, and WinGet validates
the download against a SHA-256 in its manifest, so it is not wholly dependent on code signing.
It needs a manifest PR per release. There is no macOS equivalent — which is the wrong way round
given macOS is 81% of downloads.

**Recommendation.** Keep the notify-on-launch model. Make it actually fire:

1. **Retry with backoff** rather than one shot — e.g. 10 s, 60 s, 5 min, then hourly, capped.
2. **Re-check when the network appears.** Listen for `powerMonitor` resume and use
   `net.isOnline()`/`online` events so the check runs once the venue network is up, which is when
   the user is actually able to act on it.
3. **Surface failure** somewhere visible — a quiet indicator in the More menu ("last checked:
   never / 3 days ago") is enough, and costs nothing when things are working.
4. **Add a manual "Check for updates" item** to the menu. For event software this is arguably the
   most important entry point: the engineer checks when *they* choose to, typically the day
   before a show.
5. Consider sending a `User-Agent` and, if rate limiting proves to be a real problem, checking a
   small static JSON file on `alteka.solutions` instead of the GitHub API — no rate limit, and it
   lets you decouple "latest version" from "latest GitHub tag".
6. **Add a Homebrew cask** for macOS. It fits the same philosophy exactly — user-initiated,
   nothing interrupts a show — and gives the majority platform the `brew upgrade` equivalent of
   what WinGet already gives Windows. Low effort, and it is the cheapest thing available that
   improves reach on the platform that needs it most.
7. Keep the WinGet manifest current as part of the release checklist (`docs/RELEASING.md`).

**What still gates everything: F-003.** None of the above matters if the installer the user
downloads is refused by the OS. Signing is the fix that makes this delivery model work.

**Related.** F-003 (blocks the last step), F-021 (112 MB download over venue Wi-Fi).

---

### F-006
**Config merge on upgrade is shallow — new nested keys are lost for existing users**

- **Severity:** High
- **Confidence:** Observed, with a workaround already in the tree that confirms it
- **Category:** Correctness / Compatibility
- **Effort:** M (0.5–2d)
- **Evidence:** `src/main/config.js:28-36`; the hand-patch at `src/views/Control.vue:262`;
  `src/components/TestCard/Single.vue:6`

**Description.**

```js
// config.js:28-36
_config = {
  ...getDefaultConfig(),
  ...store.get('KardsConfig', getDefaultConfig())
}
```

This is a **one-level** spread. Any nested object present in both the defaults and the saved
config is taken wholesale from the saved config, so sub-keys added in a later version never
appear for a user who has ever run an earlier version. A brand-new install is fine; an upgrade
is not.

The team already knows: `Control.vue:262` carries a manual patch for exactly one instance of it —

```js
window.ipcRenderer.receive('config', function (val) {
  if (val && !val.clock) val.clock = { bg: '#000000', fg: '#00ff00', gradient: false }
```

— which handles the *top-level* `clock` key added on this branch, in the renderer, for one key,
in one of the two windows that receive config. It does not help the nested cases, and it does
not help the main process, OSC, REST or the Touch Bar, all of which read the same object.

**Impact.** Every nested key added since a user's first install is silently absent. Two concrete
consequences already in the tree:

- `bars.color` (`defaultConfig.json:41`) is consumed unguarded by
  `Single.vue:6` — `:colour="config.bars.color.toLowerCase()"`. A user whose saved `bars` object
  predates `color` gets `TypeError: Cannot read properties of undefined` when they select the
  single-bar card, and — because there is no error boundary and no error handling in the
  renderer at all — a blank card. This is the mechanism by which "it works on my machine" and
  "it's broken for a long-time user" both hold.
- `clock.*` on the test card side has no equivalent patch, only the control side.

Every card component takes `config: Object` with **no default and no validator** (55
`vue/require-default-prop` warnings, `02-build-baseline.md` §5) and dereferences deep paths
directly, so there is nothing between a missing key and a broken card.

**Recommendation.**

1. Replace the spread with a recursive defaults merge, and add a `configVersion` integer to
   `defaultConfig.json` with an explicit, tested migration function per version step. Store the
   version alongside the config in `electron-store`.
2. Remove the `Control.vue:262` patch once the merge is correct — leaving both is how you get
   two sources of truth.
3. Give every card component a `default: () => ({})` on its `config` prop and use optional
   chaining on nested reads, so a missing key degrades rather than blanks the card.
4. Write the migration test against a corpus of real saved configs. If any exist from v1.0–v1.3,
   collect them now; if not, synthesise them from the `defaultConfig.json` at each release tag —
   `git show v1.2.0:src/defaultConfig.json` etc. This is cheap and it is the highest-value test
   in the project for a 100k-install base.

**Related.** F-017 (import has the same version-brittleness), F-022.

---

### F-007
**Windowed and LED cards are sized in logical pixels, not device pixels**

- **Severity:** High
- **Confidence:** Observed (Electron API semantics + code); the visible symptom is Reported by users
- **Category:** Correctness
- **Effort:** M (0.5–2d)
- **Evidence:** `src/main/ipc.js:45`, `src/main/windows.js:192-245`, `src/views/Testcard.vue:191-192`;
  issues **#112**, **#111**, **#30**

**Description.** Electron's `setContentSize()`, `BrowserWindow` bounds and
`screen.getAllDisplays()[].bounds` are all in **device-independent pixels**. So are
`visualViewport.width/height` in the renderer. On any display with a scale factor other than 1 —
125% is the Windows default on most modern laptops, and this machine reports
`scaleFactor: 1.25` on one of three displays — a card the user asks for as 1920 × 1080 is created
as a 1920 × 1080 **DIP** window, which is 2400 × 1350 device pixels, with the content scaled up
by the compositor.

Two distinct consequences:

1. **Pixel-exact cards are not pixel-exact.** The LED card is sized by panel count
   (`Control.vue:350-356`, `config.window.width = led.width * led.columns`) precisely so an LED
   tech can map one card pixel to one LED pixel. Under display scaling, that mapping is broken by
   resampling. The same applies to the Grid card's 1px lines and the SDI pathological card's
   fine detail.
2. **The reported resolution is wrong.** `Testcard.vue:191-192` uses `visualViewport` for
   `info.cardSize`, so the info circle displays the DIP size and not the real output resolution —
   which is precisely issue **#111** ("Incorrect output resolution").

Issue **#112** ("Under windows, when using Display Scaling (i.e. DPI of 125%) the cards are
generated at lower resolution", 3 comments) and closed issue **#30** ("Windows: Windowed card
grows when moved between monitors of different DPI scaling factors") are the same root cause.

**Impact.** For LED wall and projector alignment work — a primary use case — the card is not
doing the one thing it is there to do. And the number shown on screen tells the technician it is.

**Recommendation.**

- Divide requested pixel sizes by `screen.getDisplayMatching(bounds).scaleFactor` when creating
  and resizing the test card window, so a request for N device pixels produces N device pixels.
- Alternatively/additionally set `webContents.setZoomFactor(1 / scaleFactor)` on the test card
  window so CSS pixels map 1:1 to device pixels. This is the more robust option for the *content*
  and should be evaluated first — but note it interacts with F-002 and must be covered by the
  same pixel test.
- Report `window.devicePixelRatio * visualViewport.width` (or better, ask the main process for
  the real bounds) in `info.cardSize`.
- Handle `display-metrics-changed` for the scale-factor case, not just the geometry case
  (`windows.js:144-146` already listens; it just doesn't act on scale).

**Related.** F-002, issues #112, #111, #30.

---

### F-008
**The stepped ramp skips a step: 179 → 230**

- **Severity:** High
- **Confidence:** Observed
- **Category:** Correctness
- **Effort:** S (<0.5d)
- **Evidence:** `src/components/TestCard/Ramp.vue:51`, and the same string repeated at `:63`, `:72`, `:99`, `:108`

**Description.** The 10-band stepped greyscale is authored as an explicit list of hard stops:

```
0, 26, 51, 77, 102, 128, 153, 179, 230, 255
```

The differences are `26, 25, 26, 25, 26, 25, 26,` **`51`**, `25`. Every band steps by ~25.5
except the ninth, which jumps by 51. The intended value is almost certainly **204** — an even
`i × 255 / 10` division gives `0, 26, 51, 77, 102, 128, 153, 179, 204, 230, 255`, i.e. the
author dropped one value while writing out eleven boundaries for ten bands.

**Impact.** The stepped ramp exists so a technician can look for banding, crushed blacks, clipped
whites and gamma errors at even intervals. One band is double-width and one greyscale level is
missing entirely, so a display that misbehaves between 204 and 230 will not be caught, and a
display that looks correct on this card is not proven correct. The error is subtle enough to
survive six years unnoticed, which is exactly what makes it worth fixing carefully — some users
will have learned the card's appearance.

The same string is duplicated verbatim five times (`Ramp.vue:51,63,72,99,108`), so the fix must
touch all five, which is itself an argument for generating the stops.

**Recommendation.** Generate the stops from a single function rather than hand-writing them, and
then decide the range question in F-013 at the same time — there is no point fixing the missing
step in the 0–255 series if the series should be 16–235. Cover with the pixel test from F-022.

**Related.** F-013, F-001.

---

### F-009
**PNG export goes through `dom-to-image` and does not reproduce the card**

- **Severity:** High
- **Confidence:** Observed (mechanism + unmaintained dependency); the specific visual differences are Inferred and not screenshot-compared
- **Category:** Correctness
- **Effort:** M (0.5–2d)
- **Evidence:** `src/views/Testcard.vue:70`, `:231-265`; `dom-to-image@2.6.0` published
  **2017-10-04** (npm registry); closed issues **#1**, **#6**, **#7**, **#3**, **#29**

**Description.** "Export PNG" and "Set as wallpaper" both route through `dom-to-image`
(`Testcard.vue:249`), which serialises the DOM into an SVG `<foreignObject>`, loads that into an
`<img>`, draws it to a `<canvas>` and calls `toDataURL()`. This is a fundamentally lossy path:

- **`mix-blend-mode` is not reproduced.** The overlay mask uses `mix-blend-mode: darken`
  (`Testcard.vue:396`). SVG `foreignObject` rasterisation does not honour it, so an exported card
  with a mask applied will not match the screen.
- **Fonts must be inlined by the library** or fall back. The app loads two custom fonts
  (`Sansation`, `DejaVuLGCSansMono`) plus the whole FontAwesome set. Closed issue **#7** —
  "Text alignment is different between generated card and saved PNG" — is this, and it was closed
  without the underlying path changing.
- **Canvas rasterisation re-encodes colour.** `toDataURL('image/png')` produces an untagged
  8-bit sRGB PNG from a canvas whose backing store Chromium may have created in the display's
  colour space. This is F-002 again, on a second path, with a second chance to shift values.
- **The library has not been released since October 2017** — nine years, no maintenance, and it
  predates every relevant Chromium change.

The history of closed issues around this path is long and repetitive: #1 (custom logo missing
from PNG), #6 (info circle absent from exported card), #7 (text alignment differs), #3 (wallpaper
comes out square with the card at the top), #29 (export when card not enabled is transparent /
black), #2 (capture doesn't save the file), #28 (wrong size when not enabled). That is seven
issues against one 30-line function, which is the signature of a wrong approach rather than a
series of bugs.

There is also a live correctness wrinkle in the export function itself
(`Testcard.vue:231-265`): it mutates `config.animated` and `config.showClock` to false, exports,
then restores them — but the restore happens inside the promise, so an export that throws before
`.then`/`.catch` leaves the card with animation and clock permanently off until the next config
push.

**Impact.** The exported PNG is the artefact people put into show documentation, send to a
projectionist, or set as a venue's standing wallpaper. If it does not match the card, the card's
correctness guarantees don't survive export.

**Recommendation.** Replace `dom-to-image` entirely with `webContents.capturePage()` in the main
process — the app already does exactly this for NDI (`ndi.js:121-141`), including for a hidden
window, so the code exists and is proven. `capturePage` captures what the compositor actually
produced, which makes the export path agree with the screen path by construction and eliminates
the blend-mode, font and canvas-colour problems in one move. The existing `headlessExportMode`
plumbing (`windows.js:403-435`) already creates the hidden window it needs.

**Related.** F-002, F-011 (NDI proves the capture path), closed issues #1, #2, #3, #6, #7, #28, #29.

---

### F-010
**The preload's IPC allow-lists are commented out**

- **Severity:** High
- **Confidence:** Observed
- **Category:** Security
- **Effort:** S (<0.5d)
- **Evidence:** `src/preload.js:7-23`

**Description.**

```js
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) => {
    // whitelist channels
    // let validChannels = ['controlResize', 'getConfig', 'showMode', …]
    // if (validChannels.includes(channel)) {
    ipcRenderer.send(channel, data)
    // }
  },
  receive: (channel, func) => { … same pattern … },
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
})
```

The allow-lists were written and then commented out. Any renderer code — including anything
injected into it — can `send`, subscribe to, or `invoke` **any** IPC channel, including
`selectImage`, `saveAsPNG`, `setAsWallpaper`, `openUrl`, `importSettings` and `openLogs`. The
`invoke` path never had a list at all.

To be fair about the actual exposure: `contextIsolation` *is* on for both windows, the renderer
loads only local content, and I found no reachable path for injecting script into the renderer
(config strings reach the DOM through Vue text interpolation, which escapes; the one raw-ish
binding is `<img :src>` on user-selected data URIs). So this is a **defence-in-depth failure, not
a live exploit** — which is why it is High rather than Critical.

But it is the layer that is supposed to contain the *next* mistake, and there are already two
inputs (LAN REST, LAN-discoverable OSC) that write into the object the renderer renders.

**Recommendation.** Uncomment and complete the lists. Better: replace the generic
`send/receive/invoke` bridge with a typed API surface — `window.kards.setConfig(c)`,
`window.kards.onConfig(cb)`, `window.kards.exportCard()` — so the channel names are not part of
the renderer's vocabulary at all. That is a mechanical refactor across ~40 call sites and it
makes the IPC surface reviewable, which it currently is not.

Also set `sandbox: true` explicitly on both windows (it is the Electron ≥20 default, but the
`nodeIntegration` line in F-023 shows the defaults are not being relied on deliberately).

**Related.** F-004, F-020, F-023, F-035.

---

### F-011
**NDI (`grandiose`) cannot be installed and fails silently**

- **Severity:** High
- **Confidence:** Reproduced
- **Category:** Build/Release
- **Effort:** L (2–5d) — the decision is harder than the work
- **Evidence:** `package.json:45-47`; `package-lock.json` `node_modules/grandiose`;
  `scripts/patch-grandiose.js`; `src/main/ndi-worker.js:13-17`; install transcripts in
  `02-build-baseline.md` §2

**Description.** Three compounding causes, all reproduced:

1. The **lockfile pins the SSH transport** —
   `git+ssh://git@github.com/rse/grandiose.git#cf09bb84…` — so any machine or CI runner without a
   GitHub SSH key cannot fetch it, even though `package.json` declares the HTTPS-friendly
   `rse/grandiose#cf09bb84`.
2. **npm ≥ 12 refuses git dependencies by default** (`allow-git = none`):
   ```
   npm error code EALLOWGIT
   npm error Fetching packages of type "git" have been disabled
   ```
3. It is a **native addon requiring the NDI SDK on the build machine**, pinned to a commit on a
   personal fork last published as `0.0.4`, whose `binding.gyp` this repo then hand-edits inside
   `node_modules` at postinstall (`scripts/patch-grandiose.js`) to add a macOS arm64 branch —
   pointing arm64 at the `mac-x64` dylib path.

On this machine the result is that `node_modules/grandiose` simply does not exist after
`npm ci`, and `patch-grandiose.js` prints `binding.gyp not found, skipping` and exits 0. Nothing
fails. The app builds, ships, and reports NDI as available via `getNdiStatus`
(`ipc.js:140-145` returns `{available: false}` only when `state.ndi` is absent, which it isn't —
`ndi.js:228-238` hardcodes `available: true`). The worker then can't `require('grandiose')` and
posts a single `ndi-error` message that goes to the log file.

**Impact.** NDI output is the headline feature this branch adds, and the longest-standing open
request in the tracker (**issue #41**, open since 2021-01-08, 9 comments). As things stand it
will ship dead for anyone who builds it the way this machine builds it, and the user-visible
signal is nothing at all. It also makes the whole branch un-buildable-as-intended on a clean CI
runner, which blocks F-003's release automation.

**Recommendation.** Decide the NDI question explicitly rather than letting it ride (**Q4** in
`questions.md`):

- **Preferred:** vendor a maintained, registry-published NDI binding, or publish your own
  prebuilt fork of grandiose to npm (or a private registry) with prebuilt binaries per platform
  via `prebuild-install`. This removes the git dep, the SSH transport, the node-gyp requirement
  and the `binding.gyp` patch in one move.
- **Interim, cheap:** at minimum, change the lockfile to the HTTPS transport and make
  `getStatus()` report `available: false` when the worker reports it cannot load grandiose, so
  the UI tells the truth. Surface it in the NDI drawer.
- **Alternative:** ship NDI as an optional download rather than a bundled dependency.
- **Also acceptable:** cut NDI from the next release and ship it separately once it can be built
  reproducibly — better than shipping a feature that silently does nothing.

Note the licensing angle too: NDI's SDK has its own redistribution terms, which need checking
against GPL-3.0-only before shipping `libndi` inside a signed bundle.

**Related.** F-003, issue #41, `03-dependency-audit.md`.

---

### F-012
**`element-plus` is pinned to a 5-year-old pre-1.0 beta**

- **Severity:** High
- **Confidence:** Observed
- **Category:** Maintainability / blocker to modernisation
- **Effort:** L (2–5d)
- **Evidence:** `package.json:31` — `"element-plus": "1.0.2-beta.71"`, published
  **2021-08-18**. Current stable is **2.14.4**; 2.0.0 shipped 2022-02-07.

**Description.** The entire control UI is built on `element-plus` (`el-form`, `el-tabs`,
`el-row/col`, `el-switch`, `el-input-number`, `el-radio-group`, `el-dropdown`, `el-dialog`,
`el-drawer`, `el-color-picker`, `el-alert`, `el-message`), pinned to an **exact beta version**
that predates the library's 1.0, let alone its 2.x stable line. It is five years old and
receives no fixes of any kind.

Downstream effects visible in the tree:

- `vite.config.mjs:16-22` silences **five** Sass deprecation categories to keep it compiling.
  Those deprecations are element-plus's stylesheets, and they will eventually become errors.
- `Control.vue:378-380` and `:398-507` carry ~130 lines of `!important`-adjacent CSS overriding
  element-plus internals to implement dark mode, because this version has no theming support for
  it. Every one of those selectors is a private class name that 2.x has moved.
- `@element-plus/icons@0.0.11` is pulled in transitively and npm deprecates it in favour of
  `@element-plus/icons-vue`.
- Icon usage is the old string form (`icon="el-icon-document-copy"`, `ControlShare.vue:19`),
  removed in 2.x.

**Impact.** This is the **largest single blocker to modernisation**, larger than the Electron
bump. Vue 3.5 works with it today, but the pin means no security fixes, no Vue-compatibility
fixes, and an upgrade path (1.0-beta → 2.14) that is a breaking rewrite of every control
component plus the whole dark-mode stylesheet. It also feeds directly into the migrate-vs-rebuild
analysis in `07-plan.md` §8a: a large fraction of the "incremental migration" cost is this one
dependency, and a rebuild would not carry it forward.

**Recommendation.** Cost the element-plus 1.0-beta → 2.x migration explicitly and early — it is
the item most likely to turn "incremental migration" into "rewrite by accident". Two viable
shapes:

- Migrate to element-plus 2.x, accepting a rewrite of the dark-mode CSS against 2.x's CSS custom
  properties (which is the *right* mechanism and much smaller than the current override pile).
- Or drop the component library. The control window is ~15 form controls; the dependency is
  buying tabs, a colour picker, a number input and a dialog. Hand-rolling those against native
  elements removes 380 kB of CSS, the Sass deprecations and the theming fight permanently.

Do **not** attempt this at the same time as the Electron or Vite bumps — see the sequencing in
`07-plan.md`.

**Related.** F-034, `03-dependency-audit.md`, `07-plan.md` §8a.

---

### F-013
**Ramp gradients run 0–255 while every other card runs 16–235**

- **Severity:** High
- **Confidence:** Observed
- **Category:** Correctness
- **Effort:** M (0.5–2d) — small change, but it needs a deliberate decision
- **Evidence:** `src/components/TestCard/Ramp.vue:51,53,63,66,72,75,99,102,108,111` vs
  `src/components/TestCard/Swatch.vue:20-29` and `src/views/Testcard.vue:510-527`

**Description.** The app has two incompatible level conventions and uses both on the same card.

- `Swatch.vue` maps IRE 0–100 to **16–235** (studio range), and the CSS classes agree:
  `.white` = 235, `.white75` = 180, `.black` = 16.
- Every ramp gradient runs **0 to 255** — `'rgb(0,0,0) 0%, rgb(255,255,255) 100%'`
  (`Ramp.vue:53`), and the stepped variant likewise starts at 0 and ends at 255.

They collide directly: when `config.ramp.stepped` is on, the ramp draws a 0→255 gradient and then
overlays `<swatch>` labels whose own backgrounds are computed on the **16–235** scale
(`Ramp.vue:6,12` — `colour="white" :ire="step"` for steps `-7.5 … 109`). The label swatch and the
gradient band behind it are different greys.

**Impact.** A ramp is used to judge gamma, banding and black/white clipping. If it runs full-range
while the rest of the app runs studio-range, the user is measuring two different things depending
on which card they select, and neither the UI nor the docs say so. The stepped-ramp overlay makes
the discrepancy visible on a single screen, which suggests it has simply never been noticed.

Note the ramp's step list does include `-7.5` and `109` (`Ramp.vue:31`), i.e. deliberate
sub-black and super-white points — so the *intent* is clearly a studio-range card with legal
overshoot markers, which makes the 0–255 gradient look like an oversight rather than a decision.

**Recommendation.** Pick one convention, apply it everywhere, and document it in the app (the
Help link at `menu.js:492` already points at `alteka.solutions/kards/help`). The evidence points
to studio range 16–235 as the intended convention. If both are genuinely wanted, make it an
explicit user choice — a "Full range / Legal range" switch would be a genuinely useful feature for
AV work, and would turn this defect into a selling point. Either way, fix F-008 in the same
change and cover both with the pixel test.

**Related.** F-001, F-008, F-030.

---

## Medium

### F-014
**Every numeric REST endpoint returns HTTP 500**

- **Severity:** Medium · **Confidence:** Reproduced · **Category:** UX · **Effort:** S
- **Evidence:** `src/main/rest.js:92-102`; transcript in `02-build-baseline.md` §3

`_handleGet` passes the raw config value to `res.send()`. Express interprets a bare number as a
status code, so any endpoint whose value is numeric throws:

```
$ curl http://127.0.0.1:8321/name          → "MJJ Pro Art"          [200] ✓
$ curl http://127.0.0.1:8321/window/width  → Internal Server Error  [500] ✗
$ curl http://127.0.0.1:8321/grid/size     →                        [500] ✗
```

Affected: `/screen`, `/window/{width,height}`, `/grid/size`,
`/led/{width,height,rows,columns}`, `/notFilledCard/{width,height,top,left,rotate}`,
`/deghost/{density,speed}`, `/audioSync/rate`. That is most of the numeric surface of a
remote-control API. Also: unknown paths return the string `"Endpoint does not exist"` with
**HTTP 200** (`rest.js:94,101`), so a client cannot distinguish success from failure.

**Recommendation.** Return `res.json(value)` throughout, and use real status codes (404 for
unknown paths, 400 for a malformed body). Fold into the schema work in F-004.

---

### F-015
**OSC is advertised on the LAN but only listens on loopback**

- **Severity:** Medium · **Confidence:** Reproduced · **Category:** UX · **Effort:** S
- **Evidence:** `src/main/osc.js:29-41`, `:490-499`; `netstat` in `02-build-baseline.md` §3

```
UDP    127.0.0.1:25518    *:*
```

`osc-js`'s `DatagramPlugin` is configured with `open: { port, exclusive: false }` and **no
`host`**, so it defaults to `localhost` and binds loopback only. Meanwhile `osc.js:490-499`
publishes `Kards-<hostname>._alteka_osc._tcp` on port 25518 to the whole LAN via Bonjour.

So OSC control is *discoverable* from a show-control system and then silently unreachable —
whereas the REST API on the same machine is reachable by anyone (F-004). The two network APIs have
exactly opposite, and both wrong, bind behaviour.

Replies are also sent to `send: { port: 25519 }` with no host, i.e. back to localhost, so even a
local OSC client on a different port cannot see replies.

**Recommendation.** Fix alongside F-004: one "network control" setting governing both servers,
defaulting to loopback, with matching Bonjour advertisement (don't advertise what isn't bound) and
replies addressed to the sender's address rather than a fixed port on localhost.

---

### F-016
**Duplicate OSC handlers; `/showInfo` coerces to String**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Correctness · **Effort:** S
- **Evidence:** `src/main/osc.js:83-89` and `:107-113`; `:214-220` and `:221-227`

`/showInfo` is registered twice. The first casts to `Boolean`, the second to **`String`**:

```js
this._server.on('/showInfo', (message) => { this.config.showInfo = Boolean(message.args[0]) … })  // :85
this._server.on('/showInfo', (message) => { this.config.showInfo = String(message.args[0])  … })  // :109
```

Both fire. The second wins the final assignment, so `/showInfo 0` sets `showInfo` to the string
`"0"` — which is truthy — and the info circle stays on. `/placeholder/icon` is likewise registered
twice (identically, so harmless but confusing).

Two further robustness problems in the same file:

- `this.config` is initialised to `{}` (`osc.js:12`) and only replaced when the first `'config'`
  IPC message arrives. Any OSC packet touching a nested path (`/window/width` →
  `this.config.window.width`) before that throws `TypeError`, which lands in the
  `process.on('uncaughtException')` handler at `background.js:60-65` — which in production only
  logs. So an early OSC packet is silently dropped.
- The whole file is ~460 lines of copy-pasted per-key handlers, which is how both duplicates got
  in. There is no `/clock/*`, no `/mask/*` and no `/bars/color` endpoint, so the OSC surface has
  already drifted behind the config schema.

**Recommendation.** Generate the OSC handlers from the same config schema that F-004 and F-006
need, rather than maintaining 460 lines by hand. That removes the duplicates, the drift and the
initialisation race together.

---

### F-017
**Settings import refuses any file not from the exact same version**

- **Severity:** Medium · **Confidence:** Observed · **Category:** UX · **Effort:** S
- **Evidence:** `src/main/settings.js:64-91`

```js
if (d.createdBy == 'Kards') {
  if (d.exportedVersion == version) {           // exact string equality
    …
  } else {
    …send('importSettings', 'Skipping - The file is from a different version of Kards')
  }
}
```

Export/import exists so a technician can carry a house preset between machines and between
rebuilds. Requiring byte-identical version strings means a settings file exported from v1.3.0
cannot be loaded into v1.3.1, and — the case that will actually bite — a file exported today
cannot be loaded into whatever ships next. The check is also the *only* validation: within a
matching version, `typeof d[key] === typeof config[key]` is the entire schema check, so an object
of the right shape passes regardless of contents.

**Recommendation.** Accept any file whose `createdBy` is `Kards`, run it through the same
versioned migration ladder as F-006, and report what was migrated and what was dropped. Reject on
schema violation, not on version mismatch.

---

### F-018
**Whole config — including multi-MB base64 blobs — is re-broadcast on every keystroke**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Performance · **Effort:** M
- **Evidence:** `src/views/Control.vue:337-359`; `src/main/ipc.js:36-54`; `src/main/audio.js:37,54,90`

`Control.vue` puts a `deep: true` watcher on the entire config and, on any change, serialises and
ships the whole thing:

```js
watch: { config: { handler: function (val) {
  if (this.sync) window.ipcRenderer.send('config', JSON.parse(JSON.stringify(this.config)))
}, deep: true } }
```

The config is not small. It carries, as base64 data URIs: the custom logo
(`windows.js:448`), the mask image (`ipc.js:115`), the TTS voice wav (`audio.js:37`), the TTS text
wav (`audio.js:54`) and any imported audio file (`audio.js:90`). A user with a logo and an
imported audio file has a multi-megabyte config object that is `JSON.parse(JSON.stringify(…))`d
and pushed over IPC **on every character typed into the Name field**.

The main process then fans it out again (`ipc.js:36-54`): to the test card window, to
`controlMenu`, `osc`, `rest`, `touchBar`, the NDI capture window, and `persist(store)` — which
writes the whole thing, blobs included, to disk. Then `updateScreens()`.

Observed side effect: the `createVoice()` double-run in the launch log
(`02-build-baseline.md` §3) — TTS regeneration is triggered from the config path, so a config
broadcast causes a wav to be regenerated and base64'd back into the config, which triggers
another broadcast.

**Impact.** Not fatal — it is a desktop app on a modern machine — but it is a disk write per
keystroke, a synchronous multi-MB serialisation on the UI thread, and a feedback loop between
audio generation and config broadcast. It is also the reason the config object cannot simply be
made larger.

**Recommendation.** Move the base64 blobs out of `config` and into separate `electron-store`
keys (or files) referenced by id; broadcast only the small config. Debounce the watcher.
Longer term, replace the broadcast-everything model with per-key updates — which the schema
from F-004/F-006/F-016 gives you for free.

---

### F-019
**`npm run lint` rewrites build output and a vendored minified file**

- **Severity:** Medium · **Confidence:** Reproduced · **Category:** Build/Release · **Effort:** S
- **Evidence:** `package.json:10`, `package.json:88-104` (no `ignorePatterns`); no `.eslintignore`;
  lint output in `02-build-baseline.md` §5

```json
"lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix"
```

`.prettierignore` exists; there is no ESLint equivalent and no `ignorePatterns` key. ESLint
therefore walks `dist/` and `src/assets/particles.min.js`, which is where 941 of the 950 reported
"errors" come from:

| File | errors |
|---|---|
| `dist/assets/main-*.js` (build output) | 906 |
| `src/assets/particles.min.js` (vendored, minified) | 35 |
| all real source combined | **9** |

Because the script passes `--fix`, running the project's own lint command **rewrites a vendored
minified library in place**. `src/assets/particles.min.js` happens to be dead (F-031), but
`public/particles.js` is live and would be caught by the same glob if it moved.

**Recommendation.** Add `ignorePatterns: ["dist/**", "dist_electron/**", "**/*.min.js"]` to the
`eslintConfig` block, split `lint` (check) from `lint:fix`, and make `lint` non-`--fix` so it can
be used in CI. Nine real errors is a five-minute cleanup once the noise is gone.

---

### F-020
**No CSP, no navigation handler, no window-open handler, no permission handler**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Security · **Effort:** S
- **Evidence:** `grep -rn "Content-Security-Policy\|onHeadersReceived\|setWindowOpenHandler\|will-navigate\|setPermissionRequestHandler\|webSecurity\|sandbox" src/ index.html` returns nothing

None of the standard Electron hardening measures are present:

- No `Content-Security-Policy` meta tag in `index.html` and no `onHeadersReceived` CSP header.
- No `setWindowOpenHandler` — `window.open` from renderer content is unrestricted.
- No `will-navigate` handler — nothing stops the renderer navigating away from local content.
- No `setPermissionRequestHandler` — the app does use `getUserMedia`-adjacent audio device
  enumeration, so this is not hypothetical.
- `sandbox` is never set explicitly on any window.

The app loads only local content today, so the practical exposure is low — but this is the same
class of gap as F-010, and it is what stops a future mistake (a remote help page loaded in-window,
an `<iframe>`, a logo fetched over HTTP) from becoming a compromise.

**Recommendation.** Add a restrictive CSP (`default-src 'self'; img-src 'self' data:;
media-src 'self' data:; style-src 'self' 'unsafe-inline'` — the last is needed for the inline
`:style` bindings the cards rely on), a `setWindowOpenHandler` returning `{action: 'deny'}`, a
`will-navigate` handler that blocks anything outside the app origin, and `sandbox: true`
explicitly. Run `electron` with the security-warnings console enabled during development.

---

### F-021
**98 MB asar — every asset shipped twice**

- **Severity:** Medium · **Confidence:** Reproduced · **Category:** Build/Release · **Effort:** S
- **Evidence:** `package.json:66-70`; asar listing in `02-build-baseline.md` §4

`files: ["dist/**", "src/**", "package.json"]` ships both the Vite bundle *and* the raw source
tree. Every audio and video asset appears twice:

```
\src\assets\audio\phase.wav           \dist\assets\phase-uQF2Tj9v.wav
\src\assets\audiosync\59.94.webm      \dist\assets\59.94-CbPm8L1w.webm
```

~13 MB duplicated, plus every uncompiled `.vue` file. Result: a 98 MB `app.asar` and a 112 MB
Windows installer, against a ~910 kB JS bundle. `src/` is on the list because `main` is
`src/background.js`; the fix is a narrower glob, not deleting `src/`.

**Impact.** Download size matters here specifically because of F-005 — users must manually
re-download the full installer for every update. 112 MB over a venue's Wi-Fi, past a SmartScreen
warning, is a real barrier to getting fixes adopted.

**Recommendation.** `files: ["dist/**", "src/background.js", "src/main/**", "src/preload.js",
"src/defaultConfig.json", "package.json"]`, verified by listing the asar. Consider bundling the
main process with Vite/electron-vite too, which reduces this to two files. Also consider whether
all nine audio-sync `.webm` clips need to ship (they total ~9 MB).

---

### F-022
**No tests, no CI, no `.github/` directory at all**

- **Severity:** Medium (Critical in effect, but it enables rather than causes the others)
- **Confidence:** Observed · **Category:** Maintainability · **Effort:** L
- **Evidence:** no test runner in `package.json`, no `*.test.*`/`*.spec.*` anywhere, no `.github/`

There are no tests of any kind and no CI. For most apps that is a maintainability problem. Here
it is the reason F-001, F-008 and F-013 survived for years: **there is nothing that looks at the
pixels**, and pixels are the product.

**Recommendation.** Build one thing first, before any modernisation work:

> A headless pixel harness. Launch Electron with `--force-color-profile=srgb`, load
> `#/testcard` in a hidden `BrowserWindow` at a fixed size, push a config, `capturePage()`,
> and assert sampled RGB values at known coordinates for every card and variant.

The machinery already exists in the repo — `ndi.js:60-146` does exactly this (hidden window,
config push, `capturePage`, bitmap) for NDI. Reusing it is a day's work, not a project.

This harness is what makes everything else safe:

- It records today's output *before* the Electron 34 → 43 bump, so F-002's silent-drift risk
  becomes a failing test rather than a support ticket.
- It is the acceptance criterion for the F-001, F-008 and F-013 fixes.
- It is the regression net for the migrate-vs-rebuild decision in `07-plan.md` §8a — and it is
  reusable against a rebuild, which materially changes that calculation.

Then add: a GitHub Actions workflow running `lint` + `build` + the pixel harness on PRs, a
config-migration test (F-006), and the release workflow from F-003.

---

### F-023
**`nodeIntegration` is driven by an environment variable that no longer exists**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Security · **Effort:** S
- **Evidence:** `src/main/windows.js:58-62`

```js
webPreferences: {
  nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
  contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
  preload: path.join(__dirname, '..', 'preload.js')
}
```

`ELECTRON_NODE_INTEGRATION` was set by `vue-cli-plugin-electron-builder`, which this branch no
longer uses. The variable is now always `undefined`, so this evaluates to
`nodeIntegration: undefined` (falsy) and `contextIsolation: true` — the safe outcome, **by
accident**.

The danger is that it is one stray environment variable away from turning `nodeIntegration` on
in a renderer with an unrestricted IPC bridge (F-010) and no CSP (F-020). It is also inconsistent:
the test card window (`windows.js:198`), the export window (`windows.js:416`) and the NDI capture
window (`ndi.js:77-80`) set only `preload` and rely on Electron's defaults.

**Recommendation.** Delete the environment variable entirely and set the same explicit
`webPreferences` on all four windows: `contextIsolation: true, nodeIntegration: false,
sandbox: true`. Factor it into one shared constant so the four windows cannot drift.

---

### F-024
**OSC `/audio/file` reads an arbitrary local file on an unauthenticated UDP packet**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Security · **Effort:** S
- **Evidence:** `src/main/osc.js:481-486`; `src/main/services.js:22-36`

```js
this._server.on('/audio/file', (message) => {
  if (message.args.length > 0) this.emit('audioFile', String(message.args[0]))
  …
})
// services.js:22-36
osc.on('audioFile', (filePath) => {
  if (fs.lstatSync(filePath).isFile()) {
    config.audio.fileData = 'data:audio/' + filePath.split('.').pop() + ';base64,'
                          + fs.readFileSync(filePath, { encoding: 'base64' })
```

An unauthenticated OSC packet names any path on disk; the main process `readFileSync`s it,
base64s it into the config and hands it to the renderer, which will play it as audio.

Mitigating: OSC currently binds loopback only (F-015), so this needs local access today — and the
data is stripped from both the REST and OSC config responses (`rest.js:85`, `osc.js:62`), so it is
not directly exfiltrated. Aggravating: **fixing F-015 as written would expose this to the LAN**,
and `fs.readFileSync` on an attacker-chosen path (e.g. a multi-GB file, or a device node on
Linux/macOS) is an easy memory-exhaustion crash. `lstatSync` on a non-existent path also throws
straight into the global `uncaughtException` handler.

**Recommendation.** Fix this *before* changing the OSC bind address. Validate the extension
against the same allow-list the file dialog uses (`audio.js:84` — wav/mp3/ogg/aac), stat the file
and reject anything over a sane size, resolve and reject paths outside a permitted directory, and
wrap in try/catch. Same treatment for the `selectImage` / `selectMaskImage` paths, which read
user-chosen files with no size limit into base64 in the config (F-018).

---

### F-025
**Three independent Bonjour instances; one is never cleaned up**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Maintainability · **Effort:** S
- **Evidence:** `src/background.js:11`, `src/main/rest.js:6`, `src/main/osc.js:5`;
  cleanup at `background.js:69-78` and `rest.js:74-79`

`require('bonjour')()` is called three times, creating three independent mDNS responders with
three sockets. On shutdown, `background.js`'s instance and `rest.js`'s instance are unpublished
and destroyed; **`osc.js`'s is not**, so the `_alteka_osc` advertisement is never withdrawn.

`background.js`'s own instance publishes nothing at all — it exists only to be destroyed.

Closed issue **#86** ("Bonjour names can clash. Should be unique.") shows this area has already
caused trouble. Note that all three services still use `Kards-<hostname>` (`rest.js:35,46`,
`osc.js:491`), so two machines with the same short hostname — common with imaged AV laptops —
still clash.

Also relevant: `bonjour@3.5.0` is 13 years old on the registry and pulls the vulnerable
`multicast-dns` → `dns-packet` → `ip` chain (`03-dependency-audit.md`). The maintained
replacement is `bonjour-service`.

**Recommendation.** One shared Bonjour instance created and destroyed in `background.js` and
injected into both servers. Migrate to `bonjour-service`. Include a short uuid or MAC suffix in
the advertised name to fix #86 properly.

---

### F-026
**Wallpaper temp files accumulate in userData forever**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Maintainability · **Effort:** S
- **Evidence:** `src/main/windows.js:501-528`

```js
let dest = app.getPath('userData') + '/wallpaper' + Math.round(Math.random() * 100000) + '.png'
```

Every "set as wallpaper" writes a new randomly-named full-resolution PNG into the app's userData
directory. Nothing ever deletes them, and the file must persist because the OS wallpaper setting
points at it — so the *current* one must stay, but every previous one leaks.

A 4K PNG is several megabytes; a user who sets the wallpaper regularly accumulates them
indefinitely in `%APPDATA%/kards` where they will never look. `Math.round(Math.random()*100000)`
also collides.

Also in the same two handlers (`saveAsPNG` at `:457`, `setAsWallpaper` at `:501`): the "close the
dummy window" cleanup at `:495-498` and `:524-527` runs **synchronously, before** the async
`showSaveDialog`/`writeFile` completes, so the ordering is accidental.

**Recommendation.** Keep exactly one wallpaper file at a fixed path, overwritten each time (or
two, alternating, if the OS caches by path). Sweep any legacy `wallpaper*.png` on startup. Move
the window cleanup into the async completion path.

---

### F-027
**Card rendering is implemented twice — here and in Kards Online**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Maintainability · **Effort:** XL
- **Evidence:** `src/components/Control/ControlShare.vue:66`, `:96`

The Share dialog builds `https://kards.alteka.solutions/?<url-encoded config>` and gates it on:

```js
supportedCards: ['alteka', 'bars', 'grid', 'ramp', 'placeholder', 'audioSync']
```

Kards Online is a separate codebase implementing the same cards, and it has **already fallen
behind** — no `led`, no `deghost`, and no `clock` (the card added on this branch). The card
definitions, the colour maths and every fix in F-001/F-008/F-013 have to be made twice, in two
repositories, and there is no mechanism that keeps them in step.

This is the most consequential architectural fact for `07-plan.md` §8a. It also means F-001 is
very likely wrong in Kards Online too — worth checking, since that is out of scope for this
review of this repo.

**Recommendation.** Extract the card components and colour maths into a framework-agnostic
package (or at minimum a shared Vue component library) consumed by both. This is the one piece of
architecture that a rebuild would plausibly get right from the start and that incremental
migration is unlikely to reach — weigh it accordingly in §8a.

---

### F-028
**Rollbar captures uncaught errors with no consent surface or opt-out**

- **Severity:** Medium · **Confidence:** Observed · **Category:** Privacy · **Effort:** S
- **Evidence:** `src/main/rollbar.js:6-19`; `src/background.js:32-37,47`; `.gitignore:10`

```js
return new Rollbar({
  accessToken: env.rollbarToken,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: { version }
})
```

When a build ships with a token in `env.json`, every uncaught exception and unhandled rejection
is sent to a third party. There is no consent prompt, no opt-out, no mention in the README, and
no privacy policy in the repo. Stack traces from this app can contain **user file paths** —
`audio.js:95` and `services.js:27` log full paths of user-selected audio files, and the same
paths appear in error objects — and the machine name, which is `config.name` and is by design the
computer's hostname.

The `env.json` mechanism itself is sound: it is git-ignored (`.gitignore:10`), the example file
contains an empty token, and `initRollbar` no-ops on an empty token or in development. **No
secret was found in the working tree.** History was not exhaustively scanned — commit `ccf1597`
("Put rollbar into an env file") and `9eb40bb` ("Rollbar token stuff") indicate the token was
moved *into* `env.json` at some point, which raises the question of whether it was ever committed
before that. See the note below.

> ### Verified 2026-08-08 (Q8) — both assumptions about this were wrong
>
> The maintainers' recollection was *"we didn't collect anything identifiable anyway, and I'm sure
> we used to have a note in the readme."* Neither holds:
>
> **It sends the hostname, unconditionally.** From the installed SDK:
>
> ```js
> // node_modules/rollbar/src/server/rollbar.js:732-734
> Rollbar.defaultOptions = {
>   host: os.hostname(),
> ```
>
> `src/main/rollbar.js:12-18` does not override `host`. And the hostname is not incidental in this
> app — `src/main/config.js:12-15` derives `config.name` from it, so the machine name is
> simultaneously what the card displays and what the telemetry reports. On a venue laptop that is
> typically a company name and an asset tag.
>
> **No shipped README has ever mentioned it.** `git log -S` across all branches finds exactly one
> commit touching README with Rollbar wording — `39203c4` (2026-02-13), on the **unreleased**
> `feature/modernise`, and it is a build instruction ("leave `rollbarToken` empty unless you use
> Rollbar") aimed at someone compiling the app. `git show master:README.md` has no mention of
> Rollbar, error reporting, telemetry or privacy at all.
>
> **Decision (Q8): option A — keep it, but fix it.** Scope is slightly larger than first costed
> (~1 d, plan item **S10**), and it moves from hygiene to should-do-before-shipping.

**Recommendation.** Keep Rollbar (decided), and before the next release:

- **Stop sending the hostname.** Set `host` to a stable random install id generated on first run,
  or omit it entirely.
- **Scrub absolute paths** before send — via Rollbar's `transform`/`checkIgnore` hooks, or at the
  call sites that embed them (`audio.js:29,48,66`, `services.js:26-28`, `windows.js:447`,
  `ipc.js:114`). These are the paths that can carry the OS username.
- **Disclose it** in the README *and* the About dialog, and add an opt-out in the More menu.
- If the app is distributed in the EU/UK, unannounced error telemetry carrying a device
  identifier is a compliance question, not just a courtesy.

**Git-history secret scan — not completed.** I did not run a full-history secret scan
(`gitleaks`/`trufflehog`) as part of this pass; `env.json` is correctly ignored *now*, but
commits before `ccf1597` (2023-07-06) should be checked for a committed Rollbar token, and the
token rotated if one is found. Flagged as an explicit gap rather than a clean bill of health.

---

## Low

### F-029
**`defaultConfig.json` declares `mask.image`; every consumer uses `mask.imageSource`**

- **Severity:** Low · **Confidence:** Observed · **Category:** Correctness · **Effort:** S
- **Evidence:** `src/defaultConfig.json:25-29` vs `src/main/ipc.js:115`,
  `src/views/Testcard.vue:5,8`, `src/components/Control/ControlMenu.vue:73,78`

The default config declares `mask: { enabled, applyBounds, image }`. Nothing reads or writes
`mask.image`; every consumer uses `mask.imageSource`, which is absent from the defaults and only
springs into existence when the user picks an image (`ipc.js:115`).

Consequences are minor because the `v-if` guards hold, but: `GET /mask/imageSource` reports
"Endpoint does not exist" until an image is chosen, `GET /mask/image` returns an empty string
forever, and `Testcard.vue:83-87` carries a second, divergent local default for the same object.

**Recommendation.** Rename to `imageSource` in `defaultConfig.json`, add a migration step
(F-006), and delete the duplicate default in `Testcard.vue`.

---

### F-030
**The HDR card advertises 10-bit code values it cannot produce**

- **Severity:** Low · **Confidence:** Observed · **Category:** Correctness · **Effort:** M
- **Evidence:** `src/components/TestCard/HDR.vue:32-34`, `:4-27`

The card's own overlay text reads:

> "Ramp from 0% IRE (64/1024) to 100% IRE (940/1024) with 10x reversed pluges"

`64/1024` and `940/1024` are 10-bit studio-range code values. The card is drawn with the same
8-bit sRGB CSS as everything else, through `Swatch` (so it also carries F-001), on a renderer
Electron reports as `depthPerComponent: 8`. There is no HDR pipeline, no `--enable-features`
HDR switch, no `screen` HDR query, and no colour-space tagging anywhere in the app.

It is a perfectly reasonable *SDR representation* of an HDR check pattern — closed issue **#64**
is literally "Possibly better support for HDR" — but the label claims precision the pipeline does
not have.

**Recommendation.** Either reword the overlay to describe what it actually renders, or take HDR
on properly (Electron/Chromium HDR support has moved substantially between 34 and 43 — this is
worth re-evaluating as part of the Electron bump, and is one of the few places where the upgrade
buys a feature rather than costing risk). Reword now; decide the real thing later.

---

### F-031
**Dead files and dead code**

- **Severity:** Low · **Confidence:** Observed · **Category:** Maintainability · **Effort:** S

| Path | Why |
|---|---|
| `about.html` | References `./src/renderer.js` and `./styles/ui.css`; neither exists. Not in `build.files`. |
| `env.json.example` | Superseded by `env.example.json` (`eebe793`). Two files, same content. |
| `src/assets/particles.min.js` | Nothing imports it — `Deghost.vue:10` imports `public/particles.js` instead. Also the file that makes F-019 dangerous. |
| `src/main/audio.js:61-75` `textToSpeachData()` | Not exported, not called, and returns from inside a callback so it would return `undefined` anyway. |
| `browserslist` (`package.json:105-109`) | Meaningless for an Electron target; vue-cli leftover. |
| `src/components/TestCard/InfoCircle.vue` `vertical` (`Swatch.vue:74`) | `data.vertical` is set and never read. |
| `README.md:43` | States `env.json` is "required for the app to start"; `background.js:33-37` try/catches it. |

Also note `Deghost.vue:10` imports a module out of Vite's `publicDir`, which Vite explicitly
advises against — the file ends up both bundled into `main.js` and copied verbatim into `dist/`.

---

### F-032
**Four 500+ line files carrying most of the complexity**

- **Severity:** Low · **Confidence:** Observed · **Category:** Maintainability · **Effort:** L

`Alteka.vue` (742), `ControlMenu.vue` (616), `windows.js` (534), `menu.js` (526), `osc.js` (519),
`Testcard.vue` (536), `Control.vue` (508). `osc.js` is the worst offender because ~460 of its
lines are mechanically-repeated handlers (F-016). `windows.js` mixes window lifecycle, screen
management, PNG export and wallpaper setting in one module.

The `feature/modernise` refactor (`62ab1a7`, `7fa12c4`) already made a real improvement here by
splitting `background.js`; this is the remaining half of that job. Not urgent, but it is the
tax being paid on every other fix in this document.

---

### F-033
**DeGhost sweeps saturated hues full-screen with no warning or opt-out**

- **Severity:** Low · **Confidence:** Observed (timing from CSS); photosensitivity risk is Inferred
- **Category:** UX · **Effort:** S
- **Evidence:** `src/components/TestCard/Deghost.vue:131-189`

`#Deghost` animates its background through the full hue wheel — 13 keyframes, `hsl(0…360, 100%,
50%)` — over **5 s**, `linear`, infinite. Because the timing function is linear the result is a
continuous hue sweep rather than a flash, so it does **not** meet the WCAG 2.3.1 flash threshold
(≥3 general flashes per second). It does, however, sweep full-screen through saturated
red↔green transitions, which is the specific transition WCAG 2.3.1 calls out.

Being clear about confidence: I have not measured this against the general or red flash
thresholds with a tool, and it is probably fine. But this is a card designed to be put
**full-screen on a large display in a venue with an audience**, so "probably fine" is worth
converting to "checked".

**Recommendation.** Run the card past the Harding test or equivalent. Regardless of the result,
add a one-line note in the UI when DeGhost is selected — it is a burn-in remedy, not a card
anyone needs running while people are watching.

---

### F-034
**Five Sass deprecation categories are silenced rather than fixed**

- **Severity:** Low · **Confidence:** Observed · **Category:** Build/Release · **Effort:** S
- **Evidence:** `vite.config.mjs:13-25`

```js
silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'function-units']
```

These are real Sass deprecations, coming from `element-plus@1.0.2-beta.71`'s stylesheets. `@import`
and the legacy JS API are both scheduled for removal in Sass 2.0. Silencing them is a reasonable
short-term move, but it hides a build that will break on a future `sass` major, and it will not be
fixable without F-012.

**Recommendation.** Leave the silencing in place; note in `07-plan.md` that it is a
dependency-ordering constraint, not an independent task. It resolves itself when element-plus is
migrated.

---

### F-035
**`shell.openExternal` takes an unvalidated string from the renderer**

- **Severity:** Low · **Confidence:** Observed · **Category:** Security · **Effort:** S
- **Evidence:** `src/main/ipc.js:100-103`

```js
ipcMain.on('openUrl', (_, arg) => { shell.openExternal(arg); log.info('open url', arg) })
```

No scheme validation. `shell.openExternal` will hand `file:`, `smb:`, `ms-msdt:` and other OS
handlers to the shell. Given F-010 (any renderer code can address any channel) this is the
classic Electron escalation primitive.

I found no reachable injection path into the renderer today, so this is defence in depth — but it
is a two-line fix and there is no reason to carry it.

**Recommendation.** Validate against an `https:`/`http:` allow-list (or better, an allow-list of
known Alteka URLs, since there are only three call sites — `ipc.js:101`, `menu.js:492`,
`updateChecker.js:30`) and reject everything else.

---

## Not findings — checked and clear

Recording these so a future pass doesn't re-do the work:

- **No secrets in the working tree.** `env.json` is git-ignored, `env.example.json` has an empty
  token, and no API keys, certificates or tokens were found in tracked files. *(Git history was
  not exhaustively scanned — see the caveat in F-028.)*
- **`contextIsolation` is on** for the control window (`windows.js:60`) and defaults to on for
  the other three. `nodeIntegration` is off everywhere. See F-023 for why that is fragile rather
  than wrong.
- **No remote content is loaded into any window.** All four windows load either the Vite dev
  server URL or a local `file://` path. External links go through `shell.openExternal`.
- **The update-version comparison works**, despite inconsistent Git tag naming
  (`v1.3.1` vs `1.1.0`) — `compare-versions` tolerates the `v` prefix, and the third argument
  passed at `updateChecker.js:18` is ignored by the v4 API rather than misbehaving. Verified
  live: `Update :: Running latest version - v1.3.1`.
- **Escape closes the test card.** Bound in both windows (`Testcard.vue:273`, `Control.vue:219`),
  which matters given closed issue #48. Not regression-tested, but present.
- **Licence compliance:** the project is GPL-3.0-only, and no dependency in the tree carries a
  licence incompatible with distributing under GPL-3.0 (the dependency tree is MIT/ISC/Apache-2.0
  dominated; `DejaVu` and `Sansation` fonts ship with their own licence files). The one open
  question is the **NDI SDK's redistribution terms** vs GPL-3.0 — flagged in F-011, not resolved
  here.
