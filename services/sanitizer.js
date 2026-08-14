// services/sanitizer.js

const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Create DOM window for DOMPurify (required in Node.js) [web:1][web:2]
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Security-focused config: only allow safe tags/attrs
const defaultConfig = {
  ALLOWED_TAGS: [
    'html', 'head', 'meta', 'title',
    'body',
    'p', 'br',
    'strong', 'em',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'pre', 'code',
    'ul', 'ol', 'li',
    'a', 'span', 'div',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'class',
  ],
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover',
    'onfocus', 'onblur',
  ],
  ALLOW_DATA_ATTR: false,
};

function sanitizeHTML(dirtyHtml) {
  if (!dirtyHtml) return '';
  const clean = DOMPurify.sanitize(dirtyHtml, defaultConfig);
  return clean;
}

module.exports = {
  sanitizeHTML,
};