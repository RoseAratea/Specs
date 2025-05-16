import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MembershipPage from './pages/MembershipPage';
import OfficerLoginPage from './pages/OfficerLoginPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import OfficerManageEventsPage from './pages/OfficerManageEventsPage';
import OfficerManageAnnouncementsPage from './pages/OfficerManageAnnouncementsPage';
import OfficerManageMembershipPage from './pages/OfficerManageMembershipPage';
import AdminManageOfficerPage from './pages/AdminManageOfficerPage';
import Chatbot from './components/Chatbot'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/officer-login" element={<OfficerLoginPage />} />
        <Route path="/officer-dashboard" element={<OfficerDashboardPage />} />
        <Route path="/officer-manage-events" element={<OfficerManageEventsPage />} />
        <Route path="/officer-manage-announcements" element={<OfficerManageAnnouncementsPage />} />
        <Route path="/officer-manage-membership" element={<OfficerManageMembershipPage />} />
        <Route path="/admin-manage-officers" element={<AdminManageOfficerPage />} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;
