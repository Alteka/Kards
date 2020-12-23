# Alteka Kards

A cross-platform test card generator for AV professionals.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub release](https://img.shields.io/github/release/Alteka/Kards.svg)](https://GitHub.com/Alteka/Kards/releases/)
[![GitHub issues](https://img.shields.io/github/issues/Alteka/Kards.svg)](https://GitHub.com/Alteka/Kards/issues/)

## About
Good test cards are often overlooked. Maybe you set a wallpaper, maybe you have some slides in PowerPoint. This is better. We’ve made the ultimate test tool, cross platform, free and easy to use. 

Kards generates a range of useful cards, with motion, audio sync tests. You can name them, brand them. Generate tone or even a text-to-speech that voices the computer name. 

### Analytics
We are using Nucleus to anonymously track usage of Kards. This is mostly to help us focus development and give us an understanding of how you use the app. It is designed to have minimal impact on your computer. You can see what is collected here: https://www.nucleus.sh/transparency

#### Accuracy

A note to say that whilst the app generates specific levels, which match standard cards (where 100% White is 235, 235, 235) however display profiles and operating system settings can override these settings. Whilst this may seem like a bad thing, it's likely that the same is being done to whatever app you want to use. More information on each Kard can be seen here: [Kards Help](https://alteka.solutions/kards/help)

#### Design

The app is based around Electron to create and manage the windows. The content is heavily Vue.js driven, with some custom components to create the test cards.

#### Build Setup
``` bash
#Clone the repo into a folder
# cd into the folder and run the below
#You'll need to have node.js installed

# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build
```

---

For more information please see our website: [Alteka Solutions](https://alteka.solutions/kards)
