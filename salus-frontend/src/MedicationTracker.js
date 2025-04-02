import React, { useState, useEffect } from 'react';
import API from './api';

function MedicationTracker({ userId }) {
  const [medications, setMedications] = useState([]);
  const [activeMedications, setActiveMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  
  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderTimes, setReminderTimes] = useState([]);
  
  // View state
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchMedications();
      fetchActiveMedications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchMedications = async () => {
    setLoading(true);
    setError(null);
    try {
      // In modalità demo, usa dati di esempio
      if (userId.startsWith('temp-') || userId.startsWith('user_')) {
        console.log('Modalità demo: uso dati di esempio per i farmaci');
        const mockMedications = generateMockMedications();
        setMedications(mockMedications);
        setFilteredMedications(mockMedications);
        return;
      }
      
      const response = await API.get(`/medications/${userId}`);
      console.log('Farmaci caricati:', response.data);
      
      // Verifica che response.data sia un array
      const medsData = Array.isArray(response.data) ? response.data : [];
      setMedications(medsData);
      setFilteredMedications(medsData);
    } catch (error) {
      console.error('Errore nel caricamento dei farmaci:', error);
      setMedications([]);
      setFilteredMedications([]);
      setError('Impossibile caricare i farmaci. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMedications = async () => {
    try {
      const response = await API.get(`/medications/${userId}/active`);
      setActiveMedications(response.data);
    } catch (error) {
      console.error('Errore nel caricamento dei medicinali attivi:', error);
    }
  };

  const handleAddReminderTime = () => {
    if (reminderTime && !reminderTimes.includes(reminderTime)) {
      setReminderTimes([...reminderTimes, reminderTime]);
    }
  };

  const handleRemoveReminderTime = (time) => {
    setReminderTimes(reminderTimes.filter(t => t !== time));
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setStartDate('');
    setEndDate('');
    setInstructions('');
    setReminderTime('08:00');
    setReminderTimes([]);
    setEditingMedication(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingMedication) {
        // Update existing medication
        await API.put(`/medications/${editingMedication._id}`, {
          name,
          dosage,
          frequency,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          instructions,
          reminderTimes
        });
        alert('Medicinale aggiornato con successo!');
      } else {
        // Add new medication
        await API.post('/medications', {
          userId,
          name,
          dosage,
          frequency,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          instructions,
          reminderTimes
        });
        alert('Medicinale registrato con successo!');
      }

      // Reset form and refresh data
      resetForm();
      setShowForm(false);
      fetchMedications();
      fetchActiveMedications();
    } catch (error) {
      console.error('Errore nella gestione del medicinale:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setName(medication.name);
    setDosage(medication.dosage);
    setFrequency(medication.frequency);
    setStartDate(medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : '');
    setEndDate(medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : '');
    setInstructions(medication.instructions || '');
    setReminderTimes(medication.reminderTimes || []);
    setShowForm(true);
  };

  const handleDeactivate = async (medicationId) => {
    try {
      await API.patch(`/medications/${medicationId}/deactivate`);
      alert('Medicinale disattivato');
      fetchMedications();
      fetchActiveMedications();
    } catch (error) {
      console.error('Errore nella disattivazione del medicinale:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Genera dati di esempio per la modalità demo
  const generateMockMedications = () => {
    return [
      {
        id: 'med-1',
        name: 'Tachipirina',
        dosage: '1000mg',
        frequency: 'Ogni 8 ore',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Prendere dopo i pasti',
        reminder: true,
        reminderTime: '08:00,16:00,00:00',
        status: 'active'
      },
      {
        id: 'med-2',
        name: 'Aspirina',
        dosage: '500mg',
        frequency: 'Una volta al giorno',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: null,
        notes: 'Prendere a stomaco pieno',
        reminder: true,
        reminderTime: '08:00',
        status: 'active'
      },
      {
        id: 'med-3',
        name: 'Moment',
        dosage: '200mg',
        frequency: 'Al bisogno',
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: null,
        notes: 'Massimo 3 al giorno',
        reminder: false,
        reminderTime: null,
        status: 'active'
      },
      {
        id: 'med-4',
        name: 'Antibiotico',
        dosage: '250mg',
        frequency: 'Due volte al giorno',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Ciclo di 7 giorni completato',
        reminder: false,
        reminderTime: null,
        status: 'completed'
      }
    ];
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Gestione Medicinali</h2>
      
      <div style={styles.actionBar}>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={styles.addButton}
        >
          {showForm ? 'Annulla' : 'Aggiungi Medicinale'}
        </button>
      </div>
      
      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>
            {editingMedication ? 'Modifica Medicinale' : 'Nuovo Medicinale'}
          </h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Nome:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es: Tachipirina"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Dosaggio:</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Es: 1000mg"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Frequenza:</label>
            <input
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="Es: 3 volte al giorno"
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data inizio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Data fine:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.dateInput}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Istruzioni:</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Es: Prendere dopo i pasti con un bicchiere d'acqua"
              style={styles.textarea}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Promemoria:</label>
            <div style={styles.reminderInput}>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                style={styles.timeInput}
              />
              <button 
                onClick={handleAddReminderTime}
                style={styles.smallButton}
              >
                Aggiungi
              </button>
            </div>
            
            <div style={styles.reminderTimes}>
              {reminderTimes.map((time, index) => (
                <div key={index} style={styles.reminderTag}>
                  {time}
                  <button 
                    onClick={() => handleRemoveReminderTime(time)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleSubmit}
            style={styles.submitButton}
            disabled={!name || !dosage || !frequency}
          >
            {editingMedication ? 'Aggiorna Medicinale' : 'Salva Medicinale'}
          </button>
        </div>
      )}
      
      <div style={styles.activeSection}>
        <h3 style={styles.subheading}>Medicinali Attivi</h3>
        {activeMedications.length === 0 ? (
          <p style={styles.emptyMessage}>Nessun medicinale attivo</p>
        ) : (
          <div style={styles.medicationList}>
            {activeMedications.map(med => (
              <div key={med._id} style={styles.medicationCard}>
                <div style={styles.medicationHeader}>
                  <h4 style={styles.medicationName}>{med.name}</h4>
                  <div style={styles.medicationActions}>
                    <button 
                      onClick={() => handleEdit(med)}
                      style={styles.actionButton}
                    >
                      Modifica
                    </button>
                    <button 
                      onClick={() => handleDeactivate(med._id)}
                      style={styles.actionButton}
                    >
                      Termina
                    </button>
                  </div>
                </div>
                <div style={styles.medicationDetails}>
                  <div style={styles.medicationDetail}>
                    <strong>Dosaggio:</strong> {med.dosage}
                  </div>
                  <div style={styles.medicationDetail}>
                    <strong>Frequenza:</strong> {med.frequency}
                  </div>
                  {med.startDate && (
                    <div style={styles.medicationDetail}>
                      <strong>Inizio:</strong> {formatDate(med.startDate)}
                    </div>
                  )}
                  {med.endDate && (
                    <div style={styles.medicationDetail}>
                      <strong>Fine:</strong> {formatDate(med.endDate)}
                    </div>
                  )}
                  {med.instructions && (
                    <div style={styles.medicationInstructions}>
                      <strong>Istruzioni:</strong> {med.instructions}
                    </div>
                  )}
                  {med.reminderTimes && med.reminderTimes.length > 0 && (
                    <div style={styles.medicationReminders}>
                      <strong>Promemoria:</strong> {med.reminderTimes.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={styles.historySection}>
        <h3 style={styles.subheading}>Storico Medicinali</h3>
        {medications.length === 0 ? (
          <p style={styles.emptyMessage}>Nessun medicinale nella cronologia</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Nome</th>
                <th style={styles.tableHeader}>Dosaggio</th>
                <th style={styles.tableHeader}>Inizio</th>
                <th style={styles.tableHeader}>Stato</th>
                <th style={styles.tableHeader}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {medications.map(med => (
                <tr key={med._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{med.name}</td>
                  <td style={styles.tableCell}>{med.dosage}</td>
                  <td style={styles.tableCell}>{formatDate(med.startDate)}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusTag,
                      backgroundColor: med.active ? '#e1f5fe' : '#ffebee'
                    }}>
                      {med.active ? 'Attivo' : 'Terminato'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      onClick={() => handleEdit(med)}
                      style={styles.smallActionButton}
                    >
                      Modifica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Stili in-line
const styles = {
  container: {
    padding: '1rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  heading: {
    color: '#2c3e50',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem'
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '1rem 0'
  },
  addButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '1.5rem',
    borderRadius: '5px',
    marginBottom: '2rem',
    border: '1px solid #ddd'
  },
  formTitle: {
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '1.5rem',
    borderBottom: '1px solid #bdc3c7',
    paddingBottom: '0.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  dateInput: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%'
  },
  timeInput: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minHeight: '100px',
    fontFamily: 'inherit'
  },
  reminderInput: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  reminderTimes: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  reminderTag: {
    backgroundColor: '#e3f2fd',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem'
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#e74c3c',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginLeft: '5px',
    fontSize: '1.2rem',
    padding: '0 5px'
  },
  smallButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  activeSection: {
    marginBottom: '2rem'
  },
  subheading: {
    color: '#2c3e50',
    borderBottom: '1px solid #bdc3c7',
    paddingBottom: '0.5rem',
    marginBottom: '1rem'
  },
  medicationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  medicationCard: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    border: '1px solid #dee2e6'
  },
  medicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '0.5rem'
  },
  medicationName: {
    margin: 0,
    color: '#2c3e50'
  },
  medicationActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  actionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e9ecef',
    color: '#495057',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  medicationDetails: {
    fontSize: '0.95rem'
  },
  medicationDetail: {
    margin: '0.25rem 0'
  },
  medicationInstructions: {
    margin: '0.5rem 0',
    fontStyle: 'italic'
  },
  medicationReminders: {
    margin: '0.5rem 0',
    color: '#0d6efd'
  },
  historySection: {
    marginTop: '2rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem'
  },
  tableHeader: {
    backgroundColor: '#e9ecef',
    padding: '0.75rem',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6'
  },
  tableRow: {
    borderBottom: '1px solid #e9ecef'
  },
  tableCell: {
    padding: '0.75rem',
    textAlign: 'left'
  },
  statusTag: {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: 'bold'
  },
  smallActionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e9ecef',
    color: '#495057',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem'
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#6c757d'
  }
};

export default MedicationTracker; 