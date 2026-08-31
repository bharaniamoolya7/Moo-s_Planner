import { useState } from 'react';
import { Link } from 'react-router-dom';
import AboutModal from '../components/AboutModal';
import SupportModal from '../components/SupportModal';
import './Welcome.css';

export default function Welcome() {
  const [showAbout, setShowAbout] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <div className="welcome-page">
      {/* Background decorations - isometric room corners */}
      <div className="welcome-bg-decor top-left">
        <div className="iso-room-mini"></div>
      </div>
      <div className="welcome-bg-decor top-right">
        <div className="iso-room-mini"></div>
      </div>
      <div className="welcome-bg-decor bottom-left">
        <div className="iso-room-mini"></div>
      </div>
      <div className="welcome-bg-decor bottom-right">
        <div className="iso-room-mini"></div>
      </div>

      {/* Floating decorations */}
      <span className="welcome-star s1">✦</span>
      <span className="welcome-star s2">✧</span>
      <span className="welcome-star s3">✦</span>
      <span className="welcome-star s4">♡</span>

      {/* Main card */}
      <div className="welcome-card">
        <div className="welcome-card-inner">
          {/* Website Logo */}
          <div className="welcome-icon-wrapper">
            <img 
              src="/logo.png" 
              alt="moo'splanner logo" 
              style={{ width: 88, height: 88, borderRadius: 18, border: '3px solid var(--border-dark)', boxShadow: '4px 4px 0px rgba(74, 55, 40, 0.2)', objectFit: 'cover' }} 
            />
          </div>

          {/* Brand */}
          <h1 className="welcome-title">moo'splanner</h1>
          <p className="welcome-tagline">Your little space to remember everything.</p>

          {/* CTA */}
          <Link to="/signup" className="btn btn-primary btn-lg welcome-start-btn">
            Start →
          </Link>

          {/* Login link */}
          <p className="welcome-login-text">
            Already have a diary? <Link to="/login" className="welcome-login-link">Log in here</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="welcome-footer">
        <span className="welcome-footer-brand">☾ moo'splanner</span>
        <div className="welcome-footer-links">
          <button 
            type="button" 
            className="footer-link-btn"
            onClick={() => setShowAbout(true)}
          >
            About
          </button>
          <button 
            type="button" 
            className="footer-link-btn"
            onClick={() => setShowSupport(true)}
          >
            Support
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}
