import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isRightPanelShow: boolean;
  toggleRightPanel: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isRightPanelShow, setIsRightPanelShow] = useState(false);

  const toggleRightPanel = () => {
    setIsRightPanelShow((prev) => !prev);
  };

  return (
    <AuthContext.Provider value={{ isRightPanelShow, toggleRightPanel }}>
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
