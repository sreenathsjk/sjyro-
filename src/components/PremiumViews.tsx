/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, ShieldCheck, Mail, Check, Calendar, Clock, 
  Sparkles, Award, ArrowRight, ArrowLeft, Ruler, Layers, Flame, RefreshCcw 
} from 'lucide-react';
import { Product } from '../types';

interface PremiumViewProps {
  setView: (view: string) => void;
  allProducts?: Product[];
}

/** =========================================================================
 * 1. AESTHETIC ESSENCE VIEW
 * Detailed fabric theory, oversized fit guides, GSM weight explanations, and lookbook images.
 * ========================================================================= */
export function AestheticEssenceView({ setView }: PremiumViewProps) {
  const [selectedGsm, setSelectedGsm] = useState<380 | 440 | 480>(380);
  
  const gsmDetails = {
    380: {
      name: "380 GSM - MID-WEIGHT LOOPBACK",
      feel: "Crisp, breathable structure ideal for year-round layering.",
      drape: "Maintains a structured sleeve stack while allowing moderate fluid movement.",
      bestFor: "Summer evenings, spring transitions, and indoor climate comfort.",
      weave: "100% Cotton French Terry with tight low-tension loop backing."
    },
    440: {
      name: "440 GSM - HEAVYWEIGHT FRENCH TERRY",
      feel: "Dense, reassuring weight that cocoons the body in luxury comfort.",
      drape: "Creates a perfectly boxy upper torso outline and robust dropped shoulder curve.",
      bestFor: "Autumn drops, winter layers, and outdoor wind protection.",
      weave: "Super-combed long-staple cotton fibers, double-brushed face."
    },
    480: {
      name: "480 GSM - EXTREME MONSTER FLEECE",
      feel: "Ultra-dense armor-like weight for uncompromising structural integrity.",
      drape: "Absolute rigid architecture. Zero collapse at the hem; completely stiff silhouette.",
      bestFor: "Limited exhibition items and severe-cold statement wear.",
      weave: "Three-end knit construction with compact fleece interior loft."
    }
  };

  return (
    <div id="aesthetic-essence-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-black bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/[0.05] pb-8 mb-12">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.45em] text-black/40 block mb-2">
            DESIGN MANIFESTO
          </span>
          <h1 className="font-serif-lux font-bold text-3xl sm:text-5xl text-black">
            AESTHETIC ESSENCE
          </h1>
        </div>
        <button 
          onClick={() => setView('shop')}
          className="group text-[10px] uppercase font-bold tracking-widest text-black flex items-center gap-2 font-button-lux hover:text-luxury-accent transition-colors"
        >
          EXPLORE COLLECTIONS <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Grid: Theory Intro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <span className="text-[10px] uppercase font-extrabold tracking-[0.3em] text-luxury-accent font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> THE SILHOUETTE RATIO
          </span>
          <h2 className="font-serif-lux text-2xl sm:text-4xl font-medium tracking-tight text-black leading-tight">
            Heavyweight French Terry Engineering
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans font-light leading-relaxed">
            At SJYRO, garments are not merely designed; they are structurally engineered. A perfect oversized drape requires fabric that fights gravity. By selecting exclusively premium yarns with weights starting at 380GSM, our hoodies and tees maintain their geometric outline without sagging or collapsing at the hem.
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans font-light leading-relaxed">
            Each panel is oversized with calculated proportional scales: dropped shoulders are offset by cropped body lengths, preventing a drowning visual and keeping the silhouette clean, powerful, and modern.
          </p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          <div className="aspect-[3/4] bg-neutral-100 border border-black/5 overflow-hidden rounded-sm relative group">
            <img 
              src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800" 
              alt="Detail 1" 
              className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-750"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 bg-black/95 text-white font-mono text-[8px] tracking-widest uppercase py-1.5 px-2.5">
              440GSM HEAVY COB
            </div>
          </div>
          <div className="aspect-[3/4] bg-neutral-100 border border-black/5 overflow-hidden rounded-sm relative group translate-y-8">
            <img 
              src="https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&q=80&w=800" 
              alt="Detail 2" 
              className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-750"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 bg-black/95 text-white font-mono text-[8px] tracking-widest uppercase py-1.5 px-2.5">
              SHOULDER DROP
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Segment: GSM Weight Selector */}
      <div className="bg-neutral-50 rounded-sm border border-black/[0.04] p-6 sm:p-10 mb-20 mt-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-black/40">INTERACTIVE FABRIC SELECTOR</span>
          <h3 className="font-serif-lux text-xl sm:text-2xl font-bold text-black mt-2">Compare Fabric Weights</h3>
          <p className="text-xs text-neutral-500 font-mono mt-2">Select a GSM weight class to analyze structural draping coefficients.</p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[380, 440, 480].map(gsm => (
            <button
              key={gsm}
              onClick={() => setSelectedGsm(gsm as any)}
              className={`px-5 py-3 text-xs font-bold font-mono tracking-widest transition-all rounded-sm border ${
                selectedGsm === gsm 
                  ? 'bg-black text-white border-black scale-105 shadow-md' 
                  : 'bg-white text-black/60 border-black/10 hover:border-black'
              }`}
            >
              {gsm} GSM
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGsm}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto bg-white p-6 sm:p-8 border border-black/[0.03] rounded-sm shadow-sm"
          >
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-extrabold tracking-widest text-luxury-accent font-mono uppercase">
                {gsmDetails[selectedGsm].name}
              </span>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-black/40 font-mono uppercase">Garment Feel</span>
                <p className="text-xs text-neutral-800">{gsmDetails[selectedGsm].feel}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-black/40 font-mono uppercase">Draping Characteristic</span>
                <p className="text-xs text-neutral-800">{gsmDetails[selectedGsm].drape}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-black/[0.06] pt-4 md:pt-0 md:pl-8">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-black/40 font-mono uppercase">Optimal Seasonal Use</span>
                <p className="text-xs text-neutral-800">{gsmDetails[selectedGsm].bestFor}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-black/40 font-mono uppercase">Yarn Specifications</span>
                <p className="text-xs text-neutral-600 font-mono text-[11px] leading-relaxed">{gsmDetails[selectedGsm].weave}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Aesthetic Call to Action */}
      <div className="border-t border-black/[0.05] pt-12 text-center max-w-xl mx-auto">
        <h4 className="font-serif-lux text-xl font-medium mb-3">Designed with No Expiry</h4>
        <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-mono">
          We reject temporary trends. Every seam is reinforced with double cover-stitching, and necklines are rib-locked to avoid stretching after wash cycles.
        </p>
        <button
          onClick={() => setView('shop')}
          className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] font-bold tracking-widest font-button-lux py-4 px-8 uppercase transition-all duration-300 rounded-sm"
        >
          ACQUIRE PIECES NOW
        </button>
      </div>
    </div>
  );
}


