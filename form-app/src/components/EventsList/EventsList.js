import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./EventsList.module.css";

function EventsList() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState({
    past: [],
    current: [],
    future: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    past: false,
    current: true,
    future: true,
  });

  // ✅ Добавляем состояние поиска
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyDebt, setShowOnlyDebt] = useState(false);

  // Получаем мероприятия
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Токен не найден");
        }

        const response = await fetch("http://localhost:5000/api/events/list", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setEvents(
            data.grouped || {
              past:
                data.events?.filter((event) => event.relevance === "past") ||
                [],
              current:
                data.events?.filter((event) => event.relevance === "current") ||
                [],
              future:
                data.events?.filter((event) => event.relevance === "future") ||
                [],
            }
          );
        } else {
          throw new Error(data.message || "Ошибка загрузки мероприятий");
        }
      } catch (err) {
        console.error("Ошибка при загрузке мероприятий:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ✅ Фильтруем мероприятия
  const filteredEvents = {
    past: events.past.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDebt =
        !showOnlyDebt || (event.debt && parseFloat(event.debt) > 0);

      return matchesSearch && matchesDebt;
    }),
    current: events.current.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDebt =
        !showOnlyDebt || (event.debt && parseFloat(event.debt) > 0);

      return matchesSearch && matchesDebt;
    }),
    future: events.future.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDebt =
        !showOnlyDebt || (event.debt && parseFloat(event.debt) > 0);

      return matchesSearch && matchesDebt;
    }),
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ✅ Функция форматирования даты (только дата, без времени)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU");
  };

  if (loading)
    return <div className={styles.loading}>Загрузка мероприятий...</div>;
  if (error) return <div className={styles.error}>Ошибка: {error}</div>;

  return (
    <div className={styles.eventsContainer}>
      <h3 className={styles.title}>Мероприятия</h3>

      {/* ✅ Панель поиска */}
      <div className={styles.searchPanel}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Поиск.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={styles.clearSearch}
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowOnlyDebt(!showOnlyDebt)}
          className={`${styles.debtFilterButton} ${
            showOnlyDebt ? styles.active : ""
          }`}
        >
          {showOnlyDebt ? "Показать все" : "Только с задолженностью"}
        </button>
      </div>

      {/* ✅ Статистика поиска */}
      {(searchTerm || showOnlyDebt) && (
        <div className={styles.searchStats}>
          <strong>Найдено:</strong>
          <span className={styles.statsNumbers}>
            <span className={styles.pastStat}>
              {filteredEvents.past.length} прошлых
            </span>
            <span className={styles.currentStat}>
              {filteredEvents.current.length} текущих
            </span>
            <span className={styles.futureStat}>
              {filteredEvents.future.length} будущих
            </span>
          </span>
        </div>
      )}

      {/* Текущие мероприятия */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection("current")}
        >
          <h4>Текущие мероприятия ({filteredEvents.current.length})</h4>
          <span className={styles.arrow}>
            {expandedSections.current ? "▲" : "▼"}
          </span>
        </div>

        {expandedSections.current && (
          <div className={styles.eventsList}>
            {filteredEvents.current.length > 0 ? (
              filteredEvents.current.map((event, index) => (
                <div key={event.id || index} className={styles.eventCard}>
                  <h5 className={styles.eventName}>{event.name}</h5>

                  {/* ✅ Показываем задолженность красным если есть */}
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

                  <p>
                    <strong>Дата начала:</strong> {formatDate(event.dateBegin)}
                  </p>
                  <p>
                    <strong>Дата окончания:</strong> {formatDate(event.dateEnd)}
                  </p>
                  <p>
                    <strong>Место:</strong> {event.location}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.noEvents}>
                {showOnlyDebt
                  ? "Нет текущих мероприятий с задолженностью"
                  : "Нет текущих мероприятий"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Будущие мероприятия */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection("future")}
        >
          <h4>Будущие мероприятия ({filteredEvents.future.length})</h4>
          <span className={styles.arrow}>
            {expandedSections.future ? "▲" : "▼"}
          </span>
        </div>

        {expandedSections.future && (
          <div className={styles.eventsList}>
            {filteredEvents.future.length > 0 ? (
              filteredEvents.future.map((event, index) => (
                <div key={event.id || index} className={styles.eventCard}>
                  <h5 className={styles.eventName}>{event.name}</h5>

                  {/* ✅ Показываем задолженность красным если есть */}
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

                  <p>
                    <strong>Дата начала:</strong> {formatDate(event.dateBegin)}
                  </p>
                  <p>
                    <strong>Дата окончания:</strong> {formatDate(event.dateEnd)}
                  </p>
                  <p>
                    <strong>Место:</strong> {event.location}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.noEvents}>
                {showOnlyDebt
                  ? "Нет будущих мероприятий с задолженностью"
                  : "Нет будущих мероприятий"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Прошлые мероприятия */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection("past")}
        >
          <h4>Прошлые мероприятия ({filteredEvents.past.length})</h4>
          <span className={styles.arrow}>
            {expandedSections.past ? "▲" : "▼"}
          </span>
        </div>

        {expandedSections.past && (
          <div className={styles.eventsList}>
            {filteredEvents.past.length > 0 ? (
              filteredEvents.past.map((event, index) => (
                <div key={event.id || index} className={styles.eventCard}>
                  <h5 className={styles.eventName}>{event.name}</h5>

                  {/* ✅ Показываем задолженность красным если есть */}
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

                  <p>
                    <strong>Дата начала:</strong> {formatDate(event.dateBegin)}
                  </p>
                  <p>
                    <strong>Дата окончания:</strong> {formatDate(event.dateEnd)}
                  </p>
                  <p>
                    <strong>Место:</strong> {event.location}
                  </p>
                </div>
              ))
            ) : (
              <p className={styles.noEvents}>
                {showOnlyDebt
                  ? "Нет прошлых мероприятий с задолженностью"
                  : "Нет прошлых мероприятий"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsList;
