import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // При загрузке приложения проверяем, есть ли сохранённый пользователь
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(username, password) {  // ✅ Изменил параметр на username
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),  // ✅ Отправляем username
    });

    const data = await response.json();

    if (response.ok) {
      // Сохраняем токен и пользователя
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  }

  async function logout() {
    // Удаляем данные из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}