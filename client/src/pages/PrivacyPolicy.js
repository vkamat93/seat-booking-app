import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <h1>Privacy Policy</h1>
        <p className="privacy-updated">Last Updated: February 24, 2026</p>
      </div>

      <div className="privacy-content">
        <section className="privacy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>Desk Booking App</strong>. We value your privacy and are committed to
            protecting your personal data. This Privacy Policy explains how we collect, use, and
            safeguard your information when you use our desk reservation mobile application.
          </p>
        </section>

        <section className="privacy-section">
          <h2>2. Information We Collect</h2>
          <p>
            Our app is restricted to administrator-created accounts. We collect and process the
            following limited personal information:
          </p>
          <ul>
            <li>
              <strong>Account Information:</strong> Your username and an auto-generated password
              provided by your administrator.
            </li>
            <li>
              <strong>Reservation Data:</strong> Desk numbers, booking status, and timestamps
              associated with your desk selections.
            </li>
            <li>
              <strong>Authentication Data:</strong> Login credentials (securely encrypted) and
              password change records to ensure secure access.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected data strictly for the following purposes:</p>
          <ul>
            <li>
              <strong>Service Delivery:</strong> To manage desk availability, process your
              reservations, and display real-time booking statuses.
            </li>
            <li>
              <strong>Automatic Desk Release:</strong> All desk bookings are automatically released
              daily to ensure fair availability for all users.
            </li>
            <li>
              <strong>Security:</strong> To restrict access to authorized users only and facilitate
              the mandatory initial password change upon first login.
            </li>
            <li>
              <strong>Notifications:</strong> The app uses local on-device reminders to help you
              stay informed about desk availability. These notifications are scheduled entirely on
              your device and do not send any personal data to our servers.
            </li>
            <li>
              <strong>App Metrics:</strong> To display desk availability summaries to all logged-in
              users.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>4. Data Storage and Access</h2>
          <p>All data is stored on a secure backend server.</p>
          <ul>
            <li>
              <strong>Visibility:</strong> Desk numbers and booking statuses are visible to all
              logged-in users. Guest users can view desk availability but cannot make bookings.
            </li>
            <li>
              <strong>Identification:</strong> Details regarding who booked a specific desk are
              accessible only to logged-in users within the app.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>5. Data Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. Data is only
            shared in the following circumstances:
          </p>
          <ul>
            <li>
              <strong>With Administrators:</strong> Your account is managed by an organization
              administrator who has the authority to create, manage, and delete your profile.
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required by law to comply with legal processes
              or protect the rights and safety of our users.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>6. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including:</p>
          <ul>
            <li>
              <strong>Password Encryption:</strong> All passwords are securely encrypted before
              storage. Plain-text passwords are never stored.
            </li>
            <li>
              <strong>Secure Sessions:</strong> Your login sessions are managed using secure,
              time-limited tokens that expire automatically.
            </li>
            <li>
              <strong>Mandatory Password Change:</strong> Users are required to change their
              auto-generated passwords upon first login to ensure account security.
            </li>
            <li>
              <strong>Encrypted Communication:</strong> Data transmitted between the app and the
              server is encrypted.
            </li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>7. User Rights and Data Retention</h2>
          <p>
            Since accounts are created by an administrator, you may contact your administrator to:
          </p>
          <ul>
            <li>Request the deletion of your account and all associated booking data.</li>
            <li>Correct or update your username.</li>
            <li>Reset your password.</li>
            <li>Inquire about the data stored about you.</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo;
            date.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact your organization
            administrator.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
