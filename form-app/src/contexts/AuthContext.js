import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ Правильный импорт

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при загрузке
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // Если токен еще действует
          if (decoded.exp > currentTime) {
            setCurrentUser(JSON.parse(savedUser));
          } else {
            // Токен просрочен - удаляем данные
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (err) {
          // Невалидный токен
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkTokenValidity();
  }, []);

  async function login(username, password) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } else {
      return { success: false, message: data.error };
    }
  }

  async function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
