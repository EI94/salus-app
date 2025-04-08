import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { toast } from 'react-toastify';

// Importa gli stili
import '../styles/MedicationTracker.css';

// Definizione dei tipi di farmaci disponibili
const typeOptions = [
  { value: 'antibiotico', label: 'Antibiotico' },
  { value: 'antidolorifico', label: 'Antidolorifico' },
  { value: 'antiinfiammatorio', label: 'Antiinfiammatorio' },
  { value: 'antistaminico', label: 'Antistaminico' },
  { value: 'vitamina', label: 'Vitamina/Integratore' },
  { value: 'antipertensivo', label: 'Antipertensivo' },
  { value: 'insulina', label: 'Insulina' },
  { value: 'anticoagulante', label: 'Anticoagulante' },
  { value: 'altro', label: 'Altro' }
];

function MedicationTracker() {
  // Stato per l'utente autenticato
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Stato per i farmaci
  const [medications, setMedications] = useState([]);
  
  // Stato per il form
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    type: typeOptions[0].value,
    frequency: '',
    notes: ''
  });
  
  // Stato per il filtro e la ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const navigate = useNavigate();
  
  // Monitoraggio dello stato di autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadMedications(currentUser.uid);
      } else {
        setMedications([]);
        setLoading(false);
        navigate('/login');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  // Funzione per caricare i farmaci da Firestore
  const loadMedications = async (userId) => {
    try {
      setLoading(true);
      const medicationsQuery = query(
        collection(db, 'medications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(medicationsQuery);
      const medicationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMedications(medicationsList);
    } catch (error) {
      console.error('Errore nel caricamento dei farmaci:', error);
      toast.error('Errore nel caricamento dei farmaci. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };
  
  // Gestione dei cambiamenti nel form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning("Devi effettuare l'accesso per aggiungere farmaci");
      navigate('/login');
      return;
    }
    
    // Validazione campi obbligatori
    if (!formData.name || !formData.dosage || !formData.type) {
      toast.warning('Nome, dosaggio e tipo sono campi obbligatori');
      return;
    }
    
    try {
      // Preparazione dati
      const medicationData = {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      
      // Salvataggio in Firestore
      const docRef = await addDoc(collection(db, 'medications'), medicationData);
      
      // Aggiornamento dell'interfaccia
      const newMedication = {
        id: docRef.id,
        ...medicationData,
        createdAt: new Date() // Usato per la visualizzazione immediata
      };
      
      setMedications(prev => [newMedication, ...prev]);
      
      // Reset del form
      setFormData({
        name: '',
        dosage: '',
        type: typeOptions[0].value,
        frequency: '',
        notes: ''
      });
      
      toast.success('Farmaco aggiunto con successo!');
    } catch (error) {
      console.error('Errore nell\'aggiunta del farmaco:', error);
      toast.error('Errore nell\'aggiunta del farmaco. Riprova più tardi.');
    }
  };
  
  // Eliminazione di un farmaco
  const handleDelete = async (medicationId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo farmaco?')) {
      return;
    }
    
    try {
      // Eliminazione da Firestore
      await deleteDoc(doc(db, 'medications', medicationId));
      
      // Aggiornamento dell'interfaccia
      setMedications(prev => prev.filter(med => med.id !== medicationId));
      
      toast.success('Farmaco eliminato con successo!');
    } catch (error) {
      console.error('Errore nell\'eliminazione del farmaco:', error);
      toast.error('Errore nell\'eliminazione del farmaco. Riprova più tardi.');
    }
  };
  
  // Filtro dei farmaci in base a ricerca e tipo
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (med.notes && med.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === '' || med.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Ottieni il nome completo del tipo di farmaco
  const getTypeName = (typeValue) => {
    const type = typeOptions.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
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
    <div className="medication-tracker-container">
      <h1 className="page-title">Gestione Farmaci</h1>
      
      {/* Form per aggiungere un farmaco */}
      <div className="medication-form-container">
        <h2>Aggiungi Nuovo Farmaco</h2>
        <form className="medication-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nome del Farmaco *</label>
              <input 
                type="text" 
                id="name"
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Inserisci il nome del farmaco"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dosage">Dosaggio *</label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="Es: 500mg, 1 compressa, 10ml"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Tipo di Farmaco *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
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
                type="text"
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                placeholder="Es: 1 volta al giorno, ogni 8 ore"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Note aggiuntive</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informazioni aggiuntive sul farmaco..."
              rows="3"
            />
          </div>
          
          <button type="submit" className="submit-button">
            Aggiungi Farmaco
          </button>
        </form>
      </div>
      
      {/* Lista dei farmaci */}
      <div className="medications-history">
        <h2>Farmaci registrati</h2>
          
        <div className="filters">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Cerca farmaci..." 
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
          
        {loading ? (
          <div className="loading-state">Caricamento farmaci...</div>
        ) : filteredMedications.length === 0 ? (
          <div className="empty-state">
            {medications.length === 0 
              ? "Nessun farmaco registrato. Usa il form sopra per aggiungere il tuo primo farmaco."
              : "Nessun farmaco corrisponde ai criteri di ricerca."}
          </div>
        ) : (
          <div className="medications-list">
            {filteredMedications.map(medication => (
              <div key={medication.id} className="medication-card">
                <div className="medication-header">
                  <h3>{medication.name}</h3>
                  <span className="medication-type">{getTypeName(medication.type)}</span>
                </div>
                
                <div className="medication-details">
                  <div className="detail-item">
                    <strong>Dosaggio:</strong> {medication.dosage}
                  </div>
                  
                  {medication.frequency && (
                    <div className="detail-item">
                      <strong>Frequenza:</strong> {medication.frequency}
                    </div>
                  )}
                  
                  {medication.notes && (
                    <div className="detail-item notes">
                      <strong>Note:</strong> {medication.notes}
                    </div>
                  )}
                  
                  <div className="detail-item date">
                    <strong>Data registrazione:</strong> {
                      medication.createdAt ? formatDate(medication.createdAt) : 'Data non disponibile'
                    }
                  </div>
                </div>
                
                <button 
                  className="delete-button" 
                  onClick={() => handleDelete(medication.id)}
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
}

export default MedicationTracker; 