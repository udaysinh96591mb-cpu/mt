const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, phone, email, productName, price, quantity = 1, address, message = '', paymentMethod = 'COD' } = data;

    if (!name || !phone || !productName || !price || !address) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Missing required order fields.' }),
      };
    }

    const cleanPhone = String(phone).replace(/\D/g, '').replace(/^91/, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Please enter a valid 10-digit mobile number.' }),
      };
    }

    const numQty = Math.max(1, parseInt(quantity, 10) || 1);
    const numPrice = parseFloat(price) || 0;
    const total = numQty * numPrice;
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST';

    const SHOP_GMAIL = process.env.GMAIL_EMAIL || 'udaysinh96591.mb@gmail.com';
    const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD;

    let emailSent = false;
    let emailMessageId = null;

    if (GMAIL_PASSWORD && GMAIL_PASSWORD.trim() !== '') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SHOP_GMAIL,
          pass: GMAIL_PASSWORD.replace(/\s+/g, ''),
        },
      });

      const waCustomerLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi ${name}, this is Uday Lcar regarding your Order #${orderId} (${productName}).`)}`;
      const callCustomerLink = `tel:+91${cleanPhone}`;
      const copyText = `Order ID: ${orderId}\nCustomer: ${name}\nPhone: ${phone}\nProduct: ${productName} (x${numQty})\nTotal: Rs. ${total}\nAddress: ${address}\nNote: ${message || 'None'}`;

      const html = `
      <!DOCTYPE html>
      <html>
      <body style="background: #0b0f14; font-family: Arial, sans-serif; color: #f4f7fa; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #161f29; border: 1px solid #26333f; border-radius: 12px; overflow: hidden;">
          <div style="background: #1c2733; padding: 24px; text-align: center; border-bottom: 2px solid #ff6a1a;">
            <div style="color: #ff6a1a; font-weight: bold; font-size: 11px; letter-spacing: 1.5px;">🚨 NEW ORDER RECEIVED</div>
            <h1 style="color: #ffffff; margin: 6px 0; font-size: 22px;">UDAY LCAR SHOPKEEPER</h1>
            <p style="color: #93a1ae; margin: 0; font-size: 12px;">Order ID: <strong style="color: #ff6a1a;">${orderId}</strong> | ${dateStr}</p>
          </div>
          <div style="padding: 24px;">
            <div style="background: rgba(255,106,26,0.1); border: 1px solid #ff6a1a; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px;">
              <div style="color: #93a1ae; font-size: 11px; text-transform: uppercase;">Total Order Amount</div>
              <div style="color: #2fbf71; font-size: 28px; font-weight: bold;">₹${total.toLocaleString('en-IN')}</div>
              <div style="color: #93a1ae; font-size: 11px;">Payment: ${paymentMethod} · Status: 🟡 NEW</div>
            </div>
            <div style="background: #0f151c; border: 1px solid #26333f; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
              <h3 style="color: #ff6a1a; margin-top: 0; font-size: 13px; text-transform: uppercase;">Customer Information</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> <a href="tel:+91${cleanPhone}" style="color: #2fbf71;">+91 ${cleanPhone}</a></p>
              ${email ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${email}</p>` : ''}
              <p style="margin: 4px 0; font-size: 13px;"><strong>Delivery Address:</strong> ${address}</p>
              ${message ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Special Note:</strong> ${message}</p>` : ''}
            </div>
            <div style="background: #0f151c; border: 1px solid #26333f; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
              <h3 style="color: #ff6a1a; margin-top: 0; font-size: 13px; text-transform: uppercase;">Order Items</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Product:</strong> ${productName}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Quantity:</strong> ${numQty}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Unit Price:</strong> ₹${numPrice.toLocaleString('en-IN')}</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${waCustomerLink}" style="background: #25D366; color: #000; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; display: inline-block;">🟢 WhatsApp Customer</a>
              <a href="${callCustomerLink}" style="background: #ff6a1a; color: #000; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 4px; display: inline-block;">📞 Call Customer</a>
            </div>
            <div style="background: #080b0f; border: 1px dashed #26333f; padding: 10px; font-family: monospace; font-size: 11px; color: #c9d2da; border-radius: 6px;">
              ${copyText.replace(/\n/g, '<br/>')}
            </div>
          </div>
        </div>
      </body>
      </html>
      `;

      const info = await transporter.sendMail({
        from: `"Uday Lcar Orders" <${SHOP_GMAIL}>`,
        to: SHOP_GMAIL,
        subject: `🛍️ New Order #${orderId} — ${productName} — ₹${total.toLocaleString('en-IN')}`,
        html,
      });

      emailSent = true;
      emailMessageId = info.messageId;
    }

    const waText = `🚨 *New Order — Uday Lcar Shopkeeper*\n\n*Order ID:* ${orderId}\n*Customer:* ${name}\n*Phone:* +91 ${cleanPhone}\n*Product:* ${productName} (x${numQty})\n*Total:* Rs. ${total.toLocaleString('en-IN')}\n*Address:* ${address}\n${message ? `*Message:* ${message}\n` : ''}`;
    const waLink = `https://wa.me/919106377300?text=${encodeURIComponent(waText)}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        orderId,
        total,
        emailSent,
        emailMessageId,
        waLink,
        message: 'Order placed successfully!'
      }),
    };
  } catch (err) {
    console.error('Netlify function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message || 'Server error' }),
    };
  }
};
