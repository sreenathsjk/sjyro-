/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mic, MicOff, X, Sparkles, Star, ChevronRight, CornerDownRight, History, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/currency';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 15 }
  }
};

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onQuickView: (product: Product) => void;
}

export default function SmartSearch({ isOpen, onClose, allProducts, onQuickView }: SmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [smartResult, setSmartResult] = useState<{ productIds: string[]; reason: string; styleTip: string } | null>(null);
  const [searchingAI, setSearchingAI] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  
  // Simulated historic searches
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'oversized heavy black hoodie',
    'minimalist korean streetwear look',
    'limited edition printed shirt'
  ]);

  // Suggestions list
  const trendingSuggestions = [
    'heavyweight 480GSM French Terry',
    'distressed Japanese denim',
    'DTF printed cyberpunk aesthetics',
    'combed ring-spun cotton white tee'
  ];

  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for genuine Voice Search integration
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setVoiceActive(true);
        setVoiceStatus('Listening for your voice...');
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceStatus(`Voice Error: ${event.error}`);
        setVoiceActive(false);
      };

      rec.onend = () => {
        setVoiceActive(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleAISTylingSearch(transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const triggerVoiceSearch = () => {
    if (!recognitionRef.current) {
      // Simulate speech search if browser doesn't support the SpeechRecognition API
      setVoiceActive(true);
      setVoiceStatus('Simulating speech recognition...');
      setTimeout(() => {
        const sampleVoiceQueries = [
          'something warm for london rain',
          'oversized black heavyweight streetwear'
        ];
        const randomQuery = sampleVoiceQueries[Math.floor(Math.random() * sampleVoiceQueries.length)];
        setSearchQuery(randomQuery);
        setVoiceActive(false);
        handleAISTylingSearch(randomQuery);
      }, 2000);
      return;
    }

    if (voiceActive) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleAISTylingSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setSearchingAI(true);
    setSmartResult(null);

    // Save to historic searches
    if (!recentSearches.includes(queryToSearch)) {
      setRecentSearches(prev => [queryToSearch, ...prev.slice(0, 4)]);
    }

    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch })
      });
      if (res.ok) {
        const data = await res.json();
        setSmartResult(data);
      }
    } catch (err) {
      console.error('Stylist search error:', err);
    } finally {
      setSearchingAI(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSmartResult(null);
  };

  // Filter products matching IDs in the smart stylist recommendation
  const matchedProducts = smartResult 
    ? allProducts.filter(p => smartResult.productIds.includes(p.id))
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-start justify-center p-4 pt-10 sm:pt-20">
          {/* Dark backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Core Panel Content */}
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-white w-full max-w-2xl shadow-2xl rounded-sm z-10 overflow-hidden border border-black/10 flex flex-col max-h-[85vh]"
          >
            {/* Upper Stage: Input Bar */}
            <div className="p-4 sm:p-5 border-b border-black/5 bg-neutral-50 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-luxury-accent animate-pulse flex-shrink-0" />
              
              <div className="relative flex-grow">
                <input 
                  type="text"
                  placeholder="Ask our AI Stylist (e.g. 'heavy baggy outfits for winter')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAISTylingSearch(searchQuery)}
                  className="w-full bg-white border border-black/10 rounded-sm py-3 pl-4 pr-12 text-xs sm:text-sm font-sans focus:outline-none focus:border-luxury-accent tracking-wide"
                  autoFocus
                />
                
                {searchQuery && (
                  <button 
                    onClick={handleClear}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-black/30 hover:text-black p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                {/* Voice Search Button */}
                <button 
                  onClick={triggerVoiceSearch}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full border transition-all ${
                    voiceActive 
                      ? 'bg-red-500 text-white border-red-500 scale-110 animate-ping' 
                      : 'bg-neutral-100 text-black/50 border-transparent hover:text-black hover:border-black/20'
                  }`}
                  title="Voice Search"
                >
                  {voiceActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button 
                onClick={() => handleAISTylingSearch(searchQuery)}
                disabled={searchingAI}
                className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] font-bold font-button-lux px-4 py-3.5 tracking-widest uppercase transition-colors"
              >
                ASK
              </button>
            </div>

            {/* Voice Listener Status */}
            {voiceActive && (
              <div className="bg-red-50 p-2.5 text-center text-red-600 font-mono text-[10px] tracking-widest uppercase border-b border-red-100 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> {voiceStatus}
              </div>
            )}

            {/* Lower Stage: Search details / Results */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6">
              {searchingAI && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <Sparkles className="w-10 h-10 text-luxury-accent animate-spin-slow" />
                    <span className="absolute inset-0 border border-luxury-accent/30 rounded-full scale-150 animate-pulse" />
                  </div>
                  <h4 className="font-serif-lux font-medium text-base mb-1">Consulting Creative Director AI...</h4>
                  <p className="text-[10px] text-black/40 tracking-[0.2em] font-mono uppercase">Mapping legacy apparel, silhouettes, and cuts</p>
                </div>
              )}

              {/* Displaying AI Recommendations */}
              {!searchingAI && smartResult && (
                <motion.div 
                  variants={containerVariants} 
                  initial="hidden" 
                  animate="visible" 
                  className="flex flex-col gap-6"
                >
                  {/* AI Response Text Box */}
                  <motion.div 
                    variants={itemVariants}
                    className="bg-neutral-50 border border-black/[0.03] p-4 sm:p-5 rounded-sm relative"
                  >
                    <span className="absolute -top-2.5 left-4 bg-black text-white text-[8px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-luxury-accent fill-current" /> AI Stylist Evaluation
                    </span>
                    <p className="text-[11px] sm:text-xs text-black/80 leading-relaxed font-sans mt-1">
                      "{smartResult.reason}"
                    </p>
                    <div className="mt-4 border-t border-black/[0.04] pt-3 flex items-start gap-2 text-[10px] font-sans text-luxury-gold italic">
                      <CornerDownRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span><strong>Editorial Styling Tip:</strong> {smartResult.styleTip}</span>
                    </div>
                  </motion.div>

                  {/* Matched Products */}
                  <motion.div variants={itemVariants}>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-4 font-button-lux">
                      RECOMMENDED APPAREL LOOK ({matchedProducts.length})
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {matchedProducts.map(prod => (
                        <div 
                          key={prod.id}
                          onClick={() => { onClose(); onQuickView(prod); }}
                          className="flex gap-4 p-3 bg-white border border-black/5 hover:border-luxury-accent rounded-sm cursor-pointer transition-all hover:shadow-lg group"
                        >
                          <div className="w-16 aspect-[3/4] bg-neutral-100 flex-shrink-0 overflow-hidden">
                            <img src={prod.images[0]} alt="recs" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          
                          <div className="flex flex-col justify-between py-1 overflow-hidden">
                            <div>
                              <span className="text-[8px] text-black/40 font-mono tracking-widest uppercase font-bold block mb-0.5">{prod.category}</span>
                              <h5 className="font-serif-lux text-xs sm:text-sm font-semibold truncate text-black leading-tight group-hover:text-luxury-accent">{prod.name}</h5>
                              <span className="font-numbers-lux text-xs font-bold text-black block mt-1">{formatPrice(prod.price)}</span>
                            </div>
                            
                            <span className="text-[9px] uppercase tracking-widest font-bold text-luxury-gold flex items-center gap-1 font-button-lux">
                              View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Default Welcome state: suggestions & history */}
              {!searchingAI && !smartResult && (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-6"
                >
                  {/* Historic Searches */}
                  {recentSearches.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-3 font-button-lux flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5" /> Recent Queries
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((hist, i) => (
                          <button 
                            key={i}
                            onClick={() => { setSearchQuery(hist); handleAISTylingSearch(hist); }}
                            className="bg-neutral-50 hover:bg-black hover:text-white text-[10px] font-mono text-black/70 py-1.5 px-3 border border-black/[0.04] transition-colors rounded-sm"
                          >
                            {hist}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Trending suggestions */}
                  <motion.div variants={itemVariants}>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-black/40 mb-3 font-button-lux">
                      Aesthetic Styling Suggestions
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      {trendingSuggestions.map((sug, i) => (
                        <button 
                          key={i}
                          onClick={() => { setSearchQuery(sug); handleAISTylingSearch(sug); }}
                          className="w-full text-left p-3 hover:bg-neutral-50 border border-black/[0.02] text-[11px] font-sans font-medium text-black/80 flex justify-between items-center transition-colors group"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-luxury-accent" /> {sug}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-black/30 group-hover:translate-x-1 group-hover:text-black transition-all" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
