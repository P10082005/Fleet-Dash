// services/pdfExporter.js

const puppeteer = require('puppeteer');

// Convert sanitized HTML to PDF Buffer using Puppeteer [web:19][web:39][web:40]
async function htmlToPdfBuffer(html) {
  const browser = await puppeteer.launch({
    headless: true,
    // In some environments you may need:
    // args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

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