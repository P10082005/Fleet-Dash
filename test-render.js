// test-render.js

const { renderDocument } = require('./services/astRenderer');

const sampleAst = {
  type: 'document',
  title: 'Sample',
  children: [
    { type: 'heading', level: 1, text: 'Hello SyncDoc' },
    { type: 'paragraph', text: 'This is a test paragraph.' },
    {
      type: 'code_block',
      language: 'js',
      code: 'console.log("XSS? <script>alert(1)</script>");',
    },
  ],
};

const html = renderDocument(sampleAst);
console.log(html);