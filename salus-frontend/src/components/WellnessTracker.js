import React, { useState, useEffect } from 'react';
import '../styles/WellnessTracker.css';

const WellnessTracker = () => {
  const [moodEntries, setMoodEntries] = useState([]);
  const [sleepEntries, setSleepEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('mood');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  
  // Stato per nuovi inserimenti
  const [newMood, setNewMood] = useState({
    rating: 3,
    notes: '',
    activities: [],
    date: new Date().toISOString().split('T')[0]
  });
  
  const [newSleep, setNewSleep] = useState({
    hours: 7,
    quality: 3,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Opzioni per le attività
  const activityOptions = [
    'Esercizio', 'Lavoro', 'Famiglia', 'Tempo libero', 
    'Studio', 'Meditazione', 'Socializzazione', 'Cura personale'
  ];
  
  // Carica i dati simulati
  useEffect(() => {
    // Simulazione chiamata API
    setTimeout(() => {
      // Dati di esempio per l'umore
      const sampleMoodData = [
        { 
          id: 1, 
          date: '2023-07-01', 
          rating: 4, 
          notes: 'Mi sono sentito energico e produttivo oggi',
          activities: ['Esercizio', 'Lavoro', 'Famiglia'] 
        },
        { 
          id: 2, 
          date: '2023-07-02', 
          rating: 2, 
          notes: 'Giornata stressante al lavoro',
          activities: ['Lavoro', 'Studio'] 
        },
        { 
          id: 3, 
          date: '2023-07-03', 
          rating: 5, 
          notes: 'Giornata fantastica! Escursione con gli amici',
          activities: ['Tempo libero', 'Socializzazione', 'Esercizio'] 
        },
        { 
          id: 4, 
          date: '2023-07-04', 
          rating: 3, 
          notes: 'Giornata nella media',
          activities: ['Lavoro', 'Famiglia'] 
        },
        { 
          id: 5, 
          date: '2023-07-05', 
          rating: 4, 
          notes: 'Ho dormito bene e avuto una giornata produttiva',
          activities: ['Lavoro', 'Meditazione', 'Cura personale'] 
        }
      ];
      
      // Dati di esempio per il sonno
      const sampleSleepData = [
        { 
          id: 1, 
          date: '2023-07-01', 
          hours: 7.5, 
          quality: 4, 
          notes: 'Mi sono svegliato riposato' 
        },
        { 
          id: 2, 
          date: '2023-07-02', 
          hours: 6, 
          quality: 2, 
          notes: 'Sonno disturbato, mi sono svegliato spesso' 
        },
        { 
          id: 3, 
          date: '2023-07-03', 
          hours: 8, 
          quality: 5, 
          notes: 'Sonno profondo e riposante' 
        },
        { 
          id: 4, 
          date: '2023-07-04', 
          hours: 7, 
          quality: 3, 
          notes: 'Sonno nella media' 
        },
        { 
          id: 5, 
          date: '2023-07-05', 
          hours: 7.5, 
          quality: 4, 
          notes: 'Buon riposo' 
        }
      ];
      
      setMoodEntries(sampleMoodData);
      setSleepEntries(sampleSleepData);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Funzione per formattare la data
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };
  
  // Funzione per ottenere l'emoji dell'umore
  const getMoodEmoji = (rating) => {
    switch (rating) {
      case 1: return '😞';
      case 2: return '😔';
      case 3: return '😐';
      case 4: return '🙂';
      case 5: return '😄';
      default: return '😐';
    }
  };
  
  // Funzione per ottenere il colore dell'umore
  const getMoodColor = (rating) => {
    switch (rating) {
      case 1: return '#ef4444';
      case 2: return '#f97316';
      case 3: return '#f59e0b';
      case 4: return '#10b981';
      case 5: return '#3b82f6';
      default: return '#f59e0b';
    }
  };
  
  // Funzione per ottenere l'emoji della qualità del sonno
  const getSleepQualityEmoji = (quality) => {
    switch (quality) {
      case 1: return '😴';
      case 2: return '🥱';
      case 3: return '😐';
      case 4: return '😌';
      case 5: return '✨';
      default: return '😐';
    }
  };
  
  // Funzione per aggiungere un nuovo inserimento dell'umore
  const handleAddMood = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: moodEntries.length + 1,
      ...newMood
    };
    
    setMoodEntries([newEntry, ...moodEntries]);
    
    // Reset del form
    setNewMood({
      rating: 3,
      notes: '',
      activities: [],
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowAddEntry(false);
  };
  
  // Funzione per aggiungere un nuovo inserimento del sonno
  const handleAddSleep = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: sleepEntries.length + 1,
      ...newSleep
    };
    
    setSleepEntries([newEntry, ...sleepEntries]);
    
    // Reset del form
    setNewSleep({
      hours: 7,
      quality: 3,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowAddEntry(false);
  };
  
  // Funzione per gestire il toggle delle attività
  const handleActivityToggle = (activity) => {
    if (newMood.activities.includes(activity)) {
      setNewMood({
        ...newMood,
        activities: newMood.activities.filter(a => a !== activity)
      });
    } else {
      setNewMood({
        ...newMood,
        activities: [...newMood.activities, activity]
      });
    }
  };
  
  // Funzione per calcolare la media dell'umore
  const calculateAverageMood = () => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, entry) => acc + entry.rating, 0);
    return (sum / moodEntries.length).toFixed(1);
  };
  
  // Funzione per calcolare la media delle ore di sonno
  const calculateAverageSleep = () => {
    if (sleepEntries.length === 0) return 0;
    const sum = sleepEntries.reduce((acc, entry) => acc + entry.hours, 0);
    return (sum / sleepEntries.length).toFixed(1);
  };
  
  // Calcolo delle statistiche
  const averageMood = calculateAverageMood();
  const averageSleep = calculateAverageSleep();

  return (
    <div className="wellness-container">
      <header className="wellness-header">
        <h1 className="page-title">Tracciamento Benessere</h1>
        <button 
          className="btn-add-entry"
          onClick={() => setShowAddEntry(true)}
        >
          <i className="fas fa-plus"></i> Aggiungi
        </button>
      </header>
      
      {/* Statistiche riepilogative */}
      <div className="wellness-stats">
        <div className="stats-card">
          <div className="stats-icon">
            <i className="fas fa-smile"></i>
          </div>
          <div className="stats-info">
            <h3>Umore Medio</h3>
            <div className="stats-value">
              {averageMood} {getMoodEmoji(Math.round(averageMood))}
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">
            <i className="fas fa-bed"></i>
          </div>
          <div className="stats-info">
            <h3>Ore di Sonno Medie</h3>
            <div className="stats-value">{averageSleep} ore</div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stats-info">
            <h3>Inserimenti Totali</h3>
            <div className="stats-value">{moodEntries.length + sleepEntries.length}</div>
          </div>
        </div>
      </div>
      
      {/* Navigazione a tab */}
      <div className="wellness-tabs">
        <button 
          className={`tab-button ${activeTab === 'mood' ? 'active' : ''}`}
          onClick={() => setActiveTab('mood')}
        >
          <i className="fas fa-smile"></i> Umore
        </button>
        <button 
          className={`tab-button ${activeTab === 'sleep' ? 'active' : ''}`}
          onClick={() => setActiveTab('sleep')}
        >
          <i className="fas fa-bed"></i> Sonno
        </button>
      </div>
      
      {/* Contenuto principale */}
      <div className="wellness-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Caricamento dati in corso...</p>
          </div>
        ) : activeTab === 'mood' ? (
          <div className="mood-content">
            {moodEntries.length > 0 ? (
              <div className="entries-list">
                {moodEntries.map(entry => (
                  <div key={entry.id} className="entry-card mood-entry">
                    <div 
                      className="entry-rating"
                      style={{ backgroundColor: getMoodColor(entry.rating) }}
                    >
                      <span className="entry-emoji">{getMoodEmoji(entry.rating)}</span>
                      <span className="rating-value">{entry.rating}/5</span>
                    </div>
                    <div className="entry-details">
                      <div className="entry-date">{formatDate(entry.date)}</div>
                      {entry.notes && <div className="entry-notes">{entry.notes}</div>}
                      {entry.activities && entry.activities.length > 0 && (
                        <div className="entry-activities">
                          {entry.activities.map(activity => (
                            <span key={activity} className="activity-tag">{activity}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-entries">
                <i className="fas fa-smile-beam"></i>
                <p>Non hai ancora registrato il tuo umore</p>
                <button 
                  className="btn-add-first"
                  onClick={() => setShowAddEntry(true)}
                >
                  Registra il tuo umore
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="sleep-content">
            {sleepEntries.length > 0 ? (
              <div className="entries-list">
                {sleepEntries.map(entry => (
                  <div key={entry.id} className="entry-card sleep-entry">
                    <div className="entry-sleep-info">
                      <div className="sleep-hours">{entry.hours} ore</div>
                      <div className="sleep-quality">
                        {getSleepQualityEmoji(entry.quality)} {entry.quality}/5
                      </div>
                    </div>
                    <div className="entry-details">
                      <div className="entry-date">{formatDate(entry.date)}</div>
                      {entry.notes && <div className="entry-notes">{entry.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-entries">
                <i className="fas fa-bed"></i>
                <p>Non hai ancora registrato il tuo sonno</p>
                <button 
                  className="btn-add-first"
                  onClick={() => setShowAddEntry(true)}
                >
                  Registra il tuo sonno
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modale per aggiungere un nuovo inserimento */}
      {showAddEntry && (
        <div className="entry-modal-overlay">
          <div className="entry-modal">
            <div className="modal-header">
              <h2>Aggiungi {activeTab === 'mood' ? 'Umore' : 'Sonno'}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowAddEntry(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content">
              {activeTab === 'mood' ? (
                <form onSubmit={handleAddMood}>
                  <div className="form-group">
                    <label>Data</label>
                    <input 
                      type="date" 
                      value={newMood.date}
                      onChange={e => setNewMood({...newMood, date: e.target.value})}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Come ti senti oggi?</label>
                    <div className="mood-selector">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <div 
                          key={rating}
                          className={`mood-option ${newMood.rating === rating ? 'selected' : ''}`}
                          onClick={() => setNewMood({...newMood, rating})}
                        >
                          <span className="mood-emoji">{getMoodEmoji(rating)}</span>
                          <span className="mood-label">
                            {rating === 1 ? 'Molto male' : 
                             rating === 2 ? 'Male' : 
                             rating === 3 ? 'Così così' : 
                             rating === 4 ? 'Bene' : 'Molto bene'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Attività svolte oggi</label>
                    <div className="activities-selector">
                      {activityOptions.map(activity => (
                        <div 
                          key={activity}
                          className={`activity-option ${newMood.activities.includes(activity) ? 'selected' : ''}`}
                          onClick={() => handleActivityToggle(activity)}
                        >
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Note (opzionale)</label>
                    <textarea 
                      value={newMood.notes}
                      onChange={e => setNewMood({...newMood, notes: e.target.value})}
                      placeholder="Scrivi qui le tue note..."
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setShowAddEntry(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn-save">
                      Salva
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddSleep}>
                  <div className="form-group">
                    <label>Data</label>
                    <input 
                      type="date" 
                      value={newSleep.date}
                      onChange={e => setNewSleep({...newSleep, date: e.target.value})}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ore di sonno</label>
                    <div className="slider-with-value">
                      <input 
                        type="range" 
                        min="0" 
                        max="12" 
                        step="0.5"
                        value={newSleep.hours}
                        onChange={e => setNewSleep({...newSleep, hours: parseFloat(e.target.value)})}
                      />
                      <span className="slider-value">{newSleep.hours} ore</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Qualità del sonno</label>
                    <div className="quality-selector">
                      {[1, 2, 3, 4, 5].map(quality => (
                        <div 
                          key={quality}
                          className={`quality-option ${newSleep.quality === quality ? 'selected' : ''}`}
                          onClick={() => setNewSleep({...newSleep, quality})}
                        >
                          <span className="quality-emoji">{getSleepQualityEmoji(quality)}</span>
                          <span className="quality-label">
                            {quality === 1 ? 'Molto scarsa' : 
                             quality === 2 ? 'Scarsa' : 
                             quality === 3 ? 'Media' : 
                             quality === 4 ? 'Buona' : 'Eccellente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Note (opzionale)</label>
                    <textarea 
                      value={newSleep.notes}
                      onChange={e => setNewSleep({...newSleep, notes: e.target.value})}
                      placeholder="Scrivi qui le tue note..."
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => setShowAddEntry(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn-save">
                      Salva
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessTracker; 