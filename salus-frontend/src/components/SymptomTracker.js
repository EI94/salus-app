import React, { useState, useEffect } from 'react';
import '../styles/SymptomTracker.css';
import { localStorageService } from '../api';
import { loadUserSymptoms, addSymptom, deleteSymptom } from '../firebase/firestore';
import { auth } from '../firebase/config';
import { onAuthStateChange } from '../firebase/auth';

const SymptomTracker = () => {
  // Stati per la gestione dei dati e dell'interfaccia
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAuthenticated, setIsAuthenticated] = useState(!!auth.currentUser);
  
  // Form per nuovo sintomo
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    intensity: 5,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });

  // Categorie predefinite
  const predefinedCategories = [
    { id: 1, name: 'Respiratorio', icon: 'fa-lungs' },
    { id: 2, name: 'Digestivo', icon: 'fa-stomach' },
    { id: 3, name: 'Neurologico', icon: 'fa-brain' }, 
    { id: 4, name: 'Cardiaco', icon: 'fa-heart' },
    { id: 5, name: 'Muscolare', icon: 'fa-dumbbell' },
    { id: 6, name: 'Articolare', icon: 'fa-bone' },
    { id: 7, name: 'Altro', icon: 'fa-notes-medical' }
  ];

  // Funzione per aprire la modale
  const openAddModal = () => {
    console.log("Apertura modale", Date.now());
    setIsAddModalOpen(true);
  };

  // Funzione per chiudere la modale
  const closeAddModal = () => {
    console.log("Chiusura modale", Date.now());
    setIsAddModalOpen(false);
  };
  
  // Verifica lo stato di connessione
  useEffect(() => {
    const handleOnline = () => {
      console.log("Connessione online rilevata");
      setIsOnline(true);
      // Ricarica i dati quando torniamo online
      loadSymptoms();
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
        loadSymptoms();
      } else {
        setSymptoms([]);
        setFilteredSymptoms([]);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Caricamento iniziale dei dati
  useEffect(() => {
    loadSymptoms();
    setCategories(predefinedCategories);
  }, []);

  // Funzione per caricare i sintomi
  const loadSymptoms = async () => {
    setLoading(true);
    try {
      // Utilizza il servizio Firestore
      const symptomsData = await loadUserSymptoms();
      
      console.log("Sintomi caricati:", symptomsData.length);
      setSymptoms(symptomsData);
      setFilteredSymptoms(symptomsData);
    } catch (error) {
      console.error("Errore nel caricamento dei sintomi:", error);
      
      // Se c'è un errore, tenta di caricare da localStorage
      try {
        const localSymptomsJson = localStorageService.getItem('symptoms');
        if (localSymptomsJson) {
          const localSymptoms = JSON.parse(localSymptomsJson);
          console.log("Sintomi caricati da localStorage:", localSymptoms.length);
          setSymptoms(localSymptoms);
          setFilteredSymptoms(localSymptoms);
        } else {
          console.log("Nessun sintomo trovato in localStorage");
          setSymptoms([]);
          setFilteredSymptoms([]);
        }
      } catch (localError) {
        console.error("Errore nel caricamento da localStorage:", localError);
        setSymptoms([]);
        setFilteredSymptoms([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtra i sintomi quando cambiano i filtri
  useEffect(() => {
    if (!symptoms || !Array.isArray(symptoms)) return;
    
    let filtered = [...symptoms];
    
    // Filtra per categoria
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    // Filtra per ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(query) || 
        s.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredSymptoms(filtered);
  }, [selectedCategory, searchQuery, symptoms]);

  // Gestione del nuovo sintomo
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input cambiato: ${name} = ${value}`);
    setNewSymptom(prev => ({ ...prev, [name]: value }));
  };

  // Funzione per aggiungere un sintomo
  const handleAddSymptom = async (e) => {
    if (e) e.preventDefault();
    
    if (!isAuthenticated) {
      alert('È necessario effettuare l\'accesso per aggiungere sintomi');
      return;
    }
    
    console.log("Aggiunta sintomo");
    console.log("Dati sintomo:", newSymptom);
    
    if (!newSymptom.name || !newSymptom.category) {
      alert('Inserisci nome e categoria del sintomo');
      return;
    }
    
    try {
      const symptomToAdd = {
        ...newSymptom,
        intensity: parseInt(newSymptom.intensity, 10) || 5,
      };
      
      console.log("Salvando sintomo:", symptomToAdd);
      
      // Utilizza il servizio Firestore
      const result = await addSymptom(symptomToAdd);
      
      if (result.success) {
        console.log("Sintomo aggiunto con successo:", result);
        
        // Ricarica i sintomi
        await loadSymptoms();
        
        // Reset del form
        setNewSymptom({
          name: '',
          intensity: 5,
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5)
        });
        
        // Chiudi la modale
        closeAddModal();
        
        // Notifica all'utente
        alert(result.isLocalOnly 
          ? "Sintomo registrato in modalità offline. Sarà sincronizzato quando sarai online."
          : "Sintomo registrato con successo!");
      } else {
        throw new Error(result.error || "Errore durante il salvataggio");
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      alert("Si è verificato un errore durante il salvataggio. Riprova.");
    }
  };
  
  // Funzione per eliminare un sintomo
  const handleDeleteSymptom = async (symptomId) => {
    if (!isAuthenticated) {
      alert('È necessario effettuare l\'accesso per eliminare sintomi');
      return;
    }
    
    if (window.confirm('Sei sicuro di voler eliminare questo sintomo?')) {
      try {
        // Utilizza il servizio Firestore
        const result = await deleteSymptom(symptomId);
        
        if (result.success) {
          // Aggiorna la lista locale
          setSymptoms(prev => prev.filter(s => s.id !== symptomId));
          setFilteredSymptoms(prev => prev.filter(s => s.id !== symptomId));
          
          // Chiudi la modale di dettaglio se aperta
          if (isDetailModalOpen) {
            setIsDetailModalOpen(false);
          }
          
          alert(result.isLocalOnly 
            ? "Sintomo eliminato in modalità offline. Sarà sincronizzato quando sarai online."
            : "Sintomo eliminato con successo!");
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
        <i className="fas fa-heartbeat" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Nessun sintomo registrato</h2>
      <p>Inizia a tracciare i tuoi sintomi per monitorare la tua salute</p>
      <button 
        className="add-btn" 
        onClick={openAddModal}
        disabled={!isAuthenticated}
      >
        <i className="fas fa-plus"></i> Aggiungi primo sintomo
      </button>
      {!isAuthenticated && (
        <p className="login-prompt">Effettua l'accesso per registrare i tuoi sintomi</p>
      )}
    </div>
  );

  // Visualizzazione principale
  return (
    <div className="symptom-tracker">
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
          <div className="symptom-header">
            <div className="symptom-title">
              <h1>I Tuoi Sintomi</h1>
              <p>Monitora e gestisci i tuoi sintomi {!isOnline ? '(Modalità offline)' : ''}</p>
            </div>
            
            <button 
              className="add-symptom-button" 
              onClick={openAddModal}
              type="button"
              disabled={!isAuthenticated}
            >
              <i className="fas fa-plus"></i> Nuovo Sintomo
            </button>
          </div>
          
          {/* Filtri */}
          <div className="filters-container">
            <div className="search-filter">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Cerca sintomi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="category-filter">
              <label>Filtra per categoria: </label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tutte le categorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Lista sintomi o stato vuoto */}
          {!isAuthenticated ? (
            <div className="login-required">
              <div className="login-illustration">
                <i className="fas fa-user-lock" style={{ fontSize: '100px', color: 'var(--primary-color-light)' }}></i>
              </div>
              <h2>Accesso richiesto</h2>
              <p>Effettua l'accesso per visualizzare e gestire i tuoi sintomi</p>
              <a href="/login" className="login-button">Accedi ora</a>
            </div>
          ) : filteredSymptoms.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="symptoms-grid">
              {filteredSymptoms.map(symptom => (
                <div 
                  key={symptom.id} 
                  className={`symptom-card ${symptom.isLocalOnly ? 'local-only' : ''}`}
                  onClick={() => {
                    setSelectedSymptom(symptom);
                    setIsDetailModalOpen(true);
                  }}
                >
                  {symptom.isLocalOnly && (
                    <div className="sync-badge" title="Salvato localmente, in attesa di sincronizzazione">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                  )}
                  <div className="symptom-icon">
                    <i className={`fas ${getCategoryIcon(symptom.category)}`}></i>
                  </div>
                  <div className="symptom-details">
                    <h3>{symptom.name}</h3>
                    <p>Categoria: {symptom.category}</p>
                    <div className="intensity-bar">
                      <div 
                        className="intensity-fill"
                        style={{width: `${(symptom.intensity / 10) * 100}%`}}
                      ></div>
                    </div>
                    <p className="intensity-label">
                      Intensità: {symptom.intensity}/10
                    </p>
                    <p className="symptom-date">
                      {new Date(symptom.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modale per aggiungere sintomo */}
          {isAddModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <h2>Aggiungi nuovo sintomo</h2>
                  <button 
                    onClick={closeAddModal} 
                    type="button"
                    style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleAddSymptom}>
                  <div className="form-group">
                    <label>Nome sintomo*</label>
                    <input
                      type="text"
                      name="name"
                      value={newSymptom.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Categoria*</label>
                    <select
                      name="category"
                      value={newSymptom.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleziona categoria</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Intensità: {newSymptom.intensity}/10</label>
                    <input
                      type="range"
                      name="intensity"
                      min="1"
                      max="10"
                      value={newSymptom.intensity}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      name="date"
                      value={newSymptom.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ora</label>
                    <input
                      type="time"
                      name="time"
                      value={newSymptom.time}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Descrizione</label>
                    <textarea
                      name="description"
                      value={newSymptom.description}
                      onChange={handleInputChange}
                      rows="3"
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
                        Salva sintomo
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Modal per visualizzare dettaglio */}
          {isDetailModalOpen && selectedSymptom && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <h2>Dettaglio sintomo</h2>
                  <button 
                    onClick={() => setIsDetailModalOpen(false)} 
                    type="button"
                    style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  {selectedSymptom.isLocalOnly && (
                    <div className="sync-status" style={{color: 'orange', marginBottom: '10px'}}>
                      <i className="fas fa-cloud-upload-alt"></i> Salvato localmente, in attesa di sincronizzazione
                    </div>
                  )}
                  <h3>{selectedSymptom.name}</h3>
                  <p><strong>Categoria:</strong> {selectedSymptom.category}</p>
                  <p><strong>Intensità:</strong> {selectedSymptom.intensity}/10</p>
                  <p><strong>Data:</strong> {new Date(selectedSymptom.date).toLocaleDateString('it-IT')}</p>
                  <p><strong>Ora:</strong> {selectedSymptom.time}</p>
                  {selectedSymptom.description && (
                    <p><strong>Descrizione:</strong> {selectedSymptom.description}</p>
                  )}
                  {selectedSymptom.createdAt && (
                    <p><strong>Registrato il:</strong> {new Date(selectedSymptom.createdAt).toLocaleString('it-IT')}</p>
                  )}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px'}}>
                  <button 
                    onClick={() => handleDeleteSymptom(selectedSymptom.id)}
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
  
  // Restituisce l'icona relativa alla categoria
  function getCategoryIcon(categoryName) {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : 'fa-notes-medical';
  }
};

export default SymptomTracker; 