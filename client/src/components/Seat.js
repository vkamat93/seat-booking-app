/**
 * Seat Component - Simple cell display
 */

import React from 'react';
import './Seat.css';

const Seat = ({ seat, isUserSeat, onBook, onRelease, isAuthenticated }) => {
  const isBooked = seat.status === 'booked';
  
  const handleClick = () => {
    if (!isAuthenticated) return; // Only authenticated users can book
    
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
    </div>
  );
};

export default Seat;
