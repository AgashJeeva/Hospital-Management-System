import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  History,
  FileText,
  MessageSquare,
  Users,
  Activity,
  UserCheck,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  // Define navigation links based on role
  const getNavLinks = () => {
    switch (role) {
      case 'patient':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/book', label: 'Book Appointment', icon: <Calendar size={20} /> },
          { path: '/history', label: 'Medical History', icon: <History size={20} /> },
          { path: '/invoices', label: 'My Invoices', icon: <FileText size={20} /> },
          { path: '/chat', label: 'Consult Chat', icon: <MessageSquare size={20} /> },
        ];
      case 'doctor':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/appointments', label: 'My Appointments', icon: <Calendar size={20} /> },
          { path: '/patients', label: 'My Patients', icon: <Users size={20} /> },
          { path: '/chat', label: 'Patient Chat', icon: <MessageSquare size={20} /> },
        ];
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/doctors', label: 'Manage Doctors', icon: <Briefcase size={20} /> },
          { path: '/staff', label: 'Manage Staff', icon: <UserCheck size={20} /> },
          { path: '/appointments', label: 'Appointments', icon: <Calendar size={20} /> },
          { path: '/invoices', label: 'Hospital Billing', icon: <DollarSign size={20} /> },
        ];
      case 'staff':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { path: '/appointments', label: 'Manage Bookings', icon: <Calendar size={20} /> },
          { path: '/register-patient', label: 'Register Patient', icon: <Users size={20} /> },
          { path: '/invoices', label: 'Create Invoice', icon: <DollarSign size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <Activity className="logo-icon" size={28} />
        <span className="logo-text">ApexCare</span>
      </div>
      
      <nav className="sidebar-nav">
        {navLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            <span className="link-icon">{link.icon}</span>
            <span className="link-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <span className="user-role-badge">{role} Portal</span>
      </div>
    </aside>
  );
};

export default Sidebar;
