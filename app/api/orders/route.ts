import { NextRequest, NextResponse } from 'next/server';
import { getOrders, saveOrder, Order } from '@/lib/orders';
import { sendOrderNotificationEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();
    const status = searchParams.get('status');

    let orders = getOrders();

    if (query) {
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerPhone.includes(query) ||
        o.productName.toLowerCase().includes(query)
      );
    }

    if (status && status !== 'ALL') {
      orders = orders.filter(o => o.status === status);
    }

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      productName,
      price,
      quantity = 1,
      address,
      message = '',
      paymentMethod = 'COD'
    } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Please enter a valid full name.' }, { status: 400 });
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '').replace(/^91/, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please enter a valid 10-digit mobile number (e.g., 9876543210).' 
      }, { status: 400 });
    }

    if (!productName || !price) {
      return NextResponse.json({ success: false, message: 'Product information is required.' }, { status: 400 });
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Please provide a complete delivery address.' }, { status: 400 });
    }

    const numQty = Math.max(1, parseInt(String(quantity), 10) || 1);
    const numPrice = parseFloat(String(price)) || 0;
    const total = numQty * numPrice;

    // Generate unique Order ID
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // 2. Construct Order Object
    const newOrder: Order = {
      id: orderId,
      customerName: name.trim(),
      customerPhone: cleanPhone,
      customerEmail: email ? email.trim() : undefined,
      productName: productName.trim(),
      unitPrice: numPrice,
      quantity: numQty,
      total: total,
      address: address.trim(),
      message: message.trim() || undefined,
      paymentMethod: paymentMethod || 'COD',
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Save to database / persistent storage
    const saved = saveOrder(newOrder);

    // 4. Send Gmail Notification via Nodemailer (Server-side)
    const emailResult = await sendOrderNotificationEmail(saved);

    // 5. Build official WhatsApp message text
    const waText = `🚨 *New Order — Uday Lcar Shopkeeper*\n\n` +
      `*Order ID:* ${saved.id}\n` +
      `*Customer:* ${saved.customerName}\n` +
      `*Phone:* +91 ${saved.customerPhone}\n` +
      `*Product:* ${saved.productName} (x${saved.quantity})\n` +
      `*Unit Price:* Rs. ${saved.unitPrice.toLocaleString('en-IN')}\n` +
      `*Total Amount:* Rs. ${saved.total.toLocaleString('en-IN')}\n` +
      `*Payment Method:* ${saved.paymentMethod}\n` +
      `*Delivery Address:* ${saved.address}\n` +
      (saved.message ? `*Message:* ${saved.message}\n` : '') +
      `\n_Order placed on official Uday Lcar portal_`;

    const waLink = `https://wa.me/919106377300?text=${encodeURIComponent(waText)}`;

    return NextResponse.json({
      success: true,
      message: 'Order created and registered successfully!',
      order: saved,
      emailResult,
      waLink,
      waText
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error creating order' }, { status: 500 });
  }
}
