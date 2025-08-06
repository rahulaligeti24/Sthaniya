import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Header.css';
import { UserContext } from '../contexts/UserContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, handleUserLogout } = useContext(UserContext);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/register');
  };

  const handleBrandClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo/Brand */}
        <div className="header-brand">
          <h1 className="brand-name" onClick={handleBrandClick}>
            Sthaniya
          </h1>
        </div>

        {/* Auth Buttons or User Info */}
        {user ? (
          <div className="user-info">
            <span>Welcome, {user.name || user.email}</span>
            <button className="logout-btn" onClick={handleUserLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
            <button className="signup-btn" onClick={handleSignup}>
              Sign Up
            </button>
            {/* <div id="google_translate_element"></div> */}

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
