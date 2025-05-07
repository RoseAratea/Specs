import React, { useState, useEffect } from 'react';
import '../styles/MembershipModal.css';
import { getQRCode, uploadReceiptFile, updateMembershipReceipt } from '../services/membershipService';

const MembershipModal = ({ membership, onClose, onReceiptUploaded }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState("paymaya");
  const [qrPreviewUrl, setQRPreviewUrl] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchQRCodeData() {
      try {
        const data = await getQRCode(selectedPaymentType, token);
        if (data && data.qr_code_url) {
          let url = data.qr_code_url.trim();
          if (!url.startsWith("http")) {
            if (!url.startsWith("/")) {
              url = "/" + url;
            }
            url = `http://localhost:8000${url}`;
          }
          setQRPreviewUrl(url);
        } else {
          setQRPreviewUrl(null);
        }
      } catch (error) {
        console.error("Failed to fetch QR code:", error);
        setQRPreviewUrl(null);
      }
    }
    fetchQRCodeData();
  }, [selectedPaymentType, token]);

  useEffect(() => {
    if (membership.receipt_path) {
      let url = membership.receipt_path;
      if (!url.startsWith("http")) {
        if (!url.startsWith("/")) {
          url = "/" + url;
        }
        url = `http://localhost:8000${url}`;
      }
      setReceiptPreviewUrl(url);
    }
  }, [membership]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedReceipt(file);
    setReceiptPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    try {
      const uploadResponse = await uploadReceiptFile(selectedReceipt, token);
      const updatePayload = {
        membership_id: membership.id,
        payment_type: selectedPaymentType.toLowerCase(),
        receipt_path: uploadResponse.file_path,
      };
      const updateResponse = await updateMembershipReceipt(updatePayload, token);
      onReceiptUploaded(updateResponse);
    } catch (error) {
      console.error("Receipt upload error:", error.response?.data || error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container membership-modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Membership Details</h2>
        <div className="modal-section">
          <h3>Select Payment Option</h3>
          <select value={selectedPaymentType} onChange={(e) => setSelectedPaymentType(e.target.value)}>
            <option value="paymaya">PayMaya</option>
            <option value="gcash">GCash</option>
          </select>
        </div>
        <div className="modal-section image-container">
          <h3>{selectedPaymentType === "paymaya" ? "PayMaya" : "GCash"} QR Code</h3>
          {qrPreviewUrl ? (
            <img src={qrPreviewUrl} alt="QR Code Preview" className="qr-preview" />
          ) : (
            <p>No QR Code available for {selectedPaymentType}.</p>
          )}
        </div>
        <div className="modal-section">
          <h3>Upload Receipt</h3>
          <form onSubmit={handleSubmit}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {receiptPreviewUrl && (
              <img src={receiptPreviewUrl} alt="Receipt Preview" className="receipt-preview" />
            )}
            <button type="submit">Upload Receipt</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;