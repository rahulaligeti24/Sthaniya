import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Welcome to Sthaniya</h1>
        <p>Your local community platform</p>
        <div className="hero-buttons">
          <Link to="/login" className="btn-hero btn-hero-primary">
            Login
          </Link>
          <Link to="/register" className="btn-hero btn-hero-secondary">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;