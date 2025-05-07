import React from 'react';
import '../styles/EventCard.css';

const backendBaseUrl = "http://localhost:8000";
const placeholderImage = `${backendBaseUrl}/static/images/placeholder.png`;

const EventCard = ({ event, onClick }) => {
  const imageUrl = event.image_url
    ? event.image_url.startsWith("http")
      ? event.image_url
      : `${backendBaseUrl}${event.image_url}`
    : placeholderImage;

  return (
    <div className="event-card" onClick={() => onClick(event)}>
      <img src={imageUrl} alt={event.title} className="event-image" />
      <h3 className="event-title">{event.title}</h3>
      <p className="event-date">{new Date(event.date).toLocaleString()}</p>
      <p className="event-description">
        {event.description.length > 100 ? event.description.slice(0, 100) + '...' : event.description}
      </p>
      <p className="event-participants">
        Participants: {event.participant_count}
      </p>
    </div>
  );
};

export default EventCard;
