// app/context/AuthContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch, setToken, removeToken, getToken } from '@/lib/api';

// Finalized User interface based on the Mongoose model
interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  tagline?: string;
  profilePicture?: string;
  gigsCompleted: number;
  rating: number;
  portfolio: { title?: string; url?: string };
  socialLinks: string[];
  billing: {
    card?: string;
    address?: string;
    plan?: string;
  };
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getToken();
      if (token) {
        try {
          const { user: fetchedUser } = await apiFetch('/users/me', { method: 'GET' });
          setUser(fetchedUser);
          setIsLoggedIn(true);
        } catch (error) {
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

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    handleAuthSuccess(res.token, res.user);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    handleAuthSuccess(res.token, res.user);
  };

  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  if (loading) {
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

export type { User };