import { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export default function Toast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleShowToast = (e: any) => {
      setMessage(e.detail.message);
      setShow(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShow(false);
      }, 3500);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => {
      window.removeEventListener('showToast', handleShowToast);
      clearTimeout(timeout);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-[#1c2733] border border-[#2fbf71] text-[#f4f7fa] px-4 py-3 rounded-xl shadow-[0_10px_30px_-6px_rgba(47,191,113,0.3)] animate-in slide-in-from-bottom-5">
      <CheckCircle2 className="w-5 h-5 text-[#2fbf71]" />
      <p className="font-medium text-[0.9rem] whitespace-nowrap">{message}</p>
      <button 
        onClick={() => setShow(false)} 
        className="ml-2 text-[#93a1ae] hover:text-[#f4f7fa] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
