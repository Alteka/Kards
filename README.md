# Alteka Kards

A cross-platform test card generator for AV professionals.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub release](https://img.shields.io/github/release/Alteka/Kards.svg)](https://GitHub.com/Alteka/Kards/releases/)
[![GitHub issues](https://img.shields.io/github/issues/Alteka/Kards.svg)](https://GitHub.com/Alteka/Kards/issues/)

#### Accuracy

A note to say that whilst the app generates specific levels, which match standard cards (where 100% White is 235, 235, 235) however display profiles and operating system settings can override these settings. Whilst this may seem like a bad thing, it's likely the same thing is being done to whatever app you want to use. 

#### Design

The app is based around Electron to create and manage the windows. The content is heavily Vue.js driven, with some custom components to create the test cards.

#### Build Setup
Clone the repo into a folder, cd into the folder and run the below. 

You'll need to have node.js installed.

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build
```

---

For mor information please see our website: [Alteka Solutions](https://alteka.solutions/kards)
