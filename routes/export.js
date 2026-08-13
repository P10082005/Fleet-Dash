// routes/export.js

const express = require('express');
const Document = require('../models/Document');
const { renderDocument } = require('../services/astRenderer');
const { sanitizeHTML } = require('../services/sanitizer');
const { htmlToPdfBuffer } = require('../services/pdfExporter');

const router = express.Router();

// GET /documents/:id/export/html
router.get('/documents/:id/export/html', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Document.findById(id).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 1. AST → raw HTML
    const rawHtml = renderDocument({
      type: 'document',
      title: doc.title,
      children: doc.ast ? [doc.ast] : [],
    });

    // 2. Sanitize HTML
    const safeHtml = sanitizeHTML(rawHtml);

    // 3. Send sanitized HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(safeHtml);
  } catch (err) {
    console.error('[EXPORT HTML ERROR]', err);
    return res.status(500).json({ message: 'Failed to export HTML' });
  }
});

// GET /documents/:id/export/pdf
router.get('/documents/:id/export/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Document.findById(id).lean();
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 1. AST → raw HTML
    const rawHtml = renderDocument({
      type: 'document',
      title: doc.title,
      children: doc.ast ? [doc.ast] : [],
    });

    // 2. Sanitize HTML
    const safeHtml = sanitizeHTML(rawHtml);

    // 3. Convert sanitized HTML to PDF
    const pdfBuffer = await htmlToPdfBuffer(safeHtml);

    // 4. Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.title || 'document'}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('[EXPORT PDF ERROR]', err);
    return res.status(500).json({ message: 'Failed to export PDF' });
  }
});

module.exports = router;