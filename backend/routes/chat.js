const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Apply auth middleware
router.use(verifyToken);

// Initialize Gemini
let genAI;
const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('API_KEY_MISSING: Gemini API key is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// POST /api/chat - Natural language query
router.post('/', async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user.uid;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Fetch user's saved content
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (items.length === 0) {
      return res.json({
        response: "You haven't saved any items yet. Start saving content to ask me questions about it!",
        items: []
      });
    }

    // Build context for AI
    const itemsContext = items.map(item => ({
      title: item.ai_output?.title || item.raw_input?.title || 'Untitled',
      summary: item.ai_output?.summary || '',
      category: item.ai_output?.category || '',
      tags: (item.ai_output?.tags || []).join(', '),
      url: item.url
    }));

    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are a helpful assistant that helps users find content from their saved items.

User Query: "${query}"

Saved Items (max 50):
${JSON.stringify(itemsContext, null, 2)}

Task: Analyze the query and find the most relevant saved items. Return a JSON response with:
{
  "response": "A friendly natural language response (2-3 sentences)",
  "relevantIndices": [array of indices of relevant items from 0 to ${items.length - 1}]
}

Only return valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const aiResponse = JSON.parse(text);

    // Get the actual items
    const relevantItems = (aiResponse.relevantIndices || [])
      .filter(idx => idx >= 0 && idx < items.length)
      .map(idx => items[idx]);

    res.json({
      response: aiResponse.response || "Here are some items I found.",
      items: relevantItems
    });

  } catch (error) {
    console.error('Error in /chat:', error);
    
    // Fallback simple search if AI fails
    try {
      const { query } = req.body;
      const userId = req.user.uid;
      
      const snapshot = await db.collection('users').doc(userId).collection('saved_content')
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();

      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const queryLower = query.toLowerCase();

      const filtered = items.filter(item => {
        const summary = item.ai_output?.summary?.toLowerCase() || '';
        const tags = item.ai_output?.tags?.join(' ').toLowerCase() || '';
        const title = item.ai_output?.title?.toLowerCase() || '';
        return summary.includes(queryLower) || tags.includes(queryLower) || title.includes(queryLower);
      });

      res.json({
        response: `I found ${filtered.length} items matching "${query}".`,
        items: filtered.slice(0, 5)
      });

    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

module.exports = router;
