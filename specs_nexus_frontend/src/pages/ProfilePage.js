import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile } from '../services/userService';
import ProfileCard from '../components/ProfileCard';
import '../styles/DashboardPage.css'; // Still reusing layout styles

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }
    fetchProfile();
  }, [token]);

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
    return <div>Loading profile...</div>;
  }

  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>My Profile</h1>
          <span className="current-date">{formattedDate}</span>
        </div>
        <div className="profile-section">
          <ProfileCard user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
