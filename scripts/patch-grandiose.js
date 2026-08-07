#!/usr/bin/env node
/**
 * Patches grandiose's binding.gyp to add macOS arm64 support.
 * The bundled libndi.dylib is a universal binary (x86_64 + arm64) but the
 * binding.gyp only has a condition for mac/x64. This adds the arm64 condition
 * so the NDI library is linked and copied on Apple Silicon.
 *
 * Run automatically via postinstall before electron-builder install-app-deps.
 */
'use strict'

const fs = require('fs')
const path = require('path')

const bindingGyp = path.join(__dirname, '..', 'node_modules', 'grandiose', 'binding.gyp')

if (!fs.existsSync(bindingGyp)) {
  console.log('patch-grandiose: binding.gyp not found, skipping')
  process.exit(0)
}

let content = fs.readFileSync(bindingGyp, 'utf8')

if (content.includes("target_arch == 'arm64'")) {
  console.log('patch-grandiose: arm64 condition already present, skipping')
  process.exit(0)
}

const x64Block = `[ "OS == 'mac' and target_arch == 'x64'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/mac-x64/libndi.dylib" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,@loader_path", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/mac-x64" ]
                }
            } ]`

const arm64Block = `[ "OS == 'mac' and target_arch == 'arm64'", {
                "copies": [ {
                    "destination":  "build/Release",
                    "files":        [ "<(ndi_dir)/lib/mac-x64/libndi.dylib" ]
                } ],
                "link_settings": {
                    "libraries":    [ "-Wl,-rpath,@loader_path", "-lndi" ],
                    "library_dirs": [ "<(ndi_dir)/lib/mac-x64" ]
                }
            } ]`

if (!content.includes(x64Block)) {
  console.log('patch-grandiose: could not find expected x64 block, skipping')
  process.exit(0)
}

content = content.replace(x64Block, x64Block + ',\n            ' + arm64Block)

fs.writeFileSync(bindingGyp, content, 'utf8')
console.log('patch-grandiose: added macOS arm64 condition to binding.gyp')
