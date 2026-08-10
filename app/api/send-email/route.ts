import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, address, message } = await req.json();

    const gmailEmail = process.env.GMAIL_EMAIL;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailEmail || !gmailAppPassword) {
      return NextResponse.json(
        { error: 'Email configuration (GMAIL_EMAIL, GMAIL_APP_PASSWORD) is missing on the server.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailEmail,
        pass: gmailAppPassword,
      },
    });

    const mailOptions = {
      from: `"${name}" <${gmailEmail}>`, // Must send from the authenticated email to avoid spam blocks, but can set replyTo
      replyTo: email,
      to: 'udaysinh96591.mb@gmail.com',
      subject: `New Enquiry from ${name} — Uday Car Shopkeeper Website`,
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nDelivery Address: ${address}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    let errorMessage = 'Failed to send email. Please try again later.';
    if (error.message && error.message.includes('Application-specific password required')) {
      errorMessage = 'Failed to send email: Application-specific password required. Please configure GMAIL_APP_PASSWORD in your Secrets.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
