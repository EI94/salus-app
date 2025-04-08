import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  loadUserAppointments, 
  addAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '../firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isToday, isSameDay, parseISO, addMinutes } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  IoMdAdd, 
  IoMdCheckmark, 
  IoIosClose, 
  IoMdCalendar, 
  IoMdTime,
  IoMdPerson,
  IoMdClipboard,
  IoMdPin
} from 'react-icons/io';

// Stili per l'icona del calendario
const calendarIconStyle = {
  color: '#4a6eb5',
  marginRight: '10px',
  fontSize: '1.2rem',
  verticalAlign: 'middle'
};

// Tipi di appuntamenti
const appointmentTypes = [
  { value: 'checkup', label: 'Visita di controllo' },
  { value: 'specialistic', label: 'Visita specialistica' },
  { value: 'examination', label: 'Esame diagnostico' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'vaccination', label: 'Vaccinazione' },
  { value: 'other', label: 'Altro' }
];

// Componente principale per la gestione degli appuntamenti
function AppointmentManager() {
  // Stati per i dati
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Stati per il form di aggiunta appuntamento
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    doctor: '',
    location: '',
    type: 'checkup',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 30,
    notes: '',
    documents: [],
    reminderMinutes: 60
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

  // Carica i dati degli appuntamenti dell'utente
  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      // Carica appuntamenti
      const appointmentsData = await loadUserAppointments();
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Errore nel caricamento degli appuntamenti:', error);
      toast.error('Errore nel caricamento degli appuntamenti. Riprova più tardi.');
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
      title: '',
      doctor: '',
      location: '',
      type: 'checkup',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      duration: 30,
      notes: '',
      documents: [],
      reminderMinutes: 60
    });
    setShowAddForm(false);
  };

  // Invia il form per aggiungere un nuovo appuntamento
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Inserisci il titolo dell\'appuntamento!');
      return;
    }
    
    try {
      // Combina data e ora per ottenere la data completa dell'appuntamento
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      const appointmentDateTime = new Date(dateTimeString);
      
      // Calcola l'orario del promemoria sottraendo i minuti specificati
      const reminderTime = addMinutes(appointmentDateTime, -formData.reminderMinutes);
      
      const appointmentData = {
        ...formData,
        date: appointmentDateTime.toISOString(),
        reminderTime: reminderTime.toISOString(),
        status: 'scheduled'
      };
      
      const result = await addAppointment(appointmentData);
      
      if (result.success) {
        toast.success('Appuntamento aggiunto con successo!');
        // Aggiorna la lista degli appuntamenti
        const updatedAppointments = await loadUserAppointments();
        setAppointments(updatedAppointments);
        resetForm();
      } else {
        toast.error(result.error || 'Errore nell\'aggiunta dell\'appuntamento.');
      }
    } catch (error) {
      console.error('Errore nell\'aggiunta dell\'appuntamento:', error);
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };

  // Gestisce l'aggiornamento dello stato di un appuntamento
  const handleAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const result = await updateAppointment(appointmentId, { status: newStatus });
      
      if (result.success) {
        toast.success(
          newStatus === 'completed' ? 'Appuntamento contrassegnato come completato!' : 
          newStatus === 'cancelled' ? 'Appuntamento cancellato' :
          'Stato appuntamento aggiornato'
        );
        
        // Aggiorna la lista degli appuntamenti
        const updatedAppointments = await loadUserAppointments();
        setAppointments(updatedAppointments);
      } else {
        toast.error(result.error || 'Errore durante l\'aggiornamento dello stato.');
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato:', error);
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };

  // Gestisce l'eliminazione di un appuntamento
  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      try {
        const result = await deleteAppointment(appointmentId);
        
        if (result.success) {
          toast.success('Appuntamento eliminato con successo!');
          
          // Aggiorna la lista degli appuntamenti
          setAppointments(appointments.filter(a => a.id !== appointmentId));
        } else {
          toast.error(result.error || 'Errore nell\'eliminazione dell\'appuntamento.');
        }
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
        toast.error('Si è verificato un errore. Riprova più tardi.');
      }
    }
  };

  // Filtra gli appuntamenti per la data selezionata
  const getAppointmentsForSelectedDate = () => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date);
      return isSameDay(appointmentDate, selectedDate);
    });
  };

  // Verifica se ci sono appuntamenti per una data specifica
  // Usato per evidenziare le date nel calendario
  const hasAppointmentsForDate = (date) => {
    return appointments.some(appointment => {
      const appointmentDate = parseISO(appointment.date);
      return isSameDay(appointmentDate, date);
    });
  };

  // Personalizza l'aspetto delle date nel calendario
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && hasAppointmentsForDate(date)) {
      return 'has-appointments';
    }
    return null;
  };

  // Ottiene il tipo di appuntamento in formato leggibile
  const getAppointmentTypeLabel = (typeValue) => {
    const found = appointmentTypes.find(type => type.value === typeValue);
    return found ? found.label : 'Altro';
  };

  // Contenuto alternativo durante il caricamento o se non ci sono dati
  const renderPlaceholderContent = () => {
    if (loading) {
      return <div className="loading-container"><p>Caricamento appuntamenti...</p></div>;
    }
    
    if (!user) {
      return (
        <div className="auth-prompt">
          <p>Accedi per gestire i tuoi appuntamenti medici</p>
        </div>
      );
    }
    
    if (appointments.length === 0) {
      return (
        <div className="empty-state">
          <p>Non hai ancora registrato appuntamenti medici</p>
          <button 
            className="action-button" 
            onClick={() => setShowAddForm(true)}
          >
            Aggiungi il tuo primo appuntamento
          </button>
        </div>
      );
    }
    
    return null;
  };

  // Componente effettivo
  return (
    <div className="appointment-manager-container">
      <h2>Gestione Appuntamenti Medici</h2>
      
      {/* Placeholder durante caricamento o stato vuoto */}
      {renderPlaceholderContent()}
      
      {user && !loading && (
        <div className="appointment-content">
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
                <span className="legend-color has-appointments-sample"></span>
                <span className="legend-text">Giorni con appuntamenti</span>
              </div>
              <div className="legend-item">
                <span className="legend-color today-sample"></span>
                <span className="legend-text">Oggi</span>
              </div>
            </div>
          </div>
          
          {/* Elenco appuntamenti per la data selezionata */}
          <div className="appointments-list-section">
            <div className="section-header">
              <h3>
                Appuntamenti per {isToday(selectedDate) ? 'Oggi' : format(selectedDate, 'd MMMM yyyy', { locale: it })}
              </h3>
              <button 
                className="add-button" 
                onClick={() => setShowAddForm(true)}
                aria-label="Aggiungi appuntamento"
              >
                <IoMdAdd />
              </button>
            </div>
            
            {getAppointmentsForSelectedDate().length === 0 ? (
              <p className="no-appointments-message">
                Nessun appuntamento programmato per questa data
              </p>
            ) : (
              <ul className="appointments-list">
                {getAppointmentsForSelectedDate().map(appointment => (
                  <li key={appointment.id} className="appointment-item">
                    <div className="appointment-header">
                      <IoMdCalendar style={calendarIconStyle} />
                      <span className="appointment-title">{appointment.title}</span>
                      <span className="appointment-type">{getAppointmentTypeLabel(appointment.type)}</span>
                    </div>
                    
                    <div className="appointment-details">
                      <p className="appointment-time">
                        <IoMdTime /> {format(parseISO(appointment.date), 'HH:mm', { locale: it })}
                        {appointment.duration && <span> ({appointment.duration} min)</span>}
                      </p>
                      
                      {appointment.doctor && (
                        <p className="appointment-doctor">
                          <IoMdPerson /> Dott. {appointment.doctor}
                        </p>
                      )}
                      
                      {appointment.location && (
                        <p className="appointment-location">
                          <IoMdPin /> {appointment.location}
                        </p>
                      )}
                      
                      {appointment.notes && (
                        <p className="appointment-notes">
                          <IoMdClipboard /> {appointment.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="appointment-status">
                      Stato: <span className={`status-badge ${appointment.status}`}>
                        {appointment.status === 'scheduled' ? 'Programmato' : 
                         appointment.status === 'completed' ? 'Completato' : 
                         appointment.status === 'cancelled' ? 'Cancellato' : 'In attesa'}
                      </span>
                    </div>
                    
                    <div className="appointment-actions">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button 
                            className="action-button complete"
                            onClick={() => handleAppointmentStatus(appointment.id, 'completed')}
                            aria-label="Segna come completato"
                          >
                            <IoMdCheckmark /> Completato
                          </button>
                          <button 
                            className="action-button skip"
                            onClick={() => handleAppointmentStatus(appointment.id, 'cancelled')}
                            aria-label="Cancella"
                          >
                            <IoIosClose /> Cancella
                          </button>
                        </>
                      )}
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        aria-label="Elimina appuntamento"
                      >
                        Elimina
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Form per aggiungere un nuovo appuntamento */}
          {showAddForm && (
            <div className="add-appointment-form-container">
              <div className="form-header">
                <h3>Aggiungi Appuntamento</h3>
                <button 
                  className="close-button" 
                  onClick={() => setShowAddForm(false)}
                >
                  <IoIosClose />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="add-appointment-form">
                <div className="form-group">
                  <label htmlFor="title">Titolo / Motivo visita:</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange}
                    required
                    placeholder="Es. Visita cardiologica"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="type">Tipo di appuntamento:</label>
                  <select 
                    id="type" 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange}
                  >
                    {appointmentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Data:</label>
                    <input 
                      type="date" 
                      id="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="time">Ora:</label>
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
                    <label htmlFor="duration">Durata (min):</label>
                    <input 
                      type="number" 
                      id="duration" 
                      name="duration" 
                      min="5" 
                      max="240" 
                      value={formData.duration} 
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="doctor">Medico / Specialista:</label>
                  <input 
                    type="text" 
                    id="doctor" 
                    name="doctor" 
                    value={formData.doctor} 
                    onChange={handleChange}
                    placeholder="Es. Dott. Rossi"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Luogo:</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange}
                    placeholder="Es. Ospedale San Raffaele, Piano 2"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Note (documenti, preparazione, etc.):</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange}
                    rows="3"
                    placeholder="Es. Portare impegnativa, essere a digiuno..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reminderMinutes">Promemoria:</label>
                  <select 
                    id="reminderMinutes" 
                    name="reminderMinutes" 
                    value={formData.reminderMinutes} 
                    onChange={handleChange}
                  >
                    <option value="30">30 minuti prima</option>
                    <option value="60">1 ora prima</option>
                    <option value="120">2 ore prima</option>
                    <option value="1440">1 giorno prima</option>
                    <option value="2880">2 giorni prima</option>
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
                    Salva Appuntamento
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Stili CSS per il componente */}
      <style jsx>{`
        .appointment-manager-container {
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
        
        .appointment-content {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .calendar-section {
          flex: 1;
          min-width: 300px;
        }
        
        .appointments-list-section {
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
          background-color: #4a6eb5;
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
        
        .appointments-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .appointment-item {
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
          border-left: 4px solid #4a6eb5;
        }
        
        .appointment-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .appointment-title {
          font-weight: bold;
          font-size: 1.1em;
          margin-right: 10px;
        }
        
        .appointment-type {
          color: #666;
          background-color: #eee;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .appointment-details {
          margin-bottom: 15px;
          font-size: 0.9em;
        }
        
        .appointment-time, 
        .appointment-doctor, 
        .appointment-location, 
        .appointment-notes {
          margin: 5px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .appointment-status {
          margin-bottom: 15px;
          font-size: 0.9em;
        }
        
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .status-badge.scheduled {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .status-badge.completed {
          background-color: #e8f5e9;
          color: #388e3c;
        }
        
        .status-badge.cancelled {
          background-color: #ffebee;
          color: #d32f2f;
        }
        
        .appointment-actions {
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
        
        .no-appointments-message {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }
        
        .add-appointment-form-container {
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
        
        .add-appointment-form {
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
        
        .form-row {
          display: flex;
          gap: 10px;
        }
        
        .form-row .form-group {
          flex: 1;
          min-width: 0;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .form-group input, 
        .form-group select, 
        .form-group textarea {
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
          background-color: #4a6eb5;
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
        
        .has-appointments-sample {
          background-color: #4a6eb5;
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
        
        :global(.has-appointments) {
          position: relative;
        }
        
        :global(.has-appointments::after) {
          content: "";
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #4a6eb5;
        }
        
        /* Responsività */
        @media (max-width: 768px) {
          .appointment-content {
            flex-direction: column;
          }
          
          .calendar-section, .appointments-list-section {
            width: 100%;
          }
          
          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default AppointmentManager; 