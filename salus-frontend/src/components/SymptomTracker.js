import React, { useState, useEffect } from 'react';
import '../styles/SymptomTracker.css';
import api from '../api';

const SymptomTracker = ({ userId }) => {
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

  // Funzione molto semplice per aprire la modale
  const openAddModal = () => {
    console.log("APERTURA MODALE SINTOMI ESTREMA", Date.now());
    setIsAddModalOpen(true);
  };

  // Funzione molto semplice per chiudere la modale
  const closeAddModal = () => {
    console.log("CHIUSURA MODALE SINTOMI ESTREMA", Date.now());
    setIsAddModalOpen(false);
  };

  // Caricamento iniziale dei dati
  useEffect(() => {
    loadSymptoms();
  }, [userId]);

  // Funzione per caricare i sintomi da API
  const loadSymptoms = async () => {
    setLoading(true);
    try {
      // Recupera i sintomi dall'API
      const response = await api.get('/api/symptoms');
      if (response.data && Array.isArray(response.data)) {
        console.log("Sintomi caricati da API:", response.data.length);
        setSymptoms(response.data);
        setFilteredSymptoms(response.data);
      } else {
        console.log("Formato dati non valido dall'API");
        setSymptoms([]);
        setFilteredSymptoms([]);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei sintomi:", error);
      setSymptoms([]);
      setFilteredSymptoms([]);
    }
    setCategories(predefinedCategories);
    setLoading(false);
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
        s.name.toLowerCase().includes(query) || 
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

  // Funzione per aggiungere un sintomo - salvataggio su API
  const handleAddSymptom = async (e) => {
    if (e) e.preventDefault();
    
    console.log("handleAddSymptom chiamata", Date.now());
    console.log("Dati form sintomo:", newSymptom);
    
    if (!newSymptom.name || !newSymptom.category) {
      alert('Inserisci nome e categoria del sintomo');
      return;
    }
    
    try {
      // Chiamata API per salvare il sintomo
      const symptomToAdd = {
        ...newSymptom,
        userId,
        intensity: parseInt(newSymptom.intensity, 10) || 5,
      };
      
      console.log("Invio sintomo all'API:", symptomToAdd);
      
      const response = await api.post('/api/symptoms', symptomToAdd);
      console.log("Risposta API:", response.data);
      
      if (response.data) {
        // Aggiorna la lista
        loadSymptoms();
        
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
        
        alert("Sintomo registrato con successo!");
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
        <i className="fas fa-heartbeat" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Nessun sintomo registrato</h2>
      <p>Inizia a tracciare i tuoi sintomi per monitorare la tua salute</p>
      <button className="add-btn" onClick={openAddModal}>
        <i className="fas fa-plus"></i> Aggiungi primo sintomo
      </button>
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
          {/* Header con filtri */}
          <div className="symptom-header">
            <div className="symptom-title">
              <h1>I Tuoi Sintomi</h1>
              <p>Monitora e gestisci i tuoi sintomi</p>
            </div>
            
            <button 
              className="add-symptom-button" 
              onClick={openAddModal}
              type="button"
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
          {filteredSymptoms.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="symptoms-grid">
              {filteredSymptoms.map(symptom => (
                <div 
                  key={symptom._id || symptom.id} 
                  className="symptom-card"
                >
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
                      Salva sintomo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Modal per visualizzare dettaglio */}
          {isDetailModalOpen && selectedSymptom && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Dettaglio sintomo</h2>
                  <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <h3>{selectedSymptom.name}</h3>
                  <p><strong>Categoria:</strong> {selectedSymptom.category}</p>
                  <p><strong>Intensità:</strong> {selectedSymptom.intensity}/10</p>
                  <p><strong>Data:</strong> {new Date(selectedSymptom.date).toLocaleDateString('it-IT')}</p>
                  <p><strong>Ora:</strong> {selectedSymptom.time}</p>
                  {selectedSymptom.description && (
                    <p><strong>Descrizione:</strong> {selectedSymptom.description}</p>
                  )}
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