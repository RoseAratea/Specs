import React, { useState, useEffect } from 'react';
import '../styles/OfficerModal.css';

const OfficerModal = ({ show, onClose, onSave, initialOfficer }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    student_number: '',
    year: '',
    block: '',
    position: '',
  });

  useEffect(() => {
    if (initialOfficer) {
      setFormData({
        full_name: initialOfficer.full_name || '',
        email: initialOfficer.email || '',
        password: initialOfficer.password || '',
        student_number: initialOfficer.student_number || '',
        year: initialOfficer.year || '',
        block: initialOfficer.block || '',
        position: initialOfficer.position || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        student_number: '',
        year: '',
        block: '',
        position: '',
      });
    }
  }, [initialOfficer, show]);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    onSave(data, initialOfficer?.id);
  };

  return (
    <div className="officer-modal-overlay">
      <div className="officer-modal-container">
        <button className="officer-modal-close" onClick={onClose}>×</button>
        <h2>{initialOfficer ? 'Edit Officer' : 'Add New Officer'}</h2>
        <form onSubmit={handleSubmit} className="officer-form">
          <label>Full Name:</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />

          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Password:</label>
          <input type="text" name="password" value={formData.password} onChange={handleChange} required />

          <label>Student Number:</label>
          <input type="text" name="student_number" value={formData.student_number} onChange={handleChange} required />

          <label>Year:</label>
          <select name="year" value={formData.year} onChange={handleChange} required>
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <label>Block:</label>
          <input type="text" name="block" value={formData.block} onChange={handleChange} required />

          <label>Position:</label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} required />

          <button type="submit">{initialOfficer ? 'Update Officer' : 'Add Officer'}</button>
        </form>
      </div>
    </div>
  );
};

export default OfficerModal;
