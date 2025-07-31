import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext'; // Импорт AuthProvider
import AppInit from './components/AppInit'; // Импорт AppInit

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppInit>
        <App />
      </AppInit>
    </AuthProvider>
  </React.StrictMode>
);