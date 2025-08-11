import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./OrderForm.module.css";

function OrderForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organization: "МодифиК",
    customer: "",
    date: "",
    dateFrom: "",
    region: "",
    address1: "",
    address2: "",
    goods: "Сценическое оборудование",
    weight: "",
    comment: "",
  });

  // Добавляем состояние для ошибки дат
  const [dateError, setDateError] = useState("");

  const [dataGroup1, setDataGroup1] = useState([]);
  const [dataGroup2, setDataGroup2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);

  // ✅ Добавляем состояния для уведомления
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Проверка авторизации
  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

// Проверка валидности формы
useEffect(() => {
  const requiredFields = [
    formData.customer,
    formData.date,
    formData.dateFrom,
    formData.region,
    formData.address1,
    formData.weight,
  ];

  const allRequiredFilled = requiredFields.every(
    (field) =>
      field !== null && field !== undefined && field.toString().trim() !== ""
  );

  // Проверка, что вес является числом больше 0
  const isWeightValid =
    formData.weight && !isNaN(formData.weight) && Number(formData.weight) > 0;

  // ✅ Проверка дат - дата возврата не может быть меньше даты поездки
  let isDateValid = true;
  setDateError(""); // ✅ Сбрасываем ошибку
  
  if (formData.date && formData.dateFrom) {
    const pickupDate = new Date(formData.date);
    const returnDate = new Date(formData.dateFrom);
    
    if (returnDate < pickupDate) {
      isDateValid = false;
      setDateError("Дата возврата не может быть раньше даты поездки"); // ✅ Устанавливаем ошибку
    }
  }

  setIsFormValid(allRequiredFilled && isWeightValid && isDateValid);
}, [formData]);

  // Загрузка данных для селектов
  useEffect(() => {
    const fetchData = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Сеть ответила с ошибкой " + response.status);
        }
        return await response.json();
      } catch (error) {
        console.error("Ошибка:", error);
        return [];
      }
    };

    const loadData = async () => {
      try {
        const [group1, group2] = await Promise.all([
          fetchData(
            "https://1c.mf-group.com/07e10eae-630c-4115-8f43-c7e4ceb01d10/modific_events.json"
          ),
          fetchData(
            "https://1c.mf-group.com/07e10eae-630c-4115-8f43-c7e4ceb01d10/energo_events.json"
          ),
        ]);

        setDataGroup1(group1);
        setDataGroup2(group2);

        if (group1.length > 0) {
          setFormData((prev) => ({
            ...prev,
            customer: group1[0].name || group1[0],
          }));
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Обновляем селект при смене организации
  useEffect(() => {
    const data = formData.organization === "МодифиК" ? dataGroup1 : dataGroup2;
    if (data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        customer: data[0].name || data[0],
      }));
    }
  }, [formData.organization, dataGroup1, dataGroup2]);

  // Устанавливаем минимальную дату и время (сегодня)
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    setFormData((prev) => ({
      ...prev,
      date: prev.date || minDateTime,
      dateFrom: prev.dateFrom || minDateTime, // Устанавливаем обе даты
    }));
  }, []);

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

    // Для даты поездки автоматически обновляем дату возврата если она меньше
    if (
      name === "date" &&
      formData.dateFrom &&
      new Date(value) > new Date(formData.dateFrom)
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        dateFrom: value, // Автоматически выравниваем дату возврата
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOrganizationChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      organization: value,
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

      const response = await fetch(
        "http://localhost:5000/api/order/create-order",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organization: formData.organization,
            customer: formData.customer,
            date: formData.date,
            dateFrom: formData.dateFrom,
            region: formData.region,
            address1: formData.address1,
            address2: formData.address2,
            goods: formData.goods,
            weight: formData.weight,
            comment: formData.comment,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        // Показываем реальный текст из ответа сервера
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

        // Очищаем форму
        setFormData({
          organization: "МодифиК",
          customer:
            dataGroup1.length > 0 ? dataGroup1[0].name || dataGroup1[0] : "",
          date: formData.date,
          dateFrom: "",
          region: "",
          address1: "",
          address2: "",
          goods: "Сценическое оборудование",
          weight: "",
          comment: "",
        });
      } else {
        console.error("Детали ошибки:", responseData);
        alert(
          `Ошибка: ${responseData.message}\nДетали: ${
            responseData.details || "Нет деталей"
          }`
        );
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      alert("Ошибка сети: " + error.message);
    }
  };

  // Получаем данные для текущего селекта
  const getCurrentSelectData = () => {
    return formData.organization === "МодифиК" ? dataGroup1 : dataGroup2;
  };

  if (!currentUser) {
    return <div>Загрузка...</div>;
  }

  if (loading) {
    return <div className={styles.container}>Загрузка данных...</div>;
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
            <p className={styles.redirectText}>
              Переход на главную через 3 секунды...
            </p>
          </div>
        </div>
      )}

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2>Заказ автомобиля</h2>
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
              name="organization"
              id="option1"
              value="МодифиК"
              checked={formData.organization === "МодифиК"}
              onChange={() => handleOrganizationChange("МодифиК")}
              className={styles.toggleInput}
            />
            <label
              className={`${styles.toggleLabel} ${
                formData.organization === "МодифиК" ? styles.active : ""
              }`}
              htmlFor="option1"
            >
              МодифиК
            </label>

            <input
              type="radio"
              name="organization"
              id="option2"
              value="МФ-Энерго"
              checked={formData.organization === "МФ-Энерго"}
              onChange={() => handleOrganizationChange("МФ-Энерго")}
              className={styles.toggleInput}
            />
            <label
              className={`${styles.toggleLabel} ${
                formData.organization === "МФ-Энерго" ? styles.active : ""
              }`}
              htmlFor="option2"
            >
              МФ Энерго
            </label>
          </div>

          {/* Поле заказчика */}
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="customer">
              Заказчик: *
            </label>
            <select
              id="customer"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              className={`${styles.input} ${styles.selectField}`}
              required
            >
              {getCurrentSelectData().map((item, index) => (
                <option key={index} value={item.name || item}>
                  {item.name || item}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputField}>
  <label className={styles.label} htmlFor="date">
    Дата и время поездки: *
  </label>
  <input
    type="datetime-local"
    id="date"
    name="date"
    value={formData.date}
    onChange={handleChange}
    className={styles.input}
    required
    min={new Date().toISOString().slice(0, 16)} // Минимум - сегодня
  />
</div>

          <div className={styles.inputField}>
  <label className={styles.label} htmlFor="dateFrom">
    Дата и время возврата: *
  </label>
  <input
    type="datetime-local"
    id="dateFrom"
    name="dateFrom"
    value={formData.dateFrom}
    onChange={handleChange}
    className={styles.input}
    required
    min={formData.date || new Date().toISOString().slice(0, 16)} // Минимум - дата поездки или сегодня
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

          {/* Поля ввода */}
          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="region">
              Регион: *
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="address1">
              Адрес назначения: *
            </label>
            <input
              type="text"
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="address2">
              Второй адрес назначения (если нужен):
            </label>
            <input
              type="text"
              id="address2"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="goods">
              Вид оборудования:
            </label>
            <select
              id="goods"
              name="goods"
              value={formData.goods}
              onChange={handleChange}
              className={`${styles.input} ${styles.selectField}`}
            >
              <option value="Сценическое оборудование">
                Сценическое оборудование
              </option>
              <option value="Электротехническое оборудование">
                Электротехническое оборудование
              </option>
              <option value="Хозяйственные товары">Хозяйственные товары</option>
              <option value="Металопрокат">Металопрокат</option>
              <option value="ЖБИ">ЖБИ</option>
            </select>
          </div>

          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="weight">
              Вес в килограммах: *
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={styles.input}
              required
              min="1"
              style={{
                borderColor:
                  formData.weight &&
                  (isNaN(formData.weight) || Number(formData.weight) <= 0)
                    ? "#dc3545"
                    : "",
              }}
            />
            {formData.weight &&
              (isNaN(formData.weight) || Number(formData.weight) <= 0) && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "0.8rem",
                    marginTop: "5px",
                  }}
                >
                  Введите корректный вес (больше 0)
                </div>
              )}
          </div>

          <div className={styles.inputField}>
            <label className={styles.label} htmlFor="comment">
              Комментарий к заявке:
            </label>
            <input
              type="text"
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            className={styles.sendButton}
            disabled={!isFormValid}
          >
            Заказать машину
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
