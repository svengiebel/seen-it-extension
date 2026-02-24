# SeenIt

Markiert Anzeigen als gesehen oder nicht gesehen.

## Installation

### Chrome / Chromium

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the directory containing `manifest.json`

### Firefox

1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.firefox.json`

### Safari (macOS)

1. Make sure Xcode is installed.
2. In Terminal, run:
   `xcrun safari-web-extension-converter /Path/To/Extension --macos-only`
3. Open the generated Xcode project and build/run the app once.
4. In Safari, open Settings > Extensions and enable the extension.
