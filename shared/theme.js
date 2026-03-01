// Shared Theme Management Module
// Handles dark/light mode toggling across all pages

import { StorageUtils } from './utils.js';

/**
 * ThemeManager - Centralized theme management
 */
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
