'use client';

import { useState, useEffect } from 'react';
import { 
  X, Search, Package, CheckCircle2, AlertCircle, Loader2, ArrowRight
} from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

function TrackOrderModalContent({
  onClose,
  initialOrderId
}: {
  onClose: () => void;
  initialOrderId?: string;
}) {
  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setIsSearching(true);
    setNotFound(false);
    setOrder(null);

    const cleanId = id.trim().toUpperCase();

    try {
      // 1. Try server API
      const res = await fetch(`/api/orders/${cleanId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          setIsSearching(false);
          return;
        }
      }

      // 2. Try localStorage fallback
      const saved = JSON.parse(localStorage.getItem('uc_orders') || '[]');
      const localMatch = saved.find((o: any) => o.id.toUpperCase() === cleanId);
      if (localMatch) {
        setOrder({
          ...localMatch,
          unitPrice: localMatch.price || localMatch.unitPrice || (localMatch.total / (localMatch.quantity || 1)),
        });
      } else {
        setNotFound(true);
      }
    } catch (err) {
      try {
        const saved = JSON.parse(localStorage.getItem('uc_orders') || '[]');
        const localMatch = saved.find((o: any) => o.id.toUpperCase() === cleanId);
        if (localMatch) {
          setOrder(localMatch);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!initialOrderId) return;
    let ignore = false;
    const cleanId = initialOrderId.trim().toUpperCase();

    fetch(`/api/orders/${cleanId}`)
      .then(res => res.json())
      .then(data => {
        if (!ignore) {
          if (data.success && data.order) {
            setOrder(data.order);
          } else {
            const saved = JSON.parse(localStorage.getItem('uc_orders') || '[]');
            const localMatch = saved.find((o: any) => o.id.toUpperCase() === cleanId);
            if (localMatch) {
              setOrder(localMatch);
            } else {
              setNotFound(true);
            }
          }
        }
      })
      .catch(() => {
        if (!ignore) {
          const saved = JSON.parse(localStorage.getItem('uc_orders') || '[]');
          const localMatch = saved.find((o: any) => o.id.toUpperCase() === cleanId);
          if (localMatch) {
            setOrder(localMatch);
          } else {
            setNotFound(true);
          }
        }
      });

    return () => {
      ignore = true;
    };
  }, [initialOrderId]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return { label: '🟡 NEW (Order Received)', color: 'border-[#ff9800] text-[#ff9800] bg-[#ff9800]/10', stage: 1 };
      case 'CONFIRMED':
        return { label: '🔵 CONFIRMED (Accepted)', color: 'border-[#2196f3] text-[#2196f3] bg-[#2196f3]/10', stage: 2 };
      case 'PROCESSING':
        return { label: '🟣 PROCESSING (Packing)', color: 'border-[#9c27b0] text-[#9c27b0] bg-[#9c27b0]/10', stage: 3 };
      case 'COMPLETED':
        return { label: '🟢 COMPLETED (Delivered)', color: 'border-[#2fbf71] text-[#2fbf71] bg-[#2fbf71]/10', stage: 4 };
      case 'CANCELLED':
        return { label: '🔴 CANCELLED', color: 'border-red-500 text-red-500 bg-red-500/10', stage: 0 };
      default:
        return { label: '🟡 NEW', color: 'border-[#ff9800] text-[#ff9800] bg-[#ff9800]/10', stage: 1 };
    }
  };

  const statusInfo = order ? getStatusBadge(order.status) : null;

  return (
    <div className="w-full max-w-lg bg-[#161f29] border border-[#26333f] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#26333f] bg-[#111822]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff6a1a]/15 border border-[#ff6a1a]/30 flex items-center justify-center">
            <Package className="w-4 h-4 text-[#ff6a1a]" />
          </div>
          <div>
            <h3 className="font-rajdhani font-bold text-[1.15rem] text-[#f4f7fa] uppercase tracking-wide leading-none">
              Track Live Order
            </h3>
            <p className="font-mono text-[0.68rem] text-[#93a1ae] tracking-wider uppercase mt-0.5">
              Real-time status tracking
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors rounded-lg hover:bg-[#26333f]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-5">
        {/* SEARCH FORM */}
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a1ae]" />
            <input 
              type="text" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. ORD-12345)"
              className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl pl-10 pr-3.5 py-2.5 text-[#f4f7fa] text-sm placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors uppercase font-mono"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSearching || !orderId.trim()}
            className="px-5 py-2.5 rounded-xl font-rajdhani font-bold text-xs uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_8px_20px_-6px_rgba(255,106,26,0.5)] transition-all hover:bg-[#ff803b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* NOT FOUND */}
        {notFound && (
          <div className="p-6 bg-[#0b0f14] border border-[#26333f] rounded-xl text-center space-y-2 animate-in fade-in">
            <AlertCircle className="w-8 h-8 text-[#ff6a1a] mx-auto mb-1 opacity-80" />
            <h4 className="text-[#f4f7fa] font-bold text-sm">Order Not Found</h4>
            <p className="text-[#93a1ae] text-xs max-w-xs mx-auto">
              We couldn&apos;t find an active order matching <span className="font-mono text-[#ff6a1a]">{orderId}</span>. Please verify your Order ID from your confirmation message or contact the shopkeeper.
            </p>
          </div>
        )}

        {/* RESULT FOUND */}
        {order && statusInfo && (
          <div className="space-y-4 animate-in fade-in">
            {/* Order Header Box */}
            <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[0.65rem] text-[#93a1ae] uppercase tracking-wider font-mono block">Order ID</span>
                  <span className="font-mono font-bold text-base text-[#ff6a1a]">{order.id}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="pt-2 border-t border-[#26333f]/70 grid grid-cols-2 gap-2 text-xs text-[#93a1ae]">
                <div>
                  <span>Ordered Item:</span>
                  <p className="text-[#f4f7fa] font-semibold">{order.productName} (x{order.quantity})</p>
                </div>
                <div className="text-right">
                  <span>Total Amount:</span>
                  <p className="text-[#2fbf71] font-mono font-bold text-sm">₹{(order.total || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* TIMELINE PROGRESS */}
            {order.status !== 'CANCELLED' ? (
              <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4">
                <h5 className="text-[0.7rem] font-mono uppercase tracking-wider text-[#93a1ae] mb-3">
                  Delivery Progress
                </h5>
                <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#26333f]">
                  {[
                    { num: 1, label: 'Order Received', desc: 'Order placed & notification sent to shop', active: statusInfo.stage >= 1 },
                    { num: 2, label: 'Order Confirmed', desc: 'Confirmed and stock verified by Uday', active: statusInfo.stage >= 2 },
                    { num: 3, label: 'Packed & Processing', desc: 'Item inspected and assigned for dispatch', active: statusInfo.stage >= 3 },
                    { num: 4, label: 'Delivered', desc: 'Order handed over to customer', active: statusInfo.stage >= 4 },
                  ].map((step) => (
                    <div key={step.num} className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${step.active ? 'bg-[#2fbf71] border-[#2fbf71] text-[#0b0f14]' : 'bg-[#161f29] border-[#26333f] text-transparent'}`}>
                        {step.active && <CheckCircle2 className="w-3 h-3 text-[#0b0f14]" />}
                      </div>
                      <p className={`text-xs font-semibold ${step.active ? 'text-[#f4f7fa]' : 'text-[#93a1ae]'}`}>
                        {step.label}
                      </p>
                      <p className="text-[0.68rem] text-[#93a1ae]">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <p className="text-xs text-red-400 font-semibold">This order was cancelled.</p>
              </div>
            )}

            {/* Delivery Details */}
            <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-3.5 text-xs space-y-1.5 text-[#93a1ae]">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="text-[#f4f7fa] font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <span className="text-[#2fbf71] font-mono">+91 {order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-[#f4f7fa] font-medium text-right max-w-[200px] truncate">{order.address}</span>
              </div>
            </div>

            {/* WhatsApp Shopkeeper Support */}
            <a 
              href={`https://wa.me/919106377300?text=${encodeURIComponent(`Hi Uday Lcar, I would like an update on my Order #${order.id}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl font-rajdhani font-bold text-xs uppercase bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] hover:border-[#2fbf71] hover:text-[#2fbf71] transition-all flex items-center justify-center gap-2"
            >
              <span>Ask Shopkeeper on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {!order && !notFound && !isSearching && (
          <div className="p-6 bg-[#0b0f14] border border-[#26333f] rounded-xl text-center">
            <p className="text-xs text-[#93a1ae]">
              Enter the unique Order ID (e.g. <strong className="text-[#ff6a1a]">ORD-89421A</strong>) from your confirmation screen or WhatsApp message to track your package in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderModal({ isOpen, onClose, initialOrderId }: TrackOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080b0f]/85 backdrop-blur-md overflow-y-auto">
      <TrackOrderModalContent 
        key={initialOrderId || 'track-modal'}
        onClose={onClose} 
        initialOrderId={initialOrderId} 
      />
    </div>
  );
}
