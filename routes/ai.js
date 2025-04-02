const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const auth = require('../middleware/auth');

// Configurazione OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = process.env.OPENAI_API_KEY ? new OpenAIApi(configuration) : null;

// @route   POST /api/ai/chat
// @desc    Invia un messaggio all'AI per ottenere una risposta
// @access  Private
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log(`Richiesta chat AI ricevuta: ${JSON.stringify({ message })}`);
    
    if (!message) {
      return res.status(400).json({ message: 'Il campo messaggio è obbligatorio' });
    }
    
    console.log(`Messaggio ricevuto: ${message}`);
    
    // Verifica se la chiave API OpenAI è configurata
    if (!process.env.OPENAI_API_KEY) {
      console.log('Chiave API OpenAI non configurata');
      return res.status(200).json({ 
        reply: 'Mi dispiace, il servizio AI non è attualmente disponibile. Contatta l\'amministratore del sistema.',
        isAiUnavailable: true
      });
    }
    
    console.log('Chiave API: Presente');
    
    // Contesto e prompt per orientare l'AI verso consigli medici generali
    const systemPrompt = `Sei un assistente di supporto per un'app di monitoraggio della salute chiamata Salus. 
    Puoi fornire informazioni generali sulla salute e il benessere, ma NON sostituisci un medico.
    Ricorda sempre di suggerire di consultare un professionista sanitario per problemi medici specifici.
    Cerca di essere empatico, conciso e fornisci consigli pratici quando possibile.
    Puoi aiutare gli utenti a comprendere i loro sintomi in modo generale o dare suggerimenti
    per il benessere quotidiano come esercizio fisico, alimentazione e gestione dello stress.`;
    
    // Messaggio di sicurezza
    const safetyReminder = 'Ricorda che questi sono solo consigli generali. Consulta sempre un medico per problemi di salute specifici.';
    
    console.log('Invio richiesta a OpenAI');
    
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    console.log(`Risposta OpenAI ricevuta: ${JSON.stringify(response.data)}`);
    
    let aiReply = response.data.choices[0].message.content.trim();
    
    // Aggiungi il promemoria di sicurezza solo se la risposta sembra un consiglio medico
    const medicalKeywords = ['sintomi', 'malattia', 'cura', 'trattamento', 'diagnosi', 'medicina', 'farmaco', 'dolore'];
    const needsReminder = medicalKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || aiReply.toLowerCase().includes(keyword)
    );
    
    if (needsReminder && !aiReply.includes(safetyReminder)) {
      aiReply += `\n\n${safetyReminder}`;
    }
    
    console.log(`Risposta AI elaborata: ${aiReply.substring(0, 30)}...`);
    
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('Errore nella comunicazione con OpenAI:', err);
    
    // Gestione degli errori specifici di OpenAI
    if (err.response) {
      console.error('Errore OpenAI:', err.response.data);
      
      // Errore di quota
      if (err.response.status === 429) {
        return res.status(429).json({ 
          message: 'Limite di utilizzo AI raggiunto. Riprova più tardi.' 
        });
      }
      
      // Altri errori
      return res.status(500).json({ 
        message: 'Errore nel servizio AI. Riprova più tardi.' 
      });
    }
    
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/ai/analyze-symptoms
// @desc    Analizza i sintomi dell'utente per fornire possibili cause comuni
// @access  Private
router.post('/analyze-symptoms', auth, async (req, res) => {
  try {
    const { symptoms, userContext } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Fornire una lista valida di sintomi' });
    }
    
    // Verifica se la chiave API OpenAI è configurata
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({ 
        analysis: 'Il servizio di analisi dei sintomi non è attualmente disponibile.',
        isAiUnavailable: true
      });
    }
    
    // Costruisci il prompt per l'analisi dei sintomi
    const symptomsList = symptoms.map(s => `- ${s.name} (Severità: ${s.severity}/10)`).join('\n');
    
    let contextInfo = '';
    if (userContext) {
      if (userContext.age) contextInfo += `\nEtà: ${userContext.age} anni`;
      if (userContext.gender) contextInfo += `\nGenere: ${userContext.gender}`;
      if (userContext.medicalConditions && userContext.medicalConditions.length > 0) {
        contextInfo += `\nCondizioni mediche esistenti: ${userContext.medicalConditions.join(', ')}`;
      }
    }
    
    const prompt = `Analizza i seguenti sintomi e fornisci possibili spiegazioni comuni, NON RARE:
    ${symptomsList}
    ${contextInfo}
    
    Fornisci SOLO una breve analisi di possibili cause comuni di questi sintomi insieme.
    Ricorda di menzionare che questa non è una diagnosi medica e l'utente dovrebbe consultare un medico.
    Rispondi in modo conciso, empatico e informativo.`;
    
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'Sei un assistente che fornisce informazioni generali sulla salute. NON sei un medico e NON puoi fornire diagnosi mediche.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3, // Più bassa per risposte più conservative
    });
    
    const analysis = response.data.choices[0].message.content.trim();
    
    res.json({ analysis });
  } catch (err) {
    console.error('Errore nell\'analisi dei sintomi:', err);
    
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ 
        message: 'Limite di utilizzo AI raggiunto. Riprova più tardi.' 
      });
    }
    
    res.status(500).json({ message: 'Errore nel servizio di analisi dei sintomi' });
  }
});

module.exports = router; 