# 06 — Branch reconciliation

*Phase 7 deliverable. Default branch: `master` @ `3948005` (2025-07-16).
Six non-default remote branches. Counts from `git rev-list --left-right --count master...<branch>`
and `git diff --stat master...<branch>`.*

---

## Summary

| Branch | Tip | Unique commits | Diff vs master | Conflict risk | Recommendation |
|---|---|---|---|---|---|
| `feature/modernise` | `6842bf1` 2026-08-07 | **7** | 69 files, +14,701 / −16,561 | **n/a — it is the future baseline** | **Merge — after cherry-picking `3948005` into it and closing the gaps below** |
| `feature/previewwindow` | `9c42f53` 2023-05-18 | 1 | 3 files, +357 / −5 | **Certain** — rewrites markup that `7fa12c4` deleted | **Abandon the branch, keep the idea** — re-implement on the refactored `Testcard.vue` (≈1 day) |
| `Electron16ReWrite` | `84d60bf` 2022-02-12 | **0** | **empty** | none | **Delete** — already fully merged into `master` |
| `hotfix/macclosewindowbug` | `3d9c8a8` 2024-04-03 | **0** | **empty** | none | **Delete** — already fully merged into `master` |
| `dependabot/…/axios-1.8.2` | `3efa3fb` 2025-03-07 | 1 | `package.json` + `yarn.lock` | **Certain** — `yarn.lock` no longer exists | **Close the PR, don't merge** — superseded; go to axios 1.19.0 or drop axios |
| `dependabot/…/follow-redirects-1.15.9` | `ba0ac1c` 2025-01-19 | 1 | `yarn.lock` only | **Certain** — file deleted | **Close the PR, don't merge** — transitive under axios; resolved by the above |

**Net: two branches to delete outright, two dependabot PRs to close, one idea to salvage and
re-implement, and one branch that is the whole modernisation and needs finishing.**

---

## `feature/modernise` — the one that matters

**Tip:** `6842bf1` "Claude stuff and thigns" (2026-08-07)
**Base:** forked from `9954034` (2025-01-19)
**7 unique commits · 1 commit behind master · 69 files changed, +14,701 / −16,561**

```
6842bf1 2026-08-07  Claude stuff and thigns
39203c4 2026-02-13  Prettier code!
7fa12c4 2026-02-13  TestCard.vue refactoring
62ab1a7 2026-02-13  Refactor background.js
b9a54dc 2026-02-12  More clock things
65d5c7e 2026-02-12  Add basic clock card type
636c57d 2026-02-12  Lots of refactor! Vite, npm and cleaner
```

**What it was trying to do, and how far it got.** Four things, and it got most of the way through
all four:

1. **vue-cli → Vite** (`636c57d`) — done and working. `vue.config.js` deleted, `vite.config.mjs`
   added, `index.html` moved to root, dev flow rebuilt on `concurrently` + `wait-on` +
   `cross-env`. **Verified: `vite build` succeeds in 10.5 s on Node 22 and the packaged app runs**
   (`02-build-baseline.md`).
2. **yarn → npm** (`636c57d`) — done. `yarn.lock` (12,118 lines) deleted, `package-lock.json`
   added, `resolutions` dropped (correctly — it is a no-op under npm).
3. **Monolith → modules** (`62ab1a7`, `7fa12c4`) — done and genuinely good. `background.js` went
   from one file to a 241-line wiring module plus 14 focused `src/main/*` modules with real
   doc-comments. `Testcard.vue` replaced ~60 lines of repeated `v-if` card dispatch with a
   `CARD_COMPONENT_MAP` and `<component :is>`. Prettier + a modern ESLint config landed
   (`39203c4`).
