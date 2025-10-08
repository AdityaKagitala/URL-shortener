import React from 'react'
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import Home from './Home';
import Login from './components/loginpage/Login';


const App = () => {
  return (
    <main>
      <Login />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <ToastContainer  position="bottom-right"/>
    </main>
      
    
  )
}

export default App