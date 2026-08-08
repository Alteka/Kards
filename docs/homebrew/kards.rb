cask "kards" do
  version "1.4.0"
  sha256 "REPLACE_WITH_SHA256_OF_THE_UNIVERSAL_PKG"

  url "https://github.com/Alteka/Kards/releases/download/v#{version}/Kards-#{version}-mac-universal.pkg",
      verified: "github.com/Alteka/Kards/"
  name "Kards"
  desc "Test card generator for AV professionals"
  homepage "https://alteka.solutions/kards"

  # Reads the GitHub releases API, which excludes pre-releases - so a
  # v1.4.0-beta.1 will not cause `brew upgrade` to offer a beta to everyone.
  # Same property the in-app update checker relies on.
  livecheck do
    url :url
    strategy :github_latest
  end

  # Electron 43 raises the floor to macOS 12. Homebrew will refuse to install
  # rather than let someone on Big Sur end up with an app that cannot launch.
  depends_on macos: ">= :monterey"

  pkg "Kards-#{version}-mac-universal.pkg"

  uninstall pkgutil: "solutions.alteka.kards"

  zap trash: [
    "~/Library/Application Support/kards",
    "~/Library/Logs/Kards",
    "~/Library/Preferences/solutions.alteka.kards.plist",
    "~/Library/Saved Application State/solutions.alteka.kards.savedState",
  ]
end
