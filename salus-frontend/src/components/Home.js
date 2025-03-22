import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const Home = ({ userId, userName }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    symptomCount: 0,
    medicationCount: 0,
    wellnessScore: 0,
    recentSymptoms: [],
    reminders: []
  });

  // Funzione per ottenere il colore in base al punteggio di benessere
  const getWellnessColor = (score) => {
    if (score >= 80) return '#10b981'; // verde
    if (score >= 60) return '#0ea5e9'; // blu
    if (score >= 40) return '#f59e0b'; // giallo
    return '#ef4444'; // rosso
  };
  
  // Funzione per ottenere il colore in base all'intensità del sintomo
  const getIntensityColor = (intensity) => {
    if (intensity <= 2) return '#10b981'; // verde
    if (intensity <= 5) return '#f59e0b'; // giallo
    if (intensity <= 8) return '#f97316'; // arancione
    return '#ef4444'; // rosso
  };

  // Carica i dati all'avvio
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Simuliamo le chiamate API per lo sviluppo
        // In un ambiente reale, useremmo API.get('/user-stats') ecc.
        
        // Simulazione risposta API - statistiche utente
        const userStatsData = {
          symptomCount: 12,
          medicationCount: 4,
          wellnessScore: 73,
          recentSymptoms: [
            { id: 1, name: 'Mal di testa', intensity: 5, date: '2025-03-20' },
            { id: 2, name: 'Nausea', intensity: 3, date: '2025-03-19' },
            { id: 3, name: 'Stanchezza', intensity: 7, date: '2025-03-18' }
          ],
          reminders: [
            { id: 1, medicationName: 'Ibuprofene', time: '12:00', dosage: '200mg' },
            { id: 2, medicationName: 'Vitamine', time: '08:30', dosage: '1 compressa' }
          ]
        };
        
        setStats(userStatsData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        // Gestione errori
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);
  
  // Formattazione data
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };
  
  if (loading) {
    return (
      <div className="home-loading">
        <div className="pulse-loader"></div>
        <p>Caricamento del tuo cruscotto...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Benvenuto, {userName}!</h1>
        <p className="welcome-subtitle">Monitora la tua salute e benessere con Salus</p>
      </div>
      
      {/* Statistiche utente */}
      <div className="stats-section">
        <h2 className="section-title">Il tuo stato attuale</h2>
        <div className="stats-grid">
          <div className="stat-card wellness-score">
            <div className="stat-icon">
              <i className="fas fa-heart"></i>
            </div>
            <div className="stat-content">
              <h3>Benessere</h3>
              <div className="stat-value" style={{ color: getWellnessColor(stats.wellnessScore) }}>
                {stats.wellnessScore}%
              </div>
              <div className="stat-bar-container">
                <div 
                  className="stat-bar" 
                  style={{ 
                    width: `${stats.wellnessScore}%`,
                    backgroundColor: getWellnessColor(stats.wellnessScore) 
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="stat-card symptom-count">
            <div className="stat-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="stat-content">
              <h3>Sintomi registrati</h3>
              <div className="stat-value">{stats.symptomCount}</div>
              <div className="stat-caption">Nell'ultimo mese</div>
            </div>
          </div>
          
          <div className="stat-card medication-count">
            <div className="stat-icon">
              <i className="fas fa-pills"></i>
            </div>
            <div className="stat-content">
              <h3>Farmaci attivi</h3>
              <div className="stat-value">{stats.medicationCount}</div>
              <div className="stat-caption">In gestione</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Azioni rapide */}
      <div className="quick-actions">
        <h2 className="section-title">Azioni rapide</h2>
        <div className="actions-grid">
          <Link to="/sintomi/nuovo" className="action-card">
            <div className="action-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="action-content">
              <h3>Nuovo sintomo</h3>
              <p>Registra un nuovo sintomo</p>
            </div>
          </Link>
          
          <Link to="/farmaci/nuovo" className="action-card">
            <div className="action-icon">
              <i className="fas fa-prescription-bottle-alt"></i>
            </div>
            <div className="action-content">
              <h3>Nuovo farmaco</h3>
              <p>Aggiungi un farmaco al monitoraggio</p>
            </div>
          </Link>
          
          <Link to="/benessere/nuovo" className="action-card">
            <div className="action-icon">
              <i className="fas fa-smile"></i>
            </div>
            <div className="action-content">
              <h3>Inserisci umore</h3>
              <p>Traccia il tuo benessere mentale</p>
            </div>
          </Link>
          
          <Link to="/assistente" className="action-card">
            <div className="action-icon">
              <i className="fas fa-robot"></i>
            </div>
            <div className="action-content">
              <h3>Chiedi all'assistente</h3>
              <p>Ricevi consigli personalizzati</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Contenuto principale */}
      <div className="main-content-grid">
        {/* Sintomi recenti */}
        <div className="recent-symptoms">
          <div className="panel-header">
            <h2>Sintomi recenti</h2>
            <Link to="/sintomi" className="view-all">
              Vedi tutti <i className="fas fa-chevron-right"></i>
            </Link>
          </div>
          
          {stats.recentSymptoms.length > 0 ? (
            <div className="symptoms-list">
              {stats.recentSymptoms.map(symptom => (
                <div className="symptom-card" key={symptom.id}>
                  <div 
                    className="symptom-intensity"
                    style={{ backgroundColor: getIntensityColor(symptom.intensity) }}
                  >
                    {symptom.intensity}
                  </div>
                  <div className="symptom-info">
                    <h3>{symptom.name}</h3>
                    <p>{formatDate(symptom.date)}</p>
                  </div>
                  <div className="symptom-actions">
                    <button className="symptom-action-btn">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <p>Nessun sintomo registrato di recente</p>
              <Link to="/sintomi/nuovo" className="btn-add">
                <i className="fas fa-plus"></i> Aggiungi sintomo
              </Link>
            </div>
          )}
        </div>
        
        {/* Promemoria farmaci */}
        <div className="medication-reminders">
          <div className="panel-header">
            <h2>Promemoria farmaci</h2>
            <Link to="/farmaci" className="view-all">
              Vedi tutti <i className="fas fa-chevron-right"></i>
            </Link>
          </div>
          
          {stats.reminders.length > 0 ? (
            <div className="reminders-list">
              {stats.reminders.map(reminder => (
                <div className="reminder-card" key={reminder.id}>
                  <div className="reminder-icon">
                    <i className="fas fa-pills"></i>
                  </div>
                  <div className="reminder-info">
                    <h3>{reminder.medicationName}</h3>
                    <p>{reminder.dosage} - {reminder.time}</p>
                  </div>
                  <div className="reminder-actions">
                    <button className="reminder-action-btn take">
                      <i className="fas fa-check"></i>
                    </button>
                    <button className="reminder-action-btn skip">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-prescription-bottle-alt"></i>
              <p>Nessun promemoria farmaci impostato</p>
              <Link to="/farmaci/nuovo" className="btn-add">
                <i className="fas fa-plus"></i> Aggiungi farmaco
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Consigli personalizzati */}
      <div className="advice-section">
        <h2 className="section-title">Consigli personalizzati</h2>
        <div className="advice-card">
          <div className="advice-icon">
            <i className="fas fa-lightbulb"></i>
          </div>
          <div className="advice-content">
            <h3>Probabile allergia stagionale</h3>
            <p>
              I tuoi sintomi recenti (naso che cola, starnuti frequenti) potrebbero 
              indicare un'allergia stagionale. Considera di consultare uno specialista 
              per un controllo.
            </p>
            <div className="advice-actions">
              <button className="advice-btn">
                <i className="fas fa-calendar-alt"></i> Prenota visita
              </button>
              <button className="advice-btn secondary">
                <i className="fas fa-info-circle"></i> Maggiori info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 