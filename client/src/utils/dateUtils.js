/**
 * Date utility functions for the application
 * Timezone: Asia/Kolkata (IST)
 */

/**
 * Check if current time is weekend (Saturday or Sunday) in IST
 * @returns {boolean}
 */
export const isWeekend = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
};
