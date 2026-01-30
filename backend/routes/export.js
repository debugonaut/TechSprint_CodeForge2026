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

const PDFDocument = require('pdfkit');

// Helper function to convert items to PDF and stream to response
function toPDF(items, res) {
  const doc = new PDFDocument();
  
  // Set headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="recallbin-export-${Date.now()}.pdf"`);
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Title
  doc.fontSize(24).text('RecallBin Export', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Exported on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);
  
  items.forEach((item, index) => {
    // Add page break for new items if not the first one and near bottom
    if (index > 0 && doc.y > 700) {
      doc.addPage();
    }
    
    // Item Title
    doc.fontSize(18).font('Helvetica-Bold')
       .text(item.ai_output?.title || item.raw_input?.title || 'Untitled');
    doc.moveDown(0.5);
    
    // Metadata
    doc.fontSize(10).font('Helvetica')
       .text(`URL: ${item.url || 'N/A'}`)
       .text(`Category: ${item.ai_output?.category || 'Unknown'}`)
       .text(`Tags: ${(item.ai_output?.tags || []).join(', ')}`)
       .text(`Created: ${new Date(item.created_at).toLocaleDateString()}`);
       
    doc.moveDown(0.5);
    
    // Summary
    doc.fontSize(12).font('Helvetica-Bold').text('Summary:');
    doc.fontSize(12).font('Helvetica')
       .text(item.ai_output?.summary || 'No summary available.', { align: 'justify' });
       
    doc.moveDown();
    
    // Key Ideas
    if (item.ai_output?.key_ideas && item.ai_output.key_ideas.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Key Ideas:');
      doc.fontSize(12).font('Helvetica');
      item.ai_output.key_ideas.forEach(idea => {
        doc.text(`• ${idea}`, { indent: 20 });
      });
      doc.moveDown();
    }
    
    // Separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(2);
  });
  
  doc.end();
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

// GET /api/export/pdf
router.get('/pdf', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const snapshot = await db.collection('users').doc(userId).collection('saved_content')
      .orderBy('created_at', 'desc')
      .get();
    
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // toPDF handles the response directly
    toPDF(items, res);
    
  } catch (error) {
    console.error('Error in GET /export/pdf:', error);
    // Only send error if headers haven't been sent (streaming might have started)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

module.exports = router;
