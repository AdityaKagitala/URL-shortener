import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(username, password);
      setMessage('Registration successful! Redirecting to login...');
      
      // Redirect to login page after 1 seconds
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Signup</h2>
      <form className="signup-form" onSubmit={handleSignup}>
        <input
          className="signup-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="signup-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="signup-button" type="submit">Signup</button>
      </form>
      <p className={`signup-message ${message.includes('success') || message.includes('created') ? 'success' : message.includes('failed') || message.includes('error') ? 'error' : ''}`}>
        {message}
      </p>
    </div>
  );
};

export default SignupPage;
