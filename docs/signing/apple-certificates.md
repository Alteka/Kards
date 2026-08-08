# Apple code signing for Kards — what we need, and why

**For:** whoever administers the Apple Developer Program account (Team ID **D4H96T8MEW**).
**From:** the Kards maintainers.
**Ask:** create two certificates, then run the release build on your Mac. Roughly 30–60 minutes of
portal work, plus one build.
**Written:** 2026-08-08. **Revised:** 2026-08-08 — you will be building releases locally, so the
certificates never leave your machine and there is nothing to export or send.

You do not need to know anything about Kards to action this. Section 1 is the problem, section 3
is the actual to-do list.

---

## 1. The problem, in one paragraph

Kards is a free macOS/Windows app distributed as a `.pkg` outside the App Store. Since at least
2022 it has been signed with the **wrong type of certificate** — an *Apple Development*
certificate rather than a *Developer ID Application* certificate — and the installer package has
never been signed or notarised at all. The result is that macOS refuses to run it and tells users
it may be malware. Three users have reported this publicly and said they could not use the
software; one earlier occurrence caused macOS to **delete the installed app**. This has been
unresolved for 22 months.

---

## 2. Evidence

Not a guess. Here is how we know.

**The installer is unsigned.** A `.pkg` is a `xar` archive; a `productsign`-signed package stores
its signature and certificate chain in the archive's table of contents, which is what
`pkgutil --check-signature` reads. We fetched and parsed the TOC of every published package:

```
Kards-1.3.1-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-apple-silicon.pkg   <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.3.1-mac-intel.pkg           <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
Kards-1.2.0-mac-universal.pkg       <signature>: 0   <X509Certificate>: 0   <KeyInfo>: false
```

No signature elements, no certificates, and no stapled notarisation ticket anywhere in the
archive.

**The app inside is signed — with a development certificate.** A third party (dataJAR, who
package Kards for managed Mac fleets) wrote an AutoPkg recipe against a real copy of our package.
Their signature-verification requirement records exactly what signed it:

```
identifier "solutions.alteka.kards" and anchor apple generic
  and certificate leaf[subject.CN] = "Apple Development: Drew Perry (D4H96T8MEW)"
  and certificate 1[field.1.2.840.113635.100.6.2.1]
```

Two independent confirmations in that one string:

- **`Apple Development:`** is a development certificate. It is scoped to the team's own devices
  and TestFlight and, by design, cannot satisfy Gatekeeper on a third party's Mac.
- **OID `1.2.840.113635.100.6.2.1`** is the Apple Worldwide Developer Relations (WWDR)
  intermediate — the chain used by Development and App Store certificates. A Developer ID chain
  would carry `1.2.840.113635.100.6.2.6` instead.

**What this tells us about the account:** a development certificate cannot be issued without an
active membership, so the membership was fine. The build machine simply had the wrong identity in
its keychain and the build tool selected it silently. This is an extremely common failure and it
produces no warning at build time.

---

## 3. What we need you to create

### 3.1 Developer ID Application certificate

Signs the `.app` bundle. **This is the one we should have been using.**

1. Open **Keychain Access** on a Mac →
   *Certificate Assistant* → *Request a Certificate From a Certificate Authority…*
2. Enter the account email, leave CA Email blank, choose **Saved to disk**, and tick
   **Let me specify key pair information**. Use **2048 bits / RSA**. Save the `.certSigningRequest`.
3. Go to <https://developer.apple.com/account/resources/certificates/list> → **+** →
   **Developer ID Application** → upload the CSR → download the `.cer`.
4. Double-click the `.cer` to install it into the login keychain on the machine that generated the
   CSR. It must land next to its private key, or it is useless.

> **Note:** Apple limits how many Developer ID certificates a team can have. If the portal will
> not let you create one, check whether an existing Developer ID Application certificate is
> already listed. If it is, and its private key is on **this** Mac, just use it — nothing further
> is needed. If the private key is on a *different* machine, that machine is the one that has to
> build, or the certificate needs re-issuing there.
>
> **Do not revoke an existing Developer ID certificate.** Revocation is retroactive and breaks
> every build ever signed with it, including copies already installed on users' machines.

### 3.2 Developer ID Installer certificate

Signs the `.pkg`. **This is the one that has never existed**, and it is why users see the malware
warning.

Same process as 3.1, but choose **Developer ID Installer**. You can reuse a fresh CSR; generate a
second one the same way.

These are two genuinely different certificate types and both are required — the Application
certificate cannot sign a package.

### 3.3 A notarisation credential

Notarisation submits the signed package to Apple for an automated malware scan. Apple retired the
old `altool` route in November 2023, so this must use **`notarytool`**. Either credential works:

**Option A — App Store Connect API key (preferred: not tied to a personal Apple ID, and it is
what we would need later if builds ever move to CI):**

1. <https://appstoreconnect.apple.com/access/integrations/api> → **Keys** → **+**
2. Name it something like `Kards notarytool`, role **Developer**.
3. Download the `.p8` file — **it can only be downloaded once.**
4. Record the **Key ID** and the **Issuer ID** shown on that page.

**Option B — app-specific password (simpler, tied to an individual Apple ID):**

