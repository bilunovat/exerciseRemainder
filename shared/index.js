// Contains configuration, utilities, and theme management

// ============================================
// Configuration
// ============================================

export const CONFIG = {
    // Timer defaults
    DEFAULT_TIMER_MINUTES: 40,
    DEFAULT_TIMER_SECONDS: 40 * 60,
    MIN_TIMER_SECONDS: 1,
    MAX_HOURS: 24,
    MAX_MINUTES: 59,
    MAX_SECONDS: 59,
    
    // Alarm settings
    ALARM_NAME: "Exercise Reminder",
    ALARM_INTERVAL_MINUTES: 1 / 60, // Every second
    
    // Notification settings
    NOTIFICATION_TITLE: "meow! time is up!",
    NOTIFICATION_MESSAGE: "do some stretching and eye exercising!",
    NOTIFICATION_ICON: "assets/icons8_48.png",
    
    // Update interval for popup
    UPDATE_INTERVAL_MS: 1000,
    
    // Statistics settings
    STATISTICS: {
        DEFAULT_DAILY_GOAL_MINUTES: 240,      // 4 hours
        DEFAULT_MONTHLY_GOAL_MINUTES: 2400,   // 40 hours
        DEFAULT_YEARLY_GOAL_MINUTES: 14600,   // ~243 hours
        ROLLING_AVERAGE_DAYS: 7
    },
    
    // Storage keys
    STORAGE_KEYS: {
        TIMER: "timer",
        IS_RUNNING: "isRunning",
        CUSTOM_DURATION: "customDuration",
        LIGHT_MODE: "lightMode",
        STATISTICS: "statistics"
    }
};

// ============================================
// Date Utilities
// ============================================

export const DateUtils = {
    /**
     * Get day key in YYYY-MM-DD format
     * @param {Date} date 
     * @returns {string}
     */
    getDayKey(date = new Date()) {
        return date.toISOString().split('T')[0];
    },
    
    /**
     * Get month key in YYYY-MM format
     * @param {Date} date 
     * @returns {string}
     */
    getMonthKey(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    },
    
    /**
     * Get year key in YYYY format
     * @param {Date} date 
     * @returns {string}
     */
    getYearKey(date = new Date()) {
        return String(date.getFullYear());
    },
    
    /**
     * Get a date offset by a number of days
     * @param {number} days - Number of days to offset (negative for past)
     * @returns {Date}
     */
    offsetDays(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    },
    
    /**
     * Get a date offset by a number of months
     * @param {number} months - Number of months to offset
     * @returns {Date}
     */
    offsetMonths(months) {
        const date = new Date();
        date.setMonth(date.getMonth() + months);
        return date;
    },
    
    /**
     * Get a date offset by a number of years
     * @param {number} years - Number of years to offset
     * @returns {Date}
     */
    offsetYears(years) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + years);
        return date;
    }
};

// ============================================
// Timer Utilities
// ============================================

export const TimerUtils = {
    /**
     * Format seconds into display string (HH:MM:SS or MM:SS)
     * @param {number} totalSeconds - Total seconds to format
     * @returns {string} Formatted time string
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    },
    
    /**
     * Convert hours, minutes, seconds to total seconds
     * @param {number} hours 
     * @param {number} minutes 
     * @param {number} seconds 
     * @returns {number} Total seconds
     */
    toSeconds(hours, minutes, seconds) {
        return hours * 3600 + minutes * 60 + seconds;
    },
    
    /**
     * Validate time values
     * @param {number} hours 
     * @param {number} minutes 
     * @param {number} seconds 
     * @returns {{hours: number, minutes: number, seconds: number}} Validated time
     */
    validateTime(hours, minutes, seconds) {
        let h = Math.min(hours, CONFIG.MAX_HOURS);
        let m = minutes;
        let s = seconds;
        
        // If minutes or seconds are invalid (> 59), set to 0
        if (m > CONFIG.MAX_MINUTES) {
            m = 0;
        }
        if (s > CONFIG.MAX_SECONDS) {
            s = 0;
        }
        
        // If 24 hours, minutes and seconds must be 0
        if (h === CONFIG.MAX_HOURS) {
            m = 0;
            s = 0;
        }
        
        return { hours: h, minutes: m, seconds: s };
    }
};

