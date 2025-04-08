import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  loadUserMedications, 
  loadUserReminders, 
  addReminder, 
  updateReminderStatus, 
  deleteReminder 
} from '../firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isToday, isSameDay, parseISO, isAfter } from 'date-fns';
import { it } from 'date-fns/locale';
import { IoMdAdd, IoMdCheckmark, IoIosClose, IoMdNotifications } from 'react-icons/io';

// Stili per l'icona di notifica
const notificationIconStyle = {
  color: '#ff6b6b',
  marginRight: '10px',
  fontSize: '1.2rem',
  verticalAlign: 'middle'
};

// Componente principale per il promemoria dei farmaci
function MedicationReminder() {
  // Stati per i dati
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Stati per il form di aggiunta promemoria
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    medicationId: '',
    frequency: 'daily',
    time: '09:00',
    days: [],
    notifyBefore: 15, // minuti prima
    dayOfWeek: 1, // lunedì
    dayOfMonth: 1
  });

  // Carica l'utente autenticato
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserData(currentUser.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Carica i dati dell'utente
  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      // Carica farmaci e promemoria
      const medsData = await loadUserMedications();
      const remindersData = await loadUserReminders();
      
      setMedications(medsData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      toast.error('Errore nel caricamento dei dati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Gestisce il cambio nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reimposta il form ai valori predefiniti
  const resetForm = () => {
    setFormData({
      medicationId: '',
      frequency: 'daily',
      time: '09:00',
      days: [],
      notifyBefore: 15,
      dayOfWeek: 1,
      dayOfMonth: 1
    });
    setShowAddForm(false);
  };

  // Invia il form per aggiungere un nuovo promemoria
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.medicationId) {
      toast.error('Seleziona un farmaco!');
      return;
    }
    
    // Trova il farmaco selezionato per il nome
    const selectedMedication = medications.find(med => med.id === formData.medicationId);
    
    try {
      const reminderData = {
        ...formData,
        medicationName: selectedMedication.name,
        medicationType: selectedMedication.type,
        medicationDosage: selectedMedication.dosage
      };
      
      const result = await addReminder(reminderData);
      
      if (result.success) {
        toast.success('Promemoria aggiunto con successo!');
        // Aggiorna la lista dei promemoria
        const updatedReminders = await loadUserReminders();
        setReminders(updatedReminders);
        resetForm();
      } else {
        toast.error(result.error || 'Errore nell\'aggiunta del promemoria.');
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta del promemoria:', error);
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };

  // Gestisce l'aggiornamento dello stato di un promemoria (completato, saltato)
  const handleReminderAction = async (reminderId, action) => {
    try {
      const result = await updateReminderStatus(reminderId, action);
      
      if (result.success) {
        toast.success(
          action === 'completed' ? 'Farmaco assunto!' : 'Promemoria saltato'
        );
        
        // Aggiorna la lista dei promemoria
        const updatedReminders = await loadUserReminders();
        setReminders(updatedReminders);
      } else {
        toast.error(result.error || `Errore durante l'aggiornamento del promemoria.`);
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del promemoria:', error);
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };

  // Gestisce l'eliminazione di un promemoria
  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo promemoria?')) {
      try {
        const result = await deleteReminder(reminderId);
        
        if (result.success) {
          toast.success('Promemoria eliminato con successo!');
          
          // Aggiorna la lista dei promemoria
          setReminders(reminders.filter(r => r.id !== reminderId));
        } else {
          toast.error(result.error || 'Errore nell\'eliminazione del promemoria.');
        }
      } catch (error) {
        console.error('Errore nell\'eliminazione del promemoria:', error);
        toast.error('Si è verificato un errore. Riprova più tardi.');
      }
    }
  };

  // Filtra i promemoria per la data selezionata
  const getRemindersForSelectedDate = () => {
    return reminders.filter(reminder => {
      const dueDate = parseISO(reminder.nextDueDate);
      return isSameDay(dueDate, selectedDate);
    });
  };

  // Verifica se ci sono promemoria per una data specifica
  // Usato per evidenziare le date nel calendario
  const hasRemindersForDate = (date) => {
    return reminders.some(reminder => {
      const dueDate = parseISO(reminder.nextDueDate);
      return isSameDay(dueDate, date);
    });
  };

  // Personalizza l'aspetto delle date nel calendario
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && hasRemindersForDate(date)) {
      return 'has-reminders';
    }
    return null;
  };

  // Contenuto alternativo durante il caricamento o se non ci sono dati
  const renderPlaceholderContent = () => {
    if (loading) {
      return <div className="loading-container"><p>Caricamento promemoria...</p></div>;
    }
    
    if (!user) {
      return (
        <div className="auth-prompt">
          <p>Accedi per gestire i tuoi promemoria farmaci</p>
        </div>
      );
    }
    
    if (reminders.length === 0) {
      return (
        <div className="empty-state">
          <p>Non hai ancora impostato promemoria per i tuoi farmaci</p>
          <button 
            className="action-button" 
            onClick={() => setShowAddForm(true)}
          >
            Aggiungi il tuo primo promemoria
          </button>
        </div>
      );
    }
    
    return null;
  };

  // Mostra i dettagli di frequenza in modo leggibile
  const renderFrequencyDetails = (reminder) => {
    switch (reminder.frequency) {
      case 'daily':
        return 'Ogni giorno';
      case 'weekly':
        const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
        return `Ogni ${days[reminder.dayOfWeek]}`;
      case 'monthly':
        return `Il giorno ${reminder.dayOfMonth} di ogni mese`;
      case 'custom':
        return `Ogni ${reminder.intervalHours} ore`;
      default:
        return 'Pianificazione personalizzata';
    }
  };

  // Componente effettivo
  return (
    <div className="medication-reminder-container">
      <h2>Promemoria Farmaci</h2>
      
      {/* Placeholder durante caricamento o stato vuoto */}
      {renderPlaceholderContent()}
      
      {user && !loading && (
        <div className="reminder-content">
          {/* Calendario per visualizzare e selezionare i giorni */}
          <div className="calendar-section">
            <Calendar 
              onChange={setSelectedDate} 
              value={selectedDate}
              locale={it}
              tileClassName={tileClassName}
            />
            
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color has-reminders-sample"></span>
                <span className="legend-text">Giorni con promemoria</span>
              </div>
              <div className="legend-item">
                <span className="legend-color today-sample"></span>
                <span className="legend-text">Oggi</span>
              </div>
            </div>
          </div>
          
          {/* Elenco promemoria per la data selezionata */}
          <div className="reminders-list-section">
            <div className="section-header">
              <h3>
                Promemoria per {isToday(selectedDate) ? 'Oggi' : format(selectedDate, 'd MMMM yyyy', { locale: it })}
              </h3>
              <button 
                className="add-button" 
                onClick={() => setShowAddForm(true)}
                aria-label="Aggiungi promemoria"
              >
                <IoMdAdd />
              </button>
            </div>
            
            {getRemindersForSelectedDate().length === 0 ? (
              <p className="no-reminders-message">
                Nessun promemoria programmato per questa data
              </p>
            ) : (
              <ul className="reminders-list">
                {getRemindersForSelectedDate().map(reminder => (
                  <li key={reminder.id} className="reminder-item">
                    <div className="reminder-header">
                      <IoMdNotifications style={notificationIconStyle} />
                      <span className="medication-name">{reminder.medicationName}</span>
                      <span className="medication-dosage">{reminder.medicationDosage}</span>
                    </div>
                    
                    <div className="reminder-details">
                      <p className="reminder-time">
                        Orario: <strong>{reminder.time}</strong>
                      </p>
                      <p className="reminder-frequency">
                        {renderFrequencyDetails(reminder)}
                      </p>
                    </div>
                    
                    <div className="reminder-actions">
                      <button 
                        className="action-button complete"
                        onClick={() => handleReminderAction(reminder.id, 'completed')}
                        aria-label="Segna come completato"
                      >
                        <IoMdCheckmark /> Preso
                      </button>
                      <button 
                        className="action-button skip"
                        onClick={() => handleReminderAction(reminder.id, 'skipped')}
                        aria-label="Salta"
                      >
                        <IoIosClose /> Salta
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        aria-label="Elimina promemoria"
                      >
                        Elimina
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Form per aggiungere un nuovo promemoria */}
          {showAddForm && (
            <div className="add-reminder-form-container">
              <div className="form-header">
                <h3>Aggiungi Promemoria</h3>
                <button 
                  className="close-button" 
                  onClick={() => setShowAddForm(false)}
                >
                  <IoIosClose />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="add-reminder-form">
                <div className="form-group">
                  <label htmlFor="medicationId">Farmaco:</label>
                  <select 
                    id="medicationId" 
                    name="medicationId" 
                    value={formData.medicationId} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleziona un farmaco</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.dosage})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="frequency">Frequenza:</label>
                  <select 
                    id="frequency" 
                    name="frequency" 
                    value={formData.frequency} 
                    onChange={handleChange}
                  >
                    <option value="daily">Ogni giorno</option>
                    <option value="weekly">Settimanale</option>
                    <option value="monthly">Mensile</option>
                    <option value="custom">Personalizzata</option>
                  </select>
                </div>
                
                {formData.frequency === 'weekly' && (
                  <div className="form-group">
                    <label htmlFor="dayOfWeek">Giorno della settimana:</label>
                    <select 
                      id="dayOfWeek" 
                      name="dayOfWeek" 
                      value={formData.dayOfWeek} 
                      onChange={handleChange}
                    >
                      <option value="1">Lunedì</option>
                      <option value="2">Martedì</option>
                      <option value="3">Mercoledì</option>
                      <option value="4">Giovedì</option>
                      <option value="5">Venerdì</option>
                      <option value="6">Sabato</option>
                      <option value="0">Domenica</option>
                    </select>
                  </div>
                )}
                
                {formData.frequency === 'monthly' && (
                  <div className="form-group">
                    <label htmlFor="dayOfMonth">Giorno del mese:</label>
                    <select 
                      id="dayOfMonth" 
                      name="dayOfMonth" 
                      value={formData.dayOfMonth} 
                      onChange={handleChange}
                    >
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {formData.frequency === 'custom' && (
                  <div className="form-group">
                    <label htmlFor="intervalHours">Intervallo (ore):</label>
                    <input 
                      type="number" 
                      id="intervalHours" 
                      name="intervalHours" 
                      min="1" 
                      max="72" 
                      value={formData.intervalHours || 24} 
                      onChange={handleChange}
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="time">Orario:</label>
                  <input 
                    type="time" 
                    id="time" 
                    name="time" 
                    value={formData.time} 
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notifyBefore">Notifica (minuti prima):</label>
                  <select 
                    id="notifyBefore" 
                    name="notifyBefore" 
                    value={formData.notifyBefore} 
                    onChange={handleChange}
                  >
                    <option value="5">5 minuti prima</option>
                    <option value="15">15 minuti prima</option>
                    <option value="30">30 minuti prima</option>
                    <option value="60">1 ora prima</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-button" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Annulla
                  </button>
                  <button type="submit" className="submit-button">
                    Salva Promemoria
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Stili CSS per il componente */}
      <style jsx>{`
        .medication-reminder-container {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        h2 {
          color: #333;
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .loading-container, .auth-prompt, .empty-state {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        
        .reminder-content {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .calendar-section {
          flex: 1;
          min-width: 300px;
        }
        
        .reminders-list-section {
          flex: 2;
          min-width: 300px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .add-button {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
        }
        
        .reminders-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .reminder-item {
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
          border-left: 4px solid #4caf50;
        }
        
        .reminder-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .medication-name {
          font-weight: bold;
          font-size: 1.1em;
          margin-right: 10px;
        }
        
        .medication-dosage {
          color: #666;
          background-color: #eee;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .reminder-details {
          margin-bottom: 15px;
          font-size: 0.9em;
        }
        
        .reminder-time, .reminder-frequency {
          margin: 5px 0;
        }
        
        .reminder-actions {
          display: flex;
          gap: 10px;
        }
        
        .action-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .action-button.complete {
          background-color: #4caf50;
          color: white;
        }
        
        .action-button.skip {
          background-color: #ff9800;
          color: white;
        }
        
        .action-button.delete {
          background-color: #f44336;
          color: white;
        }
        
        .no-reminders-message {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }
        
        .add-reminder-form-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .add-reminder-form {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .form-group input, .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .cancel-button {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .submit-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        /* Stili per il calendario */
        .calendar-legend {
          margin-top: 10px;
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          font-size: 0.8em;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          margin-right: 5px;
          border-radius: 50%;
        }
        
        .has-reminders-sample {
          background-color: #4caf50;
        }
        
        .today-sample {
          background-color: #1087ff;
        }
        
        /* Customizzazione del calendario react-calendar */
        :global(.react-calendar) {
          width: 100%;
          border: none;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          font-family: inherit;
        }
        
        :global(.react-calendar__tile--active) {
          background-color: #1087ff;
          color: white;
        }
        
        :global(.has-reminders) {
          position: relative;
        }
        
        :global(.has-reminders::after) {
          content: "";
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #4caf50;
        }
        
        /* Responsività */
        @media (max-width: 768px) {
          .reminder-content {
            flex-direction: column;
          }
          
          .calendar-section, .reminders-list-section {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default MedicationReminder; 