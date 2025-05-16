import React, { useState, useEffect } from 'react';
import OfficerSidebar from './OfficerSidebar';
import '../styles/OfficerLayout.css';

const OfficerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [officer, setOfficer] = useState({});

  useEffect(() => {
    const officerInfo = JSON.parse(localStorage.getItem('officerInfo'));
    if (officerInfo) setOfficer(officerInfo);
  }, []);

  return (
    <div className="officer-manage-membership-layout">
      <OfficerSidebar
        officer={officer}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        className="officer-membership-sidebar"
      />
      <div className="officer-manage-membership-page">
        {children}
      </div>
    </div>
  );
};

export default OfficerLayout;
