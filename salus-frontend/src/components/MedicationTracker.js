import React, { useState, useEffect } from 'react';
import '../styles/MedicationTracker.css';

const MedicationTracker = ({ userId }) => {
  // Stati per la gestione dei dati e dell'interfaccia
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form per nuovo farmaco
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    time: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    status: 'active'
  });

  // Tempi predefiniti
  const timeOptions = [
    { label: 'Mattina', value: 'morning', time: '08:00' },
    { label: 'Pranzo', value: 'lunch', time: '13:00' },
    { label: 'Cena', value: 'dinner', time: '20:00' },
    { label: 'Prima di dormire', value: 'bedtime', time: '22:00' }
  ];
  
  // Unità predefinite
  const unitOptions = ['mg', 'g', 'ml', 'compresse', 'gocce', 'unità'];
  
  // Frequenze predefinite
  const frequencyOptions = [
    { value: 'daily', label: 'Ogni giorno' },
    { value: 'twice', label: '2 volte al giorno' },
    { value: 'three-times', label: '3 volte al giorno' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' },
    { value: 'as-needed', label: 'Al bisogno' }
  ];
  
  // Stati predefiniti
  const statusOptions = [
    { value: 'active', label: 'Attivo' },
    { value: 'completed', label: 'Completato' },
    { value: 'paused', label: 'In pausa' }
  ];

  // Mock dati farmaci
  const mockMedications = [
    {
      id: 1,
      name: 'Paracetamolo',
      dosage: '1000',
      unit: 'mg',
      frequency: 'twice',
      time: ['08:00', '20:00'],
      startDate: '2023-10-15',
      endDate: '2023-11-15',
      notes: 'Prendere con acqua abbondante',
      status: 'active',
      adherence: 0.9 // 90% di aderenza
    },
    {
      id: 2,
      name: 'Vitamina D',
      dosage: '10',
      unit: 'gocce',
      frequency: 'daily',
      time: ['08:00'],
      startDate: '2023-09-01',
      endDate: '',
      notes: 'Prendere dopo colazione',
      status: 'active',
      adherence: 0.85
    },
    {
      id: 3,
      name: 'Ibuprofene',
      dosage: '600',
      unit: 'mg',
      frequency: 'as-needed',
      time: [],
      startDate: '2023-10-10',
      endDate: '2023-10-20',
      notes: 'In caso di dolore intenso',
      status: 'completed',
      adherence: 1.0
    },
    {
      id: 4,
      name: 'Probiotico',
      dosage: '1',
      unit: 'compresse',
      frequency: 'daily',
      time: ['13:00'],
      startDate: '2023-10-01',
      endDate: '2023-11-30',
      notes: 'Prendere durante i pasti',
      status: 'paused',
      adherence: 0.6
    }
  ];

  // Carica i dati all'avvio
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simula chiamata API
        setTimeout(() => {
          setMedications(mockMedications);
          setFilteredMedications(mockMedications);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Errore nel caricamento dei farmaci:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId]);

  // Filtra i farmaci quando cambiano i filtri
  useEffect(() => {
    if (!medications || !Array.isArray(medications)) return;
    
    let filtered = [...medications];
    
    // Filtra per stato
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }
    
    // Filtra per ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) || 
        m.notes.toLowerCase().includes(query)
      );
    }
    
    setFilteredMedications(filtered);
  }, [filterStatus, searchQuery, medications]);

  // Gestione del form per nuovo farmaco
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({ ...prev, [name]: value }));
  };

  // Gestione checkbox per le fasce orarie
  const handleTimeChange = (value, isChecked) => {
    if (isChecked) {
      // Aggiungi il tempo
      const timeValue = timeOptions.find(t => t.value === value).time;
      setNewMedication(prev => ({
        ...prev,
        time: [...prev.time, timeValue]
      }));
    } else {
      // Rimuovi il tempo
      const timeValue = timeOptions.find(t => t.value === value).time;
      setNewMedication(prev => ({
        ...prev,
        time: prev.time.filter(t => t !== timeValue)
      }));
    }
  };

  // Aggiungi nuovo farmaco
  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      alert('Inserisci nome e dosaggio del farmaco');
      return;
    }
    
    const newMedicationWithId = {
      ...newMedication,
      id: Date.now(),
      adherence: 1.0
    };
    
    const updatedMedications = [newMedicationWithId, ...medications];
    setMedications(updatedMedications);
    setFilteredMedications(updatedMedications);
    
    // Resetta il form
    setNewMedication({
      name: '',
      dosage: '',
      unit: 'mg',
      frequency: 'daily',
      time: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      status: 'active'
    });
    
    setIsAddModalOpen(false);
  };

  // Visualizza dettaglio farmaco
  const handleMedicationClick = (medication) => {
    setSelectedMedication(medication);
    setIsDetailModalOpen(true);
  };

  // Elimina farmaco
  const handleDeleteMedication = (id) => {
    const updatedMedications = medications.filter(m => m.id !== id);
    setMedications(updatedMedications);
    setFilteredMedications(updatedMedications);
    setIsDetailModalOpen(false);
  };

  // Cambia stato del farmaco
  const handleStatusChange = (id, newStatus) => {
    const updatedMedications = medications.map(m => 
      m.id === id ? { ...m, status: newStatus } : m
    );
    setMedications(updatedMedications);
    setFilteredMedications(updatedMedications);
    setIsDetailModalOpen(false);
  };

  // Formatta la data
  const formatDate = (dateString) => {
    if (!dateString) return 'Indefinito';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Ottieni colore in base allo stato
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'paused': return 'status-paused';
      default: return '';
    }
  };

  // Ottieni etichetta per lo stato
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Attivo';
      case 'completed': return 'Completato';
      case 'paused': return 'In pausa';
      default: return status;
    }
  };

  // Ottieni la descrizione della frequenza
  const getFrequencyLabel = (frequency) => {
    const option = frequencyOptions.find(f => f.value === frequency);
    return option ? option.label : frequency;
  };
  
  // Calcola il numero di farmaci attivi
  const getActiveMedicationsCount = () => {
    return medications && Array.isArray(medications) 
      ? medications.filter(m => m.status === 'active').length 
      : 0;
  };
  
  // Calcola l'aderenza media
  const getAverageAdherence = () => {
    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return 0;
    }
    
    const total = medications.reduce((sum, m) => sum + m.adherence, 0);
    return Math.round((total / medications.length) * 100);
  };

  if (loading) {
    return (
      <div className="medication-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Caricamento farmaci...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="medication-tracker">
      <div className="medication-header">
        <div className="medication-title">
          <h1>Gestione Farmaci</h1>
          <p>Tieni traccia dei tuoi farmaci e della loro assunzione</p>
        </div>
        <button 
          className="add-medication-button" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <i className="fas fa-plus"></i> Nuovo Farmaco
        </button>
      </div>
      
      <div className="medication-stats">
        <div className="stat-card">
          <div className="stat-value">{medications ? medications.length : 0}</div>
          <div className="stat-label">Farmaci totali</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getActiveMedicationsCount()}</div>
          <div className="stat-label">Farmaci attivi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getAverageAdherence()}%</div>
          <div className="stat-label">Aderenza media</div>
        </div>
      </div>
      
      <div className="medication-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Cerca farmaci..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tutti gli stati</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="medication-list">
        {filteredMedications && filteredMedications.length > 0 ? (
          filteredMedications.map(medication => (
            <div 
              key={medication.id} 
              className="medication-card" 
              onClick={() => handleMedicationClick(medication)}
            >
              <div className="medication-info">
                <div className="medication-name">
                  <h3>{medication.name}</h3>
                  <span className={`medication-status ${getStatusColor(medication.status)}`}>
                    {getStatusLabel(medication.status)}
                  </span>
                </div>
                <div className="medication-dosage">
                  {medication.dosage} {medication.unit} &bull; {getFrequencyLabel(medication.frequency)}
                </div>
                <div className="medication-dates">
                  <i className="far fa-calendar"></i> Dal {formatDate(medication.startDate)}
                  {medication.endDate && ` al ${formatDate(medication.endDate)}`}
                </div>
              </div>
              <div className="medication-adherence">
                <div 
                  className="adherence-circle" 
                  style={{
                    background: `conic-gradient(#4f46e5 ${medication.adherence * 360}deg, #e2e8f0 0deg)`
                  }}
                >
                  <div className="adherence-inner">
                    {Math.round(medication.adherence * 100)}%
                  </div>
                </div>
                <div className="adherence-label">Aderenza</div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-medications">
            <i className="fas fa-pills"></i>
            <p>Nessun farmaco trovato</p>
            <button 
              className="add-first-medication" 
              onClick={() => setIsAddModalOpen(true)}
            >
              Aggiungi il tuo primo farmaco
            </button>
          </div>
        )}
      </div>
      
      {/* Modal per aggiungere un farmaco */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Aggiungi nuovo farmaco</h2>
              <button className="close-button" onClick={() => setIsAddModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome del farmaco *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newMedication.name}
                    onChange={handleInputChange}
                    placeholder="Es. Paracetamolo"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Stato</label>
                  <select 
                    name="status" 
                    value={newMedication.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Dosaggio *</label>
                  <input 
                    type="text" 
                    name="dosage" 
                    value={newMedication.dosage}
                    onChange={handleInputChange}
                    placeholder="Es. 1000"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Unità</label>
                  <select 
                    name="unit" 
                    value={newMedication.unit}
                    onChange={handleInputChange}
                  >
                    {unitOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Frequenza</label>
                <select 
                  name="frequency" 
                  value={newMedication.frequency}
                  onChange={handleInputChange}
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Orari di assunzione</label>
                <div className="time-options">
                  {timeOptions.map(option => (
                    <div key={option.value} className="time-option">
                      <input 
                        type="checkbox" 
                        id={`time-${option.value}`}
                        checked={newMedication.time.includes(option.time)}
                        onChange={(e) => handleTimeChange(option.value, e.target.checked)}
                      />
                      <label htmlFor={`time-${option.value}`}>{option.label} ({option.time})</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Data inizio</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={newMedication.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Data fine (opzionale)</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={newMedication.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Note</label>
                <textarea 
                  name="notes" 
                  value={newMedication.notes}
                  onChange={handleInputChange}
                  placeholder="Informazioni aggiuntive, istruzioni speciali..."
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button" 
                onClick={() => setIsAddModalOpen(false)}
              >
                Annulla
              </button>
              <button 
                className="save-button" 
                onClick={handleAddMedication}
              >
                Salva farmaco
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal per visualizzare dettaglio */}
      {isDetailModalOpen && selectedMedication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedMedication.name}</h2>
              <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <div className="detail-label">Dosaggio:</div>
                <div className="detail-value">
                  {selectedMedication.dosage} {selectedMedication.unit}
                </div>
              </div>
              
              <div className="detail-group">
                <div className="detail-label">Frequenza:</div>
                <div className="detail-value">
                  {getFrequencyLabel(selectedMedication.frequency)}
                </div>
              </div>
              
              <div className="detail-group">
                <div className="detail-label">Stato:</div>
                <div className="detail-value">
                  <span className={getStatusColor(selectedMedication.status)}>
                    {getStatusLabel(selectedMedication.status)}
                  </span>
                </div>
              </div>
              
              <div className="detail-group">
                <div className="detail-label">Periodo:</div>
                <div className="detail-value">
                  Dal {formatDate(selectedMedication.startDate)}
                  {selectedMedication.endDate && ` al ${formatDate(selectedMedication.endDate)}`}
                </div>
              </div>
              
              {selectedMedication.time && selectedMedication.time.length > 0 && (
                <div className="detail-group">
                  <div className="detail-label">Orari:</div>
                  <div className="detail-value">
                    {selectedMedication.time.map((time, index) => (
                      <span key={index} className="time-pill">
                        <i className="far fa-clock"></i> {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedMedication.notes && (
                <div className="detail-group">
                  <div className="detail-label">Note:</div>
                  <div className="detail-value">{selectedMedication.notes}</div>
                </div>
              )}
              
              <div className="detail-group">
                <div className="detail-label">Aderenza:</div>
                <div className="detail-value adherence-detail">
                  <div 
                    className="adherence-bar"
                    style={{ width: `${selectedMedication.adherence * 100}%` }}
                  ></div>
                  <span>{Math.round(selectedMedication.adherence * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="delete-button" 
                onClick={() => handleDeleteMedication(selectedMedication.id)}
              >
                <i className="fas fa-trash"></i> Elimina
              </button>
              
              {selectedMedication.status === 'active' ? (
                <button 
                  className="status-button pause" 
                  onClick={() => handleStatusChange(selectedMedication.id, 'paused')}
                >
                  <i className="fas fa-pause"></i> Metti in pausa
                </button>
              ) : selectedMedication.status === 'paused' ? (
                <button 
                  className="status-button resume" 
                  onClick={() => handleStatusChange(selectedMedication.id, 'active')}
                >
                  <i className="fas fa-play"></i> Riprendi
                </button>
              ) : null}
              
              {selectedMedication.status !== 'completed' && (
                <button 
                  className="status-button complete" 
                  onClick={() => handleStatusChange(selectedMedication.id, 'completed')}
                >
                  <i className="fas fa-check"></i> Segna come completato
                </button>
              )}
              
              <button 
                className="close-detail-button" 
                onClick={() => setIsDetailModalOpen(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationTracker; 