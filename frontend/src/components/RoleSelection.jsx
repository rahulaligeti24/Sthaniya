import React, { useState } from 'react';
import './css/RoleSelection.css';

const RoleSelection = ({ user, onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'user',
      title: 'User',
      description: 'Access and interact with content on Sthaniya',
      icon: '👤',
      features: [
        'Browse and discover content',
        'Create personal collections',
        'Engage with community',
        'Access basic features'
      ]
    },
    {
      value: 'contributor',
      title: 'Contributor',
      description: 'Create and share content with the community',
      icon: '✍️',
      features: [
        'All user features',
        'Create and publish content',
        'Manage your contributions',
        'Access analytics dashboard',
        'Community recognition'
      ]
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        onRoleSelect(selectedRole);
      } else {
        setError(data.message || 'Failed to update role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-container">
      <div className="role-card">
        <h2>Choose Your Role</h2>
        <p className="role-subtitle">
          Hi {user?.name || user?.email}! Please select your role to get started with Sthaniya.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="role-options">
          {roles.map((role) => (
            <div
              key={role.value}
              className={`role-option ${selectedRole === role.value ? 'selected' : ''}`}
              onClick={() => handleRoleSelect(role.value)}
            >
              <div className="role-icon">{role.icon}</div>
              <div className="role-content">
                <h3>{role.title}</h3>
                <p className="role-description">{role.description}</p>
                <ul className="role-features">
                  {role.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="role-selector">
                <div className={`radio ${selectedRole === role.value ? 'checked' : ''}`}>
                  {selectedRole === role.value && <div className="radio-dot"></div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="auth-btn primary"
          disabled={loading || !selectedRole}
        >
          {loading ? 'Setting up your account...' : 'Continue'}
        </button>

        <p className="role-note">
          Don't worry, you can change your role later in your account settings.
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;