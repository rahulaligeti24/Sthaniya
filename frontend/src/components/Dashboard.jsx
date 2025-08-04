import React from 'react';
import './css/Dashboard.css'
import User from './User'
import Contributor from './Contributor';

const Dashboard = ({ user }) => {
  // Define allowed roles explicitly
  const ALLOWED_ROLES = ['contributor', 'user'];
  const userRole = user?.role;
  
  // Check if user has a valid role
  const hasValidRole = userRole && ALLOWED_ROLES.includes(userRole);
  
  // If no valid role, show role selection prompt
  if (!hasValidRole) {
    return (
      <div className="dashboard-container container-fluid">
        <div className="dashboard-header">
          <div className="user-badge">
            <span className="role-badge">No Role Selected</span>
          </div>
        </div>
        <div className="dashboard-content">
          <div className="role-prompt">
            <h3>Please select your role to access the dashboard</h3>
            <p>You need to choose between User or Contributor role to continue.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container container-fluid">
      {/* Role-specific Dashboard Content */}
      <div className="role-specific-content">
        {userRole === 'user' && <User user={user} />}
        {userRole === 'contributor' && <Contributor user={user} />}
      </div>
    </div>
  );
};

export default Dashboard;