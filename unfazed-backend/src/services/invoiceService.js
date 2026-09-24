const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a GST-style invoice PDF buffer
 */
const generateInvoiceBuffer = (payment, therapist, client) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header: Unfazed Platform & Branded Invoice
      doc
        .fontSize(22)
        .fillColor('#4338ca')
        .text('TAX INVOICE', { align: 'right' })
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Invoice No: ${payment.invoiceNumber || 'INV-' + Date.now().toString().slice(-6)}`, { align: 'right' })
        .text(`Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}`, { align: 'right' })
        .moveDown(1.5);

      // Platform / Provider Info
      doc
        .fontSize(14)
        .fillColor('#0f172a')
        .text(therapist.name, { align: 'left' })
        .fontSize(10)
        .fillColor('#475569')
        .text(`${therapist.qualifications || 'Mental Health Professional'}`)
        .text(`Email: ${therapist.email}`)
        .text(`Platform: Unfazed India Practice Portal`)
        .moveDown();

      // Bill To (Client)
      doc
        .fontSize(12)
        .fillColor('#1e293b')
        .text('Billed To:')
        .fontSize(10)
        .fillColor('#475569')
        .text(`Client Name: ${client.name}`)
        .text(`Client Email: ${client.email}`)
        .text(`Client Phone: ${client.phone || 'N/A'}`)
        .moveDown(1.5);

      // Line items table header
      const tableTop = doc.y;
      doc
        .rect(50, tableTop, 500, 24)
        .fill('#f1f5f9');

      doc
        .fontSize(10)
        .fillColor('#0f172a')
        .text('Description', 60, tableTop + 7)
        .text('Qty', 320, tableTop + 7)
        .text('Rate (INR)', 370, tableTop + 7)
        .text('Total (INR)', 470, tableTop + 7);

      // Line item
      const itemTop = tableTop + 30;
      const itemName = payment.package_id
        ? 'Therapy Package Plan'
        : 'Individual Psychotherapy Session (60 Min)';

      const baseAmount = Math.round(payment.amount / 1.18);
      const gstAmount = payment.amount - baseAmount;

      doc
        .fontSize(10)
        .fillColor('#334155')
        .text(itemName, 60, itemTop)
        .text('1', 320, itemTop)
        .text(`₹${baseAmount.toFixed(2)}`, 370, itemTop)
        .text(`₹${baseAmount.toFixed(2)}`, 470, itemTop);

      // Divider
      doc
        .strokeColor('#e2e8f0')
        .lineWidth(1)
        .moveTo(50, itemTop + 30)
        .lineTo(550, itemTop + 30)
        .stroke();

      // Totals
      const subtotalTop = itemTop + 45;
      doc
        .text('Taxable Subtotal:', 340, subtotalTop)
        .text(`₹${baseAmount.toFixed(2)}`, 470, subtotalTop)
        .text('GST (18% - SAC 9993):', 340, subtotalTop + 18)
        .text(`₹${gstAmount.toFixed(2)}`, 470, subtotalTop + 18);

      // Grand Total
      doc
        .fontSize(12)
        .fillColor('#4338ca')
        .text('Total Paid:', 340, subtotalTop + 40)
        .text(`₹${payment.amount.toFixed(2)}`, 470, subtotalTop + 40);

      // Payment Details
      doc
        .moveDown(4)
        .fontSize(9)
        .fillColor('#64748b')
        .text(`Payment Gateway Reference: ${payment.gateway_transaction_id || payment.razorpayPaymentId || 'TEST_GATEWAY_COMPLETED'}`)
        .text(`Status: PAID IN FULL - Digital Confirmation`)
        .moveDown()
        .text('This is a computer-generated tax invoice issued via Unfazed SaaS Platform.', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoiceBuffer
};