// ============================================
// Storage Utilities
// ============================================

export const StorageUtils = {
    /**
     * Get values from storage 
     * @param {string[]} keys - Keys to retrieve
     * @returns {Promise<object>} Storage values
     * @throws {Error} If storage operation fails
     */
    async get(keys) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`Storage get error: ${chrome.runtime.lastError.message}`));
                } else {
                    resolve(result);
                }
            });
        });
    },
    
    /**
     * Set values in storage 
     * @param {object} data - Data to store
     * @returns {Promise<void>}
     * @throws {Error} If storage operation fails
     */
    async set(data) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(`Storage set error: ${chrome.runtime.lastError.message}`));
                } else {
                    resolve();
                }
            });
        });
    },
    
    // Convenience methods for common operations
    async getTimer() {
        const res = await this.get([CONFIG.STORAGE_KEYS.TIMER]);
        return res[CONFIG.STORAGE_KEYS.TIMER];
    },
    
    async setTimer(value) {
        await this.set({ [CONFIG.STORAGE_KEYS.TIMER]: value });
    },
    
    async isRunning() {
        const res = await this.get([CONFIG.STORAGE_KEYS.IS_RUNNING]);
        return res[CONFIG.STORAGE_KEYS.IS_RUNNING] || false;
    },
    
    async setRunning(value) {
        await this.set({ [CONFIG.STORAGE_KEYS.IS_RUNNING]: value });
    },
    
    async getCustomDuration() {
        const res = await this.get([CONFIG.STORAGE_KEYS.CUSTOM_DURATION]);
        return res[CONFIG.STORAGE_KEYS.CUSTOM_DURATION] || CONFIG.DEFAULT_TIMER_SECONDS;
    },
    
    async setCustomDuration(value) {
        await this.set({ [CONFIG.STORAGE_KEYS.CUSTOM_DURATION]: value });
    },
    
    async isLightMode() {
        const res = await this.get([CONFIG.STORAGE_KEYS.LIGHT_MODE]);
        return res[CONFIG.STORAGE_KEYS.LIGHT_MODE] || false;
    },
    
    async setLightMode(value) {
        await this.set({ [CONFIG.STORAGE_KEYS.LIGHT_MODE]: value });
    },
    
    /**
     * Initialize default values if not set
     */
    async initializeDefaults() {
        const res = await this.get([CONFIG.STORAGE_KEYS.TIMER, CONFIG.STORAGE_KEYS.CUSTOM_DURATION]);
        if (res[CONFIG.STORAGE_KEYS.TIMER] === undefined) {
            await this.set({
                [CONFIG.STORAGE_KEYS.TIMER]: CONFIG.DEFAULT_TIMER_SECONDS,
                [CONFIG.STORAGE_KEYS.CUSTOM_DURATION]: CONFIG.DEFAULT_TIMER_SECONDS,
                [CONFIG.STORAGE_KEYS.IS_RUNNING]: false
            });
        }
    }
};

// ============================================
// Theme Manager
// ============================================

export const ThemeManager = {
    /**
     * Apply theme to the document
     * @param {boolean} isLightMode - Whether to use light mode
     */
    apply(isLightMode) {
        if (isLightMode) {
            document.documentElement.classList.add("light-mode");
        } else {
            document.documentElement.classList.remove("light-mode");
        }
    },

    /**
     * Load and apply saved theme from storage
     * @returns {Promise<void>}
     */
    async load() {
        const isLightMode = await StorageUtils.isLightMode();
        this.apply(isLightMode);
    },

    /**
     * Toggle between light and dark mode
     * @returns {Promise<boolean>} The new theme state (true = light mode)
     */
    async toggle() {
        const isLightMode = document.documentElement.classList.contains("light-mode");
        const newMode = !isLightMode;
        await StorageUtils.setLightMode(newMode);
        this.apply(newMode);
        return newMode;
    },

    /**
     * Check if currently in light mode
     * @returns {boolean}
     */
    isLight() {
        return document.documentElement.classList.contains("light-mode");
    }
};
