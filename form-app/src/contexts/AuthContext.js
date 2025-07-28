import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

// В AuthContext.js
const login = (email, password) => {
  if (email === 'test@test.com' && password === '123456') {
    setCurrentUser({ email });
    return Promise.resolve();
  }
  return Promise.reject(new Error('Auth failed'));
};

  const logout = () => {
    setCurrentUser(null);
    return Promise.resolve();
  };

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}