/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ArrowRight, Play, Sparkles, Eye, Shield, Lock } from 'lucide-react';

interface HeroProps {
  setView: (view: string) => void;
  onOpenSearch: () => void;
}

export default function Hero({ setView, onOpenSearch }: HeroProps) {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-center items-center select-none">
      {/* Absolute Fullscreen Video Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
        <video 
          className="w-full h-full object-cover opacity-60 filter grayscale brightness-50"
          autoPlay 
          loop 
          muted 
          playsInline
          referrerPolicy="no-referrer"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-man-dancing-in-streetwear-fashion-41885-large.mp4" 
            type="video/mp4" 
          />
          {/* Fallback image */}
          <img 
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=2000" 
            alt="SJYRO Streetwear Backing" 
            className="w-full h-full object-cover"
          />
        </video>
        {/* Soft elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
      </div>

      {/* Hero Core Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl flex flex-col items-center">
        {/* Editorial Subtitle Accent */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex items-center gap-2 mb-6"
        >
          <span className="w-8 h-[1px] bg-luxury-accent/60" />
          <span className="text-[10px] sm:text-xs font-button-lux tracking-[0.4em] uppercase font-bold text-luxury-accent">
            SJYRO® PRESTIGE DROP
          </span>
          <span className="w-8 h-[1px] bg-luxury-accent/60" />
        </motion.div>

        {/* Core Massive Headline (Editorial font) */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white text-4xl sm:text-6xl md:text-8xl font-serif-lux font-medium tracking-tight leading-[1.05] max-w-4xl"
        >
          BEYOND TRENDS.
          <br />
          <span className="font-serif-lux italic text-luxury-accent font-normal">BUILT FOR</span> LEGACY.
        </motion.h1>

        {/* Subtitle description */}
        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5 }}
          className="text-neutral-300 font-sans text-sm sm:text-lg tracking-[0.08em] font-light max-w-xl mt-6 leading-relaxed"
        >
          Premium Streetwear Crafted For Modern Icons. Meticulously engineered silhouette structures with heavy fabric weights and high fidelity detailing.
        </motion.p>

      </div>

      {/* Decorative Corner Labels to eliminate Margin Clutter & remain Architecturally Honest */}
      <div className="absolute bottom-8 left-8 hidden lg:block text-white/30 text-[9px] font-mono tracking-[0.25em] uppercase">
        MODEL: LATEST_V2_DROP
      </div>
      <div className="absolute bottom-8 right-8 hidden lg:block text-white/30 text-[9px] font-mono tracking-[0.25em] uppercase">
        LOC: GLOBAL DIRECT_SHIPPING
      </div>

      {/* Downward mouse-scroll bounce indicator */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer opacity-40 hover:opacity-100 transition-opacity"
        onClick={() => {
          const exploreEl = document.getElementById('discover-legacy');
          if (exploreEl) {
            exploreEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <span className="text-[8px] font-button-lux tracking-[0.3em] uppercase text-white mb-2">
          SCROLL TO DISCOVER
        </span>
        <ChevronDown className="w-4 h-4 text-white" />
      </motion.div>
    </div>
  );
}
