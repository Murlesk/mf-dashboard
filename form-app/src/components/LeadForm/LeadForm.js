import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./LeadForm.module.css";

function LeadForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    toggle: "deal",
    description: "",
    client: "",
    place: "",
    eventName: "",
    dateBegin: "",
    dateEnd: "",
  });

  // Состояние для валидации формы
  const [isFormValid, setIsFormValid] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  // Проверка валидности формы
  useEffect(() => {
    const requiredFields = [
      formData.description,
      formData.client,
      formData.place,
      formData.dateBegin,
      formData.dateEnd,
    ];

    const allRequiredFilled = requiredFields.every(
      (field) => field.trim() !== ""
    );
    setIsFormValid(allRequiredFilled && formData.dateBegin <= formData.dateEnd);
  }, [formData]);

  // Устанавливаем минимальную дату окончания
  useEffect(() => {
    if (formData.dateBegin) {
      setFormData((prev) => ({
        ...prev,
        dateEnd:
          prev.dateEnd && prev.dateBegin <= prev.dateEnd
            ? prev.dateEnd
            : prev.dateBegin,
      }));
    }
  }, [formData.dateBegin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      toggle: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!isFormValid) {
    alert("Пожалуйста, заполните все обязательные поля корректно");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    
       const response = await fetch('http://localhost:5000/api/lead/create-lead', {
      method: "POST",
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
        // sender НЕ добавляем, т.к. его нет в форме
      })
    });

    const responseData = await response.json();
    
    if (response.ok) {
      alert("Заявка успешно создана!");
      // Сброс формы
      setFormData({
        toggle: "deal",
        description: "",
        client: "",
        place: "",
        eventName: "",
        dateBegin: "",
        dateEnd: "",
      });
    } else {
      console.error('Детали ошибки:', responseData);
      alert(`Ошибка: ${responseData.message}\nДетали: ${responseData.details || 'Нет деталей'}`);
    }
  } catch (error) {
    console.error('Ошибка сети:', error);
    alert("Ошибка сети: " + error.message);
  }
};

  if (!currentUser) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2>Создание заявки</h2>
          <button
            onClick={() => navigate("/dashboard")}
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
              checked={formData.toggle === "deal"}
              onChange={() => handleToggleChange("deal")}
              className={styles.toggleInput}
            />
            <label
              className={`${styles.toggleLabel} ${
                formData.toggle === "deal" ? styles.active : ""
              }`}
              htmlFor="deal"
            >
              Обычная сделка
            </label>

            <input
              type="radio"
              name="toggle"
              id="rent"
              value="rent"
              checked={formData.toggle === "rent"}
              onChange={() => handleToggleChange("rent")}
              className={styles.toggleInput}
            />
            <label
              className={`${styles.toggleLabel} ${
                formData.toggle === "rent" ? styles.active : ""
              }`}
              htmlFor="rent"
            >
              Сухая аренда
            </label>
          </div>

          {/* Поля ввода */}
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="description">
              Описание заявки: *
            </label>
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
            <label className={styles.label} htmlFor="client">
              Клиент: *
            </label>
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
            <label className={styles.label} htmlFor="place">
              Место проведения: *
            </label>
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
            <label className={styles.label} htmlFor="eventName">
              Название программы (опционально):
            </label>
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
            <label className={styles.label} htmlFor="dateBegin">
              Дата начала: *
            </label>
            <input
              type="date"
              id="dateBegin"
              name="dateBegin"
              value={formData.dateBegin}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="dateEnd">
              Дата окончания: *
            </label>
            <input
              type="date"
              id="dateEnd"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleChange}
              min={formData.dateBegin}
              required
              className={styles.input}
              style={{
                borderColor:
                  formData.dateBegin &&
                  formData.dateEnd &&
                  formData.dateBegin > formData.dateEnd
                    ? "#dc3545"
                    : "",
              }}
            />
            {formData.dateBegin &&
              formData.dateEnd &&
              formData.dateBegin > formData.dateEnd && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "0.8rem",
                    marginTop: "5px",
                  }}
                >
                  Дата окончания не может быть раньше даты начала
                </div>
              )}
          </div>

          <button
            type="submit"
            className={styles.sendButton}
            disabled={!isFormValid}
          >
            Создать программу
          </button>
        </form>
      </div>
    </div>
  );
}

export default LeadForm;
