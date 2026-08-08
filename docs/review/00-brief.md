# Alteka Kards — Critical Review & Modernisation Brief

> **How to use this:** save this file into the repo (e.g. `docs/review/00-brief.md`), then start Claude Code in the repo root and paste:
>
> `Read docs/review/00-brief.md in full, then begin at Phase 0. Follow the ground rules exactly — especially the question protocol and the read-only rule.`

---

## 1. Context

Alteka Kards is a cross-platform test card generator for AV technicians, built on Electron with a Vue-driven renderer. It has roughly 100,000 installs across macOS, Windows and Linux. It has been effectively unmaintained for about two years, aside from a couple of partially-updated branches in Git.

Two things follow from that, and they should colour every judgement you make:

1. **There is a real, large, silent user base.** Nobody is watching a dashboard. Regressions will surface as one-star reviews and abandoned installs, not as bug reports. Preserving existing behaviour, saved settings and user expectations is a first-class requirement, not an afterthought.
2. **The output correctness of this app is its entire value proposition.** It generates reference test patterns at specific levels (e.g. 100% white as 235,235,235). Anything in the stack that can silently alter rendered pixel values — Chromium colour management, display profile handling, GPU compositing, scaling, HDR paths, canvas colour spaces — is a correctness bug, not a cosmetic one. Treat it with the severity you'd give a data-corruption bug.

## 2. Objective

Produce an evidence-based critical review of the codebase and a costed, sequenced plan to bring it back to a maintainable, shippable, modern state — covering the modernisation work, the bugs you find, the bugs already logged as GitHub Issues, and anything else you judge worth doing.

**This pass produces documents, not code.** See the read-only rule below.

## 3. Ground rules

### Autonomy and questions
- Do the bulk of this review **without asking me anything**. You have the repo, the Git history, the issue tracker and the internet. Use them.
- When you hit something genuinely uncertain, **write it to `docs/review/questions.md` and carry on** with the rest of the work. Do not stop. Do not ask me in the moment.
- You may interrupt me at **exactly two checkpoints**: after Phase 1 (only if the app cannot be built or run at all and that blocks everything downstream), and at the end of Phase 7. Batch everything you have at those points.
- Every question must come with: what it blocks, the realistic options, and **your recommended default**. I should be able to reply "go with your defaults" and have you proceed sensibly. Questions I can't answer without doing my own research aren't useful — do the research first, then ask me the decision.

### Read-only
- **Do not modify, refactor or "quickly fix" any application code, config or dependency during this review.** Not even obvious one-liners. The only files you create or edit are under `docs/review/`.
- Do not run installs or builds that mutate lockfiles. If a build attempt would rewrite `yarn.lock` / `package-lock.json`, work on a scratch copy outside the repo, or `git stash`/restore afterwards and note that you did.
- Do not push, do not open PRs, do not comment on or close GitHub Issues.
- Record proposed fixes as written recommendations with file paths and line numbers. Implementation is a later, separately-approved phase.

### Evidence
- Every finding cites concrete evidence: `path/to/file.js:120-134`, a commit SHA, an issue number, a build log excerpt, or a linked upstream changelog/CVE.
- Separate **observed** from **inferred**. If you haven't reproduced it, say so and label the confidence.
- No speculative findings. "This might be slow" is not a finding; "this redraws the full canvas on every mousemove, `src/components/Card.vue:88`" is.
- Where you rely on my framing in Section 1 (stack, install count, dormancy), verify it against the repo. If I'm wrong, say so plainly in the summary.

### Context hygiene
This is a long job that will outlive your context window. Work so that it survives compaction:
- Maintain `docs/review/progress.md` as a running state file: phases completed, key facts established, current phase, next action, open threads.
- At the end of each phase, write that phase's deliverable to disk **before** moving on. Never hold a phase's findings only in context.
- Assume you may be `/clear`ed between phases. `progress.md` plus the completed deliverables must be enough for a fresh session to pick up cleanly.
- If you notice context filling, finish the current phase, write it out, and say explicitly: "Phase N complete and written to disk — safe to clear before Phase N+1."

## 4. Starting hypotheses — verify, do not assume

Treat these as leads to check, not established fact. Correct them in your write-up where they're wrong.