4. **New features** — the Clock card (`65d5c7e`, `b9a54dc`, closes issue #116) and NDI output
   (`6842bf1`, addresses issue #41).

**What still blocks it from shipping.** Four things, in priority order:

- **It is missing `3948005` from master.** `master` gained "Diagonal lines in the grid card"
  (canoemoose, 2025-07-16) — `config.grid.diagonals` + `config.grid.diagColour`, an SVG overlay in
  `Grid.vue`, and the control for it. **`feature/modernise` does not have it**
  (`grep diagonal src/components/TestCard/Grid.vue` → nothing). Merging as-is silently reverts a
  shipped-to-master feature.
  → **Cherry-pick `3948005` onto `feature/modernise` now**, before anything else. It touches
  `Grid.vue`, `ControlGrid.vue` and `defaultConfig.json`; `Grid.vue` was not restructured by
  `7fa12c4`, so the conflict risk is **low** (the `defaultConfig.json` hunk may need hand-placing).
  Note the new `grid.diagonals`/`grid.diagColour` keys are also a live example of **F-006** — they
  are nested under `grid`, so upgrading users will not get them.
- **NDI ships dead** — `grandiose` cannot be installed (**F-011**). This is the branch's headline
  feature and the tracker's oldest request.
- **The commit message `6842bf1` "Claude stuff and thigns"** covers the entire NDI implementation
  (244 + 97 lines, a `utilityProcess` worker, a postinstall `node_modules` patch script) plus the
  `grandiose` dependency. That is not a reviewable commit. Split it before merging, or at minimum
  rewrite the message.
- **It carries all the pre-existing findings forward**, including F-001 (wrong colour bars),
  F-004 (prototype pollution) and F-002. The refactor moved that code; it did not fix it.

**Recommendation: merge — but merge it *finished*, not as-is.**

Concretely, before it becomes `master`:

1. Cherry-pick `3948005`.
2. Resolve **F-011** (NDI installs, or NDI is cut from the release).
3. Fix **F-004**'s `mergeDeep` — a one-line guard, no reason to carry a known-vulnerable merge
   across a branch boundary.
4. Split or re-message `6842bf1`.
5. Land the pixel harness (**F-022**) on the branch, so the merge itself is verified not to have
   changed any output. The refactor in `7fa12c4` restructured how cards are dispatched — it
   *should* be behaviour-neutral, and right now nothing proves it is.

The working tree also has an **uncommitted** change moving `grandiose` from `dependencies` to
`optionalDependencies` (`package.json` + `package-lock.json`). That was present before this review
started and is untouched by it. It is the correct change — commit it deliberately as part of the
F-011 work rather than letting it merge as drive-by dirt.

---

## `feature/previewwindow` — good idea, obsolete implementation

**Tip:** `9c42f53` "Experimenting with a preview window" (2023-05-18)
**1 unique commit · 58 commits behind master · 3 files, +357 / −5**

```
src/views/Preview.vue            | +315
src/views/Control.vue            |  +43 / -5
src/components/TestCard/Bars.vue |  +4 / -2
```

**What it was trying to do.** Add a live preview of the current card *inside the control window*,
with a Screen/Preview radio toggle replacing the screen selector, scaled to the configured card
aspect ratio. This is a genuinely valuable feature for the product: it lets a technician set the
card up before putting it on a show display, which is exactly when you least want to be
experimenting on the output.

**How far it got.** Functional but explicitly experimental — the commit message says so, and it
was abandoned after one commit, 58 commits ago.

**Does it still apply after modernisation? The feature yes, the code no.**

`Preview.vue` is a **copy-paste of the old `Testcard.vue` card-dispatch markup, repeated four
times** (once for the main layer and once per animation layer), each block a 13-line ladder of
`v-if="config.cardType == 'grid'"` conditions:

```html
<GridTestCard v-if="config.cardType == 'grid'" …>
<BarsSmpteTestCard v-if="config.cardType == 'bars' && config.bars.type=='smpte'" …>
… ×13, ×4 blocks
```

That is precisely the pattern `feature/modernise`'s `7fa12c4` deleted, replacing it with
`CARD_COMPONENT_MAP` + `<component :is>` (`Testcard.vue:53-68`). It also predates the Clock card,
so it would need it added, and it duplicates the animation-layer logic that
`Testcard.vue:117-127` now centralises.

**Conflict risk: certain and total.** It rewrites `Control.vue`'s template head, which
`feature/modernise` has also changed, and `Preview.vue`'s entire reason for existing has been
refactored away.

**Recommendation: abandon the branch; keep the idea and re-implement.**

On the modernised codebase this is a much smaller job than the 315 lines suggest — the card
dispatch, the animation layers and the sizing logic all already exist in `Testcard.vue` and just
need extracting into a shared component that both the test card view and a control-window preview
mount. Estimated **1 day**, versus a conflict-resolution exercise that would take about as long
and leave you with the pre-refactor structure.

Two things to carry over from the branch when re-implementing:

- `previewStyle` (`Control.vue`, computed) — the aspect-ratio scaling logic. Small but fiddly.
- The Screen/Preview radio toggle placement — a reasonable UX decision that avoids growing the
  control window.

Salvage those two, delete the branch. Worth noting this also becomes near-free if **F-027**
(shared card package) is done, and it strengthens the case for it.

---

## `Electron16ReWrite` — already merged, delete

**Tip:** `84d60bf` "Added HDR type" (2022-02-12)
**0 unique commits · 203 commits behind master · `git diff master...` is empty**

The branch tip is an **ancestor of `master`**. This was the Vue 2 → Vue 3 / Electron 12 → 16
migration that shipped as v1.2.0 (2022-04-18); it was merged and the branch pointer was never
deleted. The HDR card it added is in `master` today (`src/components/TestCard/HDR.vue`).

**Recommendation: delete the remote branch.** Zero risk — every commit is already in `master`.
It is currently the most misleading thing in the repository: the name implies unfinished
modernisation work, and the brief's hypothesis that Electron was "several major versions behind
with the security posture of its era" was partly shaped by branch names like this one.

---

## `hotfix/macclosewindowbug` — already merged, delete

**Tip:** `3d9c8a8` "Better handling of screen refresh rate" (2024-04-03)
**0 unique commits · 18 commits behind master · `git diff master...` is empty**

Also an ancestor of `master` — it sits immediately before `41aa0f4` "1.3.1 Release - fix mac
gatekeeper". This was the fix for closed issue #103 / the "fullscreen Kards on Macs with
*Displays have separate Spaces* not set could not be closed" bug named in the v1.3.1 release
notes, plus the `displayFrequency` 59→59.94 / 29→29.97 rounding workaround now living at
`windows.js:106-114`.

**Recommendation: delete the remote branch.** Fully merged, zero risk.

Worth noting for `07-plan.md`: the code this branch produced — the macOS `simpleFullscreen` /
separate-Spaces branching at `windows.js:205-235` — is now 2019-era version-sniffing
(`version[0] > 10` to detect Catalina) on a codebase whose minimum macOS will be 12 after the
Electron bump. Two of its three branches are dead. It should be simplified, but **carefully**,
because it exists to fix a bug that deleted people's ability to close a full-screen card.

---

## `dependabot/npm_and_yarn/axios-1.8.2` — close, do not merge

**Tip:** `3efa3fb` "Bump axios from 0.27.2 to 1.8.2" (2025-03-07)
**1 unique commit · 1 behind master · `package.json` + `yarn.lock` (+16 / −10)**

**Conflict risk: certain.** It patches `yarn.lock`, which `feature/modernise` deleted
(`636c57d`).

**It is also stale on the merits.** axios 1.8.2 (March 2025) has itself accumulated advisories
since; current is **1.19.0**. And there is a better answer: axios is used at **exactly one call
site** — a single `GET` to a fixed `api.github.com` URL in `updateChecker.js:14`. Replacing it
with `fetch()` removes a dependency and ~40 advisories in one commit
(`03-dependency-audit.md` §4).

**Recommendation: close the dependabot PR with a note pointing at the axios decision.** Then
either drop axios entirely (recommended) or go straight to 1.19.0 as part of step ③ in the
upgrade ordering.

Also worth doing: dependabot is clearly still enabled and still targeting `yarn.lock` on `master`.
Once `feature/modernise` lands, add a `.github/dependabot.yml` that targets npm and groups
updates — otherwise the next two years produce another pile of unmergeable single-package PRs.
There is currently **no `.github/` directory at all** (F-022).

---

## `dependabot/npm_and_yarn/follow-redirects-1.15.9` — close, do not merge

**Tip:** `ba0ac1c` "Bump follow-redirects from 1.15.1 to 1.15.9" (2025-01-19)
**1 unique commit · 3 behind master · `yarn.lock` only (+3 / −3)**

`follow-redirects` is transitive under axios. Same `yarn.lock` conflict, and the whole subtree
disappears when axios is upgraded or removed.

**Recommendation: close the PR.** Resolved by the axios decision above.

---

## What the branch graph says

Six branches; **two are already-merged pointers nobody deleted**, two are dependabot PRs against a
lockfile that no longer exists, one is an abandoned 2023 experiment, and one is the entire
modernisation sitting unreleased for six months.

That is a good picture of the project's actual state, and it is better than the brief assumed.
The work is not scattered across half-finished attempts — it is concentrated in one branch that is
roughly 85% done and has never been merged or released. **The gap is release process, not
engineering effort.** That observation drives the recommendation in `07-plan.md` §8a.

**Suggested branch hygiene, in order:**

1. `git push origin --delete Electron16ReWrite hotfix/macclosewindowbug` — zero risk, both fully merged.
2. Close both dependabot PRs with a comment explaining the yarn → npm move.
3. Cherry-pick `3948005` onto `feature/modernise`.
4. Land F-011, F-004's `mergeDeep` guard, and the F-022 pixel harness on `feature/modernise`.
5. Merge `feature/modernise` → `master`. **Release nothing yet** — F-003 (signing) comes first.
6. `git push origin --delete feature/previewwindow` once the preview feature is on the roadmap
   under its own ticket, with `previewStyle` and the toggle-placement notes copied into it.
