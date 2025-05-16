import React, { useEffect, useState } from 'react';
import OfficerSidebar from '../components/OfficerSidebar';
import {
  getOfficerAnnouncements,
  createOfficerAnnouncement,
  updateOfficerAnnouncement,
  deleteOfficerAnnouncement
} from '../services/officerAnnouncementService';
import OfficerAnnouncementModal from '../components/OfficerAnnouncementModal';
import '../styles/OfficerManageAnnouncementsPage.css';
import { FaBars } from 'react-icons/fa';

const OfficerManageAnnouncementsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const token = localStorage.getItem('officerAccessToken');

  useEffect(() => {
    async function fetchData() {
      try {
        const storedOfficer = localStorage.getItem('officerInfo');
        const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
        setOfficer(officerData);

        if (token) {
          const announcementsData = await getOfficerAnnouncements(token);
          setAnnouncements(announcementsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const handleAddNewAnnouncement = () => {
    setSelectedAnnouncement(null);
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDelete = async (announcementId) => {
    if (!announcementId) {
      alert("Invalid announcement id");
      return;
    }
    if (!window.confirm("Are you sure you want to archive this announcement?")) return;

    try {
      await deleteOfficerAnnouncement(announcementId, token);
      const updated = await getOfficerAnnouncements(token);
      setAnnouncements(updated);
    } catch (error) {
      console.error("Failed to archive announcement:", error);
      alert("Error archiving announcement");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (formData, announcementId) => {
    try {
      if (announcementId) {
        await updateOfficerAnnouncement(announcementId, formData, token);
        alert("Announcement updated successfully!");
      } else {
        await createOfficerAnnouncement(formData, token);
        alert("Announcement created successfully!");
      }
      setShowModal(false);
      const updated = await getOfficerAnnouncements(token);
      setAnnouncements(updated);
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Error saving announcement");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return <div className="loading">Loading Announcement...</div>;
  }

  if (!officer) {
    return <div className="error-message">Unable to load officer information. Please try again later.</div>;
  }

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <OfficerSidebar
        officer={officer}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-left">
            <button className="sidebar-toggle-inside" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <h1>Manage Announcements</h1>
          </div>
          <button className="add-announcement-btn" onClick={handleAddNewAnnouncement}>
            ADD NEW ANNOUNCEMENT
          </button>
        </div>

        <div className="announcements-section">
          {announcements.length > 0 ? (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="announcement-card">
                  <img
                    src={
                      announcement.image_url
                        ? (announcement.image_url.startsWith("http")
                            ? announcement.image_url
                            : `http://localhost:8000${announcement.image_url}`)
                        : "/default_announcement.png"
                    }
                    alt={announcement.title}
                    className="announcement-image"
                  />
                  <h3>{announcement.title}</h3>
                  <p>{announcement.date ? new Date(announcement.date).toLocaleString() : ""}</p>
                  <p>{announcement.location}</p>
                  <p className="announcement-details">
                    {announcement.description && announcement.description.length > 100
                      ? `${announcement.description.slice(0, 100)}...`
                      : announcement.description}
                  </p>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(announcement)}>Edit</button>
                    <button onClick={() => handleDelete(announcement.id)}>Archive</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-announcements-message">
              No announcements found. Click "ADD NEW ANNOUNCEMENT" to create one.
            </div>
          )}
        </div>

        <OfficerAnnouncementModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          initialAnnouncement={selectedAnnouncement}
        />
      </div>
    </div>
  );
};

export default OfficerManageAnnouncementsPage;
