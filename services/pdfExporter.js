// services/pdfExporter.js

const puppeteer = require('puppeteer');

// Convert sanitized HTML string to a PDF Buffer [web:16][web:19]
async function htmlToPdfBuffer(html) {
  // Launch headless Chrome
  const browser = await puppeteer.launch({
    // In production you might add args like:
    // args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set sanitized HTML as page content
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  htmlToPdfBuffer,
};