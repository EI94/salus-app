import React, { useState, useEffect } from 'react';
import '../styles/MedicationTracker.css';

const MedicationTracker = () => {
  // Stati per i medicinali e la UI
  const [medications, setMedications] = useState([]);
  const [activeMedications, setActiveMedications] = useState([]);
  const [completedMedications, setCompletedMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('active'); // 'active' o 'completed'
  
  // Stato per le notifiche e promemoria
  const [reminders, setReminders] = useState([]);
  
  // Stato per il form di nuovo medicinale
  const [showForm, setShowForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    timeOfDay: '08:00',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    remainingDoses: '',
    totalDoses: ''
  });
  
  // Stato per il medicinale selezionato per i dettagli
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Caricamento dei dati (simulato per l'esempio)
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        console.log("Modalità demo: uso dati di esempio per i farmaci");
        
        // Simula un ritardo di caricamento
        setTimeout(() => {
          // Dati di esempio
          const medicationData = [
            {
              id: 1,
              name: 'Paracetamolo',
              dosage: '500mg',
              frequency: 'daily',
              timeOfDay: '08:00',
              startDate: '2023-06-01',
              endDate: '2023-08-01',
              notes: 'Prendere a stomaco pieno',
              remainingDoses: 12,
              totalDoses: 60,
              isActive: true,
              lastTaken: '2023-07-14'
            },
            {
              id: 2,
              name: 'Ibuprofene',
              dosage: '400mg',
              frequency: 'as_needed',
              timeOfDay: '',
              startDate: '2023-05-15',
              endDate: '',
              notes: 'Per dolori articolari',
              remainingDoses: 8,
              totalDoses: 30,
              isActive: true,
              lastTaken: '2023-07-10'
            },
            {
              id: 3,
              name: 'Vitamina D',
              dosage: '1000 UI',
              frequency: 'weekly',
              timeOfDay: '10:00',
              startDate: '2023-01-01',
              endDate: '2023-06-30',
              notes: 'Prendere con un pasto',
              remainingDoses: 0,
              totalDoses: 26,
              isActive: false,
              lastTaken: '2023-06-25'
            }
          ];
          
          setMedications(medicationData);
          
          // Filtra medicinali attivi e completati
          updateMedicationLists(medicationData);
          
          // Simula promemoria
          const reminderData = [
            {
              id: 1,
              medicationId: 1,
              time: '08:00',
              taken: false,
              date: new Date().toISOString().split('T')[0]
            },
            {
              id: 2,
              medicationId: 2,
              time: '20:00',
              taken: false,
              date: new Date().toISOString().split('T')[0]
            }
          ];
          
          setReminders(reminderData);
          setLoading(false);
        }, 1500);
      } catch (err) {
        console.error('Errore nel caricamento dei medicinali:', err);
        setError('Errore nel caricamento dei medicinali: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchMedications();
  }, []);
  
  // Funzione per aggiornare le liste di medicinali attivi e completati
  const updateMedicationLists = (allMeds) => {
    // Verifica che allMeds sia un array
    if (!Array.isArray(allMeds)) {
      console.error("Errore nel caricamento dei medicinali attivi: dati non in formato array");
      setActiveMedications([]);
      setCompletedMedications([]);
      return;
    }
    
    // Filtra i medicinali attivi e completati
    const active = allMeds.filter(med => med.isActive);
    const completed = allMeds.filter(med => !med.isActive);
    
    setActiveMedications(active);
    setCompletedMedications(completed);
  };
  
  // Gestione dell'aggiunta di un nuovo medicinale
  const handleAddMedication = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: Date.now(),
      ...newMedication,
      isActive: true,
      lastTaken: new Date().toISOString().split('T')[0]
    };
    
    // Aggiorna tutti i medicinali
    const updatedMedications = [...medications, newEntry];
    setMedications(updatedMedications);
    
    // Aggiorna le liste
    updateMedicationLists(updatedMedications);
    
    // Reset del form
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'daily',
      timeOfDay: '08:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      remainingDoses: '',
      totalDoses: ''
    });
    
    setShowForm(false);
  };
  
  // Segna un medicinale come assunto
  const markAsTaken = (medicationId) => {
    // Trova il medicinale e aggiorna lo stato
    const updatedMedications = medications.map(med => {
      if (med.id === medicationId) {
        const remaining = med.remainingDoses > 0 ? med.remainingDoses - 1 : 0;
        
        // Se le dosi sono finite, segna come completato
        const isActive = remaining > 0;
        
        return {
          ...med,
          remainingDoses: remaining,
          isActive,
          lastTaken: new Date().toISOString().split('T')[0]
        };
      }
      return med;
    });
    
    setMedications(updatedMedications);
    updateMedicationLists(updatedMedications);
    
    // Aggiorna anche i promemoria
    const updatedReminders = reminders.map(reminder => {
      if (reminder.medicationId === medicationId) {
        return { ...reminder, taken: true };
      }
      return reminder;
    });
    
    setReminders(updatedReminders);
  };
  
  // Visualizza dettagli di un medicinale
  const viewMedicationDetails = (medication) => {
    setSelectedMedication(medication);
    setShowDetails(true);
  };
  
  // Calcola la percentuale di dosi rimanenti
  const calculateRemainingPercentage = (remaining, total) => {
    if (!total || total <= 0) return 0;
    const percentage = (remaining / total) * 100;
    return Math.max(0, Math.min(100, percentage));
  };
  
  // Formatta la data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };
  
  // Ottiene il testo della frequenza in italiano
  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Ogni giorno';
      case 'twice_daily': return 'Due volte al giorno';
      case 'weekly': return 'Settimanale';
      case 'monthly': return 'Mensile';
      case 'as_needed': return 'Al bisogno';
      default: return frequency;
    }
  };

  return (
    <div className="medication-tracker">
      <header className="medication-header">
        <h1>Gestione Farmaci</h1>
        <button 
          className="btn-add-medication"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i> Aggiungi Farmaco
        </button>
      </header>
      
      {/* Sezione Promemoria */}
      {reminders && reminders.length > 0 && (
        <div className="reminders-section">
          <h2>Promemoria di oggi</h2>
          <div className="reminders-container">
            {reminders.map(reminder => {
              const medication = medications.find(med => med.id === reminder.medicationId);
              
              return medication ? (
                <div key={reminder.id} className={`reminder-card ${reminder.taken ? 'taken' : ''}`}>
                  <div className="reminder-time">{reminder.time}</div>
                  <div className="reminder-details">
                    <h3>{medication.name} ({medication.dosage})</h3>
                    <p>{getFrequencyText(medication.frequency)}</p>
                  </div>
                  <button 
                    className={`reminder-action ${reminder.taken ? 'disabled' : ''}`}
                    onClick={() => markAsTaken(medication.id)}
                    disabled={reminder.taken}
                  >
                    {reminder.taken ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <i className="fas fa-check-circle"></i>
                    )}
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
      
      {/* Tabs per medicinali attivi/completati */}
      <div className="medication-tabs">
        <button 
          className={`tab-button ${activeView === 'active' ? 'active' : ''}`}
          onClick={() => setActiveView('active')}
        >
          Attivi ({activeMedications ? activeMedications.length : 0})
        </button>
        <button 
          className={`tab-button ${activeView === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveView('completed')}
        >
          Completati ({completedMedications ? completedMedications.length : 0})
        </button>
      </div>
      
      {/* Contenuto principale */}
      <div className="medications-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Caricamento farmaci in corso...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        ) : activeView === 'active' ? (
          // Visualizzazione medicinali attivi
          <div className="medications-grid">
            {Array.isArray(activeMedications) && activeMedications.length > 0 ? (
              activeMedications.map(medication => (
                <div key={medication.id} className="medication-card">
                  <div className="medication-header">
                    <h3>{medication.name}</h3>
                    <div className="medication-dosage">{medication.dosage}</div>
                  </div>
                  
                  <div className="medication-info">
                    <div className="info-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{getFrequencyText(medication.frequency)}</span>
                    </div>
                    {medication.timeOfDay && (
                      <div className="info-item">
                        <i className="fas fa-clock"></i>
                        <span>{medication.timeOfDay}</span>
                      </div>
                    )}
                  </div>
                  
                  {(medication.remainingDoses > 0 && medication.totalDoses > 0) && (
                    <div className="medication-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${calculateRemainingPercentage(medication.remainingDoses, medication.totalDoses)}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {medication.remainingDoses} di {medication.totalDoses} dosi rimaste
                      </div>
                    </div>
                  )}
                  
                  <div className="medication-actions">
                    <button 
                      className="action-button detail"
                      onClick={() => viewMedicationDetails(medication)}
                    >
                      <i className="fas fa-info-circle"></i>
                    </button>
                    <button 
                      className="action-button take"
                      onClick={() => markAsTaken(medication.id)}
                    >
                      <i className="fas fa-check"></i> Prendi
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-prescription-bottle-alt"></i>
                <p>Non hai farmaci attivi</p>
                <button 
                  className="btn-add"
                  onClick={() => setShowForm(true)}
                >
                  Aggiungi un farmaco
                </button>
              </div>
            )}
          </div>
        ) : (
          // Visualizzazione medicinali completati
          <div className="medications-grid">
            {Array.isArray(completedMedications) && completedMedications.length > 0 ? (
              completedMedications.map(medication => (
                <div key={medication.id} className="medication-card completed">
                  <div className="medication-header">
                    <h3>{medication.name}</h3>
                    <div className="medication-dosage">{medication.dosage}</div>
                    <div className="completed-badge">Completato</div>
                  </div>
                  
                  <div className="medication-info">
                    <div className="info-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>Ultima dose: {formatDate(medication.lastTaken)}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Periodo: {formatDate(medication.startDate)} - {medication.endDate ? formatDate(medication.endDate) : 'Indefinito'}</span>
                    </div>
                  </div>
                  
                  <div className="medication-actions">
                    <button 
                      className="action-button detail"
                      onClick={() => viewMedicationDetails(medication)}
                    >
                      <i className="fas fa-info-circle"></i> Dettagli
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-clipboard-check"></i>
                <p>Non hai farmaci completati</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal per aggiungere un nuovo medicinale */}
      {showForm && (
        <div className="modal-overlay">
          <div className="medication-modal">
            <div className="modal-header">
              <h2>Aggiungi Farmaco</h2>
              <button 
                className="close-modal"
                onClick={() => setShowForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleAddMedication}>
                <div className="form-group">
                  <label htmlFor="medication-name">Nome del farmaco *</label>
                  <input 
                    id="medication-name"
                    type="text" 
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    placeholder="Es. Paracetamolo"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="medication-dosage">Dosaggio *</label>
                  <input 
                    id="medication-dosage"
                    type="text" 
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    placeholder="Es. 500mg"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medication-frequency">Frequenza *</label>
                    <select 
                      id="medication-frequency"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                    >
                      <option value="daily">Ogni giorno</option>
                      <option value="twice_daily">Due volte al giorno</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                      <option value="as_needed">Al bisogno</option>
                    </select>
                  </div>
                  
                  {newMedication.frequency !== 'as_needed' && (
                    <div className="form-group">
                      <label htmlFor="medication-time">Orario</label>
                      <input 
                        id="medication-time"
                        type="time" 
                        value={newMedication.timeOfDay}
                        onChange={(e) => setNewMedication({...newMedication, timeOfDay: e.target.value})}
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medication-start">Data inizio *</label>
                    <input 
                      id="medication-start"
                      type="date" 
                      value={newMedication.startDate}
                      onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medication-end">Data fine (opzionale)</label>
                    <input 
                      id="medication-end"
                      type="date" 
                      value={newMedication.endDate}
                      onChange={(e) => setNewMedication({...newMedication, endDate: e.target.value})}
                      min={newMedication.startDate}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medication-remaining">Dosi rimanenti</label>
                    <input 
                      id="medication-remaining"
                      type="number" 
                      value={newMedication.remainingDoses}
                      onChange={(e) => setNewMedication({...newMedication, remainingDoses: e.target.value})}
                      placeholder="Es. 30"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="medication-total">Dosi totali</label>
                    <input 
                      id="medication-total"
                      type="number" 
                      value={newMedication.totalDoses}
                      onChange={(e) => setNewMedication({...newMedication, totalDoses: e.target.value})}
                      placeholder="Es. 30"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="medication-notes">Note (opzionale)</label>
                  <textarea 
                    id="medication-notes"
                    value={newMedication.notes}
                    onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                    placeholder="Aggiungi dettagli o istruzioni..."
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
                    disabled={!newMedication.name || !newMedication.dosage}
                  >
                    Salva
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal di dettaglio del medicinale */}
      {showDetails && selectedMedication && (
        <div className="modal-overlay">
          <div className="medication-modal">
            <div className="modal-header">
              <h2>Dettagli Farmaco</h2>
              <button 
                className="close-modal"
                onClick={() => setShowDetails(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="medication-detail-card">
                <h3>{selectedMedication.name}</h3>
                <div className="detail-item">
                  <span className="detail-label">Dosaggio:</span>
                  <span className="detail-value">{selectedMedication.dosage}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Frequenza:</span>
                  <span className="detail-value">{getFrequencyText(selectedMedication.frequency)}</span>
                </div>
                {selectedMedication.timeOfDay && (
                  <div className="detail-item">
                    <span className="detail-label">Orario:</span>
                    <span className="detail-value">{selectedMedication.timeOfDay}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Data inizio:</span>
                  <span className="detail-value">{formatDate(selectedMedication.startDate)}</span>
                </div>
                {selectedMedication.endDate && (
                  <div className="detail-item">
                    <span className="detail-label">Data fine:</span>
                    <span className="detail-value">{formatDate(selectedMedication.endDate)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Ultima assunzione:</span>
                  <span className="detail-value">{formatDate(selectedMedication.lastTaken)}</span>
                </div>
                {selectedMedication.remainingDoses > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Dosi rimanenti:</span>
                    <span className="detail-value">{selectedMedication.remainingDoses} di {selectedMedication.totalDoses}</span>
                  </div>
                )}
                {selectedMedication.notes && (
                  <div className="detail-notes">
                    <span className="detail-label">Note:</span>
                    <p>{selectedMedication.notes}</p>
                  </div>
                )}
                
                <div className="detail-actions">
                  {selectedMedication.isActive && (
                    <button 
                      className="btn-take"
                      onClick={() => {
                        markAsTaken(selectedMedication.id);
                        setShowDetails(false);
                      }}
                    >
                      <i className="fas fa-check"></i> Segna come assunto
                    </button>
                  )}
                  <button 
                    className="btn-close"
                    onClick={() => setShowDetails(false)}
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationTracker; 