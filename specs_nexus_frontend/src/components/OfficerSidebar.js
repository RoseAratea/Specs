import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaCalendarAlt, FaBullhorn, FaUsers, FaTools, FaSignOutAlt } from 'react-icons/fa';  
import '../styles/OfficerSidebar.css';

const OfficerSidebar = ({ officer, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear officer-related data from localStorage
      localStorage.removeItem('officerAccessToken');
      localStorage.removeItem('officerInfo');
      navigate('/officer-login');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}> {/* Sidebar visibility controlled via props */}
      <div className="user-info">
        <div class="profile-container">
  <i class="fas fa-user-circle profile-icon"></i></div>
        <h3>{officer.full_name || "Officer Name"}</h3>
        <p>{officer.position || "Officer Position"}</p>
      </div>
      <nav>
        <ul>
          {/* Officer Dashboard */}
          <li><Link to="/officer-dashboard"><FaTachometerAlt /> Dashboard</Link></li>
          
          {/* Officer-specific management options */}
          <li><Link to="/officer-manage-events"><FaCalendarAlt /> Manage Events</Link></li>
          <li><Link to="/officer-manage-announcements"><FaBullhorn /> Manage Announcements</Link></li>
          <li><Link to="/officer-manage-membership"><FaUsers /> Manage Membership</Link></li>
          
          {/* Admin-only section */}
          {officer.position?.toLowerCase() === 'admin' && (
  <li><Link to="/admin-manage-officers"><FaTools /> Manage Officers</Link></li>
)}

        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt style={{ marginRight: '8px' }} />
        Logout
      </button>

    </div>
  );
};

export default OfficerSidebar;
