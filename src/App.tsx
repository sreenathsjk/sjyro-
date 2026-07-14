/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Heart, 
  Eye, 
  ArrowUp, 
  Instagram, 
  Twitter, 
  Facebook, 
  Lock, 
  RotateCcw, 
  HelpCircle, 
  BookOpen, 
  User, 
  ShieldCheck, 
  Ticket,
  Mail,
  Check,
  ArrowLeft,
  Shield,
  X
} from 'lucide-react';

import { Product, CartItem, Order } from './types';
import { dbService } from './lib/firebase';

// Modular Components Imports
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartDrawer from './components/CartDrawer';
import SmartSearch from './components/SmartSearch';
import CheckoutSection from './components/CheckoutSection';
import AccountDashboard from './components/AccountDashboard';
import AdminPanel from './components/AdminPanel';
import AtelierLocator from './components/AtelierLocator';
import SilhouetteStudio from './components/SilhouetteStudio';
import { AestheticEssenceView, VerifiedCollectorsView, PrestigeCircleView } from './components/PremiumViews';

const pageVariants = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -15 }
};

const pageTransition = {
  duration: 0.35,
  ease: [0.25, 1, 0.5, 1]
};

export default function App() {
  // Navigation Routing States
  const [currentView, rawSetView] = useState<string>('home'); // home | shop | collections | limited | journal | about | faq | login | checkout | account-orders | account-wishlist | account-addresses | admin
  const [activeView, setActiveView] = useState<string>('home');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const transitionTimerRef = React.useRef<any>(null);
  const fadeOutTimerRef = React.useRef<any>(null);

  useEffect(() => {
    if (currentView === activeView) return;

    setIsTransitioning(true);

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);

    transitionTimerRef.current = setTimeout(() => {
      setActiveView(currentView);
      window.scrollTo(0, 0);

      fadeOutTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 250);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    };
  }, [currentView]);

  const setView = (newView: string) => {
    window.history.pushState({ view: newView }, '', '');
    rawSetView(newView);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('product-details');
  };

  useEffect(() => {
    if (!window.history.state || !window.history.state.view) {
      window.history.replaceState({ view: 'home' }, '', '');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        rawSetView(event.state.view);
      } else {
        rawSetView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Data States
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  
  // UI States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSilhouetteProductId, setSelectedSilhouetteProductId] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollTopOpen, setScrollTopOpen] = useState(false);

  // Secret Admin Authentication States
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Shop Filter States
  const [shopCategory, setShopCategory] = useState<string>('ALL');
  const [shopSort, setShopSort] = useState<string>('DEFAULT');

  // Newsletter form
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPass, setRegisterPass] = useState('');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Initial Load Lifecycle
  useEffect(() => {
    loadCatalog();
    
    // Load local storage items
    const savedCart = localStorage.getItem('sjyro_cart_cache');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedWishlist = localStorage.getItem('sjyro_wishlist_cache');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const currentUser = dbService.getCurrentUser();
    if (currentUser) setUser(currentUser);

    // Scroll tracker
    const handleScroll = () => {
      setScrollTopOpen(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync caches
  useEffect(() => {
    localStorage.setItem('sjyro_cart_cache', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sjyro_wishlist_cache', JSON.stringify(wishlist));
  }, [wishlist]);

  // Protect Admin View
  useEffect(() => {
    if (currentView === 'admin' && !isAdmin) {
      setView('home');
      setAdminAuthModalOpen(true);
    }
  }, [currentView, isAdmin]);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Private credentials requested by owner
    if (adminEmail.toLowerCase() === '18sparweb@gmail.com' && adminPassword === 'Krishika@24sjyro@18sparweb') {
      setIsAdmin(true);
      setAdminAuthModalOpen(false);
      setAdminEmail('');
      setAdminPassword('');
      setAdminAuthError('');
      setView('admin');
    } else {
      setAdminAuthError('INVALID LEGACY SECURITY SIGNATURE');
    }
  };

  const loadCatalog = async () => {
    const productsData = await dbService.getProducts();
    setAllProducts(productsData);
  };

  // --- CART CONTROLS ---
  const handleAddToCart = (product: Product, size: string, color: string) => {
    setCart(prev => {
      const idx = prev.findIndex(item => 
        item.product.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    // Open drawer on add
    setCartOpen(true);
  };

  const handleUpdateQty = (productId: string, size: string, color: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size, color);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId && 
      item.selectedSize === size && 
      item.selectedColor === color
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const handleRemoveItem = (productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && 
        item.selectedSize === size && 
        item.selectedColor === color)
    ));
  };

  // --- WISHLIST CONTROLS ---
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSuccess('');
    const res = await dbService.subscribeNewsletter(newsletterEmail);
    if (res.success) {
      setNewsletterSuccess(res.message);
      setNewsletterEmail('');
    } else {
      setNewsletterSuccess(res.message);
    }
  };

  // --- AUTH METHODS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) return;
    const nameFromEmail = loginEmail.split('@')[0].toUpperCase();
    const mockUser = {
      fullName: nameFromEmail === 'SATOSHI' ? 'Satoshi Nakamoto' : `${nameFromEmail} LEGACY`,
      email: loginEmail
    };
    setUser(mockUser);
    localStorage.setItem('sjyro_auth_user', JSON.stringify(mockUser));
    setView('shop');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail) return;
    const mockUser = {
      fullName: registerName,
      email: registerEmail
    };
    setUser(mockUser);
    localStorage.setItem('sjyro_auth_user', JSON.stringify(mockUser));
    setView('shop');
  };

  const handleLogout = async () => {
    await dbService.logout();
    setUser(null);
    setView('home');
  };

  const handleGoogleSignIn = async () => {
    const resUser = await dbService.loginWithGoogle();
    if (resUser) {
      setUser(resUser);
      setView('shop');
    }
  };

  const handleOrderCompleted = (order: Order) => {
    // Clear cart
    setCart([]);
    setView('account-orders');
  };

  // --- SORT AND FILTERS ---
  const filteredProducts = allProducts.filter(p => {
    if (shopCategory === 'ALL') return true;
    return p.category.toLowerCase() === shopCategory.toLowerCase();
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (shopSort === 'PRICE_LOW') return a.price - b.price;
    if (shopSort === 'PRICE_HIGH') return b.price - a.price;
    if (shopSort === 'RATING') return b.rating - a.rating;
    return 0; // Default Unsorted
  });

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-black selection:text-white">
      
      {/* 1. STICKY GLOBAL NAVIGATION */}
      <Navigation 
        currentView={currentView}
        setView={setView}
        cart={cart}
        wishlist={wishlist}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        user={user}
        onLogout={handleLogout}
        onBack={handleGoBack}
      />

      {/* 2. DYNAMIC CONTENT PORTAL STAGE */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW */}
          {activeView === 'home' && (
            <motion.div 
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Hero setView={setView} onOpenSearch={() => setSearchOpen(true)} />

              {/* Discovery Legacy Segment */}
              <section id="discover-legacy" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b border-black/[0.04]">
                <div className="text-center mb-16">
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-black/40 font-button-lux">
                    SARTORIAL DISCOVERY
                  </span>
                  <h2 className="font-serif-lux font-medium text-3xl sm:text-5xl text-black mt-3">
                    EDITORIAL BEST SELLERS
                  </h2>
                  <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {allProducts.slice(0, 4).map(prod => (
                    <ProductCard 
                      key={prod.id}
                      product={prod}
                      onQuickView={handleProductClick}
                      onAddToCart={handleAddToCart}
                      isWishlisted={wishlist.some(p => p.id === prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>

                <div className="text-center mt-12">
                  <button 
                    onClick={() => setView('shop')}
                    className="group border-b border-black text-black text-[11px] font-bold font-button-lux uppercase tracking-widest pb-1 hover:text-luxury-accent hover:border-luxury-accent transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    DISCOVER THE CATALOG <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {/* SHOP CATALOG VIEW */}
          {activeView === 'shop' && (
            <motion.div 
              key="shop"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28"
            >
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/[0.05] pb-6 mb-10">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">
                    PERMANENT ARCHIVE
                  </span>
                  <h2 className="font-serif-lux font-bold text-2xl sm:text-3xl text-black">
                    THE SJYRO WARDROBE
                  </h2>
                </div>

                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                  {/* Category select tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {['ALL', 'Premium Hoodies', 'Oversized T-Shirts', 'Premium Shirts', 'Streetwear Collections'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setShopCategory(cat === 'ALL' ? 'ALL' : cat)}
                        className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded-sm font-button-lux transition-colors ${
                          (cat === 'ALL' && shopCategory === 'ALL') || (cat !== 'ALL' && shopCategory.toLowerCase() === cat.toLowerCase())
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-black/50 border-black/10 hover:border-black'
                        }`}
                      >
                        {cat === 'ALL' ? 'ALL ARCHIVES' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Sorting selector */}
                  <select 
                    value={shopSort}
                    onChange={(e) => setShopSort(e.target.value)}
                    className="bg-white border border-black/10 rounded-sm p-1.5 text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-black font-button-lux cursor-pointer"
                  >
                    <option value="DEFAULT">DEFAULT SORT</option>
                    <option value="PRICE_LOW">PRICE: LOW TO HIGH</option>
                    <option value="PRICE_HIGH">PRICE: HIGH TO LOW</option>
                    <option value="RATING">HIGHEST RATED</option>
                  </select>
                </div>
              </div>

              {/* Products Catalog grid */}
              {sortedProducts.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-black/40 font-mono text-xs mb-3">No models matching the selected filter criteria.</p>
                  <button onClick={() => setShopCategory('ALL')} className="text-xs font-bold text-black border-b border-black pb-0.5">Reset Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  {sortedProducts.map(prod => (
                    <ProductCard 
                      key={prod.id}
                      product={prod}
                      onQuickView={handleProductClick}
                      onAddToCart={handleAddToCart}
                      isWishlisted={wishlist.some(p => p.id === prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* COLLECTIONS VIEW */}
          {activeView === 'collections' && (
            <motion.div 
              key="collections"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28"
            >
              <div className="text-center mb-16">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black/40 font-button-lux">SEASONAL PORTFOLIOS</span>
                <h2 className="font-serif-lux font-bold text-2xl sm:text-4xl mt-2 text-black">AESTHETIC SILHOUETTE VOLUMES</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Collection item 1 */}
                <div className="group flex flex-col border border-black/5 bg-white overflow-hidden rounded-sm relative">
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200" alt="Legacy Drop Core" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6">
                    <span className="text-[8px] font-mono tracking-widest uppercase text-black/40 block mb-1">VOLUME I</span>
                    <h3 className="font-serif-lux font-bold text-lg text-black mb-2">THE OATH CORE LEGACY</h3>
                    <p className="text-xs text-black/60 font-sans leading-relaxed mb-4">Our initial permanent drop centering 480GSM hoodies and heavyweight tees dyed in deep charcoal charcoal and organic off-white pigments.</p>
                    <button onClick={() => { setShopCategory('Premium Hoodies'); setView('shop'); }} className="text-[10px] font-bold tracking-widest font-button-lux uppercase text-black border-b border-black pb-0.5 group-hover:text-luxury-accent group-hover:border-luxury-accent transition-colors">EXPLORE ARCHIVE</button>
                  </div>
                </div>

                {/* Collection item 2 */}
                <div className="group flex flex-col border border-black/5 bg-white overflow-hidden rounded-sm relative">
                  <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
                    <img src="https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=1200" alt="Seoul Neo-Streetwear" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6">
                    <span className="text-[8px] font-mono tracking-widest uppercase text-black/40 block mb-1">VOLUME II</span>
                    <h3 className="font-serif-lux font-bold text-lg text-black mb-2">SEOUL NEO-STREETS</h3>
                    <p className="text-xs text-black/60 font-sans leading-relaxed mb-4">Emphasizing drop shoulders, wide boxy cuts, double pocket overshirts, and cropped luxury streetwear structures inspired by Korean avant-garde lookbooks.</p>
                    <button onClick={() => { setShopCategory('Premium Shirts'); setView('shop'); }} className="text-[10px] font-bold tracking-widest font-button-lux uppercase text-black border-b border-black pb-0.5 group-hover:text-luxury-accent group-hover:border-luxury-accent transition-colors">EXPLORE ARCHIVE</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LIMITED DROPS VIEW */}
          {activeView === 'limited' && (
            <motion.div 
              key="limited"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28"
            >
              {/* Header */}
              <div className="bg-red-50 border border-red-100 p-8 rounded-sm mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <span className="bg-red-600 text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm animate-pulse">EXCLUSIVE DROP TICKER</span>
                  <h2 className="font-serif-lux font-bold text-2xl sm:text-3xl text-black mt-2">CYPHER DTF HOODIE SERIES</h2>
                  <p className="text-xs text-black/60 max-w-md mt-1 leading-relaxed">Only 100 numbered pieces built. Meticulous DTF high-density graphic print on French Terry backings. Once sold, no restocks will be planned.</p>
                </div>
                
                {/* Dynamic countdown layout */}
                <div className="flex gap-4 font-mono text-center">
                  <div className="bg-white p-3 border rounded-sm min-w-[60px] shadow-sm">
                    <span className="text-xl font-bold block text-red-600">00</span>
                    <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold block mt-1">DAYS</span>
                  </div>
                  <div className="bg-white p-3 border rounded-sm min-w-[60px] shadow-sm">
                    <span className="text-xl font-bold block text-red-600">14</span>
                    <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold block mt-1">HRS</span>
                  </div>
                  <div className="bg-white p-3 border rounded-sm min-w-[60px] shadow-sm">
                    <span className="text-xl font-bold block text-red-600">38</span>
                    <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold block mt-1">MINS</span>
                  </div>
                  <div className="bg-white p-3 border rounded-sm min-w-[60px] shadow-sm">
                    <span className="text-xl font-bold block text-red-600 animate-pulse">02</span>
                    <span className="text-[8px] uppercase tracking-widest text-black/40 font-bold block mt-1">SECS</span>
                  </div>
                </div>
              </div>

              {/* Show limited edition products */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {allProducts.filter(p => p.isLimitedDrop).map(prod => (
                  <ProductCard 
                    key={prod.id}
                    product={prod}
                    onQuickView={handleProductClick}
                    onAddToCart={handleAddToCart}
                    isWishlisted={wishlist.some(p => p.id === prod.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* JOURNAL VIEW */}
          {activeView === 'journal' && (
            <motion.div 
              key="journal"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-4xl mx-auto px-4 py-28"
            >
              <div className="border-b border-black/[0.04] pb-6 mb-12">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black/40 font-button-lux">EDITORIAL STORIES</span>
                <h2 className="font-serif-lux font-bold text-2xl sm:text-4xl mt-2 text-black">SJYRO LEGACY JOURNAL</h2>
              </div>

              <div className="flex flex-col gap-14">
                <article className="group">
                  <div className="aspect-[16/9] bg-neutral-100 overflow-hidden mb-6 rounded-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200" alt="Fit theory" className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-black/45 uppercase block mb-1">JULY 12, 2026</span>
                  <h3 className="font-serif-lux font-bold text-xl sm:text-2xl text-black mb-3 group-hover:text-luxury-accent cursor-pointer transition-colors">THE FIT THEORY OF BOX SILHOUETTES</h3>
                  <p className="text-xs text-black/60 leading-relaxed font-sans mb-4">Exploring why dropping the shoulder line by precisely 4 inches creates the ideal luxury streetwear drape. Analyzing garment gathering at the waist, armhole structures, and silhouette balances.</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 cursor-pointer font-button-lux group-hover:text-luxury-accent group-hover:border-luxury-accent transition-colors">Read full brief</span>
                </article>

                <article className="group">
                  <div className="aspect-[16/9] bg-neutral-100 overflow-hidden mb-6 rounded-sm">
                    <img src="https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=1200" alt="Fit theory" className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-black/45 uppercase block mb-1">JUNE 24, 2026</span>
                  <h3 className="font-serif-lux font-bold text-xl sm:text-2xl text-black mb-3 group-hover:text-luxury-accent cursor-pointer transition-colors">REFINING FRENCH TERRY WEIGHTS</h3>
                  <p className="text-xs text-black/60 leading-relaxed font-sans mb-4">Inside our combed ring-spun loopback weaving program based in Coimbatore, India. Balancing heavy 480GSM fabric density with structural breathability and internal softness loops.</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 cursor-pointer font-button-lux group-hover:text-luxury-accent group-hover:border-luxury-accent transition-colors">Read full brief</span>
                </article>
              </div>
            </motion.div>
          )}

          {/* ABOUT MANIFESTO VIEW */}
          {activeView === 'about' && (
            <motion.div 
              key="about"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-4xl mx-auto px-4 py-28"
            >
              <div className="text-center mb-16">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black/40 font-button-lux">THE BRAND SACRAMENT</span>
                <h2 className="font-serif-lux font-bold text-2xl sm:text-4xl mt-2 text-black">BEYOND TRENDS. BUILT FOR LEGACY.</h2>
                <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
              </div>

              <div className="flex flex-col gap-8 text-xs sm:text-sm font-sans leading-relaxed text-black/75">
                <p>
                   <strong>SJYRO®</strong> was founded with a singular conviction: streetwear should not be transient. In a market saturated with flimsy, throwaway designs and fast-fashion cycle waste, we build for longevity. Our materials, drapes, and silhouettes are engineered to serve as lifetime statements.
                </p>
                <p>
                   Every piece undergoes a multi-phase structural review. We coordinate with elite weavers to develop organic long-staple ring-spun cotton yarns, utilizing loopback weaves that preserve internal warmth and external stiffness.
                </p>
                <div className="aspect-[16/8] bg-neutral-100 my-4 overflow-hidden rounded-sm">
                  <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200" alt="Manifesto backing" className="w-full h-full object-cover filter grayscale" referrerPolicy="no-referrer" />
                </div>
                <p>
                   We are not motivated by high-volume turnouts. Our limited Drops are carefully restricted to numbered batches, ensuring exclusivity for the collectors. This is our legacy. Discover yours.
                </p>
              </div>
            </motion.div>
          )}

          {/* FAQS VIEW */}
          {activeView === 'faq' && (
            <motion.div 
              key="faq"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-3xl mx-auto px-4 py-28"
            >
              <div className="border-b border-black/[0.04] pb-6 mb-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black/40 font-button-lux">CUSTOMER CARE VAULT</span>
                <h2 className="font-serif-lux font-bold text-2xl sm:text-4xl mt-2 text-black">SUPPORT & FAQ</h2>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-5 bg-white border border-black/5 rounded-sm">
                  <h4 className="font-serif-lux font-bold text-sm text-black mb-2">What is the delivery timeline?</h4>
                  <p className="text-xs text-black/60 font-sans leading-relaxed">Our standard cargo delivery takes 3 to 5 business days worldwide. Shipments are handled via premium carriers and tracked live in real-time via Shiprocket integration.</p>
                </div>

                <div className="p-5 bg-white border border-black/5 rounded-sm">
                  <h4 className="font-serif-lux font-bold text-sm text-black mb-2">Do you support Cash On Delivery (COD)?</h4>
                  <p className="text-xs text-black/60 font-sans leading-relaxed">Yes, we support COD. You will pay cash to the courier representative when the parcel arrives at your door. Please keep exact change ready.</p>
                </div>

                <div className="p-5 bg-white border border-black/5 rounded-sm">
                  <h4 className="font-serif-lux font-bold text-sm text-black mb-2">What is your returns policy?</h4>
                  <p className="text-xs text-black/60 font-sans leading-relaxed">We support a 7-day hassle-free return window. If your silhouette size or draping cut is not up to your standard, request a refund label inside your Account Portal.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SIGN IN / REGISTER VIEW */}
          {activeView === 'login' && (
            <motion.div 
              key="login"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-md mx-auto px-4 py-28"
            >
              <div className="bg-white p-6 sm:p-8 border border-black/5 shadow-xl rounded-sm">
                {/* Mode Select */}
                <div className="flex gap-4 border-b border-black/[0.04] pb-4 mb-6 text-center justify-center font-button-lux text-xs font-bold tracking-widest uppercase">
                  <button 
                    onClick={() => setAuthMode('LOGIN')}
                    className={`pb-1 ${authMode === 'LOGIN' ? 'border-b-2 border-black text-black' : 'text-black/40'}`}
                  >
                    SIGN IN
                  </button>
                  <button 
                    onClick={() => setAuthMode('REGISTER')}
                    className={`pb-1 ${authMode === 'REGISTER' ? 'border-b-2 border-black text-black' : 'text-black/40'}`}
                  >
                    REGISTER PROFILE
                  </button>
                </div>

                {authMode === 'LOGIN' ? (
                  <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs font-sans">
                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                        placeholder="satoshi@bitcoin.org"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">PASSWORD</label>
                      <input 
                        type="password" 
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-bold uppercase py-3.5 font-button-lux transition-colors mt-2"
                    >
                      SECURE SIGN IN
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="flex flex-col gap-4 text-xs font-sans">
                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">FULL NAME</label>
                      <input 
                        type="text" 
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black"
                        placeholder="Satoshi Nakamoto"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">EMAIL ADDRESS</label>
                      <input 
                        type="email" 
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                        placeholder="satoshi@bitcoin.org"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">PASSWORD</label>
                      <input 
                        type="password" 
                        value={registerPass}
                        onChange={(e) => setRegisterPass(e.target.value)}
                        className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-bold uppercase py-3.5 font-button-lux transition-colors mt-2"
                    >
                      CREATE LEGACY PROFILE
                    </button>
                  </form>
                )}

                {/* Google Sign In Federated Provider Option */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
                  <span className="relative bg-white px-3 text-[9px] uppercase font-bold tracking-widest text-black/30 font-button-lux">OR SECURE INSTANT SIGN</span>
                </div>

                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full border border-black/10 hover:border-black bg-white text-black text-[10px] tracking-widest font-bold uppercase py-3 font-button-lux transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-luxury-accent" /> CONTINUE WITH GOOGLE AUTH
                </button>
              </div>
            </motion.div>
          )}

          {/* CHECKOUT FLOW VIEW */}
          {activeView === 'checkout' && (
            <motion.div 
              key="checkout" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <CheckoutSection 
                cart={cart}
                user={user}
                onOrderCompleted={handleOrderCompleted}
                setView={setView}
              />
            </motion.div>
          )}

          {/* ACCOUNT DETAILED VIEWS */}
          {activeView.startsWith('account-') && (
            <motion.div 
              key="account" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AccountDashboard 
                user={user}
                onLogout={handleLogout}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                setView={setView}
                currentSubView={activeView.split('-')[1]}
                onQuickView={handleProductClick}
              />
            </motion.div>
          )}

          {/* DEV ADMIN PANEL VIEW */}
          {activeView === 'admin' && isAdmin && (
            <motion.div 
              key="admin" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AdminPanel 
                allProducts={allProducts}
                onRefreshData={loadCatalog}
              />
            </motion.div>
          )}

          {/* ATELIERS LOCATOR VIEW */}
          {activeView === 'ateliers' && (
            <motion.div 
              key="ateliers" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AtelierLocator onBack={handleGoBack} />
            </motion.div>
          )}

          {/* 360° SILHOUETTE STUDIO IMMERSIVE CHAMBER */}
          {activeView === 'silhouette' && (
            <motion.div 
              key="silhouette" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <SilhouetteStudio 
                onBack={handleGoBack}
                onAddToCart={handleAddToCart}
                allProducts={allProducts}
                initialProductId={selectedSilhouetteProductId}
              />
            </motion.div>
          )}

          {/* PRODUCT DETAILS VIEW PAGE */}
          {activeView === 'product-details' && selectedProduct && (
            <motion.div 
              key="product-details" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <ProductDetailsPage 
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                isWishlisted={wishlist.some(p => p.id === selectedProduct.id)}
                onToggleWishlist={handleToggleWishlist}
                allProducts={allProducts}
                setView={setView}
                onEnter360Studio={(product) => {
                  setSelectedSilhouetteProductId(product.id);
                  setView('silhouette');
                }}
              />
            </motion.div>
          )}

          {/* AESTHETIC ESSENCE VIEW */}
          {activeView === 'aesthetic-essence' && (
            <motion.div 
              key="aesthetic-essence" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <AestheticEssenceView setView={setView} />
            </motion.div>
          )}

          {/* VERIFIED COLLECTORS VIEW */}
          {activeView === 'verified-collectors' && (
            <motion.div 
              key="verified-collectors" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <VerifiedCollectorsView setView={setView} />
            </motion.div>
          )}

          {/* PRESTIGE CIRCLE VIEW */}
          {activeView === 'prestige-circle' && (
            <motion.div 
              key="prestige-circle" 
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <PrestigeCircleView setView={setView} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>



      {/* 4. LUXURY BLACK FOOTER */}
      <footer className="bg-black text-white/50 text-[11px] font-sans py-16 border-t border-white/[0.04] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <span className="font-serif-lux text-white text-lg font-bold tracking-[0.2em] uppercase">SJYRO</span>
            <p className="font-sans leading-relaxed text-white/35 max-w-xs">
              Beyond Trends. Built For Legacy. Premium garments engineered with drop shoulder silhouettes and heavy weight loopbacks.
            </p>
            <div className="flex gap-4 items-center text-white/40 mt-2">
              <a href="#" className="hover:text-luxury-accent transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-luxury-accent transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:text-luxury-accent transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Col 2: Navigation directories */}
          <div className="flex flex-col gap-3 font-button-lux tracking-widest uppercase font-bold text-[9px]">
            <span className="text-white text-[10px] mb-2 font-serif-lux tracking-wider lowercase italic font-normal">the archives</span>
            <button onClick={() => { setShopCategory('ALL'); setView('shop'); }} className="text-left hover:text-white transition-colors">Catalog Shop</button>
            <button onClick={() => { setShopCategory('Premium Hoodies'); setView('shop'); }} className="text-left hover:text-white transition-colors">Premium Hoodies</button>
            <button onClick={() => { setShopCategory('Oversized T-Shirts'); setView('shop'); }} className="text-left hover:text-white transition-colors">Oversized Tees</button>
            <button onClick={() => { setView('limited'); }} className="text-left hover:text-white transition-colors text-red-400">Limited Drops</button>
          </div>

          {/* Col 3: Legal directories */}
          <div className="flex flex-col gap-3 font-button-lux tracking-widest uppercase font-bold text-[9px]">
            <span className="text-white text-[10px] mb-2 font-serif-lux tracking-wider lowercase italic font-normal">legal vault</span>
            <button onClick={() => setView('faq')} className="text-left hover:text-white transition-colors">FAQ Support</button>
            <button className="text-left hover:text-white transition-colors">Return Policy</button>
            <button className="text-left hover:text-white transition-colors">Terms of Service</button>
            <button className="text-left hover:text-white transition-colors">Privacy Policy</button>
          </div>

          {/* Col 4: Corporate guarantees */}
          <div className="flex flex-col gap-3">
            <span className="text-white text-[10px] mb-2 font-serif-lux tracking-widest uppercase font-bold">Secure Transactions</span>
            <div className="flex gap-2 mb-2 items-center">
              {/* Payment gateway compliance indicators */}
              <span className="border border-white/10 px-2 py-1 text-[8px] font-mono tracking-widest uppercase text-white/30 rounded-sm font-bold">RAZORPAY SECURE</span>
              <span className="border border-white/10 px-2 py-1 text-[8px] font-mono tracking-widest uppercase text-white/30 rounded-sm font-bold">SHIPROCKET AWB</span>
            </div>
            <p className="leading-relaxed text-white/30">
              Payments processed utilizing 256-bit secure SSL certificates. Dispatches mapped instantly to Shiprocket cargo routes.
            </p>
          </div>
        </div>

        {/* Brand Copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-white/30 text-[9px] font-mono tracking-widest uppercase gap-4">
          <span>
            © 2026 SJYRO
            <span 
              onClick={() => setAdminAuthModalOpen(true)}
              className="cursor-default select-none hover:text-luxury-accent transition-colors duration-500 px-0.5"
              title="Creative Console Gateway"
            >
              ®
            </span>
             PRESTIGE APPAREL. ALL LEGACY RESERVED.
          </span>
          <span>CRAFTED BEYOND THE LIMITS OF TIME</span>
        </div>
      </footer>

      {/* 5. MODAL OVERLAY STAGES */}
      <AnimatePresence>
        {/* ADMIN AUTH SECRET LOGIN MODAL */}
        {adminAuthModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md" onClick={() => setAdminAuthModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-neutral-950 border border-luxury-accent/20 max-w-sm w-full p-8 shadow-2xl relative z-10 text-white rounded-sm text-center"
            >
              <button 
                onClick={() => setAdminAuthModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-luxury-accent p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="w-10 h-10 border border-luxury-accent/30 rounded-full flex items-center justify-center text-luxury-accent mb-2">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="font-serif-lux font-bold text-sm tracking-widest text-white uppercase">
                  CREATIVE ACCESS CONTROL
                </h3>
                <p className="text-[10px] text-white/40 font-mono tracking-wider uppercase">
                  SECURE REPOSITORY PIPELINE
                </p>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4 text-left">
                <div>
                  <label className="text-[8px] uppercase font-bold tracking-widest text-white/40 font-mono block mb-1">
                    ADMINISTRATIVE EMAIL
                  </label>
                  <input 
                    type="email" 
                    required
                    value={adminEmail}
                    onChange={(e) => { setAdminEmail(e.target.value); setAdminAuthError(''); }}
                    placeholder="owner@sjyro.com"
                    className="w-full bg-neutral-900 border border-white/10 rounded-sm p-3 text-xs text-white focus:outline-none focus:border-luxury-accent font-sans"
                  />
                </div>

                <div>
                  <label className="text-[8px] uppercase font-bold tracking-widest text-white/40 font-mono block mb-1">
                    ACCESS PASSCODE
                  </label>
                  <input 
                    type="password" 
                    required
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setAdminAuthError(''); }}
                    placeholder="••••••••••••"
                    className="w-full bg-neutral-900 border border-white/10 rounded-sm p-3 text-xs text-white focus:outline-none focus:border-luxury-accent font-sans"
                  />
                </div>

                {adminAuthError && (
                  <div className="text-red-500 text-[9px] font-mono uppercase tracking-wider text-center mt-1">
                    {adminAuthError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-white hover:bg-luxury-accent text-black font-mono text-[10px] font-bold uppercase py-3 tracking-widest mt-2 transition-colors rounded-sm"
                >
                  VERIFY SECURITY SIGNATURE
                </button>
              </form>

              <p className="text-[8px] font-mono text-white/20 mt-6 tracking-wider uppercase">
                PROTECT SYSTEM INTEGRITY • INCIDENTS ARE LOGGED
              </p>
            </motion.div>
          </div>
        )}

        {/* QuickViewModal has been converted to full ProductDetailsPage view */}
      </AnimatePresence>

      <CartDrawer 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => setView('checkout')}
        allProducts={allProducts}
        onQuickView={handleProductClick}
      />

      <SmartSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        allProducts={allProducts}
        onQuickView={handleProductClick}
      />

      {/* PREMIUM SEAMLESS TRANSITION OVERLAY */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="fixed inset-0 bg-white/98 backdrop-blur-md z-[9999] flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-4">
              {/* Spinning luxury loading element */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-black/5 animate-ping" />
                <div className="absolute inset-1 rounded-full border border-black/15 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="font-serif-lux font-bold text-[14px] tracking-[0.3em] pl-1 text-black">S</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="font-serif-lux text-xs tracking-[0.4em] uppercase text-black font-semibold">SJYRO</span>
                <span className="text-[7px] tracking-[0.5em] uppercase text-black/35 font-mono">LOADING PRESTIGE WARDROBE</span>
              </div>
              {/* Subtle accent bar */}
              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent mt-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top floating widget */}
      <AnimatePresence>
        {scrollTopOpen && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-40 bg-black hover:bg-luxury-accent hover:text-black border border-white/10 text-white p-3 shadow-2xl transition-all"
            title="Scroll back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
