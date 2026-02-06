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
          Made with <span className="heart">❤</span> by Connected Vehicle Unit
        </span>
      </div>
    </footer>
  );
};

export default Footer;
