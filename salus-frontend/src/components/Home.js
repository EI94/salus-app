import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ userId, userName }) => {
  // Stato per i dati dell'utente
  const [stats, setStats] = useState({
    totalSymptoms: 0,
    activeMedications: 0,
    wellnessScore: 0,
    aiInteractions: 0
  });

  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Caricamento dati
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // In un ambiente reale, caricheremmo i dati dall'API
        // Per ora, utilizziamo dati di esempio

        // Simuliamo un ritardo di caricamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Statistiche generali
        setStats({
          totalSymptoms: 12,
          activeMedications: 3,
          wellnessScore: 75,
          aiInteractions: 5
        });

        // Sintomi recenti
        setRecentSymptoms([
          { id: 1, name: 'Mal di testa', intensity: 3, date: '2023-07-15' },
          { id: 2, name: 'Dolore alla schiena', intensity: 4, date: '2023-07-14' }
        ]);

        // Promemoria
        setReminders([
          { id: 1, title: 'Paracetamolo', time: '08:00', type: 'medication' },
          { id: 2, title: 'Visita cardiologica', time: '14:30', type: 'appointment', date: '2023-07-22' }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Errore durante il caricamento dei dati:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Funzione per determinare il colore in base al punteggio di benessere
  const getWellnessColor = (score) => {
    if (score >= 80) return '#10b981'; // Verde
    if (score >= 60) return '#0ea5e9'; // Blu
    if (score >= 40) return '#f59e0b'; // Arancione
    return '#ef4444'; // Rosso
  };

  // Funzione per determinare il colore in base all'intensità del sintomo
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 1: return '#c8e6c9'; // Verde chiaro
      case 2: return '#ffecb3'; // Giallo chiaro
      case 3: return '#ffcc80'; // Arancione chiaro
      case 4: return '#ffab91'; // Arancione scuro
      case 5: return '#ef9a9a'; // Rosso chiaro
      default: return '#e0e0e0';
    }
  };

  // Formattazione della data
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Formattazione dell'ora
  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <div className="home-container">
      {/* Sezione di benvenuto */}
      <section className="welcome-section">
        <div className="welcome-pattern"></div>
        <div className="welcome-content">
          <h1 className="welcome-title">
            Benvenuto{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="welcome-subtitle">
            Monitora i tuoi sintomi, gestisci i tuoi farmaci e mantieni traccia del tuo benessere generale con Salus.
          </p>
          <div className="welcome-actions">
            <button className="welcome-button primary">
              <i className="fas fa-plus"></i> Registra un sintomo
            </button>
            <button className="welcome-button">
              <i className="fas fa-pills"></i> Controlla farmaci
            </button>
          </div>
        </div>
      </section>

      {/* Statistiche */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-content">
            <h3>Sintomi Totali</h3>
            <div className="stat-value">{stats.totalSymptoms}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-pills"></i>
          </div>
          <div className="stat-content">
            <h3>Farmaci Attivi</h3>
            <div className="stat-value">{stats.activeMedications}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="stat-content">
            <h3>Punteggio Benessere</h3>
            <div className="stat-value" style={{ color: getWellnessColor(stats.wellnessScore) }}>
              {stats.wellnessScore}%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="stat-content">
            <h3>Interazioni IA</h3>
            <div className="stat-value">{stats.aiInteractions}</div>
          </div>
        </div>
      </section>

      {/* Azioni rapide */}
      <section className="quick-actions-section">
        <h2 className="quick-actions-header">Azioni Rapide</h2>
        <div className="quick-actions-grid">
          <Link to="/symptoms/add" className="quick-action-card">
            <div className="quick-action-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <span>Registra Sintomo</span>
          </Link>

          <Link to="/medications/add" className="quick-action-card">
            <div className="quick-action-icon">
              <i className="fas fa-capsules"></i>
            </div>
            <span>Aggiungi Farmaco</span>
          </Link>

          <Link to="/wellness/track" className="quick-action-card">
            <div className="quick-action-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <span>Traccia Benessere</span>
          </Link>

          <Link to="/assistant" className="quick-action-card">
            <div className="quick-action-icon">
              <i className="fas fa-comment-medical"></i>
            </div>
            <span>Consulta Assistente</span>
          </Link>
        </div>
      </section>

      {/* Dashboard principale */}
      <div className="home-content">
        {/* Sintomi recenti e Promemoria */}
        <div className="home-content-left">
          {/* Sintomi recenti */}
          <div className="recent-symptoms">
            <h2>Sintomi Recenti</h2>
            {recentSymptoms.length > 0 ? (
              <div className="symptoms-list">
                {recentSymptoms.map(symptom => (
                  <div key={symptom.id} className="symptom-item">
                    <div 
                      className="symptom-intensity"
                      style={{ backgroundColor: getIntensityColor(symptom.intensity) }}
                    >
                      {symptom.intensity}
                    </div>
                    <div className="symptom-details">
                      <div className="symptom-name">{symptom.name}</div>
                      <div className="symptom-date">{formatDate(symptom.date)}</div>
                    </div>
                    <Link to={`/symptoms/${symptom.id}`} className="symptom-action">
                      <i className="fas fa-chevron-right"></i>
                    </Link>
                  </div>
                ))}
                <Link to="/symptoms" className="view-all-link">
                  Vedi tutti i sintomi <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ) : (
              <div className="empty-list">
                <p>Nessun sintomo registrato recentemente</p>
                <Link to="/symptoms/add" className="btn-primary">
                  Registra un sintomo
                </Link>
              </div>
            )}
          </div>
          
          {/* Promemoria */}
          <div className="reminders">
            <h2>Promemoria</h2>
            {reminders.length > 0 ? (
              <div className="reminders-list">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="reminder-item">
                    <div className={`reminder-icon ${reminder.type}`}>
                      <i className={`fas ${reminder.type === 'medication' ? 'fa-pills' : 'fa-calendar-check'}`}></i>
                    </div>
                    <div className="reminder-details">
                      <div className="reminder-title">{reminder.title}</div>
                      <div className="reminder-time">
                        {reminder.type === 'appointment' && reminder.date && `${formatDate(reminder.date)} - `}
                        {formatTime(reminder.time)}
                      </div>
                    </div>
                    <div className="reminder-action">
                      <button className="btn-icon" aria-label="Contrassegna come completato">
                        <i className="fas fa-check"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <Link to="/reminders" className="view-all-link">
                  Gestisci promemoria <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ) : (
              <div className="empty-list">
                <p>Nessun promemoria impostato</p>
                <Link to="/reminders/add" className="btn-primary">
                  Aggiungi promemoria
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Tendenze e consigli */}
        <div className="home-content-right">
          {/* Tendenze salute */}
          <div className="health-trends-box">
            <h3>Tendenze Salute</h3>
            <p>I tuoi sintomi principali questa settimana sono legati a mal di testa e dolori muscolari. Ci sono stati miglioramenti nei valori della pressione sanguigna rispetto alla settimana precedente.</p>
            <div className="trends-chart">
              {/* Qui potrebbe essere inserito un grafico */}
            </div>
            <Link to="/analytics" className="view-trends-link">
              Visualizza grafici dettagliati <i className="fas fa-chart-bar"></i>
            </Link>
          </div>
          
          {/* Consigli personalizzati */}
          <div className="personalized-advice-box">
            <h3>Consigli Personalizzati</h3>
            <p>Basandoci sui tuoi dati, ti consigliamo di mantenere una routine regolare di sonno e di fare attenzione all'assunzione di caffeina, che potrebbe contribuire ai mal di testa.</p>
            <p>Considera di consultare uno specialista se i sintomi persistono oltre una settimana.</p>
            <Link to="/assistant" className="ask-more-link">
              Chiedi all'assistente virtuale <i className="fas fa-robot"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 