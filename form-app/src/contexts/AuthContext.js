import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Добавляем состояние загрузки

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Ошибка входа');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setCurrentUser({ username, ...data.user });
      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    window.location.reload(true); 
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      // Проверяем срок действия токена
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Токен истёк');
      }

      setCurrentUser({
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      });
    } catch (err) {
      console.error('Ошибка проверки токена:', err);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    isLoading, // Добавляем в контекст
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}