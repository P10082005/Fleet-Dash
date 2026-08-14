// test-pdf.js

const { htmlToPdfBuffer } = require('./services/pdfExporter');
const fs = require('fs');

(async () => {
  const html = `
    <html>
      <body>
        <h1>SyncDoc Test PDF</h1>
        <p>This is a sample PDF generated from HTML.</p>
      </body>
    </html>
  `;
  const pdfBuffer = await htmlToPdfBuffer(html);
  fs.writeFileSync('test.pdf', pdfBuffer);
  console.log('PDF written to test.pdf');
})();