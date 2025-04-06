// File WellnessTracker Component

import React, { useState, useEffect } from 'react';
import { saveUserData } from '../utils/dataManager';
import '../styles/WellnessTracker.css';

const WellnessTracker = ({ userId }) => {
  const [wellnessData, setWellnessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 3,
    sleepQuality: 3,
    energyLevel: 3,
    stressLevel: 3,
    physicalActivity: 3,
    notes: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Modifica queste funzioni per restituire array vuoti invece di generare dati finti
  const generateMockWellnessLogs = () => {
    return [];
  };

  const generateMockWellnessStats = () => {
    return {
      averageMood: 0,
      averageSleep: 0,
      averageEnergy: 0,
      averageStress: 0,
      physicalActivityDays: 0,
      totalLogs: 0,
      lastWeekTrend: 'stable'
    };
  };

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Componente per stato vuoto
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-illustration">
        <i className="fas fa-smile-beam" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Non hai ancora registrato dati sul benessere</h2>
      <p>Tieni traccia del tuo benessere giornaliero per scoprire pattern e migliorare il tuo stile di vita</p>
      
      <div className="benefits-list">
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fas fa-brain"></i>
          </div>
          <div className="benefit-text">
            <h3>Monitora il tuo umore</h3>
            <p>Identifica cosa influenza positivamente il tuo stato emotivo</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fas fa-bed"></i>
          </div>
          <div className="benefit-text">
            <h3>Migliora il tuo sonno</h3>
            <p>Analizza le abitudini che influenzano la qualità del riposo</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fas fa-running"></i>
          </div>
          <div className="benefit-text">
            <h3>Ottimizza l'energia</h3>
            <p>Scopri come gestire al meglio i tuoi livelli di energia durante il giorno</p>
          </div>
        </div>
      </div>
      
      <button 
        className="add-wellness-button-large"
        onClick={(e) => {
          e.preventDefault();
          console.log("Apertura form benessere");
          setShowForm(true);
        }}
        type="button"
      >
        <i className="fas fa-plus-circle"></i> Registra il tuo primo dato di benessere
      </button>
    </div>
  );

  // Carica i dati esistenti
  useEffect(() => {
    setLoading(true);
    
    // Simula chiamata API per recuperare i dati
    setTimeout(() => {
      try {
        // Controlla se ci sono dati nel localStorage
        const storedData = localStorage.getItem('wellnessData');
        
        if (storedData) {
          console.log("Trovati dati di benessere salvati nel localStorage");
          const parsedData = JSON.parse(storedData);
          setWellnessData(parsedData);
        } else {
          console.log("Nessun dato di benessere trovato nel localStorage, utilizzo array vuoto");
          setWellnessData([]);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati di benessere dal localStorage:", error);
        setWellnessData([]);
      }
      
      setLoading(false);
    }, 400);
  }, []);

  // Gestione invio del form
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    console.log("Salvataggio dati di benessere in corso...", formData);
    
    try {
      // Crea un nuovo record di benessere
      const newRecord = {
        id: Date.now(),
        ...formData
      };
      
      // Attendi un momento prima di aggiornare lo stato (per simulare operazione asincrona)
      setTimeout(() => {
        try {
          // Aggiorna lo stato locale
          const updatedData = [...wellnessData, newRecord];
          setWellnessData(updatedData);
          
          // Salva nel localStorage
          localStorage.setItem('wellnessData', JSON.stringify(updatedData));
          console.log("Dati di benessere salvati con successo nel localStorage");
          
          // Reset del form
          setFormData({
            date: formatDate(new Date()),
            mood: 3,
            sleepQuality: 3,
            energyLevel: 3,
            stressLevel: 3,
            physicalActivity: false,
            notes: ''
          });
          
          setSubmitting(false);
          setShowForm(false);
          setSuccessMessage('Dati salvati con successo!');
          
          // Nascondi il messaggio dopo 3 secondi
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } catch (innerError) {
          console.error("Errore durante il salvataggio dei dati:", innerError);
          alert("Si è verificato un errore durante il salvataggio. Riprova.");
          setSubmitting(false);
        }
      }, 500);
    } catch (error) {
      console.error("Errore durante la preparazione dei dati di benessere:", error);
      alert("Si è verificato un errore. Riprova.");
      setSubmitting(false);
    }
  };

  // Formatta la data per la visualizzazione
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Ottiene l'etichetta del mood in base al valore
  const getMoodLabel = (value) => {
    const labels = ['Molto triste', 'Triste', 'Neutro', 'Felice', 'Molto felice'];
    return labels[value - 1] || 'Sconosciuto';
  };

  // Ottiene l'icona del mood in base al valore
  const getMoodIcon = (value) => {
    const icons = [
      'fa-sad-tear', 
      'fa-frown', 
      'fa-meh', 
      'fa-smile', 
      'fa-grin-beam'
    ];
    return icons[value - 1] || 'fa-question-circle';
  };

  // Ottiene il colore del mood in base al valore
  const getMoodColor = (value) => {
    const colors = [
      '#ef4444', // rosso per molto triste
      '#f97316', // arancione per triste
      '#facc15', // giallo per neutro
      '#84cc16', // verde chiaro per felice
      '#22c55e'  // verde per molto felice
    ];
    return colors[value - 1] || '#94a3b8';
  };

  // Calcola le statistiche dai dati
  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      return generateMockWellnessStats();
    }
    
    const total = data.length;
    
    // Calcola medie
    const averageMood = data.reduce((sum, item) => sum + parseInt(item.mood), 0) / total;
    const averageSleep = data.reduce((sum, item) => sum + parseInt(item.sleepQuality), 0) / total;
    const averageEnergy = data.reduce((sum, item) => sum + parseInt(item.energyLevel), 0) / total;
    const averageStress = data.reduce((sum, item) => sum + parseInt(item.stressLevel), 0) / total;
    
    // Calcola giorni di attività fisica
    const physicalActivityDays = data.filter(item => item.physicalActivity).length;
    
    // Calcola tendenza ultima settimana
    const lastWeek = data.filter(item => {
      const itemDate = new Date(item.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    });
    
    let lastWeekTrend = 'stable';
    if (lastWeek.length > 2) {
      const recentMoods = lastWeek.map(item => parseInt(item.mood));
      const firstHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
      const secondHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 0.5) lastWeekTrend = 'improving';
      else if (secondAvg < firstAvg - 0.5) lastWeekTrend = 'declining';
    }
    
    return {
      averageMood,
      averageSleep,
      averageEnergy,
      averageStress,
      physicalActivityDays,
      totalLogs: total,
      lastWeekTrend
    };
  };

  // Componente per mostrare lo storico dei log
  const WellnessLogHistory = () => {
    if (wellnessData.length === 0) {
      return null;
    }
    
    // Ordina i dati per data (dal più recente)
    const sortedData = [...wellnessData].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return (
      <div className="wellness-history">
        <h2>Storico dei dati</h2>
        <div className="wellness-logs">
          {sortedData.map(log => (
            <div key={log.id} className="wellness-log-card">
              <div className="log-header">
                <div className="log-date">{new Date(log.date).toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <div className="log-mood" style={{ color: getMoodColor(log.mood) }}>
                  <i className={`fas ${getMoodIcon(log.mood)}`}></i>
                  <span>{getMoodLabel(log.mood)}</span>
                </div>
              </div>
              
              <div className="log-metrics">
                <div className="metric">
                  <i className="fas fa-bed"></i>
                  <div className="metric-details">
                    <div className="metric-label">Qualità del sonno</div>
                    <div className="metric-value">
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${log.sleepQuality * 20}%`, backgroundColor: '#3b82f6' }}></div>
                      </div>
                      <span>{log.sleepQuality}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="metric">
                  <i className="fas fa-bolt"></i>
                  <div className="metric-details">
                    <div className="metric-label">Livello di energia</div>
                    <div className="metric-value">
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${log.energyLevel * 20}%`, backgroundColor: '#f59e0b' }}></div>
                      </div>
                      <span>{log.energyLevel}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="metric">
                  <i className="fas fa-wind"></i>
                  <div className="metric-details">
                    <div className="metric-label">Livello di stress</div>
                    <div className="metric-value">
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${log.stressLevel * 20}%`, backgroundColor: '#ef4444' }}></div>
                      </div>
                      <span>{log.stressLevel}/5</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {log.physicalActivity && (
                <div className="log-activity">
                  <i className="fas fa-running"></i> Attività fisica svolta
                </div>
              )}
              
              {log.notes && (
                <div className="log-notes">
                  <i className="fas fa-sticky-note"></i> {log.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Componente per mostrare le statistiche
  const WellnessStats = () => {
    const stats = calculateStats(wellnessData);
    
    // Se non ci sono dati sufficienti, non mostrare le statistiche
    if (wellnessData.length === 0) {
      return null;
    }
    
    return (
      <div className="wellness-stats">
        <h2>Riepilogo del benessere</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-smile-beam"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageMood.toFixed(1)}</div>
              <div className="stat-label">Umore medio</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-bed"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageSleep.toFixed(1)}</div>
              <div className="stat-label">Qualità sonno media</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageEnergy.toFixed(1)}</div>
              <div className="stat-label">Energia media</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-wind"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.averageStress.toFixed(1)}</div>
              <div className="stat-label">Stress medio</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-running"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.physicalActivityDays}</div>
              <div className="stat-label">Giorni di attività fisica</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className={`fas ${stats.lastWeekTrend === 'improving' ? 'fa-arrow-up' : 
                                  stats.lastWeekTrend === 'declining' ? 'fa-arrow-down' : 'fa-equals'}`}></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.lastWeekTrend === 'improving' ? 'In miglioramento' : 
                 stats.lastWeekTrend === 'declining' ? 'In peggioramento' : 'Stabile'}
              </div>
              <div className="stat-label">Tendenza umore ultima settimana</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="wellness-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wellness-tracker">
      <div className="wellness-header">
        <div className="wellness-title">
          <h1>Il Tuo Benessere</h1>
          <p>Monitora e migliora il tuo benessere giornaliero</p>
        </div>
        
        {wellnessData.length > 0 && !showForm && (
          <button 
            className="add-wellness-button" 
            onClick={() => setShowForm(true)}
          >
            <i className="fas fa-plus"></i> Nuovo Report
          </button>
        )}
      </div>
      
      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      
      {wellnessData.length > 0 ? (
        <>
          {!showForm && (
            <>
              <WellnessStats />
              <WellnessLogHistory />
            </>
          )}
          
          {showForm && (
            <div className="wellness-form-container">
              <h2>Inserisci i dati di oggi</h2>
              <form onSubmit={handleSubmit} className="wellness-form">
                <div className="form-group">
                  <label htmlFor="date">Data</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="mood">
                    <i className={`fas ${getMoodIcon(formData.mood)}`} style={{color: getMoodColor(formData.mood)}}></i>
                    Umore: <span>{getMoodLabel(formData.mood)}</span>
                  </label>
                  <input
                    type="range"
                    id="mood"
                    name="mood"
                    min="1"
                    max="5"
                    value={formData.mood}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Molto triste</span>
                    <span>Molto felice</span>
                  </div>
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="sleepQuality">
                    <i className="fas fa-bed"></i>
                    Qualità del sonno: <span>{formData.sleepQuality}/5</span>
                  </label>
                  <input
                    type="range"
                    id="sleepQuality"
                    name="sleepQuality"
                    min="1"
                    max="5"
                    value={formData.sleepQuality}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Scarsa</span>
                    <span>Eccellente</span>
                  </div>
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="energyLevel">
                    <i className="fas fa-bolt"></i>
                    Livello di energia: <span>{formData.energyLevel}/5</span>
                  </label>
                  <input
                    type="range"
                    id="energyLevel"
                    name="energyLevel"
                    min="1"
                    max="5"
                    value={formData.energyLevel}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="stressLevel">
                    <i className="fas fa-wind"></i>
                    Livello di stress: <span>{formData.stressLevel}/5</span>
                  </label>
                  <input
                    type="range"
                    id="stressLevel"
                    name="stressLevel"
                    min="1"
                    max="5"
                    value={formData.stressLevel}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <label htmlFor="physicalActivity" className="checkbox-label">
                    <input
                      type="checkbox"
                      id="physicalActivity"
                      name="physicalActivity"
                      checked={formData.physicalActivity}
                      onChange={handleChange}
                    />
                    <i className="fas fa-running"></i> Hai fatto attività fisica oggi?
                  </label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Note aggiuntive</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Aggiungi note sul tuo benessere di oggi..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="button-spinner"></div>
                        Salvataggio...
                      </>
                    ) : 'Salva'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <>
          {showForm ? (
            <div className="wellness-form-container">
              <h2>Inserisci i dati di oggi</h2>
              <form onSubmit={handleSubmit} className="wellness-form">
                <div className="form-group">
                  <label htmlFor="date">Data</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="mood">
                    <i className={`fas ${getMoodIcon(formData.mood)}`} style={{color: getMoodColor(formData.mood)}}></i>
                    Umore: <span>{getMoodLabel(formData.mood)}</span>
                  </label>
                  <input
                    type="range"
                    id="mood"
                    name="mood"
                    min="1"
                    max="5"
                    value={formData.mood}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Molto triste</span>
                    <span>Molto felice</span>
                  </div>
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="sleepQuality">
                    <i className="fas fa-bed"></i>
                    Qualità del sonno: <span>{formData.sleepQuality}/5</span>
                  </label>
                  <input
                    type="range"
                    id="sleepQuality"
                    name="sleepQuality"
                    min="1"
                    max="5"
                    value={formData.sleepQuality}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Scarsa</span>
                    <span>Eccellente</span>
                  </div>
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="energyLevel">
                    <i className="fas fa-bolt"></i>
                    Livello di energia: <span>{formData.energyLevel}/5</span>
                  </label>
                  <input
                    type="range"
                    id="energyLevel"
                    name="energyLevel"
                    min="1"
                    max="5"
                    value={formData.energyLevel}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
                
                <div className="form-group range-group">
                  <label htmlFor="stressLevel">
                    <i className="fas fa-wind"></i>
                    Livello di stress: <span>{formData.stressLevel}/5</span>
                  </label>
                  <input
                    type="range"
                    id="stressLevel"
                    name="stressLevel"
                    min="1"
                    max="5"
                    value={formData.stressLevel}
                    onChange={handleChange}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
                
                <div className="form-group checkbox-group">
                  <label htmlFor="physicalActivity" className="checkbox-label">
                    <input
                      type="checkbox"
                      id="physicalActivity"
                      name="physicalActivity"
                      checked={formData.physicalActivity}
                      onChange={handleChange}
                    />
                    <i className="fas fa-running"></i> Hai fatto attività fisica oggi?
                  </label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Note aggiuntive</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Aggiungi note sul tuo benessere di oggi..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="button-spinner"></div>
                        Salvataggio...
                      </>
                    ) : 'Salva'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <EmptyState />
          )}
        </>
      )}
    </div>
  );
};

export default WellnessTracker;
