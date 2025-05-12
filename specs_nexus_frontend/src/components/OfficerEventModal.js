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
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', details);
    formData.append('date', new Date(dateTime).toISOString());
    formData.append('location', location);
    if (registrationStart) {
      formData.append('registration_start', new Date(registrationStart).toISOString());
    }
    if (registrationEnd) {
      formData.append('registration_end', new Date(registrationEnd).toISOString());
    }
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
          <div className="image-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div className="blank-image">No image selected</div>
            )}
          </div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Details:</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />

          <label>Date and time:</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />

          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <label>Registration Start:</label>
          <input
            type="datetime-local"
            value={registrationStart}
            onChange={(e) => setRegistrationStart(e.target.value)}
            placeholder="Leave empty for immediate registration"
          />

          <label>Registration End:</label>
          <input
            type="datetime-local"
            value={registrationEnd}
            onChange={(e) => setRegistrationEnd(e.target.value)}
            placeholder="Leave empty for no deadline"
          />

          <label>Image:</label>
          <input
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