- Electron is likely several major versions behind current, with the security posture (`contextIsolation`, `nodeIntegration`, `sandbox`, preload surface, CSP) of its era.
- Vue 2 reached end of life in December 2023. `vue-cli` and `vue-cli-plugin-electron-builder` are effectively unmaintained; the modern path is Vite-based (`electron-vite`, or Electron Forge with the Vite plugin).
- Node 16 is long past EOL. The build almost certainly won't run on a current Node without pinning.
- Code signing is probably broken: macOS notarisation moved from `altool` to `notarytool`, and Windows now requires hardware/HSM-backed signing. Certificates from two years ago will have expired.
- Auto-update (likely `electron-updater`) may be pointing at a feed that still works — or may be silently failing for 100k installs. Establish which.
- Chromium's colour management, canvas colour space handling and HDR behaviour have all moved. This is the highest-risk area for silent output drift.
- There is a web build ("Kards Online"). Determine whether it shares this codebase, and whether that constrains the modernisation path.

## 5. Deliverables

All under `docs/review/`. Write them as you go, not at the end.

| File | Contents |
|---|---|
| `progress.md` | Running state file (see Context hygiene) |
| `01-current-state.md` | What the app is, architecture map, module/data-flow overview, actual stack and versions, how to build and run it *today*, what's dead code |
| `02-build-baseline.md` | Verbatim account of trying to build and run on a current machine: what worked, what failed, exact errors, what pinning was needed |
| `03-dependency-audit.md` | Full table: package → current → latest → EOL/maintenance status → known CVEs → breaking changes on the upgrade path → risk → effort. Flag anything unmaintained or with no viable successor |
| `04-findings.md` | Numbered findings `F-001`… (see rubric) |
| `05-issue-triage.md` | Every open GitHub Issue, triaged and cross-referenced to findings |
| `06-branch-reconciliation.md` | What's in the stale branches, what's salvageable, merge/cherry-pick/abandon recommendation per branch |
| `07-plan.md` | The sequenced modernisation and fix plan |
| `08-summary.md` | Executive summary, written last, standalone, one page |
| `questions.md` | Batched open questions for me |

## 6. Phases

### Phase 0 — Orientation
Read the README, `package.json`, build config, CI config, licence, and any docs. Read the Git log properly: release cadence, who contributed, when things stopped, what the last few commits were doing. Read the GitHub Releases notes — they document past migrations and past pain. Establish what the app actually does, feature by feature, and which features are load-bearing for AV professionals.

### Phase 1 — Build baseline
Try to build and run it as-is on a current machine. Document exactly what breaks and why. Do not fix anything yet — the failure modes are themselves findings, and the delta between "builds after pinning Node 16" and "builds on Node 22" is the shape of the modernisation job. If it cannot be made to run at all, that is your one early checkpoint.

### Phase 2 — Architecture and code quality
Main/renderer split and IPC surface. State management. Component structure. Where the test-card rendering actually happens and how. Coupling, duplication, dead code, files nobody should have to read. Error handling and logging (or absence of). Tests: what exists, what it covers, whether it runs. Linting/formatting/type safety. Accessibility and i18n if relevant. Performance hot paths, particularly anything running per-frame or per-display.

### Phase 3 — Platform, dependency and toolchain audit
The full dependency table. Runtime and framework upgrade paths, with the migration cost of each major version step. Build toolchain viability. Per-platform concerns: macOS (Apple silicon, universal binaries, hardened runtime, notarisation, current OS support), Windows (signing, installer, Defender/SmartScreen reputation), Linux (packaging formats, Raspberry Pi if still claimed). Auto-update integrity end to end. Minimum supported OS versions, then and now.

### Phase 4 — Output correctness
Given Section 1, this gets its own phase. Trace how a card gets from source definition to pixels on a display. Identify every point where the OS, GPU, Chromium or display profile can alter the intended values. Determine whether Electron/Chromium upgrades will change rendered output, and whether there's any way to verify output levels automatically (screenshot capture and pixel assertion in CI is worth costing). Also cover multi-display selection, fullscreen behaviour, scaling/DPI, and the audio paths (tone generation, sync tests, TTS) — those APIs have moved too.

### Phase 5 — Security and privacy
Secrets in the working tree **and in Git history**. Electron hardening posture against current best practice. CSP. Any remote content loaded. Update channel integrity. Telemetry and what it collects. Local data storage and settings persistence. Dependency CVEs with realistic exploitability in a desktop context — do not pad this section with `npm audit` noise that can't be reached from user input. Licence compliance across the dependency tree.

### Phase 6 — Issue triage
Pull the GitHub Issues (`gh issue list --repo <owner>/<repo> --state all --limit 500 --json number,title,body,labels,state,createdAt,comments`). `gh` is authenticated on this machine; if it fails anyway, fall back to the REST API rather than stopping to ask.

