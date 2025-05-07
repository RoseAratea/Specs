// src/components/OfficerMembershipModal.js
import React, { useState, useEffect } from 'react';
import '../styles/OfficerMembershipModal.css';

const OfficerMembershipModal = ({ show, onClose, onSave, initialMembership }) => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Not Paid');

  useEffect(() => {
    if (initialMembership) {
      setUserId(initialMembership.user_id.toString());
      setAmount(initialMembership.amount.toString());
      setStatus(initialMembership.status);
    } else {
      setUserId('');
      setAmount('');
      setStatus('Not Paid');
    }
  }, [initialMembership, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('amount', amount);
    formData.append('status', status);
    onSave(formData, initialMembership?.id);
  };

  return (
    <div className="officer-membership-modal-overlay">
      <div className="officer-membership-modal-container">
        <button className="officer-membership-modal-close" onClick={onClose}>×</button>
        <h2>{initialMembership ? 'Edit Membership' : 'Add New Membership'}</h2>
        <form onSubmit={handleSubmit} className="officer-membership-form">
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Not Paid">Not Paid</option>
            <option value="Verifying">Verifying</option>
            <option value="Paid">Paid</option>
          </select>

          <button type="submit">SAVE</button>
        </form>
      </div>
    </div>
  );
};

export default OfficerMembershipModal;
