import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminAPI';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ role: '', status: '' });
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'USER' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [resetModal, setResetModal] = useState({ show: false, username: '', tempPassword: '' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers({
                search,
                ...filters,
                page,
                limit: 10,
                sortBy: sortConfig.key,
                order: sortConfig.direction
            });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setTotalUsers(response.data.totalUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset to first page on search/filter change
    }, [search, filters]);

    useEffect(() => {
        fetchUsers();
    }, [search, filters, page, sortConfig]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createUser(newUser);
            setShowModal(false);
            setNewUser({ username: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'disabled' : 'active';
        try {
            await adminAPI.updateUser(user._id, { status: newStatus });
            fetchUsers();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(id);
                fetchUsers();
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const handleResetPassword = async (id) => {
        if (window.confirm('Are you sure you want to reset this user\'s password to a temporary one?')) {
            try {
                const response = await adminAPI.resetPassword(id);
                const { tempPassword, username } = response.data;
                setResetModal({ show: true, username, tempPassword });
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to reset password');
            }
        }
    };

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(resetModal.tempPassword);
        alert('Password copied to clipboard!');
    };

    const handleShare = (platform) => {
        const text = `Hi ${resetModal.username}, your temporary password for the Desk Booking App is: ${resetModal.tempPassword}\nPlease login and change your password immediately.`;
        const encodedText = encodeURIComponent(text);

        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodedText}`;
                break;
            case 'teams':
                // Teams doesn't have a direct "message" protocol like WhatsApp for web, usually done via chat links or deep links
                url = `https://teams.microsoft.com/l/chat/0/0?users=&message=${encodedText}`;
                break;
            case 'sms':
                url = `sms:?body=${encodedText}`;
                break;
            default:
                if (navigator.share) {
                    navigator.share({ title: 'Temporary Password', text: text });
                    return;
                }
        }
        if (url) window.open(url, '_blank');
    };

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

    return (
        <div className="user-management">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1>User Management</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
                    Create New User
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Search by username..."
                    className="admin-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <select
                    className="admin-input"
                    style={{ maxWidth: '150px' }}
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                    <option value="">All Roles</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <select
                    className="admin-input"
                    style={{ maxWidth: '150px' }}
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                </select>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('username')}>
                                Username {getSortIcon('username')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('role')}>
                                Role {getSortIcon('role')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('todaySeat')}>
                                Seat Booked? {getSortIcon('todaySeat')}
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('createdAt')}>
                                Created At {getSortIcon('createdAt')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>
                                        <span className={`badge badge-${(user.role || 'USER').toLowerCase()}`}>
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.todaySeat ? (
                                            <span className="badge badge-active" style={{ background: '#dcfce7', color: '#166534' }}>
                                                Yes - {user.todaySeat}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
                                                Not Booked
                                            </span>
                                        )}
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="admin-btn"
                                                style={{ background: '#edf2f7', fontSize: '0.75rem' }}
                                                onClick={() => handleToggleStatus(user)}
                                            >
                                                {user.status === 'active' ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                className="admin-btn"
                                                style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.75rem' }}
                                                onClick={() => handleResetPassword(user._id)}
                                            >
                                                Reset PW
                                            </button>
                                            <button
                                                className="admin-btn"
                                                style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem' }}
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <div style={{ color: '#4a5568', fontSize: '0.875rem' }}>
                    Showing {users.length} of {totalUsers} users
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="admin-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontWeight: 600 }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="admin-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', width: '400px' }}>
                        <h2>Create New User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="admin-form-group">
                                <label>Username</label>
                                <input
                                    className="admin-input"
                                    value={newUser.username}
                                    required
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    className="admin-input"
                                    value={newUser.password}
                                    required
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Role</label>
                                <select
                                    className="admin-input"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="admin-btn admin-btn-primary">Create</button>
                                <button type="button" className="admin-btn" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {resetModal.show && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '0.8rem', width: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
                            <h2 style={{ margin: 0, color: '#1a202c' }}>Password Reset</h2>
                            <p style={{ color: '#718096', marginTop: '0.5rem' }}>Temporary password generated for <strong>{resetModal.username}</strong></p>
                        </div>

                        <div style={{
                            background: '#f7fafc',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            border: '1px dashed #cbd5e0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '2px', fontFamily: 'monospace' }}>
                                {resetModal.tempPassword}
                            </span>
                            <button
                                onClick={handleCopyPassword}
                                style={{ background: '#edf2f7', border: 'none', padding: '0.5rem', borderRadius: '0.375rem', cursor: 'pointer' }}
                                title="Copy to clipboard"
                            >
                                📋 Copy
                            </button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Share via</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <button className="admin-btn" style={{ background: '#25D366', color: 'white', border: 'none' }} onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                                <button className="admin-btn" style={{ background: '#444791', color: 'white', border: 'none' }} onClick={() => handleShare('teams')}>Teams</button>
                                <button className="admin-btn" style={{ background: '#4A5568', color: 'white', border: 'none' }} onClick={() => handleShare('sms')}>SMS</button>
                            </div>
                        </div>

                        <button
                            className="admin-btn admin-btn-primary"
                            style={{ width: '100%', padding: '0.75rem' }}
                            onClick={() => setResetModal({ ...resetModal, show: false })}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
