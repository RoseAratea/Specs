import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaCalendarAlt, FaBullhorn, FaUsers, FaTools, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ user, isOpen, closeSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('accessToken');
      navigate('/');
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div class="profile-container">
  <i class="fas fa-user-circle profile-icon"></i></div>
      <div className="user-info">
        <h3>{user.full_name || "User Name"}</h3>
        <p>{user.student_number || "Student Number"}</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/dashboard"><FaTachometerAlt /> Dashboard</Link></li>
          <li><Link to="/profile"><FaUser /> Profile</Link></li>
          <li><Link to="/events"><FaCalendarAlt /> Events</Link></li>
          <li><Link to="/announcements"><FaBullhorn /> Announcements</Link></li>
          <li><Link to="/membership"><FaUsers /> Membership</Link></li>
          {user.is_admin && <li><Link to="/admin-events"><FaTools /> Admin Events</Link></li>}
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt style={{ marginRight: '8px' }} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
