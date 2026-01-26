require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const apiRoutes = require('./routes/api');
const collectionsRoutes = require('./routes/collections');
const exportRoutes = require('./routes/export');
const remindersRoutes = require('./routes/reminders');
const chatRoutes = require('./routes/chat');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('RecallBin Backend is Running.');
});

// Error Handler (must be last)
app.use(errorHandler);

// Export for Vercel
module.exports = app;

// Only listen if not running in Vercel (local dev)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}`);
  });
}
