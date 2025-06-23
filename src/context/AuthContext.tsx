import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { SERVER_URL, USER_STORAGE_KEY, ROOMS_STORAGE_KEY } from '@/constants';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const loadingToastId = toast.loading('Logging in...');
    // Demo login for testing purposes
    if (email === 'demo@example.com' && password === 'password') {
      const mockUser = {
        name: 'Demo User',
        email: 'demo@example.com',
      };
      setUser(mockUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

      setIsLoading(false);
      toast.dismiss(loadingToastId);
      toast.success('Demo login successful!');
      navigate('/');
      return;
    }
    try {
      // Make API call to the login endpoint
      const url = `${SERVER_URL}/api/v1/users/login`;
      const response = await axios.post(
        url,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      // console.log('Login response:', response);

      const data = response.data.data;

      if (response.status !== 200) {
        throw new Error(data.message || 'Login failed');
      }

      // Extract user data from response
      const loggedInUser = {
        name: data.user.name,
        email: data.user.email,
      };

      // Set user in state and localStorage
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));

      toast.dismiss(loadingToastId);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';
      toast.dismiss(loadingToastId);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    setIsLoading(true);
    const loadingToastId = toast.loading('Registering...');
    try {
      // Make API call to the signup endpoint
      const url = `${SERVER_URL}/api/v1/users/signup`;
      const response = await axios.post(
        url,
        {
          name,
          email,
          password,
          passwordConfirm,
        },
        { withCredentials: true }
      );

      //   console.log('Login response:', response);

      const data = response.data.data;

      if (response.status !== 201) {
        throw new Error(data.message || 'Login failed');
      }

      // Log in the user after registration
      const loggedInUser = {
        name: data.user.name,
        email: data.user.email,
      };

      // Set user in state and localStorage
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));

      toast.dismiss(loadingToastId);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      //   console.log('Registration error:', error.response.data);
      if (error.response.data?.message.toLowerCase().includes('duplicate')) {
        error.message = 'Email already exists. Please use a different email.';
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.';

      toast.dismiss(loadingToastId);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const loadingToastId = toast.loading('Logging out...');
    try {
      await axios.get(`${SERVER_URL}/api/v1/users/logout`, {
        withCredentials: true,
      });
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ROOMS_STORAGE_KEY);
      // document.cookie = null; // Clear cookies

      toast.dismiss(loadingToastId);
      toast.info('You have been logged out');
      navigate('/login');
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
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
