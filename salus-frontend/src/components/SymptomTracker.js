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

  // Categorie di sintomi predefinite
  const predefinedCategories = [
    'Respiratorio', 'Digestivo', 'Neurologico', 
    'Cardiaco', 'Muscolare', 'Articolare', 'Altro'
  ];
  
  // Mock dati sintomi
  const mockSymptoms = [
    {
      id: 1,
      name: 'Mal di testa',
      intensity: 7,
      category: 'Neurologico',
      description: 'Dolore pulsante alla tempia destra',
      date: '2023-11-01',
      time: '14:30'
    },
    {
      id: 2,
      name: 'Nausea',
      intensity: 4,
      category: 'Digestivo',
      description: 'Leggera nausea dopo pranzo',
      date: '2023-11-02',
      time: '13:45'
    },
    {
      id: 3,
      name: 'Tosse',
      intensity: 6,
      category: 'Respiratorio',
      description: 'Tosse secca persistente',
      date: '2023-11-03',
      time: '08:15'
    },
    {
      id: 4,
      name: 'Dolore al ginocchio',
      intensity: 5,
      category: 'Articolare',
      description: 'Dolore al ginocchio destro durante la camminata',
      date: '2023-11-04',
      time: '17:20'
    },
    {
      id: 5,
      name: 'Stanchezza',
      intensity: 8,
      category: 'Altro',
      description: 'Forte sensazione di stanchezza durante il giorno',
      date: '2023-11-05',
      time: '10:00'
    }
  ];

  // Caricamento dei sintomi
  useEffect(() => {
    // Simula richiesta API
    setTimeout(() => {
      setSymptoms(mockSymptoms);
      setFilteredSymptoms(mockSymptoms);
      setCategories(predefinedCategories);
      setLoading(false);
    }, 1000);
  }, [mockSymptoms]); // Aggiungo mockSymptoms come dipendenza

  // Filtra i sintomi quando cambiano i filtri
  useEffect(() => {
    if (!symptoms || !Array.isArray(symptoms)) return;
    
    let filtered = [...symptoms];
    
    // Filtra per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    // Filtra per ricerca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredSymptoms(filtered);
  }, [selectedCategory, searchQuery, symptoms]);

  // Gestione del nuovo sintomo
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSymptom(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSymptom = () => {
    if (!newSymptom.name || !newSymptom.category) {
      alert('Inserisci nome e categoria del sintomo');
      return;
    }
    
    const newSymptomWithId = {
      ...newSymptom,
      id: Date.now(), // Genera un ID unico
      intensity: parseInt(newSymptom.intensity, 10)
    };
    
    const updatedSymptoms = [newSymptomWithId, ...symptoms];
    setSymptoms(updatedSymptoms);
    setFilteredSymptoms(updatedSymptoms);
    
    // Aggiungi la categoria se è nuova
    if (!categories.includes(newSymptom.category)) {
      setCategories([...categories, newSymptom.category]);
    }
    
    // Reset
    setNewSymptom({
      name: '',
      intensity: 5,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5)
    });
    
    setIsAddModalOpen(false);
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
          <div className="loading-text">Caricamento sintomi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="symptom-tracker">
      <div className="symptom-header">
        <div className="symptom-title">
          <h1>Tracciamento Sintomi</h1>
          <p>Monitora i tuoi sintomi per tenere sotto controllo la tua salute</p>
        </div>
        <button 
          className="add-symptom-button" 
          onClick={() => setIsAddModalOpen(true)}
        >
          <i className="fas fa-plus"></i> Nuovo Sintomo
        </button>
      </div>
      
      <div className="symptom-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Cerca sintomi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="category-filter">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tutte le categorie</option>
            {categories && categories.length > 0 && categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="symptom-stats">
        <div className="stat-card">
          <div className="stat-value">{symptoms ? symptoms.length : 0}</div>
          <div className="stat-label">Sintomi totali</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {symptoms && Array.isArray(symptoms) ? 
              symptoms.filter(s => new Date(s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length : 0}
          </div>
          <div className="stat-label">Ultimi 7 giorni</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {symptoms && Array.isArray(symptoms) && symptoms.length > 0 ? 
              Math.round(symptoms.reduce((acc, s) => acc + s.intensity, 0) / symptoms.length) : 0}
          </div>
          <div className="stat-label">Intensità media</div>
        </div>
      </div>
      
      <div className="symptom-list">
        {filteredSymptoms && filteredSymptoms.length > 0 ? (
          filteredSymptoms.map(symptom => (
            <div 
              key={symptom.id} 
              className="symptom-card" 
              onClick={() => handleSymptomClick(symptom)}
            >
              <div className="symptom-info">
                <div className="symptom-name">
                  <h3>{symptom.name}</h3>
                  <span className="symptom-category">{symptom.category}</span>
                </div>
                <div className="symptom-description">{symptom.description}</div>
                <div className="symptom-date">
                  <i className="far fa-calendar"></i> {formatDate(symptom.date)} alle {symptom.time}
                </div>
              </div>
              <div className="symptom-intensity">
                <div className={`intensity-indicator ${getIntensityColor(symptom.intensity)}`}>
                  {symptom.intensity}
                </div>
                <div className="intensity-label">Intensità</div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-symptoms">
            <i className="fas fa-file-medical-alt"></i>
            <p>Nessun sintomo trovato</p>
            <button 
              className="add-first-symptom" 
              onClick={() => setIsAddModalOpen(true)}
            >
              Aggiungi il tuo primo sintomo
            </button>
          </div>
        )}
      </div>
      
      {/* Modal per aggiungere un sintomo */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Aggiungi nuovo sintomo</h2>
              <button className="close-button" onClick={() => setIsAddModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
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
                    <option key={index} value={cat}>{cat}</option>
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
                onClick={() => setIsAddModalOpen(false)}
              >
                Annulla
              </button>
              <button 
                className="save-button" 
                onClick={handleAddSymptom}
              >
                Salva sintomo
              </button>
            </div>
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
                  const updatedSymptoms = symptoms.filter(s => s.id !== selectedSymptom.id);
                  setSymptoms(updatedSymptoms);
                  setFilteredSymptoms(updatedSymptoms);
                  setIsDetailModalOpen(false);
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