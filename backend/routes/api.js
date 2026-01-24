const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { summarizeContent } = require('../services/aiService');
const verifyToken = require('../middleware/auth');

// Apply auth middleware to all routes in this router
router.use(verifyToken);

// POST /api/save
router.post('/save', async (req, res) => {
  try {
    const { url, title, description, content_text, platform } = req.body;
    const userId = req.user.uid;

    if (!url && !content_text) {
      return res.status(400).json({ error: 'URL or content_text is required' });
    }

    // 1. Call AI Service
    const aiOutput = await summarizeContent({ url, title, description, content_text, platform });

    // 2. Prepare Data
    const savedContent = {
      url: url || '',
      platform: platform || 'unknown',
      raw_input: {
        title: title || '',
        description: description || '',
        content_text: content_text || '' // Store this if needed, or truncate if too large
      },
      ai_output: aiOutput,
      created_at: new Date().toISOString()
    };

    // 3. Save to Firestore
    const docRef = await db.collection('users').doc(userId).collection('saved_content').add(savedContent);

    res.status(201).json({
      id: docRef.id,
      message: 'Content saved and processed successfully',
      data: savedContent
    });

  } catch (error) {
    console.error('Error in /save:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/search?q=query
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.uid;

    if (!q) {
      // Return all if no query (or top 20)
      const snapshot = await db.collection('users').doc(userId).collection('saved_content')
        .orderBy('created_at', 'desc')
        .limit(20)
        .get();
      
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(results);
    }

    // "Semantic" search (Text search simulation)
    // Fetch user's content (Limit to 50 for hackathon scale)
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const queryLower = q.toLowerCase();

    // Filter in-memory
    const filtered = allDocs.filter(item => {
      const summary = item.ai_output?.summary?.toLowerCase() || '';
      const tags = item.ai_output?.tags?.join(' ').toLowerCase() || '';
      const keyIdeas = item.ai_output?.key_ideas?.join(' ').toLowerCase() || '';
      const title = item.raw_input?.title?.toLowerCase() || '';

      return summary.includes(queryLower) || 
             tags.includes(queryLower) || 
             keyIdeas.includes(queryLower) || 
             title.includes(queryLower);
    });

    res.json(filtered);

  } catch (error) {
    console.error('Error in /search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
