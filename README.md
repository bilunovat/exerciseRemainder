# Exercise Reminder

A Chrome extension that reminds you to take breaks and exercise while working.

## Features

- **Custom Timer** - Set any duration from 1 second to 24 hours
- **Dark/Light Mode** - Toggle between themes with the moon/sun icon
- **Desktop Notifications** - Get notified when your timer ends
- **Persistent Settings** - Your timer and theme preferences are saved
- **Statistics Tracking** - View your exercise time with daily, monthly, and yearly breakdowns

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

Click the 🌙/☀️ icon in the top right corner to switch between dark and light modes.

### Statistics

Click **get statistics** at the bottom of the popup to view your exercise history.

**Navigation:**
- Use **<** and **>** arrows to navigate between time periods (yesterday, today, tomorrow, etc.)
- Click **today**, **month**, or **year** tabs to switch between time granularities

**7-Day Rolling Average:**
- For the first 7 days, the daily goal is fixed at 4 hours
- After 7 days of tracked data, the donut chart switches to use your7-day rolling average as the goal
- This means 100% = you matched your typical daily exercise time
- The average is recalculated daily based on the last 7 days

## Project Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker (timer logic, statistics tracking)
├── popup.js               # Popup UI logic
├── popup.html/css         # Popup UI layout and styles
├── statistics.js          # Statistics page logic
├── statistics.html/css    # Statistics page layout and styles
├── shared/
│   ├── config.js          # Constants and settings (timer, statistics goals)
│   ├── utils.js           # Timer, date, and storage utilities
│   ├── theme.js           # Shared theme management module
│   └── theme.css          # CSS variables for theming
└── assets/                # Extension icons
```

## Architecture

The extension follows a modular architecture with ES modules:

- **shared/config.js** - Centralized configuration constants
- **shared/utils.js** - Utility functions:
  - `TimerUtils` - Time formatting and validation
  - `DateUtils` - Date key generation for statistics
  - `StorageUtils` - Promise-based Chrome storage API with error handling
- **shared/theme.js** - `ThemeManager` module for consistent theme handling
- **shared/theme.css** - CSS custom properties for consistent styling

## License

MIT License - see [LICENSE](LICENSE) for details.
