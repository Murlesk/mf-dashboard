import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Создаем контекст
const AuthContext = createContext();

// 2. Создаем кастомный хук useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 3. Создаем провайдер
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

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
    
    // Добавьте явное сохранение username
    setCurrentUser({ 
      username, // Сохраняем логин
      ...data.user // И другие данные пользователя
    });

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
  if (token) {
    const decoded = jwtDecode(token);
    setCurrentUser({ 
      username: decoded.username || decoded.sub, // Используем username или sub из токена
      email: decoded.email, 
      role: decoded.role 
    });
  }
}, []);

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