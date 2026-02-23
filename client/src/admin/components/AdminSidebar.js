import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <h2>Admin Panel</h2>
            <nav className="admin-nav">
                <NavLink to="/admin" end className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Dashboard
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Users
                </NavLink>
                <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Bookings
                </NavLink>
                <NavLink to="/admin/stats" className={({ isActive }) => isActive ? "admin-nav-item active" : "admin-nav-item"}>
                    Stats
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;