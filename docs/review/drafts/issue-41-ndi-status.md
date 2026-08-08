# DRAFT — status update for issue #41 (NDI output)

**Status: not posted.** Written 2026-08-08 during implementation task A1. For a maintainer to
review, edit and post. Everything between the horizontal rules is the comment body; the notes
below it are internal.

Context: #41 opened 2021-01-08, nine comments, the oldest and most-requested item in the tracker.
Includes an unmet "give me a week or so" from 2021.

---

Five years on, this deserves a straight answer rather than another "soon".

**Where it actually got to.** NDI output is written and, as far as the code goes, complete: the
card renders in a hidden window, frames are captured at 25 fps and pushed out over NDI, with the
native NDI binding running in a separate process specifically so it can't take the app down —
which was the problem that stalled this back in 2021.

**Why it isn't in the next release.** The implementation depends on `grandiose`, a native NDI
binding installed straight from a git repository, which has to be compiled against the NDI SDK at
install time. On a machine without the SDK the install quietly skips it — and the app then reports
NDI as available when it isn't. That's worse than not shipping it: you'd get a five-year-awaited
feature that silently does nothing, with no error anywhere you'd look. It also can't be built
reproducibly on a clean build machine, which matters because the next release is the one that
fixes the macOS signing problem (#110), and that fix depends on a reliable build.

So NDI is parked on a branch (`feature/ndi`) with the work intact, and the release will report NDI
as unavailable rather than pretending otherwise.

**What has to happen before it ships.** A packaging route for the NDI binding that doesn't need
every build machine to compile it — most likely publishing a fork with prebuilt binaries per
platform. There's also an NDI SDK redistribution-terms question to settle against this project's
GPL-3.0 licence before shipping the NDI library inside a signed bundle. Neither is exotic; both
are real work, and neither should hold up the signing fix that a much larger group of people is
currently blocked on.

**What's coming first.** v1.4.0 fixes the macOS "damaged / can't be opened" problem — properly
signed, notarised and stapled installers — along with the update-notification failure, the colour
bar and ramp level errors, and a general bring-up of the app to current versions.

I'm leaving this issue open. It isn't done, and closing it would misrepresent that.

---

## Notes for the maintainer — do not post

- **Tone is deliberately plain.** Nine comments over five years including an unmet estimate. Another
  optimistic estimate would not land well. There is no date or version commitment anywhere in the
  body; add one only if you want to be held to it.
- **"as far as the code goes" is doing deliberate work.** The first draft said the implementation
  "works". Nobody has seen it send a frame — `grandiose` will not install on the Windows machine
  the review and implementation ran on, which is the entire problem. That claim rested on reading
  the code, not running it. If someone builds the branch and it doesn't run, the original sentence
  is the one they would have quoted back. Strengthen it only if someone has actually seen it work.
- `feature/ndi` is public as of 2026-08-08, so naming it is accurate. Drop the mention if you would
  rather not point at it — nothing else in the body depends on that sentence.
- Consider posting the companion #110 update at the same time; see
  `issue-110-signing-status.md` in this directory. Most people watching #41 are watching #110 too,
  and the two updates answer each other.

## Where the facts come from

- `docs/review/04-findings.md` → F-011 (grandiose cannot install reproducibly)
- `docs/review/05-issue-triage.md` → #41
- `docs/review/questions.md` → Q4 (decision to park NDI)
- Commit `87b7181` (removal from the release line), `f565670` (the branch)
