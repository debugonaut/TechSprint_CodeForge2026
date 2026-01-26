const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { summarizeContent } = require('../services/aiService');
const verifyToken = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// Apply auth middleware to all routes in this router
router.use(verifyToken);

// POST /api/save
router.post('/save', rateLimiter, async (req, res) => {
  try {
    const { url, title, description, content_text, platform, collectionId } = req.body;
    const userId = req.user.uid;

    if (!url && !content_text) {
      return res.status(400).json({ error: 'URL or content_text is required' });
    }

    // Check for duplicate URL
    if (url) {
      const duplicateCheck = await db.collection('users').doc(userId).collection('saved_content')
        .where('url', '==', url)
        .limit(1)
        .get();
      
      if (!duplicateCheck.empty) {
        const existingItem = duplicateCheck.docs[0];
        return res.status(409).json({ 
          error: 'Duplicate URL',
          message: 'You have already saved this URL',
          existingItem: { id: existingItem.id, ...existingItem.data() }
        });
      }
    }

    // 1. Call AI Service
    const aiOutput = await summarizeContent({ url, title, description, content_text, platform });

    // 2. Prepare Data
    const savedContent = {
      url: url || '',
      platform: platform || 'unknown',
      collectionId: collectionId || null,
      lastViewedAt: null,
      raw_input: {
        title: title || '',
        description: description || '',
        content_text: content_text || '' // Store this if needed, or truncate if too large
      },
      ai_output: aiOutput,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 3. Save to Firestore
    const docRef = await db.collection('users').doc(userId).collection('saved_content').add(savedContent);

    // 4. Update collection item count if applicable
    if (collectionId) {
      const collectionRef = db.collection('users').doc(userId).collection('collections').doc(collectionId);
      const collectionDoc = await collectionRef.get();
      if (collectionDoc.exists) {
        const currentCount = collectionDoc.data().item_count || 0;
        await collectionRef.update({
          item_count: currentCount + 1,
          updated_at: new Date().toISOString()
        });
      }
    }

    res.status(201).json({
      id: docRef.id,
      message: 'Content saved and processed successfully',
      data: savedContent
    });

  } catch (error) {
    console.error('Error in /save:', error);
    
    // Handle API key issues
    if (error.message?.includes('API_KEY_MISSING')) {
      return res.status(500).json({ 
        error: 'API key not configured', 
        message: 'Gemini API key is missing. Please configure it in environment variables.' 
      });
    }
    
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(500).json({ 
        error: 'Invalid API key', 
        message: 'The Gemini API key is invalid. Please check your configuration.' 
      });
    }
    
    // Handle quota exceeded specifically
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      return res.status(429).json({ 
        error: 'API quota exceeded', 
        message: 'Daily Gemini API limit reached. Content saved without AI analysis. Try again tomorrow.' 
      });
    }
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/search?q=query&category=tech&contentType=article&dateFrom=2024-01-01&dateTo=2024-12-31&collectionId=xyz
router.get('/search', async (req, res) => {
  try {
    const { q, category, contentType, dateFrom, dateTo, collectionId, limit = 50 } = req.query;
    const userId = req.user.uid;

    // Build Firestore query
    let query = db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc');

    // Apply collection filter if provided
    if (collectionId) {
      query = query.where('collectionId', '==', collectionId);
    }

    // Fetch documents (we'll filter in-memory for complex queries)
    const snapshot = await query.limit(parseInt(limit)).get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply filters
    if (q) {
      const queryLower = q.toLowerCase();
      results = results.filter(item => {
        const summary = item.ai_output?.summary?.toLowerCase() || '';
        const tags = item.ai_output?.tags?.join(' ').toLowerCase() || '';
        const keyIdeas = item.ai_output?.key_ideas?.join(' ').toLowerCase() || '';
        const title = item.ai_output?.title?.toLowerCase() || item.raw_input?.title?.toLowerCase() || '';

        return summary.includes(queryLower) || 
               tags.includes(queryLower) || 
               keyIdeas.includes(queryLower) || 
               title.includes(queryLower);
      });
    }

    if (category) {
      results = results.filter(item => item.ai_output?.category === category);
    }

    if (contentType) {
      results = results.filter(item => item.ai_output?.content_type === contentType);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      results = results.filter(item => new Date(item.created_at) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      results = results.filter(item => new Date(item.created_at) <= toDate);
    }

    res.json({
      items: results,
      total: results.length,
      filters: { q, category, contentType, dateFrom, dateTo, collectionId }
    });

  } catch (error) {
    console.error('Error in /search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/quota - Get user's quota info
router.get('/quota', async (req, res) => {
  try {
    const userId = req.user.uid;
    const today = new Date().toISOString().split('T')[0];
    
    const usageDoc = await db.collection('users').doc(userId).collection('usage').doc(today).get();
    
    const used = usageDoc.exists ? (usageDoc.data().ai_requests || 0) : 0;
    const limit = 20; // Match rateLimiter DAILY_LIMIT
    
    res.json({
      used,
      limit,
      remaining: Math.max(0, limit - used),
      resetDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error in /quota:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Delete the document
    await db.collection('users').doc(userId).collection('saved_content').doc(id).delete();

    res.json({ message: 'Content deleted successfully', id });

  } catch (error) {
    console.error('Error in /delete:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
