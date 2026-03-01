// Handles the popup interface, theme toggling, and timer display

import { CONFIG, TimerUtils, StorageUtils, ThemeManager } from './shared/index.js';

// ============================================
// DOM Elements
// ============================================

const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const setBtn = document.getElementById("set-btn");
const themeToggle = document.getElementById("theme-toggle");
const timeDisplay = document.getElementById("time");

// ============================================
// State
// ============================================

let isInputMode = false;
let inputHours = "";
let inputMinutes = "";
let inputSeconds = "";
let updateInterval = null;

// ============================================
// Theme Management
// ============================================

themeToggle.addEventListener("click", () => ThemeManager.toggle());

// ============================================
// Timer Controls
// ============================================

startBtn.addEventListener("click", async () => {
    if (isInputMode) return;
    
    const running = await StorageUtils.isRunning();
    await StorageUtils.setRunning(!running);
    updateBtn(!running);
});

resetBtn.addEventListener("click", async () => {
    exitInputMode();
    const duration = await StorageUtils.getCustomDuration();
    await StorageUtils.set({
        [CONFIG.STORAGE_KEYS.TIMER]: duration,
        [CONFIG.STORAGE_KEYS.IS_RUNNING]: false
    });
    startBtn.textContent = "start";
});

// ============================================
// Custom Timer Input
// ============================================

setBtn.addEventListener("click", () => {
    if (isInputMode) {
        confirmTimeInput();
    } else {
        enterInputMode();
    }
});

function enterInputMode() {
    isInputMode = true;
    inputHours = "";
    inputMinutes = "";
    inputSeconds = "";
    timeDisplay.textContent = "hh:mm:ss";
    timeDisplay.classList.add("input-mode");
    setBtn.textContent = "ok";
    document.addEventListener("keydown", handleKeyInput);
}

function exitInputMode() {
    isInputMode = false;
    timeDisplay.classList.remove("input-mode");
    setBtn.textContent = "set";
    document.removeEventListener("keydown", handleKeyInput);
}

function handleKeyInput(e) {
    if (!isInputMode) return;
    
    if (e.key >= "0" && e.key <= "9") {
        if (inputHours.length < 2) {
            inputHours += e.key;
        } else if (inputMinutes.length < 2) {
            inputMinutes += e.key;
        } else if (inputSeconds.length < 2) {
            inputSeconds += e.key;
        }
        updateInputDisplay();
    } else if (e.key === "Backspace") {
        if (inputSeconds.length > 0) {
            inputSeconds = inputSeconds.slice(0, -1);
        } else if (inputMinutes.length > 0) {
            inputMinutes = inputMinutes.slice(0, -1);
        } else if (inputHours.length > 0) {
            inputHours = inputHours.slice(0, -1);
        }
        updateInputDisplay();
    } else if (e.key === "Enter") {
        confirmTimeInput();
    } else if (e.key === "Escape") {
        exitInputMode();
        updateTime();
    }
}

function updateInputDisplay() {
    const hours = inputHours.padEnd(2, "_");
    const minutes = inputMinutes.padEnd(2, "_");
    const seconds = inputSeconds.padEnd(2, "_");
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

async function confirmTimeInput() {
    const hours = parseInt(inputHours || "0", 10);
    const minutes = parseInt(inputMinutes || "0", 10);
    const seconds = parseInt(inputSeconds || "0", 10);
    
    const validated = TimerUtils.validateTime(hours, minutes, seconds);
    let totalSeconds = TimerUtils.toSeconds(validated.hours, validated.minutes, validated.seconds);
    
    // Minimum timer is 1 second
    if (totalSeconds < CONFIG.MIN_TIMER_SECONDS) {
        totalSeconds = CONFIG.MIN_TIMER_SECONDS;
    }
    
    await StorageUtils.set({
        [CONFIG.STORAGE_KEYS.CUSTOM_DURATION]: totalSeconds,
        [CONFIG.STORAGE_KEYS.TIMER]: totalSeconds,
        [CONFIG.STORAGE_KEYS.IS_RUNNING]: false
    });
    
    exitInputMode();
    startBtn.textContent = "start";
    updateTime();
}

// ============================================
// Display Updates
// ============================================

async function updateTime() {
    if (isInputMode) return;
    
    const res = await StorageUtils.get([
        CONFIG.STORAGE_KEYS.TIMER,
        CONFIG.STORAGE_KEYS.IS_RUNNING
    ]);
    
    const totalSeconds = res[CONFIG.STORAGE_KEYS.TIMER] || 0;
    timeDisplay.textContent = TimerUtils.formatTime(totalSeconds);
    updateBtn(res[CONFIG.STORAGE_KEYS.IS_RUNNING]);
}

function updateBtn(isRunning) {
    startBtn.textContent = isRunning ? "pause" : "start";
}

// ============================================
// Initialization
// ============================================

function init() {
    ThemeManager.load();
    updateTime();
    updateInterval = setInterval(updateTime, CONFIG.UPDATE_INTERVAL_MS);
}

init();
