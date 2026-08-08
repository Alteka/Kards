# Session prompts

Copy-paste prompts for starting Claude Code sessions on this repo.
**§1** is for the very next session. **§2** is the reusable one for every session after that.

---

## 1. Next session — start here

> Read `docs/review/09-kickoff.md` in full, then `docs/review/questions.md` (the DECISIONS table
> at the top only). Do not read the other review documents yet — look things up in them on demand.
>
> The review phase is finished and read-only no longer applies. You are implementing.
> Scope is settled: **one release, v1.4.0, everything brought current including Electron 43** —
> `09-kickoff.md` §2 explains why and what it costs.
>
> This session, do **Phase A** from `09-kickoff.md` §5, in order:
>
> - **A1** — park NDI on `feature/ndi`, including the uncommitted `package.json` /
>   `package-lock.json` changes. Make `getNdiStatus` report `available: false` on the release line.
>   Draft a status update for issue #41 but do not post it.
> - **A2** — cherry-pick `3948005` from master onto `feature/modernise` (diagonal grid lines —
>   we're currently missing it and would silently revert a shipped feature). Add
>   `.github/dependabot.yml`. Prepare the branch deletions and dependabot PR closures but **do not
>   execute them** — show me the commands first.
> - **A3** — build the pixel harness per `09-kickoff.md` §6. **Its day-one validation is the
>   gate:** it must reproduce `235,235,235` for 100% white and detect that 75% yellow is currently
>   `180,180,0` rather than `180,180,16`. If it cannot do both, stop and tell me — do not carry on
>   to A4.
> - **A4** — only if A3 is green: the levels fixes F1, F2, F3.
>
> Ground rules are in `09-kickoff.md` §4. The ones that matter most: one concern per commit with a
> real message; ask me before anything outward-facing (deleting branches, closing PRs/issues,
> pushing to master, publishing anything); never commit certificates or `env.json`.
>
> Work in `feature/modernise`. Commit as you go rather than in one lump at the end. Append what
> you did to `docs/review/progress.md` before you run low on context.

---

## 2. Reusable — every session after that

> Read `docs/review/09-kickoff.md` and the tail of `docs/review/progress.md` (the revision records
> and handover notes). Those two tell you where we are. Everything else in `docs/review/` is
> reference — look things up on demand rather than reading them through.
>
> We are implementing **v1.4.0**: one release, everything brought current. The work order is
> `09-kickoff.md` §5, phases A→D. Check `progress.md` for what is already done, then continue from
> the first unfinished item.
>
> Non-negotiables:
> - **The pixel harness gates every change that can affect output.** Run it either side of any
>   commit touching levels, DPI, Electron version or colour management, and record what moved in
>   the commit message. This replaces staged releases as the bisection mechanism.
> - **Don't touch `src/components/TestCard/` without a failing pixel test and a specific reason.**
> - **Ask before anything outward-facing** — remote branch deletions, closing PRs or issues,
>   pushing to `master`, force-pushing, publishing a release, opening WinGet or Homebrew PRs.
> - **Never commit certificates, `.p12` files, API keys or `env.json`.**
> - One concern per commit, real commit messages.
>
> This machine is Windows, so you cannot build, sign, notarise or test macOS locally — GitHub
> Actions is the only route to a macOS artifact, and final acceptance needs a human with a Mac.
> Say so rather than assuming CI green means working.
>
> Append what you did to `docs/review/progress.md` before you run low on context.

---

## 3. Variants for specific situations

**If certificates have arrived and you want to unblock the release pipeline:**

> As §2, but this session do **Phase B** from `09-kickoff.md` §5 — release CI first (it's the only
> way to produce a macOS build from this machine), then macOS signing and notarisation. The Apple
> credentials are in GitHub Actions secrets; tell me exactly which secret names you need and I'll
> confirm they're set. Expect several push-and-wait iterations on the macOS runner.

**If you want to check progress without starting new work:**

> Read `docs/review/09-kickoff.md` §5 and §7, and the tail of `docs/review/progress.md`. Tell me
> what's done, what's next, and anything that has drifted from the plan or turned out harder than
> estimated. Don't start any work.

**If something in the review turns out to be wrong:**

> Don't edit the finding to match reality. Add a dated note to `docs/review/progress.md` saying
> what the finding claimed, what you actually found, and the evidence. The review documents are a
> record of what was believed and why — keeping them honest matters more than keeping them tidy.

---

## 4. Notes on writing these

If you're editing these prompts later, the things that make them work:

- **Naming what *not* to read** matters as much as what to read. `04-findings.md` is 11k words;
  a session that reads it front to back has burned a third of its context before doing anything.
- **The A3 gate is deliberately phrased as a stop condition.** "Validate the harness" invites a
  session to declare success; "it must detect F-001 or stop and tell me" doesn't.
- **"Ask before anything outward-facing"** is listed with examples because the general principle
  gets interpreted loosely without them.
- **The Windows/macOS constraint** is repeated in every prompt because it's the single most
  consequential fact about who can do what, and it isn't obvious from the repo.
