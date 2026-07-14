/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, Star, Sparkles, Eye, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/currency';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Stock indicator status
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  const handleQuickAdd = (size: string) => {
    onAddToCart(product, size, product.colors[0].name);
    setAddedSuccess(true);
    setQuickAddOpen(false);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <motion.div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setQuickAddOpen(false);
      }}
      className="group relative flex flex-col bg-white border border-black/[0.03] overflow-hidden"
    >
      {/* Absolute Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isLimitedDrop && (
          <span className="bg-red-600 text-white text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm shadow-md animate-pulse flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> LIMITED DROP
          </span>
        )}
        {product.isBestSeller && !product.isLimitedDrop && (
          <span className="bg-black text-white text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm">
            BEST SELLER
          </span>
        )}
        {product.isNewArrival && !product.isBestSeller && !product.isLimitedDrop && (
          <span className="bg-luxury-accent text-black text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm">
            NEW ARRIVAL
          </span>
        )}
      </div>

      {/* Wishlist Heart Icon */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full border bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 ${
          isWishlisted ? 'text-red-500 border-red-100' : 'text-black/50 border-black/5 hover:text-black hover:scale-105'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Card Image Canvas */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative aspect-[3/4] bg-[#F3F3F3] cursor-pointer overflow-hidden"
      >
        <img 
          src={hovered && product.images[1] ? product.images[1] : product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-all duration-700 ease-out transform group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Quick View and Quick Add overlays */}
        <AnimatePresence>
          {hovered && !isOutOfStock && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/15 flex flex-col justify-end p-4 gap-2"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="w-full bg-white/90 backdrop-blur-md text-black text-[10px] tracking-widest font-button-lux font-bold uppercase py-3 border border-black/5 shadow-md hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> QUICK VIEW
              </button>

              <div className="relative">
                {quickAddOpen ? (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white p-3 border border-black/5 shadow-xl rounded-sm flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[8px] font-bold uppercase text-black/50 tracking-widest text-center">SELECT SIZE</p>
                    <div className="flex justify-center gap-1.5">
                      {product.sizes.map(size => (
                        <button 
                          key={size}
                          onClick={() => handleQuickAdd(size)}
                          className="w-8 h-8 rounded-full border border-black/10 hover:border-black text-[10px] font-bold font-button-lux hover:bg-black hover:text-white flex items-center justify-center transition-all"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickAddOpen(true);
                    }}
                    className="w-full bg-black text-white text-[10px] tracking-widest font-button-lux font-bold uppercase py-3 shadow-md hover:bg-luxury-accent hover:text-black transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> ADDED TO BAG
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" /> QUICK ADD TO BAG
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <span className="border border-white/20 px-4 py-2 bg-black/80 text-white text-[10px] tracking-widest font-button-lux font-bold uppercase rounded-sm">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Product Card Text Metadata */}
      <div className="p-4 flex flex-col flex-grow bg-white border-t border-black/[0.01]">
        {/* Category & Rating */}
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-black/40 mb-1 font-button-lux">
          <span>{product.category}</span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-luxury-accent fill-current" />
            <span className="font-mono text-black font-semibold">{product.rating}</span>
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onQuickView(product)}
          className="font-serif-lux font-medium text-black text-sm hover:text-luxury-accent cursor-pointer transition-colors line-clamp-1 mb-1.5"
        >
          {product.name}
        </h3>

        {/* Price Tag with Luxury Numbers Font */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-numbers-lux text-black text-base font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-numbers-lux text-black/35 text-xs line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Dynamic Stock progress indicator */}
        <div className="mt-auto">
          {isOutOfStock ? (
            <div className="text-[10px] font-bold text-red-600 tracking-wider flex items-center gap-1 font-button-lux">
              No Restocks Planned
            </div>
          ) : isLowStock ? (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[9px] font-bold uppercase text-red-600 tracking-wider font-button-lux animate-pulse">
                <span>Only {product.stock} pieces remaining</span>
                <span>Limited Drops</span>
              </div>
              <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-red-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(product.stock / 15) * 100}%` }} 
                />
              </div>
            </div>
          ) : (
            <div className="text-[9px] font-bold text-green-600 tracking-widest uppercase flex items-center gap-1 font-button-lux">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> In Stock & Ready To Ship
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
