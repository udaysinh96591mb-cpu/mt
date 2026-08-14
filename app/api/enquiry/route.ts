import { NextRequest, NextResponse } from 'next/server';
import { sendEnquiryEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, address, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ success: false, message: 'Please provide your name, phone number, and message.' }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').replace(/^91/, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
    }

    const emailResult = await sendEnquiryEmail({
      name: name.trim(),
      phone: cleanPhone,
      email: email ? email.trim() : '',
      address: address ? address.trim() : undefined,
      message: message.trim()
    });

    const waText = `Hi Uday Lcar Shopkeeper, I am ${name} (+91 ${cleanPhone}).\nEmail: ${email || 'N/A'}\nAddress: ${address || 'N/A'}\n\nEnquiry: ${message}`;
    const waLink = `https://wa.me/919106377300?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({
      success: true,
      message: 'Enquiry received successfully! Our team will contact you shortly.',
      emailResult,
      waLink
    });
  } catch (error: any) {
    console.error('Error handling enquiry:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error processing enquiry' }, { status: 500 });
  }
}
