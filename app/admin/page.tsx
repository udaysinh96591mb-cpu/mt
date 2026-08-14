'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { 
  Package, Search, Trash2, ChevronDown, ArrowLeft, Lock, LogOut, 
  Eye, X, Phone, User, RefreshCw, 
  MessageCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/lib/orders';
import { formatIndianDateTime } from '@/lib/emailTemplate';

const subscribeStorage = (callback: () => void) => {
  window.addEventListener('storage', callback);
  window.addEventListener('adminAuthChanged', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('adminAuthChanged', callback);
  };
};

function getAuthSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('uc_admin_auth') === 'true';
}

function getServerAuthSnapshot(): boolean {
  return false;
}

export default function AdminDashboard() {
  const isAuthFromStorage = useSyncExternalStore(subscribeStorage, getAuthSnapshot, getServerAuthSnapshot);
  const [localAuthOverride, setLocalAuthOverride] = useState<boolean | null>(null);
  const isAuthenticated = localAuthOverride !== null ? localAuthOverride : isAuthFromStorage;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem('uc_orders', JSON.stringify(data.orders));
          setLoading(false);
          return;
        }
      }

      const stored = JSON.parse(localStorage.getItem('uc_orders') || '[]');
      setOrders(stored);
    } catch (e) {
      console.error('Failed to load orders from API, fallback to local', e);
      const stored = JSON.parse(localStorage.getItem('uc_orders') || '[]');
      setOrders(stored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (!ignore && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem('uc_orders', JSON.stringify(data.orders));
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (!ignore && data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('orderHistoryUpdated', handleUpdate);
    return () => {
      ignore = true;
      window.removeEventListener('orderHistoryUpdated', handleUpdate);
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'uday123' || password === 'admin123') {
      localStorage.setItem('uc_admin_auth', 'true');
      setLocalAuthOverride(true);
      window.dispatchEvent(new Event('adminAuthChanged'));
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uc_admin_auth');
    setLocalAuthOverride(false);
    window.dispatchEvent(new Event('adminAuthChanged'));
    setPassword('');
  };

  const updateStatus = async (id: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
          setOrders(updated);
          localStorage.setItem('uc_orders', JSON.stringify(updated));
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
          }
          setActionSuccess(`Order #${id} status updated to ${newStatus}`);
          setTimeout(() => setActionSuccess(''), 3000);
          return;
        }
      }

      // Fallback update
      const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
      setOrders(updated);
      localStorage.setItem('uc_orders', JSON.stringify(updated));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`Are you sure you want to delete order #${id}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const updated = orders.filter(o => o.id !== id);
      setOrders(updated);
      localStorage.setItem('uc_orders', JSON.stringify(updated));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
      setActionSuccess(`Order #${id} deleted`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (e) {
      console.error('Error deleting order:', e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'border-[#ff9800] text-[#ff9800] bg-[#ff9800]/10';
      case 'CONFIRMED':
        return 'border-[#2196f3] text-[#2196f3] bg-[#2196f3]/10';
      case 'PROCESSING':
        return 'border-[#9c27b0] text-[#9c27b0] bg-[#9c27b0]/10';
      case 'COMPLETED':
        return 'border-[#2fbf71] text-[#2fbf71] bg-[#2fbf71]/10';
      case 'CANCELLED':
        return 'border-red-500 text-red-500 bg-red-500/10';
      default:
        return 'border-[#ff9800] text-[#ff9800] bg-[#ff9800]/10';
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(searchTerm)) ||
      (o.productName && o.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f14] p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#161f29] border border-[#26333f] rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6a1a]/15 border border-[#ff6a1a]/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,106,26,0.2)]">
              <Lock className="w-8 h-8 text-[#ff6a1a]" />
            </div>
          </div>
          <h1 className="font-rajdhani text-2xl font-bold text-[#f4f7fa] uppercase tracking-wider text-center mb-2">
            Uday Lcar Admin
          </h1>
          <p className="text-[#93a1ae] text-center mb-8 text-xs font-mono uppercase tracking-wider">
            Order Management &amp; Dispatch Console
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[#93a1ae] text-xs font-mono uppercase mb-2">
                Enter Admin Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl px-4 py-3 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors text-center tracking-widest font-mono text-lg"
                autoFocus
              />
            </div>
            {loginError && <p className="text-red-400 text-xs text-center">{loginError}</p>}
            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-wider uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_10px_25px_-8px_rgba(255,106,26,0.5)] transition-all hover:bg-[#ff803b]"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 text-center pt-5 border-t border-[#26333f]">
            <Link href="/" className="inline-flex items-center gap-2 text-[#93a1ae] hover:text-[#f4f7fa] text-xs uppercase font-mono tracking-wider transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] p-4 md:p-8 animate-in fade-in duration-300 text-[#f4f7fa]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-[#161f29] border border-[#26333f] rounded-2xl p-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 text-[#93a1ae] hover:text-[#f4f7fa] text-xs font-mono uppercase tracking-wider transition-colors bg-[#0b0f14] px-3 py-1.5 rounded-lg border border-[#26333f]">
              <ArrowLeft className="w-3.5 h-3.5" /> Store View
            </Link>
            <span className="hidden md:inline text-xs text-[#93a1ae]">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2fbf71] animate-pulse"></div>
              <span className="text-xs font-mono text-[#2fbf71]">System Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={loadOrders} 
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b0f14] border border-[#26333f] text-xs font-mono text-[#93a1ae] hover:text-[#ff6a1a] hover:border-[#ff6a1a] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ff6a1a]' : ''}`} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {actionSuccess && (
          <div className="p-3 bg-[#2fbf71]/15 border border-[#2fbf71]/40 rounded-xl text-xs font-mono text-[#2fbf71] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* HEADER & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.18em] uppercase text-[#ff6a1a] mb-1">
              <span className="w-3 h-[2px] bg-[#ff6a1a]"></span>
              Shopkeeper Console
            </div>
            <h1 className="font-rajdhani text-3xl font-bold uppercase tracking-wide flex items-center gap-2.5">
              <Package className="text-[#ff6a1a] w-7 h-7" />
              Order Management
            </h1>
            <p className="text-[#93a1ae] text-xs mt-0.5">
              Live orders from your website, WhatsApp, and Gmail notification flow
            </p>
          </div>
        </div>

        {/* METRIC STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#161f29] p-4 rounded-xl border border-[#26333f]">
            <span className="text-[#93a1ae] uppercase tracking-wider text-[0.65rem] font-mono block mb-1">Total Orders</span>
            <p className="text-2xl font-rajdhani font-bold text-[#f4f7fa]">{orders.length}</p>
          </div>
          <div className="bg-[#161f29] p-4 rounded-xl border border-[#ff9800]/30 bg-[#ff9800]/5">
            <span className="text-[#ff9800] uppercase tracking-wider text-[0.65rem] font-mono block mb-1">🟡 NEW</span>
            <p className="text-2xl font-rajdhani font-bold text-[#ff9800]">{orders.filter(o => o.status === 'NEW').length}</p>
          </div>
          <div className="bg-[#161f29] p-4 rounded-xl border border-[#2196f3]/30 bg-[#2196f3]/5">
            <span className="text-[#2196f3] uppercase tracking-wider text-[0.65rem] font-mono block mb-1">🔵 Confirmed</span>
            <p className="text-2xl font-rajdhani font-bold text-[#2196f3]">{orders.filter(o => o.status === 'CONFIRMED').length}</p>
          </div>
          <div className="bg-[#161f29] p-4 rounded-xl border border-[#9c27b0]/30 bg-[#9c27b0]/5">
            <span className="text-[#9c27b0] uppercase tracking-wider text-[0.65rem] font-mono block mb-1">🟣 Processing</span>
            <p className="text-2xl font-rajdhani font-bold text-[#9c27b0]">{orders.filter(o => o.status === 'PROCESSING').length}</p>
          </div>
          <div className="bg-[#161f29] p-4 rounded-xl border border-[#2fbf71]/30 bg-[#2fbf71]/5">
            <span className="text-[#2fbf71] uppercase tracking-wider text-[0.65rem] font-mono block mb-1">🟢 Completed</span>
            <p className="text-2xl font-rajdhani font-bold text-[#2fbf71]">{orders.filter(o => o.status === 'COMPLETED').length}</p>
          </div>
          <div className="bg-[#161f29] p-4 rounded-xl border border-[#26333f] col-span-2 sm:col-span-1">
            <span className="text-[#93a1ae] uppercase tracking-wider text-[0.65rem] font-mono block mb-1">Total Sales</span>
            <p className="text-xl font-rajdhani font-bold text-[#2fbf71]">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-[#161f29] border border-[#26333f] p-3 rounded-2xl">
          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'NEW', label: '🟡 New' },
              { id: 'CONFIRMED', label: '🔵 Confirmed' },
              { id: 'PROCESSING', label: '🟣 Processing' },
              { id: 'COMPLETED', label: '🟢 Completed' },
              { id: 'CANCELLED', label: '🔴 Cancelled' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${statusFilter === tab.id ? 'bg-[#ff6a1a] text-[#0b0f14] font-bold' : 'text-[#93a1ae] hover:text-[#f4f7fa] hover:bg-[#0b0f14]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a1ae]" />
            <input 
              type="text" 
              placeholder="Search by ID, name, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b0f14] border border-[#26333f] rounded-xl pl-9 pr-4 py-2 text-xs text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors font-mono"
            />
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="bg-[#161f29] border border-[#26333f] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26333f] bg-[#0e141b]">
                  <th className="p-3.5 text-[#93a1ae] font-semibold text-[0.72rem] uppercase tracking-wider">Order ID &amp; Date</th>
                  <th className="p-3.5 text-[#93a1ae] font-semibold text-[0.72rem] uppercase tracking-wider">Customer &amp; Phone</th>
                  <th className="p-3.5 text-[#93a1ae] font-semibold text-[0.72rem] uppercase tracking-wider">Product &amp; Qty</th>
                  <th className="p-3.5 text-[#93a1ae] font-semibold text-[0.72rem] uppercase tracking-wider">Amount</th>
                  <th className="p-3.5 text-[#93a1ae] font-semibold text-[0.72rem] uppercase tracking-wider">Status</th>
                  <th className="p-3.5 text-[#93a1ae] font-semibold text-[0.72rem] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26333f]/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-[#93a1ae] text-sm">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#ff6a1a]" />
                      <p className="font-semibold text-[#f4f7fa]">No orders matching your criteria</p>
                      <p className="text-xs text-[#93a1ae] mt-0.5">Try clearing filters or search terms</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-[#0b0f14]/50 transition-colors">
                      {/* ID & Date */}
                      <td className="p-3.5">
                        <span className="text-[#ff6a1a] font-mono font-bold text-xs">{order.id}</span>
                        <span className="block text-[0.68rem] text-[#93a1ae] font-mono mt-0.5">
                          {formatIndianDateTime(order.createdAt)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-3.5">
                        <p className="text-[#f4f7fa] font-semibold text-xs">{order.customerName}</p>
                        <a 
                          href={`tel:+91${order.customerPhone}`} 
                          className="text-[#2fbf71] font-mono text-[0.72rem] hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-2.5 h-2.5" /> +91 {order.customerPhone}
                        </a>
                      </td>

                      {/* Product */}
                      <td className="p-3.5">
                        <p className="text-[#f4f7fa] text-xs font-medium max-w-[200px] truncate">{order.productName}</p>
                        <p className="text-[#93a1ae] text-[0.68rem]">Qty: {order.quantity}</p>
                      </td>

                      {/* Amount */}
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-sm text-[#2fbf71]">
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[0.65rem] text-[#93a1ae] uppercase">{order.paymentMethod || 'COD'}</span>
                      </td>

                      {/* Status Selector */}
                      <td className="p-3.5">
                        <div className="relative inline-block w-36">
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                            className={`appearance-none w-full bg-[#0b0f14] border ${getStatusColor(order.status)} rounded-lg px-2.5 py-1 text-xs font-bold pr-6 cursor-pointer focus:outline-none`}
                          >
                            <option value="NEW">🟡 NEW</option>
                            <option value="CONFIRMED">🔵 CONFIRMED</option>
                            <option value="PROCESSING">🟣 PROCESSING</option>
                            <option value="COMPLETED">🟢 COMPLETED</option>
                            <option value="CANCELLED">🔴 CANCELLED</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        {/* Eye details */}
                        <button 
                          onClick={() => setSelectedOrder(order)} 
                          className="p-1.5 text-[#93a1ae] hover:text-[#2196f3] transition-colors rounded-lg hover:bg-[#2196f3]/10" 
                          title="View Full Customer &amp; Delivery Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Customer */}
                        <a 
                          href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(`Hi ${order.customerName}, this is Uday Lcar Shopkeeper regarding your Order #${order.id} for ${order.productName} (Total: Rs. ${order.total}). Status: ${order.status}.`)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#93a1ae] hover:text-[#25D366] transition-colors rounded-lg hover:bg-[#25D366]/10 inline-block"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Delete */}
                        <button 
                          onClick={() => handleDeleteOrder(order.id)} 
                          className="p-1.5 text-[#93a1ae] hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10" 
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080b0f]/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161f29] border border-[#26333f] rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#26333f] bg-[#111822] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#ff6a1a]" />
                <div>
                  <h3 className="font-rajdhani font-bold text-lg text-[#f4f7fa] uppercase tracking-wide">
                    Order Details <span className="font-mono text-[#ff6a1a]">#{selectedOrder.id}</span>
                  </h3>
                  <span className="text-[0.7rem] text-[#93a1ae] font-mono">
                    {formatIndianDateTime(selectedOrder.createdAt)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-1.5 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors rounded-lg hover:bg-[#26333f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Status Switcher Bar */}
              <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[0.68rem] text-[#93a1ae] uppercase font-mono tracking-wider block">Current Status</span>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#93a1ae]">Update:</span>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value as Order['status'])}
                    className="bg-[#161f29] border border-[#26333f] rounded-lg px-3 py-1.5 text-xs font-bold text-[#f4f7fa] focus:outline-none focus:border-[#ff6a1a]"
                  >
                    <option value="NEW">🟡 NEW</option>
                    <option value="CONFIRMED">🔵 CONFIRMED</option>
                    <option value="PROCESSING">🟣 PROCESSING</option>
                    <option value="COMPLETED">🟢 COMPLETED</option>
                    <option value="CANCELLED">🔴 CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Customer Information Box */}
              <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4 space-y-3">
                <h4 className="text-[#ff6a1a] uppercase tracking-wider text-[0.72rem] font-bold font-mono pb-2 border-b border-[#26333f] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer &amp; Delivery Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#93a1ae] block">Full Name</span>
                    <span className="text-[#f4f7fa] font-semibold text-sm">{selectedOrder.customerName}</span>
                  </div>

                  <div>
                    <span className="text-[#93a1ae] block">Mobile / Phone</span>
                    <a href={`tel:+91${selectedOrder.customerPhone}`} className="text-[#2fbf71] font-mono font-bold text-sm hover:underline">
                      +91 {selectedOrder.customerPhone}
                    </a>
                  </div>

                  {selectedOrder.customerEmail && (
                    <div>
                      <span className="text-[#93a1ae] block">Email</span>
                      <span className="text-[#f4f7fa] font-mono">{selectedOrder.customerEmail}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[#93a1ae] block">Payment Method</span>
                    <span className="text-[#f4f7fa] font-semibold">{selectedOrder.paymentMethod || 'COD'}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[#93a1ae] block mb-0.5">Delivery Address</span>
                    <p className="text-[#f4f7fa] font-medium bg-[#161f29] p-3 rounded-lg border border-[#26333f] whitespace-pre-wrap">
                      {selectedOrder.address}
                    </p>
                  </div>

                  {selectedOrder.message && (
                    <div className="sm:col-span-2">
                      <span className="text-[#93a1ae] block mb-0.5">Customer Message / Special Note</span>
                      <p className="text-[#ff9351] font-mono text-xs bg-[#161f29] p-3 rounded-lg border border-[#26333f]">
                        &ldquo;{selectedOrder.message}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product & Financials Box */}
              <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-4 space-y-3">
                <h4 className="text-[#ff6a1a] uppercase tracking-wider text-[0.72rem] font-bold font-mono pb-2 border-b border-[#26333f] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Order Summary
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#93a1ae]">Product:</span>
                    <span className="text-[#f4f7fa] font-bold">{selectedOrder.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#93a1ae]">Quantity:</span>
                    <span className="text-[#f4f7fa] font-mono font-semibold">{selectedOrder.quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#93a1ae]">Unit Price:</span>
                    <span className="text-[#f4f7fa] font-mono font-semibold">₹{(selectedOrder.unitPrice || (selectedOrder.total / selectedOrder.quantity)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#26333f] text-sm">
                    <span className="text-[#ff6a1a] font-bold uppercase">Total Order Value:</span>
                    <span className="font-mono font-bold text-[#2fbf71] text-lg">₹{(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Quick Customer Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a 
                  href={`https://wa.me/91${selectedOrder.customerPhone}?text=${encodeURIComponent(`Hi ${selectedOrder.customerName}, this is Uday Lcar Shopkeeper regarding your Order #${selectedOrder.id} (${selectedOrder.productName}). Total: Rs. ${selectedOrder.total}. Current status: ${selectedOrder.status}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 rounded-xl font-rajdhani font-bold text-xs uppercase bg-[#25D366] text-[#0b0f14] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Customer</span>
                </a>

                <a 
                  href={`tel:+91${selectedOrder.customerPhone}`}
                  className="py-3 rounded-xl font-rajdhani font-bold text-xs uppercase bg-[#ff6a1a] text-[#0b0f14] hover:bg-[#ff803b] transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
