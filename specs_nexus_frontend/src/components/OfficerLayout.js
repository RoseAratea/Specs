import React from 'react';
import OfficerSidebar from './OfficerSidebar';
import '../styles/OfficerLayout.css';

const OfficerLayout = ({ officer, children }) => {
  return (
    <div className="officer-layout-container">
      <OfficerSidebar officer={officer} />
      <div className="officer-main-content">
        {children}
      </div>
    </div>
  );
};

export default OfficerLayout;
