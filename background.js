// Exercise Reminder - Background Service Worker
// This file handles the timer logic and notifications

import { CONFIG } from './config.js';
import { StorageUtils } from './utils.js';

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
        CONFIG.STORAGE_KEYS.CUSTOM_DURATION
    ]);
    
    if (!res[CONFIG.STORAGE_KEYS.IS_RUNNING]) return;
    
    let timer = res[CONFIG.STORAGE_KEYS.TIMER] - 1;
    
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
