const express = require('express');
const Document = require('../models/Document');
const { renderDocument } = require('../services/astRenderer');
const { sanitizeHTML } = require('../services/sanitizer');

const router = express.Router();

router.get('/documents/:id/export/html', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const rawHtml = renderDocument({
      type: 'document',
      title: doc.title,
      children: doc.ast ? [doc.ast] : [],
    });

    const safeHtml = sanitizeHTML(rawHtml);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(safeHtml);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to export HTML' });
  }
});

module.exports = router;