import React from 'react';
import '../styles/EventModal.css';

const backendBaseUrl = "http://localhost:8000";

const EventModal = ({ event, onClose, onParticipate, onNotParticipate }) => {
  if (!event) return null;

  const imageUrl = event.image_url
    ? event.image_url.startsWith("http")
      ? event.image_url
      : `${backendBaseUrl}${event.image_url}`
    : null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {imageUrl && (
          <div className="modal-image-container">
            <img src={imageUrl} alt={event.title} className="modal-event-image" />
          </div>
        )}
        <h2>{event.title}</h2>
        <p className="modal-date">
          <strong>Date:</strong> {new Date(event.date).toLocaleString()}
        </p>
        {event.location && (
          <p className="modal-location">
            <strong>Location:</strong> {event.location}
          </p>
        )}
        {event.participant_count !== undefined && (
          <p className="modal-participants">
            <strong>Participants:</strong> {event.participant_count}
          </p>
        )}
        <p className="modal-description">
          <strong>Description:</strong> {event.description}
        </p>
        <div className="modal-actions">
          <button className="participate-btn" onClick={() => onParticipate(event.id)}>
            Participate
          </button>
          <button className="not-participate-btn" onClick={() => onNotParticipate(event.id)}>
            Not Participate
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
