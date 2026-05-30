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
    <aside className={`fixed top-0 left-0 bottom-0 w-[270px] bg-bg-surface border-r border-border-color flex flex-col z-[99] transition-all duration-300 max-lg:-translate-x-full ${isOpen ? 'max-lg:translate-x-0 max-lg:shadow-lg' : ''}`}>
      <div className="h-[70px] flex items-center gap-3 px-6 border-b border-border-color">
        <Activity className="text-primary animate-pulse" size={28} />
        <span className="font-heading text-xl font-extrabold text-text-primary tracking-tight">ApexCare</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {navLinks.map((link, idx) => (
          <NavLink
            key={idx}
            to={link.path}
            className={({ isActive }) => `flex items-center gap-3.5 py-3 px-4 rounded-lg text-text-secondary font-medium transition-all duration-300 text-[15px] hover:bg-bg-main hover:text-text-primary hover:translate-x-1 ${isActive ? 'bg-primary-light text-primary font-semibold' : ''}`}
            onClick={toggleSidebar}
          >
            <span className="flex items-center justify-center transition-all duration-300">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="py-5 px-6 border-t border-border-color">
        <span className="inline-block font-heading bg-primary-light text-primary text-xs font-semibold py-1.5 px-3.5 rounded-full uppercase tracking-wider">{role} Portal</span>
      </div>
    </aside>
  );
};

export default Sidebar;
