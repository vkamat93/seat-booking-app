const now = new Date();

// Get date components
const year = now.getFullYear();
// Add 1 to getMonth() because it is 0-indexed
const month = now.getMonth() + 1; 
const date = now.getDate();

// Get the day of the week as a string
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayName = daysOfWeek[now.getDay()];

// Format the date (e.g., "Tuesday, 10/2/2026")
export const formattedCustomDate = `${dayName}, ${date}/${month}/${year}`;
