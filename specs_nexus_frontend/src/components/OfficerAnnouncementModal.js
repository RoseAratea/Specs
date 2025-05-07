import React, { useState, useEffect } from 'react';
import '../styles/OfficerAnnouncementModal.css';

const OfficerAnnouncementModal = ({ show, onClose, onSave, initialAnnouncement }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (initialAnnouncement) {
      setTitle(initialAnnouncement.title || '');
      setDescription(initialAnnouncement.description || '');
      setDateTime(initialAnnouncement.date ? initialAnnouncement.date.slice(0, 16) : '');
      setLocation(initialAnnouncement.location || '');
      setImageFile(null);
      setPreviewUrl('');
    } else {
      setTitle('');
      setDescription('');
      setDateTime('');
      setLocation('');
      setImageFile(null);
      setPreviewUrl('');
    }
  }, [initialAnnouncement, show]);

  // Create a preview URL when an image file is selected, and clean it up when changed.
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
    formData.append('description', description);
    formData.append('date', new Date(dateTime).toISOString());
    formData.append('location', location);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    onSave(formData, initialAnnouncement?.id);
  };

  return (
    <div className="officer-announcement-modal-overlay">
      <div className="officer-announcement-modal-container">
        <button className="officer-announcement-modal-close" onClick={onClose}>×</button>
        <div className="officer-announcement-modal-header">
          <h2>{initialAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="officer-announcement-form">
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

          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label>Date and Time:</label>
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

export default OfficerAnnouncementModal;
