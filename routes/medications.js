const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// @route   GET /api/medications/:userId
// @desc    Ottiene tutti i farmaci di un utente
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifica che l'ID utente sia valido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido' });
    }
    
    const medications = await Medication.find({ user: userId }).sort({ startDate: -1 });
    res.json(medications);
  } catch (err) {
    console.error('Errore nel recupero dei farmaci:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/medications/:userId/active
// @desc    Ottiene tutti i farmaci attivi di un utente
// @access  Private
router.get('/:userId/active', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Richiesta medicinali attivi per utente ${userId}`);
    
    // Verifica che l'ID utente sia valido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID utente non valido' });
    }
    
    const now = new Date();
    
    // Trova i farmaci attivi (isActive = true e endDate non passata o non specificata)
    const medications = await Medication.find({
      user: userId,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).sort({ startDate: -1 });
    
    res.json(medications);
  } catch (err) {
    console.error('Errore nel recupero dei farmaci attivi:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/medications/:userId/:medicationId
// @desc    Ottiene un farmaco specifico
// @access  Private
router.get('/:userId/:medicationId', async (req, res) => {
  try {
    const { userId, medicationId } = req.params;
    
    // Verifica che gli ID siano validi
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(medicationId)) {
      return res.status(400).json({ message: 'ID non valido' });
    }
    
    const medication = await Medication.findOne({ _id: medicationId, user: userId });
    
    if (!medication) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    
    res.json(medication);
  } catch (err) {
    console.error('Errore nel recupero del farmaco:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/medications
// @desc    Registra un nuovo farmaco
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, purpose, instructions, sideEffects, reminders } = req.body;
    
    // Crea un nuovo farmaco
    const newMedication = new Medication({
      user: req.user.id,
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      purpose,
      instructions,
      sideEffects,
      reminders
    });
    
    const medication = await newMedication.save();
    res.status(201).json(medication);
  } catch (err) {
    console.error('Errore nella registrazione del farmaco:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   PUT /api/medications/:medicationId
// @desc    Aggiorna un farmaco
// @access  Private
router.put('/:medicationId', auth, async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { name, dosage, frequency, startDate, endDate, purpose, instructions, isActive, sideEffects, reminders } = req.body;
    
    // Costruisci l'oggetto con i campi da aggiornare
    const medicationFields = {};
    if (name) medicationFields.name = name;
    if (dosage) medicationFields.dosage = dosage;
    if (frequency) medicationFields.frequency = frequency;
    if (startDate) medicationFields.startDate = startDate;
    if (endDate !== undefined) medicationFields.endDate = endDate;
    if (purpose !== undefined) medicationFields.purpose = purpose;
    if (instructions !== undefined) medicationFields.instructions = instructions;
    if (isActive !== undefined) medicationFields.isActive = isActive;
    if (sideEffects) medicationFields.sideEffects = sideEffects;
    if (reminders) medicationFields.reminders = reminders;
    
    // Verifica che l'utente sia proprietario del farmaco
    let medication = await Medication.findById(medicationId);
    
    if (!medication) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    
    if (medication.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo farmaco' });
    }
    
    // Aggiorna il farmaco
    medication = await Medication.findByIdAndUpdate(
      medicationId,
      { $set: medicationFields },
      { new: true }
    );
    
    res.json(medication);
  } catch (err) {
    console.error('Errore nell\'aggiornamento del farmaco:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   DELETE /api/medications/:medicationId
// @desc    Elimina un farmaco
// @access  Private
router.delete('/:medicationId', auth, async (req, res) => {
  try {
    const { medicationId } = req.params;
    
    // Verifica che l'utente sia proprietario del farmaco
    const medication = await Medication.findById(medicationId);
    
    if (!medication) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    
    if (medication.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo farmaco' });
    }
    
    // Elimina il farmaco
    await Medication.findByIdAndDelete(medicationId);
    
    res.json({ message: 'Farmaco eliminato con successo' });
  } catch (err) {
    console.error('Errore nell\'eliminazione del farmaco:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 