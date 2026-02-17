import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminAPI.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();

        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="dashboard-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0, color: '#1a202c' }}>Dashboard Overview</h1>
                <button className="admin-btn" onClick={() => { setLoading(true); window.location.reload(); }} disabled={loading}>
                    🔄 Refresh Page
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Users</h3>
                    <div className="value">{stats?.totalUsers || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Seats Booked Today</h3>
                    <div className="value">{stats?.seatsBookedToday || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Seats</h3>
                    <div className="value">{stats?.totalSeats || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Available Seats Today</h3>
                    <div className="value">{stats?.availableSeatsToday || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Month's Bookings</h3>
                    <div className="value">{stats?.totalBookingsMonth || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Occupancy</h3>
                    <div className="value">{stats?.occupancyPercentage || 0}%</div>
                </div>
            </div>

            {/* Visual charts could go here if a library was used */}
        </div>
    );
};

export default Dashboard;
