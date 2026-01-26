const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/auth');

// Apply auth middleware
router.use(verifyToken);

// GET /api/reminders - Get items saved 7 days ago that haven't been viewed
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();
    
    // Get items created around 7 days ago (between 6-8 days)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    const eightDaysAgoISO = eightDaysAgo.toISOString();
    
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const sixDaysAgoISO = sixDaysAgo.toISOString();
    
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .where('created_at', '>=', eightDaysAgoISO)
      .where('created_at', '<=', sixDaysAgoISO)
      .get();
    
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter out items that have been viewed recently
    items = items.filter(item => {
      if (!item.lastViewedAt) return true; // Never viewed
      
      const lastViewed = new Date(item.lastViewedAt);
      const daysSinceViewed = (new Date() - lastViewed) / (1000 * 60 * 60 * 24);
      
      return daysSinceViewed >= 6; // Not viewed in the last 6 days
    });
    
    res.json({
      items,
      count: items.length
    });
    
  } catch (error) {
    console.error('Error in GET /reminders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/reminders/mark-read/:itemId - Mark item as viewed
router.post('/mark-read/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.uid;
    
    await db.collection('users').doc(userId).collection('saved_content')
      .doc(itemId)
      .update({
        lastViewedAt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    res.json({ 
      message: 'Item marked as read',
      itemId
    });
    
  } catch (error) {
    console.error('Error in POST /reminders/mark-read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/reminders/stats - Get reminder statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get unread items count (simplified version)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .where('created_at', '<=', sevenDaysAgo.toISOString())
      .get();
    
    const unreadCount = snapshot.docs.filter(doc => {
      const data = doc.data();
      if (!data.lastViewedAt) return true;
      
      const lastViewed = new Date(data.lastViewedAt);
      const daysSinceViewed = (new Date() - lastViewed) / (1000 * 60 * 60 * 24);
      
      return daysSinceViewed >= 7;
    }).length;
    
    res.json({
      unreadCount,
      message: unreadCount > 0 ? `You have ${unreadCount} items to review!` : 'All caught up!'
    });
    
  } catch (error) {
    console.error('Error in GET /reminders/stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
