import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getClearance } from '../services/clearanceService';
import { getProfile } from '../services/userService';
import { FaBars } from 'react-icons/fa';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [clearanceData, setClearanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearanceLoading, setIsClearanceLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // default: open

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userProfile = await getProfile(token);
        setUser(userProfile);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    if (user && user.id) {
      async function fetchClearance() {
        setIsClearanceLoading(true);
        try {
          const data = await getClearance(user.id, token);
          setClearanceData(data);
        } catch (err) {
          console.error('Failed to fetch clearance:', err);
        } finally {
          setIsClearanceLoading(false);
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

  if (isLoading) return <div className="loading">Loading Dashboard...</div>;
  if (!user) return <div className="error-message">Unable to load user data.</div>;

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar user={user} isOpen={isSidebarOpen} />
      <div className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-left">
            <button className="sidebar-toggle-inside" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <FaBars />
            </button>
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <span className="current-date">{formattedDate}</span>
        </div>

        <div className="about-us">
          <h2>About Us</h2>
          <p>
            The Society of Programming Enthusiasts in Computer Science (SPECS) is one of the three 
            recognized organizations under the College of Computer Studies and the only organization 
            under the Computer Science course. We aim to promote the skills, knowledge, and camaraderie 
            among CS Students of Gordon College and establish leadership among the SPECS Officers and CS Students.
          </p>
        </div>

        <div className="clearance-membership-section">
          <div className="clearance-section">
            <h3>Clearance for 2024 - 2025</h3>
            {isClearanceLoading ? (
              <div className="clearance-loading">
                <div className="loading-indicator">Loading clearance data...</div>
              </div>
            ) : clearanceData.length > 0 ? (
              <table className="clearance-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clearanceData.map((clearance) => (
                    <tr key={clearance.id}>
                      <td>{clearance.requirement}</td>
                      <td>{clearance.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No clearance records found.</p>
            )}
          </div>

          <div className="membership-section">
            <h3>Membership Fee Status Description</h3>
            <table className="membership-table">
              <thead>
                <tr>
                  <th>Membership Fee Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pending</td>
                  <td>You have not yet paid the membership fee. Please settle the payment to proceed with clearance.</td>
                </tr>
                <tr>
                  <td>Processing</td>
                  <td>Your payment is being verified. Please wait for confirmation.</td>
                </tr>
                <tr>
                  <td>Cleared</td>
                  <td>Your membership fee has been successfully paid and verified. You are cleared.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;