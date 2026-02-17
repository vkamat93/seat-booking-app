/**
 * Home Page
 * Main page displaying office desk booking interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { seatsAPI } from '../services/api';
import SeatGrid from '../components/SeatGrid';
import './Home.css';
import { Link } from 'react-router-dom';
import { formattedCustomDate } from '../utils/currentDateDay';

const Home = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all desks
  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await seatsAPI.getAll();
      setSeats(response.data);
      setError('');
    } catch (err) {
      setError('Desk layout not loaded. Please Login & try again.');
      console.error('Error fetching desks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();
    
    // Refresh desks every 30 seconds
    const interval = setInterval(fetchSeats, 30000);
    return () => clearInterval(interval);
  }, [fetchSeats]);

  // Book a desk
  const handleBook = async (seatId) => {
    if (!isAuthenticated) {
      setError('Please login to book a desk');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await seatsAPI.book(seatId);
      setSuccess('Desk booked successfully!');
      await fetchSeats();
      await refreshUser();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book desk');
    } finally {
      setActionLoading(false);
    }
  };

  // Release user's desk
  const handleRelease = async () => {
    try {
      setActionLoading(true);
      setError('');
      await seatsAPI.release();
      setSuccess('Desk released successfully!');
      await fetchSeats();
      await refreshUser();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to release desk');
    } finally {
      setActionLoading(false);
    }
  };

  // Get user's booked seat ID
  const userSeatId = user?.bookedSeat?._id || user?.bookedSeat;

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>👨🏻‍💻Connected Vehicle Desk Booking👩🏻‍💻</h1>
        <p>Reserve your workspace for {formattedCustomDate}</p>
        
        {!isAuthenticated && (
          <div className="info-banner">
            <span>ℹ️</span>
            Please <Link to="/login">login</Link> to book a desk
          </div>
        )}

        {isAuthenticated && userSeatId && (
          <div className="user-booking-info">
            <span>💼</span>
            You have booked <strong>Desk {seats.find(s => s._id === userSeatId)?.seatNumber || '...'}</strong>
          </div>
        )}

        {isAuthenticated && !userSeatId && (
          <div className="info-banner info-available">
            <span>✨</span>
            Select an available desk to reserve your workspace for today!
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✅</span> {success}
        </div>
      )}

      {loading && seats.length === 0 ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading desks...</p>
        </div>
      ) : (
        <SeatGrid
          seats={seats}
          userSeatId={userSeatId}
          onBook={handleBook}
          onRelease={handleRelease}
          isAuthenticated={isAuthenticated}
          loading={actionLoading}
        />
      )}

      <div className="auto-release-notice">
        <span>⏰</span>
        All desk reservations are automatically released at<strong>E.O.D</strong>daily
      </div>
    </div>
  );
};

export default Home;
