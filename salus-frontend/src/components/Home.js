import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

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
          wellnessScore: 85,
          aiInteractions: 5
        });

        // Sintomi recenti
        setRecentSymptoms([
          {
            id: '1',
            name: 'Mal di testa',
            severity: 'medium',
            time: '2 ore fa',
            duration: '45 minuti'
          },
          {
            id: '2',
            name: 'Vertigini',
            severity: 'low',
            time: 'Ieri',
            duration: '10 minuti'
          },
          {
            id: '3',
            name: 'Dolore articolare',
            severity: 'high',
            time: 'Ieri',
            duration: '3 ore'
          }
        ]);

        // Promemoria
        setReminders([
          {
            id: '1',
            type: 'medication',
            title: 'Tachipirina',
            time: '08:00',
            date: new Date().toLocaleDateString()
          },
          {
            id: '2',
            type: 'appointment',
            title: 'Visita dal medico',
            time: '15:30',
            date: new Date(Date.now() + 86400000).toLocaleDateString()
          },
          {
            id: '3',
            type: 'task',
            title: 'Aggiorna dati pressione',
            time: '20:00',
            date: new Date().toLocaleDateString()
          }
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
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Funzione per determinare il colore in base alla gravità
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'severity-low';
      case 'medium': return 'severity-medium';
      case 'high': return 'severity-high';
      default: return 'severity-low';
    }
  };

  // Formattazione data e ora
  const formatDateTime = (time, date) => {
    return `${time} - ${date}`;
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
          <div className="stat-icon stat-symptoms">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div className="stat-label">Sintomi totali</div>
          <div className="stat-value">{stats.totalSymptoms}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-medications">
            <i className="fas fa-pills"></i>
          </div>
          <div className="stat-label">Farmaci attivi</div>
          <div className="stat-value">{stats.activeMedications}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-wellness">
            <i className="fas fa-smile"></i>
          </div>
          <div className="stat-label">Livello benessere</div>
          <div className="stat-value" style={{ color: getWellnessColor(stats.wellnessScore) }}>
            {stats.wellnessScore}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-ai">
            <i className="fas fa-robot"></i>
          </div>
          <div className="stat-label">Interazioni AI</div>
          <div className="stat-value">{stats.aiInteractions}</div>
        </div>
      </section>

      {/* Azioni rapide */}
      <section className="quick-actions-section">
        <h2 className="section-title">
          <i className="fas fa-bolt"></i> Azioni rapide
        </h2>
        <div className="quick-actions-grid">
          <Link to="/symptoms" className="quick-action-card">
            <div className="quick-action-icon quick-action-symptoms">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3 className="quick-action-title">Sintomi</h3>
            <p className="quick-action-desc">Registra e monitora i tuoi sintomi</p>
          </Link>

          <Link to="/medications" className="quick-action-card">
            <div className="quick-action-icon quick-action-medications">
              <i className="fas fa-pills"></i>
            </div>
            <h3 className="quick-action-title">Farmaci</h3>
            <p className="quick-action-desc">Gestisci le tue medicine</p>
          </Link>

          <Link to="/wellness" className="quick-action-card">
            <div className="quick-action-icon quick-action-wellness">
              <i className="fas fa-smile"></i>
            </div>
            <h3 className="quick-action-title">Benessere</h3>
            <p className="quick-action-desc">Traccia umore, sonno e stress</p>
          </Link>

          <Link to="/assistant" className="quick-action-card">
            <div className="quick-action-icon quick-action-ai">
              <i className="fas fa-robot"></i>
            </div>
            <h3 className="quick-action-title">Assistente AI</h3>
            <p className="quick-action-desc">Consulta l'assistente virtuale</p>
          </Link>
        </div>
      </section>

      {/* Dashboard principale */}
      <div className="dashboard-row">
        {/* Sintomi recenti */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-history"></i> Sintomi recenti
            </h2>
            <span className="card-action">
              Vedi tutti <i className="fas fa-arrow-right"></i>
            </span>
          </div>
          
          {loading ? (
            <p>Caricamento sintomi recenti...</p>
          ) : recentSymptoms.length > 0 ? (
            <div>
              {recentSymptoms.map(symptom => (
                <div key={symptom.id} className="symptom-item">
                  <div className={`symptom-severity ${getSeverityColor(symptom.severity)}`}></div>
                  <div className="symptom-info">
                    <div className="symptom-name">{symptom.name}</div>
                    <div className="symptom-meta">
                      <span className="symptom-time">{symptom.time}</span>
                      <span className="symptom-duration">
                        <i className="fas fa-clock"></i> {symptom.duration}
                      </span>
                    </div>
                  </div>
                  <div className="symptom-actions">
                    <button className="symptom-button">
                      <i className="fas fa-info-circle"></i>
                    </button>
                    <button className="symptom-button">
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Non hai registrato sintomi recentemente.</p>
          )}
        </div>

        {/* Promemoria */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              <i className="fas fa-calendar-check"></i> Promemoria
            </h2>
            <span className="card-action">
              Nuovo <i className="fas fa-plus"></i>
            </span>
          </div>
          
          {loading ? (
            <p>Caricamento promemoria...</p>
          ) : reminders.length > 0 ? (
            <div>
              {reminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className={`reminder-item reminder-${reminder.type}`}
                >
                  <div className="reminder-title">{reminder.title}</div>
                  <div className="reminder-time">
                    <i className="fas fa-clock"></i> 
                    {formatDateTime(reminder.time, reminder.date)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Non hai promemoria attivi.</p>
          )}
        </div>
      </div>

      {/* Tendenze salute */}
      <div className="dashboard-card mb-4">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-chart-line"></i> Tendenze salute
          </h2>
          <span className="card-action">
            Personalizza <i className="fas fa-cog"></i>
          </span>
        </div>
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Grafico delle tendenze di salute - Prossimamente</p>
        </div>
      </div>

      {/* Consigli personalizzati */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="fas fa-lightbulb"></i> Consigli personalizzati
          </h2>
        </div>
        <div>
          <p>In base ai tuoi dati recenti, ecco alcuni consigli:</p>
          <ul style={{ marginTop: "1rem", marginLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.5rem" }}>Aumenta il consumo di acqua per alleviare i mal di testa</li>
            <li style={{ marginBottom: "0.5rem" }}>Continua a prendere i tuoi farmaci regolarmente</li>
            <li style={{ marginBottom: "0.5rem" }}>Prova tecniche di rilassamento per ridurre lo stress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home; 