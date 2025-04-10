import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Trans } from '../utils/translationUtils';
import '../styles/Notifications.css';

const Notifications = () => {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simula il caricamento delle notifiche
      setLoading(true);
      const mockNotifications = [
        {
          id: '1',
          type: 'reminder',
          title: 'Promemoria Farmaco',
          message: 'È ora di prendere Paracetamolo - 500mg',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minuti fa
          read: false
        },
        {
          id: '2',
          type: 'appointment',
          title: 'Appuntamento Domani',
          message: 'Visita cardiologica alle 10:30 presso Clinica Salute',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 ore fa
          read: true
        },
        {
          id: '3',
          type: 'system',
          title: 'Nuovo Aggiornamento',
          message: 'L\'app è stata aggiornata alla versione 1.3.0 con nuove funzionalità',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 giorno fa
          read: false
        }
      ];
      
      setTimeout(() => {
        setNotifications(mockNotifications);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
        return '⏰';
      case 'appointment':
        return '📅';
      case 'system':
        return '🔔';
      default:
        return '📌';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min fa`;
    } else if (diffHours < 24) {
      return `${diffHours} ore fa`;
    } else {
      return `${diffDays} giorni fa`;
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h2><Trans i18nKey="notifications.title" fallback="Notifiche" /></h2>
        </div>
        <div className="notifications-loading">
          <div className="loading-spinner"></div>
          <p><Trans i18nKey="notifications.loading" fallback="Caricamento notifiche..." /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2><Trans i18nKey="notifications.title" fallback="Notifiche" /></h2>
        <div className="notifications-actions">
          {notifications.length > 0 && (
            <button 
              className="mark-all-button"
              onClick={markAllAsRead}
              title="Segna tutte come lette"
            >
              <Trans i18nKey="notifications.markAllRead" fallback="Segna tutte come lette" />
            </button>
          )}
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p><Trans i18nKey="notifications.empty" fallback="Non hai notifiche" /></p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3 className="notification-title">{notification.title}</h3>
                <p className="notification-message">{notification.message}</p>
                <p className="notification-time">{formatTime(notification.timestamp)}</p>
              </div>
              <button
                className="delete-notification"
                onClick={(e) => { 
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                title="Elimina notifica"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications; 