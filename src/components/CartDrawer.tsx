/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, Ticket, Gift, Truck, ChevronRight, HelpCircle } from 'lucide-react';
import { CartItem, Product } from '../types';
import { mockCoupons } from '../db/mockData';
import { formatPrice } from '../lib/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (productId: string, size: string, color: string, newQty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onProceedCheckout: () => void;
  allProducts: Product[];
  onQuickView: (product: Product) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
  allProducts,
  onQuickView
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Subtotal calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const giftWrapFee = giftWrap ? 10 : 0;
  
  // Dynamic coupon discount
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discount > 0 && appliedCoupon.discount < 100 
        ? parseFloat(((subtotal * appliedCoupon.discount) / 100).toFixed(2)) 
        : appliedCoupon.discount)
    : 0;

  // Shipping logic: free above $150
  const shippingFee = subtotal >= 150 || subtotal === 0 ? 0 : 15;
  
  // Indian Apparel GST Standard: 12% under $120, 18% over. Let's charge 12% flat for extreme luxury compliance!
  const gstAmount = parseFloat(((subtotal - discountAmount) * 0.12).toFixed(2));
  
  const totalAmount = parseFloat((subtotal - discountAmount + shippingFee + gstAmount + giftWrapFee).toFixed(2));

  // AI cross-sell fetching powered by our Express-Gemini endpoint or client fallbacks
  useEffect(() => {
    if (cart.length > 0 && isOpen) {
      setLoadingAI(true);
      fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemIds: cart.map(item => item.product.id) })
      })
      .then(res => res.json())
      .then(data => {
        if (data.productIds) {
          const recs = allProducts.filter(p => data.productIds.includes(p.id));
          setAiRecommendations(recs);
        } else {
          // Client fallback
          const cartIds = cart.map(i => i.product.id);
          const fallbacks = allProducts.filter(p => !cartIds.includes(p.id)).slice(0, 2);
          setAiRecommendations(fallbacks);
        }
      })
      .catch(() => {
        const cartIds = cart.map(i => i.product.id);
        const fallbacks = allProducts.filter(p => !cartIds.includes(p.id)).slice(0, 2);
        setAiRecommendations(fallbacks);
      })
      .finally(() => setLoadingAI(false));
    } else {
      // Default trending recommendation
      setAiRecommendations(allProducts.slice(0, 2));
    }
  }, [cart, isOpen, allProducts]);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.toUpperCase().trim();
    const found = mockCoupons.find(c => c.code === code);
    
    if (!found) {
      setCouponError('Invalid coupon code. Try LEGACY10.');
      return;
    }

    if (found.minSubtotal && subtotal < found.minSubtotal) {
      setCouponError(`Min purchase of ${formatPrice(found.minSubtotal)} required for this coupon.`);
      return;
    }

    setAppliedCoupon({
      code: found.code,
      discount: found.value
    });
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark overlay backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-black" />
                <span className="font-serif-lux font-bold text-lg tracking-wider uppercase text-black">LEGACY BAG</span>
                <span className="font-mono text-xs text-black/40 font-bold">({cart.length})</span>
              </div>
              <button 
                onClick={onClose}
                className="text-black hover:text-luxury-accent p-1 transition-transform hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Stage */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {/* Shipping Progress Meter */}
              {cart.length > 0 && (
                <div className="bg-white p-4 border border-black/[0.03] rounded-sm">
                  {subtotal >= 150 ? (
                    <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest font-button-lux">
                      <Truck className="w-4 h-4 animate-bounce" /> Compliment shipping unlocked!
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-black/70 uppercase tracking-widest font-button-lux mb-2">
                        <span>Add {formatPrice(150 - subtotal)} more for free shipping</span>
                        <span className="text-black/40">Goal: {formatPrice(150)}</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-black h-full rounded-full transition-all duration-500" 
                          style={{ width: `${(subtotal / 150) * 100}%` }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cart.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 bg-white rounded-full border flex items-center justify-center mb-4">
                    <ShoppingBag className="w-6 h-6 text-black/30" />
                  </div>
                  <h3 className="font-serif-lux font-medium text-lg mb-2">Your Bag Is Clean</h3>
                  <p className="text-xs text-black/40 max-w-xs leading-relaxed mb-6 font-sans">
                    You haven’t added any legacy pieces to your wardrobe yet. Explore our premier catalog to begin.
                  </p>
                  <button 
                    onClick={() => { onClose(); }}
                    className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-bold uppercase py-3 px-8 font-button-lux transition-colors duration-300"
                  >
                    DISCOVER APPAREL
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {cart.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-4 pb-5 border-b border-black/[0.04] items-start"
                    >
                      {/* Product Thumbnail */}
                      <div 
                        onClick={() => { onClose(); onQuickView(item.product); }}
                        className="w-20 aspect-[3/4] bg-neutral-50 border border-black/5 flex-shrink-0 overflow-hidden cursor-pointer rounded-sm"
                      >
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <h4 
                          onClick={() => { onClose(); onQuickView(item.product); }}
                          className="font-serif-lux text-sm font-semibold hover:text-luxury-accent cursor-pointer transition-colors leading-tight"
                        >
                          {item.product.name}
                        </h4>
                        
                        <div className="flex gap-3 text-[9px] uppercase tracking-wider font-bold text-black/40 mt-1 font-button-lux">
                          <span>Size: <strong className="text-black">{item.selectedSize}</strong></span>
                          <span>Color: <strong className="text-black">{item.selectedColor}</strong></span>
                        </div>

                        {/* Quantity controls and delete button */}
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-black/10 rounded-sm bg-white">
                            <button 
                              onClick={() => onUpdateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                              className="p-1 px-2.5 text-black hover:text-luxury-accent transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-bold px-2">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQty(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                              className="p-1 px-2.5 text-black hover:text-luxury-accent transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button 
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                            className="text-black/30 hover:text-red-600 p-1.5 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Price metadata */}
                      <div className="text-right">
                        <span className="font-numbers-lux text-black text-sm font-bold block">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="font-mono text-[9px] text-black/40">
                            {formatPrice(item.product.price)} each
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DYNAMIC RECOMMENDATIONS COMPONENT */}
              {cart.length > 0 && aiRecommendations.length > 0 && (
                <div className="border-t border-black/[0.04] pt-6 mt-2">
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="bg-luxury-accent w-1 h-3 rounded-sm" />
                    <h4 className="font-button-lux text-[10px] font-extrabold tracking-widest uppercase text-black/80 flex items-center gap-1">
                      Complete The Look <span className="text-[8px] font-mono font-normal text-luxury-accent uppercase">AI Suggested</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {aiRecommendations.map(rec => (
                      <div 
                        key={rec.id}
                        onClick={() => { onClose(); onQuickView(rec); }}
                        className="bg-white p-2 border border-black/[0.02] flex gap-2.5 items-center cursor-pointer hover:bg-neutral-50 transition-all rounded-sm group"
                      >
                        <div className="w-10 aspect-[3/4] bg-neutral-100 flex-shrink-0 overflow-hidden">
                          <img src={rec.images[0]} alt="recs" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="font-serif-lux text-[10px] font-semibold truncate text-black leading-tight group-hover:text-luxury-accent">{rec.name}</h5>
                          <span className="font-numbers-lux text-[11px] font-bold block mt-0.5 text-black/80">{formatPrice(rec.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subtotal & Summary checkout anchor */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-black/5 p-6 flex flex-col gap-3.5">
                {/* Gift wrapping toggler */}
                <div className="flex justify-between items-center border-b border-black/[0.04] pb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="accent-black rounded-sm"
                    />
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-black/70 font-button-lux">
                      <Gift className="w-3.5 h-3.5 text-luxury-accent" /> Premium Gift Wrapping (+{formatPrice(10)})
                    </div>
                  </label>
                  <span className="text-[10px] font-mono text-black/40">Includes signature matte box</span>
                </div>

                {/* Coupon Input code */}
                <div className="flex flex-col gap-1.5 pb-2">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
                      <input 
                        type="text"
                        placeholder="ENTER COUPON (e.g. LEGACY10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-sm py-2 pl-8 pr-3 text-[10px] font-mono tracking-widest focus:outline-none focus:border-black uppercase"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[9px] font-bold font-button-lux px-4 tracking-widest uppercase transition-colors"
                    >
                      APPLY
                    </button>
                  </div>
                  {couponError && <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider">{couponError}</p>}
                  
                  {appliedCoupon && (
                    <div className="bg-green-50 text-green-800 p-2 flex justify-between items-center text-[10px] font-bold tracking-wider rounded-sm border border-green-100">
                      <span>PROMO "{appliedCoupon.code}" APPLIED ({appliedCoupon.discount}% OFF)</span>
                      <button onClick={handleRemoveCoupon} className="text-green-800 hover:text-red-600 font-bold ml-2 font-mono">REMOVE</button>
                    </div>
                  )}
                </div>

                {/* Calculations summary breakdown */}
                <div className="flex flex-col gap-2.5 text-xs text-black/60 border-b border-black/[0.04] pb-4">
                  <div className="flex justify-between items-center">
                    <span>Bag Subtotal</span>
                    <span className="font-numbers-lux text-black font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-700 font-semibold">
                      <span>Promo Discount</span>
                      <span className="font-numbers-lux">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>GST (12% flat tax compliance)</span>
                    <span className="font-numbers-lux text-black">{formatPrice(gstAmount)}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between items-center">
                      <span>Luxury Packaging Fee</span>
                      <span className="font-numbers-lux text-black">{formatPrice(10)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Shipping Estimate</span>
                    <span className="font-numbers-lux text-black">
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-black font-extrabold text-base mb-1">
                  <span className="font-serif-lux tracking-wider uppercase">Grand Total (INR)</span>
                  <span className="font-numbers-lux text-lg">{formatPrice(totalAmount)}</span>
                </div>

                {/* Direct Checkout Action CTA */}
                <button 
                  onClick={() => { onClose(); onProceedCheckout(); }}
                  className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[11px] font-button-lux font-bold uppercase py-4 tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
                >
                  PROCEED TO SECURE CHECKOUT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
