# Homebrew cask

**Decision (2026-08-08, maintainer): Kards ships in our own tap for now, not in
`homebrew/homebrew-cask`.**

Why that is the right call for v1.4.0:

- No third-party review queue, and no notability thresholds to argue about. We can ship the cask
  the same day as the release.
- We control it. `homebrew-cask` would put a file describing Kards in someone else's repository,
  reviewed by people with no stake in whether it is correct.
- It is reversible. Submitting to `homebrew-cask` later is easy; getting something wrong in the
  central repository and having to chase it is not.

The cost is discoverability: `brew install kards` will not work, only
`brew install alteka/tap/kards`. That is an acceptable trade while the signing chain is still being
proven — and if it turns out people want it, upstreaming later costs one PR.

## Why a cask at all

macOS is **81% of Kards downloads** and has no package-manager path today. Windows has had one for
years — `AltekaSolutions.Kards` in WinGet, which nobody documented. So the majority platform is the
one without a `brew upgrade` equivalent, which is the wrong way round.

It also fits the delivery model exactly. Kards has no auto-updater on purpose: nothing should
decide to interrupt a show. `brew upgrade` is entirely user-initiated, which is the same principle
as the notify-then-send-to-the-website flow in the app. See F-005.

## Setting the tap up — one time, needs a maintainer

The only hard rule is the **`homebrew-` prefix**. From
[Homebrew's docs](https://docs.brew.sh/Taps): *"a repository must be named `homebrew-<repository>`
to use the one-argument form of `brew tap`"*. Everything after the prefix is our choice, and it
becomes what users type:

| Repository | `brew tap` | Install command |
|---|---|---|
| `Alteka/homebrew-tap` | `alteka/tap` | `brew install --cask alteka/tap/kards` |
| `Alteka/homebrew-kards` | `alteka/kards` | `brew install --cask alteka/kards/kards` |

### What other people actually use

Checked rather than assumed, because the answer splits cleanly by **who is publishing**.

**Community taps** — someone packaging software they did not write. In a sample of the 222
most-starred third-party `homebrew-*` repositories, **199 (90%) are named after the software**:
`d12frosted/homebrew-emacs-plus`, `shivammathur/homebrew-php`, `denji/homebrew-nginx`,
`neovim/homebrew-neovim`, `Gcenx/homebrew-wine`. Only 23 use a generic word. `homebrew-tap` is
still the single most common individual name (20 of 222), but it is nowhere near a majority.

**Vendor taps** — an organisation publishing its own product, which is our case. The pattern
inverts:

| `homebrew-tap` | `homebrew-brew` | named after the product/org |
|---|---|---|
| hashicorp, aws, goreleaser, planetscale, supabase, charmbracelet, dagger, railwayapp | heroku, mongodb | ngrok, cloudflare, instrumenta, teamookla (`homebrew-cask`) |

Eight of fourteen vendors checked use `homebrew-tap`; ten of fourteen use a generic word. The
reasoning is fairly obvious once separated out — a community tap is *about* the software it
packages, so it names itself after it; a vendor tap is *the vendor's shelf*, and naming it after
one product is awkward the moment there are two.

**Decided (2026-08-08, maintainer): `Alteka/homebrew-tap`**, giving
`brew install --cask alteka/tap/kards`. We are the vendor case, it is what most vendors do,
`alteka/kards/kards` reads badly, and a generic tap has somewhere to put a second thing later
without stranding anyone who has already tapped it.

This is settled — do not reopen it. If it ever does need to change, it is cheap: a repository
rename plus a line in the README, and GitHub redirects the old name.

1. Create **`github.com/Alteka/homebrew-tap`**, public.
2. Add `Casks/kards.rb` — seed it with [`kards.rb`](kards.rb) from this directory.
3. Fill in `version` and `sha256`. Nothing else in the file changes between releases.

Users then install with:

```bash
brew tap alteka/tap
brew install --cask kards
```

or in one step, `brew install --cask alteka/tap/kards`.

> **`kards.rb` here is a seed, not the master copy.** Once the tap exists, the tap is canonical.
> Do not maintain both — that is the same drift that produced `mask.image` vs `mask.imageSource`
> and the Kards Online divergence in F-027. Delete this file once the tap is live, or leave it with
> a note pointing at the tap; do not quietly keep editing it.

## Per release

Covered in [`../RELEASING.md`](../RELEASING.md) §6. Two lines change:

```bash
shasum -a 256 dist_electron/Kards-1.4.0-mac-universal.pkg
```

Then in the tap: bump `version`, paste the `sha256`, commit, push. There is no PR to wait on — that
is the point of owning the tap.

## Verifying it before anyone else uses it

On a Mac:

```bash
brew tap alteka/tap
brew install --cask kards        # must install without a Gatekeeper warning
brew uninstall --cask kards      # must remove it cleanly
brew audit --cask alteka/tap/kards
```

The install test is only meaningful **after** B2 lands. An unsigned or unnotarised pkg fails at the
same point whether it came from Homebrew or a browser, and Homebrew will not make that better —
`sha256` proves the file is the one we published, not that macOS will run it.

## Unverified

Written on Windows. Nothing here has been run. Specifically unconfirmed:

- The `zap` paths. `~/Library/Application Support/kards` is derived from `name: "kards"` in
  `package.json` and `~/Library/Logs/Kards` from electron-log's macOS default, but neither has
  been observed on a real install.
- That `pkgutil: "solutions.alteka.kards"` matches the receipt the pkg actually registers. Check
  with `pkgutil --pkgs | grep alteka` after installing.
- `brew audit` passing.
