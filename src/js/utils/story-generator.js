import { storyVariants } from './constants.js';

/**
 * Story Generation Utilities
 * Helper functions for story theme selection and generation
 */

/**
 * Get a random story variant for a given theme
 */
export function getRandomVariant(theme) {
    const variants = storyVariants[theme];
    if (!variants || variants.length === 0) {
        return 'general situation';
    }
    return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * Get theme display name
 */
export function getThemeDisplayName(theme) {
    const displayNames = {
        'daily_life': 'Daily Life',
        'travel': 'Travel & Adventure', 
        'food': 'Food & Cooking',
        'friendship': 'Friendship & Relationships',
        'work': 'Work & Career',
        'shopping': 'Shopping & Money',
        'health': 'Health & Wellness',
        'hobbies': 'Hobbies & Entertainment',
        'family': 'Family & Home',
        'nature': 'Nature & Environment',
        'technology': 'Technology & Modern Life',
        'education': 'Education & Learning',
        'custom': 'Custom Theme'
    };
    
    return displayNames[theme] || theme;
}

/**
 * Validate custom theme input
 */
export function validateCustomTheme(customTheme) {
    if (!customTheme || typeof customTheme !== 'string') {
        return { valid: false, error: 'Custom theme is required' };
    }
    
    const trimmed = customTheme.trim();
    if (trimmed.length < 3) {
        return { valid: false, error: 'Custom theme must be at least 3 characters' };
    }
    
    if (trimmed.length > 100) {
        return { valid: false, error: 'Custom theme must be less than 100 characters' };
    }
    
    return { valid: true, theme: trimmed };
}

/**
 * Get story generation parameters
 */
export function getStoryParams(theme, customTheme = null) {
    if (theme === 'custom') {
        const validation = validateCustomTheme(customTheme);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        return {
            theme: validation.theme,
            variant: 'custom story scenario'
        };
    }
    
    return {
        theme: getThemeDisplayName(theme),
        variant: getRandomVariant(theme)
    };
}