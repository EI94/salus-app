const express = require('express');
const router = express.Router();
const Wellness = require('../models/Wellness');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   GET /api/wellness/:userId
// @desc    Ottiene tutti i log di benessere di un utente
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifica che l'ID utente sia valido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido' });
    }
    
    const wellnessLogs = await Wellness.find({ user: userId }).sort({ date: -1 });
    res.json(wellnessLogs);
  } catch (err) {
    console.error('Errore nel recupero dei log di benessere:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/wellness/:userId/stats
// @desc    Ottiene statistiche aggregate sul benessere dell'utente
// @access  Private
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Richiesta statistiche per utente ${userId}`);
    
    // Verifica che l'ID utente sia valido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido' });
    }
    
    // Ottiene la data di 30 giorni fa
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Trova i log degli ultimi 30 giorni
    const recentLogs = await Wellness.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    
    // Calcola le medie per ogni metrica
    const stats = {
      mood: 0,
      energy: 0,
      sleep: { hours: 0, quality: 0 },
      nutrition: { quality: 0, hydration: 0 },
      stress: 0,
      physicalActivity: 0,
      totalEntries: recentLogs.length,
      trend: {
        mood: [],
        energy: [],
        sleep: [],
        stress: []
      }
    };
    
    if (recentLogs.length > 0) {
      // Calcola le somme
      const sums = recentLogs.reduce((acc, log) => {
        acc.mood += log.mood || 0;
        acc.energy += log.energy || 0;
        acc.sleepHours += log.sleep?.hours || 0;
        acc.sleepQuality += log.sleep?.quality || 0;
        acc.nutritionQuality += log.nutrition?.quality || 0;
        acc.hydration += log.nutrition?.hydration || 0;
        acc.stress += log.stress || 0;
        acc.physicalActivity += log.physicalActivity || 0;
        
        // Aggiungi dati ai trend
        const date = log.date.toISOString().split('T')[0];
        acc.trend.mood.push({ date, value: log.mood });
        acc.trend.energy.push({ date, value: log.energy });
        acc.trend.sleep.push({ date, value: log.sleep?.quality });
        acc.trend.stress.push({ date, value: log.stress });
        
        return acc;
      }, { 
        mood: 0, 
        energy: 0, 
        sleepHours: 0, 
        sleepQuality: 0, 
        nutritionQuality: 0, 
        hydration: 0, 
        stress: 0, 
        physicalActivity: 0,
        trend: { mood: [], energy: [], sleep: [], stress: [] }
      });
      
      // Calcola le medie
      stats.mood = parseFloat((sums.mood / recentLogs.length).toFixed(1));
      stats.energy = parseFloat((sums.energy / recentLogs.length).toFixed(1));
      stats.sleep.hours = parseFloat((sums.sleepHours / recentLogs.length).toFixed(1));
      stats.sleep.quality = parseFloat((sums.sleepQuality / recentLogs.length).toFixed(1));
      stats.nutrition.quality = parseFloat((sums.nutritionQuality / recentLogs.length).toFixed(1));
      stats.nutrition.hydration = parseFloat((sums.hydration / recentLogs.length).toFixed(1));
      stats.stress = parseFloat((sums.stress / recentLogs.length).toFixed(1));
      stats.physicalActivity = parseFloat((sums.physicalActivity / recentLogs.length).toFixed(1));
      stats.trend = sums.trend;
    }
    
    res.json(stats);
  } catch (err) {
    console.error('Errore nel calcolo delle statistiche:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/wellness/:userId/:wellnessId
// @desc    Ottiene un log di benessere specifico
// @access  Private
router.get('/:userId/:wellnessId', async (req, res) => {
  try {
    const { userId, wellnessId } = req.params;
    
    // Verifica che gli ID siano validi
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(wellnessId)) {
      return res.status(400).json({ message: 'ID non valido' });
    }
    
    const wellnessLog = await Wellness.findOne({ _id: wellnessId, user: userId });
    
    if (!wellnessLog) {
      return res.status(404).json({ message: 'Log di benessere non trovato' });
    }
    
    res.json(wellnessLog);
  } catch (err) {
    console.error('Errore nel recupero del log di benessere:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/wellness
// @desc    Registra un nuovo log di benessere
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { date, mood, energy, sleep, nutrition, stress, physicalActivity, notes } = req.body;
    
    // Controlla se esiste già un log per la stessa data
    const existingLog = await Wellness.findOne({
      user: req.user.id,
      date: new Date(date)
    });
    
    if (existingLog) {
      return res.status(400).json({ 
        message: 'Esiste già un log per questa data. Utilizza PUT per aggiornarlo.' 
      });
    }
    
    // Crea un nuovo log di benessere
    const newWellnessLog = new Wellness({
      user: req.user.id,
      date: date || new Date(),
      mood,
      energy,
      sleep,
      nutrition,
      stress,
      physicalActivity,
      notes
    });
    
    const wellnessLog = await newWellnessLog.save();
    res.status(201).json(wellnessLog);
  } catch (err) {
    console.error('Errore nella registrazione del log di benessere:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   PUT /api/wellness/:wellnessId
// @desc    Aggiorna un log di benessere
// @access  Private
router.put('/:wellnessId', auth, async (req, res) => {
  try {
    const { wellnessId } = req.params;
    const { date, mood, energy, sleep, nutrition, stress, physicalActivity, notes } = req.body;
    
    // Costruisci l'oggetto con i campi da aggiornare
    const wellnessFields = {};
    if (date) wellnessFields.date = date;
    if (mood) wellnessFields.mood = mood;
    if (energy) wellnessFields.energy = energy;
    if (sleep) wellnessFields.sleep = sleep;
    if (nutrition) wellnessFields.nutrition = nutrition;
    if (stress !== undefined) wellnessFields.stress = stress;
    if (physicalActivity !== undefined) wellnessFields.physicalActivity = physicalActivity;
    if (notes !== undefined) wellnessFields.notes = notes;
    
    // Verifica che l'utente sia proprietario del log
    let wellnessLog = await Wellness.findById(wellnessId);
    
    if (!wellnessLog) {
      return res.status(404).json({ message: 'Log di benessere non trovato' });
    }
    
    if (wellnessLog.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo log' });
    }
    
    // Aggiorna il log
    wellnessLog = await Wellness.findByIdAndUpdate(
      wellnessId,
      { $set: wellnessFields },
      { new: true }
    );
    
    res.json(wellnessLog);
  } catch (err) {
    console.error('Errore nell\'aggiornamento del log di benessere:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   DELETE /api/wellness/:wellnessId
// @desc    Elimina un log di benessere
// @access  Private
router.delete('/:wellnessId', auth, async (req, res) => {
  try {
    const { wellnessId } = req.params;
    
    // Verifica che l'utente sia proprietario del log
    const wellnessLog = await Wellness.findById(wellnessId);
    
    if (!wellnessLog) {
      return res.status(404).json({ message: 'Log di benessere non trovato' });
    }
    
    if (wellnessLog.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo log' });
    }
    
    // Elimina il log
    await Wellness.findByIdAndDelete(wellnessId);
    
    res.json({ message: 'Log di benessere eliminato con successo' });
  } catch (err) {
    console.error('Errore nell\'eliminazione del log di benessere:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 