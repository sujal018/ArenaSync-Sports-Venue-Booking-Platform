import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('jwtToken');
    const savedUserStr = localStorage.getItem('user');

    if (savedToken && savedUserStr) {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        // Fail-safe check: If parsedUser is corrupted or role is missing/non-string, auto-clean
        if (!parsedUser || typeof parsedUser !== 'object' || typeof parsedUser.role !== 'string') {
          throw new Error('Corrupted user profile in localStorage');
        }

        setToken(savedToken);
        setUser(parsedUser);

        // Safely fetch live status from database without corrupting user object
        if (parsedUser && parsedUser.email) {
          authApi.getUserByEmail(parsedUser.email)
            .then((freshUser) => {
              if (freshUser && typeof freshUser === 'object' && freshUser.status && typeof freshUser.status === 'string') {
                setUser((prev) => {
                  if (!prev || typeof prev !== 'object') return prev;
                  const updated = {
                    ...prev,
                    status: freshUser.status,
                  };
                  if (typeof freshUser.role === 'string') updated.role = freshUser.role;
                  if (typeof freshUser.firstName === 'string') updated.firstName = freshUser.firstName;
                  if (typeof freshUser.lastName === 'string') updated.lastName = freshUser.lastName;
                  localStorage.setItem('user', JSON.stringify(updated));
                  return updated;
                });
              }
            })
            .catch((err) => console.warn('Could not refresh live user status:', err));
        }
      } catch (err) {
        console.error('Cleaning up corrupted user credentials from localStorage:', err);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (jwtToken, userData) => {
    if (!userData || typeof userData.role !== 'string') {
      console.warn('Invalid user data passed to login');
    }
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('jwtToken', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const hasRole = (role) => {
    if (!user || !user.role || typeof user.role !== 'string' || typeof role !== 'string') return false;
    const userRole = user.role.startsWith('ROLE_') ? user.role.substring(5) : user.role;
    const checkRole = role.startsWith('ROLE_') ? role.substring(5) : role;
    return userRole.toUpperCase() === checkRole.toUpperCase();
  };

  const isAuthenticated = !!token && !!user && typeof user === 'object' && typeof user.role === 'string';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        hasRole,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
