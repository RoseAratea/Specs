import React, { useEffect, useState } from 'react';
import OfficerSidebar from '../components/OfficerSidebar'; // Import OfficerSidebar
import { getOfficerEvents, createOfficerEvent, updateOfficerEvent, deleteOfficerEvent } from '../services/officerEventService';
import EventParticipantsModal from '../components/EventParticipantsModal';
import OfficerEventModal from '../components/OfficerEventModal';
import { getEventParticipants } from '../services/officerEventService';
import '../styles/OfficerManageEventsPage.css';

const OfficerManageEventsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('officerAccessToken');

  useEffect(() => {
    async function fetchData() {
      try {
        // Get officer info
        const storedOfficer = localStorage.getItem('officerInfo');
        const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
        setOfficer(officerData);
        
        // Get events data
        if (token) {
          const eventsData = await getOfficerEvents(token);
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [token]);

  const handleAddNewEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEdit = (evt) => {
    setSelectedEvent(evt);
    setShowEventModal(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteOfficerEvent(eventId, token);
      const updated = await getOfficerEvents(token);
      setEvents(updated);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Error deleting event");
    }
  };

  const handleViewParticipants = async (eventId) => {
    try {
      const data = await getEventParticipants(eventId);
      setParticipants(data);
      setShowParticipantsModal(true);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      alert("Error fetching participants");
    }
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
  };

  const handleCloseParticipantsModal = () => {
    setShowParticipantsModal(false);
  };

  const handleSave = async (formData, eventId) => {
    try {
      if (eventId) {
        await updateOfficerEvent(eventId, formData, token);
        alert("Event updated successfully!");
      } else {
        await createOfficerEvent(formData, token);
        alert("Event created successfully!");
      }
      setShowEventModal(false);
      const updated = await getOfficerEvents(token);
      setEvents(updated);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event");
    }
  };

  if (isLoading) {
    return <div className="loading">Loading Events...</div>;
  }

  if (!officer) {
    return <div className="error-message">Unable to load officer information. Please try again later.</div>;
  }

  return (
    <div className="layout-container">
      <OfficerSidebar officer={officer} />
      <div className="main-content">
        <div className="header-section">
          <h1>Manage Events</h1>
          <button className="add-event-btn" onClick={handleAddNewEvent}>
            ADD NEW EVENT
          </button>
        </div>
        <div className="events-grid">
          {events.length > 0 ? (
            events.map((evt) => (
              <div key={evt.id} className="event-card">
                <img
                  src={evt.image_url ? (evt.image_url.startsWith("http") ? evt.image_url : `http://localhost:8000${evt.image_url}`) : "/default_event.png"}
                  alt={evt.title}
                  className="event-image"
                  onClick={() => handleViewParticipants(evt.id)}
                  style={{ cursor: 'pointer' }}
                />
                <h3>{evt.title}</h3>
                <p>{new Date(evt.date).toLocaleString()}</p>
                <p>{evt.location}</p>
                <p className="event-details">
                  {evt.description.length > 100 ? evt.description.slice(0, 100) + '...' : evt.description}
                </p>
                <div className="card-actions">
                  <button onClick={() => handleEdit(evt)}>Edit</button>
                  <button onClick={() => handleDelete(evt.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events-message">No events found. Click "ADD NEW EVENT" to create one.</div>
          )}
        </div>
        <OfficerEventModal
          show={showEventModal}
          onClose={handleCloseEventModal}
          onSave={handleSave}
          initialEvent={selectedEvent}
        />
        <EventParticipantsModal
          show={showParticipantsModal}
          participants={participants}
          onClose={handleCloseParticipantsModal}
        />
      </div>
    </div>
  );
};

export default OfficerManageEventsPage;