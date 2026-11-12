import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, getToken, setToken, clearToken } from '../api';
import { Facilitator, RegisterData } from '../types';

interface AuthContextType {
  facilitator: Facilitator | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [facilitator, setFacilitator] = useState<Facilitator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me()
        .then(setFacilitator)
        .catch(() => clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { token, facilitator: f } = await authApi.login(email, password);
    setToken(token);
    setFacilitator(f);
  };

  const register = async (data: RegisterData) => {
    const { token, facilitator: f } = await authApi.register(data);
    setToken(token);
    setFacilitator(f);
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    clearToken();
    setFacilitator(null);
  };

  return (
    <AuthContext.Provider value={{ facilitator, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