For each open issue: summarise, attempt to locate the responsible code, attempt reproduction where feasible, and classify as **confirmed / not reproducible / already fixed / stale / needs info / won't fix**, with a proposed disposition. Cross-reference to your own findings — expect overlap, and expect some issues to be symptoms of a single root cause. Note recurring themes across closed issues too; they tell you where the architecture is weak.

### Phase 7 — Branch reconciliation
For each non-default branch: what it was trying to do, how far it got, whether it still applies after modernisation, and whether to merge, cherry-pick specific commits, or abandon. Include the diff size and conflict risk against the default branch.

### Phase 8 — Synthesis
Write `07-plan.md` and then `08-summary.md`.

The plan must be **sequenced and honest about dependencies between steps** — you cannot upgrade Electron and Vue and the build toolchain independently, and the plan should make that ordering explicit. Structure it as:

- **Stabilise** — get it building and shipping again on current toolchains, no behaviour change, signed and notarised. The goal is a release you could ship tomorrow that changes nothing users can see.
- **Modernise** — framework and platform upgrades, with output-correctness verification gating each step.
- **Fix** — bugs from findings and issues, prioritised.
- **Improve** — tests, CI, contributor experience, anything that makes the next two-year gap less painful.
- **Consider** — things worth evaluating but not obviously worth doing.

Each item: effort estimate, risk, user-visible impact, and what it unblocks. Call out explicitly anything you'd advise **against** doing, and why — that's often the most valuable part.

### 8a — Migrate or rebuild

A rewrite is genuinely on the table, so don't bury this in a caveat. Produce a **like-for-like comparison** as a distinct section of `07-plan.md`, costed on the same basis so the two paths are actually comparable:

- **Incremental migration** — the Stabilise/Modernise sequence above, with its total effort, the riskiest steps, and an honest note on how much of the existing code survives in practice. Watch for the failure mode where step-by-step migration quietly becomes a rewrite anyway, just slower and without a clean target.
- **Rebuild** — what a from-scratch version on a current stack would look like: scope needed to reach feature parity, what genuinely carries over (card definitions, colour maths, assets, the accumulated knowledge in the issue history), effort, and how you'd de-risk shipping it to an existing 100k-install base — including settings migration and whether both could ship in parallel for a period.

Make a recommendation and commit to it. State the two or three facts that would flip your answer, so the decision is re-checkable rather than a matter of taste. Bear in mind the argument cuts both ways here: the app's surface area is small and its behaviour well-specified, which lowers rewrite cost — but its value is precise output correctness, and a rewrite puts that back on the table for every card.

## 7. Rubrics

**Finding format:**

```
### F-001 — <short title>
Severity: Critical | High | Medium | Low
Confidence: Observed | Reproduced | Inferred
Category: Correctness | Security | Compatibility | Maintainability | Performance | UX | Build/Release
Effort: S (<0.5d) | M (0.5–2d) | L (2–5d) | XL (>5d)
Evidence: <file:line, commit, log, or issue ref>
Description: <what's wrong>
Impact: <what it means for users or maintainers>
Recommendation: <what to do, specifically>
Related: <issue numbers, other findings>
```

**Severity:**
- **Critical** — incorrect test card output, security vulnerability reachable in normal use, app won't run on a currently-supported OS, or updates are broken for existing installs.
- **High** — a core feature is broken or unreliable; the project cannot be built or released.
- **Medium** — degraded experience, meaningful maintenance burden, or a blocker to modernisation.
- **Low** — cosmetic, cleanup, nice-to-have.

Rank by severity within each file, not by discovery order.

## 8. Question protocol

`questions.md` format, one entry each:

```
### Q1 — <question>
Blocks: <what work is held up, or "nothing — answer at your convenience">
Options:
  A. <option> — <consequence>
  B. <option> — <consequence>
Recommendation: <your pick and why>
```

Sort by what actually blocks work. If a question only affects presentation or a low-severity item, mark it non-blocking and proceed on your default. I would much rather review fifteen good questions once than be pinged fifteen times.

## 9. Definition of done

- All nine files exist under `docs/review/`, each readable on its own.
- Every finding has evidence with a file path or reference.
- Every open GitHub Issue appears in the triage with a disposition.
- Every branch appears in the reconciliation with a recommendation.
- The plan is sequenced, with dependencies between steps made explicit.
- `08-summary.md` is one page, stands alone, and leads with the three things that matter most.
- No application code, config or lockfile has been modified. `git status` is clean apart from `docs/review/`.
