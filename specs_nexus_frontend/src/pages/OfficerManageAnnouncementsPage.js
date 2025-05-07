import React, { useEffect, useState } from 'react';
import OfficerSidebar from '../components/OfficerSidebar'; // Import OfficerSidebar
import {
  getOfficerAnnouncements,
  createOfficerAnnouncement,
  updateOfficerAnnouncement,
  deleteOfficerAnnouncement
} from '../services/officerAnnouncementService';
import OfficerAnnouncementModal from '../components/OfficerAnnouncementModal';
import '../styles/OfficerManageAnnouncementsPage.css';

const OfficerManageAnnouncementsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const token = localStorage.getItem('officerAccessToken');

  useEffect(() => {
    const storedOfficer = localStorage.getItem('officerInfo');
    if (storedOfficer) {
      setOfficer(JSON.parse(storedOfficer));
    }
  }, []);

  useEffect(() => {
    async function fetchAllAnnouncements() {
      try {
        const data = await getOfficerAnnouncements(token);
        setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    }
    if (token) {
      fetchAllAnnouncements();
    }
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

  if (!officer) {
    return <div>Loading Officer Info...</div>;
  }

  return (
    <div className="layout-container">
      <OfficerSidebar officer={officer} />
      <div className="main-content">
        <div className="header-section">
          <h1>Manage Announcements</h1>
          <button className="add-announcement-btn" onClick={handleAddNewAnnouncement}>
            ADD NEW ANNOUNCEMENT
          </button>
        </div>
        <div className="announcements-grid">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="announcement-card">
              <img
                src={announcement.image_url
                  ? (announcement.image_url.startsWith("http")
                    ? announcement.image_url
                    : `http://localhost:8000${announcement.image_url}`)
                  : "/default_announcement.png"}
                alt={announcement.title}
                className="announcement-image"
              />
              <h3>{announcement.title}</h3>
              <p>{announcement.date ? new Date(announcement.date).toLocaleString() : ""}</p>
              <p>{announcement.location}</p>
              <p className="announcement-details">
                {announcement.description && announcement.description.length > 100
                  ? announcement.description.slice(0, 100) + '...'
                  : announcement.description}
              </p>
              <div className="card-actions">
                <button onClick={() => handleEdit(announcement)}>Edit</button>
                <button onClick={() => handleDelete(announcement.id)}>Archive</button>
              </div>
            </div>
          ))}
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
