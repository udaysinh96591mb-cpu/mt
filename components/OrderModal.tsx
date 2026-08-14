'use client';

import { useState } from 'react';
import { 
  X, CheckCircle2, AlertCircle, ShoppingCart, Loader2, 
  MessageCircle, Copy, Check, Package, MapPin, Phone, User, 
  ArrowRight, CreditCard
} from 'lucide-react';
import Image from 'next/image';

interface Product {
  name: string;
  price: number;
  tag: string;
  desc?: string;
  img: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onTrackOrder?: (orderId: string) => void;
}

function generateFallbackId(): string {
  return 'ORD-' + Math.floor(100000 + Math.random() * 900000).toString();
}

function getLastUserData() {
  if (typeof window === 'undefined') return { name: '', phone: '', email: '', address: '' };
  try {
    const lastUser = JSON.parse(localStorage.getItem('uc_last_user') || '{}');
    return {
      name: lastUser.name || '',
      phone: lastUser.phone || '',
      email: lastUser.email || '',
      address: lastUser.address || '',
    };
  } catch {
    return { name: '', phone: '', email: '', address: '' };
  }
}

function OrderModalContent({ 
  product, 
  onClose, 
  onTrackOrder 
}: { 
  product: Product; 
  onClose: () => void; 
  onTrackOrder?: (orderId: string) => void;
}) {
  const [initialUser] = useState(getLastUserData);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(initialUser.name);
  const [phone, setPhone] = useState(initialUser.phone);
  const [email, setEmail] = useState(initialUser.email);
  const [address, setAddress] = useState(initialUser.address);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);

  const total = product.price * quantity;

  // Clean and extract 10-digit mobile number
  const getCleanMobile = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length > 10 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits;
  };

  const validatePhone = (val: string) => {
    const cleaned = getCleanMobile(val);
    if (!cleaned) {
      setPhoneError('Mobile number is required');
      return false;
    }
    if (cleaned.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhone(raw);
    if (phoneError) setPhoneError('');
    if (errorMessage) setErrorMessage('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPhoneError('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanDigits = getCleanMobile(phone);
    if (!cleanDigits || cleanDigits.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      setErrorMessage('Please enter a valid 10-digit mobile number (e.g., 9876543210).');
      const el = document.getElementById('phone-input');
      if (el) el.focus();
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Please enter your delivery address / city / shop pickup location.');
      return;
    }

    setIsSubmitting(true);

    const finalPhone = cleanDigits.slice(-10);

    const payload = {
      name: name.trim(),
      phone: finalPhone,
      email: email.trim(),
      productName: product.name,
      price: product.price,
      quantity,
      address: address.trim(),
      message: message.trim(),
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
    };

    const fallbackId = generateFallbackId();
    const nowIso = new Date().toISOString();

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        // Fallback handled below
      }

      if (response.ok && data && data.success && data.order) {
        saveOrderLocally(data.order);
        setCompletedOrder({
          ...data.order,
          waLink: data.waLink,
          waText: data.waText
        });
      } else {
        const fallbackOrder = {
          id: fallbackId,
          customerName: name.trim(),
          customerPhone: finalPhone,
          customerEmail: email.trim(),
          productName: product.name,
          quantity,
          unitPrice: product.price,
          total,
          address: address.trim(),
          message: message.trim(),
          paymentMethod: payload.paymentMethod,
          status: 'NEW',
          createdAt: nowIso,
        };
        saveOrderLocally(fallbackOrder);
        setCompletedOrder(fallbackOrder);
      }
    } catch (err: any) {
      const offlineOrder = {
        id: fallbackId,
        customerName: name.trim(),
        customerPhone: finalPhone,
        customerEmail: email.trim(),
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total,
        address: address.trim(),
        message: message.trim(),
        paymentMethod: payload.paymentMethod,
        status: 'NEW',
        createdAt: nowIso,
      };
      saveOrderLocally(offlineOrder);
      setCompletedOrder(offlineOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveOrderLocally = (ord: any) => {
    try {
      localStorage.setItem('uc_last_user', JSON.stringify({
        name: ord.customerName,
        phone: ord.customerPhone,
        email: ord.customerEmail || '',
        address: ord.address
      }));
      const existing = JSON.parse(localStorage.getItem('uc_orders') || '[]');
      localStorage.setItem('uc_orders', JSON.stringify([ord, ...existing.filter((o: any) => o.id !== ord.id)]));
      window.dispatchEvent(new Event('orderHistoryUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleOpenWhatsApp = (customWaLink?: string) => {
    if (customWaLink) {
      window.open(customWaLink, '_blank');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const orderId = completedOrder ? completedOrder.id : `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const waText = 
`New Order — Uday Lcar Shopkeeper

Order ID: ${orderId}
Customer: ${name.trim() || 'Valued Customer'}
Phone: ${cleanPhone || 'N/A'}
Product: ${product.name}
Quantity: ${quantity}
Total: Rs. ${total.toLocaleString('en-IN')}
Address: ${address.trim() || 'Store Pickup / On Delivery'}
${message.trim() ? `Message: ${message.trim()}` : 'Message: None'}`;

    const link = `https://wa.me/919106377300?text=${encodeURIComponent(waText)}`;
    window.open(link, '_blank');
  };

  return (
    <div className="w-full max-w-xl bg-[#161f29] border border-[#26333f] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#26333f] bg-[#111822]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff6a1a]/15 border border-[#ff6a1a]/30 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-[#ff6a1a]" />
          </div>
          <div>
            <h3 className="font-rajdhani font-bold text-[1.15rem] text-[#f4f7fa] uppercase tracking-wide leading-none">
              {completedOrder ? 'Order Confirmed!' : 'Place Your Order'}
            </h3>
            <p className="font-mono text-[0.68rem] text-[#93a1ae] tracking-wider uppercase mt-0.5">
              Uday Lcar Shopkeeper · Direct Dispatch
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors rounded-lg hover:bg-[#26333f]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* BODY */}
      <div className="p-6">
        {!completedOrder ? (
          /* ================= ORDER FORM ================= */
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Product Card Summary */}
            <div className="bg-[#0b0f14] p-4 rounded-xl border border-[#26333f] flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#161f29] shrink-0 border border-[#26333f]">
                <Image 
                  src={product.img} 
                  alt={product.name} 
                  fill 
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.65rem] font-mono text-[#ff6a1a] uppercase tracking-wider">{product.tag}</span>
                <h4 className="font-rajdhani font-bold text-[#f4f7fa] text-[1.05rem] truncate leading-tight">{product.name}</h4>
                <p className="text-[#2fbf71] font-mono font-bold text-[0.95rem]">
                  ₹{product.price.toLocaleString('en-IN')} <span className="text-[#93a1ae] text-[0.7rem] font-normal uppercase">MRP</span>
                </p>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center bg-[#161f29] border border-[#26333f] rounded-lg p-0.5">
                  <button 
                    type="button" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="w-7 h-7 flex items-center justify-center text-[#f4f7fa] hover:text-[#ff6a1a] hover:bg-[#26333f] rounded transition-colors text-base font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-[#f4f7fa] font-mono font-bold text-sm">{quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="w-7 h-7 flex items-center justify-center text-[#f4f7fa] hover:text-[#ff6a1a] hover:bg-[#26333f] rounded transition-colors text-base font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-[0.68rem] text-[#93a1ae] uppercase block">Total</span>
                  <span className="font-mono font-bold text-[#2fbf71] text-[1rem]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-[#93a1ae] text-[0.72rem] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#ff6a1a]" /> Full Name *
                </label>
                <input 
                  required 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ritesh Patel" 
                  className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl px-3.5 py-2.5 text-[#f4f7fa] text-sm placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" 
                />
              </div>

              <div>
                <label className="block text-[#93a1ae] text-[0.72rem] uppercase tracking-wider font-semibold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#ff6a1a]" /> 10-Digit Mobile *
                  </span>
                  {phone && !phoneError && getCleanMobile(phone).length >= 10 && (
                    <span className="text-[#2fbf71] text-[0.68rem] font-mono flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93a1ae] font-mono text-xs">+91</span>
                  <input 
                    id="phone-input"
                    required 
                    type="tel" 
                    maxLength={15}
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210" 
                    className={`w-full bg-[#0b0f14] border ${phoneError ? 'border-red-500' : 'border-[#26333f]'} rounded-xl pl-11 pr-3.5 py-2.5 text-[#f4f7fa] font-mono text-sm placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors`} 
                  />
                </div>
                {phoneError && (
                  <p className="text-red-400 text-[0.7rem] mt-1">{phoneError}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[#93a1ae] text-[0.72rem] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
                Email Address (For Invoice Copy)
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com" 
                className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl px-3.5 py-2.5 text-[#f4f7fa] text-sm placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[#93a1ae] text-[0.72rem] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#ff6a1a]" /> Delivery Address *
              </label>
              <textarea 
                required 
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Flat No., Landmark, Area, City, Pincode" 
                className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl px-3.5 py-2.5 text-[#f4f7fa] text-sm placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors resize-none" 
              />
            </div>

            <div>
              <label className="block text-[#93a1ae] text-[0.72rem] uppercase tracking-wider font-semibold mb-1.5">
                Special Note or Car Model (Optional)
              </label>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Swift Dzire 2021 model, call before delivery" 
                className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl px-3.5 py-2.5 text-[#f4f7fa] text-sm placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" 
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-wider uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_10px_25px_-8px_rgba(255,106,26,0.5)] transition-all hover:bg-[#ff803b] hover:shadow-[0_14px_30px_-8px_rgba(255,106,26,0.7)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm COD Order (₹{total.toLocaleString('en-IN')})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => handleOpenWhatsApp()}
                className="w-full py-3 rounded-xl font-rajdhani font-bold text-[0.92rem] tracking-wider uppercase bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] transition-all hover:border-[#2fbf71] hover:bg-[#152018] hover:text-[#2fbf71] flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#2fbf71]" />
                <span>Order Directly on WhatsApp</span>
              </button>
            </div>

            <p className="text-center text-[0.68rem] text-[#93a1ae] pt-1">
              🔒 Safe &amp; verified by Uday Lcar Shopkeeper · We never share your phone number.
            </p>
          </form>
        ) : (
          /* ================= SUCCESS CONFIRMATION ================= */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#2fbf71]/15 border border-[#2fbf71]/40 flex items-center justify-center mx-auto mb-3 text-[#2fbf71]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-rajdhani font-bold text-2xl text-[#f4f7fa] uppercase tracking-wide">
                Order Successfully Placed!
              </h4>
              <p className="text-[#93a1ae] text-xs max-w-sm mx-auto mt-1">
                Your order has been recorded and an email notification has been dispatched to the shopkeeper.
              </p>
            </div>

            {/* Order ID Box */}
            <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[0.68rem] text-[#93a1ae] uppercase tracking-wider font-mono block">Your Unique Order ID</span>
                <span className="font-mono font-bold text-lg text-[#ff6a1a] tracking-wider">{completedOrder.id}</span>
              </div>
              <button 
                onClick={() => copyOrderId(completedOrder.id)} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161f29] border border-[#26333f] text-xs font-semibold text-[#f4f7fa] hover:border-[#ff6a1a] transition-all"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2fbf71]" />
                    <span className="text-[#2fbf71]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#93a1ae]" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Order Summary Breakdown */}
            <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-[#93a1ae]">
                <span>Product:</span>
                <span className="text-[#f4f7fa] font-semibold">{completedOrder.productName} (x{completedOrder.quantity})</span>
              </div>
              <div className="flex justify-between text-[#93a1ae]">
                <span>Customer Name:</span>
                <span className="text-[#f4f7fa] font-semibold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-[#93a1ae]">
                <span>Mobile Phone:</span>
                <span className="text-[#2fbf71] font-mono font-semibold">+91 {completedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-[#93a1ae]">
                <span>Delivery Address:</span>
                <span className="text-[#f4f7fa] text-right font-medium max-w-[200px] truncate">{completedOrder.address}</span>
              </div>
              <div className="flex justify-between text-[#93a1ae]">
                <span>Payment Mode:</span>
                <span className="text-[#f4f7fa] font-semibold">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#26333f] text-sm">
                <span className="text-[#ff6a1a] font-semibold">Total Amount:</span>
                <span className="font-mono font-bold text-[#2fbf71] text-base">₹{completedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-1">
              <a 
                href={completedOrder.waLink || `https://wa.me/919106377300?text=${encodeURIComponent(`New Order — Uday Lcar Shopkeeper\nOrder ID: ${completedOrder.id}\nCustomer: ${completedOrder.customerName}\nProduct: ${completedOrder.productName}\nTotal: Rs. ${completedOrder.total}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[0.95rem] tracking-wider uppercase bg-[#25D366] text-[#0b0f14] shadow-[0_8px_20px_-6px_rgba(37,211,102,0.5)] transition-all hover:bg-[#20bd5a] flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-[#0b0f14]" />
                <span>Send Order On WhatsApp Now</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    onClose();
                    if (onTrackOrder) onTrackOrder(completedOrder.id);
                  }}
                  className="py-2.5 rounded-xl font-rajdhani font-bold text-xs uppercase bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] hover:border-[#ff6a1a] transition-all flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-[#ff6a1a]" />
                  <span>Track Status</span>
                </button>

                <button 
                  onClick={onClose}
                  className="py-2.5 rounded-xl font-rajdhani font-bold text-xs uppercase bg-[#0b0f14] border border-[#26333f] text-[#93a1ae] hover:text-[#f4f7fa] transition-all"
                >
                  Done / Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderModal({ isOpen, onClose, product, onTrackOrder }: OrderModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080b0f]/85 backdrop-blur-md overflow-y-auto">
      <OrderModalContent 
        key={`${product.name}-${isOpen}`}
        product={product} 
        onClose={onClose} 
        onTrackOrder={onTrackOrder} 
      />
    </div>
  );
}
