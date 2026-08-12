import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, product }: any) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  if (!isOpen || !product) return null;

  const total = product.price * quantity;

  const saveOrder = (orderId: string, date: string, formData?: FormData) => {
    try {
      const existing = JSON.parse(localStorage.getItem('uc_orders') || '[]');
      const newOrder = {
        id: orderId,
        productName: String(product.name),
        quantity: Number(quantity),
        total: Number(total),
        date: String(date),
        status: 'Pending',
        customerName: formData ? String(formData.get('name') || 'N/A') : 'N/A',
        customerPhone: formData ? String(formData.get('phone') || 'N/A') : 'N/A',
        address: formData ? String(formData.get('address') || 'N/A') : 'N/A',
        paymentMethod: formData ? String(formData.get('payment') || 'N/A') : 'N/A'
      };
      localStorage.setItem('uc_orders', JSON.stringify([newOrder, ...existing]));
      
      // Dispatch a custom event to notify other components that order history changed
      window.dispatchEvent(new Event('orderHistoryUpdated'));
    } catch (e) {
      console.error('Failed to save order', e);
    }
  };

  const handleWaOrder = () => {
    const form = document.getElementById('orderForm') as HTMLFormElement;
    if (!form) return;
    
    // Create form data just for reading values
    const formData = new FormData(form);
    
    // Check required fields manually since button type is 'button'
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const payment = formData.get('payment') as string;
    
    if (!name || !phone || !address || !payment) {
      setStatus({ type: 'error', message: 'Please fill out all required fields first.' });
      return;
    }

    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    const waMsg = `🚨 *New Order on Uday Lcar* 🚨\n\n*Order ID:* ${orderId}\n*Product:* ${product.name} (x${quantity})\n*Total Amount:* Rs. ${total}\n*Payment Method:* ${payment}\n\n*Customer Info:*\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nNote: ${formData.get('message') || 'None'}`;
    const waLink = `https://wa.me/919106377300?text=${encodeURIComponent(waMsg)}`;
    
    saveOrder(orderId, date, formData);
    window.open(waLink, '_blank');
    onClose();
    setQuantity(1);
    setStatus({ type: null, message: '' });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData(e.currentTarget);
    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const date = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

    await submitToWeb3Forms(formData, orderId, date);
  };

  const submitToWeb3Forms = async (formData: FormData, orderId: string, date: string) => {
    formData.append("access_key", "4cce9ebe-d005-4e20-9a4c-083b7e57d085");
    formData.append("subject", `🚨 New Order: ${product.name} - ${orderId}`);
    formData.append("from_name", "Uday Lcar Orders");
    formData.append("Order ID", orderId);
    formData.append("Date & Time", date);
    formData.append("Product", product.name);
    formData.append("Quantity", quantity.toString());
    formData.append("Price per item", `Rs. ${product.price}`);
    formData.append("Total Amount", `Rs. ${total}`);
    // Payment is automatically added as "payment" from radio input

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        saveOrder(orderId, date, formData);
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Order submitted successfully!' } }));
        onClose();
        setStatus({ type: null, message: '' });
        setQuantity(1);
      } else {
        setStatus({ type: 'error', message: result.message || 'Failed to submit order.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0f14]/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161f29] border border-[#26333f] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-5 border-b border-[#26333f]">
          <h3 className="font-rajdhani font-bold text-xl text-[#f4f7fa] uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#ff6a1a]" />
            Complete Order
          </h3>
          <button onClick={onClose} className="p-2 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors rounded-full hover:bg-[#26333f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="orderForm" onSubmit={handleSubmit} className="p-6">
          <div className="bg-[#0b0f14] p-4 rounded-xl border border-[#26333f] mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-[#f4f7fa]">{product.name}</h4>
                  <p className="text-sm text-[#ff6a1a] font-bold">₹{product.price.toLocaleString('en-IN')} <span className="text-[#93a1ae] font-normal text-xs uppercase ml-1">each</span></p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#26333f]">
                <div className="flex items-center gap-3">
                  <span className="text-[#93a1ae] text-sm">Qty:</span>
                  <div className="flex items-center bg-[#161f29] border border-[#26333f] rounded-lg">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-[#f4f7fa] hover:text-[#ff6a1a]">-</button>
                    <span className="text-[#f4f7fa] px-2 font-medium">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 text-[#f4f7fa] hover:text-[#ff6a1a]">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#93a1ae] text-xs uppercase block mb-0.5">Total</span>
                  <span className="font-rajdhani font-bold text-lg text-[#2fbf71]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#93a1ae] text-xs uppercase tracking-wider font-semibold mb-2">Name *</label>
                  <input required name="name" type="text" className="w-full bg-[#0b0f14] border border-[#26333f] rounded-lg px-4 py-2.5 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-[#93a1ae] text-xs uppercase tracking-wider font-semibold mb-2">Phone *</label>
                  <input required name="phone" type="tel" className="w-full bg-[#0b0f14] border border-[#26333f] rounded-lg px-4 py-2.5 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" placeholder="WhatsApp No." />
                </div>
              </div>

              <div>
                <label className="block text-[#93a1ae] text-xs uppercase tracking-wider font-semibold mb-2">Email Address *</label>
                <input required name="email" type="email" className="w-full bg-[#0b0f14] border border-[#26333f] rounded-lg px-4 py-2.5 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" placeholder="For order confirmation" />
              </div>
              
              <div>
                <label className="block text-[#93a1ae] text-xs uppercase tracking-wider font-semibold mb-2">Delivery Address *</label>
                <textarea required name="address" rows={2} className="w-full bg-[#0b0f14] border border-[#26333f] rounded-lg px-4 py-2.5 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" placeholder="Full delivery address"></textarea>
              </div>

              <div>
                <label className="block text-[#93a1ae] text-xs uppercase tracking-wider font-semibold mb-2">Special Request (Optional)</label>
                <input name="message" type="text" className="w-full bg-[#0b0f14] border border-[#26333f] rounded-lg px-4 py-2.5 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors" placeholder="Any specific requirements?" />
              </div>

              <input type="hidden" name="payment" value="COD" />
            </div>

            {status.type === 'error' && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{status.message}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] transition-all hover:bg-[#ff803b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Order'}
              </button>
              <button 
                type="button" 
                onClick={handleWaOrder}
                className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-transparent text-[#f4f7fa] border-[1.5px] border-[#26333f] transition-all hover:border-white hover:bg-white/5"
              >
                Order via WhatsApp Instead
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-transparent text-[#93a1ae] hover:text-[#f4f7fa] transition-all"
              >
                Back
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
