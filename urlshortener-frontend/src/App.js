import React from 'react'
import { Link, Route, Routes } from "react-router-dom";
import {ToastContainer} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Home from './Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';


const App = () => {
  return (
    <main>
      <nav style={{ display: 'flex', gap: 16, padding: 16 }}>
        <Link to="/signup">Signup</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path='/signup' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={<Home />} />
      </Routes>
      <ToastContainer position="bottom-right" />
    </main>
    
  )
}

export default App