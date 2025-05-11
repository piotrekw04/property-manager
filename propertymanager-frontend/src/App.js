import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

// Komponenty
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import Login from './components/Login';
import PropertyList from './components/PropertyList';
import AddProperty from './components/AddProperty';
import LeaseManagement from './components/LeaseManagement';
import Payments from './components/Payments';
import UserPanel from './components/UserPanel';
import Register from './components/Register';
import EditProperty from './components/EditProperty'; 
import EditLease from './components/EditLease';
import EditPayment from './components/EditPayment';
import AddLease from './components/AddLease'; 
import Chat from './components/Chat';
import PendingLeases from './components/PendingLeases';
import Activate from './components/Activate';
import ResetPassword from './components/ResetPassword';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';
import Dashboard from './components/Dashboard';
import AddPayment from './components/AddPayment';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await api.get('/user/profile/');
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    verifyAuth();
  }, []);

  return (
    <BrowserRouter>
      {isLoggedIn && <Navigation />}
      <main>
        <Routes>
          <Route path="/" element={
            isLoggedIn ? <Navigate to="/properties" replace /> : <LandingPage />
          } />
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/properties" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />
          } />
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/properties" replace /> : <Register />
          } />
          <Route path="/activate/:uidb64/:token" element={
            <Activate />
          } />
          <Route path="/reset-password" element={
            <ResetPassword />
          } />
          <Route path="/reset-password-confirm/:uidb64/:token" element={
            <ResetPasswordConfirm />
          } />
          <Route path="/dashboard" element={
            isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/properties" element={
            isLoggedIn ? <PropertyList /> : <Navigate to="/login" replace />
          } />
          <Route path="/addproperty" element={
            isLoggedIn ? <AddProperty /> : <Navigate to="/login" replace />
          } />
          <Route path="/leases" element={
            isLoggedIn ? <LeaseManagement /> : <Navigate to="/login" replace />
          } />
          <Route path="/payments" element={
            isLoggedIn ? <Payments /> : <Navigate to="/login" replace />
          } />
          <Route path="/addpayment" element={
            isLoggedIn ? <AddPayment /> : <Navigate to="/login" replace />
          } />
          <Route path="/user" element={
            isLoggedIn ? <UserPanel /> : <Navigate to="/login" replace />
          } />
          <Route path="/editproperty/:id" element={
            isLoggedIn ? <EditProperty /> : <Navigate to="/login" replace />
          } />
          <Route path="/editlease/:id" element={
            isLoggedIn ? <EditLease /> : <Navigate to="/login" replace />
          } />
          <Route path="/editpayment/:id" element={
            isLoggedIn ? <EditPayment /> : <Navigate to="/login" replace />
          } />
          <Route path="/addleasing" element={
            isLoggedIn ? <AddLease /> : <Navigate to="/login" replace />
          } />
          <Route path="/chat" element={
            isLoggedIn ? <Chat /> : <Navigate to="/login" replace />
          } />
          <Route path="/pendingleases" element={
            isLoggedIn ? <PendingLeases /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
