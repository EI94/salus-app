import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FaSearch, FaNotesMedical, FaPlus, FaTrashAlt } from 'react-icons/fa';
import '../styles/SymptomTracker.css';

const intensityOptions = [
  { value: 'lieve', label: 'Lieve' },
  { value: 'moderato', label: 'Moderato' },
  { value: 'severo', label: 'Severo' }
];

const SymptomTracker = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [intensityFilter, setIntensityFilter] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState('moderato');
  const [location, setLocation] = useState('');
  const [triggers, setTriggers] = useState('');
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/login');
      } else {
        loadSymptoms(currentUser.uid);
      }
    });
    
    return () => unsubscribe();
  }, [auth, navigate]);
  
  const loadSymptoms = async (userId) => {
    setLoading(true);
    try {
      const symptomsRef = collection(db, 'symptoms');
      const q = query(
        symptomsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const symptomsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSymptoms(symptomsList);
      setLoading(false);
    } catch (error) {
      console.error('Errore nel caricamento dei sintomi:', error);
      toast.error('Impossibile caricare i sintomi. Riprova più tardi.');
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !intensity) {
      toast.error('Nome e intensità sono obbligatori');
      return;
    }
    
    try {
      const newSymptom = {
        name,
        description,
        intensity,
        location,
        triggers,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'symptoms'), newSymptom);
      
      // Reset form
      setName('');
      setDescription('');
      setIntensity('moderato');
      setLocation('');
      setTriggers('');
      
      toast.success('Sintomo aggiunto con successo!');
      loadSymptoms(user.uid);
    } catch (error) {
      console.error('Errore durante il salvataggio del sintomo:', error);
      toast.error('Impossibile salvare il sintomo. Riprova più tardi.');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo sintomo?')) {
      try {
        await deleteDoc(doc(db, 'symptoms', id));
        toast.success('Sintomo eliminato con successo');
        setSymptoms(symptoms.filter(symptom => symptom.id !== id));
      } catch (error) {
        console.error('Errore durante l\'eliminazione del sintomo:', error);
        toast.error('Impossibile eliminare il sintomo. Riprova più tardi.');
      }
    }
  };
  
  const filteredSymptoms = symptoms.filter(symptom => {
    const matchesSearchTerm = symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (symptom.description && symptom.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesIntensityFilter = intensityFilter === '' || symptom.intensity === intensityFilter;
    
    return matchesSearchTerm && matchesIntensityFilter;
  });
  
  if (!user) {
    return <div className="loading-state">Caricamento...</div>;
  }
  
  return (
    <div className="symptom-tracker-container">
      {/* Form Section */}
      <div className="symptom-form-section">
        <h2>Aggiungi un nuovo sintomo</h2>
        <form className="symptom-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome del sintomo *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Mal di testa"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="intensity">Intensità *</label>
              <select
                id="intensity"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                required
              >
                {intensityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Posizione</label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="es. Parte destra della testa"
              />
            </div>
            <div className="form-group">
              <label htmlFor="triggers">Fattori scatenanti</label>
              <input
                id="triggers"
                type="text"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                placeholder="es. Stress, mancanza di sonno"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrizione</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi il sintomo in dettaglio..."
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">
              <FaPlus className="icon-left" />
              Aggiungi sintomo
            </button>
          </div>
        </form>
      </div>
      
      {/* Symptoms History Section */}
      <div className="symptom-history-section">
        <div className="history-header">
          <h2>I tuoi sintomi</h2>
          <div className="filters-container">
            <div className="search-filter">
              <FaSearch />
              <input
                type="text"
                placeholder="Cerca sintomi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="intensity-filter">
              <select
                value={intensityFilter}
                onChange={(e) => setIntensityFilter(e.target.value)}
              >
                <option value="">Tutte le intensità</option>
                {intensityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">Caricamento dei sintomi...</div>
        ) : filteredSymptoms.length > 0 ? (
          <div className="symptoms-grid">
            {filteredSymptoms.map(symptom => (
              <div key={symptom.id} className="symptom-card">
                <div className="symptom-icon">
                  <FaNotesMedical />
                </div>
                <div className="symptom-details">
                  <h3>{symptom.name}</h3>
                  <p className={`symptom-intensity ${symptom.intensity}`}>
                    {symptom.intensity === 'lieve' ? 'Lieve' : 
                     symptom.intensity === 'moderato' ? 'Moderato' : 'Severo'}
                  </p>
                  {symptom.location && <p className="symptom-location">Posizione: {symptom.location}</p>}
                  {symptom.triggers && <p className="symptom-triggers">Fattori scatenanti: {symptom.triggers}</p>}
                  {symptom.description && <p className="symptom-description">{symptom.description}</p>}
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(symptom.id)}
                  >
                    <FaTrashAlt /> Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <img src="/assets/symptoms-empty.svg" alt="Nessun sintomo" />
            <h3>Nessun sintomo trovato</h3>
            <p>Aggiungi il tuo primo sintomo usando il form qui sopra.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymptomTracker; 