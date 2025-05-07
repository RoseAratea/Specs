import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import { getMemberships } from '../services/membershipService';
import Sidebar from '../components/Sidebar';
import MembershipModal from '../components/MembershipModal';
import '../styles/MembershipPage.css';

const MembershipPage = () => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (user) {
      async function fetchMemberships() {
        try {
          const membershipsData = await getMemberships(user.id, token);
          setMemberships(membershipsData);
        } catch (error) {
          console.error("Failed to fetch membership info:", error);
        }
      }
      fetchMemberships();
    }
  }, [user, token]);

  const handleReceiptUploaded = async () => {
    try {
      const updatedMemberships = await getMemberships(user.id, token);
      setMemberships(updatedMemberships);
      setSelectedMembership(null);
    } catch (error) {
      console.error("Failed to update membership records:", error);
    }
  };

  const getProgressData = (status) => {
    const lower = status ? status.trim().toLowerCase() : "";
    let progressPercentage = 0;
    let progressColor = "#ccc";
    if (lower === "not paid") {
      progressPercentage = 0;
      progressColor = "#ccc";
    } else if (lower === "verifying") {
      progressPercentage = 50;
      progressColor = "#28a745";
    } else if (lower === "paid") {
      progressPercentage = 100;
      progressColor = "#28a745";
    }
    return { progressPercentage, progressColor, displayStatus: status };
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const notPaidMemberships = memberships.filter(
    (m) => m.payment_status?.trim().toLowerCase() !== "paid"
  );
  const paidMemberships = memberships.filter(
    (m) => m.payment_status?.trim().toLowerCase() === "paid"
  );

  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>My Membership Requirements</h1>
        </div>

        <div className="membership-section">
          <h2>Unpaid / Verifying Memberships</h2>
          {notPaidMemberships.length > 0 ? (
            <div className="memberships-grid">
              {notPaidMemberships.map((membership) => {
                const status = membership.payment_status || "";
                const { progressPercentage, progressColor, displayStatus } = getProgressData(status);
                return (
                  <div key={membership.id} className="membership-card">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
                      >
                        {displayStatus}
                      </div>
                    </div>
                    <div className="membership-details">
                      <p><strong>Requirement:</strong> {membership.requirement || "N/A"}</p>
                      <p><strong>Amount:</strong> ₱{membership.amount || "0"}</p>
                      <p><strong>Membership ID:</strong> {membership.id}</p>
                    </div>
                    {status.trim().toLowerCase() === "not paid" && (
                      <button
                        className="register-btn"
                        onClick={() => setSelectedMembership(membership)}
                      >
                        Register Membership
                      </button>
                    )}
                    {status.trim().toLowerCase() === "verifying" && (
                      <button
                        className="edit-btn"
                        onClick={() => setSelectedMembership(membership)}
                      >
                        Edit Uploaded Files
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No unpaid memberships.</p>
          )}
        </div>

        <div className="membership-section">
          <h2>Paid Memberships</h2>
          {paidMemberships.length > 0 ? (
            <div className="memberships-grid">
              {paidMemberships.map((membership) => {
                const { progressPercentage, progressColor, displayStatus } = getProgressData(membership.payment_status);
                return (
                  <div key={membership.id} className="membership-card">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progressPercentage}%`, backgroundColor: progressColor }}
                      >
                        {displayStatus}
                      </div>
                    </div>
                    <div className="membership-details">
                      <p><strong>Requirement:</strong> {membership.requirement || "N/A"}</p>
                      <p><strong>Amount:</strong> ₱{membership.amount || "0"}</p>
                      <p><strong>Membership ID:</strong> {membership.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No paid memberships yet.</p>
          )}
        </div>

        {selectedMembership && (
          <MembershipModal
            membership={selectedMembership}
            onClose={() => setSelectedMembership(null)}
            onReceiptUploaded={handleReceiptUploaded}
          />
        )}
      </div>
    </div>
  );
};

export default MembershipPage;
