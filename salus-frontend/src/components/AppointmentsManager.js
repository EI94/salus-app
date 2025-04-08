import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, FiClock, FiMapPin, FiUser, FiPlus, 
  FiTrash2, FiEdit2, FiCheckCircle, FiAlertCircle, FiSearch, FiFilter 
} from 'react-icons/fi';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const AppointmentsManager = () => {
  const [appointments, setAppointments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    doctor: '',
    specialty: '',
    date: '',
    time: '',
    location: '',
    notes: '',
    status: 'scheduled' // scheduled, completed, cancelled
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch appointments from API or use mock data for demo
  useEffect(() => {
    // Mock data for demo purposes
    const mockAppointments = [
      {
        id: 1,
        title: 'Visita cardiologica',
        doctor: 'Dr. Rossi Maria',
        specialty: 'Cardiologia',
        date: '2023-07-15',
        time: '09:30',
        location: 'Ospedale San Raffaele, Milano',
        notes: 'Portare elettrocardiogramma precedente',
        status: 'completed'
      },
      {
        id: 2,
        title: 'Controllo ortopedico',
        doctor: 'Dr. Bianchi Paolo',
        specialty: 'Ortopedia',
        date: '2023-11-20',
        time: '14:00',
        location: 'Studio Medico Centrale, Via Roma 42, Torino',
        notes: 'Controllo post operazione',
        status: 'scheduled'
      },
      {
        id: 3,
        title: 'Esame del sangue',
        doctor: '',
        specialty: 'Analisi cliniche',
        date: '2023-10-05',
        time: '08:00',
        location: 'Laboratorio Gamma, Via Verdi 12, Roma',
        notes: 'Digiuno di 8 ore',
        status: 'scheduled'
      }
    ];

    // Simulate API loading
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 600);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      doctor: '',
      specialty: '',
      date: '',
      time: '',
      location: '',
      notes: '',
      status: 'scheduled'
    });
    setEditMode(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editMode) {
      // Update existing appointment
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === formData.id ? formData : appointment
      );
      setAppointments(updatedAppointments);
    } else {
      // Add new appointment
      const newAppointment = {
        ...formData,
        id: Date.now() // Simple ID generation for demo
      };
      setAppointments([...appointments, newAppointment]);
    }
    
    // Reset form and close
    resetForm();
    setShowAddForm(false);
  };

  // Edit appointment
  const handleEdit = (appointment) => {
    setFormData(appointment);
    setEditMode(true);
    setShowAddForm(true);
  };

  // Delete appointment
  const handleDelete = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
      setAppointments(appointments.filter(appointment => appointment.id !== id));
    }
  };

  // Change appointment status
  const handleStatusChange = (id, status) => {
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === id ? { ...appointment, status } : appointment
    );
    setAppointments(updatedAppointments);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    if (filter === 'upcoming' && appointment.status !== 'scheduled') return false;
    if (filter === 'past' && appointment.status !== 'completed') return false;
    
    // Filter by search term
    if (searchTerm.trim() === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.title.toLowerCase().includes(searchLower) ||
      appointment.doctor.toLowerCase().includes(searchLower) ||
      appointment.specialty.toLowerCase().includes(searchLower) ||
      appointment.location.toLowerCase().includes(searchLower)
    );
  });

  // Group appointments by month
  const groupedAppointments = filteredAppointments.reduce((groups, appointment) => {
    const monthYear = appointment.date.substring(0, 7); // "YYYY-MM"
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(appointment);
    return groups;
  }, {});

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: it });
    } catch (error) {
      return dateString;
    }
  };

  // Format month year for display
  const formatMonthYear = (monthYear) => {
    try {
      const date = new Date(`${monthYear}-01`);
      return format(date, 'MMMM yyyy', { locale: it });
    } catch (error) {
      return monthYear;
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch(status) {
      case 'scheduled':
        return { color: '#2196f3', icon: <FiCalendar />, text: 'Programmato' };
      case 'completed':
        return { color: '#4caf50', icon: <FiCheckCircle />, text: 'Completato' };
      case 'cancelled':
        return { color: '#f44336', icon: <FiAlertCircle />, text: 'Cancellato' };
      default:
        return { color: '#757575', icon: <FiCalendar />, text: 'Sconosciuto' };
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="appointments-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento appuntamenti...</p>
      </div>
    );
  }

  return (
    <div className="appointments-manager">
      <div className="appointments-header">
        <h1>Gestione Appuntamenti Medici</h1>
        <p>Organizza, tieni traccia e ricevi promemoria per tutti i tuoi appuntamenti medici</p>
      </div>
      
      <div className="appointments-actions">
        <div className="search-filter">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Cerca appuntamenti..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <FiFilter className="filter-icon" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tutti</option>
              <option value="upcoming">Prossimi</option>
              <option value="past">Passati</option>
            </select>
          </div>
        </div>
        
        <button 
          className="add-appointment-button"
          onClick={() => {resetForm(); setShowAddForm(true)}}
        >
          <FiPlus /> Nuovo Appuntamento
        </button>
      </div>
      
      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <div className="empty-icon">
            <FiCalendar size={48} />
          </div>
          <h3>Nessun appuntamento trovato</h3>
          <p>
            {searchTerm ? 
              "Nessun appuntamento corrisponde alla tua ricerca." : 
              "Non hai ancora aggiunto appuntamenti. Clicca su 'Nuovo Appuntamento' per iniziare."
            }
          </p>
        </div>
      ) : (
        <div className="appointments-list">
          {Object.keys(groupedAppointments).sort().reverse().map(monthYear => (
            <div key={monthYear} className="month-group">
              <h3 className="month-header">{formatMonthYear(monthYear)}</h3>
              
              <div className="appointments-grid">
                {groupedAppointments[monthYear].map(appointment => {
                  const statusInfo = getStatusInfo(appointment.status);
                  
                  return (
                    <div key={appointment.id} className="appointment-card">
                      <div 
                        className="appointment-status-indicator" 
                        style={{ backgroundColor: statusInfo.color }}
                      ></div>
                      
                      <div className="appointment-content">
                        <h4 className="appointment-title">{appointment.title}</h4>
                        
                        <div className="appointment-details">
                          {appointment.doctor && (
                            <div className="detail-item">
                              <FiUser className="detail-icon" />
                              <span>{appointment.doctor}</span>
                            </div>
                          )}
                          
                          <div className="detail-item">
                            <FiCalendar className="detail-icon" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          
                          <div className="detail-item">
                            <FiClock className="detail-icon" />
                            <span>{appointment.time}</span>
                          </div>
                          
                          <div className="detail-item">
                            <FiMapPin className="detail-icon" />
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="appointment-notes">
                            <p>{appointment.notes}</p>
                          </div>
                        )}
                        
                        <div className="appointment-status">
                          <div className="status-badge" style={{ color: statusInfo.color }}>
                            {statusInfo.icon} {statusInfo.text}
                          </div>
                        </div>
                      </div>
                      
                      <div className="appointment-actions">
                        <button 
                          className="action-button edit"
                          onClick={() => handleEdit(appointment)}
                        >
                          <FiEdit2 />
                        </button>
                        
                        <button 
                          className="action-button delete"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit Appointment Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editMode ? 'Modifica Appuntamento' : 'Nuovo Appuntamento'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Titolo *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Es. Visita cardiologica"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="doctor">Medico</label>
                  <input
                    type="text"
                    id="doctor"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    placeholder="Es. Dr. Rossi"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="specialty">Specialità</label>
                  <input
                    type="text"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="Es. Cardiologia"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Data *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="time">Ora *</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Luogo *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Es. Ospedale San Raffaele, Milano"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Note</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Note aggiuntive, preparazione necessaria, etc."
                  rows="3"
                ></textarea>
              </div>
              
              {editMode && (
                <div className="form-group">
                  <label htmlFor="status">Stato</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="scheduled">Programmato</option>
                    <option value="completed">Completato</option>
                    <option value="cancelled">Cancellato</option>
                  </select>
                </div>
              )}
              
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddForm(false)}
                >
                  Annulla
                </button>
                
                <button type="submit" className="save-button">
                  {editMode ? 'Aggiorna' : 'Salva'} Appuntamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .appointments-manager {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        
        .appointments-header {
          margin-bottom: 30px;
          text-align: center;
        }
        
        .appointments-header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 10px;
        }
        
        .appointments-header p {
          color: #666;
          font-size: 16px;
        }
        
        .appointments-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .search-filter {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          flex: 1;
        }
        
        .search-container {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 15px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 50px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .search-input:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
          outline: none;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        
        .filter-container {
          position: relative;
          width: 180px;
        }
        
        .filter-select {
          width: 100%;
          padding: 12px 15px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 50px;
          font-size: 14px;
          appearance: none;
          background: white;
          cursor: pointer;
        }
        
        .filter-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }
        
        .add-appointment-button {
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .add-appointment-button:hover {
          background-color: #1e88e5;
        }
        
        .no-appointments {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 50px 20px;
          text-align: center;
          margin-top: 20px;
        }
        
        .empty-icon {
          color: #ccc;
          margin-bottom: 20px;
        }
        
        .no-appointments h3 {
          font-size: 20px;
          color: #333;
          margin-bottom: 10px;
        }
        
        .no-appointments p {
          color: #666;
        }
        
        .month-group {
          margin-bottom: 40px;
        }
        
        .month-header {
          font-size: 22px;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          text-transform: capitalize;
        }
        
        .appointments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .appointment-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
        }
        
        .appointment-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .appointment-status-indicator {
          width: 6px;
          height: 100%;
        }
        
        .appointment-content {
          padding: 20px;
          flex: 1;
        }
        
        .appointment-title {
          font-size: 18px;
          color: #333;
          margin-bottom: 15px;
        }
        
        .appointment-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          color: #555;
          font-size: 14px;
        }
        
        .detail-icon {
          margin-right: 8px;
          color: #666;
        }
        
        .appointment-notes {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 6px;
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .appointment-status {
          margin-top: 15px;
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .appointment-actions {
          display: flex;
          flex-direction: column;
          padding: 15px 10px;
          gap: 10px;
          border-left: 1px solid #eee;
        }
        
        .action-button {
          background: none;
          border: none;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: all 0.2s;
        }
        
        .action-button.edit:hover {
          background-color: #e3f2fd;
          color: #2196f3;
        }
        
        .action-button.delete:hover {
          background-color: #ffebee;
          color: #f44336;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 10px;
          width: 100%;
          max-width: 550px;
          padding: 30px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-content h2 {
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-row .form-group {
          flex: 1;
          margin-bottom: 0;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }
        
        input, select, textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border 0.3s;
        }
        
        input:focus, select:focus, textarea:focus {
          border-color: #2196f3;
          outline: none;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }
        
        .cancel-button {
          background-color: transparent;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .cancel-button:hover {
          background-color: #f5f5f5;
        }
        
        .save-button {
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .save-button:hover {
          background-color: #1e88e5;
        }
        
        /* Loading styles */
        .appointments-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(33, 150, 243, 0.3);
          border-radius: 50%;
          border-top-color: #2196f3;
          animation: spin 1s infinite linear;
          margin-bottom: 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .appointments-grid {
            grid-template-columns: 1fr;
          }
          
          .form-row {
            flex-direction: column;
            gap: 20px;
          }
          
          .appointments-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-filter {
            width: 100%;
          }
          
          .add-appointment-button {
            width: 100%;
            justify-content: center;
          }
          
          .appointment-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentsManager; 