import { Order } from './orders';

export function formatIndianDateTime(isoString?: string): string {
  try {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }) + ' IST';
  } catch (e) {
    return new Date().toLocaleString('en-IN');
  }
}

export function generateOrderEmailHtml(order: Order): string {
  const formattedDate = formatIndianDateTime(order.createdAt);
  const cleanPhone = order.customerPhone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
  
  const waCustomerMsg = `Hi ${order.customerName}, this is Uday Lcar Shopkeeper regarding your Order #${order.id} for ${order.productName} (Total: Rs. ${order.total}). We have received your order and are processing it!`;
  const waCustomerLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waCustomerMsg)}`;
  const callCustomerLink = `tel:+91${cleanPhone}`;

  const copySummaryText = `Order ID: ${order.id}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Product: ${order.productName} (x${order.quantity})
Unit Price: Rs. ${order.unitPrice}
Total Amount: Rs. ${order.total}
Delivery Address: ${order.address}
Note: ${order.message || 'None'}
Status: ${order.status}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${order.id} — Uday Lcar</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f14;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f7fa;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f14;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #161f29;
      border: 1px solid #26333f;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .header {
      background: linear-gradient(135deg, #1c2733 0%, #0e141b 100%);
      padding: 28px 24px;
      border-bottom: 2px solid #ff6a1a;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 106, 26, 0.15);
      border: 1px solid rgba(255, 106, 26, 0.4);
      color: #ff6a1a;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .brand-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }
    .brand-subtitle {
      color: #93a1ae;
      font-size: 12px;
      letter-spacing: 1px;
      margin: 0;
      text-transform: uppercase;
    }
    .content {
      padding: 24px;
    }
    .card {
      background-color: #0f151c;
      border: 1px solid #26333f;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      color: #ff6a1a;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #1f2a36;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .info-label {
      color: #93a1ae;
      min-width: 110px;
    }
    .info-value {
      color: #f4f7fa;
      font-weight: 600;
      text-align: right;
      word-break: break-word;
    }
    .total-box {
      background: linear-gradient(135deg, rgba(255, 106, 26, 0.12) 0%, rgba(47, 191, 113, 0.08) 100%);
      border: 1.5px solid #ff6a1a;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
      text-align: center;
    }
    .total-label {
      font-size: 11px;
      color: #93a1ae;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }
    .total-amount {
      font-size: 32px;
      font-weight: 800;
      color: #2fbf71;
      letter-spacing: 0.5px;
    }
    .btn-container {
      margin: 20px 0 10px 0;
    }
    .btn {
      display: inline-block;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      text-align: center;
      margin: 5px 4px;
      box-sizing: border-box;
    }
    .btn-wa {
      background-color: #25D366;
      color: #0b0f14 !important;
    }
    .btn-call {
      background-color: #ff6a1a;
      color: #0b0f14 !important;
    }
    .btn-admin {
      background-color: #1c2733;
      color: #f4f7fa !important;
      border: 1px solid #26333f;
    }
    .copy-block {
      background-color: #080b0f;
      border: 1px dashed #26333f;
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      color: #c9d2da;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 10px;
      user-select: all;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #ff9800;
      color: #0b0f14;
    }
    .footer {
      background-color: #0e141b;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #26333f;
      color: #93a1ae;
      font-size: 11px;
    }
    .footer a {
      color: #ff6a1a;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <div class="badge">🚨 NEW ORDER RECEIVED</div>
        <h1 class="brand-title">Uday Lcar Shopkeeper</h1>
        <p class="brand-subtitle">Genuine Auto Parts &amp; Accessories · Ahmedabad</p>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <!-- ORDER SUMMARY -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
          <tr>
            <td style="color: #93a1ae; font-size: 12px;">Order ID: <strong style="color: #ff6a1a; font-family: monospace; font-size: 14px;">${order.id}</strong></td>
            <td align="right" style="color: #93a1ae; font-size: 12px;">Date: <strong style="color: #f4f7fa;">${formattedDate}</strong></td>
          </tr>
        </table>

        <!-- TOTAL HIGHLIGHT -->
        <div class="total-box">
          <div class="total-label">Total Order Value</div>
          <div class="total-amount">₹${order.total.toLocaleString('en-IN')}</div>
          <div style="font-size: 11px; color: #93a1ae; margin-top: 4px;">Payment Method: <strong>${order.paymentMethod || 'Cash on Delivery (COD)'}</strong> · Status: <span class="status-badge">🟡 NEW</span></div>
        </div>

        <!-- PRODUCT DETAILS -->
        <div class="card">
          <div class="card-title">📦 Ordered Item</div>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td style="color: #93a1ae;">Product:</td>
              <td align="right" style="color: #ffffff; font-weight: 700;">${order.productName}</td>
            </tr>
            <tr>
              <td style="color: #93a1ae;">Quantity:</td>
              <td align="right" style="color: #f4f7fa; font-weight: 600;">${order.quantity} unit(s)</td>
            </tr>
            <tr>
              <td style="color: #93a1ae;">Price per unit:</td>
              <td align="right" style="color: #f4f7fa; font-weight: 600;">₹${order.unitPrice.toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top: 1px solid #1f2a36;">
              <td style="color: #ff6a1a; font-weight: 700; padding-top: 8px;">Grand Total:</td>
              <td align="right" style="color: #2fbf71; font-weight: 800; font-size: 15px; padding-top: 8px;">₹${order.total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <!-- CUSTOMER DETAILS -->
        <div class="card">
          <div class="card-title">👤 Customer Information</div>
          <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px;">
            <tr>
              <td style="color: #93a1ae; width: 120px;">Full Name:</td>
              <td style="color: #ffffff; font-weight: 700;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="color: #93a1ae;">Mobile / Phone:</td>
              <td style="color: #2fbf71; font-weight: 700; font-family: monospace; font-size: 14px;">+91 ${cleanPhone}</td>
            </tr>
            ${order.customerEmail ? `
            <tr>
              <td style="color: #93a1ae;">Email:</td>
              <td style="color: #f4f7fa;">${order.customerEmail}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="color: #93a1ae; vertical-align: top;">Delivery Address:</td>
              <td style="color: #f4f7fa; font-weight: 600; line-height: 1.4;">${order.address}</td>
            </tr>
            ${order.message ? `
            <tr>
              <td style="color: #93a1ae; vertical-align: top;">Customer Note:</td>
              <td style="color: #ff9351; font-style: italic;">"${order.message}"</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="card" style="text-align: center;">
          <div class="card-title">⚡ Quick Actions</div>
          <div class="btn-container">
            <a href="${waCustomerLink}" target="_blank" class="btn btn-wa">
              🟢 WhatsApp Customer
            </a>
            <a href="${callCustomerLink}" class="btn btn-call">
              📞 Call Customer (+91 ${cleanPhone})
            </a>
          </div>
        </div>

        <!-- COPY-FRIENDLY SUMMARY -->
        <div class="card">
          <div class="card-title">📋 Copy-Friendly Order Summary</div>
          <div style="font-size: 11px; color: #93a1ae; margin-bottom: 6px;">Select all and copy below text to forward to dispatch/delivery:</div>
          <pre class="copy-block">${copySummaryText}</pre>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;"><strong>Uday Lcar Shopkeeper</strong> · WhatsApp: +91 91063 77300</p>
        <p style="margin: 0; color: #627282;">Email: <a href="mailto:udaysinh96591.mb@gmail.com">udaysinh96591.mb@gmail.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
