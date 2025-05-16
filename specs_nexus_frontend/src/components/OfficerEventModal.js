import React, { useState, useEffect } from 'react';
import '../styles/OfficerEventModal.css';

const OfficerEventModal = ({ show, onClose, onSave, initialEvent }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [registrationStart, setRegistrationStart] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setDetails(initialEvent.description || '');
      setDateTime(initialEvent.date ? initialEvent.date.slice(0, 16) : '');
      setLocation(initialEvent.location || '');
      setRegistrationStart(initialEvent.registration_start ? initialEvent.registration_start.slice(0, 16) : '');
      setRegistrationEnd(initialEvent.registration_end ? initialEvent.registration_end.slice(0, 16) : '');
      setImageFile(null);
      setPreviewUrl('');
    } else {
      setTitle('');
      setDetails('');
      setDateTime('');
      setLocation('');
      setRegistrationStart('');
      setRegistrationEnd('');
      setImageFile(null);
      setPreviewUrl('');
    }
  }, [initialEvent, show]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl('');
    }
  }, [imageFile]);

  if (!show) return null;

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const now = new Date();

    if (!registrationStart || !registrationEnd) {
      alert("Both registration start and end times are required.");
      return;
    }

    const start = new Date(registrationStart);
    const end = new Date(registrationEnd);
    const eventDate = new Date(dateTime);

    if (start < now || end < now) {
      alert("Registration times must not be in the past.");
      return;
    }

    if (start >= end) {
      alert("Registration end time must be after start time.");
      return;
    }

    if (eventDate < now) {
      alert("The event must be scheduled for a future date and time.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', details);
    formData.append('date', eventDate.toISOString());
    formData.append('location', location);
    formData.append('registration_start', start.toISOString());
    formData.append('registration_end', end.toISOString());

    if (imageFile) {
      formData.append('image', imageFile);
    }

    onSave(formData, initialEvent?.id);
  };

  return (
    <div className="officer-modal-overlay">
      <div className="officer-modal-container">
        <button className="officer-modal-close" onClick={onClose}>×</button>

        <div className="officer-modal-header">
          <h2>{initialEvent ? 'Edit Event' : 'Add New Event'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="officer-event-form">
          {/* Image Preview */}
          <div className="image-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div className="blank-image">No image selected</div>
            )}
          </div>

          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="details">Details</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />

          <label htmlFor="dateTime">Event Date and Time</label>
          <input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <label htmlFor="registrationStart">Registration Start</label>
          <input
            id="registrationStart"
            type="datetime-local"
            value={registrationStart}
            onChange={(e) => setRegistrationStart(e.target.value)}
            required
          />

          <label htmlFor="registrationEnd">Registration End</label>
          <input
            id="registrationEnd"
            type="datetime-local"
            value={registrationEnd}
            onChange={(e) => setRegistrationEnd(e.target.value)}
            required
          />

          <label htmlFor="image">Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <button type="submit">SAVE POST</button>
        </form>
      </div>
    </div>
  );
};

export default OfficerEventModal;
