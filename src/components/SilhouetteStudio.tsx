/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  Eye, 
  ShoppingBag, 
  Check, 
  Layers, 
  Compass, 
  Maximize2, 
  Info, 
  Sun, 
  Moon, 
  Flame, 
  Ruler
} from 'lucide-react';
import { Product } from '../types';

interface SilhouetteStudioProps {
  onBack: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  allProducts: Product[];
  initialProductId?: string | null;
}

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  applicableAngles: number[]; // which angles (0-7) this hotspot is visible on
}

export default function SilhouetteStudio({ onBack, onAddToCart, allProducts, initialProductId }: SilhouetteStudioProps) {
  // Extract only premium items that support 360 inspection
  const premiumProducts = allProducts.filter(p => 
    p.id === 'sjyro-h01' || p.id === 'sjyro-h02' || p.id === 'sjyro-t01'
  );

  // Fallback to any products if database is not loaded yet
  const activeProducts = premiumProducts.length > 0 ? premiumProducts : allProducts.slice(0, 3);

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [angle, setAngle] = useState(0); // 0 to 7 representing 45 deg intervals (total 8 frames)
  const [isPlaying, setIsPlaying] = useState(true);
  const [lighting, setLighting] = useState<'minimal' | 'atelier' | 'noir'>('atelier');
  const [zoomFactor, setZoomFactor] = useState<1 | 1.5 | 2>(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isRotatingManually, setIsRotatingManually] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize selected product
  useEffect(() => {
    if (activeProducts.length > 0) {
      if (initialProductId) {
        const found = activeProducts.find(p => p.id === initialProductId);
        if (found) {
          setActiveProduct(found);
          return;
        }
      }
      if (!activeProduct) {
        setActiveProduct(activeProducts[0]);
      }
    }
  }, [activeProducts, activeProduct, initialProductId]);

  // Set default color when product changes
  useEffect(() => {
    if (activeProduct) {
      setSelectedColor(activeProduct.colors[0]);
      setSelectedSize(activeProduct.sizes[0] || 'M');
    }
  }, [activeProduct]);

  // Handle Auto Rotation Timer
  useEffect(() => {
    if (isPlaying && !isRotatingManually) {
      timerRef.current = setInterval(() => {
        setAngle(prev => (prev + 1) % 8);
      }, 1800);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isRotatingManually]);

  if (!activeProduct) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center font-sans">
        <div className="text-center flex flex-col items-center gap-4">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-accent" />
          <p className="text-xs uppercase tracking-widest font-bold text-white/50">Initialising 360° Rendering Stage...</p>
        </div>
      </div>
    );
  }

  // Multi-angle frames configuration using gorgeous premium matching URLs
  const productFrames: Record<string, string[]> = {
    'sjyro-h01': [
      // White Krishna Chariot Hoodie
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200', // 0: Front
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200', // 1: Front-Right
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200&sat=-100', // 2: Side-Right
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200', // 3: Back-Right
      activeProduct.images[0] || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200', // 4: Back (Krishna Graphic)
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200', // 5: Back-Left
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200', // 6: Side-Left
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200'  // 7: Front-Left
    ],
    'sjyro-h02': [
      // Black VK18 Hoodie
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200', // 0: Front
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200', // 1: Front-Right
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1200', // 2: Side-Right
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1200', // 3: Back-Right
      activeProduct.images[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200', // 4: Back (VK18 Graphic)
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1200', // 5: Back-Left
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200', // 6: Side-Left
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200'  // 7: Front-Left
    ],
    'sjyro-t01': [
      // Black Greek Bust Tee
      activeProduct.images[0] || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1200', // 0: Front (Greek Bust Print)
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1200', // 1: Front-Right
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200', // 2: Side-Right
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200', // 3: Back-Right
      activeProduct.images[1] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200', // 4: Back view
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200', // 5: Back-Left
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1200', // 6: Side-Left
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1200'  // 7: Front-Left
    ]
  };

  const frames = productFrames[activeProduct.id] || [
    activeProduct.images[0],
    activeProduct.images[1] || activeProduct.images[0],
    activeProduct.images[0],
    activeProduct.images[1] || activeProduct.images[0],
    activeProduct.images[0],
    activeProduct.images[1] || activeProduct.images[0],
    activeProduct.images[0],
    activeProduct.images[1] || activeProduct.images[0]
  ];

  // Hotspots overlay configurations (changes dynamically per angle)
  const productHotspots: Record<string, Hotspot[]> = {
    'sjyro-h01': [
      {
        id: 'hs-shoulder',
        x: 35,
        y: 28,
        title: 'Architectural Drop Shoulder',
        description: 'Dropped seam structure creates a relaxed boxy drape that flatters any posture and holds its signature structural shape.',
        applicableAngles: [0, 1, 6, 7]
      },
      {
        id: 'hs-neck',
        x: 50,
        y: 20,
        title: 'Snug Double-Lined Hood',
        description: 'Deep double-lined hood engineered without drawstrings to keep a pristine, clean aesthetic across the collarbone.',
        applicableAngles: [0, 1, 2, 6, 7]
      },
      {
        id: 'hs-fabric',
        x: 50,
        y: 55,
        title: '480GSM French Terry Cotton',
        description: 'Incredibly thick custom-milled loopback organic cotton. Gives a luxurious weight and highly dense architectural drape.',
        applicableAngles: [0, 1, 2, 3, 5, 6, 7]
      },
      {
        id: 'hs-graphic',
        x: 50,
        y: 45,
        title: 'Mahabharata Divine Back Art',
        description: 'Super-premium high-definition direct-to-film graphic print of Lord Krishna on his golden chariot. Intricate details, cracking-resistant ink.',
        applicableAngles: [3, 4, 5]
      }
    ],
    'sjyro-h02': [
      {
        id: 'hs-vk',
        x: 50,
        y: 42,
        title: 'VK18 Tribute Graphic',
        description: 'Minimalist white high-contrast back print of Jersey "18" alongside cricketer profile silhouette and signature script script detail.',
        applicableAngles: [3, 4, 5]
      },
      {
        id: 'hs-cuffs',
        x: 25,
        y: 78,
        title: 'Heavyweight Ribbed Cuffs',
        description: 'Double-needle stitched elastic ribbing around wrist cuffs and waistline hem designed to resist stretching or sagging.',
        applicableAngles: [0, 1, 2, 6, 7]
      },
      {
        id: 'hs-front',
        x: 50,
        y: 50,
        title: 'Pristine Clean Chest',
        description: 'Uncluttered frontal canvas allowing the premium 480GSM double-brushed French Terry drape to shine with understated luxury.',
        applicableAngles: [0, 1, 7]
      }
    ],
    'sjyro-t01': [
      {
        id: 'hs-bust',
        x: 50,
        y: 45,
        title: 'High-Density Greek Bust Print',
        description: 'Classical Greek statue juxtaposed with modern Japanese typography and a paint stroke. Layered silicone-washed feel.',
        applicableAngles: [0, 1, 6, 7]
      },
      {
        id: 'hs-mockneck',
        x: 50,
        y: 18,
        title: 'Snug Mockneck Trim',
        description: 'Thick, high ribbed mockneck collar that sits snug against the throat. Keeps its structured shape through endless wash cycles.',
        applicableAngles: [0, 1, 2, 6, 7]
      },
      {
        id: 'hs-tee-fabric',
        x: 48,
        y: 65,
        title: '280GSM Luxury Cotton',
        description: 'Heavyweight combed ring-spun cotton fabric treated with custom silicone softeners for a flawless vintage-matte aesthetic.',
        applicableAngles: [0, 1, 2, 3, 4, 5, 6, 7]
      }
    ]
  };

  const hotspots = productHotspots[activeProduct.id] || [];
  const currentHotspots = hotspots.filter(h => h.applicableAngles.includes(angle));

  // Drag interaction math
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    setIsRotatingManually(true);
    dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX.current;
    
    // Rotate 1 frame (45 degrees) per 18px horizontal dragging
    if (Math.abs(deltaX) > 18) {
      const step = deltaX > 0 ? -1 : 1;
      setAngle(prev => (prev + step + 8) % 8);
      dragStartX.current = clientX;
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    // Keep it paused after manual rotation for easier inspection, unless play is toggled
  };

  const handleAddToCart = () => {
    if (!selectedColor) return;
    onAddToCart(activeProduct, selectedSize, selectedColor.name);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  // Environment styling helper
  const getAmbientBg = () => {
    switch (lighting) {
      case 'atelier':
        return 'bg-gradient-to-b from-[#1C1A17] via-[#0E0E0D] to-[#0A0A0A] border-amber-950/10';
      case 'noir':
        return 'bg-gradient-to-b from-[#0A0B0E] via-[#050507] to-[#010102] border-blue-950/10';
      case 'minimal':
      default:
        return 'bg-gradient-to-b from-[#1F1F1F] via-[#121212] to-[#0A0A0A] border-neutral-800/10';
    }
  };

  const getTurntablePlate = () => {
    switch (lighting) {
      case 'atelier':
        return 'bg-gradient-to-r from-amber-900/10 via-amber-600/5 to-amber-950/20 border-amber-500/20 shadow-[0_15px_40px_rgba(212,175,55,0.06)]';
      case 'noir':
        return 'bg-gradient-to-r from-red-950/15 via-black to-blue-950/20 border-red-900/20 shadow-[0_15px_40px_rgba(239,68,68,0.05)]';
      case 'minimal':
      default:
        return 'bg-gradient-to-r from-neutral-800/20 via-neutral-900/10 to-neutral-950/30 border-neutral-700/30 shadow-[0_15px_40px_rgba(255,255,255,0.02)]';
    }
  };

  const getGlowShadow = () => {
    switch (lighting) {
      case 'atelier':
        return 'shadow-[0_0_100px_rgba(212,175,55,0.03)]';
      case 'noir':
        return 'shadow-[0_0_100px_rgba(239,68,68,0.03)]';
      case 'minimal':
      default:
        return 'shadow-none';
    }
  };

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-luxury-accent selection:text-black">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* BACK TO PORTAL HEADING */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.04] pb-6">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-luxury-accent font-button">
                SARTORIAL IMMERSION CHAMBER
              </span>
              <h1 className="font-serif-lux text-2xl sm:text-3xl font-semibold tracking-wide text-white mt-1 uppercase">
                360° SILHOUETTE STUDIO
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest bg-white/5 border border-white/5 px-3 py-1.5 rounded-sm">
            <Compass className="w-3.5 h-3.5 text-luxury-accent animate-spin-slow" /> Virtual Turntable Live
          </div>
        </div>

        {/* MAIN STUDIO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Garment Directory Selector (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-5 order-2 lg:order-1">
            <div className="bg-neutral-950/80 border border-white/[0.04] p-5 rounded-sm flex flex-col gap-4">
              <h3 className="font-serif-lux font-bold text-sm tracking-wider uppercase text-white/90 pb-2 border-b border-white/[0.04]">
                Select Garment
              </h3>
              <div className="flex flex-col gap-3">
                {activeProducts.map(prod => {
                  const isSelected = activeProduct.id === prod.id;
                  return (
                    <button 
                      key={prod.id}
                      onClick={() => {
                        setActiveProduct(prod);
                        setActiveHotspot(null);
                        setAngle(0);
                      }}
                      className={`text-left p-3.5 rounded-sm border transition-all flex items-center gap-3.5 ${
                        isSelected 
                          ? 'bg-white/5 border-luxury-accent shadow-[0_0_15px_rgba(212,175,55,0.08)]' 
                          : 'border-white/[0.03] hover:border-white/20 hover:bg-white/[0.01]'
                      }`}
                    >
                      <img 
                        src={prod.images[0]} 
                        alt={prod.name} 
                        className="w-12 h-14 object-cover border border-white/10 rounded-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow min-w-0">
                        <span className="text-[9px] font-mono text-luxury-accent uppercase tracking-widest block font-bold mb-0.5">
                          {prod.category}
                        </span>
                        <p className={`text-[11px] font-medium leading-tight truncate ${isSelected ? 'text-white' : 'text-white/60'}`}>
                          {prod.name}
                        </p>
                        <p className="text-[10px] font-mono text-white/40 mt-1">${prod.price}.00</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STUDIO AMBIENT LIGHTING OPTIONS */}
            <div className="bg-neutral-950/80 border border-white/[0.04] p-5 rounded-sm flex flex-col gap-4">
              <h3 className="font-serif-lux font-bold text-sm tracking-wider uppercase text-white/90 pb-2 border-b border-white/[0.04]">
                Chamber Lighting
              </h3>
              <div className="grid grid-cols-3 gap-2 text-[9px] font-mono uppercase tracking-widest font-bold">
                <button 
                  onClick={() => setLighting('atelier')}
                  className={`p-3 rounded-sm border flex flex-col items-center gap-2 transition-all ${
                    lighting === 'atelier' 
                      ? 'border-amber-500/50 bg-amber-500/5 text-amber-300' 
                      : 'border-white/[0.03] hover:border-white/20 text-white/40'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  Atelier
                </button>
                <button 
                  onClick={() => setLighting('noir')}
                  className={`p-3 rounded-sm border flex flex-col items-center gap-2 transition-all ${
                    lighting === 'noir' 
                      ? 'border-red-500/50 bg-red-500/5 text-red-300' 
                      : 'border-white/[0.03] hover:border-white/20 text-white/40'
                  }`}
                >
                  <Moon className="w-4 h-4 text-red-500" />
                  Cyber Noir
                </button>
                <button 
                  onClick={() => setLighting('minimal')}
                  className={`p-3 rounded-sm border flex flex-col items-center gap-2 transition-all ${
                    lighting === 'minimal' 
                      ? 'border-neutral-500/50 bg-neutral-500/5 text-neutral-300' 
                      : 'border-white/[0.03] hover:border-white/20 text-white/40'
                  }`}
                >
                  <Sun className="w-4 h-4 text-neutral-400" />
                  Minimalist
                </button>
              </div>
            </div>

            {/* CONTROLS GUIDE PANEL */}
            <div className="bg-neutral-950/80 border border-white/[0.04] p-5 rounded-sm text-xs text-white/50 leading-relaxed font-sans flex flex-col gap-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-white/70 font-mono">Turntable Controls</h4>
              <p className="text-[11px]">
                • <strong className="text-white/80">Manual Swipe / Drag:</strong> Drag anywhere on the main garment stage horizontally to manually spin the model and inspect drape lines.
              </p>
              <p className="text-[11px]">
                • <strong className="text-white/80">Interactive Hotspots:</strong> Pulse rings mark architectural sewing points. Hover or tap to expand detailed fabrication briefs.
              </p>
            </div>
          </div>

          {/* CENTER COLUMN: The Holographic 360 Stage (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4 order-1 lg:order-2">
            <div className={`relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-sm border overflow-hidden flex flex-col justify-between p-6 transition-all duration-700 ${getAmbientBg()}`}>
              
              {/* Stage lighting backdrop glows */}
              <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${getGlowShadow()}`} />

              {/* TOP STRIP Controls */}
              <div className="relative z-10 flex justify-between items-center w-full">
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  Angle Index: {(angle * 45)}° / 360°
                </span>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className={`p-2 rounded-sm border transition-all text-[9px] font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                      showAnalysis ? 'border-luxury-accent bg-luxury-accent/5 text-luxury-accent' : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                    title="Toggle blueprint analysis lines"
                  >
                    <Layers className="w-3.5 h-3.5" /> Specs Analysis
                  </button>

                  <div className="flex rounded-sm overflow-hidden border border-white/10">
                    {([1, 1.5, 2] as const).map(z => (
                      <button
                        key={z}
                        onClick={() => setZoomFactor(z)}
                        className={`px-2.5 py-1 text-[9px] font-mono tracking-widest transition-colors ${
                          zoomFactor === z ? 'bg-white text-black font-bold' : 'bg-black/30 text-white/40 hover:text-white/80'
                        }`}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CORE RENDERING STAGE: Heavy draping item centering */}
              <div 
                className="relative flex-grow flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                {/* Turntable Floor pedestal */}
                <div className="absolute bottom-10 w-72 sm:w-80 h-10 rounded-full flex flex-col justify-center items-center pointer-events-none">
                  <div className={`w-full h-full rounded-full border border-b-2 transition-all duration-700 transform rotate-x-60 ${getTurntablePlate()}`} />
                  <div className="w-[85%] h-[85%] rounded-full border border-white/5 bg-black/40 blur-[2px] transform rotate-x-60 -translate-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)]" />
                </div>

                {/* THE MAIN ACTIVE GARMENT IMAGE COMPONENT */}
                <div className="relative w-full max-h-[72%] flex items-center justify-center transition-all duration-300">
                  <motion.div
                    key={angle}
                    initial={{ opacity: 0.95 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{ 
                      transform: `scale(${zoomFactor})`,
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="relative w-full flex justify-center max-h-[380px] pointer-events-none"
                  >
                    <img 
                      src={frames[angle]} 
                      alt={`${activeProduct.name} 360 degree rotatable preview angle ${angle}`}
                      className="max-h-[380px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)]"
                      referrerPolicy="no-referrer"
                    />

                    {/* Interactive Blueprint Measurement Alignment Lines Overlay */}
                    {showAnalysis && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        {/* Shoulder Drop Guide */}
                        {angle !== 4 && (
                          <>
                            <line x1="28%" y1="28%" x2="72%" y2="28%" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
                            <circle cx="28%" cy="28%" r="2" fill="#D4AF37" />
                            <circle cx="72%" cy="28%" r="2" fill="#D4AF37" />
                            <text x="50%" y="24%" fill="rgba(212,175,55,0.7)" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">
                              DROP SHOULDER ALIGNMENT
                            </text>
                          </>
                        )}
                        {/* Hip Hem ribbing guide */}
                        <line x1="33%" y1="92%" x2="67%" y2="92%" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="1" />
                        <circle cx="50%" cy="92%" r="2" fill="#D4AF37" />
                        <text x="50%" y="96%" fill="rgba(212,175,55,0.7)" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
                          HEM REINFORCED STITCH-LINE
                        </text>
                      </svg>
                    )}
                  </motion.div>

                  {/* Hotspots layer (rendered on top) */}
                  <AnimatePresence>
                    {showAnalysis && currentHotspots.map(hs => (
                      <div 
                        key={hs.id}
                        className="absolute z-20"
                        style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                      >
                        {/* Pulse Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHotspot(activeHotspot === hs.id ? null : hs.id);
                          }}
                          className="group relative flex items-center justify-center w-5 h-5"
                          title={`Click to analyze ${hs.title}`}
                        >
                          <span className="absolute inline-flex h-full w-full rounded-full bg-luxury-accent/30 animate-ping" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-luxury-accent border border-white/60 shadow-[0_0_8px_#D4AF37]" />
                        </button>

                        {/* Hotspot detail popup */}
                        {activeHotspot === hs.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute z-30 bottom-7 -left-28 w-56 bg-neutral-950/95 border border-luxury-accent/30 p-3 shadow-2xl backdrop-blur-md rounded-sm text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-start mb-1.5 border-b border-white/10 pb-1">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-luxury-accent font-mono flex items-center gap-1">
                                <Info className="w-3 h-3" /> ANALYTICAL SPEC
                              </span>
                              <button 
                                onClick={() => setActiveHotspot(null)}
                                className="text-white/40 hover:text-white text-[9px] font-mono uppercase"
                              >
                                close
                              </button>
                            </div>
                            <h4 className="text-[11px] font-bold text-white font-serif-lux leading-snug">{hs.title}</h4>
                            <p className="text-[10px] text-white/60 font-sans leading-normal mt-1">{hs.description}</p>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* BOTTOM CONTROL DIAL STRIP */}
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center w-full gap-4 pt-4 border-t border-white/[0.04] bg-black/10 backdrop-blur-xs p-3 rounded-sm">
                
                {/* Turntable state togglers */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      setIsRotatingManually(false);
                    }}
                    className={`p-2.5 rounded-full border transition-all hover:scale-105 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest ${
                      isPlaying 
                        ? 'border-luxury-accent/30 bg-luxury-accent/10 text-luxury-accent' 
                        : 'border-white/10 text-white/50 hover:border-white/30'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" /> Pausable Spin
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Auto Turn
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setAngle(0);
                      setIsPlaying(false);
                      setActiveHotspot(null);
                    }}
                    className="p-2.5 rounded-full border border-white/10 hover:border-white text-white/50 hover:text-white transition-all hover:scale-105"
                    title="Reset to Front angle"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Circular angle gauge slider simulation */}
                <div className="flex items-center gap-3 w-full sm:w-auto max-w-xs flex-grow">
                  <span className="text-[9px] font-mono text-white/30">0°</span>
                  <input 
                    type="range"
                    min="0"
                    max="7"
                    value={angle}
                    onChange={(e) => {
                      setAngle(parseInt(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="flex-grow accent-luxury-accent h-1 bg-white/10 rounded-lg cursor-pointer transition-all"
                  />
                  <span className="text-[9px] font-mono text-white/30">360°</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real Specifications, Color, Size, Sizing Guides & Checkout (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-3">
            <div className="bg-neutral-950/80 border border-white/[0.04] p-6 rounded-sm flex flex-col justify-between h-full">
              
              {/* Product Header */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-luxury-accent font-mono block mb-1">
                  {activeProduct.category}
                </span>
                <h2 className="font-serif-lux font-medium text-xl text-white tracking-wide leading-snug">
                  {activeProduct.name}
                </h2>

                <div className="flex items-baseline gap-2.5 mt-3 pb-4 border-b border-white/[0.04]">
                  <p className="font-serif text-white text-xl font-bold">${activeProduct.price}.00</p>
                  {activeProduct.originalPrice && (
                    <p className="font-serif text-white/35 text-xs line-through">${activeProduct.originalPrice}.00</p>
                  )}
                </div>

                {/* Short descriptions */}
                <p className="text-xs text-white/60 leading-relaxed font-sans mt-4">
                  {activeProduct.description}
                </p>

                {/* Technical loop details */}
                <div className="mt-5 flex flex-col gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-sm">
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span>Fabric Blend:</span>
                    <span className="text-white/70">100% Cotton</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span>Yarn Density:</span>
                    <span className="text-white/70">Heavyweight {activeProduct.id === 'sjyro-t01' ? '280GSM' : '480GSM'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span>Fitting Concept:</span>
                    <span className="text-white/70">Architectural Slouch</span>
                  </div>
                </div>

                {/* COLOR SELECTION */}
                {selectedColor && (
                  <div className="mt-6">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-mono block mb-2.5">
                      Selected Trim: {selectedColor.name}
                    </span>
                    <div className="flex gap-2">
                      {activeProduct.colors.map(color => (
                        <button 
                          key={color.name}
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            selectedColor.name === color.name ? 'border-luxury-accent ring-2 ring-luxury-accent/30 scale-105' : 'border-white/10 hover:border-white/30'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* SIZE SELECTION */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-mono">
                      Silhouette Size: {selectedSize}
                    </span>
                    <button 
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[9px] text-luxury-accent hover:underline flex items-center gap-1 font-mono uppercase font-bold"
                    >
                      <Ruler className="w-3 h-3" /> Chart
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {activeProduct.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-9 h-9 border text-[10px] font-mono font-bold transition-all rounded-sm ${
                          selectedSize === size 
                            ? 'bg-luxury-accent text-black border-luxury-accent scale-105' 
                            : 'border-white/10 hover:border-white text-white/60 hover:text-white bg-white/[0.01]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* QUICK ADD TO CART ACTION */}
              <div className="mt-8 pt-5 border-t border-white/[0.04]">
                <button 
                  onClick={handleAddToCart}
                  disabled={activeProduct.stock === 0}
                  className="w-full bg-white hover:bg-luxury-accent text-black hover:text-black font-button text-[11px] font-bold uppercase py-4 tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-green-700 fill-current" /> EXPEDITE RESERVATION ADDED
                    </>
                  ) : activeProduct.stock === 0 ? (
                    'SOLD OUT'
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> SECURE PIECE RESERVATION
                    </>
                  )}
                </button>
                <p className="text-[9px] font-mono text-center text-white/30 mt-3 uppercase tracking-wider">
                  Guaranteed COD & Complimentary Shipping
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* SIZING CHART MODAL OVERLAY */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0D0D] border border-white/10 max-w-md w-full p-6 shadow-2xl relative z-10 rounded-sm text-white"
            >
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-luxury-accent p-1"
              >
                close
              </button>
              <h3 className="font-serif-lux font-bold text-lg mb-4 text-white border-b border-white/10 pb-2">
                STUDIO MEASUREMENTS SPEC
              </h3>
              <p className="text-[11px] text-white/60 mb-4 leading-relaxed font-sans">
                SJYRO streetwear is designed intentionally boxy and heavy. Pick your actual measurement sizing for a glorious drape, or step down one unit for an fitted line.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-white/5 text-luxury-accent border-b border-white/10">
                      <th className="p-2.5">SIZE</th>
                      <th className="p-2.5">CHEST (in)</th>
                      <th className="p-2.5">LENGTH (in)</th>
                      <th className="p-2.5">SLEEVE (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-white/80">
                    <tr>
                      <td className="p-2.5 font-bold text-luxury-accent">S</td>
                      <td className="p-2.5">46</td>
                      <td className="p-2.5">26.5</td>
                      <td className="p-2.5">23</td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="p-2.5 font-bold text-luxury-accent">M</td>
                      <td className="p-2.5">48</td>
                      <td className="p-2.5">27.5</td>
                      <td className="p-2.5">24</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-luxury-accent">L</td>
                      <td className="p-2.5">50</td>
                      <td className="p-2.5">28.5</td>
                      <td className="p-2.5">25</td>
                    </tr>
                    <tr className="bg-white/[0.01]">
                      <td className="p-2.5 font-bold text-luxury-accent">XL</td>
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
