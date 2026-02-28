// Utility functions for the Exercise Reminder extension

import { CONFIG } from './config.js';

// Date utilities for consistent date key generation
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

// Timer utilities
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

// Storage utilities with Promise-based API and error handling
export const StorageUtils = {
    /**
     * Get values from storage with error handling
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
     * Set values in storage with error handling
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
