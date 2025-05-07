import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getClearance } from '../services/clearanceService';
import { getProfile } from '../services/userService';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [clearanceData, setClearanceData] = useState([]);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userProfile = await getProfile(token);
        setUser(userProfile);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    }
    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    if (user && user.id) {
      async function fetchClearance() {
        try {
          const data = await getClearance(user.id, token);
          setClearanceData(data);
        } catch (err) {
          console.error('Failed to fetch clearance:', err);
        }
      }
      fetchClearance();
    }
  }, [user, token]);

  const today = new Date();
  const formattedDate = today.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <span className="current-date">{formattedDate}</span>
        </div>
        <div className="about-us">
          <h2>About Us</h2>
          <p>
            The Society of Programming Enthusiasts in Computer Science (SPECS) aims to promote skills,
            knowledge, and camaraderie among CS students at Gordon College.
          </p>
        </div>
        <div className="clearance-section">
          <h3>Clearance for 2024 - 2025</h3>
          {clearanceData.length > 0 ? (
            <div className="clearance-grid">
              {clearanceData.map((clearance) => (
                <div key={clearance.id} className="clearance-card">
                  <p><strong>Requirement:</strong> {clearance.requirement}</p>
                  <p><strong>Status:</strong> {clearance.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No clearance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
