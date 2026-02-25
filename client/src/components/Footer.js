/**
 * Footer Component
 * Simple footer with creator credit
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <span className="footer-text">
          🛠️ Built by Vikrant & Ashish 🤓
        </span>
        <span className="footer-divider">
          ⚡ Connected Vehicle ⚡
        </span>
        <Link to="/privacy-policy" className="footer-privacy-link">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
