# NFC App Blocker

A React Native app that blocks distracting apps until you tap a physical NFC tag. Pair a tag once, leave it somewhere that takes a few steps to reach, and tap it to switch blocking on or off. The phone cannot be unlocked from the couch.

The interesting part is the native layer. React Native handles the interface and the NFC flow, while Swift and Kotlin modules do the actual blocking on each platform.

## How it works

1. Choose the apps you want to block.
2. Pair an NFC tag with the app.
3. Tap the tag to turn blocking on. Tap it again to turn blocking off.

## Native modules

**Android (Kotlin)**
- Accessibility service that detects which app is in the foreground
- Usage stats module and an installed apps module for the app picker
- Overlay service that covers a blocked app with a block screen
- Foreground service that keeps blocking alive in the background
- Permissions module that walks the user through the required grants

**iOS (Swift)**
- Screen Time integration through the FamilyControls and ManagedSettings frameworks
- System app picker and a shield applied to the selected apps

## Stack

React Native 0.82, TypeScript, React Navigation, react-native-nfc-manager, MMKV for fast local storage, Nitro Modules.

## Run it

```sh
yarn install
cd ios && pod install && cd ..
yarn android
yarn ios
```

The iOS Screen Time features need a device and the Family Controls entitlement. NFC needs a physical device on both platforms.

## Author

Built by [Aqeel Ahmad](https://github.com/aqeelkhokhar), Senior Mobile Engineer. Native module work in React Native is something I do for clients. Portfolio https://aqeel-ahmad-portfolio.vercel.app/
