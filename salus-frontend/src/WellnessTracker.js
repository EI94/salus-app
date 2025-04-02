import React, { useState, useEffect } from 'react';
import API from './api';

function WellnessTracker({ userId }) {
  const [mood, setMood] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [nutrition, setNutrition] = useState('average');
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [activityInput, setActivityInput] = useState('');
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [stats, setStats] = useState({
    averageMood: 0,
    averageSleep: 0,
    moodTrend: 0,
    sleepTrend: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchWellnessLogs();
      fetchWellnessStats();
    }
  }, [userId]);

  const fetchWellnessLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // In modalità demo, usa dati di esempio
      if (userId.startsWith('temp-') || userId.startsWith('user_')) {
        console.log('Modalità demo: uso dati di esempio per il benessere');
        const mockLogs = generateMockWellnessLogs();
        setWellnessLogs(mockLogs);
        return;
      }
      
      const response = await API.get(`/wellness/logs/${userId}`);
      console.log('Wellness logs caricati:', response.data);
      
      // Verifica che response.data sia un array
      const logsData = Array.isArray(response.data) ? response.data : [];
      setWellnessLogs(logsData);
    } catch (error) {
      console.error('Errore nel caricamento dei log di benessere:', error);
      setWellnessLogs([]);
      setError('Impossibile caricare i dati del benessere. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWellnessStats = async () => {
    try {
      // In modalità demo, usa dati di esempio
      if (userId.startsWith('temp-') || userId.startsWith('user_')) {
        console.log('Modalità demo: uso statistiche di esempio per il benessere');
        setStats(generateMockWellnessStats());
        return;
      }
      
      const response = await API.get(`/wellness/stats/${userId}`);
      console.log('Wellness stats caricate:', response.data);
      
      // Verifica che response.data sia un oggetto valido
      const statsData = response.data && typeof response.data === 'object' ? response.data : generateMockWellnessStats();
      setStats(statsData);
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
      setStats(generateMockWellnessStats()); // Usa dati di esempio in caso di errore
    }
  };

  const addActivity = () => {
    if (activityInput.trim() !== '') {
      setActivities([...activities, activityInput.trim()]);
      setActivityInput('');
    }
  };

  const removeActivity = (index) => {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setActivities(newActivities);
  };

  const handleSubmit = async () => {
    try {
      await API.post('/wellness', {
        userId,
        mood,
        sleepHours,
        nutrition,
        activities,
        notes
      });

      // Reset form
      setMood(5);
      setSleepHours(7);
      setNutrition('average');
      setActivities([]);
      setNotes('');

      // Refresh data
      fetchWellnessLogs();
      fetchWellnessStats();

      alert('Dati benessere registrati con successo!');
    } catch (error) {
      console.error('Errore nella registrazione dei dati:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    }
  };

  const getNutritionLabel = (value) => {
    const labels = {
      poor: 'Scarsa',
      average: 'Nella media',
      good: 'Buona',
      excellent: 'Eccellente'
    };
    return labels[value] || value;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  };

  // Helper per formattare i numeri in modo sicuro
  const safeToFixed = (number, digits = 1) => {
    if (number === undefined || number === null) return '0.0';
    return Number(number).toFixed(digits);
  };

  // Genera dati di esempio per la modalità demo
  const generateMockWellnessLogs = () => {
    return [
      {
        id: 'mock-1',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 4, // 1-5, dove 5 è ottimo
        sleep: 7, // ore
        stress: 2, // 1-5, dove 1 è basso
        energy: 4, // 1-5, dove 5 è alto
        activities: ['Camminata leggera', 'Meditazione'],
        notes: 'Giornata produttiva, mi sono sentito bene'
      },
      {
        id: 'mock-2',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 3,
        sleep: 6,
        stress: 3,
        energy: 3,
        activities: ['Lavoro in ufficio'],
        notes: 'Giornata intensa al lavoro, un po\' stancante'
      },
      {
        id: 'mock-3',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 5,
        sleep: 8,
        stress: 1,
        energy: 5,
        activities: ['Yoga', 'Camminata nel parco', 'Lettura'],
        notes: 'Ottima giornata di relax'
      },
      {
        id: 'mock-4',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 2,
        sleep: 5,
        stress: 4,
        energy: 2,
        activities: ['Lavoro da casa'],
        notes: 'Non ho dormito bene, mi sono sentito stanco'
      },
      {
        id: 'mock-5',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 3,
        sleep: 7,
        stress: 3,
        energy: 3,
        activities: ['Palestra', 'Spesa'],
        notes: 'Giornata nella media'
      }
    ];
  };

  // Genera statistiche di esempio
  const generateMockWellnessStats = () => {
    return {
      averageMood: 3.4,
      averageSleep: 6.6,
      averageStress: 2.6,
      averageEnergy: 3.4,
      daysTracked: 5,
      commonActivities: ['Camminata leggera', 'Lavoro in ufficio', 'Yoga'],
      moodTrend: 'stabile',
      sleepTrend: 'miglioramento'
    };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Diario del Benessere</h2>
      
      <div style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Umore (1-10):</label>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            style={styles.rangeInput}
          />
          <span style={styles.rangeValue}>{mood}</span>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Ore di sonno:</label>
          <input
            type="number"
            min="0"
            max="24"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            style={styles.numberInput}
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Alimentazione:</label>
          <select
            value={nutrition}
            onChange={(e) => setNutrition(e.target.value)}
            style={styles.select}
          >
            <option value="poor">Scarsa</option>
            <option value="average">Nella media</option>
            <option value="good">Buona</option>
            <option value="excellent">Eccellente</option>
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Attività:</label>
          <div style={styles.activityInput}>
            <input
              type="text"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              placeholder="Es: Camminata, Lettura, Yoga..."
              style={styles.textInput}
            />
            <button onClick={addActivity} style={styles.addButton}>+</button>
          </div>
          <div style={styles.activitiesList}>
            {activities.map((activity, index) => (
              <div key={index} style={styles.activityTag}>
                {activity}
                <button 
                  onClick={() => removeActivity(index)}
                  style={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Note:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Altre osservazioni sul tuo benessere oggi..."
            style={styles.textarea}
          />
        </div>
        
        <button onClick={handleSubmit} style={styles.submitButton}>
          Registra
        </button>
      </div>
      
      {stats && (
        <div style={styles.statsSection}>
          <h3 style={styles.subheading}>Le tue statistiche (ultimi 30 giorni)</h3>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <strong>Umore medio:</strong> {safeToFixed(stats.averageMood)}/10
            </div>
            <div style={styles.stat}>
              <strong>Sonno medio:</strong> {safeToFixed(stats.averageSleep)} ore
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.logsSection}>
        <h3 style={styles.subheading}>Storico</h3>
        {wellnessLogs.length === 0 ? (
          <p style={styles.emptyMessage}>Nessun dato registrato</p>
        ) : (
          <div style={styles.logs}>
            {wellnessLogs.map((log) => (
              <div key={log._id} style={styles.logItem}>
                <div style={styles.logHeader}>
                  <span style={styles.logDate}>{formatDate(log.date)}</span>
                  <span style={styles.logMood}>Umore: {log.mood}/10</span>
                </div>
                {log.sleepHours && (
                  <div style={styles.logDetail}>
                    <strong>Sonno:</strong> {log.sleepHours} ore
                  </div>
                )}
                {log.nutrition && (
                  <div style={styles.logDetail}>
                    <strong>Alimentazione:</strong> {getNutritionLabel(log.nutrition)}
                  </div>
                )}
                {log.activities && log.activities.length > 0 && (
                  <div style={styles.logDetail}>
                    <strong>Attività:</strong> {log.activities.join(', ')}
                  </div>
                )}
                {log.notes && (
                  <div style={styles.logNotes}>
                    <strong>Note:</strong> {log.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
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
  form: {
    backgroundColor: '#f9f9f9',
    padding: '1.5rem',
    borderRadius: '5px',
    marginTop: '1.5rem',
    marginBottom: '2rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold'
  },
  rangeInput: {
    width: '80%',
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  rangeValue: {
    display: 'inline-block',
    width: '10%',
    textAlign: 'center',
    marginLeft: '10px',
    fontWeight: 'bold'
  },
  numberInput: {
    width: '60px',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  select: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minWidth: '200px'
  },
  textInput: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    flex: 1
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    minHeight: '100px',
    fontFamily: 'inherit'
  },
  activityInput: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  activitiesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  activityTag: {
    backgroundColor: '#e0f7fa',
    padding: '0.25rem 0.5rem',
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
  statsSection: {
    backgroundColor: '#eaf2f8',
    padding: '1rem',
    borderRadius: '5px',
    marginBottom: '2rem'
  },
  subheading: {
    color: '#2c3e50',
    borderBottom: '1px solid #bdc3c7',
    paddingBottom: '0.5rem',
    marginBottom: '1rem'
  },
  stats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  stat: {
    fontSize: '1.1rem'
  },
  logsSection: {
    marginTop: '2rem'
  },
  logs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  logItem: {
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    border: '1px solid #dee2e6'
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '0.5rem'
  },
  logDate: {
    fontWeight: 'bold',
    color: '#6c757d'
  },
  logMood: {
    fontWeight: 'bold',
    color: '#3498db'
  },
  logDetail: {
    margin: '0.25rem 0',
    fontSize: '0.95rem'
  },
  logNotes: {
    margin: '0.5rem 0 0',
    padding: '0.5rem',
    backgroundColor: '#f1f8e9',
    borderRadius: '4px',
    fontStyle: 'italic',
    fontSize: '0.95rem'
  },
  emptyMessage: {
    fontStyle: 'italic',
    color: '#6c757d'
  }
};

export default WellnessTracker; 