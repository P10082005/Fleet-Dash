// services/sanitizer.js

const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Create a DOM window for DOMPurify (Node.js needs jsdom) [web:1][web:11][web:18]
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Optional: central config to lock down what you allow
const defaultConfig = {
  // Allow a minimal set of tags useful for docs
  ALLOWED_TAGS: [
    'html', 'head', 'meta', 'title',
    'body', 'p', 'br', 'strong', 'em', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'pre', 'code',
    'ul', 'ol', 'li',
    'a', 'span', 'div',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'class',
  ],
  // Disallow dangerous URL schemes like javascript:
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

function sanitizeHTML(dirtyHtml) {
  if (!dirtyHtml) return '';
  const cleanHtml = DOMPurify.sanitize(dirtyHtml, defaultConfig);
  return cleanHtml;
}

module.exports = {
  sanitizeHTML,
};