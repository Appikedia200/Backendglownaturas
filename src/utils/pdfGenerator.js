const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

exports.generatePDFReceipt = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const receiptPath = path.join(__dirname, '../../receipts', `${order.orderId}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(receiptPath);
      
      doc.pipe(stream);
      
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('GLOWNATURAS', 50, 50)
        .fontSize(10)
        .font('Helvetica')
        .text('Premium Skincare Products', 50, 80)
        .text('orders@glownaturas.com', 50, 95)
        .text('+234 800 123 4567', 50, 110);
      
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 50);
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Invoice Number: ${order.orderId}`, 400, 80)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, 400, 95)
        .text(`Status: ${order.paymentStatus.toUpperCase()}`, 400, 110);
      
      doc
        .moveTo(50, 140)
        .lineTo(550, 140)
        .stroke();
      
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('BILL TO:', 50, 160);
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(order.customer.name, 50, 180)
        .text(order.customer.email, 50, 195)
        .text(order.customer.phone, 50, 210)
        .text(order.customer.address, 50, 225)
        .text(`${order.customer.city}, ${order.customer.state}`, 50, 240);
      
      const tableTop = 280;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('PRODUCT', 50, tableTop)
        .text('QTY', 350, tableTop)
        .text('PRICE', 400, tableTop)
        .text('TOTAL', 480, tableTop);
      
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();
      
      let position = tableTop + 25;
      doc.font('Helvetica');
      
      order.items.forEach(item => {
        doc
          .text(item.productName, 50, position, { width: 280, ellipsis: true })
          .text(item.quantity.toString(), 350, position)
          .text(`₦${item.price.toLocaleString()}`, 400, position)
          .text(`₦${item.subtotal.toLocaleString()}`, 480, position);
        
        position += 30;
      });
      
      const totalsTop = position + 20;
      
      doc
        .moveTo(350, totalsTop)
        .lineTo(550, totalsTop)
        .stroke();
      
      doc
        .font('Helvetica')
        .text('Subtotal:', 350, totalsTop + 10)
        .text(`₦${order.subtotal.toLocaleString()}`, 480, totalsTop + 10)
        .text('Shipping:', 350, totalsTop + 30)
        .text(`₦${order.shippingFee.toLocaleString()}`, 480, totalsTop + 30);
      
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('TOTAL:', 350, totalsTop + 50)
        .text(`₦${order.total.toLocaleString()}`, 480, totalsTop + 50);
      
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Payment Method:', 50, totalsTop + 80)
        .text(order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Pay on Delivery', 150, totalsTop + 80);
      
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          'Thank you for shopping with GlowNaturas! For support, contact us on WhatsApp: +234 800 123 4567',
          50,
          720,
          { align: 'center', width: 500 }
        );
      
      doc.end();
      
      stream.on('finish', () => {
        logger.info(`PDF receipt generated: ${order.orderId}`);
        resolve(receiptPath);
      });
      
      stream.on('error', (error) => {
        logger.error(`PDF generation failed for ${order.orderId}: ${error.message}`);
        reject(error);
      });
    } catch (error) {
      logger.error(`PDF generation error: ${error.message}`);
      reject(error);
    }
  });
};

