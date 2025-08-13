import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import styles from './LeadForm.module.css';




function LeadForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    toggle: 'deal',
    description: '',
    client: '',
    place: '',
    eventName: '#%#',
    dateBegin: '',
    dateEnd: ''
  });

  const [dateError, setDateError] = useState("");

  // Добавляем состояния для уведомления
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Устанавливаем минимальную дату (сегодня) - внутри компонента!
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const minDate = `${year}-${month}-${day}`;

    setFormData((prev) => ({
      ...prev,
      dateBegin: prev.dateBegin || minDate,
      dateEnd: prev.dateEnd || minDate,
    }));
  }, []);

// Проверка валидности формы
useEffect(() => {
  const requiredFields = [
    formData.description,
    formData.client,
    formData.place,
    formData.dateBegin,
    formData.dateEnd
  ];

  const allRequiredFilled = requiredFields.every(field => field.trim() !== '');

  // ✅ Проверка дат - дата окончания не может быть раньше даты начала
  let isDateValid = true;
  setDateError(""); // ✅ Сбрасываем ошибку
  
  if (formData.dateBegin && formData.dateEnd) {
    const beginDate = new Date(formData.dateBegin);
    const endDate = new Date(formData.dateEnd);
    
    if (endDate < beginDate) {
      isDateValid = false;
      setDateError("Дата окончания не может быть раньше даты начала"); //Устанавливаем ошибку
    }
  }

  setIsFormValid(allRequiredFilled && isDateValid);
}, [formData]);

  // Таймер для автоматического закрытия уведомления
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        navigate("/dashboard"); // Переход на dashboard через 3 секунды
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

const handleChange = (e) => {
  const { name, value } = e.target;
  
  // ✅ Автоматически устанавливаем дату окончания равной дате начала если она меньше
  if (name === 'dateBegin' && formData.dateEnd && new Date(value) > new Date(formData.dateEnd)) {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      dateEnd: value // Автоматически выравниваем дату окончания
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const handleToggleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      toggle: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert("Пожалуйста, заполните все обязательные поля корректно");
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/lead/create-lead', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toggle: formData.toggle,
          description: formData.description,
          client: formData.client,
          place: formData.place,
          eventName: formData.eventName,
          dateBegin: formData.dateBegin,
          dateEnd: formData.dateEnd
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        // ✅ Показываем реальный текст из ответа сервера
        let messageToShow = "Заявка успешно создана"; // По умолчанию
        
        // Проверяем, что пришло в ответе от твоего сервера
        if (responseData.details) {
          // Если есть сообщение от 1С
          messageToShow = responseData.details;
        } else if (responseData.message) {
          // Если сервер вернул своё сообщение
          messageToShow = responseData.message;
        }
        
        setSuccessMessage(messageToShow);
        setShowSuccess(true);
        
        // ✅ Очищаем форму
        setFormData({
          toggle: 'deal',
          description: '',
          client: '',
          place: '',
          eventName: '',
          dateBegin: '',
          dateEnd: ''
        });
      } else {
        console.error('Детали ошибки:', responseData);
        alert(`Ошибка: ${responseData.message}\nДетали: ${responseData.details || 'Нет деталей'}`);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка сети: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      {/* ✅ Модальное окно успеха */}
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successModal}>
            <div className={styles.successIcon}></div>
            <h3>Успешно!</h3>
            <p>{successMessage}</p>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
            <p className={styles.redirectText}>Переход на главную через 3 секунды...</p>
          </div>
        </div>
      )}

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2>Создание заявки</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className={styles.backButton}
          >
            ← Назад
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Радио кнопки */}
          <div className={styles.toggle}>
            <input
              type="radio"
              name="toggle"
              id="deal"
              value="deal"
              checked={formData.toggle === 'deal'}
              onChange={() => handleToggleChange('deal')}
              className={styles.toggleInput}
            />
            <label 
              className={`${styles.toggleLabel} ${formData.toggle === 'deal' ? styles.active : ''}`}
              htmlFor="deal"
            >
              Обычная сделка
            </label>
          
            <input
              type="radio"
              name="toggle"
              id="rent"
              value="rent"
              checked={formData.toggle === 'rent'}
              onChange={() => handleToggleChange('rent')}
              className={styles.toggleInput}
            />
            <label 
              className={`${styles.toggleLabel} ${formData.toggle === 'rent' ? styles.active : ''}`}
              htmlFor="rent"
            >
              Сухая аренда
            </label>
          </div>

          {/* Поля ввода */}
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="description">Описание заявки: *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="client">Клиент: *</label>
            <input
              type="text"
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="place">Место проведения: *</label>
            <input
              type="text"
              id="place"
              name="place"
              value={formData.place}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="eventName">Название программы (опционально):</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
      
          {/* Поля выбора даты */}
          <div className={styles.inputField}>
  <label className={styles.label} htmlFor="dateBegin">Дата начала: *</label>
  <input
    type="date"
    id="dateBegin"
    name="dateBegin"
    value={formData.dateBegin}
    onChange={handleChange}
    required
    className={styles.input}
    min={new Date().toISOString().split('T')[0]} // Минимум - сегодня
  />
</div>
          
          <div className={styles.inputField}>
  <label className={styles.label} htmlFor="dateEnd">Дата окончания: *</label>
  <input
    type="date"
    id="dateEnd"
    name="dateEnd"
    value={formData.dateEnd}
    onChange={handleChange}
    required
    className={styles.input}
    min={formData.dateBegin || new Date().toISOString().split('T')[0]} // Минимум - дата начала или сегодня
    style={{
      borderColor: dateError ? "#dc3545" : "" // ✅ Красная рамка при ошибке
    }}
  />
  {/* ✅ Отображаем сообщение об ошибке */}
  {dateError && (
    <div
      style={{
        color: "#dc3545",
        fontSize: "0.8rem",
        marginTop: "5px",
      }}
    >
      {dateError}
    </div>
  )}
</div>

          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={!isFormValid || loading}
          >
            {loading ? 'Создание...' : 'Создать программу'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LeadForm;