# DRAFT — status update for issue #110 (flagged as potential malware)

**Status: not posted.** Written 2026-08-08. For a maintainer to review, edit and post. Everything
between the horizontal rules is the comment body; the notes below it are internal.

Context: #110 opened 2024-10-18 by `mwpastore`, five comments, still open after 22 months. Three
users confirmed it independently across Universal, Apple Silicon and Intel packages. One said
"I'd like to use this software, but can't right now." The standing answer in the thread is a
`sudo installer` workaround. This is the highest-priority open issue in the tracker.

**Two paragraphs of this draft make a public admission of the root cause. That is a judgement
call and it is flagged in the notes below — read them before posting.**

---

Apologies for the long silence on this. Here is a straight answer, including what actually caused
it, because the guesses in this thread are close but not quite right.

**What was wrong.** Two separate things, and neither was an expired account:

1. **The installer was never signed or notarised.** All three v1.3.1 `.pkg` files — and v1.2.0
   before them — contain no installer signature and no stapled notarisation ticket. For a `.pkg`
   downloaded from the internet, Gatekeeper evaluates the *package*, so this is exactly the dialog
   you all saw.
2. **The app inside it was signed with the wrong kind of certificate** — a development certificate
   rather than a Developer ID one. A development certificate is scoped to our own machines by
   design and cannot satisfy Gatekeeper on anyone else's Mac.

The second one is the reason this went unnoticed for so long: the build succeeded, produced a
signed-looking app, and gave no indication anything was wrong. It only fails on someone else's
machine.

So the account had not expired — the build was selecting the wrong identity, silently, and nothing
checked.

**What's being done.** v1.4.0 fixes it properly:

- Developer ID Application **and** Developer ID Installer certificates, with the signing identity
  set explicitly in the build configuration rather than auto-selected from whatever is in a
  keychain.
- Hardened runtime and entitlements, notarisation via `notarytool`, and the ticket **stapled** so
  the installer validates without a network round-trip.
- A preflight check that **fails the build** if the resolved identity is not a Developer ID
  Application certificate. That guard is the thing whose absence caused this, and it matters more
  than the fix itself — it is what stops this recurring quietly in two years' time.
- The whole sequence is scripted and committed rather than living in someone's shell history, and
  written up in a release document.

**Please stop using the `sudo installer` workaround** once the fixed release is out. Bypassing
Gatekeeper with `sudo` on the strength of a comment from a stranger on the internet is not
something we want to be the standing answer, and we're sorry it has been for this long.

**One thing to flag honestly: v1.4.0 raises the minimum to macOS 12.** Getting onto a supported
Electron release — the current one is several years newer than what v1.3.1 shipped — moves the
floor up from macOS 11. If you're on Big Sur or older, v1.4.0 won't be for you, and we'd rather
say that here than have you find out from an installer. That is a deliberate choice: the build
you'd otherwise be offered is the unsigned one that doesn't run anyway.

**Before the full release there will be a signed pre-release** so the signing chain is validated
on real Macs rather than only in theory. If any of you would be willing to try it and report back,
that would genuinely help — you are the people who can confirm the fix, and none of us can
reproduce your original failure on the machine this work is happening on.

Leaving this open until a signed, notarised, stapled build is out and confirmed working by someone
other than us.

---

## Notes for the maintainer — do not post

- **The admission is the judgement call.** The body publicly states that the app was signed with a
  development certificate. Arguments for saying it: it is already public — the
  `autopkg/dataJAR-recipes` recipe for Kards contains the requirement string
  `certificate leaf[subject.CN] = "Apple Development: Drew Perry (D4H96T8MEW)"`, read off a real
  shipped package by a third party in Feb 2025. It is discoverable by anyone who looks, so denying
  or vaguing it costs more credibility than owning it. Arguments against: it names a specific
  failure and the recipe names a person. **The draft deliberately does not name anyone** and
  frames it as a build-configuration fault, which it is. Cut both paragraphs down to "the
  installer was never signed or notarised" if you would rather not go into it — the rest of the
  comment still stands on its own.
- **No date is promised anywhere**, deliberately. B2 (first signed build) depends on an Apple
  developer's availability, not only on engineering time.
- **The beta invitation is worth keeping.** The signing chain genuinely cannot be validated from a
  Windows machine, and these three people are self-selected volunteers who have already said they
  want to use the software. It converts a 22-month-old complaint thread into a test group. Note
  that GitHub pre-releases are excluded from `/releases/latest`, so a beta will not notify the
  existing install base — it is opt-in by construction.
- **The macOS 12 paragraph will disappoint someone.** Include it anyway. It belongs in the release
  notes too, not as a footnote.
- Consider posting the companion #41 update at the same time; see `issue-41-ndi-status.md` in this
  directory.

## Separate, and not part of this comment

- **dataJAR need a heads-up.** Their AutoPkg recipe pins the old development-certificate
  requirement string and **will fail** the moment a correctly signed build ships. They distribute
  Kards to managed Mac fleets, so they find out either from us or from a broken recipe.
  `github.com/autopkg/dataJAR-recipes/tree/main/Kards`
- **`Event-Engineering/ProjectReady`** hard-codes `Kards-1.3.1-mac-apple-silicon.pkg` and breaks
  on v1.4.0. Internal, but it breaks on the same day.

## Where the facts come from

- `docs/review/02-build-baseline.md` §4a — xar TOC of all three v1.3.1 `.pkg` assets and v1.2.0 as
  a control: zero `<signature>`, zero `<X509Certificate>`, no stapled ticket
- `docs/review/04-findings.md` → F-003
- `docs/review/05-issue-triage.md` → #110
- `docs/review/questions.md` → Q1, including the certificate identity resolved from the dataJAR
  recipe
- `docs/review/09-kickoff.md` §5 Phase B (B1–B3) and §7
