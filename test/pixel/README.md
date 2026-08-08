# Pixel harness

Captures each test card in a hidden Electron window, samples specific pixel
coordinates, and compares them against a committed baseline.

It exists because v1.4.0 changes the card output deliberately (the levels fixes,
DPI sizing) at the same time as it changes the runtime underneath it (Electron
34 → 43). Without this, "the colour bars look different" has two possible causes
and no way to tell them apart. Specified in `docs/review/09-kickoff.md` §6.

## Running it

Build first — the harness loads `dist/index.html`, not the dev server:

```bash
npm run build
```

Then:

```bash
node test/pixel/run.js --validate
```

The day-one acceptance test. Run this before trusting any other output.

```bash
node test/pixel/run.js
```

Compare every case against `baseline.json`. Exit 0 if everything matches.

```bash
node test/pixel/run.js --case bars-simple-75 --case ramp
```

Restrict to named cases. Repeatable. Works with every mode.

```bash
node test/pixel/run.js --record
```

Re-baseline. **Read "Re-baselining" below before you do this.**

```bash
node test/pixel/run.js --json
```

Machine-readable report on stdout, for CI.

## The day-one validation

`--validate` is the harness's own acceptance test, and it asserts two things that
have to be true _simultaneously_:

| Check                         | Assertion                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| Reproduces a documented value | bars/simple @ 100%, centre of bar 1 = `235,235,235`                                |
| Detects a known bug           | bars/simple @ 75%, centre of bar 2 = `180,180,0`, **not** the correct `180,180,16` |

Either one alone is worthless. A harness that only agrees with the app tells you
nothing; a harness that only disagrees is broken. Both together mean it is
measuring the real thing.

The second check is finding **F-001**: `Swatch.vue` multiplies the level value by
a per-channel 0 or 1, so channels that should sit at the 16 floor land on 0
instead. When F1 fixes that, this check's expectation changes to `180,180,16` —
and at that point it stops being a bug detector, so keep the first check.

## How a capture is made

1. Hidden `BrowserWindow`, fixed content size, audio muted.
2. `--force-color-profile=srgb` — the harness measures **what the app draws**,
   isolated from display colour management. What a display then does with it is a
   separate question (plan task D7, decided in Q5). Do not conflate them.
3. `--force-device-scale-factor=1` — otherwise this machine's 1.25 scale factor
   changes the bitmap dimensions and the sample coordinates mean something
   different. DPI behaviour is F4's problem, not this harness's.
4. Hardware acceleration off, so the GPU driver is not part of the measurement.
5. Wait for `did-finish-load`, push the config over IPC, wait three animation
   frames, then wait past `Testcard.vue`'s 1 s re-measure timer.
6. Capture twice at 250 ms apart and require the two bitmaps to be **byte-identical**
   before sampling. Up to four attempts. This is the main anti-flake mechanism.
7. Sample the baseline's coordinates and compare exactly — no tolerance.

Cards that animate by design (`deghost`, `audioSync`) never satisfy step 6. They
are reported as `frame never settled` and still sampled; their sample points are
in regions that happen to be static. Treat a failure there as suspect before
treating it as real.

### What the harness changes about the app, and why

Two CSS rules are injected into every capture:

- `.el-message, .modal { display: none }` — `Testcard.vue` shows a "Press escape
  to close test card" toast for 3 s on mount. It is app chrome, not card output.
- `transition: none; animation: none` — freezes the fade transitions so the
  measurement is of the steady state rather than of a moment during a fade.

Three config values are forced on every case beyond the two the specification
requires (`animated: false`, `showClock: false`):

- `showInfo: false` — the info circle is centred text over the card. Leaving it
  on would make centre samples depend on font rasterisation, which is exactly the
  fragility §6 warns about. **The consequence is that the info circle is not
  covered by this harness at all.**
- `infoCircleAnimated: false` — belt and braces; with `showInfo: false` neither
  code path renders.
- `_captureOnly: true` — without it `Testcard.vue` interprets the config push as
  an export request and runs `dom-to-image`.

## Choosing sample points

**Specific coordinates, never whole-image hashes.** A whole-image comparison
breaks the first time a font renders half a pixel differently, and once it has
cried wolf nobody trusts it again.

`--record` picks points from a fixed lattice: eight columns at odd sixteenths of
the width, three rows at 1/6, 1/2 and 5/6 of the height. The sixteenths are
deliberate — they land exactly on the centres of the eight bars in the bars
cards.

A candidate is kept only if:

- its neighbourhood is **flat** — every pixel in a 9×9 block around it is
  identical. This is what rejects edges, text and antialiasing automatically,
  without anyone having to know what each card looks like.
- it is **identical across two independent captures**, each in its own freshly
  created window.

Cards with gradients set `uniformRadius` in `cards.js` to relax the first test:
`alteka` and `placeholder` use a 3×3 block; the two smooth ramps use the centre
pixel alone, because a gradient is flat nowhere and no neighbourhood test can
pass. That is sound for those two — the ramp is deterministic and there is no
text at the lattice points — but it is the weakest coverage in the matrix.

## The baseline

`baseline.json` holds one entry per case, each with a list of samples:

```json
{
  "name": "bar2-yellow-75",
  "point": [360, 540],
  "expected": [180, 180, 0],
  "source": "spec",
  "note": "F-001: blue channel is 0, should be 16. ..."
}
```

`source` is the part that matters:

- **`spec`** — hand-authored from a documented value or a deliberate decision.
  `--record` **preserves these and will not overwrite them.** If reality
  disagrees with a `spec` sample, that is a finding, not a stale baseline.
- **`recorded`** — observed output, kept as a regression tripwire. It asserts
  "this did not change", not "this is correct".

`meta` records the Electron and Chrome versions the baseline was taken on. The
current baseline is **Electron 34.5.8 / Chrome 132**, recorded on win32 x64
before any of the levels fixes. That is the reference point D6 steps away from.

## Re-baselining

Re-recording is how a harness quietly stops testing anything. Before you run
`--record`:

1. Run `node test/pixel/run.js` and **read every failure**. Each one is either a
   change you meant to make or a regression. There is no third category.
2. If they are intended, re-record and put **what moved and why** in the commit
   message. Ground rule 2 in `09-kickoff.md` §4.
3. Never re-record to make a red build green.

Re-record only the affected cases where you can:

```bash
node test/pixel/run.js --record --case bars-simple-75
```

Cases you do not name are left untouched.

Because the baseline is per-platform, a re-record on macOS will overwrite
Windows-recorded values. Until that is handled properly, re-baseline on one
platform only and treat the other as a comparison run.

## Known limitations

- **One platform at a time.** `meta` records which; there is no per-platform
  baseline yet.
- **The info circle, clock text and bar overlay labels are not covered** — all
  text rendering is deliberately excluded.
- `ramp` and `ramp-vertical` rely on the stability check alone, with no
  neighbourhood test.
- `deghost` and `audioSync` never settle; their samples are in regions that are
  static in practice, which is an observation, not a guarantee.
- Exact comparison, no tolerance. Correct for the levels work. If a future change
  makes a card legitimately non-deterministic at the last bit, the answer is to
  exclude that sample, not to add a global tolerance.
