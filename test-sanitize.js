// test-sanitize.js

const { sanitizeHTML } = require('./services/sanitizer');

const dirty = `
  <h1 onclick="alert('xss')">Hello</h1>
  <script>alert('XSS');</script>
  <a href="javascript:alert('xss')">bad link</a>
`;

const clean = sanitizeHTML(dirty);
console.log('CLEAN HTML:\n', clean);