import React, { useState } from 'react';
import { login } from '../services/authService';

const LoginForm = ({ onLoginSuccess }) => {
  const [emailOrStudentNumber, setEmailOrStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await login({ emailOrStudentNumber, password });
      localStorage.setItem('accessToken', response.access_token);
      onLoginSuccess(response);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            id="emailOrStudentNumber"
            type="text"
            placeholder="Email or Student Number"
            value={emailOrStudentNumber}
            onChange={(e) => setEmailOrStudentNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="modal-login-button" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;