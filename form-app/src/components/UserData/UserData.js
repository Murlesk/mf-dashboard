import React, { useState, useEffect } from 'react';
import styles from './UserData.module.css';

function UserData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Токен не найден');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/dashboard/test-data', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className={styles.loading}>Загрузка данных...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!userData) return <div className={styles.noData}>Нет данных</div>;

  return (
    <div className={styles.userDataContainer}>
      <h3>Информация о пользователе</h3>
      
      {/* ✅ Блок с фото и данными пользователя */}
      <div className={styles.userProfile}>
        {userData.photo && (
          <div className={styles.photoContainer}>
            <img 
              src={`data:image/jpeg;base64,${userData.photo}`} 
              alt="Фото пользователя"
              className={styles.userPhoto}
            />
          </div>
        )}
        
        <div className={styles.userInfo}>
          <p><strong>Имя:</strong> {userData.name}</p>
          <p><strong>Телефон:</strong> {userData.phone}</p>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      </div>

      <div className={styles.rights}>
        <h4>Права доступа:</h4>
        <ul>
          <li><strong>Новый лид:</strong> {userData.rights.newLead ? '✅ Да' : '❌ Нет'}</li>
          <li><strong>Заказ авто:</strong> {userData.rights.orderAuto ? '✅ Да' : '❌ Нет'}</li>
          <li><strong>Диспетчер:</strong> {userData.rights.dispatcher ? '✅ Да' : '❌ Нет'}</li>
          <li><strong>Возврат оборудования:</strong> {userData.rights.returnEquipment ? '✅ Да' : '❌ Нет'}</li>
          <li><strong>Проверка отгрузки:</strong> {userData.rights.checkOfShipment ? '✅ Да' : '❌ Нет'}</li>
          <li><strong>Сборка отгрузки:</strong> {userData.rights.assemblyShipment ? '✅ Да' : '❌ Нет'}</li>
          <li><strong>Водитель:</strong> {userData.rights.driver ? '✅ Да' : '❌ Нет'}</li>
        </ul>
      </div>
    </div>
  );
}

export default UserData;