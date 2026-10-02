export const generateInvoiceHTML = (order) => {
  const orderId = order.orderId || order.id || `ORD-${Date.now().toString().substring(5)}`;
  const dateStr = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  const buyerName = order.buyerName || 'Valued Customer';
  const buyerEmail = order.buyerEmail || 'customer@marketplace.lk';
  const buyerPhone = order.buyerPhone || '+94 77 123 4567';
  const shippingAddress = order.shippingAddress || 'Colombo, Sri Lanka';
  const paymentMethod = order.paymentMethod || 'Credit / Debit Card';
  const status = order.status || 'Paid & Processing';

  const items = Array.isArray(order.items) && order.items.length > 0 
    ? order.items 
    : [{ title: order.itemTitle || order.title || 'Marketplace Item', quantity: order.quantity || 1, price: order.price || order.totalPaid || 0 }];

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  const shippingFee = order.shippingFee !== undefined ? Number(order.shippingFee) : (order.shippingOption === 'express' ? 1500 : 500);
  const discount = order.discount || 0;
  const grandTotal = order.total !== undefined ? order.total : (subtotal + shippingFee - discount);

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice - ${orderId}</title>
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #f8fafc; }
      .invoice-box { max-width: 800px; margin: auto; padding: 35px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 25px; }
      .brand-title { font-size: 26px; font-weight: 800; color: #4f46e5; margin: 0; letter-spacing: -0.5px; }
      .brand-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
      .invoice-title { text-align: right; }
      .invoice-title h2 { font-size: 24px; color: #0f172a; margin: 0; font-weight: 800; }
      .invoice-title p { font-size: 13px; color: #64748b; margin: 4px 0 0 0; }
      .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; background: #ecfdf5; color: #047857; text-transform: uppercase; margin-top: 6px; }
      .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
      .info-card { background: #f8fafc; padding: 15px 18px; border-radius: 12px; border: 1px solid #e2e8f0; }
      .info-card h4 { font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px; }
      .info-card p { font-size: 13px; margin: 3px 0; color: #1e293b; font-weight: 600; }
      .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      .items-table th { background: #f1f5f9; padding: 12px 15px; text-align: left; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
      .items-table td { padding: 14px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #334155; }
      .summary-table { width: 320px; margin-left: auto; border-collapse: collapse; }
      .summary-table td { padding: 8px 12px; font-size: 13px; color: #64748b; }
      .summary-table td.total-val { font-size: 18px; font-weight: 800; color: #047857; }
      .summary-table tr.total-row td { border-top: 2px solid #cbd5e1; font-weight: 800; color: #0f172a; padding-top: 12px; }
      .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
      @media print {
        body { padding: 0; background: none; }
        .invoice-box { border: none; box-shadow: none; padding: 0; }
        .no-print { display: none !important; }
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="max-width: 800px; margin: 0 auto 15px auto; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: bold; color: #475569;">📄 Marketplace Order Bill / Receipt Preview</span>
      <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
        🖨️ Print or Save PDF
      </button>
    </div>
    <div class="invoice-box">
      <div class="header">
        <div>
          <h1 class="brand-title">MARKETPLACE MODULE</h1>
          <div class="brand-sub">Official Order Invoice & Customer Receipt</div>
        </div>
        <div class="invoice-title">
          <h2>TAX INVOICE</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Date:</strong> ${dateStr}</p>
          <div class="badge">${status}</div>
        </div>
      </div>
      <div class="details-grid">
        <div class="info-card">
          <h4>Billed To (Customer)</h4>
          <p><strong>Name:</strong> ${buyerName}</p>
          <p><strong>Email:</strong> ${buyerEmail}</p>
          <p><strong>Phone:</strong> ${buyerPhone}</p>
          <p><strong>Delivery Address:</strong> ${shippingAddress}</p>
        </div>
        <div class="info-card">
          <h4>Payment & Fulfillment Details</h4>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Merchant:</strong> Verified Marketplace Seller</p>
        </div>
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td><strong>${item.title}</strong></td>
              <td style="text-align: center;">${item.quantity || 1}</td>
              <td style="text-align: right;">LKR ${Number(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              <td style="text-align: right;"><strong>LKR ${(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <table class="summary-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right; font-weight: 600;">LKR ${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td>Shipping & Handling:</td>
          <td style="text-align: right; font-weight: 600;">LKR ${shippingFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td>Discount:</td>
          <td style="text-align: right; color: #059669; font-weight: 600;">-LKR ${discount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>` : ''}
        <tr class="total-row">
          <td>Grand Total Paid:</td>
          <td style="text-align: right;" class="total-val">LKR ${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
      </table>
      <div class="footer">
        <p>Thank you for your purchase with <strong>Marketplace Module</strong>. For inquiries, contact support@marketplace.lk</p>
        <p style="font-size: 10px; margin-top: 5px;">This is an automated electronic invoice and official payment receipt.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export const downloadOrderInvoice = (order) => {
  const htmlContent = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${order.orderId || order.id || 'Order'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
