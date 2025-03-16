import React, { useState, useEffect } from 'react';
import API from './api';

/**
 * Centro Notifiche avanzato per Salus
 * 
 * Mostra notifiche interattive categorizzate con priorità e azioni immediate
 */
function NotificationCenter({ userId, isOpen, onClose, language, darkMode }) {
  const [notifications, setNotifications] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Dizionario traduzioni
  const translations = {
    it: {
      title: 'Notifiche',
      noNotifications: 'Non hai notifiche',
      markAllRead: 'Segna tutte come lette',
      categories: {
        all: 'Tutte',
        urgent: 'Urgenti',
        medication: 'Farmaci',
        appointment: 'Appuntamenti',
        wellness: 'Benessere'
      },
      actions: {
        dismiss: 'Ignora',
        view: 'Visualizza',
        take: 'Prendi',
        reschedule: 'Riprogramma'
      },
      timeLabels: {
        now: 'Adesso',
        minutesAgo: 'minuti fa',
        hoursAgo: 'ore fa',
        yesterday: 'Ieri',
        daysAgo: 'giorni fa'
      }
    },
    en: {
      title: 'Notifications',
      noNotifications: 'You have no notifications',
      markAllRead: 'Mark all as read',
      categories: {
        all: 'All',
        urgent: 'Urgent',
        medication: 'Medications',
        appointment: 'Appointments',
        wellness: 'Wellness'
      },
      actions: {
        dismiss: 'Dismiss',
        view: 'View',
        take: 'Take',
        reschedule: 'Reschedule'
      },
      timeLabels: {
        now: 'Now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        yesterday: 'Yesterday',
        daysAgo: 'days ago'
      }
    },
    es: {
      title: 'Notificaciones',
      noNotifications: 'No tienes notificaciones',
      markAllRead: 'Marcar todas como leídas',
      categories: {
        all: 'Todas',
        urgent: 'Urgentes',
        medication: 'Medicamentos',
        appointment: 'Citas',
        wellness: 'Bienestar'
      },
      actions: {
        dismiss: 'Ignorar',
        view: 'Ver',
        take: 'Tomar',
        reschedule: 'Reprogramar'
      },
      timeLabels: {
        now: 'Ahora',
        minutesAgo: 'minutos atrás',
        hoursAgo: 'horas atrás',
        yesterday: 'Ayer',
        daysAgo: 'días atrás'
      }
    }
  };

  // Funzione per ottenere le traduzioni nella lingua selezionata
  const t = (key, category = null) => {
    if (category) {
      return translations[language]?.[category]?.[key] || 
             translations['it'][category][key] || 
             key;
    }
    return translations[language]?.[key] || 
           translations['it'][key] || 
           key;
  };

  // Simula il recupero delle notifiche dal backend
  useEffect(() => {
    if (!userId || !isOpen) return;
    
    setIsLoading(true);
    
    // In una vera implementazione, questa sarebbe una chiamata API
    const fetchNotifications = async () => {
      try {
        // Simuliamo un ritardo di rete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In un'app reale, questo sarebbe API.get(`/notifications/${userId}`)
        const mockNotifications = generateMockNotifications();
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Errore nel recupero delle notifiche:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [userId, isOpen]);
  
  // Funzione per generare notifiche di esempio
  const generateMockNotifications = () => {
    const now = new Date();
    
    return [
      {
        id: '1',
        title: 'È ora di prendere Aspirina',
        description: '100mg - Con acqua',
        category: 'medication',
        priority: 'high',
        unread: true,
        timestamp: new Date(now.getTime() - 5 * 60000), // 5 minuti fa
        icon: 'pill',
        color: 'var(--primary-600)',
        actions: [
          { type: 'take', label: t('take', 'actions') },
          { type: 'skip', label: 'Salta' }
        ],
        data: {
          medicationId: 'med123',
          dose: '100mg'
        }
      },
      {
        id: '2',
        title: 'Promemoria visita medica',
        description: 'Domani alle 14:30 - Dr. Rossi',
        category: 'appointment',
        priority: 'medium',
        unread: true,
        timestamp: new Date(now.getTime() - 2 * 3600000), // 2 ore fa
        icon: 'calendar-check',
        color: 'var(--info)',
        actions: [
          { type: 'view', label: t('view', 'actions') },
          { type: 'reschedule', label: t('reschedule', 'actions') }
        ],
        data: {
          appointmentId: 'app456',
          doctor: 'Dr. Rossi',
          location: 'Via Roma 123'
        }
      },
      {
        id: '3',
        title: 'Mal di testa persistente',
        description: 'Questo sintomo è stato registrato per 3 giorni consecutivi',
        category: 'urgent',
        priority: 'high',
        unread: true,
        timestamp: new Date(now.getTime() - 86400000), // 1 giorno fa
        icon: 'exclamation-triangle',
        color: 'var(--danger)',
        actions: [
          { type: 'view', label: t('view', 'actions') }
        ],
        data: {
          symptomId: 'sym789',
          duration: '3 giorni'
        }
      },
      {
        id: '4',
        title: 'Obiettivo attività fisica raggiunto',
        description: 'Hai completato 30 minuti di attività fisica oggi',
        category: 'wellness',
        priority: 'low',
        unread: false,
        timestamp: new Date(now.getTime() - 12 * 3600000), // 12 ore fa
        icon: 'trophy',
        color: 'var(--success)',
        actions: [
          { type: 'view', label: t('view', 'actions') },
          { type: 'dismiss', label: t('dismiss', 'actions') }
        ],
        data: {
          goalId: 'goal123',
          achievement: '30 minuti di attività'
        }
      },
      {
        id: '5',
        title: 'Pressione sanguigna alta',
        description: 'La tua pressione sistolica è sopra 140 mmHg',
        category: 'urgent',
        priority: 'high',
        unread: false,
        timestamp: new Date(now.getTime() - 3 * 86400000), // 3 giorni fa
        icon: 'heartbeat',
        color: 'var(--danger)',
        actions: [
          { type: 'view', label: t('view', 'actions') }
        ],
        data: {
          readingId: 'bp123',
          systolic: 142,
          diastolic: 88
        }
      }
    ];
  };

  // Funzione per gestire le azioni sulle notifiche
  const handleNotificationAction = (notificationId, actionType, actionData) => {
    console.log(`Azione ${actionType} sulla notifica ${notificationId}`, actionData);
    
    // Esempi di gestione azioni
    switch (actionType) {
      case 'take':
        // Segna il farmaco come preso
        markMedicationAsTaken(notificationId, actionData);
        break;
      case 'view':
        // Naviga alla pagina rilevante
        navigateToDetail(notificationId, actionData);
        break;
      case 'dismiss':
        // Rimuovi la notifica
        dismissNotification(notificationId);
        break;
      case 'skip':
        // Salta dose farmaco
        skipMedication(notificationId, actionData);
        break;
      case 'reschedule':
        // Apri interfaccia riprogrammazione
        openRescheduleModal(notificationId, actionData);
        break;
      default:
        break;
    }
  };
  
  // Funzioni simulate per la gestione delle azioni
  const markMedicationAsTaken = (id, data) => {
    // Qui chiamata API a /medications/taken
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  const navigateToDetail = (id, data) => {
    // Qui logica di navigazione
    const notification = notifications.find(n => n.id === id);
    
    if (notification.category === 'medication') {
      // In un'app vera qui utilizzeremmo la navigazione React Router
      console.log(`Naviga a /medications/${data.medicationId}`);
    } else if (notification.category === 'urgent') {
      console.log(`Naviga a /symptoms/${data.symptomId}`);
    }
    
    // Segna come letta
    markAsRead(id);
  };
  
  const dismissNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  const skipMedication = (id, data) => {
    // Qui chiamata API a /medications/skip
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  const openRescheduleModal = (id, data) => {
    // Qui apriremmo un modal per la riprogrammazione
    console.log(`Apri modal riprogrammazione per ${id}`);
    // Per ora segniamo solo come letta
    markAsRead(id);
  };
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false } 
          : notification
      )
    );
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };
  
  // Filtra notifiche per categoria
  const filteredNotifications = activeCategory === 'all'
    ? notifications
    : notifications.filter(notification => notification.category === activeCategory);
  
  // Ordina notifiche per priorità e poi per data (più recenti prima)
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    // Prima per priorità (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Poi per data (più recenti prima)
    return b.timestamp - a.timestamp;
  });
  
  // Formatta il timestamp in modo relativo e leggibile
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMin < 1) return t('now', 'timeLabels');
    if (diffMin < 60) return `${diffMin} ${t('minutesAgo', 'timeLabels')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo', 'timeLabels')}`;
    if (diffDays === 1) return t('yesterday', 'timeLabels');
    if (diffDays < 7) return `${diffDays} ${t('daysAgo', 'timeLabels')}`;
    
    // Se più vecchio di 7 giorni, mostra la data
    return timestamp.toLocaleDateString();
  };

  // Se il centro notifiche non è aperto, non renderizziamo nulla
  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-panel" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h2 className="notification-title">{t('title')}</h2>
          <button className="notification-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Categorie di notifiche */}
        <div className="notification-categories">
          <button 
            className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <i className="fas fa-bell"></i> {t('all', 'categories')}
          </button>
          <button 
            className={`category-chip ${activeCategory === 'urgent' ? 'active' : ''}`}
            onClick={() => setActiveCategory('urgent')}
          >
            <i className="fas fa-exclamation-triangle"></i> {t('urgent', 'categories')}
            {notifications.filter(n => n.category === 'urgent' && n.unread).length > 0 && (
              <span className="category-badge">
                {notifications.filter(n => n.category === 'urgent' && n.unread).length}
              </span>
            )}
          </button>
          <button 
            className={`category-chip ${activeCategory === 'medication' ? 'active' : ''}`}
            onClick={() => setActiveCategory('medication')}
          >
            <i className="fas fa-pills"></i> {t('medication', 'categories')}
            {notifications.filter(n => n.category === 'medication' && n.unread).length > 0 && (
              <span className="category-badge">
                {notifications.filter(n => n.category === 'medication' && n.unread).length}
              </span>
            )}
          </button>
          <button 
            className={`category-chip ${activeCategory === 'appointment' ? 'active' : ''}`}
            onClick={() => setActiveCategory('appointment')}
          >
            <i className="fas fa-calendar-alt"></i> {t('appointment', 'categories')}
            {notifications.filter(n => n.category === 'appointment' && n.unread).length > 0 && (
              <span className="category-badge">
                {notifications.filter(n => n.category === 'appointment' && n.unread).length}
              </span>
            )}
          </button>
          <button 
            className={`category-chip ${activeCategory === 'wellness' ? 'active' : ''}`}
            onClick={() => setActiveCategory('wellness')}
          >
            <i className="fas fa-spa"></i> {t('wellness', 'categories')}
            {notifications.filter(n => n.category === 'wellness' && n.unread).length > 0 && (
              <span className="category-badge">
                {notifications.filter(n => n.category === 'wellness' && n.unread).length}
              </span>
            )}
          </button>
        </div>
        
        {/* Lista notifiche */}
        <div className="notification-list">
          {isLoading ? (
            <div className="notification-loading">
              <div className="notification-spinner"></div>
              <p>Caricamento notifiche...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="notification-empty">
              <i className="fas fa-bell-slash"></i>
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            <>
              {/* Pulsante Segna tutte come lette */}
              {sortedNotifications.some(n => n.unread) && (
                <div className="notification-actions">
                  <button className="btn-text" onClick={markAllAsRead}>
                    <i className="fas fa-check-double"></i> {t('markAllRead')}
                  </button>
                </div>
              )}
              
              {/* Elenco notifiche */}
              {sortedNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {/* Indicatore priorità */}
                  <div className={`priority-indicator priority-${notification.priority}`}></div>
                  
                  {/* Icona notifica */}
                  <div className="notification-icon" style={{ backgroundColor: notification.color }}>
                    <i className={`fas fa-${notification.icon}`}></i>
                  </div>
                  
                  {/* Contenuto notifica */}
                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h3 className="notification-item-title">{notification.title}</h3>
                      <span className="notification-time">
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="notification-description">{notification.description}</p>
                    
                    {/* Pulsanti azione */}
                    <div className="notification-actions">
                      {notification.actions.map((action, index) => (
                        <button 
                          key={index}
                          className={`btn-action btn-action-${action.type}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notification.id, action.type, notification.data);
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCenter; 