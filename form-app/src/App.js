import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminPage from "./components/Admin/AdminPage";
import LeadForm from "./components/LeadForm/LeadForm";
import OrderForm from "./components/OrderForm/OrderForm";
import styles from "./App.module.css";

// Выносим PrivateRoute в отдельный компонент
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

function RoleProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  // Если нет пользователя - редирект на логин
  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // Проверяем роли
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppContent() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="/dashboard">
            <h1>MF-Group Dashboard</h1>
          </a>
          {currentUser && (
            <nav>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/lead-form"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "user", "manager"]}>
                <LeadForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/order-form"
            element={
              <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
                <OrderForm />
              </RoleProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
