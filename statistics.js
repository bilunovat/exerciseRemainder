// Exercise Reminder - Statistics Page
// Displays daily, monthly, and yearly exercise statistics

import { CONFIG } from './shared/config.js';
import { StorageUtils, DateUtils } from './shared/utils.js';
import { ThemeManager } from './shared/theme.js';

// ============================================
// State
// ============================================

const PERIODS = ['today', 'month', 'year'];
let currentPeriodIndex = 0;
let periodOffset = 0; // Offset from current period (e.g., -1 = yesterday, +1 = tomorrow)
let statisticsData = {
    daily: {},
    monthly: {},
    yearly: {}
};

// ============================================
// DOM Elements
// ============================================

const themeToggle = document.getElementById("theme-toggle");
const prevButton = document.getElementById("prev-period");
const nextButton = document.getElementById("next-period");
const chartProgress = document.getElementById("chart-progress");
const chartTime = document.getElementById("chart-time");
const chartLabel = document.getElementById("chart-label");
const periodTabs = document.querySelectorAll(".period-tab");

// ============================================
// Theme Management (using shared ThemeManager)
// ============================================

themeToggle.addEventListener("click", () => ThemeManager.toggle());

// ============================================
// Statistics Logic
// ============================================

function formatTimeShort(minutes) {
    const roundedMinutes = Math.round(minutes);
    if (roundedMinutes < 60) {
        return `${roundedMinutes}m`;
    }
    const hours = Math.floor(roundedMinutes / 60);
    const mins = roundedMinutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

function getProgressPercentage(minutes, maxMinutes) {
    if (maxMinutes === 0) return 0;
    return Math.min((minutes / maxMinutes) * 100, 100);
}

function setChartProgress(percentage) {
    // Circle circumference = 2 * PI * r where r = 15.915
    const circumference = 2 * Math.PI * 15.915;
    const offset = circumference - (percentage / 100) * circumference;
    chartProgress.style.strokeDasharray = circumference;
    chartProgress.style.strokeDashoffset = offset;
}

function getMinutesForPeriod(period, offset = 0) {
    switch (period) {
        case 'today': {
            const date = DateUtils.offsetDays(offset);
            const dayKey = DateUtils.getDayKey(date);
            const daySeconds = statisticsData.daily[dayKey] || 0;
            return daySeconds / 60;
        }
        case 'month': {
            const date = DateUtils.offsetMonths(offset);
            const monthKey = DateUtils.getMonthKey(date);
            const monthSeconds = statisticsData.monthly[monthKey] || 0;
            return monthSeconds / 60;
        }
        case 'year': {
            const date = DateUtils.offsetYears(offset);
            const yearKey = DateUtils.getYearKey(date);
            const yearSeconds = statisticsData.yearly[yearKey] || 0;
            return yearSeconds / 60;
        }
        default:
            return 0;
    }
}

/**
 * Get a display label for the current period with offset
 */
function getPeriodLabel(period, offset) {
    switch (period) {
        case 'today':
            if (offset === 0) return 'today';
            if (offset === -1) return 'yesterday';
            if (offset === 1) return 'tomorrow';
            const dayDate = DateUtils.offsetDays(offset);
            return dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
        case 'month': {
            const monthDate = DateUtils.offsetMonths(offset);
            return monthDate.toLocaleDateString('en-US', { month: 'long' });
        }
        case 'year': {
            const yearDate = DateUtils.offsetYears(offset);
            return String(yearDate.getFullYear());
        }
        default:
            return period;
    }
}

function getMaxMinutesForPeriod(period) {
    const { DEFAULT_DAILY_GOAL_MINUTES, DEFAULT_MONTHLY_GOAL_MINUTES, DEFAULT_YEARLY_GOAL_MINUTES } = CONFIG.STATISTICS;
    
    switch (period) {
        case 'today':
            return DEFAULT_DAILY_GOAL_MINUTES;
        case 'month':
            return DEFAULT_MONTHLY_GOAL_MINUTES;
        case 'year':
            return DEFAULT_YEARLY_GOAL_MINUTES;
        default:
            return DEFAULT_DAILY_GOAL_MINUTES;
    }
}

/**
 * Calculate the rolling average for daily exercise
 * @returns {{ average: number, daysWithData: number, useAverage: boolean }}
 */
function calculateRollingAverage() {
    const dailyData = statisticsData.daily;
    const { ROLLING_AVERAGE_DAYS } = CONFIG.STATISTICS;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    let totalMinutes = 0;
    let daysWithData = 0;
    
    // Look at the last N days (not including today)
    for (let i = 1; i <= ROLLING_AVERAGE_DAYS; i++) {
        const date = new Date(now - i * oneDayMs);
        const dateKey = DateUtils.getDayKey(date);
        const seconds = dailyData[dateKey] || 0;
        if (seconds > 0) {
            totalMinutes += seconds / 60;
            daysWithData++;
        }
    }
    
    const average = daysWithData > 0 ? totalMinutes / daysWithData : 0;
    const useAverage = daysWithData >= ROLLING_AVERAGE_DAYS;
    
    return { average, daysWithData, useAverage };
}

function updateDisplay() {
    const period = PERIODS[currentPeriodIndex];
    const minutes = getMinutesForPeriod(period, periodOffset);
    
    // For "today" with no offset, use rolling average if available
    let maxMinutes = getMaxMinutesForPeriod(period);
    let avgInfo = null;
    
    if (period === 'today' && periodOffset === 0) {
        avgInfo = calculateRollingAverage();
        if (avgInfo.useAverage) {
            maxMinutes = avgInfo.average;
        }
    }
    
    // Update chart
    chartTime.textContent = formatTimeShort(minutes);
    
    // Get the period label with offset
    const periodLabel = getPeriodLabel(period, periodOffset);
    
    // Show average info if available for "today" (current day only)
    if (period === 'today' && periodOffset === 0 && avgInfo && avgInfo.useAverage) {
        chartLabel.innerHTML = `${periodLabel}<br><span class="avg-label">avg: ${formatTimeShort(avgInfo.average)}</span>`;
    } else {
        chartLabel.textContent = periodLabel;
    }
    
    setChartProgress(getProgressPercentage(minutes, maxMinutes));
    
    // Update tabs
    periodTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.period === period);
    });
}

async function loadStatistics() {
    const stats = await StorageUtils.get([CONFIG.STORAGE_KEYS.STATISTICS]);
    statisticsData = stats[CONFIG.STORAGE_KEYS.STATISTICS] || {
        daily: {},
        monthly: {},
        yearly: {}
    };
    
    updateDisplay();
}

// ============================================
// Event Handlers
// ============================================

function navigatePeriod(direction) {
    // Navigate within the same period type (e.g., today -> yesterday -> day before)
    periodOffset += direction;
    updateDisplay();
}

prevButton.addEventListener("click", () => navigatePeriod(-1));
nextButton.addEventListener("click", () => navigatePeriod(1));

periodTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        // Switch period type and reset offset
        currentPeriodIndex = PERIODS.indexOf(tab.dataset.period);
        periodOffset = 0;
        updateDisplay();
    });
});

// ============================================
// Initialization
// ============================================

function init() {
    ThemeManager.load();
    loadStatistics();
    
    // Refresh statistics every 5 seconds to show updates
    setInterval(loadStatistics, 5000);
}

init();
