import { useState, useEffect } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, Home } from 'lucide-react';

export default function TrackOrderModal({ isOpen, onClose, initialOrderId }: any) {
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerTrack = (id: string) => {
    setIsSearching(true);
    setResult(null);

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      // Mock order result for any ID
      const stages = [
        { id: 'placed', label: 'Order Placed', icon: Package, date: 'Pending' },
        { id: 'processing', label: 'Processing', icon: Clock, date: 'Pending' },
        { id: 'shipped', label: 'Shipped', icon: Truck, date: 'Pending' },
        { id: 'delivered', label: 'Delivered', icon: Home, date: 'Pending' },
      ];

      if (id.trim().toUpperCase().startsWith('ORD-')) {
        // Mock a status based on a random number or just set to 'processing'
        setResult({
          status: 'processing',
          stages: [
            { id: 'placed', label: 'Order Placed', icon: Package, date: new Date(Date.now() - 86400000).toLocaleDateString('en-IN', { dateStyle: 'medium' }), completed: true },
            { id: 'processing', label: 'Processing', icon: Clock, date: 'In Progress', completed: true },
            { id: 'shipped', label: 'Shipped', icon: Truck, date: 'Pending', completed: false },
            { id: 'delivered', label: 'Delivered', icon: Home, date: 'Pending', completed: false },
          ]
        });
      } else {
        setResult('not_found');
      }
    }, 1200);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialOrderId) {
          setOrderId(initialOrderId);
          triggerTrack(initialOrderId);
        } else {
          setOrderId('');
          setResult(null);
        }
      }, 0);
    }
  }, [isOpen, initialOrderId]);

  if (!isOpen) return null;

  const handleTrack = (e: any) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    triggerTrack(orderId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0f14]/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161f29] border border-[#26333f] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-5 border-b border-[#26333f]">
          <h3 className="font-rajdhani font-bold text-xl text-[#f4f7fa] uppercase tracking-wider flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ff6a1a]" />
            Track Order
          </h3>
          <button onClick={onClose} className="p-2 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors rounded-full hover:bg-[#26333f]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleTrack} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a1ae]" />
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-12345)"
                className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl pl-10 pr-4 py-3 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching || !orderId.trim()}
              className="px-6 py-3 rounded-xl font-rajdhani font-bold text-[0.9rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] transition-all hover:bg-[#ff803b] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSearching ? 'Tracking...' : 'Track'}
            </button>
          </form>

          {result === 'not_found' && (
            <div className="p-6 bg-[#0b0f14] border border-[#26333f] rounded-xl text-center space-y-2">
              <Package className="w-8 h-8 text-[#425263] mx-auto mb-3" />
              <h4 className="text-[#f4f7fa] font-medium">Order Not Found</h4>
              <p className="text-[#93a1ae] text-sm">Please check your Order ID and try again. It should start with &apos;ORD-&apos;.</p>
            </div>
          )}

          {result && result !== 'not_found' && (
            <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-5">
              <h4 className="font-semibold text-[#f4f7fa] mb-6 flex justify-between items-center">
                <span>Order Status</span>
                <span className="text-xs px-2 py-1 bg-[#ff6a1a]/10 text-[#ff6a1a] rounded-full uppercase tracking-wider">
                  {result.status}
                </span>
              </h4>
              
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#26333f]"></div>
                
                {result.stages.map((stage: any, index: number) => (
                  <div key={stage.id} className="flex gap-4 relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-300
                      ${stage.completed 
                        ? 'bg-[#2fbf71] border-[#2fbf71] text-[#0b0f14]' 
                        : 'bg-[#161f29] border-[#26333f] text-[#425263]'
                      }
                    `}>
                      {stage.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <stage.icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-medium ${stage.completed ? 'text-[#f4f7fa]' : 'text-[#93a1ae]'}`}>
                        {stage.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${stage.completed ? 'text-[#93a1ae]' : 'text-[#425263]'}`}>
                        {stage.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!result && !isSearching && (
            <div className="text-center p-4">
              <p className="text-sm text-[#93a1ae]">Enter your Order ID from the confirmation message to see the current status of your delivery.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
