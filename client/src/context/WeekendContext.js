import { createContext } from 'react'

export const WeekendContext = createContext(null)

// Check if it's weekend in India timezone
export const isWeekend = () => {
    const now = new Date();
    const ISTTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const day = ISTTime.getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
};

export const WeekendProvider = (props) => {
    // Only provide the isWeekend function, not the state
    // Each component manages its own showOverlay state
    return (
        <WeekendContext.Provider value={{ isWeekend }}>
            {props.children}
        </WeekendContext.Provider>
    )
}