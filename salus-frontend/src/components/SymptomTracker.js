import React, { useState, useEffect } from 'react';
import '../styles/SymptomTracker.css';

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

  // Questo effetto gestisce l'apertura e chiusura della modale 
  // direttamente quando cambia isAddModalOpen
  useEffect(() => {
    if (isAddModalOpen) {
      // Trova la modale per id
      const modal = document.getElementById('symptom-add-modal');
      if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Blocca lo scroll
      }
    } else {
      const modal = document.getElementById('symptom-add-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Ripristina lo scroll
      }
    }
  }, [isAddModalOpen]);

  // Inizializzazione - crea la modale direttamente
  useEffect(() => {
    console.log("🔄 Inizializzazione SymptomTracker - Creazione modale...");
    
    // Verifica se esiste già il container modale
    let modalContainer = document.getElementById('symptom-add-modal');
    
    // Se non esiste, crealo manualmente
    if (!modalContainer) {
      console.log("⚙️ Creazione manuale modale sintomi");
      
      // Crea il container della modale
      modalContainer = document.createElement('div');
      modalContainer.id = 'symptom-add-modal';
      modalContainer.className = 'modal-overlay';
      modalContainer.style.display = 'none';
      modalContainer.style.position = 'fixed';
      modalContainer.style.top = '0';
      modalContainer.style.left = '0';
      modalContainer.style.width = '100%';
      modalContainer.style.height = '100%';
      modalContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modalContainer.style.zIndex = '1000';
      
      // Appendi la modale al body del documento
      document.body.appendChild(modalContainer);
      console.log("✅ Modale sintomi creata e aggiunta al DOM");
    } else {
      console.log("✅ Modale sintomi già presente nel DOM");
    }
    
    // Pulizia al momento dello smontaggio del componente
    return () => {
      console.log("🧹 Pulizia SymptomTracker");
      // Opzionalmente, rimuovi la modale dal DOM allo smontaggio
      // document.body.removeChild(modalContainer);
    };
  }, []);

  // Dati di esempio - sostituiti con array vuoto
  const mockSymptoms = [];

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

  // Caricamento iniziale dei dati
  useEffect(() => {
    // Simuliamo il caricamento dei dati
    setTimeout(() => {
      try {
        // Verifica se ci sono dati nel localStorage
        const storedSymptoms = localStorage.getItem('symptoms');
        
        if (storedSymptoms) {
          console.log("Trovati sintomi salvati nel localStorage");
          const parsedSymptoms = JSON.parse(storedSymptoms);
          setSymptoms(parsedSymptoms);
          setFilteredSymptoms(parsedSymptoms);
        } else {
          console.log("Nessun sintomo trovato nel localStorage, utilizzo array vuoto");
          setSymptoms(mockSymptoms);
          setFilteredSymptoms(mockSymptoms);
        }
      } catch (error) {
        console.error("Errore nel caricamento dei sintomi dal localStorage:", error);
        setSymptoms(mockSymptoms);
        setFilteredSymptoms(mockSymptoms);
      }
      
      setCategories(predefinedCategories);
      setLoading(false);
    }, 400); // Ridotto tempo di caricamento per un'esperienza più veloce
  }, []);

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

  // Calcolo delle statistiche per insight
  const getSymptomInsights = () => {
    if (!symptoms.length) return null;
    
    const totalSymptoms = symptoms.length;
    const categoryCounts = {};
    let highIntensityCount = 0;
    
    symptoms.forEach(symptom => {
      // Conta per categoria
      if (categoryCounts[symptom.category]) {
        categoryCounts[symptom.category]++;
      } else {
        categoryCounts[symptom.category] = 1;
      }
      
      // Conta sintomi ad alta intensità
      if (symptom.intensity > 7) {
        highIntensityCount++;
      }
    });
    
    // Trova la categoria più comune
    let mostCommonCategory = '';
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        mostCommonCategory = category;
        maxCount = count;
      }
    });
    
    return {
      totalSymptoms,
      highIntensityCount,
      mostCommonCategory
    };
  };

  // Restituisce l'icona relativa alla categoria
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : 'fa-notes-medical';
  };

  // Componente per stato vuoto
  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-illustration">
        <i className="fas fa-heartbeat" style={{ fontSize: '180px', color: 'var(--primary-color-light)' }}></i>
      </div>
      <h2>Nessun sintomo registrato</h2>
      <p>Tieni traccia dei tuoi sintomi per monitorare la tua salute nel tempo</p>
      
      <div className="benefits-list">
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="benefit-text">
            <h3>Monitora l'andamento</h3>
            <p>Visualizza come i sintomi evolvono nel tempo</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fas fa-search"></i>
          </div>
          <div className="benefit-text">
            <h3>Identifica pattern</h3>
            <p>Scopri relazioni tra diversi sintomi e possibili cause</p>
          </div>
        </div>
        
        <div className="benefit-item">
          <div className="benefit-icon">
            <i className="fas fa-file-medical"></i>
          </div>
          <div className="benefit-text">
            <h3>Report medici</h3>
            <p>Crea report dettagliati da condividere con i medici</p>
          </div>
        </div>
      </div>
      
      <button 
        className="add-symptom-button-large"
        onClick={openAddModal}
        type="button"
      >
        <i className="fas fa-plus-circle"></i> Registra il tuo primo sintomo
      </button>
    </div>
  );

  // Gestione del nuovo sintomo
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSymptom(prev => ({ ...prev, [name]: value }));
  };

  // Funzione per aggiungere un sintomo - completamente riscritta
  const handleAddSymptom = (e) => {
    if (e) e.preventDefault();
    
    console.log("🔄 handleAddSymptom chiamata", Date.now());
    
    try {
      // Validazione base
      if (!newSymptom.name || !newSymptom.category) {
        alert('Inserisci nome e categoria del sintomo');
        return;
      }
      
      console.log("✅ Validazione passata, sintomo:", newSymptom);
      
      // Crea un ID univoco
      const id = Date.now().toString();
      
      // Prepara il nuovo sintomo completo di ID
      const symptomToAdd = {
        ...newSymptom,
        id,
        intensity: parseInt(newSymptom.intensity, 10) || 5
      };
      
      console.log("📦 Nuovo sintomo da salvare:", symptomToAdd);
      
      // Recupera i sintomi esistenti dal localStorage
      let existingSymptoms = [];
      const storedSymptoms = localStorage.getItem('symptoms');
      
      if (storedSymptoms) {
        try {
          existingSymptoms = JSON.parse(storedSymptoms);
          if (!Array.isArray(existingSymptoms)) {
            console.warn("⚠️ I sintomi nel localStorage non sono un array, reset necessario");
            existingSymptoms = [];
          }
        } catch (error) {
          console.error("❌ Errore nel parsing dei sintomi dal localStorage:", error);
          existingSymptoms = [];
        }
      }
      
      console.log("📋 Sintomi esistenti:", existingSymptoms.length);
      
      // Aggiungi il nuovo sintomo all'inizio dell'array
      const updatedSymptoms = [symptomToAdd, ...existingSymptoms];
      
      // Salva nel localStorage
      localStorage.setItem('symptoms', JSON.stringify(updatedSymptoms));
      console.log("💾 Sintomi salvati nel localStorage, nuova lunghezza:", updatedSymptoms.length);
      
      // Aggiorna lo stato di React
      setSymptoms(updatedSymptoms);
      setFilteredSymptoms(updatedSymptoms);
      
      // Aggiungi la categoria se è nuova
      if (!categories.some(cat => cat.name === newSymptom.category)) {
        const newCategory = {
          id: Date.now(),
          name: newSymptom.category,
          icon: 'fa-notes-medical'
        };
        setCategories(prevCategories => [...prevCategories, newCategory]);
      }
      
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
      
      console.log("✅ Sintomo aggiunto con successo!");
      alert("Sintomo registrato con successo!");
      
    } catch (error) {
      console.error("❌ Errore durante il salvataggio del sintomo:", error);
      alert("Si è verificato un errore durante il salvataggio: " + error.message);
    }
  };

  // Funzione ultrasemplificata per l'apertura della modale
  const openAddModal = () => {
    console.log("⚠️ ULTRASEMPLICE: Apertura modale sintomi", Date.now());
    setIsAddModalOpen(true); // Questo è tutto ciò che serve
  };

  // Funzione ultrasemplificata per la chiusura della modale
  const closeAddModal = () => {
    console.log("⚠️ ULTRASEMPLICE: Chiusura modale sintomi", Date.now());
    setIsAddModalOpen(false); // Questo è tutto ciò che serve
  };

  // Visualizza dettaglio sintomo
  const handleSymptomClick = (symptom) => {
    setSelectedSymptom(symptom);
    setIsDetailModalOpen(true);
  };

  // Funzione per ottenere colore in base a intensità
  const getIntensityColor = (intensity) => {
    if (intensity <= 3) return 'low-intensity';
    if (intensity <= 7) return 'medium-intensity';
    return 'high-intensity';
  };

  // Formattazione data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  if (loading) {
    return (
      <div className="symptom-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Caricamento sintomi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="symptom-tracker">
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
      
      {symptoms.length > 0 ? (
        <>
          <div className="symptom-insights">
            <div className="insight-card">
              <div className="insight-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="insight-content">
                <h3>{symptoms.length}</h3>
                <p>Sintomi registrati</p>
              </div>
            </div>
            
            {getSymptomInsights() && (
              <>
                <div className="insight-card">
                  <div className="insight-icon">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="insight-content">
                    <h3>{getSymptomInsights().highIntensityCount}</h3>
                    <p>Sintomi ad alta intensità</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">
                    <i className={`fas ${getCategoryIcon(getSymptomInsights().mostCommonCategory)}`}></i>
                  </div>
                  <div className="insight-content">
                    <h3>{getSymptomInsights().mostCommonCategory}</h3>
                    <p>Categoria più frequente</p>
                  </div>
                </div>
              </>
            )}
      </div>
      
      <div className="symptom-filters">
            <div className="search-bar">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
                placeholder="Cerca sintomo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
        </div>
        
            <div className="category-filters">
              <button
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                Tutte le categorie
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  className={selectedCategory === category.name ? 'active' : ''}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <i className={`fas ${category.icon}`}></i> {category.name}
                </button>
              ))}
        </div>
      </div>
      
          <div className="symptoms-list">
            {filteredSymptoms.length > 0 ? (
          filteredSymptoms.map(symptom => (
            <div 
              key={symptom.id} 
              className="symptom-card" 
              onClick={() => handleSymptomClick(symptom)}
            >
                  <div className="symptom-severity" 
                       style={{backgroundColor: getIntensityColor(symptom.intensity)}}>
                    <span>{symptom.intensity}</span>
                  </div>
                  
              <div className="symptom-info">
                    <h2 className="symptom-name">{symptom.name}</h2>
                    <div className="symptom-category">
                      <i className={`fas ${getCategoryIcon(symptom.category)}`}></i>
                      <span>{symptom.category}</span>
                    </div>
                    {symptom.description && (
                      <p className="symptom-description">
                        {symptom.description.length > 120 
                          ? symptom.description.substring(0, 120) + '...' 
                          : symptom.description}
                      </p>
                    )}
                    <p className="symptom-date">
                      <i className="far fa-calendar"></i> {formatDate(symptom.date)}
                      {symptom.time && <><i className="far fa-clock ml-2"></i> {symptom.time}</>}
                    </p>
                </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>Nessun sintomo trovato</h3>
                <p>Prova a modificare i filtri di ricerca</p>
            <button 
                  className="reset-filters-button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Reimposta filtri
            </button>
          </div>
        )}
      </div>
        </>
      ) : (
        <EmptyState />
      )}
      
      {/* Modale ultrasemplificata */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Aggiungi nuovo sintomo</h2>
              <button className="close-button" onClick={closeAddModal} type="button">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddSymptom}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome del sintomo *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newSymptom.name}
                    onChange={handleInputChange}
                    placeholder="Es. Mal di testa, Tosse, ecc."
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Categoria *</label>
                  <select 
                    name="category" 
                    value={newSymptom.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleziona categoria</option>
                    {predefinedCategories.map((cat, index) => (
                      <option key={index} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Intensità: {newSymptom.intensity}</label>
                  <input 
                    type="range" 
                    name="intensity" 
                    min="1" 
                    max="10" 
                    value={newSymptom.intensity}
                    onChange={handleInputChange}
                  />
                  <div className="range-labels">
                    <span>Lieve</span>
                    <span>Moderata</span>
                    <span>Intensa</span>
                  </div>
                </div>
                
                <div className="form-row">
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
                </div>
                
                <div className="form-group">
                  <label>Descrizione</label>
                  <textarea 
                    name="description" 
                    value={newSymptom.description}
                    onChange={handleInputChange}
                    placeholder="Descrivi come ti senti..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="cancel-button" 
                  onClick={closeAddModal}
                  type="button"
                >
                  Annulla
                </button>
                <button 
                  className="save-button" 
                  type="submit"
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
              <h2>{selectedSymptom.name}</h2>
              <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <div className="detail-label">Categoria:</div>
                <div className="detail-value">{selectedSymptom.category}</div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Intensità:</div>
                <div className="detail-value">
                  <div className={`intensity-indicator ${getIntensityColor(selectedSymptom.intensity)}`}>
                    {selectedSymptom.intensity}
                  </div>
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Data e ora:</div>
                <div className="detail-value">
                  {formatDate(selectedSymptom.date)} alle {selectedSymptom.time}
                </div>
              </div>
              
              <div className="detail-item">
                <div className="detail-label">Descrizione:</div>
                <div className="detail-value description">
                  {selectedSymptom.description || "Nessuna descrizione aggiuntiva"}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="delete-button" 
                onClick={() => {
                  try {
                    console.log("Eliminazione sintomo:", selectedSymptom.id);
                  const updatedSymptoms = symptoms.filter(s => s.id !== selectedSymptom.id);
                    
                    // Aggiorna lo stato
                  setSymptoms(updatedSymptoms);
                  setFilteredSymptoms(updatedSymptoms);
                    
                    // Aggiorna anche nel localStorage
                    localStorage.setItem('symptoms', JSON.stringify(updatedSymptoms));
                    
                    console.log("Sintomo eliminato con successo");
                  setIsDetailModalOpen(false);
                  } catch (error) {
                    console.error("Errore durante l'eliminazione del sintomo:", error);
                    alert("Si è verificato un errore durante l'eliminazione. Riprova.");
                  }
                }}
              >
                <i className="fas fa-trash"></i> Elimina
              </button>
              <button 
                className="edit-button" 
                onClick={() => {
                  // In una versione completa, qui andrebbe la logica di modifica
                  setIsDetailModalOpen(false);
                }}
              >
                <i className="fas fa-edit"></i> Modifica
              </button>
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

export default SymptomTracker; 