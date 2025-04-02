const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   GET /api/symptoms/:userId
// @desc    Ottiene tutti i sintomi di un utente
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifica che l'ID utente sia valido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido' });
    }
    
    const symptoms = await Symptom.find({ user: userId }).sort({ dateReported: -1 });
    res.json(symptoms);
  } catch (err) {
    console.error('Errore nel recupero dei sintomi:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/symptoms/:userId/:symptomId
// @desc    Ottiene un sintomo specifico
// @access  Private
router.get('/:userId/:symptomId', async (req, res) => {
  try {
    const { userId, symptomId } = req.params;
    
    // Verifica che gli ID siano validi
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(symptomId)) {
      return res.status(400).json({ message: 'ID non valido' });
    }
    
    const symptom = await Symptom.findOne({ _id: symptomId, user: userId });
    
    if (!symptom) {
      return res.status(404).json({ message: 'Sintomo non trovato' });
    }
    
    res.json(symptom);
  } catch (err) {
    console.error('Errore nel recupero del sintomo:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/symptoms
// @desc    Registra un nuovo sintomo
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, severity, description, duration, triggers } = req.body;
    
    // Crea un nuovo sintomo
    const newSymptom = new Symptom({
      user: req.user.id,
      name,
      severity,
      description,
      duration,
      triggers
    });
    
    const symptom = await newSymptom.save();
    res.status(201).json(symptom);
  } catch (err) {
    console.error('Errore nella registrazione del sintomo:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   PUT /api/symptoms/:symptomId
// @desc    Aggiorna un sintomo
// @access  Private
router.put('/:symptomId', auth, async (req, res) => {
  try {
    const { symptomId } = req.params;
    const { name, severity, description, duration, triggers, isActive } = req.body;
    
    // Costruisci l'oggetto con i campi da aggiornare
    const symptomFields = {};
    if (name) symptomFields.name = name;
    if (severity) symptomFields.severity = severity;
    if (description !== undefined) symptomFields.description = description;
    if (duration) symptomFields.duration = duration;
    if (triggers !== undefined) symptomFields.triggers = triggers;
    if (isActive !== undefined) symptomFields.isActive = isActive;
    
    // Verifica che l'utente sia proprietario del sintomo
    let symptom = await Symptom.findById(symptomId);
    
    if (!symptom) {
      return res.status(404).json({ message: 'Sintomo non trovato' });
    }
    
    if (symptom.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo sintomo' });
    }
    
    // Aggiorna il sintomo
    symptom = await Symptom.findByIdAndUpdate(
      symptomId,
      { $set: symptomFields },
      { new: true }
    );
    
    res.json(symptom);
  } catch (err) {
    console.error('Errore nell\'aggiornamento del sintomo:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   DELETE /api/symptoms/:symptomId
// @desc    Elimina un sintomo
// @access  Private
router.delete('/:symptomId', auth, async (req, res) => {
  try {
    const { symptomId } = req.params;
    
    // Verifica che l'utente sia proprietario del sintomo
    const symptom = await Symptom.findById(symptomId);
    
    if (!symptom) {
      return res.status(404).json({ message: 'Sintomo non trovato' });
    }
    
    if (symptom.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo sintomo' });
    }
    
    // Elimina il sintomo
    await Symptom.findByIdAndDelete(symptomId);
    
    res.json({ message: 'Sintomo eliminato con successo' });
  } catch (err) {
    console.error('Errore nell\'eliminazione del sintomo:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 