const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');

// Ottieni tutti i sintomi di un utente
router.get('/:userId', async (req, res) => {
  try {
    const symptoms = await Symptom.find({ userId: req.params.userId });
    res.status(200).json(symptoms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Aggiungi un nuovo sintomo
router.post('/', async (req, res) => {
  try {
    const { userId, description, intensity, date } = req.body;
    
    const newSymptom = new Symptom({
      userId,
      description,
      intensity,
      date: date || new Date()
    });
    
    const savedSymptom = await newSymptom.save();
    res.status(201).json(savedSymptom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Aggiorna un sintomo
router.put('/:id', async (req, res) => {
  try {
    const { description, intensity } = req.body;
    
    const updatedSymptom = await Symptom.findByIdAndUpdate(
      req.params.id,
      { description, intensity },
      { new: true }
    );
    
    if (!updatedSymptom) {
      return res.status(404).json({ message: 'Sintomo non trovato' });
    }
    
    res.status(200).json(updatedSymptom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Elimina un sintomo
router.delete('/:id', async (req, res) => {
  try {
    const deletedSymptom = await Symptom.findByIdAndDelete(req.params.id);
    
    if (!deletedSymptom) {
      return res.status(404).json({ message: 'Sintomo non trovato' });
    }
    
    res.status(200).json({ message: 'Sintomo eliminato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 