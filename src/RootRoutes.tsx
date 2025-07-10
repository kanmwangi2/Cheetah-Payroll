import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';

const RootRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login onSuccess={() => window.location.replace('/')} />} />
      <Route path="/signup" element={<SignUp onSuccess={() => window.location.replace('/')} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  </BrowserRouter>
);

export default RootRoutes;
