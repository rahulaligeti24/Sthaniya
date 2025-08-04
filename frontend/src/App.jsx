import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      if (JSON.parse(userData).role) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('roleSelection');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('roleSelection');
    }
  };

  const handleRegistration = (userData) => {
    setUser(userData);
    setCurrentView('roleSelection');
  };

  const handleRoleSelection = (role) => {
    const updatedUser = { ...user, role };
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setCurrentView('login');
  };

  const switchToRegister = () => setCurrentView('registration');
  const switchToLogin = () => setCurrentView('login');

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Sthaniya...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Sthaniya</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.name || user.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>

      <main className="app-main">
        {currentView === 'login' && (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={switchToRegister}
          />
        )}
        
        {currentView === 'registration' && (
          <Register
            onRegister={handleRegistration}
            onSwitchToLogin={switchToLogin}
          />
        )}
        
        {currentView === 'roleSelection' && (
          <RoleSelection 
            user={user}
            onRoleSelect={handleRoleSelection}
          />
        )}
        
        {currentView === 'dashboard' && (
          <Dashboard user={user} />
        )}
      </main>
    </div>
  );
}

export default App;