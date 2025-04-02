const express = require('express');
const router = express.Router();
const Wellness = require('../models/Wellness');

// Ottieni tutte le note di benessere di un utente
router.get('/:userId', async (req, res) => {
  try {
    const entries = await Wellness.find({ userId: req.params.userId }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni statistiche del benessere (nuovo endpoint)
router.get('/:userId/stats', async (req, res) => {
  try {
    console.log(`Richiesta statistiche per utente ${req.params.userId}`);
    
    const entries = await Wellness.find({ userId: req.params.userId });
    
    if (!entries || entries.length === 0) {
      return res.status(200).json({
        totalEntries: 0,
        moodDistribution: {},
        averageSleepHours: 0,
        topActivities: []
      });
    }
    
    // Calcola la distribuzione dell'umore
    const moodDistribution = {};
    entries.forEach(entry => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });
    
    // Calcola la media delle ore di sonno
    const totalSleepHours = entries.reduce((total, entry) => total + (entry.sleepHours || 0), 0);
    const averageSleepHours = totalSleepHours / entries.length;
    
    // Trova le attività più frequenti
    const activityCount = {};
    entries.forEach(entry => {
      if (entry.activities && entry.activities.length) {
        entry.activities.forEach(activity => {
          activityCount[activity] = (activityCount[activity] || 0) + 1;
        });
      }
    });
    
    const topActivities = Object.entries(activityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    res.status(200).json({
      totalEntries: entries.length,
      moodDistribution,
      averageSleepHours,
      topActivities
    });
  } catch (error) {
    console.error('Errore nel recupero delle statistiche:', error);
    res.status(500).json({ message: 'Errore durante il recupero delle statistiche' });
  }
});

// Aggiungi una nuova nota
router.post('/', async (req, res) => {
  try {
    const { userId, mood, sleepHours, activities, notes, date } = req.body;
    
    const newEntry = new Wellness({
      userId,
      mood,
      sleepHours,
      activities,
      notes,
      date: date || new Date()
    });
    
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Aggiorna una nota
router.put('/:id', async (req, res) => {
  try {
    const { mood, sleepHours, activities, notes } = req.body;
    
    const updatedEntry = await Wellness.findByIdAndUpdate(
      req.params.id,
      { mood, sleepHours, activities, notes },
      { new: true }
    );
    
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Nota di benessere non trovata' });
    }
    
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Elimina una nota
router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await Wellness.findByIdAndDelete(req.params.id);
    
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Nota di benessere non trovata' });
    }
    
    res.status(200).json({ message: 'Nota di benessere eliminata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 