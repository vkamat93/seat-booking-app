/**
 * SeatGrid Component
 * Displays all desks in a 2x6 office grid layout
 */

import React from 'react';
import Seat from './Seat';
import './SeatGrid.css';

const SeatGrid = ({ seats, userSeatId, onBook, onRelease, isAuthenticated, loading }) => {
  // Organize seats into rows
  // Row 1: Reverse order so 474 is at bottom, going upward (for mobile vertical layout)
  const row1 = seats.filter(seat => seat.row === 1).reverse();
  const row2 = seats.filter(seat => seat.row === 2);

  return (
    <div className="seat-grid-container">
      <div className="office-header">
        <span>🖥️ OFFICE WORKSPACE</span>
      </div>
      
      <div className="seat-grid">
        {/* Row 1 */}
        <div className="seat-row">
          <div className="row-label">Desk Row 1</div>
          <div className="seats">
            {row1.map(seat => (
              <Seat
                key={seat._id}
                seat={seat}
                isUserSeat={userSeatId === seat._id}
                onBook={onBook}
                onRelease={onRelease}
                isAuthenticated={isAuthenticated}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="seat-row">
          <div className="row-label">Desk Row 2</div>
          <div className="seats">
            {row2.map(seat => (
              <Seat
                key={seat._id}
                seat={seat}
                isUserSeat={userSeatId === seat._id}
                onBook={onBook}
                onRelease={onRelease}
                isAuthenticated={isAuthenticated}
                disabled={loading}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box legend-free"></div>
          <span>Available Desk</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-booked"></div>
          <span>Occupied</span>
        </div>
        {isAuthenticated && <div className="legend-item">
          <div className="legend-box legend-user"></div>
          <span>Your Desk</span>
        </div>}
      </div>
    </div>
  );
};

export default SeatGrid;
