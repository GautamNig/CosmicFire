import React from "react";
import GoogleIcon from "./GoogleIcon";

export default function AuthPage({ onSignIn }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">CosmicFire</h1>
        <p className="auth-subtitle">Join the celestial conversation</p>
        
        <div className="lottie-placeholder">
          <div className="fire-animation">
            <span>🔥</span>
          </div>
        </div>
        
        <button onClick={onSignIn} className="google-signin-btn">
          <GoogleIcon />
          Sign in with Google
        </button>
        
        <p className="auth-security-note">
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  );
}