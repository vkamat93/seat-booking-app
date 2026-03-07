import React, { useState, useContext } from 'react'
import { WeekendContext } from '../context/WeekendContext';
import './WeekendOverlay.css';

const WeekendOverlay = () => {
    const { isWeekend } = useContext(WeekendContext);
    // Each instance of WeekendOverlay has its own local state
    const [showOverlay, setShowOverlay] = useState(isWeekend());

    if (!showOverlay) return null;

    return (
        <div className="stop-overlay">
            <img
                src="/stop-it-is-weekend.jpg"
                alt="Stop Image"
                className="stop-overlay-image"
            />
            <button
                className="stop-overlay-close"
                onClick={() => setShowOverlay(false)}
                aria-label="Close overlay"
            >
                Ugh, Let me in
            </button>
        </div>
    )
}

export default WeekendOverlay