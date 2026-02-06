/**
 * Main App Component
 * Sets up routing and authentication provider
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import './App.css';

// Protected route wrapper - redirects to login if not authenticated
// Also redirects to change-password if user must change password
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Force password change for first-time users
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" />;
  }
  
  return children;
};

// Guest route wrapper - redirects to home if already authenticated
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (isAuthenticated) {
    // If authenticated but must change password, redirect there first
    if (user?.mustChangePassword) {
      return <Navigate to="/change-password" />;
    }
    return <Navigate to="/" />;
  }
  
  return children;
};

// Password change route - only for authenticated users who must change password
const PasswordChangeRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If password already changed, redirect to home
  if (!user?.mustChangePassword) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Home page - accessible to all (guests can view, but not book) */}
            <Route path="/" element={<Home />} />
            
            {/* Login page - only for guests */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            
            {/* Change password - only for authenticated users who must change password */}
            <Route
              path="/change-password"
              element={
                <PasswordChangeRoute>
                  <ChangePassword />
                </PasswordChangeRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
