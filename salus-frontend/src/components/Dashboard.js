import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { UserContext } from '../context/UserContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const userName = userContext?.user?.name || 'Utente';
  
  // Stati per i dati
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [wellness, setWellness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthTip, setHealthTip] = useState('');
  const [weather, setWeather] = useState(null);
  const [showTodayModal, setShowTodayModal] = useState(false);
  
  // Consigli di salute casuali
  const healthTips = [
    "Bere 8 bicchieri d'acqua al giorno migliora il tuo benessere generale e la tua energia.",
    "30 minuti di attività fisica moderata ogni giorno possono ridurre il rischio di malattie croniche.",
    "Una dieta ricca di frutta e verdura aiuta a rafforzare il sistema immunitario.",
    "Meditare per 10 minuti al giorno può ridurre lo stress e migliorare la concentrazione.",
    "Un sonno regolare di 7-8 ore migliora la memoria e le funzioni cognitive.",
    "Piccole pause durante il lavoro possono aumentare la produttività e ridurre l'affaticamento."
  ];

  useEffect(() => {
    // Simuliamo il caricamento dei dati
    setTimeout(() => {
      setLoading(false);
      
      // Seleziona un consiglio di salute casuale
      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
      setHealthTip(randomTip);
      
      // Simula dati meteo
      setWeather({
        temp: Math.floor(Math.random() * 15) + 15, // Temperatura tra 15-30°C
        condition: ['Soleggiato', 'Nuvoloso', 'Pioggia leggera', 'Sereno'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40 // Umidità tra 40-80%
      });
    }, 800);
  }, []);

  // Funzione per navigare direttamente alla schermata di aggiunta
  const navigateToAdd = (path, action) => {
    navigate(path, { state: { showAddForm: true, action } });
  };
  
  // Componente statistiche rapide  
  const QuickStats = () => (
    <div className="quick-stats">
      <div className="stat-item">
        <div className="stat-icon">
          <i className="fas fa-calendar-check"></i>
        </div>
        <div className="stat-data">
          <span className="stat-value">0/3</span>
          <span className="stat-label">Attività completate oggi</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <i className="fas fa-chart-line"></i>
        </div>
        <div className="stat-data">
          <span className="stat-value">+2%</span>
          <span className="stat-label">Benessere rispetto alla settimana scorsa</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <i className="fas fa-bell"></i>
        </div>
        <div className="stat-data">
          <span className="stat-value">2</span>
          <span className="stat-label">Promemoria per oggi</span>
        </div>
      </div>
    </div>
  );
  
  // Componente per la sezione "Il mio giorno"
  const MyDaySection = () => (
    <div className="my-day-section">
      <div className="section-header">
        <h2>Il mio giorno</h2>
        <button className="add-today-button" onClick={() => setShowTodayModal(true)}>
          <i className="fas fa-plus"></i> Aggiorna
        </button>
      </div>
      
      <div className="today-summary">
        <div className="today-date">
          <div className="day-number">{new Date().getDate()}</div>
          <div className="month-year">
            {new Date().toLocaleString('it-IT', { month: 'long' })}
            <span className="year">{new Date().getFullYear()}</span>
          </div>
        </div>
        
        <div className="today-cards">
          <div className="today-card">
            <div className="today-card-icon mood">
              <i className="fas fa-smile"></i>
            </div>
            <div className="today-card-label">Umore</div>
            <div className="today-card-value">Non registrato</div>
          </div>
          
          <div className="today-card">
            <div className="today-card-icon sleep">
              <i className="fas fa-bed"></i>
            </div>
            <div className="today-card-label">Sonno</div>
            <div className="today-card-value">Non registrato</div>
          </div>
          
          <div className="today-card">
            <div className="today-card-icon weather">
              <i className={`fas fa-${weather?.condition === 'Soleggiato' || weather?.condition === 'Sereno' ? 'sun' : weather?.condition === 'Nuvoloso' ? 'cloud' : 'cloud-rain'}`}></i>
            </div>
            <div className="today-card-label">Meteo</div>
            <div className="today-card-value">{weather ? `${weather.temp}°C, ${weather.condition}` : 'Caricamento...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Componente per le azioni rapide
  const QuickActions = () => (
    <div className="quick-actions-section">
      <h2>Azioni rapide</h2>
      <div className="quick-actions">
        <button className="action-button" onClick={() => navigateToAdd('/sintomi', 'add')}>
          <div className="action-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <span className="action-label">Registra sintomo</span>
        </button>
        
        <button className="action-button" onClick={() => navigateToAdd('/farmaci', 'add')}>
          <div className="action-icon">
            <i className="fas fa-pills"></i>
          </div>
          <span className="action-label">Aggiungi farmaco</span>
        </button>
        
        <button className="action-button" onClick={() => navigateToAdd('/benessere', 'add')}>
          <div className="action-icon">
            <i className="fas fa-smile"></i>
          </div>
          <span className="action-label">Aggiorna benessere</span>
        </button>
        
        <button className="action-button" onClick={() => navigate('/assistente')}>
          <div className="action-icon">
            <i className="fas fa-robot"></i>
          </div>
          <span className="action-label">Chiedi all'assistente</span>
        </button>
      </div>
    </div>
  );
  
  // Componente per consigli sulla salute
  const HealthTips = () => (
    <div className="health-tips-section">
      <h2>Suggerimento del giorno</h2>
      <div className="tip-card">
        <div className="tip-icon">
          <i className="fas fa-lightbulb"></i>
        </div>
        <div className="tip-content">
          <p>{healthTip}</p>
        </div>
      </div>
    </div>
  );
  
  // Componente card per le sezioni principali
  const TrackingCard = ({ icon, title, description, buttonText, to, emptyState = true, data = [] }) => (
    <div className={`tracking-card ${emptyState ? 'empty' : ''}`}>
      <div className="card-header">
        <div className="card-icon">
          <i className={`fas ${icon}`}></i>
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      
      <div className="card-content">
        {emptyState ? (
          <p className="empty-state-description">{description}</p>
        ) : (
          <div className="card-data">
            {/* Qui verrebbero mostrati i dati se ce ne fossero */}
            <p>Hai {data.length} elementi registrati</p>
          </div>
        )}
      </div>
      
      <div className="card-actions">
        <Link to={to} className="card-button">
          <i className="fas fa-arrow-right"></i> {buttonText}
        </Link>
        
        <button 
          className="add-button" 
          onClick={() => navigateToAdd(to, 'add')}
        >
          <i className="fas fa-plus"></i> Aggiungi
        </button>
      </div>
    </div>
  );
  
  // Componente modale per aggiornamento giornaliero
  const TodayModal = () => (
    <div className={`modal-overlay ${showTodayModal ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Come ti senti oggi?</h2>
          <button className="close-modal" onClick={() => setShowTodayModal(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="mood-selector">
            <h3>Il tuo umore</h3>
            <div className="mood-options">
              <button className="mood-option">
                <i className="fas fa-sad-tear"></i>
                <span>Triste</span>
              </button>
              <button className="mood-option">
                <i className="fas fa-meh"></i>
                <span>Neutro</span>
              </button>
              <button className="mood-option">
                <i className="fas fa-smile"></i>
                <span>Bene</span>
              </button>
              <button className="mood-option">
                <i className="fas fa-grin-beam"></i>
                <span>Ottimo</span>
              </button>
            </div>
          </div>
          
          <div className="sleep-selector">
            <h3>Qualità del sonno</h3>
            <div className="sleep-slider">
              <input type="range" min="1" max="5" defaultValue="3" />
              <div className="range-labels">
                <span>Scarsa</span>
                <span>Media</span>
                <span>Ottima</span>
              </div>
            </div>
          </div>
          
          <div className="symptoms-quick-add">
            <h3>Hai sintomi oggi?</h3>
            <button className="quick-add-button">
              <i className="fas fa-plus"></i> Aggiungi sintomo
            </button>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="secondary-button" onClick={() => setShowTodayModal(false)}>
            Annulla
          </button>
          <button className="primary-button" onClick={() => setShowTodayModal(false)}>
            Salva
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Preparando il tuo dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Ciao, {userName}!</h1>
        <p className="dashboard-subtitle">Ecco il riepilogo della tua salute e benessere</p>
      </div>
      
      <QuickStats />
      
      <MyDaySection />
      
      <QuickActions />
      
      <div className="tracking-sections">
        <TrackingCard
          icon="fa-heartbeat"
          title={t('symptoms')}
          description={t('noSymptomsDescription', 'Registra i tuoi sintomi per tenere traccia della tua salute nel tempo')}
          buttonText={t('viewSymptoms', 'Visualizza sintomi')}
          to="/sintomi"
          emptyState={symptoms.length === 0}
          data={symptoms}
        />
        
        <TrackingCard
          icon="fa-pills"
          title={t('medications')}
          description={t('noMedicationsDescription', 'Aggiungi i tuoi farmaci per ricevere promemoria e monitorare l\'assunzione')}
          buttonText={t('viewMedications', 'Visualizza farmaci')}
          to="/farmaci"
          emptyState={medications.length === 0}
          data={medications}
        />
        
        <TrackingCard
          icon="fa-smile"
          title={t('wellness')}
          description={t('noWellnessDescription', 'Tieni traccia del tuo umore, sonno e attività fisica')}
          buttonText={t('viewWellness', 'Visualizza benessere')}
          to="/benessere"
          emptyState={wellness.length === 0}
          data={wellness}
        />
      </div>
      
      <HealthTips />
      
      <TodayModal />
    </div>
  );
};

export default Dashboard; 