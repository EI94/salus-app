// Aggiorna la lingua dell'utente
router.put('/language', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user.id;

    // Aggiorna la lingua nel database
    await pool.query(
      'UPDATE users SET language = $1 WHERE id = $2',
      [language, userId]
    );

    res.json({ message: 'Lingua aggiornata con successo' });
  } catch (error) {
    console.error('Errore durante l\'aggiornamento della lingua:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della lingua' });
  }
}); 