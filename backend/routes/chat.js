const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');
const authMiddleware = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', authMiddleware, async (req, res) => {
  try {
const OpenAI = require('openai');
const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const response = await client.chat.completions.create({
  model: "grok-3-mini",
  messages: [
    { role: "system", content: "You are NyayMitra, Indian legal AI assistant..." },
    ...messages
  ],
  max_tokens: 1000,
});
const reply = response.choices[0].message.content;

    // Save to DB
    await Chat.create({
      userId: req.user.id,
      topic: topic || 'All Topics',
      question: messages[messages.length - 1].content.slice(0, 60) + '...',
      messages: [...messages, { role: 'assistant', content: reply }],
      date: new Date().toLocaleDateString()
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;