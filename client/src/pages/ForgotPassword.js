/**
 * Forgot Password Page
 * Allows users to reset their password using original credentials from credentials.json
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.resetWithDefaultPassword({ username, defaultPassword });
      
      // If successful, the user has been reset - now log them in
      // The response should contain a token for the reset user
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: response.data._id,
          username: response.data.username,
          role: response.data.role,
          mustChangePassword: true
        }));
        
        // Redirect to change password page
        navigate('/change-password');
        window.location.reload(); // Reload to update auth context
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid credentials. Please contact your administrator for assistance.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password ?</h1>
          <p>Enter your username and default password to reset</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="defaultPassword">Default Password</label>
            <input
              type="password"
              id="defaultPassword"
              value={defaultPassword}
              onChange={(e) => setDefaultPassword(e.target.value)}
              placeholder="Enter your original/default password"
              required
              disabled={loading}
            />
            <small style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              This is the password originally sent by admin
            </small>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Verifying...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
