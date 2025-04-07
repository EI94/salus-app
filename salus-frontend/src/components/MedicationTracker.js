import React, { useState, useEffect } from 'react';
import '../styles/MedicationTracker.css';
import { localStorageService } from '../api';
import { loadUserMedications, addMedication, deleteMedication } from '../firebase/firestore';
import { auth } from '../firebase/config';
import { onAuthStateChange } from '../firebase/auth';

const MedicationTracker = () => {
  // Stati per la gestione dei dati
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth.currentUser);
  
  // Frequenze predefinite
  const frequencies = [
    { id: 1, name: 'Ogni giorno' },
    { id: 2, name: 'Più volte al giorno' },
    { id: 3, name: 'Ogni settimana' },
    { id: 4, name: 'Al bisogno' },
    { id: 5, name: 'Una tantum' }
  ];
  
  // Stato per nuovo farmaco
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  
  // Funzione per aprire la modale
  const openAddModal = () => {
    console.log("Apertura modale farmaci", Date.now());
    setIsAddModalOpen(true);
  };

  // Funzione per chiudere la modale
  const closeAddModal = () => {
    console.log("Chiusura modale farmaci", Date.now());
    setIsAddModalOpen(false);
  };
  
  // Verifica lo stato di connessione
  useEffect(() => {
    const handleOnline = () => {
      console.log("Connessione online rilevata");
      setIsOnline(true);
      // Ricarica i dati quando torniamo online
      loadMedications();
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
        loadMedications();
      } else {
        setMedications([]);
        setFilteredMedications([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Caricamento iniziale dei dati
  useEffect(() => {
    loadMedications();
  }, []);

  // Funzione per caricare i farmaci
  const loadMedications = async () => {
    setLoading(true);
    try {
      // Utilizza il servizio Firestore
      const medicationsData = await loadUserMedications();
      
      console.log("Farmaci caricati:", medicationsData.length);
      setMedications(medicationsData);
      setFilteredMedications(medicationsData);
    } catch (error) {
      console.error("Errore nel caricamento dei farmaci:", error);
      
      // Se c'è un errore, tenta di caricare da localStorage
      try {
        const localMedsJson = localStorageService.getItem('medications');
        if (localMedsJson) {
          const localMeds = JSON.parse(localMedsJson);
          console.log("Farmaci caricati da localStorage:", localMeds.length);
          setMedications(localMeds);
          setFilteredMedications(localMeds);
        } else {
          console.log("Nessun farmaco trovato in localStorage");
          setMedications([]);
          setFilteredMedications([]);
        }
      } catch (localError) {
        console.error("Errore nel caricamento da localStorage:", localError);
        setMedications([]);
        setFilteredMedications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtra i farmaci quando cambia la ricerca
  useEffect(() => {
    if (!medications) return;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = medications.filter(med => 
        med.name?.toLowerCase().includes(query) || 
        med.dosage?.toLowerCase().includes(query) ||
        med.notes?.toLowerCase().includes(query)
      );
      setFilteredMedications(filtered);
    } else {
      setFilteredMedications(medications);
    }
  }, [searchQuery, medications]);

  // Gestione del nuovo farmaco
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedication(prev => ({ ...prev, [name]: value }));
  };

  // Funzione per aggiungere un farmaco
  const handleAddMedication = async (e) => {
    if (e) e.preventDefault();
    
    if (!isAuthenticated) {
      alert('È necessario effettuare l\'accesso per aggiungere farmaci');
      return;
    }
    
    console.log("Aggiunta farmaco");
    
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      alert('Inserisci nome, dosaggio e frequenza del farmaco');
      return;
    }
    
    try {
      console.log("Salvando farmaco:", newMedication);
      
      // Utilizza il servizio Firestore
      const result = await addMedication(newMedication);
      
      if (result.success) {
        console.log("Farmaco aggiunto con successo:", result);
        
        // Ricarica i farmaci
        await loadMedications();
        
        // Reset del form
        setNewMedication({
          name: '',
          dosage: '',
          frequency: '',
          instructions: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: ''
        });
        
        // Chiudi la modale
        closeAddModal();
        
        // Notifica all'utente
        alert(result.isLocalOnly 
          ? "Farmaco registrato in modalità offline. Sarà sincronizzato quando sarai online."
          : "Farmaco registrato con successo!");
      } else {
        throw new Error(result.error || "Errore durante il salvataggio");
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert("Si è verificato un errore durante il salvataggio. Riprova.");
    }
  };
  
  // Funzione per eliminare un farmaco
  const handleDeleteMedication = async (medicationId) => {
    if (!isAuthenticated) {
      alert('È necessario effettuare l\'accesso per eliminare farmaci');
      return;
    }
    
    if (window.confirm('Sei sicuro di voler eliminare questo farmaco?')) {
      try {
        // Utilizza il servizio Firestore
        const result = await deleteMedication(medicationId);
        
        if (result.success) {
          // Aggiorna la lista locale
          setMedications(prev => prev.filter(m => m.id !== medicationId));
          setFilteredMedications(prev => prev.filter(m => m.id !== medicationId));
          
          // Chiudi la modale di dettaglio se aperta
          if (isDetailModalOpen) {
            setIsDetailModalOpen(false);
          }
          
          alert(result.isLocalOnly 
            ? "Farmaco eliminato in modalità offline. Sarà sincronizzato quando sarai online."
            : "Farmaco eliminato con successo!");
        } else {
          throw new Error(result.error || "Errore durante l'eliminazione");
        }
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert("Si è verificato un errore durante l'eliminazione. Riprova.");
      }
    }
  };

  // Componente per stato vuoto
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-illustration">
        <i className="fas fa-pills" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Nessun farmaco registrato</h2>
      <p>Inizia a tracciare i tuoi farmaci per monitorare la tua terapia</p>
      <button 
        className="add-btn" 
        onClick={openAddModal}
        disabled={!isAuthenticated}
      >
        <i className="fas fa-plus"></i> Aggiungi primo farmaco
      </button>
      {!isAuthenticated && (
        <p className="login-prompt">Effettua l'accesso per registrare i tuoi farmaci</p>
      )}
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
          {/* Indicatore di stato connessione */}
          {!isOnline && (
            <div className="offline-banner">
              <i className="fas fa-wifi-slash"></i>
              Modalità offline - I dati saranno sincronizzati quando tornerai online
            </div>
          )}
          
          {/* Header con filtri */}
          <div className="medication-header">
            <div className="medication-title">
              <h1>I Tuoi Farmaci</h1>
              <p>Monitora e gestisci i tuoi farmaci {!isOnline ? '(Modalità offline)' : ''}</p>
            </div>
            
            <button 
              className="add-medication-button" 
              onClick={openAddModal}
              disabled={!isAuthenticated}
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
          </div>
          
          {/* Lista farmaci o stato vuoto */}
          {!isAuthenticated ? (
            <div className="login-required">
              <div className="login-illustration">
                <i className="fas fa-user-lock" style={{ fontSize: '100px', color: 'var(--primary-color-light)' }}></i>
              </div>
              <h2>Accesso richiesto</h2>
              <p>Effettua l'accesso per visualizzare e gestire i tuoi farmaci</p>
              <a href="/login" className="login-button">Accedi ora</a>
            </div>
          ) : filteredMedications.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="medications-grid">
              {filteredMedications.map(medication => (
                <div 
                  key={medication.id} 
                  className={`medication-card ${medication.isLocalOnly ? 'local-only' : ''}`}
                  onClick={() => {
                    setSelectedMedication(medication);
                    setIsDetailModalOpen(true);
                  }}
                >
                  {medication.isLocalOnly && (
                    <div className="sync-badge" title="Salvato localmente, in attesa di sincronizzazione">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                  )}
                  <div className="medication-icon">
                    <i className="fas fa-pills"></i>
                  </div>
                  <div className="medication-details">
                    <h3>{medication.name}</h3>
                    <p className="dosage">Dosaggio: {medication.dosage}</p>
                    <p className="frequency">Frequenza: {medication.frequency}</p>
                    {medication.startDate && (
                      <p className="date">
                        Dal: {new Date(medication.startDate).toLocaleDateString('it-IT')}
                      </p>
                    )}
                    {medication.endDate && (
                      <p className="date">
                        Al: {new Date(medication.endDate).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modale per aggiungere farmaco */}
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
                zIndex: 9999
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
                  maxHeight: '90vh',
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
                  
                  <div className="form-group">
                    <label>Dosaggio*</label>
                    <input
                      type="text"
                      name="dosage"
                      value={newMedication.dosage}
                      onChange={handleInputChange}
                      placeholder="Es: 1 compressa da 500mg"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Frequenza*</label>
                    <select
                      name="frequency"
                      value={newMedication.frequency}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleziona frequenza</option>
                      {frequencies.map(freq => (
                        <option key={freq.id} value={freq.name}>
                          {freq.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
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
                    <label>Data fine</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newMedication.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Istruzioni</label>
                    <textarea
                      name="instructions"
                      value={newMedication.instructions}
                      onChange={handleInputChange}
                      placeholder="Es: Assumere ai pasti"
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Note</label>
                    <textarea
                      name="notes"
                      value={newMedication.notes}
                      onChange={handleInputChange}
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                    <div>
                      <span style={{fontSize: '12px', color: isOnline ? 'green' : 'orange'}}>
                        {isOnline 
                          ? 'Salvataggio su cloud' 
                          : 'Salvataggio offline (sincronizzazione automatica)'}
                      </span>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
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
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Modal per visualizzare dettaglio */}
          {isDetailModalOpen && selectedMedication && (
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
                zIndex: 9999
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
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}
              >
                <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <h2>Dettaglio farmaco</h2>
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    type="button"
                    style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  {selectedMedication.isLocalOnly && (
                    <div className="sync-status" style={{color: 'orange', marginBottom: '10px'}}>
                      <i className="fas fa-cloud-upload-alt"></i> Salvato localmente, in attesa di sincronizzazione
                    </div>
                  )}
                  <h3>{selectedMedication.name}</h3>
                  <p><strong>Dosaggio:</strong> {selectedMedication.dosage}</p>
                  <p><strong>Frequenza:</strong> {selectedMedication.frequency}</p>
                  {selectedMedication.startDate && (
                    <p><strong>Data inizio:</strong> {new Date(selectedMedication.startDate).toLocaleDateString('it-IT')}</p>
                  )}
                  {selectedMedication.endDate && (
                    <p><strong>Data fine:</strong> {new Date(selectedMedication.endDate).toLocaleDateString('it-IT')}</p>
                  )}
                  {selectedMedication.instructions && (
                    <p><strong>Istruzioni:</strong> {selectedMedication.instructions}</p>
                  )}
                  {selectedMedication.notes && (
                    <p><strong>Note:</strong> {selectedMedication.notes}</p>
                  )}
                  {selectedMedication.createdAt && (
                    <p><strong>Registrato il:</strong> {new Date(selectedMedication.createdAt).toLocaleString('it-IT')}</p>
                  )}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px'}}>
                  <button 
                    onClick={() => handleDeleteMedication(selectedMedication.id)}
                    style={{padding: '10px 15px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    <i className="fas fa-trash"></i> Elimina
                  </button>
                  <button 
                    onClick={() => setIsDetailModalOpen(false)}
                    style={{padding: '10px 15px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MedicationTracker; 