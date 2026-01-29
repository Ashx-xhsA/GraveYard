import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isRightPanelShow: boolean;
  toggleRightPanel: () => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isRightPanelShow, setIsRightPanelShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleRightPanel = () => {
    setIsRightPanelShow((prev) => !prev);
  };

  const login = () => {
    setIsLoggedIn(true);
    setIsRightPanelShow(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsRightPanelShow(false);
  };

  return (
    <AuthContext.Provider value={{ isRightPanelShow, toggleRightPanel, isLoggedIn, login, logout }}>
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
