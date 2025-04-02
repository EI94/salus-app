const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/auth/users/:userId
// @desc    Ottiene i dati di un utente specifico
// @access  Private (solo l'utente stesso o admin)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Richiesta dati per utente ${userId}`);

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Errore nel recupero dati utente:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   PUT /api/auth/users/:userId
// @desc    Aggiorna i dati di un utente
// @access  Private (solo l'utente stesso)
router.put('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifica che l'utente stia modificando il proprio profilo
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Non autorizzato a modificare questo profilo' });
    }
    
    const { name, age, gender, medicalConditions, allergies } = req.body;
    
    // Costruisci l'oggetto con i campi da aggiornare
    const userFields = {};
    if (name) userFields.name = name;
    if (age !== undefined) userFields.age = age;
    if (gender) userFields.gender = gender;
    if (medicalConditions) userFields.medicalConditions = medicalConditions;
    if (allergies) userFields.allergies = allergies;
    
    // Aggiorna l'utente
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Errore nell\'aggiornamento utente:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   DELETE /api/auth/users/:userId
// @desc    Elimina un utente
// @access  Private (solo l'utente stesso)
router.delete('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verifica che l'utente stia eliminando il proprio account
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo profilo' });
    }
    
    // Elimina l'utente
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Utente eliminato con successo' });
  } catch (err) {
    console.error('Errore nell\'eliminazione utente:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router; 