import React, { useState, useEffect, useRef } from 'react';
import '../styles/MembershipModal.css';
import { getQRCode, uploadReceiptFile, updateMembershipReceipt } from '../services/membershipService';

const MembershipModal = ({ membership, onClose, onReceiptUploaded }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("maya");
  const [qrPreviewUrl, setQRPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const token = localStorage.getItem('accessToken');
  const fileInputRef = useRef(null);

  const paymentMethods = ["maya", "gcash"];

  useEffect(() => {
    async function fetchQRCodeData() {
      try {
        const data = await getQRCode(activeTab, token);
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
  }, [activeTab, token]);

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
    if (file) {
      setSelectedReceipt(file);
      setReceiptPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    try {
      setIsUploading(true);
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);

      const uploadResponse = await uploadReceiptFile(selectedReceipt, token);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const updatePayload = {
        membership_id: membership.id,
        payment_type: activeTab.toLowerCase(),
        receipt_path: uploadResponse.file_path,
      };
      const updateResponse = await updateMembershipReceipt(updatePayload, token);
      
      // Small delay to show 100% complete
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onReceiptUploaded(updateResponse);
      }, 500);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error("Receipt upload error:", error.response?.data || error);
    }
  };

  const switchToNext = () => {
    const currentIndex = paymentMethods.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % paymentMethods.length;
    setActiveTab(paymentMethods[nextIndex]);
  };

  const switchToPrevious = () => {
    const currentIndex = paymentMethods.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + paymentMethods.length) % paymentMethods.length;
    setActiveTab(paymentMethods[prevIndex]);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const getPaymentMethodLabel = (method) => {
    return method === "gcash" ? "G-Cash" : method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === "modal-overlay" && onClose()}>
      <div className="modal-container">
        <div className="payment-header">
          <div className="payment-name">
            {getPaymentMethodLabel(activeTab)}
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        {/* Payment methods tabs */}
        
        
        <div className="qr-container">
          {qrPreviewUrl ? (
            <>
              <div className="scan-badge">SCAN ME</div>
              <img src={qrPreviewUrl} alt="QR Code" className="qr-image" />
            </>
          ) : (
            <div className="qr-placeholder">No QR Code available</div>
          )}
          
          {paymentMethods.length > 1 && (
            <div className="navigation-arrows">
              <button className="nav-arrow left" onClick={switchToPrevious} aria-label="Previous">
                &lt;
              </button>
              <button className="nav-arrow right" onClick={switchToNext} aria-label="Next">
                &gt;
              </button>
            </div>
          )}
        </div>

        <div className="instruction-section">
          <h3>Instructions</h3>
          <ol className="instruction-steps" >
            <li>Scan the QR code with your {getPaymentMethodLabel(activeTab)} app</li>
            <li>Complete the payment for {membership.plan_name || "membership"}</li>
            <li>Take a screenshot of your receipt</li>
            <li>Upload the receipt below</li>
          </ol>
        </div>

        <div className="upload-section">
          <div className="upload-label">Upload Payment Receipt</div>
          <button className="upload-button" onClick={handleUploadClick} disabled={isUploading}>
            <span className="upload-icon">+</span>
            <span>{selectedReceipt ? 'CHANGE FILE' : 'UPLOAD'}</span>
          </button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
          />
        </div>

        {receiptPreviewUrl && (
          <div className="receipt-preview-container">
            <img src={receiptPreviewUrl} alt="Receipt Preview" className="receipt-preview" />
            
            {isUploading ? (
              <div style={{ width: '100%', maxWidth: '250px' }}>
                <div style={{ 
                  height: '8px', 
                  width: '100%', 
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${uploadProgress}%`,
                    backgroundColor: '#43883e',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  Uploading... {uploadProgress}%
                </div>
              </div>
            ) : (
              <button 
                className="submit-receipt-btn" 
                onClick={handleSubmit}
              >
                Submit Receipt
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipModal;