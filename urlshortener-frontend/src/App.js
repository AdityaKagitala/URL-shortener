import React from 'react'
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import {ToastContainer} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Home from './Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';


const App = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <main>
      <nav style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
        {token ? (
          <>
            <Link to="/">Home</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup">Signup</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer position="bottom-right" />
    </main>

  )
}

export default App