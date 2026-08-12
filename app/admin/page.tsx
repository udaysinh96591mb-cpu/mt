'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Trash2, Edit, ChevronDown, CheckCircle, ArrowLeft, Lock, LogOut, Eye, X, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    // Check auth status on mount
    if (localStorage.getItem('uc_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
    
    loadOrders();
    const handleUpdate = () => loadOrders();
    window.addEventListener('orderHistoryUpdated', handleUpdate);
    return () => window.removeEventListener('orderHistoryUpdated', handleUpdate);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Using a simple hardcoded PIN for prototype
    if (password === 'uday123' || password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('uc_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('uc_admin_auth');
    setPassword('');
  };

  const loadOrders = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('uc_orders') || '[]');
      setOrders(stored);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = (id: string, newStatus: string) => {
    try {
      const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
      localStorage.setItem('uc_orders', JSON.stringify(updated));
      setOrders(updated);
      window.dispatchEvent(new Event('orderHistoryUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrder = (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const updated = orders.filter(o => o.id !== id);
      localStorage.setItem('uc_orders', JSON.stringify(updated));
      setOrders(updated);
      window.dispatchEvent(new Event('orderHistoryUpdated'));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0f14] p-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#161f29] border border-[#26333f] rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="bg-[#ff6a1a]/10 p-4 rounded-full">
              <Lock className="w-8 h-8 text-[#ff6a1a]" />
            </div>
          </div>
          <h1 className="font-rajdhani text-2xl font-bold text-[#f4f7fa] uppercase tracking-wider text-center mb-2">Admin Dashboard</h1>
          <p className="text-[#93a1ae] text-center mb-8 text-sm">Please enter the admin password to continue.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#0b0f14] border border-[#26333f] rounded-lg px-4 py-3 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors text-center tracking-widest"
                autoFocus
              />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button 
              type="submit"
              className="w-full py-3.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] transition-all hover:bg-[#ff803b]"
            >
              Unlock Access
            </button>
          </form>
          <div className="mt-8 text-center pt-6 border-t border-[#26333f]">
            <Link href="/" className="inline-flex items-center gap-2 text-[#93a1ae] hover:text-[#f4f7fa] text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] p-4 md:p-8 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 text-[#93a1ae] hover:text-red-400 transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-rajdhani text-3xl font-bold text-[#f4f7fa] uppercase tracking-wider flex items-center gap-3">
              <Package className="text-[#ff6a1a]" />
              Admin Dashboard
            </h1>
            <p className="text-[#93a1ae] mt-1">Manage all your orders</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a1ae]" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161f29] border border-[#26333f] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#161f29] p-6 rounded-2xl border border-[#26333f]">
            <h3 className="text-[#93a1ae] uppercase tracking-wider text-xs font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-rajdhani font-bold text-[#f4f7fa]">{orders.length}</p>
          </div>
          <div className="bg-[#161f29] p-6 rounded-2xl border border-[#26333f]">
            <h3 className="text-[#93a1ae] uppercase tracking-wider text-xs font-semibold mb-2">Pending</h3>
            <p className="text-3xl font-rajdhani font-bold text-[#ff9800]">{orders.filter(o => o.status === 'Pending').length}</p>
          </div>
          <div className="bg-[#161f29] p-6 rounded-2xl border border-[#26333f]">
            <h3 className="text-[#93a1ae] uppercase tracking-wider text-xs font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-rajdhani font-bold text-[#2fbf71]">₹{orders.reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-[#161f29] border border-[#26333f] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26333f] bg-[#0b0f14]/50">
                  <th className="p-4 text-[#93a1ae] font-semibold text-xs uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-[#93a1ae] font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-[#93a1ae] font-semibold text-xs uppercase tracking-wider">Product</th>
                  <th className="p-4 text-[#93a1ae] font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-[#93a1ae] font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[#93a1ae] font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#93a1ae]">No orders found</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-[#26333f]/50 hover:bg-[#0b0f14]/30 transition-colors">
                      <td className="p-4">
                        <span className="text-[#f4f7fa] font-mono text-sm">{order.id}</span>
                        <span className="block text-xs text-[#93a1ae] mt-1">{order.date}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-[#f4f7fa] font-medium">{order.customerName || 'N/A'}</p>
                        <p className="text-[#93a1ae] text-xs">{order.customerPhone || 'N/A'}</p>
                        <p className="text-[#93a1ae] text-xs truncate max-w-[150px]">{order.address || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-[#f4f7fa]">{order.productName}</p>
                        <p className="text-[#93a1ae] text-xs">Qty: {order.quantity}</p>
                      </td>
                      <td className="p-4 font-rajdhani font-bold text-[#f4f7fa]">
                        ₹{(order.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <div className="relative inline-block w-full">
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`appearance-none w-full bg-transparent border ${
                              order.status === 'Pending' ? 'border-[#ff9800] text-[#ff9800]' : 
                              order.status === 'Confirmed' ? 'border-[#2196f3] text-[#2196f3]' : 
                              order.status === 'Shipped' ? 'border-[#9c27b0] text-[#9c27b0]' : 
                              order.status === 'Delivered' ? 'border-[#2fbf71] text-[#2fbf71]' : 
                              'border-red-500 text-red-500'
                            } rounded-lg px-3 py-1.5 text-xs font-semibold pr-8 cursor-pointer focus:outline-none`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                        </div>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 text-[#93a1ae] hover:text-[#2196f3] transition-colors rounded-lg hover:bg-[#2196f3]/10 mr-1" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteOrder(order.id)} className="p-2 text-[#93a1ae] hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10" title="Delete Order">
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0f14]/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#161f29] border border-[#26333f] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#26333f] sticky top-0 bg-[#161f29] z-10">
              <h3 className="font-rajdhani font-bold text-xl text-[#f4f7fa] uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5 text-[#ff6a1a]" />
                Order Details <span className="text-[#93a1ae] ml-2 text-base">({selectedOrder.id})</span>
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors rounded-full hover:bg-[#26333f]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Details */}
              <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-5">
                <h4 className="text-[#93a1ae] uppercase tracking-wider text-xs font-semibold mb-4 border-b border-[#26333f] pb-2">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#ff6a1a] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#93a1ae] mb-0.5">Full Name</p>
                      <p className="text-[#f4f7fa] font-medium">{selectedOrder.customerName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#ff6a1a] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#93a1ae] mb-0.5">Phone Number</p>
                      <p className="text-[#f4f7fa] font-medium">{selectedOrder.customerPhone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-[#ff6a1a] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#93a1ae] mb-0.5">Delivery Address</p>
                      <p className="text-[#f4f7fa] font-medium whitespace-pre-wrap">{selectedOrder.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-5">
                <h4 className="text-[#93a1ae] uppercase tracking-wider text-xs font-semibold mb-4 border-b border-[#26333f] pb-2">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 md:col-span-2">
                    <Package className="w-5 h-5 text-[#2fbf71] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#93a1ae] mb-0.5">Product</p>
                      <p className="text-[#f4f7fa] font-medium">{selectedOrder.productName} (Qty: {selectedOrder.quantity})</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#2fbf71] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#93a1ae] mb-0.5">Date Ordered</p>
                      <p className="text-[#f4f7fa] font-medium">{selectedOrder.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-[#2fbf71] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#93a1ae] mb-0.5">Payment Method</p>
                      <p className="text-[#f4f7fa] font-medium">{selectedOrder.paymentMethod || 'COD'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#26333f] flex justify-between items-center">
                  <span className="text-[#93a1ae] uppercase tracking-wider text-sm font-semibold">Total Amount</span>
                  <span className="font-rajdhani font-bold text-2xl text-[#2fbf71]">₹{(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-xl font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-[#26333f] text-[#f4f7fa] transition-all hover:bg-[#324352]"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
