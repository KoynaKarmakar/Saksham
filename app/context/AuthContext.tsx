// app/context/AuthContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
// 1. IMPORT API UTILITIES
import { apiFetch, setToken, removeToken, getToken } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  // Add other necessary user properties here
  // ...
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null; // Track full user object
  loading: boolean;
  // 2. UPDATE FUNCTION SIGNATURES TO HANDLE API CALLS
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use effect to check initial login status from storage
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getToken();
      if (token) {
        try {
          // Attempt to fetch user data using the stored token
          const { user: fetchedUser } = await apiFetch('/users/me', { method: 'GET' });
          setUser(fetchedUser);
          setIsLoggedIn(true);
        } catch (error) {
          // Token is invalid or expired
          console.error("Token invalid, logging out.");
          removeToken();
          setIsLoggedIn(false);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);


  const handleAuthSuccess = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    setIsLoggedIn(true);
  }

  // 3. Implement Signup logic
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    handleAuthSuccess(res.token, res.user);
  };

  // 4. Implement Login logic
  const login = async (email: string, password: string): Promise<void> => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    handleAuthSuccess(res.token, res.user);
  };

  // 5. Implement Logout logic
  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
    // Redirect to home page (handled by component or layout)
  };

  if (loading) {
    // Optionally render a loading spinner or null while checking auth status
    return null;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Re-export for convenience
export type { User };