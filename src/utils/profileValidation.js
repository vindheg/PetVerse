// src/utils/profileValidation.js

/**
 * Checks if a user profile is complete enough to proceed.
 * Mandatory fields: username, phone, city, state.
 * 
 * @param {Object} profile - The user profile object from Supabase/Context
 * @returns {boolean} - True if profile is complete, false otherwise
 */
export const isProfileComplete = (profile) => {
    if (!profile) return false;

    const requiredFields = ['username', 'phone', 'city', 'state'];

    for (const field of requiredFields) {
        if (!profile[field] || profile[field].trim() === '') {
            return false;
        }
    }

    return true;
};
