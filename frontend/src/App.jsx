// App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext, UserProvider } from './contexts/UserContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import User from './components/User';
import Home from './components/Home';
import './App.css';

function AppContent() {
  const { user, handleUserLogin, isLoading } = useContext(UserContext);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Sthaniya...</p>
      </div>
    );
  }

  return (
    <> 
    <div className="App">
      <Header user={user} />
      <main className="app-main">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Home />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleUserLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register onRegister={handleUserLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <User user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="*" 
            element={<Navigate to={user ? "/dashboard" : "/"} />} 
          />
        </Routes>
      </main>
    </div>

  </>
  )
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
