import React from 'react';
import '../styles/EventParticipantsModal.css';

const EventParticipantsModal = ({ show, participants, onClose }) => {
  if (!show) return null;

  const bccEmails = participants.map((p) => p.email).join(',');
  const subject = encodeURIComponent("Message to Event Participants");
  const mailtoLink = `mailto:?bcc=${encodeURIComponent(bccEmails)}&subject=${subject}`;

  return (
    <div className="ep-modal-overlay">
      <div className="ep-modal-container">
        <button className="ep-modal-close" onClick={onClose}>×</button>
        <h2>Event Participants</h2>
        <p className="participant-count">Total Participants: {participants.length}</p>
        {participants.length > 0 ? (
          <div className="participants-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-item">
                <p className="participant-name"><strong>{participant.full_name}</strong></p>
                <p className="participant-info">{participant.block} - {participant.year}</p>
                <p className="participant-email">{participant.email}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No participants found.</p>
        )}
        <div className="modal-actions">
          <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
            <button className="send-email-btn">Send Email</button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventParticipantsModal;
