/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, User, Shield, Sparkles, ArrowLeft, Compass, RotateCcw, Search, Menu, X, ArrowRight, Heart } from 'lucide-react';
import { CartItem, Product } from '../types';

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  cart: CartItem[];
  wishlist: Product[];
  onOpenCart: () => void;
  onOpenSearch: () => void;
  user: { fullName: string; email: string } | null;
  onLogout: () => void;
  onBack: () => void;
}

const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const menuItemVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15
    }
  }
};

export default function Navigation({
  currentView,
  setView,
  cart,
  wishlist,
  onOpenCart,
  onOpenSearch,
  user,
  onLogout,
  onBack
}: NavigationProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-black/5 bg-white/70 backdrop-blur-md">
      {/* Top Banner (Scrolling Marquee style or Minimal Accent) */}
      <div className="bg-black text-white text-[10px] tracking-[0.2em] uppercase py-2 px-4 flex justify-between items-center overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          <span>COMPLIMENTARY SHIPPING WORLDWIDE ON ORDER ABOVE $150</span>
          <span>•</span>
          <span>BEYOND TRENDS. BUILT FOR LEGACY.</span>
          <span>•</span>
          <span>LIMITED STOCK IN STOCK APPAREL - NO RESTOCKS</span>
          <span>•</span>
          <span>COMPLIMENTARY SHIPPING WORLDWIDE ON ORDER ABOVE $150</span>
          <span>•</span>
          <span>BEYOND TRENDS. BUILT FOR LEGACY.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        {/* Left Side: Navigation Links (Desktop) */}
        <motion.div 
          variants={menuContainerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex items-center gap-8 font-button-lux text-[11px] font-semibold tracking-[0.15em] uppercase text-black/80"
        >
          <motion.button 
            variants={menuItemVariants}
            onClick={() => setMenuOpen(true)}
            className="flex items-center text-black hover:text-luxury-accent transition-colors duration-300 border-r border-black/10 pr-6 mr-2"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('home'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 font-bold ${currentView === 'home' ? 'text-luxury-accent' : ''}`}
          >
            Home
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('shop'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 font-bold ${currentView === 'shop' ? 'text-luxury-accent' : ''}`}
          >
            Shop Now
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('collections'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 font-bold ${currentView === 'collections' ? 'text-luxury-accent' : ''}`}
          >
            Explore Collections
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={onOpenSearch}
            className="text-luxury-accent hover:text-black hover:bg-neutral-100 px-2.5 py-1 border border-luxury-accent/30 rounded-sm flex items-center gap-1 text-[10px] font-bold"
          >
            <Sparkles className="w-3 h-3 animate-pulse" /> Ask AI Stylist
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('limited'); }}
            className="text-red-600 hover:text-black hover:bg-red-50 px-2 py-0.5 border border-red-200 rounded-sm flex items-center gap-1 text-[9px] font-bold animate-pulse"
          >
            <Sparkles className="w-2.5 h-2.5" /> Limited Drops
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('journal'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 ${currentView === 'journal' ? 'text-luxury-accent' : ''}`}
          >
            Journal
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('ateliers'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 ${currentView === 'ateliers' ? 'text-luxury-accent' : ''}`}
          >
            Ateliers
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('silhouette'); }}
            className={`hover:text-luxury-accent hover:scale-105 transition-all duration-300 flex items-center gap-1 font-bold ${currentView === 'silhouette' ? 'text-luxury-accent' : ''}`}
          >
            <Compass className="w-3.5 h-3.5 text-luxury-accent animate-spin-slow" /> 360° Studio
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('aesthetic-essence'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 font-semibold ${currentView === 'aesthetic-essence' ? 'text-luxury-accent' : ''}`}
          >
            Aesthetic Essence
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('verified-collectors'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 font-semibold ${currentView === 'verified-collectors' ? 'text-luxury-accent' : ''}`}
          >
            Verified Collectors
          </motion.button>
          <motion.button 
            variants={menuItemVariants}
            onClick={() => { setView('prestige-circle'); }}
            className={`hover:text-luxury-accent transition-colors duration-300 font-semibold ${currentView === 'prestige-circle' ? 'text-luxury-accent' : ''}`}
          >
            Prestige Circle
          </motion.button>
        </motion.div>

        {/* Left Side: Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={() => setMenuOpen(true)}
            className="flex items-center text-black hover:text-luxury-accent transition-colors duration-300 p-2 border border-black/10 rounded-sm hover:border-black/25 bg-neutral-50/50"
            title="Open Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Brand Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button onClick={() => setView('home')} className="flex flex-col items-center group">
            <span className="font-serif-lux text-2xl font-bold tracking-[0.3em] uppercase transition-transform duration-500 group-hover:scale-105">
              SJYRO
            </span>
            <span className="text-[7px] tracking-[0.45em] uppercase font-bold text-black/40 mt-0.5 group-hover:text-luxury-accent transition-colors duration-500">
              BUILT FOR LEGACY
            </span>
          </button>
        </div>

        {/* Right Side: Action Utilities */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Wishlist Icon */}
          <button 
            onClick={() => setView('account-wishlist')}
            className="relative p-1 hover:text-luxury-accent transition-colors duration-300 text-black/80 hover:scale-105 transition-all"
            title="My Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlist && wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-luxury-accent text-black text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={onOpenCart}
            className="relative p-1 hover:text-luxury-accent transition-colors duration-300"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-luxury-accent text-black text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="p-1 hover:text-luxury-accent transition-colors duration-300 flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              {user && (
                <span className="hidden lg:inline text-[9px] uppercase font-bold tracking-wider font-button-lux truncate max-w-[80px]">
                  {user.fullName.split(' ')[0]}
                </span>
              )}
            </button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white border border-black/5 shadow-2xl rounded-sm z-20 py-2"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-black/5">
                          <p className="text-[10px] font-semibold text-black/40 uppercase tracking-wider">Signed In As</p>
                          <p className="text-xs font-semibold text-black truncate">{user.fullName}</p>
                          <p className="text-[10px] font-mono text-black/50 truncate">{user.email}</p>
                        </div>
                        <button 
                          onClick={() => { setProfileDropdownOpen(false); setView('account-orders'); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-medium hover:bg-black/[0.02] hover:text-luxury-accent transition-colors tracking-wide uppercase"
                        >
                          My Orders
                        </button>
                        <button 
                          onClick={() => { setProfileDropdownOpen(false); setView('account-wishlist'); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-medium hover:bg-black/[0.02] hover:text-luxury-accent transition-colors tracking-wide uppercase"
                        >
                          My Wishlist
                        </button>
                        <button 
                          onClick={() => { setProfileDropdownOpen(false); setView('account-addresses'); }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-medium hover:bg-black/[0.02] hover:text-luxury-accent transition-colors tracking-wide uppercase"
                        >
                          Manage Addresses
                        </button>
                        <div className="border-t border-black/5 mt-1 pt-1">
                          <button 
                            onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-medium text-red-600 hover:bg-red-50/50 transition-colors tracking-wide uppercase"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 text-center">
                          <p className="text-[10px] text-black/40 mb-3 tracking-widest uppercase">Access Your Legacy Profile</p>
                          <button 
                            onClick={() => { setProfileDropdownOpen(false); setView('login'); }}
                            className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-button-lux font-bold uppercase py-2 transition-colors duration-300"
                          >
                            Sign In / Register
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>

    {/* Side Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-[100]"
            />
            
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="fixed top-0 left-0 h-full w-full max-w-[380px] bg-neutral-950 text-white z-[101] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-black shrink-0">
                <div className="flex flex-col">
                  <span className="font-serif-lux text-xl font-bold tracking-[0.25em] text-white">
                    SJYRO
                  </span>
                  <span className="text-[7px] tracking-[0.4em] font-bold text-luxury-accent mt-0.5">
                    BUILT FOR LEGACY
                  </span>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body - Scrollable Area */}
              <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
                <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/30">NAVIGATION</span>
                <nav className="flex flex-col gap-5 text-sm uppercase tracking-[0.2em] font-button-lux font-semibold">
                  <button 
                    onClick={() => { setView('home'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'home' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { setView('shop'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'shop' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Shop Now
                  </button>
                  <button 
                    onClick={() => { setView('collections'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'collections' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Explore Collections
                  </button>
                  <button 
                    onClick={() => { setView('limited'); setMenuOpen(false); }}
                    className="text-left text-red-500 hover:text-red-400 flex items-center gap-2 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Limited Drops
                  </button>
                  <button 
                    onClick={() => { setView('journal'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'journal' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Journal
                  </button>
                  <button 
                    onClick={() => { setView('ateliers'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'ateliers' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Ateliers
                  </button>
                  <button 
                    onClick={() => { setView('silhouette'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors flex items-center gap-2 ${currentView === 'silhouette' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    <Compass className="w-4 h-4 text-luxury-accent animate-spin-slow" /> 360° Studio
                  </button>
                  <button 
                    onClick={() => { setView('aesthetic-essence'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'aesthetic-essence' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Aesthetic Essence
                  </button>
                  <button 
                    onClick={() => { setView('verified-collectors'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'verified-collectors' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Verified Collectors
                  </button>
                  <button 
                    onClick={() => { setView('prestige-circle'); setMenuOpen(false); }}
                    className={`text-left hover:text-luxury-accent transition-colors ${currentView === 'prestige-circle' ? 'text-luxury-accent' : 'text-white/80'}`}
                  >
                    Prestige Circle
                  </button>
                </nav>
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
