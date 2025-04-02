const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');

// Ottieni tutti i farmaci di un utente
router.get('/:userId', async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.params.userId });
    res.status(200).json(medications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Ottieni solo i medicinali attivi di un utente (nuovo endpoint)
router.get('/:userId/active', async (req, res) => {
  try {
    console.log(`Richiesta medicinali attivi per utente ${req.params.userId}`);
    
    const activeMedications = await Medication.find({ 
      userId: req.params.userId,
      isActive: true
    });
    
    res.status(200).json(activeMedications);
  } catch (error) {
    console.error('Errore nel recupero dei medicinali attivi:', error);
    res.status(500).json({ message: 'Errore durante il recupero dei medicinali attivi' });
  }
});

// Aggiungi un nuovo farmaco
router.post('/', async (req, res) => {
  try {
    const { userId, name, dosage, frequency, startDate, endDate, notes } = req.body;
    
    const newMedication = new Medication({
      userId,
      name,
      dosage,
      frequency,
      startDate: startDate || new Date(),
      endDate,
      notes,
      isActive: true
    });
    
    const savedMedication = await newMedication.save();
    res.status(201).json(savedMedication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Aggiorna un farmaco
router.put('/:id', async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes, isActive } = req.body;
    
    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      { name, dosage, frequency, startDate, endDate, notes, isActive },
      { new: true }
    );
    
    if (!updatedMedication) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    
    res.status(200).json(updatedMedication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Termina un farmaco (non lo elimina, ma lo marca come inattivo)
router.put('/:id/terminate', async (req, res) => {
  try {
    const { endDate } = req.body;
    
    const terminatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false, 
        endDate: endDate || new Date() 
      },
      { new: true }
    );
    
    if (!terminatedMedication) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    
    res.status(200).json(terminatedMedication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Elimina un farmaco
router.delete('/:id', async (req, res) => {
  try {
    const deletedMedication = await Medication.findByIdAndDelete(req.params.id);
    
    if (!deletedMedication) {
      return res.status(404).json({ message: 'Farmaco non trovato' });
    }
    
    res.status(200).json({ message: 'Farmaco eliminato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 