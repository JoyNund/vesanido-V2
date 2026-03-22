import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User as UserType, SavedTrack } from '../types';
import { authService, userService } from '../services/api';

interface AuthContextType {
  user: UserType | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  adminLogin: (password: string) => Promise<void>;
  logout: () => void;
  saveTrack: (track: Omit<SavedTrack, 'id' | 'savedAt'>) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
  updateUser: (data: Partial<Pick<UserType, 'name' | 'email'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const adminToken = localStorage.getItem('admin_token');
      
      setIsAdmin(!!adminToken);
      
      if (token) {
        try {
          const userData = await userService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authService.register(email, password, name);
    setUser(response.user);
  };

  const adminLogin = async (password: string) => {
    await authService.adminLogin(password);
    setIsAdmin(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const saveTrack = async (track: Omit<SavedTrack, 'id' | 'savedAt'>) => {
    const updatedUser = await userService.saveTrack(track);
    setUser(updatedUser);
  };

  const removeTrack = async (trackId: string) => {
    const updatedUser = await userService.removeTrack(trackId);
    setUser(updatedUser);
  };

  const updateUser = async (data: Partial<Pick<UserType, 'name' | 'email'>>) => {
    const updatedUser = await userService.updateProfile(data);
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        adminLogin,
        logout,
        saveTrack,
        removeTrack,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
