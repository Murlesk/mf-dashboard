import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EventDetails.module.css';

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [photosData, setPhotosData] = useState({});
  const [modalPhoto, setModalPhoto] = useState(null);

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

  // Функция для загрузки фото
  const loadPhoto = React.useCallback(async (photoId) => {
    if (photosData[photoId]) return photosData[photoId];
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Токен не найден');
      return null;
    }
    
    try {
      const response = await fetch(
        `https://1c.mf-group.com/b24adapter/hs/inc_query/get_file/${token}/${photoId}`
      );
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      const base64Data = await response.text();
      const fullBase64 = `data:image/jpeg;base64,${base64Data}`;
      
      setPhotosData(prev => ({ ...prev, [photoId]: fullBase64 }));
      
      return fullBase64;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      return null;
    }
  }, [photosData]);

  // Загрузка фото при выборе машины
  useEffect(() => {
    if (selectedCar?.photos) {
      selectedCar.photos.forEach(photo => {
        loadPhoto(photo.id);
      });
    }
  }, [selectedCar, loadPhoto]);

  // Закрытие модалки по ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'loading': return 'Погрузка';
      case 'checking': return 'Проверка отгрузки';
      case 'sent': return 'Уехала';
      default: return status || 'Неизвестно';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'loading': return styles.statusLoading;
      case 'checking': return styles.statusChecking;
      case 'sent': return styles.statusSent;
      default: return styles.statusDefault;
    }
  };

  const openPdf = (pdfName) => {
    window.open(`/pdfs/${pdfName}`, '_blank');
  };

  const downloadPdf = (pdfName) => {
    const link = document.createElement('a');
    link.href = `/pdfs/${pdfName}`;
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
        <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
          ← Назад в кабинет
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.eventInfoCard}>
            <h3 className={styles.eventName}>{event.name}</h3>
            
            {event.debt > 0 && (
              <div className={styles.debtBadge}>
                Задолженность: <strong>
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

          {selectedCar?.photos?.length > 0 && (
            <div className={styles.carPhotos}>
              <h4>Фотографии:</h4>
              <div className={styles.photosGrid}>
                {selectedCar.photos.map((photo, index) => (
                  <div key={index} className={styles.photoWrapper}>
                    {photosData[photo.id] ? (
                      <div className={styles.photoThumbnail} onClick={() => setModalPhoto(photosData[photo.id])}>
                        <img 
                          src={photosData[photo.id]}
                          alt={`Фото машины ${index + 1}`}
                          className={styles.carPhoto}
                        />
                      </div>
                    ) : (
                      <div className={styles.photoLoading}>Загрузка...</div>
                    )}
                    <div className={styles.photoName}>{photo.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.carsContainer}>
            <h3>Машины ({event.cars?.length || 0})</h3>
            
            {event.cars?.length > 0 ? (
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

      <div className={styles.pdfSection}>
        <h3>Чертежи PDF</h3>
        
        <div className={styles.pdfList}>
          <div className={styles.pdfItem}>
            <div className={styles.pdfInfo}>
              <span className={styles.pdfName}>Чертёж 1</span>
              <span className={styles.pdfSize}>1.2 MB</span>
            </div>
            <div className={styles.pdfActions}>
              <button onClick={() => openPdf('1.pdf')} className={styles.pdfButton}>
                👁️ Открыть
              </button>
              <button onClick={() => downloadPdf('1.pdf')} className={styles.pdfButton}>
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
              <button onClick={() => openPdf('2.pdf')} className={styles.pdfButton}>
                👁️ Открыть
              </button>
              <button onClick={() => downloadPdf('2.pdf')} className={styles.pdfButton}>
                📥 Скачать
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.pdfPreview}>
          <h4>Предпросмотр чертежа:</h4>
          <iframe 
            src="/pdfs/1.pdf" 
            className={styles.pdfViewer}
            title="Предпросмотр чертежа 1"
          />
        </div>
      </div>

      {modalPhoto && (
        <div className={styles.photoModalOverlay} onClick={() => setModalPhoto(null)}>
          <div className={styles.photoModalContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={modalPhoto}
              alt="Увеличенное фото"
              className={styles.modalPhoto}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetails;