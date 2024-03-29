module.exports = {
    pluginOptions: {
      electronBuilder: {
        preload: 'src/preload.js',
        builderOptions: { 
          "productName": "Kards",
          "appId": "solutions.alteka.kards",
          "artifactName": "${productName}-${version}-${os}-${arch}.${ext}",
          "mac": {
            "icon": "public/icon.png",
            "target": "pkg"
          },
          "win": {
            "icon": "public/icon.png"
          },
          "nsis": {
            "oneClick": false,
            "createDesktopShortcut": false,
            "menuCategory": true
          }
        }
      }
    }
  }