import React from 'react';
import { useNavigate } from 'react-router-dom';
import walletImg from '../assets/wallet.png';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          {/* Fallback logo since specific asset not found in reference */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D9A441" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
          </svg>
        </div>
      </header>

      <div className="landing-visual">
        <img src={walletImg} alt="Wallet full of money" className="wallet-image" />
      </div>

      <main className="landing-main">
        <div className="landing-content">
          <h1 className="landing-title">
            Bill<span className="text-gold">Vault</span>
          </h1>
          
          <div className="landing-accent">
            <span className="accent-line"></span>
            <span className="accent-dot"></span>
            <span className="accent-line"></span>
          </div>

          <h2 className="landing-tagline">
            Your Bills. Your Business.<br />
            All in One <span className="text-gold">Secure Vault.</span>
          </h2>

          <p className="landing-description">
            Simplify billing, track payments, and grow<br />
            your business with confidence.
          </p>

          <button 
            className="landing-login-btn"
            onClick={() => navigate('/dashboard')}
          >
            <svg 
              viewBox="0 0 24 24" 
              width="20" 
              height="20" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
              className="login-icon"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            LOGIN
          </button>
        </div>
      </main>

      <div className="landing-waves">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="wave-svg">
          <path fill="none" stroke="rgba(217, 164, 65, 0.2)" strokeWidth="1.5" d="M0,160 C320,300 420,0 720,120 C1020,240 1120,60 1440,200" />
          <path fill="none" stroke="rgba(217, 164, 65, 0.15)" strokeWidth="1" d="M0,200 C400,320 600,50 900,160 C1200,270 1300,120 1440,240" />
          <path fill="none" stroke="rgba(217, 164, 65, 0.08)" strokeWidth="0.8" d="M0,250 C300,350 700,100 1000,200 C1300,300 1400,200 1440,280" />
          <path fill="none" stroke="rgba(217, 164, 65, 0.05)" strokeWidth="0.5" d="M0,280 C250,380 650,150 950,250 C1250,350 1350,250 1440,300" />
        </svg>
      </div>
    </div>
  );
}

export default LandingPage;
