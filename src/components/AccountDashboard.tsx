/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Heart, ShieldAlert, Package, LogOut, Check, ArrowRight, X, AlertCircle, ArrowLeft, Compass, Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Order, Product } from '../types';
import { dbService } from '../lib/firebase';
import { formatPrice } from '../lib/currency';

function LiveShipmentMap({ progressIndex, destinationCity }: { progressIndex: number; destinationCity: string }) {
  const startX = 50;
  const startY = 110;
  const endX = 350;
  const endY = 40;
  
  const progressPercentages = [0.1, 0.4, 0.75, 1.0];
  const t = progressPercentages[progressIndex] ?? 0.1;
  
  const currentX = startX + (endX - startX) * t;
  const currentY = startY + (endY - startY) * t;
  
  return (
    <div className="relative w-full h-44 bg-neutral-950 border border-black/80 rounded-sm overflow-hidden flex flex-col justify-between p-3 font-mono text-[9px] text-white/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(17,17,17,0.1)_0,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
      
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">SYSTEM TELEMETRY</span>
          <span className="text-emerald-400 font-bold animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" /> LIVE LINK ESTABLISHED
          </span>
        </div>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">CARGO ID</span>
          <span className="text-white font-semibold">SJY-TRK-74109</span>
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
          <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
          <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
          <line x1="100" y1="0" x2="100" y2="160" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
          <line x1="200" y1="0" x2="200" y2="160" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
          <line x1="300" y1="0" x2="300" y2="160" stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />

          <path d="M 10 50 Q 80 40 120 70 T 220 120 T 320 60 T 390 110" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 30 130 Q 110 110 160 140 T 280 80 T 370 140" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" strokeLinecap="round" />

          <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4,4" strokeLinecap="round" />
          <line x1={startX} y1={startY} x2={currentX} y2={currentY} stroke="rgb(212,175,55)" strokeWidth="2" strokeLinecap="round" />

          <circle cx={startX} cy={startY} r="3.5" fill="#000" stroke="rgb(212,175,55)" strokeWidth="1.5" />
          <circle cx={startX} cy={startY} r="7" fill="none" stroke="rgb(212,175,55)" strokeWidth="0.75" className="animate-ping" style={{ transformOrigin: `${startX}px ${startY}px` }} />
          
          <circle cx={endX} cy={endY} r="3.5" fill="#000" stroke="#10B981" strokeWidth="1.5" />
          {progressIndex === 3 && (
            <circle cx={endX} cy={endY} r="7" fill="none" stroke="#10B981" strokeWidth="0.75" className="animate-ping" style={{ transformOrigin: `${endX}px ${endY}px` }} />
          )}

          <g transform={`translate(${currentX - 6}, ${currentY - 6})`}>
            <circle cx="6" cy="6" r="8" fill="none" stroke="rgb(212,175,55)" strokeWidth="0.75" className="animate-pulse" />
            <circle cx="6" cy="6" r="3" fill="rgb(212,175,55)" />
          </g>

          <text x={startX - 10} y={startY + 15} fill="rgba(255,255,255,0.4)" fontSize="6" fontWeight="bold">TOKYO ATELIER (ORIGIN)</text>
          <text x={endX - 50} y={endY - 10} fill="rgb(16,185,129)" fontSize="6" fontWeight="bold">
            {destinationCity.toUpperCase()} (DESTINATION)
          </text>
        </svg>
      </div>

      <div className="flex justify-between items-end z-10 text-[7px] text-white/30">
        <span>GRID REF: 35.6762° N / 139.6503° E</span>
        <span>STATUS: {progressIndex === 3 ? 'DELIVERED' : 'IN TRANSIT SEQUENCE'}</span>
      </div>
    </div>
  );
}

interface AccountDashboardProps {
  user: { fullName: string; email: string } | null;
  onLogout: () => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  setView: (view: string) => void;
  currentSubView: string; // 'orders' | 'wishlist' | 'addresses'
  onQuickView: (product: Product) => void;
}

