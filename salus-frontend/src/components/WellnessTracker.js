// File WellnessTracker Component

import React, { useState, useEffect } from 'react';
import { saveUserData } from '../utils/dataManager';
import '../styles/WellnessTracker.css';
import { localStorageService } from '../api';
import { auth } from '../firebase/config';
import { onAuthStateChange } from '../firebase/auth';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const WellnessTracker = () => {
  const [loading, setLoading] = useState(true);
  const [wellnessData, setWellnessData] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth.currentUser);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    sleep: 7,
    stress: 5,
    energy: 5,
    notes: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Verifica lo stato di connessione
  useEffect(() => {
    const handleOnline = () => {
      console.log("Connessione online rilevata");
      setIsOnline(true);
      // Sincronizza i dati quando torniamo online
      syncOfflineData();
      // Ricarica i dati
      loadWellnessData();
    };
    
    const handleOffline = () => {
      console.log("Connessione offline rilevata");
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Monitora lo stato di autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      if (user) {
        loadWellnessData();
      } else {
        setWellnessData([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Caricamento iniziale dei dati
  useEffect(() => {
    loadWellnessData();
  }, []);

  // Carica i dati del benessere dall'utente attuale
  const loadWellnessData = async () => {
    setLoading(true);
    
    try {
      if (!auth.currentUser) {
        console.log("Nessun utente autenticato");
        setWellnessData([]);
        setLoading(false);
        return;
      }
      
      const userId = auth.currentUser.uid;
      console.log("Caricamento benessere per utente:", userId);
      
      // Tenta di caricare da Firestore
      try {
        const wellnessRef = collection(db, 'wellness');
        const q = query(
          wellnessRef, 
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const wellnessEntries = [];
        
        querySnapshot.forEach((doc) => {
          wellnessEntries.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log("Dati benessere caricati da Firestore:", wellnessEntries.length);
        
        // Aggiorna lo stato con i dati
        setWellnessData(wellnessEntries);
        
        // Salva anche in localStorage per accesso offline
        localStorageService.setItem('wellness', JSON.stringify(wellnessEntries));
      } catch (firestoreError) {
        console.error("Errore Firestore:", firestoreError);
        
        // Fallback a localStorage
        const wellnessJson = localStorageService.getItem('wellness');
        if (wellnessJson) {
          try {
            const parsedData = JSON.parse(wellnessJson);
            console.log("Dati benessere caricati da localStorage:", parsedData.length);
            setWellnessData(parsedData);
          } catch (parseError) {
            console.error("Errore parsing localStorage:", parseError);
            setWellnessData([]);
          }
        } else {
          console.log("Nessun dato benessere trovato in localStorage");
          setWellnessData([]);
        }
      }
    } catch (error) {
      console.error("Errore caricamento dati benessere:", error);
      setWellnessData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Sincronizza i dati offline quando torniamo online
  const syncOfflineData = async () => {
    if (!isOnline || !auth.currentUser) return;
    
    const offlineData = localStorageService.getItem('wellness_offline');
    if (!offlineData) return;
    
    try {
      const entries = JSON.parse(offlineData);
      console.log("Sincronizzazione di", entries.length, "voci offline");
      
      for (const entry of entries) {
        try {
          // Rimuovi il flag isLocalOnly prima di salvare
          const { isLocalOnly, ...dataToSave } = entry;
          
          await addDoc(collection(db, 'wellness'), {
            ...dataToSave,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          console.log("Voce sincronizzata con successo:", entry.date);
        } catch (error) {
          console.error("Errore sincronizzazione voce:", error);
        }
      }
      
      // Pulisci dati offline dopo sincronizzazione
      localStorageService.removeItem('wellness_offline');
      
      // Ricarica dati aggiornati
      await loadWellnessData();
      
      console.log("Sincronizzazione completata");
    } catch (error) {
      console.error("Errore di sincronizzazione:", error);
    }
  };

  // Gestione dell'invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('È necessario effettuare l\'accesso per registrare il benessere');
      return;
    }
    
    try {
      const wellnessEntry = {
        ...formData,
        mood: parseInt(formData.mood) || 5,
        sleep: parseInt(formData.sleep) || 7,
        stress: parseInt(formData.stress) || 5,
        energy: parseInt(formData.energy) || 5,
        date: formData.date || new Date().toISOString().split('T')[0]
      };
      
      console.log("Salvataggio voce benessere:", wellnessEntry);
      
      // Se online, salva direttamente in Firestore
      if (isOnline) {
        try {
          const docRef = await addDoc(collection(db, 'wellness'), {
            ...wellnessEntry,
            userId: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          console.log("Voce benessere salvata con ID:", docRef.id);
          
          // Recupera il documento appena creato
          const newDocSnapshot = await getDoc(doc(db, 'wellness', docRef.id));
          if (newDocSnapshot.exists()) {
            const newEntry = {
              id: docRef.id,
              ...newDocSnapshot.data()
            };
            
            // Aggiorna lo stato
            setWellnessData(prev => [newEntry, ...prev]);
            
            // Aggiorna anche localStorage
            const storedData = localStorageService.getItem('wellness');
            let updatedData = [newEntry];
            
            if (storedData) {
              try {
                const parsedData = JSON.parse(storedData);
                updatedData = [newEntry, ...parsedData];
              } catch (e) {
                console.error("Errore parsing localStorage:", e);
              }
            }
            
            localStorageService.setItem('wellness', JSON.stringify(updatedData));
          }
          
          // Mostra conferma
          alert("Registrazione benessere completata con successo!");
        } catch (firestoreError) {
          console.error("Errore salvataggio Firestore:", firestoreError);
          throw firestoreError;
        }
      } else {
        // Se offline, salva in localStorage per sincronizzazione futura
        const entryWithMeta = {
          ...wellnessEntry,
          id: `local_${Date.now()}`,
          userId: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
          isLocalOnly: true
        };
        
        // Aggiorna lo stato
        setWellnessData(prev => [entryWithMeta, ...prev]);
        
        // Aggiorna localStorage corrente
        const storedData = localStorageService.getItem('wellness');
        let updatedData = [entryWithMeta];
        
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            updatedData = [entryWithMeta, ...parsedData];
          } catch (e) {
            console.error("Errore parsing localStorage:", e);
          }
        }
        
        localStorageService.setItem('wellness', JSON.stringify(updatedData));
        
        // Salva in coda offline
        const offlineData = localStorageService.getItem('wellness_offline');
        let offlineEntries = [];
        
        if (offlineData) {
          try {
            offlineEntries = JSON.parse(offlineData);
          } catch (e) {
            console.error("Errore parsing offline data:", e);
          }
        }
        
        offlineEntries.push(entryWithMeta);
        localStorageService.setItem('wellness_offline', JSON.stringify(offlineEntries));
        
        console.log("Voce benessere salvata offline per sincronizzazione futura");
        alert("Registrazione salvata offline. Sarà sincronizzata automaticamente quando sarai online.");
      }
      
      // Resetta il form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mood: 5,
        sleep: 7,
        stress: 5,
        energy: 5,
        notes: '',
      });
      
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert("Si è verificato un errore durante il salvataggio. Riprova.");
    }
  };

  // Gestione del cambio di input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Genera gli ultimi 7 giorni per il grafico
  const generateLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Filtra i dati per gli ultimi 7 giorni
  const getLast7DaysData = () => {
    const last7Days = generateLast7Days();
    const dataMap = {};
    
    // Inizializza con valori vuoti
    last7Days.forEach(date => {
      dataMap[date] = null;
    });
    
    // Popola con dati disponibili
    wellnessData.forEach(entry => {
      if (last7Days.includes(entry.date)) {
        dataMap[entry.date] = entry;
      }
    });
    
    return Object.entries(dataMap).map(([date, entry]) => ({
      date,
      entry
    }));
  };

  // Componente per stato vuoto
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-illustration">
        <i className="fas fa-chart-line" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Nessun dato benessere</h2>
      <p>Inizia a registrare il tuo benessere per monitorare i tuoi progressi</p>
      <p className="suggestion">Compila il form qui sotto per registrare il tuo primo dato</p>
    </div>
  );

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
          <h1>Benessere</h1>
          <p>Monitora il tuo benessere fisico e mentale {!isOnline ? '(Modalità offline)' : ''}</p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      
      {/* Login required */}
      {!isAuthenticated ? (
        <div className="login-required">
          <div className="login-illustration">
            <i className="fas fa-user-lock" style={{ fontSize: '100px', color: 'var(--primary-color-light)' }}></i>
          </div>
          <h2>Accesso richiesto</h2>
          <p>Effettua l'accesso per visualizzare e registrare il tuo benessere</p>
          <a href="/login" className="login-button">Accedi ora</a>
        </div>
      ) : (
        <>
          {/* Grafico ultimi 7 giorni */}
          <div className="wellness-chart-section">
            <h2>Ultimi 7 giorni</h2>
            
            {wellnessData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="wellness-chart">
                <div className="days-grid">
                  {getLast7DaysData().map(({ date, entry }) => (
                    <div key={date} className="day-column">
                      <div className="day-label">
                        {new Date(date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' })}
                      </div>
                      {entry ? (
                        <div className={`day-data ${entry.isLocalOnly ? 'local-only' : ''}`}>
                          {entry.isLocalOnly && (
                            <div className="sync-badge" title="Salvato localmente">
                              <i className="fas fa-cloud-upload-alt"></i>
                            </div>
                          )}
                          <div 
                            className="mood-indicator" 
                            style={{ 
                              background: getMoodColor(entry.mood),
                              height: `${(entry.mood / 10) * 100}%` 
                            }}
                            title={`Umore: ${entry.mood}/10`}
                          ></div>
                          <div className="mood-label">{entry.mood}</div>
                        </div>
                      ) : (
                        <div className="day-data empty">
                          <div className="empty-indicator"></div>
                          <div className="empty-label">-</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Form registrazione benessere */}
          <div className="wellness-form-section">
            <h2>Registra il tuo benessere</h2>
            <form onSubmit={handleSubmit} className="wellness-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Data</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group slider-group">
                  <label>Umore: {formData.mood}/10</label>
                  <input
                    type="range"
                    name="mood"
                    min="1"
                    max="10"
                    value={formData.mood}
                    onChange={handleInputChange}
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group slider-group">
                  <label>Qualità del sonno: {formData.sleep}/10</label>
                  <input
                    type="range"
                    name="sleep"
                    min="1"
                    max="10"
                    value={formData.sleep}
                    onChange={handleInputChange}
                  />
                  <div className="range-labels">
                    <span>Scarsa</span>
                    <span>Ottima</span>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group slider-group">
                  <label>Livello di stress: {formData.stress}/10</label>
                  <input
                    type="range"
                    name="stress"
                    min="1"
                    max="10"
                    value={formData.stress}
                    onChange={handleInputChange}
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group slider-group">
                  <label>Livello di energia: {formData.energy}/10</label>
                  <input
                    type="range"
                    name="energy"
                    min="1"
                    max="10"
                    value={formData.energy}
                    onChange={handleInputChange}
                  />
                  <div className="range-labels">
                    <span>Basso</span>
                    <span>Alto</span>
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Aggiungi note sul tuo benessere di oggi..."
                  ></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <div>
                  <span style={{fontSize: '12px', color: isOnline ? 'green' : 'orange'}}>
                    {isOnline 
                      ? 'Salvataggio su cloud' 
                      : 'Salvataggio offline (sincronizzazione automatica)'}
                  </span>
                </div>
                <button type="submit" className="submit-button">
                  Registra benessere
                </button>
              </div>
            </form>
          </div>
          
          {/* Lista cronologica */}
          {wellnessData.length > 0 && (
            <div className="wellness-history-section">
              <h2>Cronologia</h2>
              <div className="wellness-history">
                {wellnessData.map(entry => (
                  <div key={entry.id} className={`history-card ${entry.isLocalOnly ? 'local-only' : ''}`}>
                    {entry.isLocalOnly && (
                      <div className="sync-badge" title="Salvato localmente, in attesa di sincronizzazione">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                    )}
                    <div className="history-date">
                      {new Date(entry.date).toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="history-metrics">
                      <div className="metric">
                        <div className="metric-label">Umore</div>
                        <div className="metric-value" style={{ color: getMoodColor(entry.mood) }}>
                          {entry.mood}/10
                        </div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Sonno</div>
                        <div className="metric-value">{entry.sleep}/10</div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Stress</div>
                        <div className="metric-value">{entry.stress}/10</div>
                      </div>
                      <div className="metric">
                        <div className="metric-label">Energia</div>
                        <div className="metric-value">{entry.energy}/10</div>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="history-notes">
                        <div className="notes-label">Note:</div>
                        <div className="notes-content">{entry.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WellnessTracker;
