import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';
import { seatsAPI } from '../../services/api';

const ScheduledBooking = () => {
    const [users, setUsers] = useState([]);
    const [seats, setSeats] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);
    const [isEveryday, setIsEveryday] = useState(false);
    const [futureBookings, setFutureBookings] = useState([]);
    const [permanentSeats, setPermanentSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const fetchData = async () => {
        try {
            const [usersRes, seatsRes, futureRes, perpetualRes] = await Promise.all([
                adminAPI.getUsers({ limit: 1000 }),
                seatsAPI.getAll(),
                adminAPI.getFutureBookings(),
                adminAPI.getPerpetualSeats()
            ]);
            setUsers(usersRes.data.data.users);
            setSeats(seatsRes.data.data);
            setFutureBookings(futureRes.data.data);
            setPermanentSeats(perpetualRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
    ).slice(0, 10);

    const toggleDate = (dateStr) => {
        if (selectedDates.includes(dateStr)) {
            setSelectedDates(selectedDates.filter(d => d !== dateStr));
        } else {
            setSelectedDates([...selectedDates, dateStr]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser || !selectedSeat) {
            alert('Please select a user and a seat.');
            return;
        }

        if (!isEveryday && selectedDates.length === 0) {
            alert('Please select at least one date.');
            return;
        }

        setLoading(true);
        try {
            if (isEveryday) {
                const response = await adminAPI.createPerpetualBooking({
                    userId: selectedUser._id,
                    seatId: selectedSeat
                });
                alert(response.data.message);
            } else {
                const response = await adminAPI.createManualBookings({
                    userId: selectedUser._id,
                    seatId: selectedSeat,
                    dates: selectedDates
                });
                alert(response.data.message);
                setSelectedDates([]);
            }
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFuture = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this future booking?')) return;
        try {
            await adminAPI.releaseBookings({ bookingIds: [bookingId] });
            fetchData();
        } catch (error) {
            alert('Failed to delete booking');
        }
    };

    const handleDeletePerpetual = async (seatId) => {
        if (!window.confirm('Are you sure you want to remove permanent status from this seat?')) return;
        try {
            await adminAPI.deletePerpetualBooking(seatId);
            fetchData();
        } catch (error) {
            alert('Failed to remove perpetual status');
        }
    };

    const renderCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        return (
            <div className="calendar-container" style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button type="button" className="admin-btn" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setCalendarDate(new Date(year, month - 1, 1))}>&lt;</button>
                    <span style={{ fontWeight: 'bold' }}>{monthNames[month]} {year}</span>
                    <button type="button" className="admin-btn" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setCalendarDate(new Date(year, month + 1, 1))}>&gt;</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#718096', paddingBottom: '0.5rem' }}>{d}</div>)}
                    {days.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`}></div>;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelected = selectedDates.includes(dateStr);
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => toggleDate(dateStr)}
                                style={{
                                    padding: '0.5rem 0',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    backgroundColor: isSelected ? '#3182ce' : 'transparent',
                                    color: isSelected ? 'white' : (isToday ? '#3182ce' : '#2d3748'),
                                    fontWeight: isToday ? 'bold' : 'normal',
                                    border: isToday ? '1px solid #3182ce' : 'none'
                                }}
                                onMouseEnter={(e) => !isSelected && (e.target.style.backgroundColor = '#edf2f7')}
                                onMouseLeave={(e) => !isSelected && (e.target.style.backgroundColor = 'transparent')}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="scheduled-booking">
            <h1 style={{ color: '#1a202c' }}>Scheduled & Perpetual Booking</h1>
            <p style={{ color: '#718096', marginBottom: '2rem' }}>Manually assign a seat to a user for one or more dates, or as a permanent (perpetual) booking.</p>

            <div className="admin-table-container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto 4rem' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <div className="admin-form-group" style={{ position: 'relative' }}>
                                <label>Select User</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="Type username..."
                                    value={userSearchTerm}
                                    onChange={(e) => {
                                        setUserSearchTerm(e.target.value);
                                        setShowSuggestions(true);
                                        if (!e.target.value) setSelectedUser(null);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                {showSuggestions && userSearchTerm && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 10,
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.375rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        marginTop: '0.25rem'
                                    }}>
                                        {filteredUsers.length === 0 ? (
                                            <div style={{ padding: '0.75rem', color: '#718096', fontSize: '0.875rem' }}>No users found</div>
                                        ) : (
                                            filteredUsers.map(u => (
                                                <div
                                                    key={u._id}
                                                    style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #f7fafc' }}
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setUserSearchTerm(u.username);
                                                        setShowSuggestions(false);
                                                    }}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f7fafc')}
                                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                                                >
                                                    {u.username}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                {selectedUser && (
                                    <div style={{ fontSize: '0.75rem', color: '#38a169', marginTop: '0.25rem' }}>
                                        ✓ Selected: {selectedUser.username}
                                    </div>
                                )}
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
                                        <option key={s._id} value={s._id}>
                                            Seat {s.seatNumber} (Row {s.row}) {s.isPermanent ? '(Permanent)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                    disabled={loading || !selectedUser || !selectedSeat || (!isEveryday && selectedDates.length === 0)}
                                >
                                    {loading ? 'Creating...' : isEveryday ? 'Assign Permanently' : `Create ${selectedDates.length} Bookings`}
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={isEveryday}
                                        onChange={(e) => setIsEveryday(e.target.checked)}
                                    />
                                    <strong>Book Everyday (Perpetual)</strong>
                                </label>
                            </div>

                            {!isEveryday ? (
                                <>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Dates</label>
                                    {renderCalendar()}
                                    <div style={{ marginTop: '1rem' }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4a5568' }}>Selected: {selectedDates.length} days</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                                            {selectedDates.sort().slice(0, 5).map(date => (
                                                <span key={date} style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: '12px' }}>{date}</span>
                                            ))}
                                            {selectedDates.length > 5 && <span style={{ fontSize: '0.7rem' }}>+{selectedDates.length - 5} more</span>}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '2rem', background: '#f7fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e0', textAlign: 'center' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔁</div>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Perpetual Assignment</h4>
                                    <p style={{ fontSize: '0.875rem', color: '#718096', lineHeight: '1.4' }}>
                                        This user will have this seat reserved every day.<br />
                                        One-off schedules cannot be made for permanent seats.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div style={{ padding: '0 2rem 4rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
                    {/* Perpetual Seats Section */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: '#2d3748', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Permanent Seat Holders</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#718096' }}>({permanentSeats.length})</span>
                        </h2>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Seat</th>
                                        <th>User</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permanentSeats.length === 0 ? (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>No permanent seats assigned</td></tr>
                                    ) : (
                                        permanentSeats.map(s => (
                                            <tr key={s._id}>
                                                <td style={{ fontWeight: 600 }}>Seat {s.seatNumber}</td>
                                                <td>{s.permanentUser?.username || 'Unknown'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeletePerpetual(s._id)}
                                                        className="admin-btn"
                                                        style={{ color: '#dc2626', background: 'none', padding: '0', border: 'none', fontSize: '0.875rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Future Bookings Section */}
                    <div>
                        <h2 style={{ fontSize: '1.25rem', color: '#2d3748', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Future Scheduled Bookings</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#718096' }}>({futureBookings.length})</span>
                        </h2>
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Seat</th>
                                        <th>User</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {futureBookings.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>No future bookings scheduled</td></tr>
                                    ) : (
                                        futureBookings.map(b => (
                                            <tr key={b._id}>
                                                <td>{new Date(b.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                                <td style={{ fontWeight: 600 }}>Seat {b.seat?.seatNumber}</td>
                                                <td>{b.user?.username || 'Unknown'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteFuture(b._id)}
                                                        className="admin-btn"
                                                        style={{ color: '#dc2626', background: 'none', padding: '0', border: 'none', fontSize: '0.875rem' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduledBooking;
