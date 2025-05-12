import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="login-page">
      <header className="site-header">
        <div className="header-content">
          <img src="/images/diamond_design.png" alt="SPECS Logo" className="header-logo" />
          <h1 className="header-title">
            <span className="specs">SPECS</span> <span className="nexus">Nexus</span>
          </h1>
        </div>
        <button className="login-button" onClick={openModal}>
          Login
        </button>
      </header>

      <div className="container">
        <div className="right-section">
          <img src="/images/specslogo.png" alt="SPECS Seal" className="seal-image" />
        </div>

        <div className="left-section">
          <ul className="acronym">
            <li><span>S</span>ociety of</li>
            <li><span>P</span>rogramming</li>
            <li><span>E</span>nthusiasts in</li>
            <li><span>C</span>omputer</li>
            <li><span>S</span>cience</li>
          </ul>
          <div className="seals">
            <img src="/images/gclogo.png" alt="Gordon College Seal" />
            <img src="/images/ccslogo.png" alt="CCS Seal" />
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target.classList.contains('modal')) closeModal();
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2 className="welcome-title">Welcome!</h2>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;