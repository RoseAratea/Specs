import React from 'react';
import '../styles/AnnouncementCard.css';

const backendBaseUrl = "http://localhost:8000";

const AnnouncementCard = ({ announcement, onClick }) => {
  const imageUrl =
    announcement.image_url && announcement.image_url.startsWith("http")
      ? announcement.image_url
      : `${backendBaseUrl}${announcement.image_url || ""}`;

  const description = announcement.content || announcement.description || "";
  const shortDescription =
    description.length > 100 ? description.slice(0, 100) + "..." : description;

  return (
    <div className="announcement-card" onClick={() => onClick(announcement)}>
      {announcement.image_url && (
        <img src={imageUrl} alt={announcement.title} className="announcement-image" />
      )}
      <h3 className="announcement-title">{announcement.title}</h3>
      <p className="announcement-content">{shortDescription}</p>
    </div>
  );
};

export default AnnouncementCard;
