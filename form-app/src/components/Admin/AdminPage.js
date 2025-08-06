import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminPage.module.css';

function AdminPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    role: 'user'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // ✅ Добавляем состояние валидности формы
  const [isFormValid, setIsFormValid] = useState(false);

  // ✅ Проверяем валидность формы при изменении данных
  useEffect(() => {
    const { username, password, email, name } = formData;
    setIsFormValid(
      username.trim() !== '' &&
      password.trim() !== '' &&
      email.trim() !== '' &&
      name.trim() !== ''
    );
  }, [formData]);

  // Проверяем, имеет ли пользователь доступ
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <h2>Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Пользователь успешно создан!');
        // Очищаем форму
        setFormData({
          username: '',
          password: '',
          email: '',
          name: '',
          role: 'user'
        });
      } else {
        setError(data.message || 'Ошибка при создании пользователя');
      }
    } catch (err) {
      setError('Ошибка сети: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h2>Администрирование</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          ← Назад в кабинет
        </button>
      </div>

      <div className={styles.formContainer}>
        <h3>Создание нового пользователя</h3>
        
        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.userForm}>
          <div className={styles.formGroup}>
            <label>Имя пользователя:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Введите username"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Введите пароль"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@domain.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Полное имя:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Роль:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
              <option value="viewer">Наблюдатель</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !isFormValid} // ✅ Добавили проверку
            className={styles.submitButton}
          >
            {loading ? 'Создание...' : 'Создать пользователя'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPage;