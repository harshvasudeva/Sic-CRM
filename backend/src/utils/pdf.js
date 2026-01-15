const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (invoice, company, customer, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const filename = `invoice_${invoice.invoice_number}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      doc.fontSize(20).text('INVOICE', { align: 'right' }).moveDown();
      doc.fontSize(24).text(company.name).moveDown();
      doc.fontSize(10).text(company.email || '').moveDown();
      doc.fontSize(10).text(company.address || '').moveDown();
      doc.fontSize(10).text(`${company.city || ''} ${company.state || ''} ${company.country || ''}`).moveDown();
      doc.fontSize(10).text(`Tax ID: ${company.tax_id || 'N/A'}`).moveDown();

      doc.moveDown();
      doc.fontSize(12).text('Bill To:', { underline: true }).moveDown();
      doc.fontSize(10).text(`${customer.first_name} ${customer.last_name || ''}`).moveDown();
      doc.fontSize(10).text(customer.email || '').moveDown();
      doc.fontSize(10).text(customer.phone || '').moveDown();
      doc.fontSize(10).text(customer.address || '').moveDown();

      doc.moveDown();
      doc.fontSize(10).text(`Invoice No: ${invoice.invoice_number}`);
      doc.fontSize(10).text(`Date: ${invoice.invoice_date}`);
      doc.fontSize(10).text(`Due Date: ${invoice.due_date}`).moveDown();

      const tableTop = doc.y + 10;
      const headers = ['Item', 'Qty', 'Price', 'Tax %', 'Total'];
      const columnWidths = [200, 60, 80, 60, 80];
      let currentX = 50;

      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, currentX, tableTop, { width: columnWidths[i] });
        currentX += columnWidths[i];
      });

      doc.moveDown();
      let currentY = doc.y;
      currentX = 50;
      doc.fontSize(10).font('Helvetica');

      items.forEach((item) => {
        doc.text(item.description || item.product_name || 'N/A', currentX, currentY, { width: columnWidths[0] });
        currentX += columnWidths[0];
        doc.text(String(item.quantity), currentX, currentY, { width: columnWidths[1] });
        currentX += columnWidths[1];
        doc.text(`$${item.unit_price.toFixed(2)}`, currentX, currentY, { width: columnWidths[2] });
        currentX += columnWidths[2];
        doc.text(`${item.tax_rate}%`, currentX, currentY, { width: columnWidths[3] });
        currentX += columnWidths[3];
        doc.text(`$${item.total.toFixed(2)}`, currentX, currentY, { width: columnWidths[4] });

        currentY += 25;
        currentX = 50;
      });

      const totalY = currentY + 20;
      currentX = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Subtotal:', currentX, totalY);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, currentX + 400, totalY);
      doc.text('Tax:', currentX, totalY + 20);
      doc.text(`$${invoice.tax_amount.toFixed(2)}`, currentX + 400, totalY + 20);
      doc.text('Discount:', currentX, totalY + 40);
      doc.text(`-$${invoice.discount_amount.toFixed(2)}`, currentX + 400, totalY + 40);
      doc.fontSize(12).text('Total:', currentX, totalY + 60);
      doc.text(`$${invoice.total_amount.toFixed(2)}`, currentX + 400, totalY + 60);

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

const generateQuotationPDF = async (quotation, company, customer, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const filename = `quotation_${quotation.quotation_number}.pdf`;
      const filepath = path.join(__dirname, '../../uploads', filename);
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      doc.fontSize(20).text('QUOTATION', { align: 'right' }).moveDown();
      doc.fontSize(24).text(company.name).moveDown();
      doc.fontSize(10).text(company.email || '').moveDown();
      doc.fontSize(10).text(company.address || '').moveDown();
      doc.fontSize(10).text(`${company.city || ''} ${company.state || ''} ${company.country || ''}`).moveDown();
      doc.fontSize(10).text(`Tax ID: ${company.tax_id || 'N/A'}`).moveDown();

      doc.moveDown();
      doc.fontSize(12).text('Quotation For:', { underline: true }).moveDown();
      doc.fontSize(10).text(`${customer.first_name} ${customer.last_name || ''}`).moveDown();
      doc.fontSize(10).text(customer.email || '').moveDown();
      doc.fontSize(10).text(customer.phone || '').moveDown();
      doc.fontSize(10).text(customer.address || '').moveDown();

      doc.moveDown();
      doc.fontSize(10).text(`Quotation No: ${quotation.quotation_number}`);
      doc.fontSize(10).text(`Date: ${quotation.quotation_date}`);
      doc.fontSize(10).text(`Valid Until: ${quotation.valid_until}`).moveDown();

      const tableTop = doc.y + 10;
      const headers = ['Item', 'Qty', 'Price', 'Tax %', 'Total'];
      const columnWidths = [200, 60, 80, 60, 80];
      let currentX = 50;

      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, currentX, tableTop, { width: columnWidths[i] });
        currentX += columnWidths[i];
      });

      doc.moveDown();
      let currentY = doc.y;
      currentX = 50;
      doc.fontSize(10).font('Helvetica');

      items.forEach((item) => {
        doc.text(item.description || item.product_name || 'N/A', currentX, currentY, { width: columnWidths[0] });
        currentX += columnWidths[0];
        doc.text(String(item.quantity), currentX, currentY, { width: columnWidths[1] });
        currentX += columnWidths[1];
        doc.text(`$${item.unit_price.toFixed(2)}`, currentX, currentY, { width: columnWidths[2] });
        currentX += columnWidths[2];
        doc.text(`${item.tax_rate}%`, currentX, currentY, { width: columnWidths[3] });
        currentX += columnWidths[3];
        doc.text(`$${item.total.toFixed(2)}`, currentX, currentY, { width: columnWidths[4] });

        currentY += 25;
        currentX = 50;
      });

      const totalY = currentY + 20;
      currentX = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Subtotal:', currentX, totalY);
      doc.text(`$${quotation.subtotal.toFixed(2)}`, currentX + 400, totalY);
      doc.text('Tax:', currentX, totalY + 20);
      doc.text(`$${quotation.tax_amount.toFixed(2)}`, currentX + 400, totalY + 20);
      doc.text('Discount:', currentX, totalY + 40);
      doc.text(`-$${quotation.discount_amount.toFixed(2)}`, currentX + 400, totalY + 40);
      doc.fontSize(12).text('Total:', currentX, totalY + 60);
      doc.text(`$${quotation.total_amount.toFixed(2)}`, currentX + 400, totalY + 60);

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
  generateQuotationPDF,
};
