import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/SymptomTracker.css';
import { toast } from 'react-toastify';

// Categorie predefinite per i sintomi
const CATEGORIES = [
  { id: 'dolor', name: 'Dolore' },
  { id: 'gastro', name: 'Gastrointestinale' },
  { id: 'resp', name: 'Respiratorio' },
  { id: 'cardio', name: 'Cardiaco' },
  { id: 'neuro', name: 'Neurologico' },
  { id: 'cutaneo', name: 'Cutaneo' },
  { id: 'altro', name: 'Altro' }
];

// Livelli di intensità
const intensityLevels = [
  { value: '1', label: 'Lieve' },
  { value: '2', label: 'Moderato' },
  { value: '3', label: 'Grave' },
  { value: '4', label: 'Molto grave' },
  { value: '5', label: 'Estremo' }
];

const SymptomTracker = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0].id,
    intensity: intensityLevels[0].value,
    description: ''
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Monitora lo stato di autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadSymptoms(currentUser.uid);
      } else {
        setUser(null);
        setSymptoms([]);
        setLoading(false);
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [auth, navigate]);
  
  // Carica i sintomi dell'utente da Firestore
  const loadSymptoms = async (userId) => {
    try {
      setLoading(true);
      
      const symptomsRef = collection(db, 'symptoms');
      const q = query(
        symptomsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const symptomList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Caricati ${symptomList.length} sintomi`);
      setSymptoms(symptomList);
      } catch (error) {
        console.error('Errore nel caricamento dei sintomi:', error);
        toast.error('Errore nel caricamento dei sintomi. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
  // Aggiunge un nuovo sintomo
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning("Devi effettuare l'accesso per aggiungere sintomi");
      navigate('/login');
      return;
    }
    
    // Validazione campi obbligatori
    if (!formData.name || !formData.category || !formData.intensity) {
      toast.warning('Nome, categoria e intensità sono campi obbligatori');
      return;
    }
    
    try {
      // Preparazione dati
      const symptomData = {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      // Salvataggio in Firestore
      const docRef = await addDoc(collection(db, 'symptoms'), symptomData);
      
      // Aggiornamento dell'interfaccia
      const newSymptom = {
        id: docRef.id,
        ...symptomData,
        createdAt: new Date() // Usato per la visualizzazione immediata
      };
      
      setSymptoms(prev => [newSymptom, ...prev]);
      
      // Reset del form
      setFormData({
        name: '',
        category: CATEGORIES[0].id,
        intensity: intensityLevels[0].value,
        description: ''
      });
      
      toast.success('Sintomo aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiunta del sintomo:', error);
      toast.error('Errore nell\'aggiunta del sintomo. Riprova più tardi.');
    }
  };
  
  // Elimina un sintomo
  const handleDelete = async (symptomId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo sintomo?')) {
      return;
    }
    
    try {
      // Eliminazione da Firestore
      await deleteDoc(doc(db, 'symptoms', symptomId));
      
      // Aggiornamento dell'interfaccia
      setSymptoms(prev => prev.filter(symptom => symptom.id !== symptomId));
      
      toast.success('Sintomo eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione del sintomo:', error);
      toast.error('Errore nell\'eliminazione del sintomo. Riprova più tardi.');
    }
  };
  
  // Filtra i sintomi in base alla ricerca e alla categoria selezionata
  const filteredSymptoms = symptoms.filter(symptom => {
    const matchesSearch = symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (symptom.description && symptom.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || symptom.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Ottieni il nome della categoria
  const getCategoryName = (categoryId) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Ottieni il nome dell'intensità
  const getIntensityName = (intensityValue) => {
    const intensity = intensityLevels.find(i => i.value === intensityValue);
    return intensity ? intensity.label : intensityValue;
  };
  
  // Formatta la data
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data non disponibile';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (!user) {
    return <div className="login-prompt">Effettua l'accesso per utilizzare questa funzionalità</div>;
  }

  return (
    <div className="symptom-tracker-container">
      <h1 className="page-title">Monitoraggio Sintomi</h1>
      
      {/* Form per aggiungere sintomi */}
      <div className="symptom-form-container">
        <h2>Aggiungi Nuovo Sintomo</h2>
        <form onSubmit={handleSubmit} className="symptom-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome del Sintomo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Es. Mal di testa, Tosse, Febbre..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Categoria *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="intensity">Intensità *</label>
              <select
                id="intensity"
                name="intensity"
                value={formData.intensity}
                onChange={(e) => setFormData(prev => ({ ...prev, intensity: e.target.value }))}
                required
              >
                {intensityLevels.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrizione</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrivi il sintomo in dettaglio..."
              rows="3"
            />
          </div>
          
          <button type="submit" className="submit-button">
            Aggiungi Sintomo
          </button>
        </form>
      </div>
      
      {/* Lista dei sintomi */}
      <div className="symptoms-history">
        <div className="history-header">
          <h2>Sintomi registrati</h2>
          
          <div className="filters">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Cerca sintomi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="category-filter">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tutte le categorie</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Caricamento sintomi...</div>
        ) : filteredSymptoms.length === 0 ? (
          <div className="empty-state">
            <p>Nessun sintomo registrato</p>
            <p>Compila il form sopra per registrare il tuo primo sintomo</p>
          </div>
        ) : (
          <div className="symptoms-list">
            {filteredSymptoms.map(symptom => (
              <div key={symptom.id} className="symptom-card">
                <div className="symptom-header">
                  <h3>{symptom.name}</h3>
                  <span className={`intensity-badge intensity-${symptom.intensity}`}>
                    {getIntensityName(symptom.intensity)}
                  </span>
                </div>
                
                <div className="symptom-info">
                  <p><strong>Categoria:</strong> {getCategoryName(symptom.category)}</p>
                  {symptom.description && (
                    <p><strong>Descrizione:</strong> {symptom.description}</p>
                  )}
                  <p><strong>Data:</strong> {symptom.createdAt ? formatDate(symptom.createdAt) : 'N/D'}</p>
                </div>
                
                <button 
                  className="delete-button" 
                  onClick={() => handleDelete(symptom.id)}
                >
                  Elimina
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomTracker; 