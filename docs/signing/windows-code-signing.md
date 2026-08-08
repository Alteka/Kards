# Windows code signing — a plain-English guide

**For:** Matt.
**Decision needed:** eventually, not now — you deferred this to the end of the project (Q1b).
**Written:** 2026-08-08.

This is the "explain it simply" version. No prior knowledge of Windows signing assumed.

---

## 1. What signing actually does

When someone downloads `Kards-1.4.0-win-x64.exe` and runs it, Windows asks two questions:

1. **Who made this?** — answered by a code-signing certificate embedded in the `.exe`.
2. **Do we trust them?** — answered by **SmartScreen**, Microsoft's reputation system.

Right now the answer to (1) is "nobody knows", so (2) is automatically "no". Users get a blue
full-screen warning saying *"Windows protected your PC"*, with the **Run anyway** button hidden
behind a **More info** link that most people never click.

**The bit that matters most:** an unsigned app accrues **no reputation, ever**. It is not a
"first release is bumpy then it settles" situation — every release, forever, gets the same
warning. Signing is what starts the clock.

---

## 2. Why this is worth revisiting now

Two things changed since you last priced it.

**The cost collapsed.** In 2023 Microsoft required OV certificates to be stored on physical
hardware tokens. That meant ~£300–500/year *plus* a USB dongle that had to be plugged into
whatever machine did the signing — so you could not sign automatically in CI. Now
**Azure Trusted Signing costs about $10/month**, has no hardware token, and runs on a normal
GitHub Actions runner.

**Windows is a bigger share of your users than we thought.** The review found something automated
pulling all three macOS `.pkg` files ~100 times a day each, and never touching the `.exe`.
Correcting for it:

| | Reported | Actually |
|---|---|---|
| macOS | 81,199 (81%) | ~21,900 (54%) |
| Windows | 18,835 (19%) | ~18,800 (**46%**) |

So "everyone's on Mac, skip Windows" was based on a number that isn't real. It's closer to a
50/50 product.

---

## 3. Your options

### Option A — Azure Trusted Signing · ~$10/month · **recommended**

Microsoft holds the key in their own HSM. You authenticate a GitHub Actions job to Azure, and it
signs your builds. No dongle, no key on anyone's laptop, nothing to lose.

- ✅ Cheapest real option
- ✅ Works unattended in CI
- ✅ Nothing to physically look after
- ⚠️ SmartScreen reputation still builds over the first few releases — better than never, not
  instant
- ⚠️ **Eligibility:** your organisation needs 3+ years of verifiable legal history. Alteka should
  qualify comfortably. Worth checking before you plan around it.

### Option B — EV certificate · ~£300–600/year

- ✅ **Instant SmartScreen trust** — no reputation-building period at all
- ❌ 3–6× the cost, every year
- ❌ Usually a hardware token or a separate cloud service, i.e. more setup

Worth it only if the very first release must be completely clean for Windows users on day one.

### Option C — Do nothing · free

- ✅ Free
- ❌ Permanent warnings for ~46% of your users
- ❌ You can never verify your own downloads either

### Option D — Standard OV certificate · ~£200–400/year

The old default. Since 2023 it requires HSM-backed keys anyway, so it's Option A with worse
economics. **No reason to choose this now.**

---

## 4. Your question: what happens if we stop paying?

**Nothing happens to anything you've already signed.** This is the important bit and it makes the
decision low-risk.

Signatures are **timestamped** (RFC 3161). When Windows checks a signature it asks *"was this
certificate valid at the moment it signed this file?"* — not *"is it valid today?"* So a build
signed in 2027 still validates in 2035, whether or not you're still paying.

If you cancel:

- ✅ Every installer already out in the world keeps working, indefinitely
- ✅ Users already running Kards are completely unaffected
- ❌ You can't sign **new** releases until you resume
- ⚠️ If you later resume with a **different** certificate identity, SmartScreen reputation starts
  again from zero. Continuity has value beyond the signature itself.

The one thing that *would* break already-shipped builds is **revocation** — a certificate being
actively cancelled for cause, e.g. if it were used to sign malware. Simply not renewing is not
revocation.

So what you're committing to is *"can we sign the next release"*, not *"will v1.4.0 keep
working"*. Deferring is genuinely cheap.

---

## 5. What signing does *not* fix

Being straight about the limits:

- **Antivirus false positives.** Electron installers occasionally get flagged by Defender or
  third-party AV regardless. Signing reduces this; it doesn't eliminate it.
- **The first few downloads.** With Option A, expect some SmartScreen friction until reputation
  builds. Roughly a few hundred to a few thousand installs, or a couple of releases.
- **macOS.** Entirely separate — see `apple-certificates.md`. That's the urgent one.
- **WinGet.** You already have a package (`AltekaSolutions.Kards`), and WinGet checks a SHA-256
  hash from its manifest, so that route is already tamper-evident. But it still runs the same
  unsigned `.exe`, so SmartScreen still fires.

---

## 6. What setting it up involves

Roughly a day of work once the account exists, mostly mine:

1. **You:** create an Azure account if there isn't one, and subscribe to Trusted Signing.
2. **You:** complete identity validation — Microsoft verifies Alteka is a real company. This is
   the slow bit; allow a few days to a couple of weeks, and it's waiting rather than working.
3. **You:** create a signing account and certificate profile in the Azure portal.
4. **Me:** add the Azure credentials as GitHub Actions secrets, wire the signing step into the
   release workflow, and verify the output with `Get-AuthenticodeSignature`.
5. **Me:** add a build check that fails the release if the `.exe` comes out unsigned — the same
   guard we're adding on the macOS side, and the one whose absence let the Apple mistake survive
   four years.

Nothing here needs a Mac, a dongle, or anything plugged into your laptop.

---

## 7. Recommendation

**Take Option A when you get to the end of the project.** ~$120/year against ~18,800 Windows
users is about £0.005 per user, and the objection that killed it last time — cost plus a hardware
token that made CI impossible — no longer applies.

**But it stays second in the queue.** macOS is where users are actively blocked and telling each
other the app is malware. Windows users get an annoying warning they can click through. Do Apple
first.

**One thing worth doing now, while it's free:** check the Azure Trusted Signing eligibility
requirement against Alteka's registration date. If the company is younger than 3 years, or the
verifiable-history check is awkward for some reason, better to find out now than in month six.

---

## 8. Caveat

Pricing, tiers and eligibility rules for Azure Trusted Signing change, and the figures here are
as understood in **August 2026**. Confirm current terms on Microsoft's own pages before
committing. The structural points — timestamping means old signatures survive, unsigned means no
reputation ever, EV skips the reputation period — are stable and won't have changed.
