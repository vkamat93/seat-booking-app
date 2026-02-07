/**
 * Footer Component
 * Simple footer with creator credit
 */

import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <span className="footer-text">
          Made by Vikrant & Ashish 🤓
          <p>----Connected Vehicle----</p>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
