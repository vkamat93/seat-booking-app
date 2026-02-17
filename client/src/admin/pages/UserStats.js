import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';

const UserStats = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await adminAPI.getUsers({ limit: 100 });
                setUsers(response.data.data.users);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const fetchStats = async () => {
        if (!selectedUser || !month) return;
        setLoading(true);
        try {
            const response = await adminAPI.getUserStats(selectedUser, month);
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedUser, month]);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserSelect = (user) => {
        setSelectedUser(user._id);
        setSearchTerm(user.username);
        setShowDropdown(false);
    };

    return (
        <div className="user-stats">
            <h1 style={{ color: '#1a202c' }}>User Statistics</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="admin-form-group" style={{ marginBottom: 0, position: 'relative', width: '250px' }}>
                    <label>User</label>
                    <input
                        type="text"
                        className="admin-input"
                        placeholder="Search user..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowDropdown(true);
                            if (e.target.value === '') setSelectedUser('');
                        }}
                        onFocus={() => setShowDropdown(true)}
                    />
                    {showDropdown && (searchTerm || filteredUsers.length > 0) && (
                        <div className="search-dropdown">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(u => (
                                    <div
                                        key={u._id}
                                        className="search-dropdown-item"
                                        onClick={() => handleUserSelect(u)}
                                    >
                                        {u.username}
                                    </div>
                                ))
                            ) : (
                                <div className="search-dropdown-item no-results">No users found</div>
                            )}
                        </div>
                    )}
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                    <label>Month</label>
                    <input
                        type="month"
                        className="admin-input"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div>Loading stats...</div>
            ) : stats ? (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Booked Days</h3>
                            <div className="value">{stats.totalBooked}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Cancelled/Released</h3>
                            <div className="value">{stats.totalCancelled}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Attendance Rate</h3>
                            <div className="value">{stats.attendancePercentage.toFixed(1)}%</div>
                        </div>
                        <div className="stat-card">
                            <h3>Top Seat</h3>
                            <div className="value">{stats.mostFreqSeat || 'N/A'}</div>
                        </div>
                    </div>

                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Seat</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.bookings.map((b, i) => (
                                    <tr key={i}>
                                        <td>{new Date(b.date).toLocaleDateString()}</td>
                                        <td>{b.seatNumber}</td>
                                        <td>
                                            <span className={`badge badge-${b.status}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>
                    Select a user and month to view detailed statistics
                </div>
            )}
        </div>
    );
};

export default UserStats;
