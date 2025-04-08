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
import { FaSearch, FaPills, FaPlus, FaTrashAlt } from 'react-icons/fa';
import '../styles/MedicationTracker.css';

const typeOptions = [
  { value: 'pillola', label: 'Pillola' },
  { value: 'capsula', label: 'Capsula' },
  { value: 'sciroppo', label: 'Sciroppo' },
  { value: 'fiala', label: 'Fiala' },
  { value: 'pomata', label: 'Pomata' },
  { value: 'gocce', label: 'Gocce' },
  { value: 'altro', label: 'Altro' }
];

const MedicationTracker = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('pillola');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate('/login');
      } else {
        loadMedications(currentUser.uid);
      }
    });
    
    return () => unsubscribe();
  }, [auth, navigate]);
  
  const loadMedications = async (userId) => {
    setLoading(true);
    try {
      const medicationsRef = collection(db, 'medications');
      const q = query(
        medicationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const medicationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMedications(medicationsList);
      setLoading(false);
    } catch (error) {
      console.error('Errore nel caricamento dei medicinali:', error);
      toast.error('Impossibile caricare i medicinali. Riprova più tardi.');
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !dosage || !type) {
      toast.error('Nome, dosaggio e tipo sono obbligatori');
      return;
    }
    
    try {
      const newMedication = {
        name,
        dosage,
        type,
        frequency: frequency || 'Al bisogno',
        notes,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'medications'), newMedication);
      
      // Reset form
      setName('');
      setDosage('');
      setType('pillola');
      setFrequency('');
      setNotes('');
      
      toast.success('Medicinale aggiunto con successo!');
      loadMedications(user.uid);
    } catch (error) {
      console.error('Errore durante il salvataggio del medicinale:', error);
      toast.error('Impossibile salvare il medicinale. Riprova più tardi.');
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo medicinale?')) {
      try {
        await deleteDoc(doc(db, 'medications', id));
        toast.success('Medicinale eliminato con successo');
        setMedications(medications.filter(medication => medication.id !== id));
      } catch (error) {
        console.error('Errore durante l\'eliminazione del medicinale:', error);
        toast.error('Impossibile eliminare il medicinale. Riprova più tardi.');
      }
    }
  };
  
  const filteredMedications = medications.filter(medication => {
    const matchesSearchTerm = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (medication.notes && medication.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTypeFilter = typeFilter === '' || medication.type === typeFilter;
    
    return matchesSearchTerm && matchesTypeFilter;
  });
  
  if (!user) {
    return <div className="loading-state">Caricamento...</div>;
  }
  
  return (
    <div className="medication-tracker-container">
      {/* Form Section */}
      <div className="medication-form-section">
        <h2>Aggiungi un nuovo medicinale</h2>
        <form className="medication-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome del medicinale *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Tachipirina"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dosage">Dosaggio *</label>
              <input
                id="dosage"
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="es. 1000mg"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Tipo *</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="frequency">Frequenza</label>
              <input
                id="frequency"
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="es. 1 volta al giorno"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Note</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive sul medicinale..."
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="submit-button">
              <FaPlus className="icon-left" />
              Aggiungi medicinale
            </button>
          </div>
        </form>
      </div>
      
      {/* Medications History Section */}
      <div className="medication-history-section">
        <div className="history-header">
          <h2>I tuoi medicinali</h2>
          <div className="filters-container">
            <div className="search-filter">
              <FaSearch />
              <input
                type="text"
                placeholder="Cerca medicinali..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="type-filter">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Tutti i tipi</option>
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">Caricamento dei medicinali...</div>
        ) : filteredMedications.length > 0 ? (
          <div className="medications-grid">
            {filteredMedications.map(medication => (
              <div key={medication.id} className="medication-card">
                <div className="medication-icon">
                  <FaPills />
                </div>
                <div className="medication-details">
                  <h3>{medication.name}</h3>
                  <p className="medication-dosage">{medication.dosage}</p>
                  <p className="medication-type">{medication.type}</p>
                  <p className="medication-frequency">{medication.frequency}</p>
                  {medication.notes && <p>{medication.notes}</p>}
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(medication.id)}
                  >
                    <FaTrashAlt /> Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <img src="/assets/meds-empty.svg" alt="Nessun medicinale" />
            <h3>Nessun medicinale trovato</h3>
            <p>Aggiungi il tuo primo medicinale usando il form qui sopra.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationTracker; 