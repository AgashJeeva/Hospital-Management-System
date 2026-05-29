import React from 'react';
import { Menu, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    <header className="h-[70px] bg-bg-surface border-b border-border-color flex items-center justify-between px-[30px] sticky top-0 z-[90] transition-all duration-300">
      <button className="max-lg:block hidden bg-none border-none text-text-primary cursor-pointer p-1 rounded transition-all duration-300 hover:bg-bg-main" onClick={toggleSidebar} aria-label="Toggle Sidebar">
        <Menu size={24} />
      </button>

      <div className="font-heading">
        <span className="text-[13px] font-semibold text-text-muted uppercase tracking-[1px]">Hometown Medical Hub</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Theme Toggle Button */}
        <button 
          className="bg-none border-none text-text-secondary cursor-pointer flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:bg-bg-main hover:text-text-primary" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* User Info Badge */}
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full overflow-hidden bg-primary-light border-1.5 border-border-color flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-primary">
                <UserIcon size={18} />
              </div>
            )}
          </div>
          <div className="flex flex-col max-sm:hidden">
            <span className="text-[14px] font-semibold text-text-primary">{getGreeting()}</span>
            <span className="text-[11px] text-text-muted uppercase font-medium">{user.role}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-border-color"></div>

        {/* Logout Button */}
        <button 
          className="rounded px-4 py-2 flex items-center gap-2 font-medium text-[14px] font-heading hover:bg-danger-bg hover:text-danger max-sm:p-2 max-sm:rounded-full bg-none border-none text-text-secondary cursor-pointer transition-all duration-300" 
          onClick={logout}
          title="Logout of your account"
        >
          <LogOut size={20} />
          <span className="inline-block max-sm:hidden">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
