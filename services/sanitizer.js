const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const config = {
  ALLOWED_TAGS: [
    'html', 'head', 'meta', 'title', 'body',
    'p', 'br', 'strong', 'em',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'pre', 'code', 'ul', 'ol', 'li',
    'a'
  ],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
  ALLOW_DATA_ATTR: false,
};

function sanitizeHTML(dirtyHtml) {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, config);
}

module.exports = { sanitizeHTML };