/** =========================================================================
 * 2. VERIFIED COLLECTORS VIEW
 * Testimonials, ratings summary, interactive registry log, and Verification request.
 * ========================================================================= */
export function VerifiedCollectorsView({ setView }: PremiumViewProps) {
  const [activeRegion, setActiveRegion] = useState<'ALL' | 'EUROPE' | 'ASIA' | 'AMERICAS'>('ALL');
  const [claimedCertCode, setClaimedCertCode] = useState('');
  const [claimOrderId, setClaimOrderId] = useState('');
  const [claimEmail, setClaimEmail] = useState('');
  
  const testimonials = [
    {
      id: "1",
      name: "MARCUS K.",
      city: "LONDON",
      region: "EUROPE",
      quote: "SJYRO's oversized hoodie has unmatched weight. The drape is perfectly boxy without gathering at the hem. It feels more substantial and luxurious than any streetwear brand on my rack.",
      itemPurchased: "HEAVYWEIGHT HOODIE v1 - NOIR",
      date: "06/21/2026",
      stars: 5,
    },
    {
      id: "2",
      name: "TAKASHI S.",
      city: "TOKYO",
      region: "ASIA",
      quote: "The loopback terry interior is amazingly soft yet completely heavy. Truly high-end tailoring logic translated into raw streetwear proportions.",
      itemPurchased: "BOX TEE - CREME",
      date: "05/14/2026",
      stars: 5,
    },
    {
      id: "3",
      name: "AUSTIN M.",
      city: "NEW YORK",
      region: "AMERICAS",
      quote: "My third order from SJYRO. The double-layered hood holds its shape perfectly, standing erect on the shoulders. Worth every dollar for collectors who care about shape and posture.",
      itemPurchased: "OVERSIZED HOODIE - SAGE",
      date: "07/02/2026",
      stars: 5,
    },
    {
      id: "4",
      name: "ELENA G.",
      city: "MILAN",
      region: "EUROPE",
      quote: "Excellent, dense weave. Standard shipping was incredibly quick and arrived in premium presentation cardboxes with individual verification seals.",
      itemPurchased: "SIGNATURE ZIP-UP - CHARCOAL",
      date: "04/29/2026",
      stars: 5,
    }
  ];

  const filtered = activeRegion === 'ALL' 
    ? testimonials 
    : testimonials.filter(t => t.region === activeRegion);

  const handleClaimCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimOrderId.trim() || !claimEmail.trim()) return;
    const certCode = `SJYRO-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
    setClaimedCertCode(certCode);
  };

  return (
    <div id="verified-collectors-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-black bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/[0.05] pb-8 mb-12">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.45em] text-black/40 block mb-2">
            GLOBAL FEEDBACK
          </span>
          <h1 className="font-serif-lux font-bold text-3xl sm:text-5xl text-black">
            VERIFIED COLLECTORS
          </h1>
        </div>
        <div className="flex gap-1.5 font-mono text-[10px] uppercase text-black/50">
          <span className="font-bold text-black">100% VERIFIED REGISTRY</span>
          <span>•</span>
          <span>4.9 / 5.0 RATING</span>
        </div>
      </div>

      {/* Interactive Region Filter */}
      <div className="flex justify-center flex-wrap gap-2 mb-12">
        {['ALL', 'EUROPE', 'ASIA', 'AMERICAS'].map(reg => (
          <button
            key={reg}
            onClick={() => setActiveRegion(reg as any)}
            className={`px-4 py-2 text-[10px] font-bold font-mono tracking-widest transition-all rounded-sm border ${
              activeRegion === reg 
                ? 'bg-black text-white border-black scale-105' 
                : 'bg-white text-black/55 border-black/10 hover:border-black'
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Editorial Grid: Quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <AnimatePresence mode="popLayout">
          {filtered.map(t => (
            <motion.div
              layout
              key={t.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 sm:p-10 bg-neutral-50 border border-black/[0.03] rounded-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex text-luxury-accent">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-black/30 tracking-widest uppercase">{t.date}</span>
                </div>
                
                <p className="font-serif-lux text-base sm:text-lg italic text-black/85 leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/[0.04] flex justify-between items-end">
                <div>
                  <h5 className="font-button-lux text-[10px] font-extrabold tracking-widest text-black uppercase">
                    {t.name}
                  </h5>
                  <span className="text-[9px] font-mono text-black/45 tracking-widest uppercase mt-0.5 block">
                    {t.city}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono font-bold bg-white text-black border border-black/10 py-1 px-2 uppercase rounded-sm whitespace-nowrap">
                    {t.itemPurchased}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive Verification Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-black text-white p-8 sm:p-12 rounded-sm border border-white/10 mt-16">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-[9px] font-bold text-luxury-accent tracking-[0.3em] uppercase font-mono flex items-center gap-1.5">
            <Award className="w-4 h-4 text-luxury-accent" /> COLLECTOR AUTHENTICITY CERTIFICATE
          </span>
          <h3 className="font-serif-lux text-2xl sm:text-3xl font-medium tracking-tight">
            Claim Your Digital Ownership Token
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans font-light">
            Each physical SJYRO purchase is registered on our permanent ledger. If you have acquired an authentic garment, enter your Order ID below to generate a digital authentication certificate.
          </p>
          <div className="flex gap-2.5 items-center text-[10px] font-mono text-white/55">
            <ShieldCheck className="w-4 h-4 text-green-400" /> Secure Cryptographic Ledger Verified
          </div>
        </div>

        <div className="lg:col-span-6 bg-neutral-900 border border-white/5 p-6 rounded-sm">
          {!claimedCertCode ? (
            <form onSubmit={handleClaimCertificate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono tracking-widest text-white/50 uppercase">ORDER REFERENCE NUMBER</label>
                <input 
                  type="text" 
                  placeholder="e.g. SJYRO-ORD-849310" 
                  required
                  value={claimOrderId}
                  onChange={(e) => setClaimOrderId(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2.5 px-3.5 text-xs text-white uppercase focus:outline-none focus:border-luxury-accent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono tracking-widest text-white/50 uppercase">COLLECTOR PRIVILEGE EMAIL</label>
                <input 
                  type="email" 
                  placeholder="ENTER SECURE EMAIL" 
                  required
                  value={claimEmail}
                  onChange={(e) => setClaimEmail(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2.5 px-3.5 text-xs text-white uppercase focus:outline-none focus:border-luxury-accent"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-white text-black hover:bg-luxury-accent hover:text-black font-button-lux font-bold tracking-widest text-[10px] py-3.5 uppercase transition-colors rounded-sm"
              >
                REQUEST VERIFICATION
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 bg-luxury-accent/10 rounded-full flex items-center justify-center border border-luxury-accent/30 text-luxury-accent mb-2">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-serif-lux font-bold text-lg text-white">COLLECTOR TOKEN GENERATED</h4>
              <p className="text-[10px] font-mono text-luxury-accent tracking-[0.1em] uppercase">
                CERTIFICATE ID: {claimedCertCode}
              </p>
              <p className="text-xs text-white/60 font-sans max-w-xs leading-relaxed">
                The cryptographic proof has been successfully assigned to <span className="font-bold text-white">{claimEmail.toUpperCase()}</span>. Present this certificate when participating in upcoming limited drop reservations.
              </p>
              <button 
                onClick={() => { setClaimedCertCode(''); setClaimOrderId(''); setClaimEmail(''); }}
                className="mt-4 text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white transition-all pb-0.5"
              >
                GENERATE ANOTHER CERTIFICATE
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


/** =========================================================================
 * 3. PRESTIGE CIRCLE VIEW
 * Exclusive registration, remaining ledger spots, Drop calendar, countdown simulation.
 * ========================================================================= */
export function PrestigeCircleView({ setView }: PremiumViewProps) {
  const [emailInput, setEmailInput] = useState('');
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [vipCode, setVipCode] = useState('');
  const [ledgerSpots, setLedgerSpots] = useState(148);

  useEffect(() => {
    // Simulate periodic reduction in remaining slots to drive urgency
    const interval = setInterval(() => {
      setLedgerSpots(prev => (prev > 12 ? prev - Math.floor(Math.random() * 2) : prev));
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    // Generate a luxury-styled code
    const generatedVipCode = `SJYRO-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    setVipCode(generatedVipCode);
    setHasSubscribed(true);
    setLedgerSpots(prev => Math.max(prev - 1, 11));
  };

  const upcomingDrops = [
    {
      id: "drop-1",
      name: "ARCHIVE III: COMBI-ZIP SERIES",
      date: "OCTOBER 15, 2026",
      details: "Two-way heavy silver zippers fitted onto 440GSM loopbacks. Completely stiff cuffs.",
      status: "RESERVATIONS READY",
    },
    {
      id: "drop-2",
      name: "COLLAB 04: TOKYO UNDERGROUNDS",
      date: "NOVEMBER 28, 2026",
      details: "Collaborative prints celebrating distressed heavyweight textures and raw seams.",
      status: "VIP MEMBERS ONLY",
    }
  ];

  return (
    <div id="prestige-circle-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-black bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-black/[0.05] pb-8 mb-12">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.45em] text-black/40 block mb-2">
            INNER CHRONICLES
          </span>
          <h1 className="font-serif-lux font-bold text-3xl sm:text-5xl text-black">
            PRESTIGE CIRCLE
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-mono uppercase bg-red-50 text-red-600 border border-red-200 py-1.5 px-3 inline-flex items-center gap-1.5 font-bold tracking-widest rounded-sm animate-pulse">
            <Clock className="w-3.5 h-3.5 animate-spin-slow" /> {ledgerSpots} REGISTRATION SLOTS LEFT
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Section: Access benefits & registration form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <span className="text-[10px] font-bold tracking-[0.3em] text-luxury-accent uppercase font-mono">
            PRIVILEGE REGISTRATION
          </span>
          <h2 className="font-serif-lux text-2xl sm:text-4xl font-medium tracking-tight leading-tight">
            Exclusive Priority Tickers & Private Drops
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans font-light">
            The Prestige Circle represents the core list of registered collectors for the SJYRO house. Members receive direct alerts before collections go live to the general public, private reservation codes, and a lifetime ledger profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6">
            <div className="p-5 bg-neutral-50 rounded-sm border border-black/[0.03]">
              <span className="text-[9px] font-mono tracking-widest text-black/40 uppercase font-bold block mb-1">01. Priority Res</span>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                Secure limited garment inventory 4 hours before the general website unlocks.
              </p>
            </div>
            <div className="p-5 bg-neutral-50 rounded-sm border border-black/[0.03]">
              <span className="text-[9px] font-mono tracking-widest text-black/40 uppercase font-bold block mb-1">02. Archives Access</span>
              <p className="text-xs text-neutral-600 leading-relaxed font-light">
                Unlock custom bespoke commissions and archival restorations of vintage seasons.
              </p>
            </div>
          </div>

          {/* Interactive Form card */}
          <div className="bg-neutral-50 p-6 sm:p-8 rounded-sm border border-black/[0.04]">
            {!hasSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-black/50 font-bold">
                  Enter your privilege email to claim active membership:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35" />
                    <input 
                      type="email" 
                      required
                      placeholder="ENTER VIP EMAIL ADDRESS" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-sm py-3.5 pl-10 pr-3.5 text-xs text-black uppercase focus:outline-none focus:border-black font-mono tracking-wider"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] font-bold font-button-lux py-4 px-8 tracking-widest uppercase transition-colors rounded-sm whitespace-nowrap"
                  >
                    SECURE INVITATION
                  </button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 flex flex-col items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border border-green-200 text-green-600 mb-1">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-serif-lux font-bold text-lg text-black">REGISTRATION SECURED</h4>
                <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                  Welcome to the SJYRO Inner Circle. Your luxury collector profile is officially logged on our verification database.
                </p>
                <div className="p-3 bg-white border border-black/[0.05] rounded-sm text-center font-mono mt-2">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 block mb-1">YOUR EXCLUSIVE ACCESS CODE:</span>
                  <span className="text-sm font-extrabold tracking-widest text-luxury-gold">{vipCode}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Section: Drop calendar & status tickers */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <span className="text-[10px] font-bold tracking-[0.3em] text-black/40 uppercase font-mono">
            DROP SCHEDULE
          </span>
          <div className="flex flex-col gap-4">
            {upcomingDrops.map(drop => (
              <div 
                key={drop.id}
                className="p-6 bg-neutral-900 text-white rounded-sm border border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-luxury-accent text-black font-mono text-[8px] font-extrabold px-2.5 py-1 uppercase tracking-wider rounded-bl-sm">
                  {drop.status}
                </div>

                <div className="flex items-center gap-1.5 text-luxury-accent font-mono text-[9px] font-semibold uppercase tracking-widest mb-3">
                  <Calendar className="w-3.5 h-3.5" /> {drop.date}
                </div>

                <h4 className="font-serif-lux font-medium text-lg leading-snug mb-2 text-white">
                  {drop.name}
                </h4>

                <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                  {drop.details}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-neutral-50 p-6 rounded-sm border border-black/[0.03] text-center">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-black block mb-2 font-button-lux">NEED SARTORIAL ADVICE?</span>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-light mb-4">
              Connect with an on-demand premium wardrobe consultant directly to discuss custom fittings and limited-edition inventory.
            </p>
            <button 
              onClick={() => setView('shop')}
              className="text-[9px] font-bold tracking-widest text-black uppercase font-mono border-b-2 border-black hover:text-luxury-accent hover:border-luxury-accent transition-colors pb-1"
            >
              TALK TO STYLIST AGENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
