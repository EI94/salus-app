import React, { useState, useEffect } from 'react';
import '../styles/MedicationTracker.css';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const MedicationTracker = ({ userId }) => {
  // Stati e hooks
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  
  // Form per nuovo farmaco
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    unit: 'mg',
    time: '',
    notes: '',
    status: 'active'
  });
  
  // Opzioni per i form
  const timeOptions = [
    { label: 'Mattina', value: 'morning', time: '08:00' },
    { label: 'Pranzo', value: 'lunch', time: '13:00' },
    { label: 'Cena', value: 'dinner', time: '20:00' },
    { label: 'Prima di dormire', value: 'bedtime', time: '22:00' }
  ];
  
  const unitOptions = ['mg', 'g', 'ml', 'compresse', 'gocce', 'unità'];
  
  const frequencyOptions = [
    { value: 'daily', label: 'Ogni giorno' },
    { value: 'twice', label: '2 volte al giorno' },
    { value: 'three-times', label: '3 volte al giorno' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' },
    { value: 'as-needed', label: 'Al bisogno' }
  ];
  
  const statusOptions = [
    { value: 'active', label: 'Attivo' },
    { value: 'completed', label: 'Completato' },
    { value: 'paused', label: 'In pausa' }
  ];

  // Funzioni per la modale
  const openAddModal = () => {
    console.log("APERTURA MODALE FARMACI ESTREMA", Date.now());
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    console.log("CHIUSURA MODALE FARMACI ESTREMA", Date.now());
    setIsAddModalOpen(false);
  };

  // Caricamento iniziale dei dati
  useEffect(() => {
    loadMedications();
  }, [userId]);

  // Funzione per caricare i farmaci da API
  const loadMedications = async () => {
    setLoading(true);
    try {
      // Recupera i farmaci dall'API
      const response = await api.get('/api/medications');
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Farmaci caricati da API:", response.data.length);
        setMedications(response.data);
        setFilteredMedications(response.data);
      } else {
        console.log("Formato dati non valido dall'API");
        setMedications([]);
        setFilteredMedications([]);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei farmaci:", error);
      setMedications([]);
      setFilteredMedications([]);
    }
    setLoading(false);
  };

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
        m.notes?.toLowerCase().includes(query)
      );
    }
    
    setFilteredMedications(filtered);
  }, [filterStatus, searchQuery, medications]);

  // Gestione del form per nuovo farmaco
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input cambiato: ${name} = ${value}`);
    setNewMedication(prev => ({ ...prev, [name]: value }));
  };

  // Funzione per aggiungere un farmaco - salvataggio su API
  const handleAddMedication = async (e) => {
    if (e) e.preventDefault();
    
    console.log("handleAddMedication chiamata", Date.now());
    console.log("Dati form farmaco:", newMedication);
    
    if (!newMedication.name || !newMedication.dosage) {
      alert('Inserisci nome e dosaggio del farmaco');
      return;
    }
    
    try {
      // Chiamata API per salvare il farmaco
      const medicationToAdd = {
        ...newMedication,
        userId,
      };
      
      console.log("Invio farmaco all'API:", medicationToAdd);
      
      const response = await api.post('/api/medications', medicationToAdd);
      console.log("Risposta API:", response.data);
      
      if (response.data) {
        // Aggiorna la lista
        loadMedications();
        
        // Reset del form
        setNewMedication({
          name: '',
          dosage: '',
          frequency: 'daily',
          unit: 'mg',
          time: '',
          notes: '',
          status: 'active'
        });
        
        // Chiudi la modale
        closeAddModal();
        
        alert("Farmaco registrato con successo!");
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert("Si è verificato un errore durante il salvataggio: " + (error.response?.data?.message || error.message));
    }
  };

  // Componente per stato vuoto
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-illustration">
        <i className="fas fa-pills" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Nessun farmaco registrato</h2>
      <p>Inizia a tracciare i tuoi farmaci per monitorare l'aderenza</p>
      <button className="add-btn" onClick={openAddModal}>
        <i className="fas fa-plus"></i> Aggiungi primo farmaco
      </button>
    </div>
  );

  return (
    <div className="medication-tracker">
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Caricamento...</p>
        </div>
      ) : (
        <>
          {/* Header con filtri */}
          <div className="medication-header">
            <div className="medication-title">
              <h1>I Tuoi Farmaci</h1>
              <p>Gestisci e monitora l'assunzione di farmaci</p>
            </div>
            
            <button 
              className="add-medication-button" 
              onClick={openAddModal}
              type="button"
            >
              <i className="fas fa-plus"></i> Nuovo Farmaco
            </button>
          </div>
          
          {/* Filtri */}
          <div className="filters-container">
            <div className="search-filter">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Cerca farmaci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="status-filter">
              <label>Filtra per stato: </label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tutti gli stati</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Lista farmaci o stato vuoto */}
          {filteredMedications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="medications-grid">
              {filteredMedications.map(medication => (
                <div 
                  key={medication._id || medication.id} 
                  className="medication-card"
                >
                  <div className={`status-indicator ${medication.status}`}></div>
                  <div className="medication-details">
                    <h3>{medication.name}</h3>
                    <p className="dosage">
                      {medication.dosage} {medication.unit}
                    </p>
                    <p className="frequency">
                      {frequencyOptions.find(f => f.value === medication.frequency)?.label || medication.frequency}
                    </p>
                    {medication.notes && (
                      <p className="notes">{medication.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* MODALE SUPER BASICA */}
          {isAddModalOpen && (
            <div 
              className="modal-overlay" 
              style={{
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.7)', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999999
              }}
            >
              <div 
                className="modal-content"
                style={{
                  backgroundColor: 'white', 
                  padding: '20px',
                  borderRadius: '8px',
                  width: '90%',
                  maxWidth: '500px',
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}
              >
                <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <h2>Aggiungi nuovo farmaco</h2>
                  <button 
                    onClick={closeAddModal} 
                    type="button"
                    style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleAddMedication}>
                  <div className="form-group">
                    <label>Nome farmaco*</label>
                    <input
                      type="text"
                      name="name"
                      value={newMedication.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Dosaggio*</label>
                      <input
                        type="text"
                        name="dosage"
                        value={newMedication.dosage}
                        onChange={handleInputChange}
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
                        {unitOptions.map(unit => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
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
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Orario di assunzione</label>
                    <input
                      type="time"
                      name="time"
                      value={newMedication.time}
                      onChange={handleInputChange}
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
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Note aggiuntive</label>
                    <textarea
                      name="notes"
                      value={newMedication.notes}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                    <button 
                      type="button" 
                      onClick={closeAddModal}
                      style={{padding: '10px 15px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      Annulla
                    </button>
                    <button 
                      type="submit"
                      style={{padding: '10px 15px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                      Salva farmaco
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicationTracker; 