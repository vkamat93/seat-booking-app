/**
 * Date Utilities
 * Standardizes date handling to IST (Asia/Kolkata) regardless of server timezone.
 */

/**
 * Get a Date object set to 00:00:00.000Z for the IST current day.
 * This ensures that when we store or query for "today", we are always
 * consistent with the IST calendar, even if the server is in UTC.
 * 
 * @param {Date|string|number} date - Optional date to convert
 * @returns {Date} - Date object at UTC Midnight of the IST calendar day
 */
const getISTDayStart = (date = new Date()) => {
    // Format to YYYY-MM-DD in Asia/Kolkata timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const dateStr = formatter.format(new Date(date)); // returns YYYY-MM-DD
    return new Date(`${dateStr}T00:00:00.000Z`);
};

/**
 * Parse a YYYY-MM-DD string into a Date object at UTC Midnight.
 * Used for consistency with getISTDayStart.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {Date} - Date object at UTC Midnight
 */
const parseDateToISTDayStart = (dateStr) => {
    if (!dateStr) return null;
    const baseDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    return new Date(`${baseDate}T00:00:00.000Z`);
};

/**
 * Get the start and end of a month in IST day boundaries.
 * 
 * @param {number} year 
 * @param {number} monthVal - 1-12
 * @returns {object} - { start, end } as UTC Date objects
 */
const getISTMonthBoundaries = (year, monthVal) => {
    const m = String(monthVal).padStart(2, '0');
    const start = new Date(`${year}-${m}-01T00:00:00.000Z`);
    const lastDay = new Date(year, monthVal, 0).getDate();
    const end = new Date(`${year}-${m}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`);
    return { start, end };
};

module.exports = {
    getISTDayStart,
    parseDateToISTDayStart,
    getISTMonthBoundaries
};
