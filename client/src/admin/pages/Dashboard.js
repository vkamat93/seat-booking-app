import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminAPI.getStats();
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="dashboard-page">
            <h1 style={{ marginBottom: '2rem', color: '#1a202c' }}>Dashboard Overview</h1>

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