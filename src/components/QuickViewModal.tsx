/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Heart, Share2, Ruler, Truck, ShieldCheck, ShoppingBag, Check, Play, HelpCircle, RotateCcw, Maximize2 } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  allProducts?: Product[];
  onEnter360Studio?: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  allProducts = [],
  onEnter360Studio
}: QuickViewModalProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'care' | 'reviews'>('details');
  const [viewMode, setViewMode] = useState<'gallery' | '360' | 'video'>('gallery');
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  
  // Complete the Look AI states
  const [completeLookProducts, setCompleteLookProducts] = useState<Product[]>([]);
  const [loadingLook, setLoadingLook] = useState(false);

  useEffect(() => {
    async function fetchCompleteTheLook() {
      if (!allProducts || allProducts.length === 0) return;
      setLoadingLook(true);
      try {
        const response = await fetch('/api/ai/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemIds: [product.id] })
        });
        const data = await response.json();
        if (data && Array.isArray(data.productIds)) {
          const matched = allProducts.filter(p => data.productIds.includes(p.id) && p.id !== product.id);
          setCompleteLookProducts(matched.slice(0, 2));
        } else {
          const fallback = allProducts.filter(p => p.id !== product.id).slice(0, 2);
          setCompleteLookProducts(fallback);
        }
      } catch (err) {
        console.error("Failed to load Complete the Look recommendation:", err);
        const fallback = allProducts.filter(p => p.id !== product.id).slice(0, 2);
        setCompleteLookProducts(fallback);
      } finally {
        setLoadingLook(false);
      }
    }
    fetchCompleteTheLook();
  }, [product.id, allProducts]);
  
  // 360 degree state simulation
  const [angleIndex, setAngleIndex] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Simulated 360-degree angle frames (using Unsplash model photos representing rotation angles)
  const angleImages = [
    product.images[0],
    product.images[1] || product.images[0],
    product.images[2] || product.images[0],
    product.images[1] || product.images[0],
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center',
    });
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor.name);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // 360 drag simulation handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX.current;
    if (Math.abs(deltaX) > 15) {
      const step = deltaX > 0 ? -1 : 1;
      setAngleIndex((prev) => (prev + step + angleImages.length) % angleImages.length);
      dragStartX.current = clientX;
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white w-full max-w-5xl shadow-2xl rounded-sm z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 border border-black/5 hover:border-black/20 text-black hover:scale-105 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Visual Media (Gallery / 360 / Video) */}
        <div className="w-full md:w-1/2 bg-[#F6F6F6] flex flex-col justify-between p-4 md:p-6 border-r border-black/[0.03]">
          {/* Main Stage */}
          <div className="relative flex-grow flex items-center justify-center min-h-[300px] md:min-h-[400px] bg-white border border-black/5 overflow-hidden">
            {viewMode === 'gallery' && (
              <div 
                className="relative w-full h-full cursor-zoom-in overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={zoomStyle}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {viewMode === '360' && (
              <div 
                className="w-full h-full flex flex-col items-center justify-center p-6 cursor-grab active:cursor-grabbing select-none relative"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {(product.id === 'sjyro-h01' || product.id === 'sjyro-h02' || product.id === 'sjyro-t01') && onEnter360Studio && (
                  <button 
                    onClick={() => {
                      onClose();
                      onEnter360Studio(product);
                    }}
                    className="absolute top-4 left-4 z-20 bg-black/90 hover:bg-luxury-accent hover:text-black border border-white/10 text-white text-[9px] tracking-widest font-mono font-bold uppercase py-2 px-3 flex items-center gap-1.5 transition-all shadow-md rounded-sm"
                  >
                    <Maximize2 className="w-3 h-3 text-luxury-accent" /> 360° Studio
                  </button>
                )}
                <img 
                  src={angleImages[angleIndex]} 
                  alt="360 view angle" 
                  className="max-h-[350px] object-cover pointer-events-none select-none"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 flex items-center gap-2 text-black/40 text-[9px] font-mono tracking-widest uppercase">
                  <RotateCcw className="w-3 h-3 animate-spin-slow" /> Drag horizontal to rotate 360°
                </div>
              </div>
            )}

            {viewMode === 'video' && (
              <div className="w-full h-full bg-black flex items-center justify-center">
                {product.videoUrl ? (
                  <video 
                    className="w-full h-full object-cover"
                    controls 
                    autoPlay 
                    loop 
                    muted
                  >
                    <source src={product.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <div className="text-white text-center p-4">
                    <p className="text-[10px] tracking-widest font-bold uppercase mb-2">Simulated Video Preview</p>
                    <div className="animate-pulse bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-6 h-6 text-luxury-accent fill-current" />
                    </div>
                    <p className="text-xs text-white/50 max-w-xs font-mono">Runway clips showcasing fabric draping and shoulder structures are compiled for this model.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Select Tabs & Thumbnail Row */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-black/[0.04] pb-2">
              <div className="flex gap-4">
                <button 
                  onClick={() => setViewMode('gallery')}
                  className={`text-[10px] tracking-widest uppercase font-button-lux font-bold pb-1 ${viewMode === 'gallery' ? 'border-b-2 border-black text-black' : 'text-black/40'}`}
                >
                  Gallery
                </button>
                <button 
                  onClick={() => setViewMode('360')}
                  className={`text-[10px] tracking-widest uppercase font-button-lux font-bold pb-1 flex items-center gap-1.5 ${viewMode === '360' ? 'border-b-2 border-black text-black' : 'text-black/40'}`}
                >
                  <RotateCcw className="w-3 h-3" /> 360° View
                </button>
                <button 
                  onClick={() => setViewMode('video')}
                  className={`text-[10px] tracking-widest uppercase font-button-lux font-bold pb-1 flex items-center gap-1.5 ${viewMode === 'video' ? 'border-b-2 border-black text-black' : 'text-black/40'}`}
                >
                  <Play className="w-3 h-3" /> Video Preview
                </button>
              </div>
            </div>

            {viewMode === 'gallery' && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-18 bg-white border overflow-hidden flex-shrink-0 transition-all ${activeImage === img ? 'border-luxury-accent scale-105 shadow-md' : 'border-black/5 hover:border-black/20'}`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
          <div>
            {/* Header: Title and Price */}
            <div className="flex justify-between items-start mb-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">
                  {product.category}
                </span>
                <h2 className="font-serif-lux font-bold text-xl sm:text-2xl text-black leading-tight">
                  {product.name}
                </h2>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-numbers-lux text-black text-xl sm:text-2xl font-bold">${product.price}.00</p>
                {product.originalPrice && (
                  <p className="font-numbers-lux text-black/35 text-xs line-through mt-0.5">${product.originalPrice}.00</p>
                )}
              </div>
            </div>

            {/* Sub-header: Ratings */}
            <div className="flex items-center gap-3 border-b border-black/[0.05] pb-4 mb-4">
              <div className="flex items-center text-luxury-accent">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-200'}`} 
                  />
                ))}
                <span className="font-mono text-black text-xs font-semibold ml-1.5">{product.rating}</span>
              </div>
              <span className="text-black/30">|</span>
              <span className="text-[11px] font-medium text-black/50 uppercase tracking-widest font-button-lux">
                {product.reviews.length} Verified Reviews
              </span>
            </div>

            {/* Custom Interactive Accordion Tabs */}
            <div className="flex gap-4 border-b border-black/[0.05] mb-4">
              {['details', 'fabric', 'care', 'reviews'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`text-[10px] tracking-widest uppercase font-button-lux font-bold pb-2 transition-all border-b-2 ${
                    activeTab === tab ? 'border-black text-black font-extrabold' : 'border-transparent text-black/40 hover:text-black/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[100px] mb-6">
              {activeTab === 'details' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-black/75 leading-relaxed font-sans flex flex-col gap-3">
                  <p>{product.description}</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 list-disc pl-4 mt-2 text-black/60 font-mono text-[10px]">
                    {product.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'fabric' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-black/75 leading-relaxed font-mono">
                  {product.fabricDetails}
                </motion.p>
              )}

              {activeTab === 'care' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-black/75 leading-relaxed font-mono">
                  {product.careInstructions}
                </motion.p>
              )}

              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-1">
                  {product.reviews.length === 0 ? (
                    <p className="text-xs text-black/40 font-mono italic">No reviews yet. Be the first to build the legacy.</p>
                  ) : (
                    product.reviews.map(rev => (
                      <div key={rev.id} className="p-3 bg-neutral-50 rounded-sm border border-black/[0.02]">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-button-lux text-[10px] font-bold text-black uppercase tracking-wider">{rev.userName}</span>
                          <span className="text-[9px] text-black/35 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-luxury-accent mb-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-neutral-200'}`} />
                          ))}
                        </div>
                        <p className="text-[11px] text-black/70 leading-normal">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </div>

            {/* COLOR SELECT */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-2">
                COLOR: {selectedColor.name}
              </span>
              <div className="flex gap-2.5">
                {product.colors.map(color => (
                  <button 
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                      selectedColor.name === color.name ? 'border-black ring-2 ring-luxury-accent/30 scale-105' : 'border-black/10 hover:border-black/30'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* SIZE SELECT */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux">
                  SIZE: {selectedSize}
                </span>
                <button 
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[10px] text-black/60 hover:text-black hover:underline flex items-center gap-1 uppercase font-bold tracking-widest font-button-lux"
                >
                  <Ruler className="w-3.5 h-3.5" /> Size Guide
                </button>
              </div>
              <div className="flex gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 border text-[11px] font-bold font-button-lux transition-all ${
                      selectedSize === size ? 'bg-black text-white border-black scale-105' : 'border-black/10 hover:border-black text-black/70'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* COMPLETE THE LOOK AI RECOMMENDATION PANEL */}
            {completeLookProducts.length > 0 && (
              <div className="mb-6 border-t border-black/[0.04] pt-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 animate-pulse" />
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-black/55 font-button-lux">
                    COMPLETE THE LOOK: AI SUGGESTION
                  </span>
                </div>
                
                {loadingLook ? (
                  <div className="h-16 flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b border-black" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {completeLookProducts.map(lookProd => (
                      <div 
                        key={lookProd.id}
                        className="flex items-center gap-3 p-2 bg-neutral-50 hover:bg-neutral-100 rounded-sm border border-black/[0.03] transition-colors"
                      >
                        <img 
                          src={lookProd.images[0]} 
                          alt={lookProd.name} 
                          className="w-12 h-14 object-cover rounded-sm border border-black/5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-grow text-xs min-w-0">
                          <p className="font-serif-lux font-medium text-black truncate">{lookProd.name}</p>
                          <p className="text-[10px] font-mono text-black/50 mt-0.5">${lookProd.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            onAddToCart(lookProd, lookProd.sizes[0], lookProd.colors[0]);
                          }}
                          className="px-2.5 py-1.5 bg-black hover:bg-luxury-accent hover:text-black text-white text-[9px] font-bold tracking-wider font-button-lux uppercase rounded-sm flex items-center gap-1 transition-colors"
                        >
                          + ADD
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER CONTROLS: Add To Bag and Logistics */}
          <div>
            <div className="flex gap-3 mb-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-grow bg-black hover:bg-luxury-accent hover:text-black text-white text-[11px] font-button-lux font-bold uppercase py-4 tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" /> ADDED TO LEGACY BAG
                  </>
                ) : product.stock === 0 ? (
                  'SOLD OUT'
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> ADD TO BAG
                  </>
                )}
              </button>

              <button 
                onClick={() => onToggleWishlist(product)}
                className={`px-4 bg-white border rounded-sm flex items-center justify-center transition-all ${
                  isWishlisted ? 'text-red-500 border-red-200 bg-red-50/20' : 'text-black/50 border-black/10 hover:text-black hover:border-black'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              <button 
                onClick={handleShare}
                className="px-4 bg-white border border-black/10 hover:border-black rounded-sm flex items-center justify-center text-black/50 hover:text-black transition-all relative"
                title="Share product link"
              >
                <Share2 className="w-4 h-4" />
                <AnimatePresence>
                  {shareSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: -30 }}
                      exit={{ opacity: 0 }}
                      className="absolute bg-black text-white text-[8px] tracking-widest uppercase font-bold py-1 px-2 whitespace-nowrap rounded-sm -top-4 shadow-md"
                    >
                      Link Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Logistics guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/[0.04] text-[10px] font-mono text-black/50">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-luxury-accent" />
                <span>Delivery: {product.estimatedDelivery}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-luxury-accent" />
                <span>COD Available & 7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Size Guide Overlay Modal */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSizeGuideOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-md w-full p-6 shadow-2xl relative z-10 border border-black/10 rounded-sm"
            >
              <button 
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 text-black hover:text-luxury-accent"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-serif-lux font-bold text-lg mb-4 text-black border-b pb-2">SJYRO® OVERSIZED FIT GUIDE</h3>
              <p className="text-[11px] text-black/60 mb-4 leading-relaxed font-sans">
                Our silhouettes are intentionally designed with an oversized cut. We recommend purchasing your normal size for the intended boxy/draped look, or sizing down once for a more tailored streetwear fit.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-neutral-50 text-black border-b border-black/10">
                      <th className="p-2.5">SIZE</th>
                      <th className="p-2.5">CHEST (in)</th>
                      <th className="p-2.5">LENGTH (in)</th>
                      <th className="p-2.5">SLEEVE (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] text-black/80">
                    <tr>
                      <td className="p-2.5 font-bold">S</td>
                      <td className="p-2.5">46</td>
                      <td className="p-2.5">26.5</td>
                      <td className="p-2.5">23</td>
                    </tr>
                    <tr className="bg-neutral-50/50">
                      <td className="p-2.5 font-bold">M</td>
                      <td className="p-2.5">48</td>
                      <td className="p-2.5">27.5</td>
                      <td className="p-2.5">24</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold">L</td>
                      <td className="p-2.5">50</td>
                      <td className="p-2.5">28.5</td>
                      <td className="p-2.5">25</td>
                    </tr>
                    <tr className="bg-neutral-50/50">
                      <td className="p-2.5 font-bold">XL</td>
                      <td className="p-2.5">52</td>
                      <td className="p-2.5">29.5</td>
                      <td className="p-2.5">26</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
