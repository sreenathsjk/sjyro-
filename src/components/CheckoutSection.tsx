/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, CreditCard, Landmark, Truck, Info, CornerDownRight, Smartphone, Gift, MapPin, ArrowLeft, MessageSquare } from 'lucide-react';
import { CartItem, Order } from '../types';
import { formatPrice } from '../lib/currency';

interface CheckoutSectionProps {
  cart: CartItem[];
  user: { fullName: string; email: string } | null;
  onOrderCompleted: (order: Order) => void;
  setView: (view: string) => void;
}

export default function CheckoutSection({
  cart,
  user,
  onOrderCompleted,
  setView
}: CheckoutSectionProps) {
  // Input form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayStatus, setRazorpayStatus] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 150 ? 0 : 15;
  const gst = parseFloat((subtotal * 0.12).toFixed(2));
  const grandTotal = parseFloat((subtotal + shipping + gst).toFixed(2));

  const handleProceedWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !addressLine || !city || !state || !zipCode) {
      alert('Please fill out all address fields before proceeding.');
      return;
    }

    setRazorpayOpen(true);
    setRazorpayStatus('Compiling luxury order details...');

    setTimeout(() => {
      setRazorpayStatus('Registering secure order in database stage...');
    }, 1000);

    setTimeout(() => {
      handleFinalizeOrder();
    }, 2000);
  };

  const handleFinalizeOrder = async () => {
    setRazorpayStatus('Generating WhatsApp instant dispatcher invoice...');
    
    const generatedId = `SJYRO-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderPayload: Order = {
      id: '', // Will be assigned by backend
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      gst,
      shipping,
      discount: 0,
      total: grandTotal,
      shippingAddress: {
        fullName,
        email,
        phone,
        addressLine,
        city,
        state,
        zipCode,
        country
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Processing'
    };

    const whatsappNumber = "919491219300";
    
    let message = `*✨ NEW SJYRO LUXURY ORDER ✨*\n`;
    message += `-----------------------------\n`;
    message += `*Date:* ${new Date().toLocaleDateString()}\n\n`;
    
    message += `*👤 CUSTOMER DETAILS:*\n`;
    message += `• *Name:* ${fullName}\n`;
    message += `• *Email:* ${email}\n`;
    message += `• *Phone:* ${phone}\n\n`;
    
    message += `*📍 SHIPPING DESTINATION:*\n`;
    message += `• *Address:* ${addressLine}\n`;
    message += `• *City:* ${city}\n`;
    message += `• *State:* ${state}\n`;
    message += `• *Postal Code:* ${zipCode}\n`;
    message += `• *Country:* ${country}\n\n`;
    
    message += `*📦 WARDROBE ITEMS:*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   Size: ${item.selectedSize} | Qty: ${item.quantity} | Price: ${formatPrice(item.product.price)}\n`;
    });
    message += `\n`;
    
    message += `*💰 BILLING SUMMARY:*\n`;
    message += `• *Subtotal:* ${formatPrice(subtotal)}\n`;
    message += `• *GST (12%):* ${formatPrice(gst)}\n`;
    message += `• *Cargo Delivery:* ${shipping === 0 ? 'FREE' : formatPrice(shipping)}\n`;
    message += `• *Grand Total:* *${formatPrice(grandTotal)} INR*\n`;
    message += `-----------------------------\n`;
    message += `*Please confirm this order and provide bank/payment details.*`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        const completedOrder = await response.json();
        const finalMessage = message.replace(`*Date:*`, `*Order ID:* #${completedOrder.id || generatedId}\n*Date:*`);
        const finalUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(finalMessage)}`;
        
        setRazorpayStatus('Success! Opening WhatsApp dispatch desk...');
        setTimeout(() => {
          window.open(finalUrl, '_blank');
          setRazorpayOpen(false);
          onOrderCompleted(completedOrder);
        }, 1500);
      } else {
        throw new Error('Failed to post order to server');
      }
    } catch (err) {
      console.error('Failed to register order on backend:', err);
      const fallbackMessage = message.replace(`*Date:*`, `*Order ID:* #${generatedId}\n*Date:*`);
      const finalUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(fallbackMessage)}`;
      setRazorpayStatus('Redirecting directly to WhatsApp concierge...');
      setTimeout(() => {
        window.open(finalUrl, '_blank');
        setRazorpayOpen(false);
        onOrderCompleted({
          ...orderPayload,
          id: generatedId,
          trackingNumber: 'SY-382902-IN'
        });
      }, 1500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
      {/* Editorial Title */}
      <div className="border-b border-black/[0.04] pb-6 mb-10 flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">
            SECURE CHECKOUT STAGE
          </span>
          <h2 className="font-serif-lux font-bold text-2xl sm:text-3xl text-black">
            WARDROBE SHIPMENT
          </h2>
        </div>
        <button 
          onClick={() => setView('shop')}
          className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-button-lux font-bold text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* LEFT COLUMN: Input Forms */}
        <form onSubmit={handleProceedWhatsAppOrder} className="w-full lg:w-2/3 flex flex-col gap-8">
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-white p-6 border border-black/5 rounded-sm">
            <h3 className="font-serif-lux font-semibold text-lg text-black mb-6 flex items-center gap-2 border-b pb-2">
              <MapPin className="w-4 h-4 text-luxury-accent" /> 1. Shipping Destination
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">FULL NAME</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-sans"
                  placeholder="e.g. Satoshi Nakamoto"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-sans"
                  placeholder="satoshi@bitcoin.org"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">PHONE NUMBER</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-mono"
                  placeholder="+1 (555) 019-2831"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">STREET ADDRESS</label>
                <input 
                  type="text" 
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-sans"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">CITY</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-sans"
                  placeholder="Los Angeles"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">STATE / PROVINCE</label>
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-sans"
                  placeholder="California"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">ZIP / POSTAL CODE</label>
                <input 
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-mono"
                  placeholder="90210"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">COUNTRY</label>
                <select 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-black/10 rounded-sm p-3 text-xs bg-white focus:outline-none focus:border-black font-sans"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Japan">Japan</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="India">India</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. WHATSAPP ORDER DISPATCH */}
          <div className="bg-white p-6 border border-black/5 rounded-sm">
            <h3 className="font-serif-lux font-semibold text-lg text-black mb-4 flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="w-4 h-4 text-luxury-accent" /> 2. WhatsApp Order Dispatch
            </h3>
            <div className="bg-neutral-50 p-5 border border-black/[0.03] rounded-sm flex flex-col gap-4">
              <p className="text-xs text-black/70 leading-relaxed font-sans">
                To complete your luxury wardrobe order, we have replaced standard payment processors with a direct <strong>VIP WhatsApp Order Desk</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 border border-black/[0.03] rounded-sm">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0 border border-green-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif-lux font-bold text-xs text-black">Direct Dispatch Line: +91 94912 19300</h4>
                  <p className="text-[10px] text-black/50 font-sans leading-tight mt-1">Our concierge team will immediately review your shipping options and payment guidelines.</p>
                </div>
              </div>
              <p className="text-[10px] text-black/40 font-mono leading-relaxed">
                Clicking the confirmation button below registers your order in our database. You will be redirected to WhatsApp to send the compiled details directly to our dispatch desk.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[11px] font-button-lux font-bold uppercase py-4 tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
          >
            CONFIRM & PLACE ORDER VIA WHATSAPP ({formatPrice(grandTotal)})
          </button>
        </form>

        {/* RIGHT COLUMN: Order Summary Box */}
        <div className="w-full lg:w-1/3 bg-white p-6 border border-black/5 rounded-sm sticky top-28">
          <h3 className="font-serif-lux font-semibold text-lg text-black mb-6 border-b pb-2">
            Bag Summary
          </h3>

          <div className="divide-y divide-black/[0.04] mb-6">
            {cart.map((item, i) => (
              <div key={i} className="py-4 flex gap-3.5 items-start">
                <div className="w-12 aspect-[3/4] bg-neutral-50 border border-black/[0.03] flex-shrink-0 overflow-hidden">
                  <img src={item.product.images[0]} alt="checkout-summary" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-serif-lux text-xs font-semibold truncate text-black leading-tight">{item.product.name}</h4>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-black/40 mt-1 font-button-lux">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                </div>
                <span className="font-numbers-lux text-sm font-bold text-black">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Pricing calculations details */}
          <div className="flex flex-col gap-3 text-xs text-black/50 border-t border-black/[0.04] pt-4 mb-6">
            <div className="flex justify-between">
              <span>Wardrobe Items Subtotal</span>
              <span className="font-numbers-lux text-black font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (12% flat tax compliance)</span>
              <span className="font-numbers-lux text-black">{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cargo Shipping Delivery</span>
              <span className="font-numbers-lux text-black">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-black/[0.04] pt-3 text-black text-sm font-extrabold">
              <span className="font-serif-lux uppercase tracking-wider">Grand Total (INR)</span>
              <span className="font-numbers-lux text-base">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 border border-black/[0.02] text-[10px] text-black/40 font-mono flex flex-col gap-2.5">
            <div className="flex gap-2 items-start">
              <ShieldCheck className="w-4 h-4 text-luxury-accent flex-shrink-0" />
              <span>Checkout processes instantly using direct-to-admin WhatsApp encryption.</span>
            </div>
            <div className="flex gap-2 items-start">
              <Truck className="w-4 h-4 text-luxury-accent flex-shrink-0" />
              <span>Orders dispatched next-day with real-time Shiprocket tracking metrics.</span>
            </div>
          </div>
        </div>
      </div>

      {/* WHATSAPP SECURE DISPATCH MODAL POPUP */}
      <AnimatePresence>
        {razorpayOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-zinc-950 text-white max-w-md w-full p-8 shadow-2xl relative z-10 border border-white/10 rounded-sm text-center flex flex-col items-center"
            >
              {/* WhatsApp/Desk Brand Icon */}
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl border border-emerald-400">
                <MessageSquare className="w-7 h-7 text-white animate-pulse" />
              </div>

              <h3 className="font-serif-lux font-semibold text-xl text-white mb-2 tracking-wide uppercase">SJYRO WhatsApp Concierge</h3>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-6">RECIPIENT: +91 94912 19300</p>

              {/* Secure loading progress spinner */}
              <div className="relative mb-8 w-16 h-16">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin" />
              </div>

              <div className="bg-zinc-900 border border-white/5 p-4 rounded-sm w-full font-mono text-[11px] leading-relaxed text-zinc-300 text-left">
                <div className="flex justify-between text-zinc-500 border-b border-white/5 pb-2 mb-2">
                  <span>Merchant Desk:</span>
                  <span className="font-bold text-white uppercase tracking-wider">SJYRO PRESTIGE CO.</span>
                </div>
                <div className="flex justify-between text-zinc-500 mb-1">
                  <span>Client Name:</span>
                  <span className="text-white truncate max-w-[150px] uppercase">{fullName || 'Prestige Client'}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Cart Valuation:</span>
                  <span className="font-bold text-emerald-400">{formatPrice(grandTotal)} INR</span>
                </div>
              </div>

              {/* Current processing state */}
              <p className="text-xs text-zinc-400 font-sans italic mt-6 animate-pulse px-4">
                {razorpayStatus}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
