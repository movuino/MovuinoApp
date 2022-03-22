# MovuinoApp
A react-native app to show off the capabilities of Movuino
<br>
<br>
[![Maintenance](https://img.shields.io/badge/Maintained%3F-no-red.svg)](https://bitbucket.org/lbesson/ansi-colors)
[![Generic badge](https://img.shields.io/badge/Made%20with-React%20Native-blue.svg)](https://shields.io/)
[![TypeScript](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://typescriptlang.org)

<p float="left" align="center">
  <img src="https://github.com/movuino/MovuinoApp/raw/master/images/discovering.PNG" width="200" />
  <img src="https://github.com/movuino/MovuinoApp/raw/master/images/home.PNG" width="200" /> 
  <img src="https://github.com/movuino/MovuinoApp/raw/master/images/accel.PNG" width="200" />
</p>
<p align="center">
  <img src="https://github.com/movuino/MovuinoApp/raw/master/images/accelLandscape.PNG" height="300" />
</p>

### Tech Stack
- [TypeScript](https://www.typescriptlang.org)
- [React Native](https://reactnative.dev)
  - [React Native BLE PLX](https://github.com/dotintent/react-native-ble-plx)
  - [React Native Navigation](https://reactnavigation.org)
  - Icons from [Icon8](https://icones8.fr)
- [Arduino-esp32-ble](https://github.com/espressif/arduino-esp32/tree/master/libraries/BLE)
- [MPU9250](https://github.com/hideakitai/MPU9250)

### Usage
In order to install the App on an Iphone (a Mac computer is required):
- `cd` to ./MovuinoApp and run `npm install` (if you run into error try `npm install --force`)
- Uplaod the firmware to your movuino (ESP32)
- Install Xcode
- Open ./MovuinoApp/ios/MovuinoApp.xcworkspace in Xcode
- Connect your Iphone to your mac
- In the top bar dropdown menu, select your Iphone
- Still in the top bar, select MovuinoAppRelease scheme
- Click on the Play button to run the app on your device.
- Go in your phone setting and allow the app from an unauthorized developper.
- You can now unplug the Iphone from your Mac and open the App

#### The App has currently only been tested on Ios (Iphone 12)

### TODO
- Hanlde bluetoth disconnection while reading data (currently crashes)
- Add more sensors
- Add data recording and exporting functionalities

