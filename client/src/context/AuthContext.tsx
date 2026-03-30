import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';

interface User {
  id: string;
  username: string;
  email?: string;
  gravesCreated?: number;
  interactionsMade?: number;
}

interface AuthContextType {
  isRightPanelShow: boolean;
  toggleRightPanel: () => void;
  isLoggedIn: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isRightPanelShow, setIsRightPanelShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const toggleRightPanel = () => {
    setIsRightPanelShow((prev) => !prev);
  };

  const fetchUser = async (): Promise<User | null> => {
    try {
      const res = await api.get('/user/me');
      const userData: User = {
        id: res.data.user.id,
        username: res.data.user.username,
        email: res.data.user.email,
        gravesCreated: res.data.gravesCreated,
        interactionsMade: res.data.interactionsMade,
      };
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    }
  };

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setIsLoggedIn(true);
    setIsRightPanelShow(true);
    await fetchUser();
  };

  const register = async (username: string, password: string) => {
    await api.post('/auth/register', { username, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsRightPanelShow(false);
    setUser(null);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider
      value={{ isRightPanelShow, toggleRightPanel, isLoggedIn, user, login, register, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
