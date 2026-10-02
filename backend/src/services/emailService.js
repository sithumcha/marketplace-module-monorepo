const nodemailer = require('nodemailer');
const env = require('../config/env');

// Create reusable transporter object using Gmail SMTP transport
const transporter = nodemailer.createTransport({
  host: env.SMTP.HOST,
  port: env.SMTP.PORT,
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: env.SMTP.USER,
    pass: env.SMTP.PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('⚠️ Gmail SMTP Transport Verification Error:', error.message);
  } else {
    console.log('📧 Gmail SMTP Transporter Connected & Ready for Live Email Delivery!');
  }
});

const sendOrderReceiptEmail = async (orderData) => {
  try {
    const { orderId, itemTitle, price, quantity, buyerName, buyerEmail, shippingAddress, paymentMethod } = orderData;
    const totalAmount = Number(price) * (Number(quantity) || 1);
    const recipient = buyerEmail && buyerEmail.includes('@') ? buyerEmail : env.SMTP.USER;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation & Receipt #${orderId}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; }
        .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
        .order-badge { background: #ecfdf5; color: #047857; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-block; margin: 15px 0; }
        .details-box { background: #f1f5f9; padding: 15px; border-radius: 12px; font-size: 13px; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 12px; border-bottom: 2px solid #cbd5e1; color: #475569; }
        .table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .grand-total { text-align: right; font-size: 18px; font-weight: 800; color: #047857; margin-top: 15px; }
        .footer { text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="brand">MARKETPLACE MODULE</h1>
          <div class="sub">Official Purchase Receipt & Order Confirmation</div>
          <div class="order-badge">✓ ORDER CONFIRMED & PROCESSING</div>
        </div>

        <p>Dear <strong>${buyerName || 'Valued Customer'}</strong>,</p>
        <p>Thank you for your order! We have received your payment and your purchase is now being prepared for shipping.</p>

        <div class="details-box">
          <p style="margin: 3px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 3px 0;"><strong>Delivery Address:</strong> ${shippingAddress || 'Colombo, Sri Lanka'}</p>
          <p style="margin: 3px 0;"><strong>Payment Method:</strong> ${paymentMethod || 'Credit / Debit Card'}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${itemTitle}</strong></td>
              <td style="text-align: center;">${quantity || 1}</td>
              <td style="text-align: right;">LKR ${Number(price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td style="text-align: right;"><strong>LKR ${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="grand-total">
          Total Amount Paid: LKR ${(totalAmount + 500).toLocaleString(undefined, {minimumFractionDigits: 2})}
        </div>

        <div class="footer">
          <p>Thank you for shopping with <strong>Marketplace Module</strong>.</p>
          <p>If you have any questions, contact our support team at support@marketplace.lk</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Marketplace Store" <${env.SMTP.USER}>`,
      to: recipient,
      subject: `🎉 Order Confirmation & Receipt #${orderId} - Marketplace Module`,
      html: htmlTemplate
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ LIVE GMAIL RECEIPT SENT to ${recipient} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error('❌ Error sending live Gmail receipt:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendOrderReceiptEmail
};
