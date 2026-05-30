/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Check for logged-in user on load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          setUser({
            ...data,
            token, // Keep token in state for queries
          });
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error verifying auth token:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Theme Sync effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle Theme helper
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        
        // Fetch full profile details immediately
        const profileRes = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        const profileData = await profileRes.json();
        
        if (profileData.success) {
          const fullUser = { ...profileData, token: data.token };
          setUser(fullUser);
          setLoading(false);
          return { success: true, user: fullUser };
        }
      }
      setLoading(false);
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        
        // Fetch full profile details immediately
        const profileRes = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        const profileData = await profileRes.json();

        if (profileData.success) {
          const fullUser = { ...profileData, token: data.token };
          setUser(fullUser);
          setLoading(false);
          return { success: true, user: fullUser };
        }
      }
      setLoading(false);
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile details handler
  const updateProfile = async (profileData) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();

      if (data.success) {
        // Refetch profile to keep extraData synced
        const profileRes = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const fullProfile = await profileRes.json();

        if (fullProfile.success) {
          const updatedUser = { ...fullProfile, token: user.token };
          setUser(updatedUser);
          return { success: true, user: updatedUser };
        }
      }
      return { success: false, message: data.message || 'Profile update failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
