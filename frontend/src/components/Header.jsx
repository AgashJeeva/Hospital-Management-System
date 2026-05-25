import React from 'react';
import { Menu, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const { user, logout, theme, toggleTheme } = useAuth();

  if (!user) return null;

  // Format greeting name
  const getGreeting = () => {
    if (user.role === 'doctor') {
      return `Dr. ${user.name}`;
    }
    return user.name;
  };

  return (
    <header className="main-header">
      <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <Menu size={24} />
      </button>

      <div className="header-brand">
        <span className="brand-subtitle">Hometown Medical Hub</span>
      </div>

      <div className="header-actions">
        {/* Theme Toggle Button */}
        <button 
          className="header-action-btn theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* User Info Badge */}
        <div className="header-user-profile">
          <div className="user-avatar-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="user-avatar-img" />
            ) : (
              <div className="user-avatar-placeholder">
                <UserIcon size={18} />
              </div>
            )}
          </div>
          <div className="user-meta-details">
            <span className="user-welcome-name">{getGreeting()}</span>
            <span className="user-role-label">{user.role}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="header-divider"></div>

        {/* Logout Button */}
        <button 
          className="header-action-btn logout-btn" 
          onClick={logout}
          title="Logout of your account"
        >
          <LogOut size={20} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
