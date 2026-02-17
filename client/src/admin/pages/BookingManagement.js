import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [selectedBookings, setSelectedBookings] = useState([]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getBookings({
                ...filters,
                sortBy: sortConfig.key,
                order: sortConfig.direction
            });
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filters, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '🔼' : '🔽';
    };

    const handleReleaseSelected = async () => {
        if (selectedBookings.length === 0) {
            alert('Please select specific bookings for release');
            return;
        }

        if (window.confirm(`Are you sure you want to release ${selectedBookings.length} selected bookings?`)) {
            try {
                const result = await adminAPI.releaseBookings({ bookingIds: selectedBookings });
                alert(`${result.data.count} bookings released.`);
                setSelectedBookings([]);
                fetchBookings();
            } catch (error) {
                alert('Failed to release bookings');
            }
        }
    };

    const handleClearToday = async () => {
        if (window.confirm('Are you sure you want to clear ALL booked seats for TODAY ONLY? This will not affect future scheduled bookings.')) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const result = await adminAPI.releaseBookings({
                    dateRange: { start: today, end: today }
                });
                alert(`${result.data.count} seats cleared for today.`);
                fetchBookings();
            } catch (error) {
                alert('Failed to clear seats');
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedBookings.length === bookings.filter(b => b.status === 'booked').length) {
            setSelectedBookings([]);
        } else {
            setSelectedBookings(bookings.filter(b => b.status === 'booked').map(b => b._id));
        }
    };

    const toggleSelectBooking = (id) => {
        if (selectedBookings.includes(id)) {
            setSelectedBookings(selectedBookings.filter(item => item !== id));
        } else {
            setSelectedBookings([...selectedBookings, id]);
        }
    };

    return (
        <div className="booking-management">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                <h1 style={{ color: '#1a202c', margin: 0 }}>Booking Management</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="admin-btn"
                        style={{ background: '#718096', color: 'white' }}
                        onClick={handleReleaseSelected}
                        disabled={selectedBookings.length === 0}
                    >
                        Release Selected ({selectedBookings.length})
                    </button>
                    <button
                        className="admin-btn"
                        style={{ background: '#dc2626', color: 'white' }}
                        onClick={handleClearToday}
                    >
                        Clear All Seats Today
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Start Date</label>
                    <input
                        type="date"
                        className="admin-input"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>End Date</label>
                    <input
                        type="date"
                        className="admin-input"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.75rem' }}>Status</label>
                    <select
                        className="admin-input"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="booked">Booked</option>
                        <option value="released">Released</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={toggleSelectAll}
                                    checked={bookings.length > 0 && selectedBookings.length === bookings.filter(b => b.status === 'booked').length}
                                />
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('date')}>
                                Date {getSortIcon('date')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('user')}>
                                User {getSortIcon('user')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('seat')}>
                                Seat {getSortIcon('seat')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('status')}>
                                Status {getSortIcon('status')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('createdAt')}>
                                Booked At {getSortIcon('createdAt')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading bookings...</td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No bookings found</td></tr>
                        ) : (
                            bookings.map(booking => (
                                <tr key={booking._id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            disabled={booking.status !== 'booked'}
                                            checked={selectedBookings.includes(booking._id)}
                                            onChange={() => toggleSelectBooking(booking._id)}
                                        />
                                    </td>
                                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                                    <td>{booking.user?.username || 'Unknown'}</td>
                                    <td>{booking.seat?.seatNumber}</td>
                                    <td>
                                        <span className={`badge badge-${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>{new Date(booking.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingManagement;
