import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import React from 'react';

// Simple user state stored in localStorage — no complex auth needed for MVP
export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  saveUser: (userData: User) => void;
  logout: () => void;
}

// Read localStorage synchronously to avoid flash of unauthenticated state
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('nawmai_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('nawmai_user');
    return null;
  }
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  saveUser: () => {},
  logout: () => {},
});

// Provider component — wrap the entire app with this
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);

  const saveUser = useCallback((userData: User) => {
    localStorage.setItem('nawmai_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nawmai_user');
    setUser(null);
  }, []);

  return React.createElement(
    UserContext.Provider,
    { value: { user, loading: false, saveUser, logout } },
    children
  );
};

// Hook — use this in any component to access shared user state
export const useUser = () => useContext(UserContext);
