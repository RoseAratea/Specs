import React, { useState } from 'react';
import '../styles/EventModal.css';

const EventModal = ({ event, onClose, onParticipate, onNotParticipate }) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRegistrationStatus = (status) => {
    switch (status) {
      case 'open':
        return 'Registration is open';
      case 'not_started':
        return 'Registration opens soon';
      case 'closed':
        return 'Registration is closed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return 'fa-door-open';
      case 'not_started':
        return 'fa-clock';
      case 'closed':
        return 'fa-door-closed';
      default:
        return 'fa-question-circle';
    }
  };

  // Use the is_participant flag directly from the API
  const isParticipating = event.is_participant === true;

  return (
    <>
      <div className="event-modal-overlay" onClick={onClose}>
        <div className="event-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Full Image Viewer */}
        {showFullImage && (
          <div className="fullscreen-image-overlay" onClick={() => setShowFullImage(false)}>
            <div className="fullscreen-image-container">
              <button className="close-fullscreen" onClick={(e) => {
                e.stopPropagation();
                setShowFullImage(false);
              }}>
                <i className="fas fa-times"></i>
              </button>
              <img
                src={
                  event.image_url.startsWith("http")
                    ? event.image_url
                    : `http://localhost:8000${event.image_url}`
                }
                alt={event.title}
                className="fullscreen-image"
              />
            </div>
          </div>
        )}
        <button className="close-modal" onClick={onClose} aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>
        
        <div className="event-modal-header">
          {event.image_url && (
            <div className="event-image-container">
              <img 
                src={
                  event.image_url.startsWith("http")
                    ? event.image_url
                    : `http://localhost:8000${event.image_url}`
                } 
                alt={event.title} 
                className="event-image"
                onClick={() => setShowFullImage(true)}
              />
              
              {/* Registration status badge overlaid on image */}
              <div className={`event-status-badge status-${event.registration_status}`}>
                <i className={`fas ${getStatusIcon(event.registration_status)}`}></i>
                {getRegistrationStatus(event.registration_status)}
              </div>
              
              {/* Clickable indicator */}
              <div className="image-zoom-indicator">
                <i className="fas fa-search-plus"></i>
              </div>
            </div>
          )}
          
          <h2 className="event-title">{event.title}</h2>
        </div>
        
        <div className="event-modal-content">
          <div className="event-meta">
            <div className="event-meta-item">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <span className="meta-label">Date & Time</span>
                <span className="meta-value">{formatDate(event.date)}</span>
              </div>
            </div>
            
            <div className="event-meta-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <span className="meta-label">Location</span>
                <span className="meta-value">{event.location}</span>
              </div>
            </div>
            
            <div className="event-meta-item">
              <i className="fas fa-users"></i>
              <div>
                <span className="meta-label">Attendees</span>
                <span className="meta-value">{event.participant_count} registered</span>
              </div>
            </div>
          </div>
          
          <div className="event-description-section">
            <h3>About this event</h3>
            <p className="event-description">{event.description}</p>
          </div>
          
          <div className="event-registration-details">
            <h3>Registration Information</h3>
            
            <div className="registration-timeline">
              {event.registration_start && (
                <div className="registration-timeline-item">
                  <i className="fas fa-hourglass-start"></i>
                  <div>
                    <span className="timeline-label">Registration opens</span>
                    <span className="timeline-date">{formatDate(event.registration_start)}</span>
                  </div>
                </div>
              )}
              
              {event.registration_end && (
                <div className="registration-timeline-item">
                  <i className="fas fa-hourglass-end"></i>
                  <div>
                    <span className="timeline-label">Registration closes</span>
                    <span className="timeline-date">{formatDate(event.registration_end)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="event-modal-footer">
          {isParticipating && (
            <div className="registered-status-banner">
              <i className="fas fa-check-circle"></i> You're registered for this event
            </div>
          )}
          
          <div className="registration-actions">
            {event.registration_open ? (
              isParticipating ? (
                <button 
                  className="btn-not-participate" 
                  onClick={() => onNotParticipate(event.id)}
                >
                  <i className="fas fa-times-circle"></i> Cancel Registration
                </button>
              ) : (
                <button 
                  className="btn-participate" 
                  onClick={() => onParticipate(event.id)}
                >
                  <i className="fas fa-calendar-check"></i> Register Now
                </button>
              )
            ) : (
              <button className="btn-disabled" disabled>
                {event.registration_status === 'not_started' ? 
                  <><i className="fas fa-clock"></i> Registration Not Open Yet</> : 
                  <><i className="fas fa-ban"></i> Registration Closed</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EventModal;