# Exercise Reminder

A Chrome extension that reminds you to take breaks and exercise while working.

## Features

- **Custom Timer** - Set any duration from 1 second to 24 hours
- **Dark/Light Mode** - Toggle between themes with the moon/sun icon
- **Desktop Notifications** - Get notified when your timer ends
- **Persistent Settings** - Your timer and theme preferences are saved

## Installation

1. Clone or download this repository
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder

## Usage

| Button | Action |
|--------|--------|
| **start** | Begin the countdown |
| **pause** | Pause the running timer |
| **reset** | Reset to your custom duration |
| **set** | Enter a custom time (format: HH:MM:SS) |

### Setting a Custom Timer

1. Click **set**
2. Type hours, minutes, seconds (e.g., `010530` = 1h 5m 30s)
3. Press **Enter** or click **ok**

### Theme Toggle

Click the moon / sun icon in the top right corner to switch between dark and light modes.

## Project Structure

```
├── manifest.json      # Extension configuration
├── config.js          # Constants and settings
├── utils.js           # Timer and storage utilities
├── background.js      # Service worker (timer logic)
├── popup.js           # UI logic
├── popup.html/css     # UI layout and styles
└── assets/            # Extension icons
```

## License

MIT License - see [LICENSE](LICENSE) for details.
