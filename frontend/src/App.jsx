import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Real Page Imports
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import Invoices from './pages/Invoices';
import AdminDashboard from './pages/AdminDashboard';

// --- STUB COMPONENTS FOR ROUTING (To be replaced with full implementations step-by-step) ---
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user.role === 'patient') return <PatientDashboard />;
  if (user.role === 'doctor') return <DoctorDashboardStub />;
  if (user.role === 'admin') return <AdminDashboard />;
  return <StaffDashboardStub />;
};

const DoctorDashboardStub = () => (
  <div className="glass-card">
    <h2>Doctor Dashboard</h2>
    <p>Welcome to the doctor clinic panel. View your daily patients and update consultations.</p>
  </div>
);

const StaffDashboardStub = () => (
  <div className="glass-card">
    <h2>Staff Dashboard</h2>
    <p>Welcome to the receptionist front desk. Register patients and draft billing records.</p>
  </div>
);

const HistoryStub = () => <div className="glass-card"><h2>Medical History</h2><p>Patient electronic health records.</p></div>;
const ChatStub = () => <div className="glass-card"><h2>Consultation Chat</h2><p>Secure direct patient-doctor message logs.</p></div>;
const DoctorsStub = () => <div className="glass-card"><h2>Manage Doctors</h2><p>Administration panel to oversee doctors directories.</p></div>;
const StaffStub = () => <div className="glass-card"><h2>Manage Staff</h2><p>Administration panel to oversee receptionist personnel.</p></div>;
const RegisterPatientStub = () => <div className="glass-card"><h2>Register Patient</h2><p>Receptionist portal to register new patient folders.</p></div>;

// --- PROTECTED ROUTE CHECKER ---
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- APP LAYOUT WRAPPER ---
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Header toggleSidebar={toggleSidebar} />
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/register/patient" replace />} />
          <Route path="/register/:roleType" element={<Register />} />

          {/* Protected MERN App Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/history" element={<HistoryStub />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/chat" element={<ChatStub />} />
              <Route path="/doctors" element={<DoctorsStub />} />
              <Route path="/staff" element={<StaffStub />} />
              <Route path="/register-patient" element={<RegisterPatientStub />} />
              
              {/* Fallbacks */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
