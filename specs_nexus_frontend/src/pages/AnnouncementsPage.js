import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile } from '../services/userService';
import { getAnnouncements } from '../services/announcementService';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import { FaBars } from 'react-icons/fa';
import '../styles/AnnouncementsPage.css';

const AnnouncementsPage = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setIsAnnouncementsLoading(true);
        const announcementsData = await getAnnouncements(token);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setIsAnnouncementsLoading(false);
      }
    }
    fetchAnnouncements();
  }, [token]);

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  const filterAnnouncements = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (filter === 'recent') {
      return announcements.filter(
        (a) => a.date && new Date(a.date) >= thirtyDaysAgo
      );
    } else if (filter === 'featured') {
      return announcements.filter((a) => a.featured === true);
    }
    return announcements;
  };

  const filteredAnnouncements = filterAnnouncements();

  const today = new Date();
  const formattedDate = today.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isLoading) {
    return <div className="loading">Loading user data...</div>;
  }

  if (!user) {
    return <div className="error-message">Unable to load user. Please try again.</div>;
  }

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar user={user} isOpen={isSidebarOpen} />
      <div className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-left">
            <button
              className="sidebar-toggle-inside"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <FaBars />
            </button>
            <h1>Announcements</h1>
          </div>
          <span className="current-date">{formattedDate}</span>
        </div>

        <div className="announcements-header">
          <h1>SPECS Announcements</h1>
          <div className="announcements-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
              onClick={() => setFilter('recent')}
            >
              Recent
            </button>
            <button
              className={`filter-btn ${filter === 'featured' ? 'active' : ''}`}
              onClick={() => setFilter('featured')}
            >
              Featured
            </button>
          </div>
        </div>

        <div className="announcements-section">
          {isAnnouncementsLoading ? (
            <div className="announcements-loading">
              <div className="loader"></div>
              <p>Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="announcements-grid">
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-announcements-message">
              <i className="fas fa-bullhorn"></i>
              <p>No announcements found for the selected filter.</p>
            </div>
          )}
        </div>

        {selectedAnnouncement && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
