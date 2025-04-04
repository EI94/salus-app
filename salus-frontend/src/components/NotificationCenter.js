import React, { useState, useEffect } from 'react';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  
  // Aggiungo le traduzioni necessarie
  const translations = {
    it: {
      categories: {
        all: 'Tutte',
        urgent: 'Urgenti',
        medication: 'Farmaci',
        appointment: 'Appuntamenti',
        wellness: 'Benessere'
      }
    },
    en: {
      categories: {
        all: 'All',
        urgent: 'Urgent',
        medication: 'Medications',
        appointment: 'Appointments',
        wellness: 'Wellness'
      }
    }
  };
  
  useEffect(() => {
    // Crea un gestore per l'evento personalizzato di notifica
    const handleCustomNotification = (event) => {
      addNotification(event.detail);
    };
    
    // Registra l'event listener
    window.addEventListener('salus:notification', handleCustomNotification);
    
    // Registra listener per gli errori API
    window.addEventListener('salus:api:error', (event) => {
      const { status, message } = event.detail;
      addNotification({
        type: 'error',
        title: `Errore ${status || ''}`,
        message: message || 'Si è verificato un errore imprevisto',
        duration: 5000
      });
    });
    
    // Registra listener per il logout
    window.addEventListener('salus:auth:logout', (event) => {
      const { reason } = event.detail;
      if (reason === 'token_expired') {
        addNotification({
          type: 'warning',
          title: 'Sessione scaduta',
          message: 'La tua sessione è scaduta. Effettua nuovamente il login.',
          duration: 8000
        });
      }
    });
    
    // Cleanup
    return () => {
      window.removeEventListener('salus:notification', handleCustomNotification);
      window.removeEventListener('salus:api:error', handleCustomNotification);
      window.removeEventListener('salus:auth:logout', handleCustomNotification);
    };
  }, []);
  
  // Funzione per aggiungere una nuova notifica
  const addNotification = (notification) => {
    // Genera un ID unico per la notifica
    const id = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Determina la durata della notifica (default: 4000ms)
    const duration = notification.duration || 4000;
    
    // Aggiungi la notifica all'array
    setNotifications(prevNotifications => [
      ...prevNotifications,
      { ...notification, id, duration }
    ]);
    
    // Rimuovi la notifica dopo la durata specificata
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };
  
  // Funzione per rimuovere una notifica specifica
  const removeNotification = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id 
          ? { ...notification, isExiting: true } 
          : notification
      )
    );
    
    // Rimuovi effettivamente la notifica dopo l'animazione
    setTimeout(() => {
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    }, 300); // Durata dell'animazione di uscita
  };
  
  // Caricamento e aggiornamento notifiche con effetto
  useEffect(() => {
    // Simula il caricamento delle notifiche
    const mockNotifications = [
      // ... existing code ...
    ];
    
    setIsLoading(false);
    setNotifications(mockNotifications);
    
    // Simula una nuova notifica dopo 5 secondi
    const timer = setTimeout(() => {
      addNotification({
        id: 'new-notification',
        title: translations[language].categories.urgent,
        message: 'Questa è una notifica di test generata automaticamente',
        category: 'urgent',
        time: new Date(),
        read: false,
        important: true
      });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [language, addNotification]); // Aggiungo addNotification come dipendenza
  
  // Ritorna null se non ci sono notifiche
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type || 'info'} ${notification.isExiting ? 'exiting' : ''}`}
        >
          <div className="notification-icon">
            {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
            {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
            {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
            {!notification.type && <i className="fas fa-bell"></i>}
          </div>
          
          <div className="notification-content">
            {notification.title && (
              <div className="notification-title">{notification.title}</div>
            )}
            <div className="notification-message">{notification.message}</div>
          </div>
          
          <button 
            className="notification-close" 
            onClick={() => removeNotification(notification.id)}
            aria-label="Chiudi notifica"
          >
            <i className="fas fa-times"></i>
          </button>
          
          <div 
            className="notification-progress" 
            style={{ animationDuration: `${notification.duration}ms` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter; 