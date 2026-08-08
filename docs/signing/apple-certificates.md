# Apple code signing for Kards — what we need, and why

**For:** whoever administers the Apple Developer Program account (Team ID **D4H96T8MEW**).
**From:** the Kards maintainers.
**Ask:** two certificates and a notarisation credential. Roughly 30–60 minutes of portal work.
**Written:** 2026-08-08.

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
> already listed — if so, we need the existing one exported (§3.4) rather than a new one, and
> **do not revoke the old one**: revoking breaks every build ever signed with it, retroactively.

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

**Option A — App Store Connect API key (preferred; works cleanly in CI, no personal account tied
to it):**

1. <https://appstoreconnect.apple.com/access/integrations/api> → **Keys** → **+**
2. Name it something like `Kards notarytool`, role **Developer**.
3. Download the `.p8` file — **it can only be downloaded once.**
4. Record the **Key ID** and the **Issuer ID** shown on that page.

**Option B — app-specific password (simpler, tied to an individual Apple ID):**

1. <https://appleid.apple.com> → *Sign-In and Security* → *App-Specific Passwords* → generate one.
2. Record it, the Apple ID it belongs to, and the Team ID (`D4H96T8MEW`).

### 3.4 Export both certificates for our build system

Builds run on GitHub Actions, which needs the certificates **and their private keys** as `.p12`
files:

1. In **Keychain Access**, select the certificate **and** its private key (expand the triangle;
   select both rows).
2. Right-click → **Export 2 items…** → format **Personal Information Exchange (.p12)**.
3. Set a strong password. You will need to send us that password too.
4. Do this twice — once for Developer ID Application, once for Developer ID Installer.

---

## 4. What to send us, and how

| Item | From |
|---|---|
| `developer-id-application.p12` + its password | §3.4 |
| `developer-id-installer.p12` + its password | §3.4 |
| API key `.p8` + Key ID + Issuer ID — *or* the app-specific password + Apple ID | §3.3 |
| Team ID (we believe **D4H96T8MEW** — please confirm) | portal |

**Please do not** email these, put them in Slack or Teams, commit them to a repository, or paste
them into a chat with an AI assistant. Use a password manager's secure-sharing feature, or a
one-time secret link (e.g. 1Password sharing, Bitwarden Send). Send the `.p12` files and their
passwords by **two different channels**.

They will be stored as GitHub Actions encrypted secrets and used only by the release workflow.

---

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
