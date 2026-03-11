import { useState } from "react"
import { isWeekend } from "../utils/dateUtils"
import "./WeekendOverlay.css"

const WeekendOverlay = () => {
    const [showOverlay, setShowOverlay] = useState(isWeekend())

    // Don't render anything if overlay should be hidden
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
                IDK, Let me in
            </button>
        </div>
    )
}

export default WeekendOverlay