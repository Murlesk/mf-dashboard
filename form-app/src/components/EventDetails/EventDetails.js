import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './EventDetails.module.css';

function EventDetails() {
  const { eventId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);

  // Получаем мероприятие из localStorage
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      const eventsData = localStorage.getItem('eventsData');
      
      if (!eventsData) {
        throw new Error('Данные мероприятий не найдены. Вернитесь к списку мероприятий.');
      }
      
      const parsedData = JSON.parse(eventsData);
      console.log('=== Загруженные данные мероприятий ===');
      console.log('Все мероприятия:', parsedData);
      
      // Ищем мероприятие по ID
      let foundEvent = null;
      
      if (parsedData.past) {
        foundEvent = parsedData.past.find(e => e.id === eventId);
      }
      
      if (!foundEvent && parsedData.current) {
        foundEvent = parsedData.current.find(e => e.id === eventId);
      }
      
      if (!foundEvent && parsedData.future) {
        foundEvent = parsedData.future.find(e => e.id === eventId);
      }
      
      if (!foundEvent && parsedData.events) {
        foundEvent = parsedData.events.find(e => e.id === eventId);
      }
      
      if (foundEvent) {
        setEvent(foundEvent);
        
        // Автоматически выбираем первую машину если есть
        if (foundEvent.cars && foundEvent.cars.length > 0) {
          setSelectedCar(foundEvent.cars[0]);
        }
      } else {
        throw new Error(`Мероприятие с ID ${eventId} не найдено`);
      }
      
    } catch (err) {
      console.error('Ошибка при загрузке мероприятия:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Форматируем дату
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // ✅ Функция получения текста статуса машины
  const getStatusText = (status) => {
    switch (status) {
      case 'loading':
        return 'Погрузка';
      case 'checking':
        return 'Проверка отгрузки';
      case 'sent':
        return 'Уехала';
      default:
        return status || 'Неизвестно';
    }
  };

  // ✅ Функция получения класса статуса машины
  const getStatusClass = (status) => {
    switch (status) {
      case 'loading':
        return styles.statusLoading;
      case 'checking':
        return styles.statusChecking;
      case 'sent':
        return styles.statusSent;
      default:
        return styles.statusDefault;
    }
  };

  // ✅ Функция открытия PDF в новой вкладке
  const openPdf = (pdfName) => {
    // ✅ Жёстко прописанные пути к PDF
    const pdfUrl = `/pdfs/${pdfName}`;
    
    // Открываем в новой вкладке
    window.open(pdfUrl, '_blank');
  };

  // ✅ Функция скачивания PDF
  const downloadPdf = (pdfName) => {
    const pdfUrl = `/pdfs/${pdfName}`;
    
    // Создаём ссылку для скачивания
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className={styles.loading}>Загрузка мероприятия...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;
  if (!event) return <div className={styles.noData}>Мероприятие не найдено</div>;

  return (
    <div className={styles.eventDetailsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Детали мероприятия</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          ← Назад в кабинет
        </button>
      </div>

      <div className={styles.content}>
        {/* Левая панель - информация о мероприятии */}
        <div className={styles.leftPanel}>
          <div className={styles.eventInfoCard}>
            <h3 className={styles.eventName}>{event.name}</h3>
            
            {/* Показываем задолженность красным если есть */}
            {event.debt !== undefined &&
                                event.debt !== null &&
                                event.debt > 0 && (
                                  <div className={styles.debtBadge}>
                                    Задолженность:{" "}
                                    <strong>
                                      {parseFloat(event.debt).toLocaleString("ru-RU", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </strong>
                                  </div>
                                )}
            

            <div className={styles.eventDetails}>
              <p><strong>Номер мероприятия:</strong> {event.id || eventId}</p>
              <p><strong>Дата начала:</strong> {formatDate(event.dateBegin)}</p>
              <p><strong>Дата окончания:</strong> {formatDate(event.dateEnd)}</p>
              <p><strong>Место:</strong> {event.location}</p>
            </div>
          </div>

          {/* Информация о выбранной машине */}
          {selectedCar && (
            <div className={styles.carDetailsCard}>
              <div className={styles.carInfo}>
                {/* Фотографии машины */}
                {selectedCar.photos && selectedCar.photos.length > 0 && (
                  <div className={styles.carPhotos}>
                    <h4>Фотографии:</h4>
                    <div className={styles.photosGrid}>
                      {selectedCar.photos.map((photo, index) => (
                        <img 
                          key={index}
                          src={`data:image/jpeg;base64,${photo}`} 
                          alt={`Фото машины ${index + 1}`}
                          className={styles.carPhoto}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Правая панель - список машин */}
        <div className={styles.rightPanel}>
          <div className={styles.carsContainer}>
            <h3>Машины ({event.cars?.length || 0})</h3>
            
            {event.cars && event.cars.length > 0 ? (
              <div className={styles.carsList}>
                {event.cars.map((car, index) => (
                  <div 
                    key={index}
                    className={`${styles.carItem} ${selectedCar?.number === car.number ? styles.selected : ''}`}
                    onClick={() => setSelectedCar(car)}
                  >
                    <div className={styles.carHeader}>
                      <h4 className={styles.carName}>{car.car}</h4>
                      <span className={styles.carPlate}>Отгрузка №{car.number}</span>
                    </div>
                    <p className={styles.carWeight}><strong>Вес:</strong> {car.weight}</p>
                    <p className={`${styles.carStatus} ${getStatusClass(car.status)}`}>
                      <strong>Статус:</strong> {getStatusText(car.status)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noCars}>
                <p>Нет доступных машин для этого мероприятия</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Блок с чертежами PDF - ЖЁСТКО ПРОПИСАННЫЕ ФАЙЛЫ */}
      <div className={styles.pdfSection}>
        <h3>Чертежи PDF</h3>
        
        <div className={styles.pdfList}>
          {/* ✅ Жёстко прописанные PDF файлы для всех мероприятий */}
          <div className={styles.pdfItem}>
            <div className={styles.pdfInfo}>
              <span className={styles.pdfName}>Чертёж 1</span>
              <span className={styles.pdfSize}>1.2 MB</span>
            </div>
            
            <div className={styles.pdfActions}>
              <button 
                onClick={() => openPdf('1.pdf')}
                className={styles.pdfButton}
              >
                👁️ Открыть
              </button>
              
              <button 
                onClick={() => downloadPdf('1.pdf')}
                className={styles.pdfButton}
              >
                📥 Скачать
              </button>
            </div>
          </div>
          
          <div className={styles.pdfItem}>
            <div className={styles.pdfInfo}>
              <span className={styles.pdfName}>Чертёж 2</span>
              <span className={styles.pdfSize}>2.5 MB</span>
            </div>
            
            <div className={styles.pdfActions}>
              <button 
                onClick={() => openPdf('2.pdf')}
                className={styles.pdfButton}
              >
                👁️ Открыть
              </button>
              
              <button 
                onClick={() => downloadPdf('2.pdf')}
                className={styles.pdfButton}
              >
                📥 Скачать
              </button>
            </div>
          </div>
        </div>
        
        {/* ✅ Предпросмотр первого PDF */}
        <div className={styles.pdfPreview}>
          <h4>Предпросмотр чертежа:</h4>
          <iframe 
            src="/pdfs/1.pdf" 
            className={styles.pdfViewer}
            title="Предпросмотр чертежа 1"
          />
        </div>
      </div>
    </div>
  );
}

export default EventDetails;