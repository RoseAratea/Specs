import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaBullhorn,
  FaUsers,
  FaTools,
  FaSignOutAlt
} from 'react-icons/fa';
import '../styles/OfficerSidebar.css';

const OfficerSidebar = ({ officer: officerProp }) => {
  const [officer, setOfficer] = useState(officerProp || {});
  const navigate = useNavigate();

  useEffect(() => {
    if (!officerProp) {
      const storedOfficer = localStorage.getItem('officerInfo');
      if (storedOfficer) {
        setOfficer(JSON.parse(storedOfficer));
      }
    }
  }, [officerProp]);

  const officerName = officer.full_name || "Officer Name";
  const officerPosition = officer.position || "Officer Position";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('officerAccessToken');
      localStorage.removeItem('officerInfo');
      navigate('/officer-login');
    }
  };

  return (
    <div className="sidebar">
      <div className="user-info">
        <h3>{officerName}</h3>
        <p>{officerPosition}</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/officer-dashboard"><FaTachometerAlt /> Dashboard</Link></li>
          <li><Link to="/officer-manage-events"><FaCalendarAlt /> Manage Events</Link></li>
          <li><Link to="/officer-manage-announcements"><FaBullhorn /> Manage Announcements</Link></li>
          <li><Link to="/officer-manage-membership"><FaUsers /> Manage Membership</Link></li>
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
