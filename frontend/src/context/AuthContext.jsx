import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';
import {
  getCurrentUserApi,
  loginApi,
  registerApi,
  logoutApi,
  googleAuthApi,
  getStoredToken
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Visitors start as unauthenticated guest unless a stored session exists
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'guest' | 'tenant' | 'owner' | 'admin'
  const [loading, setLoading] = useState(true);
  const [redirectDestination, setRedirectDestination] = useState(null);

  // Restore authenticated session on mount from HttpOnly cookie or stored token
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const user = await getCurrentUserApi();
        if (isMounted && user) {
          setCurrentUser(user);
          setRole(user.role || 'tenant');
        }
      } catch (err) {
        // No active session or expired
        if (isMounted) {
          setCurrentUser(null);
          setRole('guest');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithCredentials = async (email, password) => {
    const data = await loginApi({ email, password });
    if (data?.user) {
      setCurrentUser(data.user);
      setRole(data.user.role || 'tenant');
      return data.user;
    }
    throw new Error('Invalid login response from server');
  };

  const registerWithDetails = async (userData) => {
    const data = await registerApi({
      name: userData.fullName || userData.name,
      email: userData.email,
      phone: userData.phone || null,
      password: userData.password,
      role: userData.role || 'tenant'
    });
    if (data?.user) {
      setCurrentUser(data.user);
      setRole(data.user.role || 'tenant');
      return data.user;
    }
    throw new Error('Invalid registration response from server');
  };

  const loginWithGoogle = async (idToken, roleChoice = 'tenant') => {
    const data = await googleAuthApi(idToken, roleChoice);
    if (data?.user) {
      setCurrentUser(data.user);
      setRole(data.user.role || 'tenant');
      return data.user;
    }
    throw new Error('Google authentication failed');
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setCurrentUser(null);
      setRole('guest');
      setRedirectDestination(null);
    }
  };

  // Quick Persona Switcher for evaluation/demo
  const switchRole = (newRole) => {
    setRole(newRole);
    if (newRole === 'guest') {
      setCurrentUser(null);
    } else if (mockUsers[newRole]) {
      setCurrentUser(mockUsers[newRole]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isLoggedIn: !!currentUser && role !== 'guest',
        loading,
        login: loginWithCredentials,
        register: registerWithDetails,
        loginWithGoogle,
        logout,
        switchRole,
        redirectDestination,
        setRedirectDestination
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
