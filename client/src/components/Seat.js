/**
 * Seat Component - Simple cell display with hover tooltip
 */

import React from 'react';
import './Seat.css';

const Seat = ({ seat, isUserSeat, onBook, onRelease, isAuthenticated }) => {
  const isBooked = seat.status === 'booked';
  const bookedUsername = seat.bookedBy?.username || null;

  const handleClick = () => {
    if (!isAuthenticated) return;
    
    if (isUserSeat) {
      onRelease();
    } else if (!isBooked) {
      onBook(seat._id);
    }
  };

  // Determine CSS class based on state
  let seatClass = 'seat';
  if (isUserSeat) {
    seatClass += ' seat-user';
  } else if (isBooked) {
    seatClass += ' seat-booked';
  } else {
    seatClass += ' seat-free';
  }

  return (
    <div className={seatClass} onClick={handleClick}>
      {seat.seatNumber}
      <span className="seat-tooltip">
        {bookedUsername || 'None'}
      </span>
    </div>
  );
};

export default Seat;
