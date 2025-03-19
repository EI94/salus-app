import React, { useState, useEffect } from 'react';
import '../styles/MedicationTracker.css';

const MedicationTracker = () => {
  // Stato per i farmaci
  const [medications, setMedications] = useState([]);
  // Stato per il form di inserimento
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    timeOfDay: [],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  // Stato per la modalità di visualizzazione
  const [view, setView] = useState('list'); // 'list', 'form', 'detail'
  // Stato per il farmaco selezionato per i dettagli
  const [selectedMedication, setSelectedMedication] = useState(null);
  // Stato per i promemoria delle prossime dosi
  const [reminders, setReminders] = useState([]);
  // Stato per il caricamento
  const [loading, setLoading] = useState(true);

  // Simula il caricamento dei farmaci all'avvio
  useEffect(() => {
    const fetchMedications = async () => {
      setLoading(true);
      try {
        // Simuliamo un ritardo di caricamento
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In una app reale, qui caricheremmo i dati da un'API
        // Per ora, utilizziamo dati di esempio
        const exampleMedications = [
          {
            id: '1',
            name: 'Tachipirina',
            dosage: '1000mg',
            frequency: 'daily',
            timeOfDay: ['mattina', 'sera'],
            instructions: 'Prendere a stomaco pieno',
            startDate: '2025-03-01',
            endDate: '2025-03-30',
            notes: 'Per il trattamento della febbre',
            status: 'active',
            remaining: 20,
            totalDoses: 60
          },
          {
            id: '2',
            name: 'Moment',
            dosage: '200mg',
            frequency: 'as-needed',
            timeOfDay: [],
            instructions: 'Prendere in caso di dolore',
            startDate: '2025-02-15',
            endDate: '',
            notes: 'Per il mal di testa occasionale',
            status: 'active',
            remaining: 15,
            totalDoses: 30
          },
          {
            id: '3',
            name: 'Antibiotico',
            dosage: '500mg',
            frequency: 'daily',
            timeOfDay: ['mattina', 'pomeriggio', 'sera'],
            instructions: 'Prendere prima dei pasti',
            startDate: '2025-02-20',
            endDate: '2025-02-27',
            notes: 'Completare l\'intero ciclo di trattamento',
            status: 'completed',
            remaining: 0,
            totalDoses: 21
          }
        ];

        setMedications(exampleMedications);

        // Genera promemoria di esempio
        const exampleReminders = [
          {
            id: '1',
            medicationId: '1',
            medicationName: 'Tachipirina',
            dosage: '1000mg',
            time: '08:00',
            date: new Date().toLocaleDateString(),
            status: 'pending'
          },
          {
            id: '2',
            medicationId: '1',
            medicationName: 'Tachipirina',
            dosage: '1000mg',
            time: '20:00',
            date: new Date().toLocaleDateString(),
            status: 'pending'
          },
          {
            id: '3',
            medicationId: '2',
            medicationName: 'Moment',
            dosage: '200mg',
            time: '14:00',
            date: new Date().toLocaleDateString(),
            status: 'taken'
          }
        ];

        setReminders(exampleReminders);
        setLoading(false);
      } catch (error) {
        console.error('Errore durante il caricamento dei farmaci:', error);
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  // Gestisce i cambiamenti nei campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication({
      ...newMedication,
      [name]: value
    });
  };

  // Gestisce i cambiamenti nei checkbox per l'orario
  const handleTimeOfDayChange = (time) => {
    const timeOfDay = [...newMedication.timeOfDay];
    
    if (timeOfDay.includes(time)) {
      const index = timeOfDay.indexOf(time);
      timeOfDay.splice(index, 1);
    } else {
      timeOfDay.push(time);
    }
    
    setNewMedication({
      ...newMedication,
      timeOfDay
    });
  };

  // Aggiunge un nuovo farmaco
  const handleAddMedication = (e) => {
    e.preventDefault();

    // In una app reale, salveremmo tramite API
    const newMedicationWithId = {
      ...newMedication,
      id: Date.now().toString(),
      status: 'active',
      remaining: 30, // Valore predefinito
      totalDoses: 30 // Valore predefinito
    };

    setMedications([newMedicationWithId, ...medications]);
    
    // Resetta il form
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'daily',
      timeOfDay: [],
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    });

    // Torna alla lista
    setView('list');
  };

  // Filtra i farmaci attivi
  const activeMedications = medications.filter(med => med.status === 'active');
  
  // Filtra i farmaci completati
  const completedMedications = medications.filter(med => med.status === 'completed');

  // Formatta la data per la visualizzazione
  const formatDate = (dateString) => {
    if (!dateString) return 'Non specificata';
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Converte gli orari in testo leggibile
  const formatTimeOfDay = (timeOfDay) => {
    if (!timeOfDay || timeOfDay.length === 0) return 'Non specificato';
    
    return timeOfDay.map(time => {
      switch (time) {
        case 'mattina': return 'Mattina';
        case 'pomeriggio': return 'Pomeriggio';
        case 'sera': return 'Sera';
        default: return time;
      }
    }).join(', ');
  };

  // Converte la frequenza in testo leggibile
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Ogni giorno';
      case 'weekly': return 'Ogni settimana';
      case 'monthly': return 'Ogni mese';
      case 'as-needed': return 'Al bisogno';
      default: return frequency;
    }
  };

  // Calcola la percentuale di farmaco rimanente
  const calculateRemainingPercentage = (remaining, total) => {
    if (!total) return 0;
    return (remaining / total) * 100;
  };

  // Visualizza i dettagli di un farmaco
  const viewMedicationDetails = (medication) => {
    setSelectedMedication(medication);
    setView('detail');
  };

  // Segna un promemoria come preso
  const markReminderAsTaken = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, status: 'taken' } : reminder
    ));
  };

  // Segna un promemoria come saltato
  const markReminderAsSkipped = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, status: 'skipped' } : reminder
    ));
  };
  
  // Elimina un farmaco
  const handleDeleteMedication = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo farmaco?')) {
      setMedications(medications.filter(med => med.id !== id));
      if (view === 'detail') {
        setView('list');
        setSelectedMedication(null);
      }
    }
  };

  return (
    <div className="medication-tracker-container">
      <div className="medication-tracker-header">
        <h1 className="page-title">Gestione Farmaci</h1>
        <button 
          className="btn-add-medication"
          onClick={() => setView('form')}
        >
          <i className="fas fa-plus"></i> Nuovo farmaco
        </button>
      </div>

      {view === 'list' && (
        <>
          {/* Promemoria del giorno */}
          <section className="reminders-section">
            <h2 className="section-title">
              <i className="fas fa-clock"></i> Promemoria di oggi
            </h2>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Caricamento promemoria in corso...</p>
              </div>
            ) : reminders.length === 0 ? (
              <div className="empty-reminders">
                <i className="fas fa-check-circle"></i>
                <p>Non hai promemoria per oggi</p>
              </div>
            ) : (
              <div className="reminders-list">
                {reminders.map(reminder => (
                  <div 
                    key={reminder.id} 
                    className={`reminder-card ${reminder.status}`}
                  >
                    <div className="reminder-time">{reminder.time}</div>
                    <div className="reminder-info">
                      <h3 className="reminder-medication">{reminder.medicationName}</h3>
                      <div className="reminder-dosage">{reminder.dosage}</div>
                    </div>
                    <div className="reminder-actions">
                      {reminder.status === 'pending' ? (
                        <>
                          <button
                            className="btn-take"
                            onClick={() => markReminderAsTaken(reminder.id)}
                          >
                            <i className="fas fa-check"></i> Preso
                          </button>
                          <button
                            className="btn-skip"
                            onClick={() => markReminderAsSkipped(reminder.id)}
                          >
                            <i className="fas fa-times"></i> Salta
                          </button>
                        </>
                      ) : (
                        <div className="reminder-status">
                          {reminder.status === 'taken' ? (
                            <span className="status-taken">
                              <i className="fas fa-check-circle"></i> Preso
                            </span>
                          ) : (
                            <span className="status-skipped">
                              <i className="fas fa-times-circle"></i> Saltato
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Farmaci attivi */}
          <section className="medications-section">
            <h2 className="section-title">
              <i className="fas fa-pills"></i> Farmaci attivi
            </h2>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Caricamento farmaci in corso...</p>
              </div>
            ) : activeMedications.length === 0 ? (
              <div className="empty-medications">
                <i className="fas fa-prescription-bottle"></i>
                <p>Non hai farmaci attivi al momento</p>
                <button 
                  className="btn-add-first"
                  onClick={() => setView('form')}
                >
                  Aggiungi il primo farmaco
                </button>
              </div>
            ) : (
              <div className="medications-grid">
                {activeMedications.map(medication => (
                  <div 
                    key={medication.id} 
                    className="medication-card"
                    onClick={() => viewMedicationDetails(medication)}
                  >
                    <div className="medication-header">
                      <h3 className="medication-name">{medication.name}</h3>
                      <div className="medication-dosage">{medication.dosage}</div>
                    </div>
                    
                    <div className="medication-details">
                      <div className="medication-detail">
                        <i className="fas fa-calendar-alt"></i> 
                        <span>Inizio: {formatDate(medication.startDate)}</span>
                      </div>
                      <div className="medication-detail">
                        <i className="fas fa-sync-alt"></i> 
                        <span>{formatFrequency(medication.frequency)}</span>
                      </div>
                      <div className="medication-detail">
                        <i className="fas fa-sun"></i> 
                        <span>{formatTimeOfDay(medication.timeOfDay)}</span>
                      </div>
                    </div>
                    
                    {medication.remaining !== undefined && medication.totalDoses && (
                      <div className="medication-inventory">
                        <div className="inventory-label">
                          Rimanenti: {medication.remaining} di {medication.totalDoses}
                        </div>
                        <div className="inventory-bar">
                          <div 
                            className="inventory-progress"
                            style={{
                              width: `${calculateRemainingPercentage(medication.remaining, medication.totalDoses)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Farmaci completati */}
          {completedMedications.length > 0 && (
            <section className="medications-section">
              <h2 className="section-title">
                <i className="fas fa-check-circle"></i> Farmaci completati
              </h2>
              
              <div className="medications-grid">
                {completedMedications.map(medication => (
                  <div 
                    key={medication.id} 
                    className="medication-card completed"
                    onClick={() => viewMedicationDetails(medication)}
                  >
                    <div className="medication-header">
                      <h3 className="medication-name">{medication.name}</h3>
                      <div className="medication-dosage">{medication.dosage}</div>
                    </div>
                    
                    <div className="medication-details">
                      <div className="medication-detail">
                        <i className="fas fa-calendar-alt"></i> 
                        <span>Fine: {formatDate(medication.endDate)}</span>
                      </div>
                      <div className="medication-detail">
                        <i className="fas fa-sync-alt"></i> 
                        <span>{formatFrequency(medication.frequency)}</span>
                      </div>
                      <div className="medication-detail completed-status">
                        <i className="fas fa-check-circle"></i> 
                        <span>Completato</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {view === 'form' && (
        <div className="medication-form-container">
          <div className="form-header">
            <h2>Aggiungi nuovo farmaco</h2>
            <button 
              className="btn-close"
              onClick={() => setView('list')}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleAddMedication} className="medication-form">
            <div className="form-group">
              <label htmlFor="name">Nome del farmaco*</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={newMedication.name} 
                onChange={handleInputChange}
                required
                placeholder="Es. Tachipirina"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dosage">Dosaggio*</label>
              <input 
                type="text" 
                id="dosage" 
                name="dosage" 
                value={newMedication.dosage} 
                onChange={handleInputChange}
                required
                placeholder="Es. 1000mg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequency">Frequenza*</label>
              <select 
                id="frequency" 
                name="frequency" 
                value={newMedication.frequency} 
                onChange={handleInputChange}
                required
              >
                <option value="daily">Ogni giorno</option>
                <option value="weekly">Ogni settimana</option>
                <option value="monthly">Ogni mese</option>
                <option value="as-needed">Al bisogno</option>
              </select>
            </div>

            {newMedication.frequency !== 'as-needed' && (
              <div className="form-group">
                <label>Orario del giorno</label>
                <div className="time-of-day-options">
                  <div 
                    className={`time-option ${newMedication.timeOfDay.includes('mattina') ? 'selected' : ''}`}
                    onClick={() => handleTimeOfDayChange('mattina')}
                  >
                    <i className="fas fa-sun"></i> Mattina
                  </div>
                  <div 
                    className={`time-option ${newMedication.timeOfDay.includes('pomeriggio') ? 'selected' : ''}`}
                    onClick={() => handleTimeOfDayChange('pomeriggio')}
                  >
                    <i className="fas fa-cloud-sun"></i> Pomeriggio
                  </div>
                  <div 
                    className={`time-option ${newMedication.timeOfDay.includes('sera') ? 'selected' : ''}`}
                    onClick={() => handleTimeOfDayChange('sera')}
                  >
                    <i className="fas fa-moon"></i> Sera
                  </div>
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Data di inizio*</label>
                <input 
                  type="date" 
                  id="startDate" 
                  name="startDate" 
                  value={newMedication.startDate} 
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Data di fine</label>
                <input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
                  value={newMedication.endDate} 
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Istruzioni per l'assunzione</label>
              <input 
                type="text" 
                id="instructions" 
                name="instructions" 
                value={newMedication.instructions} 
                onChange={handleInputChange}
                placeholder="Es. Prendere a stomaco pieno"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Note aggiuntive</label>
              <textarea 
                id="notes" 
                name="notes" 
                value={newMedication.notes} 
                onChange={handleInputChange}
                placeholder="Informazioni aggiuntive sul farmaco"
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setView('list')}>
                Annulla
              </button>
              <button type="submit" className="btn-save">
                Salva farmaco
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'detail' && selectedMedication && (
        <div className="medication-detail-container">
          <div className="detail-header">
            <button 
              className="btn-back"
              onClick={() => {
                setView('list');
                setSelectedMedication(null);
              }}
            >
              <i className="fas fa-arrow-left"></i> Torna alla lista
            </button>
            <div className="detail-actions">
              <button className="btn-edit">
                <i className="fas fa-edit"></i> Modifica
              </button>
              <button 
                className="btn-delete"
                onClick={() => handleDeleteMedication(selectedMedication.id)}
              >
                <i className="fas fa-trash-alt"></i> Elimina
              </button>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-main">
              <div className={`detail-status ${selectedMedication.status}`}>
                {selectedMedication.status === 'active' ? 'Attivo' : 'Completato'}
              </div>
              <h2 className="detail-name">{selectedMedication.name}</h2>
              <div className="detail-dosage">{selectedMedication.dosage}</div>
              
              <div className="detail-metadata">
                <div className="metadata-item">
                  <i className="fas fa-calendar-alt"></i> 
                  <span>Inizio: {formatDate(selectedMedication.startDate)}</span>
                </div>
                {selectedMedication.endDate && (
                  <div className="metadata-item">
                    <i className="fas fa-calendar-check"></i> 
                    <span>Fine: {formatDate(selectedMedication.endDate)}</span>
                  </div>
                )}
                <div className="metadata-item">
                  <i className="fas fa-sync-alt"></i> 
                  <span>Frequenza: {formatFrequency(selectedMedication.frequency)}</span>
                </div>
                {selectedMedication.frequency !== 'as-needed' && (
                  <div className="metadata-item">
                    <i className="fas fa-clock"></i> 
                    <span>Orario: {formatTimeOfDay(selectedMedication.timeOfDay)}</span>
                  </div>
                )}
              </div>
              
              {selectedMedication.instructions && (
                <div className="detail-instructions">
                  <h3>Istruzioni</h3>
                  <p>{selectedMedication.instructions}</p>
                </div>
              )}
              
              {selectedMedication.notes && (
                <div className="detail-notes">
                  <h3>Note</h3>
                  <p>{selectedMedication.notes}</p>
                </div>
              )}
              
              {selectedMedication.status === 'active' && selectedMedication.remaining !== undefined && (
                <div className="detail-inventory">
                  <h3>Inventario</h3>
                  <div className="inventory-detail">
                    <div className="inventory-info">
                      <div className="inventory-label">
                        Rimanenti: {selectedMedication.remaining} di {selectedMedication.totalDoses}
                      </div>
                      <div className="inventory-percentage">
                        {Math.round(calculateRemainingPercentage(selectedMedication.remaining, selectedMedication.totalDoses))}%
                      </div>
                    </div>
                    <div className="inventory-bar large">
                      <div 
                        className="inventory-progress"
                        style={{
                          width: `${calculateRemainingPercentage(selectedMedication.remaining, selectedMedication.totalDoses)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationTracker; 