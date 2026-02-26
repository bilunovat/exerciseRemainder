// Utility functions for the Exercise Reminder extension

import { CONFIG } from './config.js';

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

// Storage utilities with Promise-based API
export const StorageUtils = {
    /**
     * Get values from storage
     * @param {string[]} keys - Keys to retrieve
     * @returns {Promise<object>} Storage values
     */
    async get(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, resolve);
        });
    },
    
    /**
     * Set values in storage
     * @param {object} data - Data to store
     * @returns {Promise<void>}
     */
    async set(data) {
        return new Promise((resolve) => {
            chrome.storage.local.set(data, resolve);
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
