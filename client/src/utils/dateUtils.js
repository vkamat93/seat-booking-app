/**
 * Frontend Date Utilities
 */

/**
 * Formats a given UTC date string as exactly the calendar date it represents in the database,
 * overriding the user's local timezone shift.
 * 
 * @param {string|Date} date - The UTC date (e.g., '2026-02-10T00:00:00.000Z')
 * @param {Intl.DateTimeFormatOptions} options - Additional options for toLocaleDateString
 * @returns {string} The formatted calendar date string.
 */
export const formatUTCDate = (date, options = {}) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString(undefined, {
        timeZone: 'UTC', // Force rendering using the UTC timezone block it was stored in
        ...options
    });
};
