const { db } = require('../config/firebase');

const DAILY_LIMIT = 20; // Free tier limit

async function rateLimiter(req, res, next) {
  try {
    const userId = req.user.uid;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get or create usage document for today
    const usageRef = db.collection('users').doc(userId).collection('usage').doc(today);
    const usageDoc = await usageRef.get();
    
    let currentUsage = 0;
    if (usageDoc.exists) {
      currentUsage = usageDoc.data().ai_requests || 0;
    }
    
    // Check if limit exceeded
    if (currentUsage >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'Daily quota exceeded',
        message: `You have reached your daily limit of ${DAILY_LIMIT} AI analyses. Please try again tomorrow.`,
        quota: {
          used: currentUsage,
          limit: DAILY_LIMIT,
          remaining: 0,
          resetDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
        }
      });
    }
    
    // Increment usage
    if (usageDoc.exists) {
      await usageRef.update({
        ai_requests: currentUsage + 1,
        last_request: new Date().toISOString()
      });
    } else {
      await usageRef.set({
        ai_requests: 1,
        date: today,
        last_request: new Date().toISOString()
      });
    }
    
    // Add quota info to response headers
    res.setHeader('X-RateLimit-Limit', DAILY_LIMIT);
    res.setHeader('X-RateLimit-Remaining', DAILY_LIMIT - currentUsage - 1);
    res.setHeader('X-RateLimit-Reset', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString());
    
    // Attach quota info to request for later use
    req.quota = {
      used: currentUsage + 1,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - currentUsage - 1
    };
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Don't fail the request if rate limiting fails
    next();
  }
}

module.exports = rateLimiter;
