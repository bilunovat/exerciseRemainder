// Configuration constants for the Exercise Reminder extension

export const CONFIG = {
    // Timer defaults
    DEFAULT_TIMER_MINUTES: 40,
    DEFAULT_TIMER_SECONDS: 40 * 60,
    MIN_TIMER_SECONDS: 1,
    MAX_HOURS: 24,
    MAX_MINUTES: 59,
    MAX_SECONDS: 59,
    
    // Alarm settings
    ALARM_NAME: "exerciseReminder",
    ALARM_INTERVAL_MINUTES: 1 / 60, // Every second
    
    // Notification settings
    NOTIFICATION_TITLE: "meow! time is up!",
    NOTIFICATION_MESSAGE: "do some stretching and eye exercising!",
    NOTIFICATION_ICON: "assets/icons8_48.png",
    
    // Update interval for popup
    UPDATE_INTERVAL_MS: 1000,
    
    // Storage keys
    STORAGE_KEYS: {
        TIMER: "timer",
        IS_RUNNING: "isRunning",
        CUSTOM_DURATION: "customDuration",
        LIGHT_MODE: "lightMode"
    }
};
