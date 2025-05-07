import React from 'react';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

const Layout = ({ user, children }) => {
  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
