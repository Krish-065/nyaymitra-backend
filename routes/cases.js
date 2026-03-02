const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');
const authMiddleware = require('../middleware/authMiddleware');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { type, court, parties, charges, status } = req.body;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a senior Indian legal strategist. Case: Type: ${type}, Court: ${court}, Parties: ${parties}, Charges: ${charges}, Status: ${status}. Provide strategy, loopholes, relevant sections, precedents, and action plan.`
      }]
    });

    res.json({ result: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;