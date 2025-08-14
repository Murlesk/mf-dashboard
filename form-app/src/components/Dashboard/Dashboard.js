import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import UserData from '../UserData/UserData';
import EventsList from '../EventsList/EventsList';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { currentUser } = useAuth();
  const { hasPermission, loading } = usePermissions();
  const navigate = useNavigate();

  const openSite1 = () => {
    navigate('/lead-form');
  };

  const openSite2 = () => {
    navigate('/order-form');
  };
  
  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.welcome}>
        Добро пожаловать, {currentUser?.name || currentUser?.username}!
      </h2>
      
      <div className={styles.buttons}>
                {hasPermission('access_lead_form') && (
          <button className={styles.button} onClick={openSite1}>
            Создать лид
          </button>
        )}
        
        {hasPermission('access_order_form') && (
          <button className={styles.button} onClick={openSite2}>
            Заказать машину
          </button>
        )}
      </div>
      
      <UserData />
      <EventsList />
    </div>
  );
}

export default Dashboard;