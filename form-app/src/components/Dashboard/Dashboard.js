import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { currentUser } = useAuth();

  const openSite1 = () => {
    window.open('https://mf-group.com', '_blank', 'noopener,noreferrer');
  };

  const openSite2 = () => {
    window.open('https://mf-energo.ru', '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.welcome}>
        Добро пожаловать, {currentUser?.name || currentUser?.username}!
      </h2>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={openSite1}>
          MF-Group
        </button>
        <button className={styles.button} onClick={openSite2}>
          MF-Energo
        </button>
      </div>
    </div>
  );
}

export default Dashboard;