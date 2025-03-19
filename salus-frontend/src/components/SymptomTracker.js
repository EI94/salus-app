import React, { useState, useEffect } from 'react';
import '../styles/SymptomTracker.css';

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Nuovo sintomo
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    intensity: 3,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: '',
    triggers: [],
    medication: ''
  });
  
  // Opzioni per i trigger
  const triggerOptions = [
    'Stress', 'Alimentazione', 'Attività fisica', 'Sonno', 
    'Meteo', 'Postura', 'Allergie', 'Altro'
  ];

  // Fetch dei sintomi (simulato)
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        // Simulazione di una chiamata API con dati di esempio
        setTimeout(() => {
          const exampleSymptoms = [
            {
              id: 1,
              name: 'Mal di testa',
              intensity: 4,
              date: '2023-07-05',
              time: '09:30',
              notes: 'Dolore pulsante alla tempia destra',
              triggers: ['Stress', 'Sonno'],
              medication: 'Paracetamolo 500mg'
            },
            {
              id: 2,
              name: 'Dolore lombare',
              intensity: 3,
              date: '2023-07-04',
              time: '15:45',
              notes: 'Dolorante dopo essere stato seduto a lungo',
              triggers: ['Postura', 'Attività fisica'],
              medication: 'Ibuprofene 400mg'
            },
            {
              id: 3,
              name: 'Mal di stomaco',
              intensity: 2,
              date: '2023-07-03',
              time: '20:15',
              notes: 'Dopo aver mangiato cibi piccanti',
              triggers: ['Alimentazione'],
              medication: ''
            },
            {
              id: 4,
              name: 'Affaticamento',
              intensity: 3,
              date: '2023-07-02',
              time: '14:00',
              notes: 'Sensazione di stanchezza generale',
              triggers: ['Stress', 'Sonno'],
              medication: ''
            },
            {
              id: 5,
              name: 'Mal di schiena',
              intensity: 4,
              date: '2023-07-01',
              time: '08:45',
              notes: 'Difficoltà a piegarsi',
              triggers: ['Postura', 'Attività fisica'],
              medication: 'Ibuprofene 400mg'
            }
          ];
          
          setSymptoms(exampleSymptoms);
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Errore nel caricamento dei sintomi: ' + err.message);
        setLoading(false);
        console.error('Errore nel caricamento dei sintomi:', err);
      }
    };

    fetchSymptoms();
  }, []);

  // Aggiunta di un nuovo sintomo
  const handleAddSymptom = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: Date.now(), // Genera un ID temporaneo
      ...newSymptom
    };
    
    setSymptoms([newEntry, ...symptoms]);
    
    // Reset del form
    setNewSymptom({
      name: '',
      intensity: 3,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: '',
      triggers: [],
      medication: ''
    });
    
    setShowForm(false);
  };
  
  // Gestione dei toggle per i triggers
  const handleTriggerToggle = (trigger) => {
    if (newSymptom.triggers.includes(trigger)) {
      setNewSymptom({
        ...newSymptom,
        triggers: newSymptom.triggers.filter(t => t !== trigger)
      });
    } else {
      setNewSymptom({
        ...newSymptom,
        triggers: [...newSymptom.triggers, trigger]
      });
    }
  };
  
  // Filtraggio dei sintomi
  const getFilteredSymptoms = () => {
    if (!Array.isArray(symptoms)) {
      return [];
    }
    
    if (activeFilter === 'all') {
      return symptoms;
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.date);
      if (activeFilter === 'today') {
        return symptomDate >= today;
      } else if (activeFilter === 'week') {
        return symptomDate >= oneWeekAgo;
      } else if (activeFilter === 'month') {
        return symptomDate >= oneMonthAgo;
      }
      return true;
    });
  };
  
  // Funzione per ottenere il colore dell'intensità
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
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };
  
  const filteredSymptoms = getFilteredSymptoms();

  return (
    <div className="symptom-tracker-container">
      <header className="symptom-header">
        <h1 className="page-title">Tracciamento Sintomi</h1>
        <button 
          className="btn-add-symptom"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i> Aggiungi Sintomo
        </button>
      </header>
      
      {/* Filtri */}
      <div className="filter-container">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tutti
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setActiveFilter('today')}
          >
            Oggi
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setActiveFilter('week')}
          >
            Ultimi 7 giorni
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setActiveFilter('month')}
          >
            Ultimo mese
          </button>
        </div>
      </div>
      
      {/* Contenuto principale */}
      <div className="symptoms-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Caricamento sintomi in corso...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        ) : filteredSymptoms.length > 0 ? (
          <div className="symptoms-list">
            {filteredSymptoms.map(symptom => (
              <div key={symptom.id} className="symptom-card">
                <div 
                  className="symptom-intensity"
                  style={{ backgroundColor: getIntensityColor(symptom.intensity) }}
                >
                  <span className="intensity-value">{symptom.intensity}</span>
                  <span className="intensity-label">/ 5</span>
                </div>
                
                <div className="symptom-info">
                  <div className="symptom-name">{symptom.name}</div>
                  <div className="symptom-time">
                    <i className="far fa-calendar"></i> {formatDate(symptom.date)}
                    <span className="time-separator">·</span>
                    <i className="far fa-clock"></i> {symptom.time}
                  </div>
                  
                  {symptom.notes && (
                    <div className="symptom-notes">{symptom.notes}</div>
                  )}
                  
                  {symptom.triggers && symptom.triggers.length > 0 && (
                    <div className="symptom-triggers">
                      {symptom.triggers.map(trigger => (
                        <span key={trigger} className="trigger-tag">{trigger}</span>
                      ))}
                    </div>
                  )}
                  
                  {symptom.medication && (
                    <div className="symptom-medication">
                      <i className="fas fa-pills"></i> {symptom.medication}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-symptoms">
            <i className="fas fa-file-medical-alt"></i>
            <p>Nessun sintomo registrato{activeFilter !== 'all' ? ' in questo periodo' : ''}</p>
            <button 
              className="btn-add-first"
              onClick={() => setShowForm(true)}
            >
              Registra il tuo primo sintomo
            </button>
          </div>
        )}
      </div>
      
      {/* Modale per aggiungere un nuovo sintomo */}
      {showForm && (
        <div className="symptom-modal-overlay">
          <div className="symptom-modal">
            <div className="modal-header">
              <h2>Aggiungi Sintomo</h2>
              <button 
                className="btn-close"
                onClick={() => setShowForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-content">
              <form onSubmit={handleAddSymptom}>
                <div className="form-group">
                  <label>Nome del sintomo</label>
                  <input 
                    type="text" 
                    value={newSymptom.name}
                    onChange={e => setNewSymptom({...newSymptom, name: e.target.value})}
                    placeholder="Es. Mal di testa, dolore lombare, ecc."
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Data</label>
                    <input 
                      type="date" 
                      value={newSymptom.date}
                      onChange={e => setNewSymptom({...newSymptom, date: e.target.value})}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ora</label>
                    <input 
                      type="time" 
                      value={newSymptom.time}
                      onChange={e => setNewSymptom({...newSymptom, time: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Intensità (1-5)</label>
                  <div className="intensity-selector">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div 
                        key={level}
                        className={`intensity-option ${newSymptom.intensity === level ? 'selected' : ''}`}
                        style={{ backgroundColor: getIntensityColor(level) }}
                        onClick={() => setNewSymptom({...newSymptom, intensity: level})}
                      >
                        <span className="intensity-number">{level}</span>
                        <span className="intensity-desc">
                          {level === 1 ? 'Molto lieve' : 
                           level === 2 ? 'Lieve' : 
                           level === 3 ? 'Moderato' : 
                           level === 4 ? 'Forte' : 'Molto forte'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Fattori scatenanti</label>
                  <div className="triggers-selector">
                    {triggerOptions.map(trigger => (
                      <div 
                        key={trigger}
                        className={`trigger-option ${newSymptom.triggers.includes(trigger) ? 'selected' : ''}`}
                        onClick={() => handleTriggerToggle(trigger)}
                      >
                        {trigger}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Farmaco (opzionale)</label>
                  <input 
                    type="text" 
                    value={newSymptom.medication}
                    onChange={e => setNewSymptom({...newSymptom, medication: e.target.value})}
                    placeholder="Es. Paracetamolo 500mg"
                  />
                </div>
                
                <div className="form-group">
                  <label>Note (opzionale)</label>
                  <textarea 
                    value={newSymptom.notes}
                    onChange={e => setNewSymptom({...newSymptom, notes: e.target.value})}
                    placeholder="Aggiungi dettagli sul sintomo..."
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    Annulla
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save"
                    disabled={!newSymptom.name}
                  >
                    Salva
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomTracker; 