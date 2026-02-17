import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';
import { seatsAPI } from '../../services/api';

const ScheduledBooking = () => {
    const [users, setUsers] = useState([]);
    const [seats, setSeats] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedSeat, setSelectedSeat] = useState('');
    const [selectedDates, setSelectedDates] = useState([]); // Simplified: will use a list of dates
    const [currentDate, setCurrentDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, seatsRes] = await Promise.all([
                    adminAPI.getUsers({ limit: 100 }),
                    seatsAPI.getAll()
                ]);
                setUsers(usersRes.data.users);
                setSeats(seatsRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    const addDate = () => {
        if (currentDate && !selectedDates.includes(currentDate)) {
            setSelectedDates([...selectedDates, currentDate]);
            setCurrentDate('');
        }
    };

    const removeDate = (date) => {
        setSelectedDates(selectedDates.filter(d => d !== date));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedSeat || selectedDates.length === 0) {
            alert('Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await adminAPI.createManualBookings({
                userId: selectedUser,
                seatId: selectedSeat,
                dates: selectedDates
            });
            alert(response.data.message);
            if (response.data.errors.length > 0) {
                console.warn('Conflicts:', response.data.errors);
            }
            setSelectedDates([]);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create bookings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scheduled-booking">
            <h1 style={{ color: '#1a202c' }}>Scheduled Booking (Manual)</h1>
            <p style={{ color: '#718096', marginBottom: '2rem' }}>Manually assign a seat to a user for one or more dates.</p>

            <div className="admin-table-container" style={{ padding: '2rem', maxWidth: '600px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label>Select User</label>
                        <select
                            className="admin-input"
                            value={selectedUser}
                            required
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="">-- Choose User --</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.username}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label>Select Seat</label>
                        <select
                            className="admin-input"
                            value={selectedSeat}
                            required
                            onChange={(e) => setSelectedSeat(e.target.value)}
                        >
                            <option value="">-- Choose Seat --</option>
                            {seats.map(s => (
                                <option key={s._id} value={s._id}>Seat {s.seatNumber} (Row {s.row})</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label>Add Dates</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="date"
                                className="admin-input"
                                value={currentDate}
                                onChange={(e) => setCurrentDate(e.target.value)}
                            />
                            <button type="button" className="admin-btn" onClick={addDate}>Add</button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Selected Dates:</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {selectedDates.length === 0 ? (
                                <span style={{ fontSize: '0.875rem', color: '#a0aec0' }}>No dates selected</span>
                            ) : (
                                selectedDates.map(date => (
                                    <span key={date} className="badge" style={{ background: '#edf2f7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {date}
                                        <button
                                            type="button"
                                            onClick={() => removeDate(date)}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e53e3e', fontWeight: 'bold' }}
                                        >×</button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="admin-btn admin-btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Scheduled Bookings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ScheduledBooking;
