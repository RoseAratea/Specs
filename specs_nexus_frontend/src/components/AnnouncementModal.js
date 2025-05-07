import React from 'react';
import '../styles/AnnouncementModal.css';

const backendBaseUrl = "http://localhost:8000";

const AnnouncementModal = ({ announcement, onClose }) => {
  if (!announcement) return null;

  const imageUrl =
    announcement.image_url && announcement.image_url.startsWith("http")
      ? announcement.image_url
      : `${backendBaseUrl}${announcement.image_url || ""}`;

  const formattedDate = announcement.date
    ? new Date(announcement.date).toLocaleString()
    : "No date provided";

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>&times;</button>
        {announcement.image_url && (
          <img src={imageUrl} alt={announcement.title} className="modal-announcement-image" />
        )}
        <h2>{announcement.title}</h2>
        <p className="modal-description">{announcement.description}</p>
        {announcement.location && (
          <p className="modal-location"><strong>Location:</strong> {announcement.location}</p>
        )}
        <p className="modal-date"><strong>Date:</strong> {formattedDate}</p>
      </div>
    </div>
  );
};

export default AnnouncementModal;
