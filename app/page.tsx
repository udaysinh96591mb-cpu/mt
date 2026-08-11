'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MessageCircle, ShoppingCart, ShieldCheck, Clock, MessageSquare, Users, Phone, Mail, Menu, X, Package, Search } from 'lucide-react';
import OrderModal from '@/components/OrderModal';
import TrackOrderModal from '@/components/TrackOrderModal';
import Toast from '@/components/Toast';

const PHONE = "919106377300";
const EMAIL = "udaysinh96591.mb@gmail.com";
const SHOP_NAME = "Uday Car Shopkeeper";

function waLink(message: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

const defaultMsg = `Hi ${SHOP_NAME}, I'd like to know more about your products.`;

const products = [
  {
    name: "10 Amp Blade Fuse",
    price: 10,
    tag: "Electrical",
    desc: "Standard 10A blade fuse for automotive electrical systems.",
    img: "https://picsum.photos/seed/fuse/400/300"
  },
  {
    name: "Premium Fabric Seat Cover Set",
    price: 2499,
    tag: "Interior",
    desc: "Water-resistant 5-seat cover set, custom-fit for most hatchbacks & sedans.",
    img: "/images/seat_cover_1786441481598.jpg"
  },
  {
    name: "LED Headlight Upgrade Kit",
    price: 3999,
    tag: "Lighting",
    desc: "Plug-and-play 6000K LED kit — brighter beam, lower power draw.",
    img: "/images/led_headlight_1786441501295.jpg"
  },
  {
    name: "Car Perfume Diffuser",
    price: 499,
    tag: "Accessory",
    desc: "Refillable dashboard diffuser, long-lasting fragrance, 3 scent options.",
    img: "/images/car_perfume_1786441516522.jpg"
  },
  {
    name: "Alloy Wheel Cover Set (4 pcs)",
    price: 1799,
    tag: "Exterior",
    desc: "Scratch-resistant ABS covers that snap onto most 14–15 inch rims.",
    img: "/images/wheel_cover_1786441532860.jpg"
  },
  {
    name: "Dash Cam Pro 1080p",
    price: 4499,
    tag: "Electronics",
    desc: "Loop recording, night vision and impact detection in one compact unit.",
    img: "/images/dash_cam_1786441547291.jpg"
  },
  {
    name: "Microfiber Car Body Cover",
    price: 1299,
    tag: "Protection",
    desc: "Dustproof, UV-resistant cover with elastic hem for a snug fit.",
    img: "/images/car_body_cover_1786441564589.jpg"
  }
];

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.18em] uppercase text-[#ff6a1a] mb-[14px]">
    <span className="w-[22px] h-[2px] bg-[#ff6a1a] inline-block"></span>
    {children}
  </div>
);

const Reveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [pastOrders, setPastOrders] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const saved = localStorage.getItem('uc_orders');
        if (saved) {
          setPastOrders(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load orders", e);
      }
    };
    
    loadOrders();
    window.addEventListener('orderHistoryUpdated', loadOrders);
    window.addEventListener('storage', loadOrders);
    return () => {
      window.removeEventListener('orderHistoryUpdated', loadOrders);
      window.removeEventListener('storage', loadOrders);
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [enquiryMessage, setEnquiryMessage] = useState("");

  const handleEnquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    const formData = new FormData(e.currentTarget);
    
    // Add Web3Forms access key
    formData.append("access_key", "4cce9ebe-d005-4e20-9a4c-083b7e57d085");
    formData.append("subject", `New Enquiry from ${formData.get('name')} — Uday Car Shopkeeper`);
    formData.append("from_name", "Uday Car Shopkeeper Website");
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({ type: 'success', message: 'Email sent successfully!' });
        (e.target as HTMLFormElement).reset();
      } else {
        setSubmitStatus({ type: 'error', message: result.message || 'Failed to send email.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaEnquiry = () => {
    const form = document.getElementById('enquiryForm') as HTMLFormElement;
    if (!form) return;
    const formData = new FormData(form);
    const name = formData.get('name') || 'there';
    const phone = formData.get('phone') || '';
    const email = formData.get('email') || '';
    const address = formData.get('address') || '';
    const msg = formData.get('message') || 'I have a question about your products.';
    
    const text = `Hi ${SHOP_NAME}, I'm ${name} (${phone}).\nEmail: ${email}\nDelivery Address: ${address}\n\n${msg}`;
    window.open(waLink(text), '_blank');
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b border-[#26333f] ${scrolled ? 'bg-[#0b0f14]/90 backdrop-blur-md' : 'bg-[#0b0f14]/75 backdrop-blur-md'}`}>
        <div className="flex items-center justify-between px-6 py-3.5 max-w-[1180px] mx-auto">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="w-[38px] h-[38px] rounded-lg bg-gradient-to-br from-[#ff6a1a] to-[#ff9351] flex items-center justify-center font-rajdhani font-bold text-[#0b0f14] text-[1.1rem] shadow-[0_6px_20px_-6px_#ff6a1a]">UC</div>
            <div className="flex flex-col leading-[1.1]">
              <span className="font-rajdhani font-bold text-[1.08rem] tracking-[0.03em] uppercase">Uday Car Shopkeeper</span>
              <span className="font-mono text-[0.62rem] text-[#93a1ae] tracking-[0.14em] uppercase">Genuine Auto Parts & Accessories</span>
            </div>
          </a>
          
          <nav className={`hidden md:flex gap-8`}>
            {['Home', 'Products', 'Why Us', 'Reviews', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[0.88rem] font-medium text-[#93a1ae] hover:text-[#f4f7fa] relative py-1 transition-colors duration-250 group">
                {item}
                <span className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-[#ff6a1a] transition-all duration-250 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setTrackOrderId(''); setTrackModalOpen(true); }}
              className="hidden md:flex items-center gap-2 text-[0.84rem] font-medium text-[#93a1ae] hover:text-[#ff6a1a] transition-colors"
            >
              <Package className="w-4 h-4" />
              Track Order
            </button>
            <a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2.5 bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] px-4 py-2 rounded-full text-[0.84rem] font-semibold transition-all duration-250 hover:border-[#2fbf71] hover:bg-[#152018] hover:-translate-y-[1px]">
              <MessageCircle className="w-4 h-4 text-[#2fbf71]" />
              <span>WhatsApp Us</span>
            </a>
            <button className="md:hidden p-2" onClick={() => setIsNavOpen(!isNavOpen)} aria-label="Toggle menu">
              {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        {isNavOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0b0f14] border-b border-[#26333f] flex flex-col p-6 gap-4 md:hidden">
            {['Home', 'Products', 'Why Us', 'Reviews', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[0.88rem] font-medium text-[#93a1ae] hover:text-[#f4f7fa]" onClick={() => setIsNavOpen(false)}>
                {item}
              </a>
            ))}
            <button 
              onClick={() => { setTrackOrderId(''); setTrackModalOpen(true); setIsNavOpen(false); }}
              className="flex items-center gap-2.5 bg-transparent border border-[#26333f] text-[#f4f7fa] px-4 py-3 rounded-full text-[0.84rem] font-semibold mt-2 justify-center"
            >
              <Package className="w-4 h-4 text-[#ff6a1a]" />
              Track Order
            </button>
            <a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] px-4 py-3 rounded-full text-[0.84rem] font-semibold mt-2 justify-center">
              <MessageCircle className="w-4 h-4 text-[#2fbf71]" />
              WhatsApp Us
            </a>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-end overflow-hidden" id="home">
        <motion.div 
          animate={{ scale: [1.08, 1] }} 
          transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://i.ibb.co/pjZYQGr2/Screenshot-19-4-2026-142232-www-bing-com.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080a0d]/55 via-[#080a0d]/35 to-[#080a0d]/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0d]/85 via-[#080a0d]/25 to-[#080a0d]/75" />
        
        <div className="relative z-10 w-full pt-[160px] pb-[96px] px-6 max-w-[1180px] mx-auto md:pt-40 md:pb-24">
          <Eyebrow>Ahmedabad · Trusted Since Day One</Eyebrow>
          <h1 className="font-rajdhani font-bold text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.1] max-w-[820px] mb-[18px] uppercase tracking-[0.02em]">
            Genuine Car Parts, <span className="text-[#ff6a1a]">Delivered On Your Terms.</span>
          </h1>
          <p className="text-[clamp(1rem,1.6vw,1.25rem)] text-[#dfe6ec] max-w-[520px] mb-[36px] font-medium">
            Fresh stock, fair prices, and a shopkeeper who picks up the phone. Order any part on WhatsApp — no queues, no back office delays.
          </p>
          <div className="flex gap-4 flex-wrap items-center">
            <a href="#products" className="inline-flex items-center gap-2.5 px-[30px] py-[16px] rounded-full font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_14px_30px_-10px_rgba(255,106,26,0.25)] transition-all duration-250 hover:-translate-y-[3px] hover:shadow-[0_20px_40px_-12px_rgba(255,106,26,0.55)]">
              Shop Now
            </a>
            <a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-[30px] py-[16px] rounded-full font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-transparent text-[#f4f7fa] border-[1.5px] border-white/35 transition-all duration-250 hover:border-white hover:-translate-y-[3px] hover:bg-white/5">
              Chat on WhatsApp
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/15">
          <div className="flex flex-wrap max-w-[1180px] mx-auto">
            {[
              { val: "1200+", lbl: "Parts In Stock" },
              { val: "4.9★", lbl: "Customer Rating" },
              { val: "<2 Hrs", lbl: "WhatsApp Response" },
              { val: "100%", lbl: "Genuine Guarantee" }
            ].map((stat, i) => (
              <div key={i} className="flex-1 min-w-[50%] md:min-w-0 p-5 md:px-6 md:py-5 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0">
                <b className="font-mono text-[#ff6a1a] text-[1.4rem] block">{stat.val}</b>
                <span className="text-[0.76rem] text-[#93a1ae] uppercase tracking-[0.08em]">{stat.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <div className="relative h-[64px] bg-[#0f151c] mt-[-1px] [clip-path:polygon(0_100%,100%_0,100%_100%,0%_100%)]" />

      {/* ================= ORDER HISTORY ================= */}
      {pastOrders.length > 0 && (
        <section className="py-12 bg-[#0b0f14] border-b border-[#26333f]">
          <div className="max-w-[1180px] mx-auto px-6 w-full">
            <Reveal>
              <Eyebrow>Your Account</Eyebrow>
              <h2 className="font-rajdhani font-bold text-2xl md:text-3xl mb-6 uppercase tracking-[0.02em]">Recent Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastOrders.slice(0, 3).map((order: any, idx: number) => (
                  <div key={idx} className="bg-[#161f29] border border-[#26333f] rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#93a1ae] uppercase tracking-widest">{order.date}</span>
                          <span className={`text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            order.status === 'Shipped' ? 'bg-[#2fbf71]/20 text-[#2fbf71]' :
                            order.status === 'Packed' ? 'bg-[#3b82f6]/20 text-[#3b82f6]' :
                            'bg-[#ff6a1a]/20 text-[#ff6a1a]'
                          }`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <h4 className="text-[#f4f7fa] font-bold text-lg leading-tight mt-1">{order.productName}</h4>
                      </div>
                      <div className="bg-[#ff6a1a]/10 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-[#ff6a1a]" />
                      </div>
                    </div>
                    <div className="text-sm text-[#93a1ae] mb-4">
                      Order ID: <span className="text-[#f4f7fa]">{order.id}</span><br />
                      Quantity: <span className="text-[#f4f7fa]">{order.quantity}</span>
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#26333f] flex items-center justify-between">
                      <span className="font-rajdhani font-bold text-lg text-[#2fbf71]">₹{order.total.toLocaleString('en-IN')}</span>
                      <button 
                        onClick={() => { setTrackOrderId(order.id); setTrackModalOpen(true); }}
                        className="text-xs font-semibold uppercase tracking-wider text-[#ff6a1a] hover:text-[#ff803b]"
                      >
                        Track Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ================= PRODUCTS ================= */}
      <section id="products" className="py-[76px] md:py-[110px] bg-[#0f151c] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end mb-[56px]">
            <Reveal className="max-w-[640px]">
              <Eyebrow>Catalog</Eyebrow>
              <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-4 uppercase tracking-[0.02em] leading-[1.1]">Pick a Part, Order in Seconds</h2>
              <p className="text-[#93a1ae] text-[1.02rem]">Every card sends your order straight to WhatsApp with the product and price already filled in — just hit send.</p>
            </Reveal>
            
            <Reveal className="w-full md:w-auto">
              <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#93a1ae]" />
                <input 
                  type="text" 
                  placeholder="Search by name or category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161f29] border border-[#26333f] rounded-full py-3.5 pl-12 pr-6 text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] focus:ring-1 focus:ring-[#ff6a1a]/50 transition-all duration-300"
                />
              </div>
            </Reveal>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[26px]">
            {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tag.toLowerCase().includes(searchQuery.toLowerCase())).map((p, i) => (
              <Reveal key={i}>
                <div className="group relative bg-[#161f29] border border-[#26333f] rounded-2xl overflow-hidden transition-all duration-350 hover:-translate-y-2 hover:border-[#3a4956] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] isolate flex flex-col h-full">
                  <div className="relative h-[190px] overflow-hidden bg-[#0e141b]">
                    <span className="absolute top-3 left-3 bg-[#0b0f14]/75 backdrop-blur-md text-[#ff6a1a] font-mono text-[0.65rem] tracking-[0.1em] uppercase px-2.5 py-1.5 rounded-full border border-[#ff6a1a]/40 z-10">{p.tag}</span>
                    <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                    <div className="absolute top-0 left-[-60%] w-[40%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[18deg] transition-all duration-700 ease-out group-hover:left-[130%]" />
                  </div>
                  <div className="p-5 md:p-[20px_22px_24px] flex flex-col flex-1">
                    <h3 className="font-rajdhani font-bold text-[1.15rem] mb-1.5 tracking-[0.01em] uppercase leading-[1.1]">{p.name}</h3>
                    <p className="text-[#93a1ae] text-[0.9rem] mb-4 min-h-[42px] flex-1">{p.desc}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-bold text-[1.25rem] text-[#f4f7fa]">
                        ₹{p.price.toLocaleString('en-IN')}
                        <small className="text-[#93a1ae] font-medium text-[0.7rem] uppercase tracking-[0.06em] ml-1.5">MRP</small>
                      </span>
                    </div>
                    <button 
                      onClick={() => { 
                        setSelectedProduct(p);
                        setOrderModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-[10px] bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] font-semibold text-[0.9rem] transition-all duration-250 hover:bg-[#ff6a1a] hover:border-[#ff6a1a] hover:text-[#0b0f14] hover:-translate-y-0.5"
                    >
                      <ShoppingCart className="w-[18px] h-[18px]" />
                      Quick Order
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT / WHY CHOOSE US ================= */}
      <section id="why-us" className="py-[76px] md:py-[110px] bg-[#0b0f14] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[60px] items-start">
          <Reveal>
            <Eyebrow>About The Shop</Eyebrow>
            <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-5 uppercase tracking-[0.02em] leading-[1.1]">Run By Uday. Trusted By The Neighbourhood.</h2>
            <p className="text-[#93a1ae] mb-[18px] text-[1.02rem]">
              Uday Car Shopkeeper started as a small counter stocking genuine spares for the local garages nearby &mdash; today it&apos;s the first call people make before they touch their car.
            </p>
            <p className="text-[#93a1ae] mb-[18px] text-[1.02rem]">
              No middlemen, no guesswork on fitment, and no waiting on hold. Message the part you need, get a straight price, and pick it up or have it delivered.
            </p>
            <a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-[30px] py-[16px] rounded-full font-rajdhani font-bold text-[1rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_14px_30px_-10px_rgba(255,106,26,0.25)] transition-all duration-250 hover:-translate-y-[3px] hover:shadow-[0_20px_40px_-12px_rgba(255,106,26,0.55)] mt-2">
              Talk to Uday
            </a>
          </Reveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px]">
            {[
              { title: "Genuine Parts Only", desc: "Every item is sourced and checked before it reaches the shelf.", icon: <ShieldCheck className="w-[22px] h-[22px] text-[#ff6a1a]" /> },
              { title: "Fast Turnaround", desc: "Most orders confirmed and packed within the hour.", icon: <Clock className="w-[22px] h-[22px] text-[#ff6a1a]" /> },
              { title: "Real-Time Replies", desc: "Ask about fitment or stock and get an honest answer, fast.", icon: <MessageSquare className="w-[22px] h-[22px] text-[#ff6a1a]" /> },
              { title: "1000+ Happy Customers", desc: "Word of mouth is still our biggest source of new orders.", icon: <Users className="w-[22px] h-[22px] text-[#ff6a1a]" /> }
            ].map((item, i) => (
              <Reveal key={i} className="bg-[#161f29] border border-[#26333f] rounded-2xl p-6 transition-all duration-300 hover:border-[#ff6a1a] hover:-translate-y-1">
                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#ff6a1a]/15 flex items-center justify-center mb-[14px]">
                  {item.icon}
                </div>
                <h4 className="font-rajdhani font-bold text-[0.98rem] mb-1.5 uppercase tracking-[0.01em] leading-[1.1]">{item.title}</h4>
                <p className="text-[0.85rem] text-[#93a1ae]">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section id="reviews" className="py-[76px] md:py-[110px] bg-[#0f151c] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <Reveal className="max-w-[640px] mb-[56px]">
            <Eyebrow>Customer Reviews</Eyebrow>
            <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-4 uppercase tracking-[0.02em] leading-[1.1]">What People Say After Ordering</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Ritesh Patel", loc: "Ahmedabad", quote: "Ordered a headlight kit on WhatsApp at night, picked it up the next morning. Straightforward and no hassle.", initial: "R" },
              { name: "Meera Shah", loc: "Naranpura", quote: "Uday bhai checks the part fits your car model before you even pay. That kind of honesty is rare now.", initial: "M" },
              { name: "Kunal Trivedi", loc: "Bopal", quote: "Prices are clearly marked and matched exactly what I paid — no surprise add-ons at the counter.", initial: "K" }
            ].map((review, i) => (
              <Reveal key={i} className="bg-[#161f29] border border-[#26333f] rounded-2xl p-[28px_26px] relative transition-all duration-300 hover:-translate-y-[6px] hover:border-[#3a4956]">
                <div className="text-[#ff6a1a] text-[0.95rem] tracking-[2px] mb-[14px]">★★★★★</div>
                <p className="text-[#dbe2e8] text-[0.95rem] mb-5">{review.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#26c6ff] to-[#0b0f14] flex items-center justify-center font-rajdhani font-bold text-[0.9rem] text-white">
                    {review.initial}
                  </div>
                  <div>
                    <b className="block text-[0.88rem]">{review.name}</b>
                    <span className="text-[0.74rem] text-[#93a1ae]">{review.loc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="py-[76px] md:py-[110px] bg-[#0b0f14] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[50px]">
          <Reveal>
            <Eyebrow>Get In Touch</Eyebrow>
            <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-6 uppercase tracking-[0.02em] leading-[1.1]">Order, Ask, Or Just Say Hello</h2>
            <div className="bg-[#161f29] border border-[#26333f] rounded-2xl p-8">
              <div className="flex items-center gap-3.5 py-3.5 border-b border-[#26333f]">
                <div className="w-10 h-10 rounded-[10px] bg-[#1c2733] flex items-center justify-center shrink-0">
                  <Phone className="w-[19px] h-[19px] text-[#ff6a1a]" />
                </div>
                <div>
                  <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-[#93a1ae] mb-0.5">Call / WhatsApp</span>
                  <a href="tel:+919106377300" className="font-semibold text-[0.95rem]">+91 91063 77300</a>
                </div>
              </div>
              <div className="flex items-center gap-3.5 py-3.5 border-b border-[#26333f]">
                <div className="w-10 h-10 rounded-[10px] bg-[#1c2733] flex items-center justify-center shrink-0">
                  <Mail className="w-[19px] h-[19px] text-[#ff6a1a]" />
                </div>
                <div>
                  <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-[#93a1ae] mb-0.5">Email</span>
                  <a href="mailto:udaysinh96591.mb@gmail.com" className="font-semibold text-[0.95rem]">udaysinh96591.mb@gmail.com</a>
                </div>
              </div>
              <div className="flex items-center gap-3.5 py-3.5">
                <div className="w-10 h-10 rounded-[10px] bg-[#1c2733] flex items-center justify-center shrink-0">
                  <Clock className="w-[19px] h-[19px] text-[#ff6a1a]" />
                </div>
                <div>
                  <span className="block text-[0.7rem] uppercase tracking-[0.1em] text-[#93a1ae] mb-0.5">Shop Hours</span>
                  <span className="font-semibold text-[0.95rem]">Mon – Sat, 9:30 AM – 8:30 PM</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <form id="enquiryForm" onSubmit={handleEnquiry} className="bg-[#161f29] border border-[#26333f] rounded-2xl p-8 flex flex-col gap-4">
              <div className="font-mono text-[0.72rem] tracking-[0.18em] uppercase text-[#ff6a1a] mb-0.5">Send An Enquiry</div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fName" className="text-[0.76rem] uppercase tracking-[0.08em] text-[#93a1ae]">Your Name</label>
                <input type="text" id="fName" name="name" placeholder="e.g. Ritesh Patel" required className="bg-[#0f151c] border border-[#26333f] rounded-[10px] p-[13px_14px] text-[#f4f7fa] font-sans text-[0.92rem] transition-colors focus:outline-none focus:border-[#ff6a1a]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fPhone" className="text-[0.76rem] uppercase tracking-[0.08em] text-[#93a1ae]">Phone Number</label>
                <input type="tel" id="fPhone" name="phone" placeholder="e.g. 98765 43210" required className="bg-[#0f151c] border border-[#26333f] rounded-[10px] p-[13px_14px] text-[#f4f7fa] font-sans text-[0.92rem] transition-colors focus:outline-none focus:border-[#ff6a1a]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fEmail" className="text-[0.76rem] uppercase tracking-[0.08em] text-[#93a1ae]">Your Email</label>
                <input type="email" id="fEmail" name="email" placeholder="e.g. you@gmail.com" required className="bg-[#0f151c] border border-[#26333f] rounded-[10px] p-[13px_14px] text-[#f4f7fa] font-sans text-[0.92rem] transition-colors focus:outline-none focus:border-[#ff6a1a]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fAddress" className="text-[0.76rem] uppercase tracking-[0.08em] text-[#93a1ae]">Delivery Address</label>
                <textarea id="fAddress" name="address" placeholder="House no., street, area, city, pincode" required className="bg-[#0f151c] border border-[#26333f] rounded-[10px] p-[13px_14px] text-[#f4f7fa] font-sans text-[0.92rem] transition-colors focus:outline-none focus:border-[#ff6a1a] resize-y min-h-[70px]"></textarea>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fMsg" className="text-[0.76rem] uppercase tracking-[0.08em] text-[#93a1ae]">What do you need?</label>
                <textarea id="fMsg" name="message" value={enquiryMessage} onChange={(e) => setEnquiryMessage(e.target.value)} placeholder="Tell us the part, model, or question..." required className="bg-[#0f151c] border border-[#26333f] rounded-[10px] p-[13px_14px] text-[#f4f7fa] font-sans text-[0.92rem] transition-colors focus:outline-none focus:border-[#ff6a1a] resize-y min-h-[100px]"></textarea>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-1.5 items-center">
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-full font-rajdhani font-bold text-[0.88rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_14px_30px_-10px_rgba(255,106,26,0.25)] transition-all duration-250 hover:-translate-y-[2px] hover:shadow-[0_20px_40px_-12px_rgba(255,106,26,0.55)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  {isSubmitting ? 'Sending...' : 'Send via Email'}
                </button>
                <button type="button" onClick={handleWaEnquiry} className="inline-flex items-center gap-2.5 px-[22px] py-[13px] rounded-full font-rajdhani font-bold text-[0.88rem] tracking-[0.04em] uppercase bg-transparent text-[#f4f7fa] border-[1.5px] border-white/35 transition-all duration-250 hover:border-white hover:-translate-y-[2px] hover:bg-white/5">
                  Send on WhatsApp Instead
                </button>
              </div>
              {submitStatus.message && (
                <div className={`text-[0.88rem] font-medium p-3 rounded-lg ${submitStatus.type === 'success' ? 'bg-[#2fbf71]/10 text-[#2fbf71] border border-[#2fbf71]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {submitStatus.message}
                </div>
              )}
              <p className="text-[0.78rem] text-[#93a1ae]">This form sends a direct email to our shop. We&apos;ll get back to you shortly.</p>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0f151c] border-t border-[#26333f] pt-14 pb-6">
        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-10">
            <div>
              <a href="#home" className="flex items-center gap-2.5 mb-3.5">
                <div className="w-[38px] h-[38px] rounded-lg bg-gradient-to-br from-[#ff6a1a] to-[#ff9351] flex items-center justify-center font-rajdhani font-bold text-[#0b0f14] text-[1.1rem] shadow-[0_6px_20px_-6px_#ff6a1a]">UC</div>
                <div className="flex flex-col leading-[1.1]">
                  <span className="font-rajdhani font-bold text-[1.08rem] tracking-[0.03em] uppercase text-white">Uday Car Shopkeeper</span>
                  <span className="font-mono text-[0.62rem] text-[#93a1ae] tracking-[0.14em] uppercase">Genuine Auto Parts & Accessories</span>
                </div>
              </a>
              <p className="text-[#93a1ae] text-[0.88rem] max-w-[280px]">Fresh finds, fair prices, and a shopkeeper who answers on WhatsApp &mdash; that&apos;s the whole promise.</p>
            </div>
            <div>
              <h5 className="font-rajdhani font-bold text-[0.8rem] tracking-[0.1em] uppercase text-[#93a1ae] mb-4">Explore</h5>
              <ul className="flex flex-col gap-2.5">
                {['Home', 'Products', 'Why Us', 'Reviews'].map(item => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[0.9rem] text-[#c9d2da] hover:text-[#ff6a1a] transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-rajdhani font-bold text-[0.8rem] tracking-[0.1em] uppercase text-[#93a1ae] mb-4">Contact</h5>
              <ul className="flex flex-col gap-2.5">
                <li><a href="tel:+919106377300" className="text-[0.9rem] text-[#c9d2da] hover:text-[#ff6a1a] transition-colors">+91 91063 77300</a></li>
                <li><a href="mailto:udaysinh96591.mb@gmail.com" className="text-[0.9rem] text-[#c9d2da] hover:text-[#ff6a1a] transition-colors">udaysinh96591.mb@gmail.com</a></li>
                <li><a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" className="text-[0.9rem] text-[#c9d2da] hover:text-[#ff6a1a] transition-colors">Chat on WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#26333f] pt-[22px] flex flex-wrap justify-between gap-3 text-[0.8rem] text-[#93a1ae]">
            <span>© {new Date().getFullYear()} Uday Car Shopkeeper. All rights reserved.</span>
            <span>Built with care, one order at a time.</span>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING WHATSAPP BUTTON ================= */}
      <a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-6 right-6 z-50 w-[60px] h-[60px] rounded-full bg-[#2fbf71] flex items-center justify-center shadow-[0_10px_30px_-6px_rgba(47,191,113,0.6)] animate-[pulseWa_2.4s_ease-in-out_infinite]">
        <MessageCircle className="w-[30px] h-[30px] text-[#0b0f14]" />
      </a>
      
      <OrderModal 
        isOpen={orderModalOpen} 
        onClose={() => setOrderModalOpen(false)} 
        product={selectedProduct} 
      />
      
      <TrackOrderModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialOrderId={trackOrderId}
      />
      <Toast />
    </>
  );
}
