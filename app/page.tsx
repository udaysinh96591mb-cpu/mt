'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  MessageCircle, ShoppingCart, ShieldCheck, Clock, MessageSquare, 
  Users, Phone, Mail, Menu, X, Package, Search, ArrowRight, CheckCircle2,
  Sparkles, Star, ChevronRight, Send, AlertCircle
} from 'lucide-react';
import OrderModal from '@/components/OrderModal';
import TrackOrderModal from '@/components/TrackOrderModal';
import Toast from '@/components/Toast';

const PHONE = "919106377300";
const EMAIL = "udaysinh96591.mb@gmail.com";
const SHOP_NAME = "Uday Lcar Shopkeeper";

function waLink(message: string) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

const defaultMsg = `Hi ${SHOP_NAME}, I'd like to know more about your products and parts availability.`;

const products = [
  {
    id: "p1",
    name: "LED Headlight Kit (H4/H7 Super Bright)",
    price: 2499,
    tag: "Lighting",
    desc: "Crystal white 6500K beam with instant response and long lifespan.",
    img: "/images/led_headlight_1786441501295.jpg"
  },
  {
    id: "p2",
    name: "Luxury Leatherette Seat Covers",
    price: 3899,
    tag: "Interior",
    desc: "Custom-fitted, breathable, and waterproof seat covers for maximum comfort.",
    img: "/images/seat_cover_1786441481598.jpg"
  },
  {
    id: "p3",
    name: "Premium Car Perfume & Air Freshener",
    price: 499,
    tag: "Accessories",
    desc: "Long-lasting luxury ambient fragrance designed specifically for car interiors.",
    img: "/images/car_perfume_1786441516522.jpg"
  },
  {
    id: "p4",
    name: "1080P Dual Dash Cam (Front + Rear)",
    price: 3499,
    tag: "Electronics",
    desc: "Wide-angle night vision recording with loop recording and G-sensor protection.",
    img: "/images/dash_cam_1786441547291.jpg"
  },
  {
    id: "p5",
    name: "Sporty Wheel Covers (Set of 4)",
    price: 1299,
    tag: "Exterior",
    desc: "Durable ABS finish with universal snap-on retention ring for secure fit.",
    img: "/images/wheel_cover_1786441532860.jpg"
  },
  {
    id: "p6",
    name: "All-Weather Waterproof Car Body Cover",
    price: 1699,
    tag: "Protection",
    desc: "Triple-layer dust, UV, and rain protective fabric with mirror pockets and buckle.",
    img: "/images/car_body_cover_1786441564589.jpg"
  },
  {
    id: "p7",
    name: "Ceramic High-Performance Brake Pads",
    price: 1499,
    tag: "Brakes",
    desc: "Low-dust ceramic compound for smooth, silent, and reliable braking.",
    img: "/images/brake_pads_1786708856114.jpg"
  },
  {
    id: "p8",
    name: "Synthetic Motor Oil (5W-30, 4L Can)",
    price: 2199,
    tag: "Engine",
    desc: "Advanced full synthetic formula for engine wear protection and thermal stability.",
    img: "/images/motor_oil_1786708868477.jpg"
  },
  {
    id: "p9",
    name: "Iridium Power Spark Plugs (Pack of 4)",
    price: 1899,
    tag: "Ignition",
    desc: "High-ignitability iridium fine wire electrode for improved throttle response.",
    img: "/images/spark_plugs_1786708878883.jpg"
  },
  {
    id: "p10",
    name: "Heavy Duty 12V Automotive Battery",
    price: 5499,
    tag: "Electrical",
    desc: "Maintenance-free high cranking amp battery backed with replacement warranty.",
    img: "/images/car_battery_1786708890531.jpg"
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
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  // Enquiry form state
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryAddress, setEnquiryAddress] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenOrder = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const handleTrackDirect = (id: string) => {
    setTrackOrderId(id);
    setTrackModalOpen(true);
  };

  const handleEnquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingEnquiry(true);
    setEnquiryStatus({ type: null, message: '' });

    const cleanPhone = enquiryPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setEnquiryStatus({ type: 'error', message: 'Please enter a valid 10-digit phone number.' });
      setIsSubmittingEnquiry(false);
      return;
    }

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryName,
          phone: cleanPhone,
          email: enquiryEmail,
          address: enquiryAddress,
          message: enquiryMessage
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEnquiryStatus({ type: 'success', message: 'Enquiry sent! We will call or WhatsApp you shortly.' });
        setEnquiryName('');
        setEnquiryPhone('');
        setEnquiryEmail('');
        setEnquiryAddress('');
        setEnquiryMessage('');
      } else {
        setEnquiryStatus({ type: 'error', message: result.message || 'Failed to send enquiry.' });
      }
    } catch (error) {
      setEnquiryStatus({ type: 'error', message: 'Network error. Please try sending via WhatsApp directly.' });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const handleWaEnquiry = () => {
    const name = enquiryName || 'there';
    const cleanPhone = enquiryPhone.replace(/\D/g, '').slice(-10) || 'N/A';
    const email = enquiryEmail || 'N/A';
    const address = enquiryAddress || 'N/A';
    const msg = enquiryMessage || 'I have a question about auto parts availability and price.';
    
    const text = `Hi ${SHOP_NAME},\nName: ${name}\nPhone: +91 ${cleanPhone}\nEmail: ${email}\nAddress: ${address}\n\nEnquiry:\n${msg}`;
    window.open(waLink(text), '_blank');
  };

  const tags = ['ALL', ...Array.from(new Set(products.map(p => p.tag)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || p.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#f4f7fa] selection:bg-[#ff6a1a] selection:text-[#0b0f14]">
      
      {/* ================= NAVBAR ================= */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-[#26333f]/70 ${scrolled ? 'bg-[#0b0f14]/92 backdrop-blur-lg shadow-lg' : 'bg-[#0b0f14]/80 backdrop-blur-md'}`}>
        <div className="flex items-center justify-between px-6 py-3 max-w-[1180px] mx-auto">
          
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="w-[40px] h-[40px] rounded-xl bg-gradient-to-br from-[#ff6a1a] to-[#ff9351] flex items-center justify-center font-rajdhani font-bold text-[#0b0f14] text-[1.15rem] shadow-[0_4px_16px_rgba(255,106,26,0.35)] group-hover:scale-105 transition-transform">
              UL
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-rajdhani font-bold text-[1.12rem] tracking-[0.03em] uppercase text-white">
                Uday Lcar <span className="text-[#ff6a1a]">Shopkeeper</span>
              </span>
              <span className="font-mono text-[0.62rem] text-[#93a1ae] tracking-[0.14em] uppercase mt-0.5">
                Auto Parts · Fast Delivery
              </span>
            </div>
          </a>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {['Home', 'Products', 'Why Us', 'Reviews', 'Contact'].map(item => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-[0.88rem] font-medium text-[#93a1ae] hover:text-[#f4f7fa] relative py-1 transition-colors group"
              >
                {item}
                <span className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-[#ff6a1a] transition-all duration-250 group-hover:w-full"></span>
              </a>
            ))}
            <a 
              href="/admin" 
              className="text-[0.86rem] font-semibold text-[#ff6a1a] hover:text-[#ff803b] bg-[#ff6a1a]/10 border border-[#ff6a1a]/30 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <span>Admin Console</span>
            </a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setTrackOrderId(''); setTrackModalOpen(true); }}
              className="hidden sm:flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#93a1ae] hover:text-[#ff6a1a] bg-[#161f29] border border-[#26333f] px-3 py-1.5 rounded-full transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-[#ff6a1a]" />
              <span>Track Order</span>
            </button>
            <a 
              href={waLink(defaultMsg)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hidden md:flex items-center gap-2 bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] px-4 py-2 rounded-full text-[0.84rem] font-semibold transition-all hover:border-[#2fbf71] hover:bg-[#152018] hover:text-[#2fbf71]"
            >
              <MessageCircle className="w-4 h-4 text-[#2fbf71]" />
              <span>WhatsApp Us</span>
            </a>
            <button 
              className="md:hidden p-2 text-[#93a1ae] hover:text-white" 
              onClick={() => setIsNavOpen(!isNavOpen)} 
              aria-label="Toggle menu"
            >
              {isNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Dropdown */}
        {isNavOpen && (
          <div className="md:hidden bg-[#0e141b] border-b border-[#26333f] px-6 py-5 flex flex-col gap-3 animate-in slide-in-from-top-2">
            {['Home', 'Products', 'Why Us', 'Reviews', 'Contact'].map(item => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-[0.92rem] font-medium text-[#93a1ae] hover:text-[#f4f7fa] py-1 border-b border-[#26333f]/40" 
                onClick={() => setIsNavOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <button 
                onClick={() => { setTrackOrderId(''); setTrackModalOpen(true); setIsNavOpen(false); }}
                className="flex items-center gap-2.5 bg-[#161f29] border border-[#26333f] text-[#f4f7fa] px-4 py-2.5 rounded-xl text-[0.88rem] font-semibold justify-center"
              >
                <Package className="w-4 h-4 text-[#ff6a1a]" />
                Track Live Order
              </button>
              <a 
                href="/admin" 
                className="flex items-center gap-2.5 bg-[#ff6a1a]/15 border border-[#ff6a1a]/40 text-[#ff6a1a] px-4 py-2.5 rounded-xl text-[0.88rem] font-semibold justify-center"
                onClick={() => setIsNavOpen(false)}
              >
                Admin Dashboard
              </a>
              <a 
                href={waLink(defaultMsg)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 bg-[#25D366] text-[#0b0f14] px-4 py-2.5 rounded-xl text-[0.88rem] font-bold justify-center"
              >
                <MessageCircle className="w-4 h-4 text-[#0b0f14]" />
                Chat on WhatsApp (+91 91063 77300)
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-end overflow-hidden" id="home">
        <motion.div 
          animate={{ scale: [1.05, 1] }} 
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://i.ibb.co/pjZYQGr2/Screenshot-19-4-2026-142232-www-bing-com.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080a0d]/65 via-[#080a0d]/45 to-[#080a0d]/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0d]/90 via-[#080a0d]/40 to-[#080a0d]/80" />
        
        <div className="relative z-10 w-full pt-[140px] pb-[80px] px-6 max-w-[1180px] mx-auto">
          <Eyebrow>Ahmedabad · Trusted Auto Parts Hub</Eyebrow>
          <h1 className="font-rajdhani font-bold text-[clamp(2.3rem,5.5vw,4.4rem)] leading-[1.08] max-w-[840px] mb-[18px] uppercase tracking-[0.02em]">
            Genuine Car Parts &amp; Accessories, <span className="text-[#ff6a1a]">Delivered Fast.</span>
          </h1>
          <p className="text-[clamp(0.98rem,1.5vw,1.2rem)] text-[#dfe6ec] max-w-[540px] mb-[32px] font-medium leading-relaxed">
            Fresh stock, transparent wholesale pricing, and instant shopkeeper dispatch. Order online with auto Gmail receipts &amp; direct WhatsApp confirmation.
          </p>
          <div className="flex gap-3.5 flex-wrap items-center">
            <a 
              href="#products" 
              className="inline-flex items-center gap-2.5 px-[28px] py-[15px] rounded-full font-rajdhani font-bold text-[0.95rem] tracking-[0.04em] uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_12px_28px_-8px_rgba(255,106,26,0.4)] transition-all hover:-translate-y-[2px] hover:shadow-[0_18px_36px_-10px_rgba(255,106,26,0.65)] hover:bg-[#ff803b]"
            >
              <ShoppingCart className="w-4 h-4" />
              Shop Catalog
            </a>
            <button 
              onClick={() => { setTrackOrderId(''); setTrackModalOpen(true); }}
              className="inline-flex items-center gap-2.5 px-[26px] py-[15px] rounded-full font-rajdhani font-bold text-[0.95rem] tracking-[0.04em] uppercase bg-[#161f29] text-[#f4f7fa] border border-[#26333f] transition-all hover:border-[#ff6a1a] hover:-translate-y-[2px]"
            >
              <Package className="w-4 h-4 text-[#ff6a1a]" />
              Track Order
            </button>
            <a 
              href={waLink(defaultMsg)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2.5 px-[26px] py-[15px] rounded-full font-rajdhani font-bold text-[0.95rem] tracking-[0.04em] uppercase bg-transparent text-[#f4f7fa] border border-white/30 transition-all hover:border-[#2fbf71] hover:-translate-y-[2px] hover:text-[#2fbf71]"
            >
              <MessageCircle className="w-4 h-4 text-[#2fbf71]" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0b0f14]/80 backdrop-blur-md">
          <div className="flex flex-wrap max-w-[1180px] mx-auto">
            {[
              { val: "1,200+", lbl: "Genuine Auto Parts" },
              { val: "4.9 ★", lbl: "Customer Satisfaction" },
              { val: "100%", lbl: "Direct Fit Guarantee" },
              { val: "< 15 Mins", lbl: "Order Processing" }
            ].map((stat, i) => (
              <div key={i} className="flex-1 min-w-[50%] md:min-w-0 p-4 md:px-6 md:py-4 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0">
                <b className="font-mono text-[#ff6a1a] text-[1.3rem] block leading-none">{stat.val}</b>
                <span className="text-[0.72rem] text-[#93a1ae] uppercase tracking-[0.08em] mt-1 block">{stat.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section id="products" className="py-[76px] md:py-[100px] bg-[#0f151c] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full">
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end mb-[40px]">
            <Reveal className="max-w-[620px]">
              <Eyebrow>Catalog &amp; Quick Order</Eyebrow>
              <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-3 uppercase tracking-[0.02em] leading-[1.1]">
                Pick A Part, Order in Seconds
              </h2>
              <p className="text-[#93a1ae] text-[0.98rem]">
                Select any item to fill your 10-digit phone and address. Your order triggers an automatic Gmail invoice and opens pre-filled WhatsApp confirmation.
              </p>
            </Reveal>
            
            <Reveal className="w-full md:w-auto">
              <div className="relative w-full md:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#93a1ae]" />
                <input 
                  type="text" 
                  placeholder="Search parts, tags, accessories..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161f29] border border-[#26333f] rounded-full py-3 pl-11 pr-5 text-sm text-[#f4f7fa] placeholder:text-[#425263] focus:outline-none focus:border-[#ff6a1a] transition-all"
                />
              </div>
            </Reveal>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${selectedTag === tag ? 'bg-[#ff6a1a] text-[#0b0f14]' : 'bg-[#161f29] text-[#93a1ae] border border-[#26333f] hover:text-[#f4f7fa]'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p, i) => (
              <Reveal key={p.id || i}>
                <div className="group relative bg-[#161f29] border border-[#26333f] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ff6a1a]/60 hover:shadow-[0_16px_40px_-15px_rgba(0,0,0,0.7)] flex flex-col h-full">
                  
                  {/* Image container */}
                  <div className="relative h-[210px] overflow-hidden bg-[#0a0e13]">
                    <span className="absolute top-3 left-3 bg-[#0b0f14]/85 backdrop-blur-md text-[#ff6a1a] font-mono text-[0.65rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full border border-[#ff6a1a]/40 z-10">
                      {p.tag}
                    </span>
                    <Image 
                      src={p.img} 
                      alt={p.name} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161f29] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-rajdhani font-bold text-[1.12rem] mb-1.5 uppercase leading-tight text-[#f4f7fa] group-hover:text-[#ff9351] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[#93a1ae] text-[0.84rem] mb-4 min-h-[38px] flex-1 leading-relaxed">
                      {p.desc}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-[#26333f]">
                      <div>
                        <span className="text-[0.65rem] text-[#93a1ae] uppercase tracking-wider block">Price</span>
                        <span className="font-mono font-bold text-[1.25rem] text-[#2fbf71]">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[0.7rem] text-[#93a1ae] uppercase bg-[#0b0f14] px-2.5 py-1 rounded-md border border-[#26333f]">
                        Cash on Delivery
                      </span>
                    </div>

                    <button 
                      onClick={() => handleOpenOrder(p)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ff6a1a] text-[#0b0f14] font-rajdhani font-bold text-[0.95rem] tracking-wider uppercase transition-all duration-200 hover:bg-[#ff803b] hover:shadow-[0_8px_20px_-6px_rgba(255,106,26,0.6)] active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Order Now</span>
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-[#161f29] rounded-2xl border border-[#26333f]">
              <Package className="w-12 h-12 text-[#ff6a1a] mx-auto mb-3 opacity-60" />
              <h3 className="font-rajdhani text-xl font-bold text-[#f4f7fa] uppercase">No matching auto parts</h3>
              <p className="text-[#93a1ae] text-sm mt-1">Try another search keyword or reach out on WhatsApp directly.</p>
              <a 
                href={waLink(defaultMsg)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-[#25D366] text-[#0b0f14] font-bold text-xs uppercase"
              >
                <MessageCircle className="w-4 h-4" />
                Ask Uday on WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ================= ABOUT / WHY CHOOSE US ================= */}
      <section id="why-us" className="py-[76px] md:py-[100px] bg-[#0b0f14] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[50px] items-center">
          <Reveal>
            <Eyebrow>About The Shopkeeper</Eyebrow>
            <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-4 uppercase tracking-[0.02em] leading-[1.1]">
              Run By Uday. Trusted By Local Garages &amp; Car Owners.
            </h2>
            <p className="text-[#93a1ae] mb-4 text-[0.96rem] leading-relaxed">
              <strong className="text-[#f4f7fa]">Uday Lcar Shopkeeper</strong> started with a single focus: providing genuine auto components without inflated dealership markups or counterfeit spares.
            </p>
            <p className="text-[#93a1ae] mb-6 text-[0.96rem] leading-relaxed">
              No middleman delays or automated phone trees. When you order here, an automatic invoice notification is sent to our shop via Gmail, and your delivery is dispatched straight to your doorstep.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a 
                href={waLink(defaultMsg)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-[26px] py-[13px] rounded-full font-rajdhani font-bold text-[0.92rem] tracking-wider uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_10px_25px_-8px_rgba(255,106,26,0.35)] transition-all hover:-translate-y-[2px] hover:bg-[#ff803b]"
              >
                Talk to Uday
              </a>
              <button 
                onClick={() => { setTrackOrderId(''); setTrackModalOpen(true); }}
                className="inline-flex items-center gap-2 px-[24px] py-[13px] rounded-full font-rajdhani font-bold text-[0.92rem] tracking-wider uppercase bg-[#161f29] text-[#f4f7fa] border border-[#26333f] hover:border-[#ff6a1a]"
              >
                <Package className="w-4 h-4 text-[#ff6a1a]" />
                Track Existing Order
              </button>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Genuine Parts Only", desc: "Every component is verified for fitment and manufacturer quality.", icon: <ShieldCheck className="w-5 h-5 text-[#ff6a1a]" /> },
              { title: "Rapid Dispatch", desc: "Orders packed and dispatched promptly across Ahmedabad.", icon: <Clock className="w-5 h-5 text-[#ff6a1a]" /> },
              { title: "Direct WhatsApp Support", desc: "Instant fitment check and model confirmation with Uday.", icon: <MessageSquare className="w-5 h-5 text-[#ff6a1a]" /> },
              { title: "1000+ Happy Customers", desc: "Preferred by mechanics, commercial drivers, and daily commuters.", icon: <Users className="w-5 h-5 text-[#ff6a1a]" /> }
            ].map((item, i) => (
              <Reveal key={i} className="bg-[#161f29] border border-[#26333f] rounded-2xl p-5 transition-all duration-300 hover:border-[#ff6a1a]/60 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-[#ff6a1a]/15 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h4 className="font-rajdhani font-bold text-[0.98rem] mb-1 uppercase tracking-wide text-[#f4f7fa]">{item.title}</h4>
                <p className="text-[0.82rem] text-[#93a1ae] leading-relaxed">{item.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section id="reviews" className="py-[76px] md:py-[100px] bg-[#0f151c] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <Reveal className="max-w-[620px] mb-[40px]">
            <Eyebrow>Customer Testimonials</Eyebrow>
            <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-3 uppercase tracking-[0.02em] leading-[1.1]">
              Verified Feedback From Drivers
            </h2>
            <p className="text-[#93a1ae] text-sm">Real reviews from customers who ordered through our portal and WhatsApp.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Ritesh Patel", loc: "SG Highway, Ahmedabad", quote: "Ordered LED headlight kit and seat covers. Uday confirmed my car model on WhatsApp within 10 minutes. Delivered next morning in great condition.", initial: "R" },
              { name: "Meera Shah", loc: "Naranpura, Ahmedabad", quote: "Honest advice on which dash cam is best for night driving. The price was significantly lower than local accessories shops.", initial: "M" },
              { name: "Kunal Trivedi", loc: "Bopal, Ahmedabad", quote: "Top quality brake pads and synthetic oil. Cash on delivery was super smooth. Definitely my go-to shopkeeper now.", initial: "K" }
            ].map((review, i) => (
              <Reveal key={i} className="bg-[#161f29] border border-[#26333f] rounded-2xl p-6 relative transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ff6a1a]/50 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-[#ff6a1a] text-sm mb-3">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-[#ff6a1a]" />
                    ))}
                  </div>
                  <p className="text-[#dbe2e8] text-[0.9rem] mb-5 italic leading-relaxed">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#26333f]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6a1a] to-[#ff9351] flex items-center justify-center font-rajdhani font-bold text-[0.95rem] text-[#0b0f14]">
                    {review.initial}
                  </div>
                  <div>
                    <b className="block text-[0.88rem] text-[#f4f7fa]">{review.name}</b>
                    <span className="text-[0.72rem] text-[#93a1ae] font-mono">{review.loc}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT & ENQUIRY ================= */}
      <section id="contact" className="py-[76px] md:py-[100px] bg-[#0b0f14] relative">
        <div className="max-w-[1180px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[40px]">
          
          {/* Shop Information Card */}
          <Reveal>
            <Eyebrow>Direct Contact</Eyebrow>
            <h2 className="font-rajdhani font-bold text-[clamp(1.9rem,3.4vw,2.6rem)] mb-5 uppercase tracking-[0.02em] leading-[1.1]">
              Order, Fitment Inquiry, Or Fast Quotes
            </h2>
            <div className="bg-[#161f29] border border-[#26333f] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#26333f]">
                <div className="w-10 h-10 rounded-xl bg-[#ff6a1a]/15 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#ff6a1a]" />
                </div>
                <div>
                  <span className="block text-[0.68rem] uppercase tracking-wider text-[#93a1ae] font-mono">Call / WhatsApp</span>
                  <a href="tel:+919106377300" className="font-semibold text-[0.95rem] text-[#f4f7fa] hover:text-[#ff6a1a] transition-colors">+91 91063 77300</a>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pb-4 border-b border-[#26333f]">
                <div className="w-10 h-10 rounded-xl bg-[#ff6a1a]/15 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#ff6a1a]" />
                </div>
                <div>
                  <span className="block text-[0.68rem] uppercase tracking-wider text-[#93a1ae] font-mono">Official Gmail</span>
                  <a href="mailto:udaysinh96591.mb@gmail.com" className="font-semibold text-[0.95rem] text-[#f4f7fa] hover:text-[#ff6a1a] transition-colors">udaysinh96591.mb@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-3.5 pb-4 border-b border-[#26333f]">
                <div className="w-10 h-10 rounded-xl bg-[#ff6a1a]/15 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#ff6a1a]" />
                </div>
                <div>
                  <span className="block text-[0.68rem] uppercase tracking-wider text-[#93a1ae] font-mono">Shop Working Hours</span>
                  <span className="font-semibold text-[0.92rem] text-[#f4f7fa]">Monday – Saturday, 9:00 AM – 9:00 PM</span>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href={waLink(defaultMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#25D366] text-[#0b0f14] font-rajdhani font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Chat (+91 91063 77300)</span>
                </a>
              </div>
            </div>
          </Reveal>

          {/* Customer Enquiry Form */}
          <Reveal>
            <form onSubmit={handleEnquirySubmit} className="bg-[#161f29] border border-[#26333f] rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-[#26333f]">
                <div className="font-mono text-[0.72rem] tracking-[0.18em] uppercase text-[#ff6a1a] font-bold">
                  Send Customer Enquiry
                </div>
                <span className="text-[0.68rem] text-[#93a1ae] font-mono">Direct to Gmail</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.72rem] uppercase tracking-wider text-[#93a1ae] font-semibold">Your Name *</label>
                  <input 
                    type="text" 
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder="e.g. Ritesh Patel" 
                    required 
                    className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-2.5 text-[#f4f7fa] text-sm focus:outline-none focus:border-[#ff6a1a] transition-colors" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.72rem] uppercase tracking-wider text-[#93a1ae] font-semibold">10-Digit Mobile *</label>
                  <input 
                    type="tel" 
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="e.g. 98765 43210" 
                    required 
                    className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-2.5 text-[#f4f7fa] text-sm focus:outline-none focus:border-[#ff6a1a] transition-colors font-mono" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-wider text-[#93a1ae] font-semibold">Your Email</label>
                <input 
                  type="email" 
                  value={enquiryEmail}
                  onChange={(e) => setEnquiryEmail(e.target.value)}
                  placeholder="e.g. you@gmail.com" 
                  className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-2.5 text-[#f4f7fa] text-sm focus:outline-none focus:border-[#ff6a1a] transition-colors" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-wider text-[#93a1ae] font-semibold">Delivery Address / Area</label>
                <input 
                  type="text" 
                  value={enquiryAddress}
                  onChange={(e) => setEnquiryAddress(e.target.value)}
                  placeholder="e.g. Science City Road, Ahmedabad" 
                  className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-2.5 text-[#f4f7fa] text-sm focus:outline-none focus:border-[#ff6a1a] transition-colors" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-wider text-[#93a1ae] font-semibold">What part or question do you have? *</label>
                <textarea 
                  value={enquiryMessage} 
                  onChange={(e) => setEnquiryMessage(e.target.value)} 
                  placeholder="Specify your car make, model year, or part details..." 
                  required 
                  rows={3}
                  className="bg-[#0b0f14] border border-[#26333f] rounded-xl p-2.5 text-[#f4f7fa] text-sm focus:outline-none focus:border-[#ff6a1a] transition-colors resize-none" 
                />
              </div>
              
              {enquiryStatus.message && (
                <div className={`text-xs p-3 rounded-xl flex items-start gap-2 ${enquiryStatus.type === 'success' ? 'bg-[#2fbf71]/15 text-[#2fbf71] border border-[#2fbf71]/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                  {enquiryStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{enquiryStatus.message}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button 
                  type="submit" 
                  disabled={isSubmittingEnquiry} 
                  className="flex-1 py-3 rounded-xl font-rajdhani font-bold text-[0.92rem] tracking-wider uppercase bg-[#ff6a1a] text-[#0b0f14] shadow-[0_10px_20px_-8px_rgba(255,106,26,0.4)] transition-all hover:bg-[#ff803b] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingEnquiry ? 'Sending...' : 'Send via Email'}</span>
                </button>

                <button 
                  type="button" 
                  onClick={handleWaEnquiry} 
                  className="py-3 px-5 rounded-xl font-rajdhani font-bold text-[0.92rem] tracking-wider uppercase bg-[#1c2733] border border-[#26333f] text-[#f4f7fa] transition-all hover:border-[#2fbf71] hover:text-[#2fbf71] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#2fbf71]" />
                  <span>WhatsApp Instead</span>
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0e141b] border-t border-[#26333f] pt-12 pb-6">
        <div className="max-w-[1180px] mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-8 mb-8">
            <div>
              <a href="#home" className="flex items-center gap-2.5 mb-3">
                <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-[#ff6a1a] to-[#ff9351] flex items-center justify-center font-rajdhani font-bold text-[#0b0f14] text-[1.1rem]">
                  UL
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-rajdhani font-bold text-[1.08rem] tracking-[0.03em] uppercase text-white">Uday Lcar Shopkeeper</span>
                  <span className="font-mono text-[0.62rem] text-[#93a1ae] tracking-[0.14em] uppercase mt-0.5">Genuine Auto Parts &amp; Accessories</span>
                </div>
              </a>
              <p className="text-[#93a1ae] text-[0.84rem] max-w-[300px] leading-relaxed">
                Wholesale prices, verified inventory, and direct shopkeeper communication on WhatsApp and Gmail.
              </p>
            </div>

            <div>
              <h5 className="font-rajdhani font-bold text-[0.8rem] tracking-[0.1em] uppercase text-[#ff6a1a] mb-3">Quick Navigation</h5>
              <ul className="flex flex-col gap-2 text-xs">
                {['Home', 'Products', 'Why Us', 'Reviews', 'Contact'].map(item => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-[#93a1ae] hover:text-[#ff6a1a] transition-colors">{item}</a>
                  </li>
                ))}
                <li>
                  <a href="/admin" className="text-[#ff6a1a] hover:underline font-semibold">Admin Dashboard (Password Protected)</a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-rajdhani font-bold text-[0.8rem] tracking-[0.1em] uppercase text-[#ff6a1a] mb-3">Contact Information</h5>
              <ul className="flex flex-col gap-2 text-xs text-[#93a1ae]">
                <li>Phone: <a href="tel:+919106377300" className="text-[#f4f7fa] hover:text-[#ff6a1a] font-mono">+91 91063 77300</a></li>
                <li>Email: <a href="mailto:udaysinh96591.mb@gmail.com" className="text-[#f4f7fa] hover:text-[#ff6a1a]">udaysinh96591.mb@gmail.com</a></li>
                <li>Location: Ahmedabad, Gujarat, India</li>
                <li>
                  <a href={waLink(defaultMsg)} target="_blank" rel="noopener noreferrer" className="text-[#2fbf71] font-semibold hover:underline">
                    Chat on WhatsApp →
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#26333f]/70 pt-5 flex flex-wrap justify-between gap-3 text-[0.75rem] text-[#93a1ae]">
            <span>© {new Date().getFullYear()} Uday Lcar Shopkeeper. All rights reserved.</span>
            <span>Automated order management via Nodemailer Gmail &amp; WhatsApp</span>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING WHATSAPP BUTTON ================= */}
      <a 
        href={waLink(defaultMsg)} 
        target="_blank" 
        rel="noopener noreferrer" 
        aria-label="Chat on WhatsApp" 
        className="fixed bottom-6 right-6 z-50 w-[58px] h-[58px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-transform"
      >
        <MessageCircle className="w-[30px] h-[30px] text-[#0b0f14]" />
      </a>
      
      {/* MODALS */}
      <OrderModal 
        isOpen={orderModalOpen} 
        onClose={() => setOrderModalOpen(false)} 
        product={selectedProduct} 
        onTrackOrder={handleTrackDirect}
      />
      
      <TrackOrderModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialOrderId={trackOrderId}
      />

      <Toast />
    </div>
  );
}
