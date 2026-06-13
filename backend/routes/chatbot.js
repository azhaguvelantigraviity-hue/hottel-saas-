const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const { AppError } = require('../utils/helpers');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Set up multer to store files temporarily in uploads/
const upload = multer({ dest: 'uploads/' });

router.post('/', protect, upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No audio file provided', 400));
    }

    const filePath = req.file.path;

    // 1. Transcribe audio using Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      temperature: 0,
      response_format: 'verbose_json',
    });

    const userText = transcription.text;

    // 2. Generate a response using an LLM
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are StayOS, a helpful, professional AI assistant for a hotel management platform. Keep your answers concise, helpful, and polite. Your primary users are hotel staff, receptionists, and managers.',
        },
        {
          role: 'user',
          content: userText,
        },
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 150,
    });

    const botResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    // Clean up temporary audio file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete temp audio file:', err);
    });

    res.json({
      success: true,
      transcription: userText,
      response: botResponse,
    });
  } catch (err) {
    // Attempt to clean up file if error occurs
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    console.error('Groq API Error:', err);
    next(new AppError('Failed to process voice request', 500));
  }
});

module.exports = router;
