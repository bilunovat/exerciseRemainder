// Background Service Worker
// This file handles the timer logic and notifications

import { CONFIG, StorageUtils, DateUtils } from './shared/index.js';

// ============================================
// Alarm Management
// ============================================

function initAlarm() {
    chrome.alarms.get(CONFIG.ALARM_NAME, (alarm) => {
        if (!alarm) {
            chrome.alarms.create(CONFIG.ALARM_NAME, { 
                periodInMinutes: CONFIG.ALARM_INTERVAL_MINUTES
            });
        }
    });
}

// ============================================
// Timer Logic
// ============================================

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== CONFIG.ALARM_NAME) return;
    
    const res = await StorageUtils.get([
        CONFIG.STORAGE_KEYS.TIMER,
        CONFIG.STORAGE_KEYS.IS_RUNNING,
        CONFIG.STORAGE_KEYS.CUSTOM_DURATION,
        CONFIG.STORAGE_KEYS.STATISTICS
    ]);
    
    if (!res[CONFIG.STORAGE_KEYS.IS_RUNNING]) return;
    
    let timer = res[CONFIG.STORAGE_KEYS.TIMER] - 1;
    
    // Track statistics (in seconds)
    await updateStatistics(res[CONFIG.STORAGE_KEYS.STATISTICS]);
    
    if (timer <= 0) {
        // Timer reached zero - reset and notify
        const newTimer = res[CONFIG.STORAGE_KEYS.CUSTOM_DURATION] || CONFIG.DEFAULT_TIMER_SECONDS;
        await StorageUtils.set({
            [CONFIG.STORAGE_KEYS.IS_RUNNING]: false,
            [CONFIG.STORAGE_KEYS.TIMER]: newTimer
        });
        notifyUser();
    } else {
        await StorageUtils.set({ [CONFIG.STORAGE_KEYS.TIMER]: timer });
    }
});

// ============================================
// Statistics Tracking
// ============================================

async function updateStatistics(statistics) {
    const now = new Date();
    const todayKey = DateUtils.getDayKey(now);
    const monthKey = DateUtils.getMonthKey(now);
    const yearKey = DateUtils.getYearKey(now);
    
    // Initialize statistics object if needed
    if (!statistics) {
        statistics = {
            daily: {},
            monthly: {},
            yearly: {}
        };
    }
    
    // Increment daily (track in seconds, will convert to minutes for display)
    if (!statistics.daily[todayKey]) {
        statistics.daily[todayKey] = 0;
    }
    statistics.daily[todayKey] += 1; // Add 1 second
    
    // Increment monthly
    if (!statistics.monthly[monthKey]) {
        statistics.monthly[monthKey] = 0;
    }
    statistics.monthly[monthKey] += 1;
    
    // Increment yearly
    if (!statistics.yearly[yearKey]) {
        statistics.yearly[yearKey] = 0;
    }
    statistics.yearly[yearKey] += 1;
    
    // Save updated statistics
    await StorageUtils.set({ [CONFIG.STORAGE_KEYS.STATISTICS]: statistics });
}

// ============================================
// Notifications
// ============================================

function notifyUser() {
    chrome.notifications.create({
        type: "basic",
        title: CONFIG.NOTIFICATION_TITLE,
        message: CONFIG.NOTIFICATION_MESSAGE,
        iconUrl: CONFIG.NOTIFICATION_ICON,
        priority: 2
    });
}

// ============================================
// Initialization
// ============================================

chrome.runtime.onInstalled.addListener(async () => {
    initAlarm();
    await StorageUtils.initializeDefaults();
});

// Also initialize on service worker startup
initAlarm();
StorageUtils.initializeDefaults();
