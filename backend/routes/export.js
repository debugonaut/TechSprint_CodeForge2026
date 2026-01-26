const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/auth');

// Apply auth middleware
router.use(verifyToken);

// Helper function to convert items to CSV
function toCSV(items) {
  if (items.length === 0) return '';
  
  const headers = ['ID', 'URL', 'Title', 'Summary', 'Category', 'Tags', 'Created At'];
  const rows = items.map(item => [
    item.id,
    item.url || '',
    item.ai_output?.title || item.raw_input?.title || '',
    (item.ai_output?.summary || '').replace(/"/g, '""'),
    item.ai_output?.category || '',
    (item.ai_output?.tags || []).join('; '),
    item.created_at
  ]);
  
  const csvRows = [headers, ...rows].map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  return csvRows;
}

// Helper function to convert items to Markdown
function toMarkdown(items) {
  let md = '# RecallBin Export\n\n';
  md += `Exported on: ${new Date().toISOString()}\n\n`;
  md += `Total items: ${items.length}\n\n---\n\n`;
  
  items.forEach(item => {
    md += `## ${item.ai_output?.title || item.raw_input?.title || 'Untitled'}\n\n`;
    md += `**URL**: ${item.url || 'N/A'}\n\n`;
    md += `**Category**: ${item.ai_output?.category || 'Unknown'}\n\n`;
    md += `**Tags**: ${(item.ai_output?.tags || []).join(', ')}\n\n`;
    md += `**Created**: ${new Date(item.created_at).toLocaleDateString()}\n\n`;
    md += `### Summary\n\n${item.ai_output?.summary || 'No summary available.'}\n\n`;
    
    if (item.ai_output?.key_ideas && item.ai_output.key_ideas.length > 0) {
      md += `### Key Ideas\n\n`;
      item.ai_output.key_ideas.forEach(idea => {
        md += `- ${idea}\n`;
      });
      md += '\n';
    }
    
    md += '---\n\n';
  });
  
  return md;
}

// GET /api/export/json
router.get('/json', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc')
      .get();
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="recallbin-export-${Date.now()}.json"`);
    res.json({
      exported_at: new Date().toISOString(),
      total_items: items.length,
      items
    });
    
  } catch (error) {
    console.error('Error in GET /export/json:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/export/csv
router.get('/csv', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc')
      .get();
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const csv = toCSV(items);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="recallbin-export-${Date.now()}.csv"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error in GET /export/csv:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/export/markdown
router.get('/markdown', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc')
      .get();
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const markdown = toMarkdown(items);
    
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="recallbin-export-${Date.now()}.md"`);
    res.send(markdown);
    
  } catch (error) {
    console.error('Error in GET /export/markdown:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
