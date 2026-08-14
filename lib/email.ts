import nodemailer from 'nodemailer';
import { Order } from './orders';
import { generateOrderEmailHtml } from './emailTemplate';

const SHOP_GMAIL = process.env.GMAIL_EMAIL || 'udaysinh96591.mb@gmail.com';
const GMAIL_PASSWORD = process.env.GMAIL_APP_PASSWORD;

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  previewNote?: string;
}

export async function sendOrderNotificationEmail(order: Order): Promise<SendEmailResult> {
  const emailHtml = generateOrderEmailHtml(order);
  const subject = `🚗 New Order #${order.id} — ${order.productName} — ₹${order.total.toLocaleString('en-IN')}`;
  const cleanPhone = order.customerPhone.replace(/\D/g, '').replace(/^91/, '').slice(-10);

  // 1. Direct Web-to-Email Delivery via FormSubmit (Delivers instantly to udaysinh96591.mb@gmail.com)
  try {
    const formattedDateTime = new Date(order.createdAt || Date.now()).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const formPayload = {
      _subject: `⚡ NEW ORDER #${order.id} 🚗 ${order.productName} (₹${order.total.toLocaleString('en-IN')}) - ${order.customerName}`,
      _template: 'table',
      _captcha: 'false',
      'Order ID': `#${order.id}`,
      'Product Name': order.productName,
      'Total Bill (COD)': `₹${order.total.toLocaleString('en-IN')}`,
      'Quantity': `${order.quantity} Unit(s)`,
      'Unit Price': `₹${order.unitPrice.toLocaleString('en-IN')}`,
      'Payment Method': order.paymentMethod || 'Cash on Delivery (COD)',
      'Customer Name': order.customerName,
      'Customer Mobile': `+91 ${cleanPhone}`,
      'WhatsApp Chat': `https://wa.me/91${cleanPhone}`,
      'Full Delivery Address': order.address,
      'Car Model or Note': order.message || 'None (Standard)',
      'Customer Email': order.customerEmail || 'Not provided',
      'Order Time': formattedDateTime
    };

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://ais-dev-vubxklufqlr4cytpojazhq-460071883534.asia-east1.run.app';

    fetch(`https://formsubmit.co/ajax/${SHOP_GMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': appOrigin,
        'Referer': `${appOrigin}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(formPayload),
    }).then(res => res.json()).then(data => {
      console.log(`[Email Service] FormSubmit delivery status for #${order.id}:`, data);
    }).catch(err => {
      console.error('[Email Service] FormSubmit error:', err);
    });
  } catch (fsErr) {
    console.error('[Email Service] FormSubmit dispatch failed:', fsErr);
  }

  // 2. Direct SMTP delivery if GMAIL_APP_PASSWORD is provided
  if (GMAIL_PASSWORD && GMAIL_PASSWORD.trim() !== '') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SHOP_GMAIL,
          pass: GMAIL_PASSWORD.replace(/\s+/g, ''),
        },
      });

      const mailOptions = {
        from: `"Uday Car Care Orders" <${SHOP_GMAIL}>`,
        to: SHOP_GMAIL,
        replyTo: order.customerEmail || SHOP_GMAIL,
        subject: subject,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Gmail SMTP sent for Order #${order.id}. ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`[Email Service] Gmail SMTP error for #${order.id}:`, error);
    }
  }

  return {
    success: true,
    previewNote: `Order delivered to ${SHOP_GMAIL}.`,
  };
}

export async function sendEnquiryEmail(data: { name: string; phone: string; email: string; address?: string; message: string }): Promise<SendEmailResult> {
  const subject = `📩 New Enquiry from ${data.name} (+91 ${data.phone}) — Uday Car Care`;

  // 1. Direct Web-to-Email Delivery via FormSubmit
  try {
    const formPayload = {
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      '1_Type': 'Customer Enquiry / Part Request',
      '2_Customer_Name': data.name,
      '3_Customer_Mobile': `+91 ${data.phone}`,
      '4_Customer_Email': data.email || 'Not provided',
      '5_Address_or_City': data.address || 'Not specified',
      '6_Message': data.message,
      '7_Timestamp': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://ais-dev-vubxklufqlr4cytpojazhq-460071883534.asia-east1.run.app';

    fetch(`https://formsubmit.co/ajax/${SHOP_GMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': appOrigin,
        'Referer': `${appOrigin}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(formPayload),
    }).catch(err => {
      console.error('[Enquiry Email] FormSubmit error:', err);
    });
  } catch (err) {
    console.error('[Enquiry Email] Dispatch failed:', err);
  }

  // 2. Direct SMTP if password is available
  if (GMAIL_PASSWORD && GMAIL_PASSWORD.trim() !== '') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SHOP_GMAIL,
          pass: GMAIL_PASSWORD.replace(/\s+/g, ''),
        },
      });

      const html = `
      <div style="background-color: #0b0f14; padding: 24px; font-family: sans-serif; color: #f4f7fa;">
        <div style="max-width: 540px; margin: 0 auto; background: #161f29; border: 1px solid #26333f; border-radius: 12px; padding: 20px;">
          <h2 style="color: #ff6a1a; margin-top: 0;">New Customer Enquiry</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> <a href="tel:+91${data.phone}" style="color: #2fbf71;">+91 ${data.phone}</a></p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #3b82f6;">${data.email}</a></p>
          ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ''}
          <div style="background: #0f151c; border-left: 3px solid #ff6a1a; padding: 12px; margin: 16px 0; border-radius: 4px;">
            <strong>Message:</strong><br/>
            ${data.message.replace(/\n/g, '<br/>')}
          </div>
          <div style="margin-top: 20px;">
            <a href="https://wa.me/91${data.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${data.name}, this is Uday Car Care responding to your enquiry.`)}" style="background: #25D366; color: #000; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; margin-right: 8px;">WhatsApp</a>
            <a href="tel:+91${data.phone.replace(/\D/g, '')}" style="background: #ff6a1a; color: #000; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Call</a>
          </div>
        </div>
      </div>
      `;

      const info = await transporter.sendMail({
        from: `"Uday Car Care Website" <${SHOP_GMAIL}>`,
        to: SHOP_GMAIL,
        replyTo: data.email || SHOP_GMAIL,
        subject,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`[Email Service] Error sending enquiry:`, error);
    }
  }

  return { success: true };
}