export default function AccountDashboard({
  user,
  onLogout,
  wishlist,
  onToggleWishlist,
  setView,
  currentSubView,
  onQuickView
}: AccountDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Load orders for current user on mount
  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      dbService.getOrders()
        .then(allOrders => {
          // Filter orders belonging to current logged-in email
          const userOrders = allOrders.filter(o => o.shippingAddress.email === user.email);
          setOrders(userOrders);
        })
        .catch(err => console.error('Failed to load user orders:', err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const handleRequestReturn = (order: Order) => {
    setSelectedOrder(order);
    setReturnReason('');
    setReturnSuccess(false);
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedOrder || !returnReason) return;
    
    try {
      const updatedOrder = await dbService.updateOrderStatus(selectedOrder.id, 'Returned');
      if (updatedOrder) {
        // Update local state list
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, orderStatus: 'Returned' } : o));
        setReturnSuccess(true);
        setTimeout(() => {
          setReturnModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit return request:', err);
    }
  };

  const trackingSteps = ['Processing', 'Dispatched', 'In Transit', 'Delivered'];

  const getStepProgressIndex = (status: string) => {
    if (status === 'Returned') return -1;
    if (status === 'Processing') return 0;
    if (status === 'Shipped' || status === 'Dispatched') return 1;
    if (status === 'In Transit') return 2;
    if (status === 'Delivered') return 3;
    return 0;
  };

  const getMockCheckpointHistory = (orderDateStr: string, status: string) => {
    const baseDate = new Date(orderDateStr);
    
    const checkpoints = [
      {
        title: 'Order Placed & Confirmed',
        location: 'SJYRO Tokyo Atelier Depot',
        time: new Date(baseDate.getTime() + 15 * 60000), // +15 mins
        desc: 'Transaction authorized. Item verified, numbered, and catalogued.',
        statusIndex: 0
      },
      {
        title: 'Eco-Chamber Packaging Finalized',
        location: 'SJYRO Tokyo Atelier Depot',
        time: new Date(baseDate.getTime() + 180 * 60000), // +3 hours
        desc: 'Item packed in signature recycled cotton vault bags and anti-tamper security box.',
        statusIndex: 0
      },
      {
        title: 'Dispatched via Premium Express Carrier',
        location: 'Haneda Logistics Air Gateway',
        time: new Date(baseDate.getTime() + 720 * 60000), // +12 hours
        desc: 'Consignment scanned and handed to SJYRO Premium Courier Network.',
        statusIndex: 1
      },
      {
        title: 'Customs Clearance & Regional Sorting',
        location: 'Regional Air Import Hub',
        time: new Date(baseDate.getTime() + 1320 * 60000), // +22 hours
        desc: 'Cleared customs inspections. Forwarded to local regional delivery fleet.',
        statusIndex: 2
      },
      {
        title: 'Out for Local Courier Delivery',
        location: 'Local Sorting Center',
        time: new Date(baseDate.getTime() + 2160 * 60000), // +36 hours
        desc: 'Dispatched with executive courier team for final mile security transport.',
        statusIndex: 2
      },
      {
        title: 'Consignment Delivered Successfully',
        location: 'Recipient Address Vault',
        time: new Date(baseDate.getTime() + 2520 * 60000), // +42 hours
        desc: 'Delivery completed successfully. Thank you for acquiring SJYRO.',
        statusIndex: 3
      }
    ];

    const currentProgressIndex = getStepProgressIndex(status);
    return checkpoints.filter(cp => cp.statusIndex <= currentProgressIndex).reverse();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
      {/* Back to Home Link */}
      <div className="mb-8">
        <button 
          onClick={() => setView('home')}
          className="inline-flex items-center gap-1.5 text-black/50 hover:text-black font-button-lux text-[10px] font-bold tracking-widest uppercase transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
      {/* LEFT SIDEBAR: Personal Details / Nav */}
      <div className="w-full md:w-1/4 flex flex-col gap-6">
        <div className="bg-white p-6 border border-black/5 rounded-sm">
          <div className="w-16 h-16 bg-black text-white text-xl font-bold font-serif-lux rounded-full flex items-center justify-center mb-4 border border-luxury-accent">
            {user ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
          </div>
          <h3 className="font-serif-lux font-bold text-lg text-black">{user?.fullName || 'Legacy Guest'}</h3>
          <p className="text-[11px] font-mono text-black/50 truncate mb-6">{user?.email}</p>

          <div className="flex flex-col gap-3 font-button-lux text-[11px] font-bold tracking-[0.15em] uppercase border-t border-black/[0.04] pt-5 text-black/60">
            <button 
              onClick={() => setView('account-orders')}
              className={`text-left hover:text-black flex items-center gap-2 ${currentSubView === 'orders' ? 'text-luxury-accent' : ''}`}
            >
              <Package className="w-4 h-4" /> Order History
            </button>
            <button 
              onClick={() => setView('account-wishlist')}
              className={`text-left hover:text-black flex items-center gap-2 ${currentSubView === 'wishlist' ? 'text-luxury-accent' : ''}`}
            >
              <Heart className="w-4 h-4" /> My Wishlist ({wishlist.length})
            </button>
            <button 
              onClick={() => setView('account-addresses')}
              className={`text-left hover:text-black flex items-center gap-2 ${currentSubView === 'addresses' ? 'text-luxury-accent' : ''}`}
            >
              <MapPin className="w-4 h-4" /> My Addresses
            </button>
            <button 
              onClick={onLogout}
              className="text-left text-red-600 hover:text-red-800 flex items-center gap-2 pt-4 border-t border-black/[0.03] mt-2"
            >
              <LogOut className="w-4 h-4" /> Logout Profile
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Sub-View stage */}
      <div className="w-full md:w-3/4 bg-white p-6 md:p-8 border border-black/5 rounded-sm">
        {/* 1. ORDER HISTORY VIEW */}
        {currentSubView === 'orders' && (
          <div>
            <h2 className="font-serif-lux font-bold text-xl text-black border-b pb-3 mb-6">ORDER HISTORY PORTAL</h2>
            
            {loadingOrders ? (
              <div className="py-20 text-center text-black/40 font-mono text-xs animate-pulse">
                Fetching historic order databases...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="w-12 h-12 text-black/20 mx-auto mb-4" />
                <h3 className="font-serif-lux text-base font-semibold mb-2">No Transactions Filed</h3>
                <p className="text-xs text-black/40 mb-6 max-w-sm mx-auto">Purchase limited drops and standard catalog items to lock in order histories.</p>
                <button 
                  onClick={() => setView('shop')}
                  className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-bold uppercase py-2.5 px-8 font-button-lux transition-colors"
                >
                  SHOP RECENT DROPS
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {orders.map(order => {
                  const progressIndex = getStepProgressIndex(order.orderStatus);
                  
                  return (
                    <div key={order.id} className="border border-black/[0.08] rounded-sm p-4 sm:p-5">
                      {/* Top Header info */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/[0.04] pb-3 mb-4 gap-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block">ORDER ID</span>
                          <span className="font-mono text-xs font-bold text-black">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block">PURCHASE DATE</span>
                          <span className="font-mono text-xs text-black/70">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block">PAYMENT METHOD</span>
                          <span className="text-[10px] uppercase font-bold text-black font-button-lux">{order.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block">TOTAL CHARGED</span>
                          <span className="font-numbers-lux text-sm font-bold text-luxury-gold">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="flex flex-col gap-3 mb-5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <div className="w-10 aspect-[3/4] bg-neutral-100 border flex-shrink-0 overflow-hidden">
                              <img src={item.product.images[0]} alt="order-summary" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                              <h5 className="font-serif-lux text-xs font-semibold text-black">{item.product.name}</h5>
                              <p className="text-[9px] text-black/40 font-mono">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                            </div>
                            <span className="font-numbers-lux text-xs font-bold text-black">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Dynamic Shiprocket Progress bar */}
                      {order.orderStatus === 'Returned' ? (
                        <div className="bg-red-50 p-3 border border-red-100 rounded-sm flex items-center gap-2 text-red-700 text-[11px] font-bold font-button-lux uppercase tracking-wider mb-4">
                          <AlertCircle className="w-4 h-4 animate-bounce" /> Return Completed. Refund initiated to source.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 mb-4">
                          <div className="bg-neutral-50 p-4 border border-black/[0.02] rounded-sm">
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold text-black/40 font-button-lux mb-3">
                              <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-luxury-accent" /> 
                                Shiprocket Logistics Status: <strong className="text-black">{order.orderStatus === 'Shipped' ? 'Dispatched' : order.orderStatus}</strong>
                              </span>
                              {order.trackingNumber && <span className="font-mono text-black/60">AWB: {order.trackingNumber}</span>}
                            </div>
                            
                            {/* Visual steps */}
                            <div className="grid grid-cols-4 gap-1 relative pt-2">
                              {/* Connector line */}
                              <div className="absolute top-[18px] left-8 right-8 h-1 bg-neutral-200 -z-10" />
                              
                              {trackingSteps.map((step, idx) => {
                                const isCompleted = idx <= progressIndex;
                                const isActive = idx === progressIndex;
                                
                                return (
                                  <div key={step} className="flex flex-col items-center text-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                                      isCompleted 
                                        ? 'bg-black border-black text-white' 
                                        : 'bg-white border-black/10 text-black/30'
                                    } ${isActive ? 'ring-4 ring-luxury-accent/30 scale-110' : ''}`}>
                                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-[9px] font-bold">{idx + 1}</span>}
                                    </div>
                                    <span className={`text-[8px] font-bold tracking-widest uppercase mt-2 font-button-lux ${
                                      isCompleted ? 'text-black font-extrabold' : 'text-black/35'
                                    }`}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Beautiful Interactive Map & Timeline panel */}
                          <AnimatePresence>
                            {activeTrackingOrderId === order.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden border border-black/10 rounded-sm bg-neutral-50 p-4 flex flex-col gap-4"
                              >
                                <div className="border-b border-black/[0.04] pb-2 flex justify-between items-center">
                                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-black flex items-center gap-1.5 font-button-lux">
                                    <Compass className="w-4 h-4 text-luxury-gold animate-spin-slow" />
                                    Live Satellite Link
                                  </h4>
                                  <span className="text-[9px] font-mono text-black/40 uppercase">Aviation Secure Route</span>
                                </div>

                                <LiveShipmentMap progressIndex={progressIndex} destinationCity={order.shippingAddress.city || 'Destination'} />

                                {/* Timeline list */}
                                <div className="flex flex-col gap-3 mt-2">
                                  <span className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux">CARGO SCAN HISTORY</span>
                                  <div className="relative pl-4 border-l border-black/10 flex flex-col gap-4 py-2">
                                    {getMockCheckpointHistory(order.date, order.orderStatus).map((cp, idx) => (
                                      <div key={idx} className="relative flex flex-col gap-1 text-[10px]">
                                        {/* Status bullet */}
                                        <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border bg-white ${
                                          idx === 0 
                                            ? 'border-luxury-gold ring-4 ring-luxury-gold/20 scale-110' 
                                            : 'border-black/30'
                                        }`} />

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                          <span className="font-serif-lux font-bold text-black flex items-center gap-1">
                                            {cp.title}
                                            {idx === 0 && <span className="text-[7px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.5 rounded-sm uppercase tracking-widest font-mono">LATEST SECURE SCAN</span>}
                                          </span>
                                          <span className="font-mono text-[9px] text-black/40 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {cp.time.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-black/50 font-mono tracking-wide uppercase">{cp.location}</span>
                                        <p className="text-[11px] text-black/70 leading-relaxed max-w-xl">{cp.desc}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Action buttons (Cancellation / Return) */}
                      {order.orderStatus !== 'Returned' && (
                        <div className="flex justify-end gap-3 mt-4 border-t border-black/[0.04] pt-4">
                          <button 
                            onClick={() => setActiveTrackingOrderId(prev => prev === order.id ? null : order.id)}
                            className="text-[10px] tracking-widest uppercase font-button-lux font-bold py-2 px-4 bg-black text-white hover:bg-luxury-gold hover:text-black rounded-sm flex items-center gap-1.5 transition-all"
                          >
                            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                            {activeTrackingOrderId === order.id ? 'Hide Telemetry Map' : 'Track Live Delivery'}
                          </button>
                          
                          <button 
                            onClick={() => handleRequestReturn(order)}
                            className="text-[10px] tracking-widest uppercase font-button-lux font-bold py-2 px-4 border border-black/10 hover:border-black rounded-sm text-black/70 hover:text-black transition-all"
                          >
                            Request Return / Refund
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. MY WISHLIST VIEW */}
        {currentSubView === 'wishlist' && (
          <div>
            <h2 className="font-serif-lux font-bold text-xl text-black border-b pb-3 mb-6">MY WISHLIST</h2>
            
            {wishlist.length === 0 ? (
              <div className="py-20 text-center">
                <Heart className="w-12 h-12 text-black/20 mx-auto mb-4" />
                <h3 className="font-serif-lux text-base font-semibold mb-2">Wishlist is Empty</h3>
                <p className="text-xs text-black/40 mb-6 max-w-sm mx-auto">Flag luxury items with the heart indicator to organize your seasonal styling guides here.</p>
                <button 
                  onClick={() => setView('shop')}
                  className="bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-bold uppercase py-2.5 px-8 font-button-lux transition-colors"
                >
                  EXPLORE APPAREL
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(prod => (
                  <div key={prod.id} className="group border border-black/[0.03] p-3 flex flex-col justify-between rounded-sm">
                    <div className="relative aspect-[3/4] bg-neutral-100 mb-3 overflow-hidden rounded-sm">
                      <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button 
                        onClick={() => onToggleWishlist(prod)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 shadow-md border border-red-100"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[8px] text-black/40 font-mono tracking-widest uppercase font-bold block mb-0.5">{prod.category}</span>
                      <h4 className="font-serif-lux text-xs font-semibold truncate text-black">{prod.name}</h4>
                      <p className="font-numbers-lux text-sm font-bold text-black mt-1 mb-3">{formatPrice(prod.price)}</p>
                    </div>

                    <button 
                      onClick={() => onQuickView(prod)}
                      className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[9px] font-bold font-button-lux py-2 tracking-widest uppercase transition-colors"
                    >
                      VIEW & BUY NOW
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MY ADDRESSES VIEW */}
        {currentSubView === 'addresses' && (
          <div>
            <h2 className="font-serif-lux font-bold text-xl text-black border-b pb-3 mb-6">SAVED ADDRESSES</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 border border-black/10 rounded-sm relative">
                <span className="absolute top-4 right-4 bg-black text-white text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm">DEFAULT</span>
                <h4 className="font-serif-lux font-bold text-sm text-black mb-3">Residential Vault</h4>
                <div className="text-xs text-black/60 font-mono leading-relaxed">
                  <p>{user?.fullName || 'Satoshi Nakamoto'}</p>
                  <p>1209 East Crypto Lane, Apt 4</p>
                  <p>Silicon Valley, CA 94025</p>
                  <p>United States</p>
                  <p className="mt-3 text-[10px] text-black/40">Phone: +1 (555) 019-2831</p>
                </div>
              </div>

              <div className="p-5 border border-dashed border-black/20 hover:border-black rounded-sm flex flex-col items-center justify-center text-center cursor-pointer transition-colors group py-10">
                <MapPin className="w-8 h-8 text-black/35 group-hover:text-luxury-accent mb-2 transition-colors" />
                <span className="font-button-lux text-[10px] font-bold text-black uppercase tracking-widest">ADD NEW DESTINATION</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* DETAILED RETURNS / CANCELLATIONS MODAL */}
      <AnimatePresence>
        {returnModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60" onClick={() => setReturnModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full p-6 shadow-2xl relative z-10 border border-black/10 rounded-sm"
            >
              <button 
                onClick={() => setReturnModalOpen(false)}
                className="absolute top-4 right-4 text-black hover:text-luxury-accent"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif-lux font-bold text-lg mb-2 text-black">FILE RETURN OR REFUND</h3>
              <p className="text-[10px] text-black/40 font-mono uppercase tracking-wider mb-4">ORDER ID: {selectedOrder.id}</p>

              {returnSuccess ? (
                <div className="py-6 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-serif-lux text-sm font-semibold text-black mb-1">Return Request Received</h4>
                  <p className="text-xs text-black/50">Refund booking label will be sent to your email.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">REASON FOR RETURN</label>
                    <select 
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full border border-black/10 rounded-sm p-3 text-xs bg-white focus:outline-none focus:border-black font-sans"
                    >
                      <option value="">-- SELECT REASON --</option>
                      <option value="size">Size issue (Oversized was too baggy)</option>
                      <option value="style">Changed mind / Aesthetic mismatch</option>
                      <option value="fabric">Fabric quality expectation mismatch</option>
                      <option value="defect">Stitching or DTF print defect</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1.5">ADDITIONAL BRIEFING</label>
                    <textarea 
                      rows={3}
                      className="w-full border border-black/10 rounded-sm p-3 text-xs focus:outline-none focus:border-black font-sans"
                      placeholder="Explain details of the item mismatch..."
                    />
                  </div>

                  <div className="bg-amber-50 p-3 border border-amber-100 rounded-sm text-[10px] text-amber-800 leading-relaxed font-mono flex gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>Refunds are automatically processed to source credit cards or UPI accounts upon carrier pickup of returned cargo.</span>
                  </div>

                  <button 
                    onClick={handleConfirmReturn}
                    disabled={!returnReason}
                    className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] tracking-widest font-bold uppercase py-3 font-button-lux transition-colors"
                  >
                    CONFIRM RETURN LABEL BOOKING
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
