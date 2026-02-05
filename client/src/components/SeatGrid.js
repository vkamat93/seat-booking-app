/**
 * SeatGrid Component
 * Displays all desks in the office layout with pillars
 * 
 * Layout:
 * Main Section:                          Right Cluster:
 * [▮][491][492][493][494][495][▮]        [417][412] | [411][406]
 * [▮][490][489][488][487][486][▮]        [416][413] | [410][407]
 * ─────────────────────────              [415][414] | [409][408]
 * [480][481][482][483][484][485]
 * [479][478][477][476][475][474]
 */

import React from 'react';
import Seat from './Seat';
import './SeatGrid.css';

const SeatGrid = ({ seats, userSeatId, onBook, onRelease, isAuthenticated, loading }) => {
  // Helper to find seat by number
  const getSeat = (seatNumber) => seats.find(seat => seat.seatNumber === seatNumber);

  // Main section - Top rows (with pillars)
  const topRow1 = [491, 492, 493, 494, 495].map(getSeat).filter(Boolean);
  const topRow2 = [490, 489, 488, 487, 486].map(getSeat).filter(Boolean);

  // Main section - Bottom rows (no pillars)
  const bottomRow1 = [480, 481, 482, 483, 484, 485].map(getSeat).filter(Boolean);
  const bottomRow2 = [479, 478, 477, 476, 475, 474].map(getSeat).filter(Boolean);

  // Right cluster - Left side
  const rightLeftCol1 = [417, 416, 415].map(getSeat).filter(Boolean);
  const rightLeftCol2 = [412, 413, 414].map(getSeat).filter(Boolean);
  
  // Right cluster - Right side
  const rightRightCol1 = [411, 410, 409].map(getSeat).filter(Boolean);
  const rightRightCol2 = [406, 407, 408].map(getSeat).filter(Boolean);

  const renderSeat = (seat) => (
    <Seat
      key={seat._id}
      seat={seat}
      isUserSeat={userSeatId === seat._id}
      onBook={onBook}
      onRelease={onRelease}
      isAuthenticated={isAuthenticated}
      disabled={loading}
    />
  );

  return (
    <div className="seat-grid-container">
      <div className="office-header">
        <span>🖥️ OFFICE WORKSPACE</span>
      </div>
      
      <div className="office-layout">
        {/* Main Section */}
        <div className="main-section">
          {/* Top Section - with pillars */}
          <div className="office-section top-section">
            <div className="seat-row-with-pillars">
              <div className="pillar">▮</div>
              <div className="seats">
                {topRow1.map(renderSeat)}
              </div>
              <div className="pillar">▮</div>
            </div>
            
            <div className="seat-row-with-pillars">
              <div className="pillar">▮</div>
              <div className="seats">
                {topRow2.map(renderSeat)}
              </div>
              <div className="pillar">▮</div>
            </div>
          </div>

          {/* Aisle / Separator */}
          <div className="aisle"></div>

          {/* Bottom Section - no pillars */}
          <div className="office-section bottom-section">
            <div className="seat-row">
              <div className="seats">
                {bottomRow1.map(renderSeat)}
              </div>
            </div>
            
            <div className="seat-row">
              <div className="seats">
                {bottomRow2.map(renderSeat)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Cluster */}
        <div className="right-cluster">
          <div className="cluster-group">
            <div className="cluster-column">
              {rightLeftCol1.map(renderSeat)}
            </div>
            <div className="cluster-column">
              {rightLeftCol2.map(renderSeat)}
            </div>
          </div>
          
          <div className="cluster-divider"></div>
          
          <div className="cluster-group">
            <div className="cluster-column">
              {rightRightCol1.map(renderSeat)}
            </div>
            <div className="cluster-column">
              {rightRightCol2.map(renderSeat)}
            </div>
          </div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box legend-free"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box legend-booked"></div>
          <span>Occupied</span>
        </div>
        {isAuthenticated && (
          <div className="legend-item">
            <div className="legend-box legend-user"></div>
            <span>Your Desk</span>
          </div>
        )}
        <div className="legend-item">
          <div className="legend-pillar">▮</div>
          <span>Pillar</span>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