1. <https://appleid.apple.com> → *Sign-In and Security* → *App-Specific Passwords* → generate one.
2. Record it, the Apple ID it belongs to, and the Team ID (`D4H96T8MEW`).

### 3.4 Nothing to export

**You do not need to export anything.** Release builds will run on your Mac, so the certificates
and their private keys stay in your keychain and never move. There is no `.p12` file, no password
to share, and no credential stored anywhere else.

This is deliberate. It also means notarisation problems can be debugged in seconds on your machine
rather than minutes at a time through a build server, and you can confirm Gatekeeper actually
accepts the result by double-clicking it — which is the only test that really counts.

---

## 4. What you will actually do to cut a release

We will commit a scripted build so this is one command, not a sequence of remembered incantations:

```bash
git clone https://github.com/Alteka/Kards.git && cd Kards
npm ci
npm run release:mac        # builds, signs, notarises, staples — all three architectures
```

The script will:

1. Build the app and sign it with **Developer ID Application** — with the identity named
   **explicitly** in config, never auto-selected from the keychain. Auto-selection is what picked
   the development certificate in the first place, and it did so silently.
2. **Fail the build** if the resolved identity does not begin `Developer ID Application:`. This is
   the guard that was missing, and it is the reason this mistake survived four years.
3. Package with **Developer ID Installer**.
4. Submit to Apple with `notarytool` and wait for the result.
5. `xcrun stapler staple` the notarisation ticket onto the `.pkg`, so it validates **offline** —
   which matters a great deal for users setting up in a venue with no internet.

The first run will need your notarisation credential (§3.3). `notarytool` can store it in the
keychain once — `xcrun notarytool store-credentials` — so subsequent releases do not prompt.

Expect the first attempt to fail once or twice on entitlements or hardened-runtime settings. That
is normal, the error messages are specific, and we will iterate with you.

### What we need from you, then

Only this:

| Item | Why |
|---|---|
| Confirmation that both certificates exist and are installed in your login keychain | so the build can find them |
| The exact identity strings — `security find-identity -v -p codesigning` | we hard-code them in the build config |
| Team ID (we believe **D4H96T8MEW** — please confirm) | notarisation |
| Which notarisation credential you set up (API key or app-specific password) | so the script prompts for the right one |

**No secrets need to be sent to anyone.** If that changes later — see §8 — we will ask separately
and explain exactly what is needed.

## 5. How we will verify it worked

Once the release pipeline is set up, these are the checks. Useful for you to know, and to re-run
if you ever want to audit us.

```bash
# 1. The app bundle is signed with Developer ID (NOT "Apple Development")
codesign -dvvv /Applications/Kards.app 2>&1 | grep Authority
#    expect: Authority=Developer ID Application: <name> (D4H96T8MEW)

# 2. Gatekeeper actually accepts it
spctl --assess --type execute -vv /Applications/Kards.app
#    expect: accepted, source=Notarized Developer ID

# 3. The installer package is signed
pkgutil --check-signature Kards-1.4.0-mac-universal.pkg
#    expect: signed by Developer ID Installer: <name> (D4H96T8MEW), chain shown

# 4. The notarisation ticket is stapled (so it validates offline — matters at a venue)
xcrun stapler validate Kards-1.4.0-mac-universal.pkg
#    expect: The validate action worked!
```

We will also add an automated check to the build so that a release **fails** if the signing
identity does not begin `Developer ID Application:`. That is the guard that was missing and would
have caught this in 2022.

---

## 6. Ongoing commitment

- Membership renewal, ~$99/year. Already current.
- Developer ID certificates are valid for **5 years**. Notarisation is per-release and free.
- **If the membership ever lapses, already-shipped software keeps working.** Signatures are
  timestamped and notarisation tickets are stapled, so verification asks "was this valid when it
  was signed?", not "is it valid now". You would lose only the ability to sign *new* releases.
- **Do not revoke a Developer ID certificate** unless it is genuinely compromised. Revocation is
  retroactive and would break every copy of Kards already installed.

---

## 7. Questions we cannot answer without you

1. Does a **Developer ID Application** certificate already exist for this team? If so we want the
   existing one exported, not a new one.
2. Is Team ID **D4H96T8MEW** correct and still the right team for this app?
3. Who should hold these long-term? Right now the knowledge lives in one person's keychain, which
   is how the original mistake survived four years unnoticed.

Thank you — this unblocks roughly 40,000 users, and one 22-month-old bug report.

---

## 8. Later: moving builds to CI

Once the signing recipe is known to work on your machine, we intend to move release builds to
GitHub Actions so that the process is reproducible and does not depend on one person's laptop
being available — the current arrangement is exactly how the original mistake went unnoticed for
four years.

That move **would** require exporting the certificates as password-protected `.p12` files to store
as encrypted GitHub secrets. We are deliberately **not** asking for that yet, because:

- debugging notarisation is far faster locally, and
- there is no reason to copy private keys anywhere until the recipe is proven.

When we get there we will ask separately, explain exactly what is needed, and suggest a safe
transfer method. In the meantime the committed build script and the identity check mean the
process is already documented and reproducible even though it runs locally — which addresses most
of the bus-factor risk without moving any keys.
