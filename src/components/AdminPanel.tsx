/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  ShoppingBag, 
  Package, 
  RefreshCw, 
  Check, 
  X, 
  Search, 
  AlertCircle, 
  Info, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, Order } from '../types';
import { dbService } from '../lib/firebase';
import { formatPrice } from '../lib/currency';

interface AdminPanelProps {
  allProducts: Product[];
  onRefreshData: () => void;
}

export default function AdminPanel({ allProducts, onRefreshData }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for adding/editing product
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Dynamic form states
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Premium Hoodies');
  const [pPrice, setPPrice] = useState(120);
  const [pOrigPrice, setPOrigPrice] = useState(180);
  const [pStock, setPStock] = useState(15);
  const [pDesc, setPDesc] = useState('');
  const [pFabric, setPFabric] = useState('480GSM heavy French Terry, 100% combed organic cotton.');
  const [pCare, setPCare] = useState('Machine wash cold inside out, hang dry only.');
  
  // Complex form properties
  const [pSizes, setPSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [pColors, setPColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Core Black', hex: '#000000' },
    { name: 'Off-White', hex: '#F0EFEA' }
  ]);
  const [pImages, setPImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'
  ]);
  const [pFeatures, setPFeatures] = useState<string[]>([
    'Heavy shoulder drop',
    'Custom DTF legacy print',
    'Unisex silhouette structure'
  ]);

  // Flags states
  const [pNewArrival, setPNewArrival] = useState(true);
  const [pBestSeller, setPBestSeller] = useState(false);
  const [pTrending, setPTrending] = useState(false);
  const [pLimitedDrop, setPLimitedDrop] = useState(false);

  // New item sub-form helper inputs
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#D4AF37');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const ords = await dbService.getOrders();
      setOrders(ords);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProdId(null);
    setPId(`sjyro-${Date.now().toString().slice(-6)}`);
    setPName('');
    setPCategory('Premium Hoodies');
    setPPrice(120);
    setPOrigPrice(180);
    setPStock(15);
    setPDesc('Pre-shrunk, double-lined hood structure with ribbed side panels.');
    setPFabric('480GSM heavy French Terry, 100% combed organic cotton.');
    setPCare('Machine wash cold inside out, hang dry only.');
    setPSizes(['S', 'M', 'L', 'XL']);
    setPColors([
      { name: 'Core Black', hex: '#000000' },
      { name: 'Off-White', hex: '#F0EFEA' }
    ]);
    setPImages([
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'
    ]);
    setPFeatures([
      'Heavy shoulder drop',
      'Custom DTF legacy print',
      'Unisex silhouette structure'
    ]);
    setPNewArrival(true);
    setPBestSeller(false);
    setPTrending(false);
    setPLimitedDrop(false);
    setProductFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProdId(prod.id);
    setPId(prod.id);
    setPName(prod.name);
    setPCategory(prod.category);
    setPPrice(prod.price);
    setPOrigPrice(prod.originalPrice || prod.price);
    setPStock(prod.stock);
    setPDesc(prod.description);
    setPFabric(prod.fabricDetails);
    setPCare(prod.careInstructions);
    setPSizes(prod.sizes || ['S', 'M', 'L', 'XL']);
    setPColors(prod.colors || [{ name: 'Core Black', hex: '#000000' }]);
    setPImages(prod.images || []);
    setPFeatures(prod.features || []);
    setPNewArrival(!!prod.isNewArrival);
    setPBestSeller(!!prod.isBestSeller);
    setPTrending(!!prod.isTrending);
    setPLimitedDrop(!!prod.isLimitedDrop);
    setProductFormOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pId || pPrice <= 0) {
      triggerToast('Please fill out required fields with valid measurements.', 'error');
      return;
    }

    setSubmittingProduct(true);
    const payload: Product = {
      id: pId,
      name: pName,
      category: pCategory,
      price: pPrice,
      originalPrice: pOrigPrice,
      description: pDesc,
      fabricDetails: pFabric,
      careInstructions: pCare,
      sizes: pSizes,
      colors: pColors,
      images: pImages.length > 0 ? pImages : ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
      stock: pStock,
      rating: editingProdId ? (allProducts.find(p => p.id === editingProdId)?.rating || 5.0) : 5.0,
      reviews: editingProdId ? (allProducts.find(p => p.id === editingProdId)?.reviews || []) : [],
      features: pFeatures,
      estimatedDelivery: '3-5 Business Days',
      isNewArrival: pNewArrival,
      isBestSeller: pBestSeller,
      isTrending: pTrending,
      isLimitedDrop: pLimitedDrop
    };

    try {
      if (editingProdId) {
        await dbService.updateProduct(editingProdId, payload);
        triggerToast(`Silhouette "${pName}" successfully updated in the active catalog.`);
      } else {
        await dbService.addProduct(payload);
        triggerToast(`New silhouette "${pName}" successfully added to the catalog!`);
      }
      setProductFormOpen(false);
      onRefreshData();
    } catch (err) {
      console.error('Failed to save product:', err);
      triggerToast('Could not commit changes to the backend pipeline.', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirmDeleteId) return;
    const prodName = allProducts.find(p => p.id === confirmDeleteId)?.name || 'Product';
    try {
      const ok = await dbService.deleteProduct(confirmDeleteId);
      if (ok) {
        triggerToast(`"${prodName}" retired from the active luxury catalog.`, 'info');
        onRefreshData();
      } else {
        triggerToast('Database rejected the retire instruction.', 'error');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      triggerToast('Server error while retiring piece.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updated = await dbService.updateOrderStatus(orderId, status);
      if (updated) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
        triggerToast(`Order status ${orderId} updated to ${status}.`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      triggerToast('Fulfillment pipeline update failed.', 'error');
    }
  };

  // Instant Stock Adjustment
  const handleQuickStockAdjust = async (prod: Product, delta: number) => {
    const updatedStock = Math.max(0, prod.stock + delta);
    try {
      await dbService.updateProduct(prod.id, { stock: updatedStock });
      onRefreshData();
      triggerToast(`Stock updated instantly: ${prod.name} is now ${updatedStock} units.`);
    } catch (err) {
      triggerToast('Instant stock synchronization failed.', 'error');
    }
  };

  // Direct Input Stock Adjustment
  const handleDirectStockUpdate = async (prod: Product, valueStr: string) => {
    const value = parseInt(valueStr);
    if (isNaN(value) || value < 0) return;
    try {
      await dbService.updateProduct(prod.id, { stock: value });
      onRefreshData();
      triggerToast(`Stock updated: ${prod.name} is now ${value} units.`);
    } catch (err) {
      triggerToast('Stock update failed.', 'error');
    }
  };

  // HELPER SUB-FORM FUNCTIONS
  const addColor = () => {
    if (!newColorName.trim()) return;
    if (pColors.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())) return;
    setPColors([...pColors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const removeColor = (idx: number) => {
    setPColors(pColors.filter((_, i) => i !== idx));
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setPImages([...pImages, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const removeImageUrl = (idx: number) => {
    setPImages(pImages.filter((_, i) => i !== idx));
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    setPFeatures([...pFeatures, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const removeFeature = (idx: number) => {
    setPFeatures(pFeatures.filter((_, i) => i !== idx));
  };

  const toggleSize = (size: string) => {
    if (pSizes.includes(size)) {
      if (pSizes.length <= 1) {
        triggerToast('At least one size measurement is mandatory.', 'info');
        return;
      }
      setPSizes(pSizes.filter(s => s !== size));
    } else {
      setPSizes([...pSizes, size]);
    }
  };

  // ANALYTICS STATS ENGINE with maximum safety guards
  const totalSalesRevenue = (orders || []).reduce((sum, o) => {
    if (!o) return sum;
    const status = o.orderStatus || 'Pending';
    const total = typeof o.total === 'number' ? o.total : 0;
    return sum + (status !== 'Returned' ? total : 0);
  }, 0);
  const averageOrderValue = (orders || []).length > 0 ? parseFloat((totalSalesRevenue / orders.length).toFixed(2)) : 0;
  const totalInventoryUnits = (allProducts || []).reduce((sum, p) => sum + (p && typeof p.stock === 'number' ? p.stock : 0), 0);

  // Filter Catalog Items with comprehensive fallback protection
  const filteredProducts = (allProducts || []).filter(p => {
    if (!p) return false;
    const nameStr = (p.name || '').toLowerCase();
    const idStr = (p.id || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();
    return nameStr.includes(q) || idStr.includes(q) || catStr.includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col gap-8 select-none">
      
      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] bg-neutral-950 border border-luxury-accent/30 text-white p-4 shadow-2xl rounded-sm flex items-center gap-3 backdrop-blur-md"
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400" />
            ) : (
              <Check className="w-4 h-4 text-luxury-accent" />
            )}
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Header */}
      <div className="border-b border-black/[0.04] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">
            PROTECTED SYSTEM ARCHITECTURE
          </span>
          <h2 className="font-serif-lux font-bold text-2xl sm:text-3xl text-black flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-luxury-accent" /> CREATIVE CONTROL PANEL
          </h2>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex gap-4 font-button-lux text-[10px] font-bold tracking-widest uppercase">
          <button 
            onClick={() => setActiveTab('products')}
            className={`py-2 px-4 border transition-all ${activeTab === 'products' ? 'bg-black text-white border-black' : 'bg-white text-black/50 border-black/10 hover:border-black'}`}
          >
            Catalog ({allProducts.length})
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 border transition-all ${activeTab === 'orders' ? 'bg-black text-white border-black' : 'bg-white text-black/50 border-black/10 hover:border-black'}`}
          >
            Fulfillments ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-4 border transition-all ${activeTab === 'analytics' ? 'bg-black text-white border-black' : 'bg-white text-black/50 border-black/10 hover:border-black'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* 1. ANALYTICS STATS VIEW */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-black/5 rounded-sm">
            <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-2">GROSS TRANSACTIONS</span>
            <p className="font-numbers-lux text-3xl font-extrabold text-black">{formatPrice(totalSalesRevenue)}</p>
            <span className="text-[9px] text-green-600 font-bold uppercase mt-2 block font-button-lux">↑ 14.2% OVER LATEST SEASON</span>
          </div>

          <div className="bg-white p-6 border border-black/5 rounded-sm">
            <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-2">AVERAGE TICKET SIZE</span>
            <p className="font-numbers-lux text-3xl font-extrabold text-black">{formatPrice(averageOrderValue)}</p>
            <span className="text-[9px] text-black/40 font-bold uppercase mt-2 block font-button-lux">PRESTIGE ORDER AVERAGE</span>
          </div>

          <div className="bg-white p-6 border border-black/5 rounded-sm">
            <span className="text-[10px] font-mono tracking-widest uppercase text-black/40 block mb-2">LOGISTICS INVENTORY</span>
            <p className="font-numbers-lux text-3xl font-extrabold text-black">{totalInventoryUnits} Units</p>
            <span className="text-[9px] text-red-600 font-bold uppercase mt-2 block font-button-lux">12% LOW STOCK INDICATORS TRIGGERED</span>
          </div>

          {/* Quick Analytics table */}
          <div className="md:col-span-3 bg-white p-6 border border-black/5 rounded-sm mt-4">
            <h3 className="font-serif-lux font-semibold text-base mb-4">Aesthetic Top Selling Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 border rounded-sm flex justify-between items-center">
                <span className="font-button-lux text-[11px] font-bold uppercase tracking-wider">Premium Hoodies</span>
                <span className="font-mono text-xs font-bold text-luxury-gold">64% of total volume</span>
              </div>
              <div className="p-4 bg-neutral-50 border rounded-sm flex justify-between items-center">
                <span className="font-button-lux text-[11px] font-bold uppercase tracking-wider">Limited Drops</span>
                <span className="font-mono text-xs font-bold text-luxury-gold">36% of total volume</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATALOG MANAGEMENT VIEW */}
      {activeTab === 'products' && (
        <div className="flex flex-col gap-6">
          
          {/* SEARCH BAR & GENERAL OPTIONS */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35" />
              <input 
                type="text"
                placeholder="Search SKU, name, or garment category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-black font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={onRefreshData}
                className="p-2.5 rounded-sm border border-black/10 hover:border-black text-black/50 hover:text-black transition-colors"
                title="Refresh product list"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleOpenAdd}
                className="flex-grow md:flex-grow-0 bg-black hover:bg-luxury-accent hover:text-black text-white text-[10px] font-bold font-button-lux py-3 px-5 tracking-widest uppercase flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> ADD NEW SILHOUETTE
              </button>
            </div>

          </div>

          {/* CATALOG TABLE */}
          <div className="bg-white border border-black/5 rounded-sm overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center font-sans text-xs text-black/40 flex flex-col items-center gap-3">
                <Package className="w-10 h-10 text-black/25 stroke-[1.5]" />
                <p className="font-serif-lux text-sm text-black/80 font-bold">No active luxury silhouettes found</p>
                <p className="max-w-xs text-black/40">Try adjusting your active search filter or add a fresh item.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-black/40 text-[9px] uppercase tracking-widest font-bold font-button-lux">
                    <th className="p-4">PICTURE</th>
                    <th className="p-4">SKU / ID</th>
                    <th className="p-4">NAME</th>
                    <th className="p-4">CATEGORY</th>
                    <th className="p-4">PRICE</th>
                    <th className="p-4">STOCK AVAILABILITY</th>
                    <th className="p-4 text-right">CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] text-black">
                  {filteredProducts.map(prod => {
                    const isLowStock = prod.stock <= 5;
                    const isOutOfStock = prod.stock === 0;

                    return (
                      <tr key={prod.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="p-4">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className="w-10 h-12 object-cover border border-black/5 rounded-sm"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="p-4 font-mono text-[10px] font-bold text-black/75">{prod.id}</td>
                        <td className="p-4">
                          <div className="font-bold flex items-center gap-2">
                            {prod.name}
                            <div className="flex gap-1">
                              {prod.isNewArrival && <span className="bg-black text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest scale-90">NEW</span>}
                              {prod.isLimitedDrop && <span className="bg-luxury-gold text-black text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest scale-90">LTD</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-black/50">{prod.category}</td>
                        <td className="p-4 font-bold font-numbers-lux text-black/90">{formatPrice(prod.price)}</td>
                        
                        {/* INSTANT STOCK ADJUSTMENT FIELD */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {/* Decrease button */}
                            <button 
                              onClick={() => handleQuickStockAdjust(prod, -1)}
                              className="w-6 h-6 border border-black/10 rounded-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xs font-bold"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            
                            {/* Directly Editable Numeric Field */}
                            <input 
                              type="number"
                              min="0"
                              value={prod.stock}
                              onChange={(e) => handleDirectStockUpdate(prod, e.target.value)}
                              className={`w-14 text-center py-1 rounded-sm text-[10px] font-bold font-mono focus:outline-none border ${
                                isOutOfStock ? 'bg-red-50 text-red-700 border-red-300' : 
                                isLowStock ? 'bg-amber-50 text-amber-700 border-amber-300' : 
                                'bg-green-50 text-green-700 border-green-300'
                              }`}
                              title="Type stock units and click out to save"
                            />

                            {/* Increase button */}
                            <button 
                              onClick={() => handleQuickStockAdjust(prod, 1)}
                              className="w-6 h-6 border border-black/10 rounded-sm flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xs font-bold"
                              title="Increase stock by 1"
                            >
                              +
                            </button>

                            {/* Stock warning tag */}
                            <span className="text-[9px] font-mono font-bold text-black/30 tracking-wide">
                              {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenEdit(prod)}
                              className="text-black hover:text-luxury-accent p-1.5 border border-black/5 hover:border-black/20 rounded-sm transition-colors"
                              title="Edit product"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(prod.id)}
                              className="text-black/35 hover:text-red-600 hover:border-red-600/20 p-1.5 border border-black/5 rounded-sm transition-colors"
                              title="Retire product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. FULFILLMENTS VIEW */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-lux font-semibold text-lg">Fulfillment pipeline</h3>
            <button 
              onClick={loadOrders}
              className="text-black/50 hover:text-black p-1.5 rounded-full border border-black/5 hover:border-black/20 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider"
              title="Sync Orders database"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload
            </button>
          </div>

          {loadingOrders ? (
            <div className="py-20 text-center text-black/40 text-xs font-mono animate-pulse">Syncing logistics pipeline...</div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center bg-neutral-50 rounded-sm border">
              <Package className="w-10 h-10 text-black/20 mx-auto mb-3" />
              <p className="text-xs text-black/40 font-mono">No customer checkout transactions processed yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-black/5 rounded-sm overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-black/40 text-[9px] uppercase tracking-widest font-bold font-button-lux">
                    <th className="p-4">ORDER ID</th>
                    <th className="p-4">CUSTOMER</th>
                    <th className="p-4">ITEMS SUMMARY</th>
                    <th className="p-4">TOTAL</th>
                    <th className="p-4">LOGISTICS STATUS</th>
                    <th className="p-4 text-right">MANAGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] text-black">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="p-4 font-mono text-[10px] font-bold">{o.id}</td>
                      <td className="p-4">
                        <div className="font-bold">{o.shippingAddress?.fullName || 'Anonymous Client'}</div>
                        <div className="text-[10px] text-black/40 font-mono truncate max-w-[120px]">{o.shippingAddress?.email || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-black/60 truncate max-w-[180px]">
                        {(o.items || []).map(item => `${item?.product?.name || 'Item'} (x${item?.quantity || 1})`).join(', ') || 'Empty Order'}
                      </td>
                      <td className="p-4 font-bold font-numbers-lux">{formatPrice(o.total || 0)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold font-button-lux tracking-wider uppercase ${
                          o.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                          o.orderStatus === 'Returned' ? 'bg-red-50 text-red-700 border border-red-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                        }`}>
                          {o.orderStatus || 'Processing'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {(o.orderStatus || 'Processing') !== 'Returned' && (o.orderStatus || 'Processing') !== 'Delivered' && (
                          <select 
                            value={o.orderStatus || 'Processing'}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="text-[9px] font-bold font-button-lux uppercase tracking-wider bg-white border border-black/10 rounded-sm p-1.5 focus:outline-none focus:border-black"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DETAILED FORM FOR ADDING / EDITING PRODUCTS */}
      <AnimatePresence>
        {productFormOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/65" onClick={() => setProductFormOpen(false)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-black/10 rounded-sm max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setProductFormOpen(false)}
                className="absolute top-4 right-4 text-black hover:text-luxury-accent p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 border-b pb-3 mb-6">
                <Sparkles className="w-5 h-5 text-luxury-accent" />
                <h3 className="font-serif-lux font-bold text-lg text-black uppercase tracking-wide">
                  {editingProdId ? 'EDIT SILHOUETTE ARCHITECTURE' : 'INTRODUCE NEW SILHOUETTE'}
                </h3>
              </div>

              <form onSubmit={handleSubmitProduct} className="flex flex-col gap-5 text-xs font-sans">
                
                {/* ID and Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">PRODUCT ID / SKU</label>
                    <input 
                      type="text" 
                      value={pId}
                      onChange={(e) => setPId(e.target.value)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono font-bold uppercase"
                      disabled={!!editingProdId}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">PRODUCT NAME</label>
                    <input 
                      type="text" 
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black"
                      placeholder="e.g. CORE OVERSIZED HOODIE"
                      required
                    />
                  </div>
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">CATEGORY</label>
                    <select 
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full border border-black/10 rounded-sm p-3 bg-white focus:outline-none focus:border-black"
                    >
                      <option value="Premium Hoodies">Premium Hoodies</option>
                      <option value="Oversized T-Shirts">Oversized T-Shirts</option>
                      <option value="Premium Shirts">Premium Shirts</option>
                      <option value="Limited Edition Drops">Limited Edition Drops</option>
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">INVENTORY UNITS (STOCK)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={pStock}
                      onChange={(e) => setPStock(parseInt(e.target.value) || 0)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">RETAIL PRICE (USD)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={pPrice}
                      onChange={(e) => setPPrice(parseInt(e.target.value) || 0)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">ORIGINAL COMP PRICE</label>
                    <input 
                      type="number" 
                      min="0"
                      value={pOrigPrice}
                      onChange={(e) => setPOrigPrice(parseInt(e.target.value) || 0)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black font-mono"
                    />
                  </div>
                </div>

                {/* MARKETING AND EXCLUSIVITY TAG FLAGS */}
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-2">EXCLUSIVITY TAGS & LABELS</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3.5 border border-black/5 rounded-sm">
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black transition-colors">
                      <input 
                        type="checkbox" 
                        checked={pNewArrival} 
                        onChange={(e) => setPNewArrival(e.target.checked)}
                        className="accent-black w-3.5 h-3.5"
                      />
                      New Arrival
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black transition-colors">
                      <input 
                        type="checkbox" 
                        checked={pBestSeller} 
                        onChange={(e) => setPBestSeller(e.target.checked)}
                        className="accent-black w-3.5 h-3.5"
                      />
                      Best Seller
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black transition-colors">
                      <input 
                        type="checkbox" 
                        checked={pTrending} 
                        onChange={(e) => setPTrending(e.target.checked)}
                        className="accent-black w-3.5 h-3.5"
                      />
                      Trending
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black transition-colors">
                      <input 
                        type="checkbox" 
                        checked={pLimitedDrop} 
                        onChange={(e) => setPLimitedDrop(e.target.checked)}
                        className="accent-black w-3.5 h-3.5"
                      />
                      Limited Drop
                    </label>
                  </div>
                </div>

                {/* SIZES CONFIGURATION CHIPS */}
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-2">AVAILABLE SILHOUETTE MEASUREMENTS</label>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                      const isActive = pSizes.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`w-10 h-10 border text-[10px] font-mono font-bold rounded-sm transition-all flex items-center justify-center ${
                            isActive 
                              ? 'bg-black text-white border-black scale-105' 
                              : 'bg-white text-black/40 border-black/10 hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLORS DYNAMIC INPUT */}
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-2">FABRIC COLOR PALETTE</label>
                  <div className="flex flex-wrap gap-2 mb-3 bg-neutral-50 p-3.5 border border-black/5 rounded-sm">
                    {pColors.length === 0 ? (
                      <span className="text-[10px] text-black/30 font-mono italic">No colors selected (defaulting to Black)</span>
                    ) : (
                      pColors.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-1.5 bg-white border border-black/10 py-1 px-2.5 rounded-sm shadow-xs"
                        >
                          <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />
                          <span className="text-[10px] font-medium text-black">{color.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeColor(idx)}
                            className="text-black/40 hover:text-red-600 font-bold ml-1.5 text-[10px]"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text"
                      placeholder="Color Name (e.g. Midnight Onyx)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="border border-black/10 p-2.5 rounded-sm flex-grow focus:outline-none focus:border-black"
                    />
                    <div className="flex items-center gap-1">
                      <input 
                        type="color" 
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-10 h-10 p-1 border border-black/10 rounded-sm cursor-pointer"
                        title="Choose Hex color picker"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addColor}
                      className="bg-black hover:bg-luxury-accent hover:text-black text-white font-mono text-[10px] font-bold uppercase py-3 px-4 rounded-sm transition-colors"
                    >
                      + Color
                    </button>
                  </div>
                </div>

                {/* IMAGES LIST CONFIGURATION */}
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-2">IMAGE REPOSITORIES (URLS)</label>
                  <div className="flex flex-col gap-2 mb-3 max-h-32 overflow-y-auto border border-black/5 p-2 rounded-sm bg-neutral-50">
                    {pImages.map((img, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 border border-black/10 rounded-sm text-[10px] font-mono">
                        <span className="truncate max-w-sm">{img}</span>
                        <div className="flex items-center gap-2">
                          <img src={img} className="w-5 h-6 object-cover border" alt="Thumbnail" referrerPolicy="no-referrer" />
                          <button 
                            type="button" 
                            onClick={() => removeImageUrl(idx)}
                            className="text-red-600 hover:underline font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Unsplash / external secure picture URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="border border-black/10 p-2.5 rounded-sm flex-grow focus:outline-none focus:border-black font-mono text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="bg-black hover:bg-luxury-accent hover:text-black text-white font-mono text-[10px] font-bold uppercase py-3 px-4 rounded-sm transition-colors"
                    >
                      + Image
                    </button>
                  </div>
                </div>

                {/* SPECIFICATION FEATURES LIST */}
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-2">GARMENT ARCHITECTURAL HIGHLIGHTS</label>
                  <div className="flex flex-col gap-1.5 mb-3">
                    {pFeatures.map((feat, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-neutral-50 p-2 border border-black/5 rounded-sm">
                        <span className="text-[10px] text-black/70">• {feat}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFeature(idx)}
                          className="text-red-600 text-[11px] font-bold hover:underline px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. Signature loopback knit pattern"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      className="border border-black/10 p-2.5 rounded-sm flex-grow focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="bg-black hover:bg-luxury-accent hover:text-black text-white font-mono text-[10px] font-bold uppercase py-3 px-4 rounded-sm transition-colors"
                    >
                      + Highlight
                    </button>
                  </div>
                </div>

                {/* Editorial textareas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">EDITORIAL DESCRIPTION</label>
                    <textarea 
                      rows={3}
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black leading-relaxed"
                      placeholder="Meticulous fabric weights and sizing loops..."
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">FABRIC DETAILS</label>
                    <textarea 
                      rows={3}
                      value={pFabric}
                      onChange={(e) => setPFabric(e.target.value)}
                      className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black leading-relaxed"
                      placeholder="Fabric material structure specifications..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-black/40 font-button-lux block mb-1">CARE INSTRUCTIONS</label>
                  <input 
                    type="text" 
                    value={pCare}
                    onChange={(e) => setPCare(e.target.value)}
                    className="w-full border border-black/10 rounded-sm p-3 focus:outline-none focus:border-black"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submittingProduct}
                  className="w-full bg-black hover:bg-luxury-accent hover:text-black text-white text-[11px] tracking-widest font-bold uppercase py-4 font-button-lux transition-colors mt-2"
                >
                  {submittingProduct ? 'COMMITTING CHANGES TO CORE DATABASE...' : 'SAVE SILHOUETTE ARCHITECTURE'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SARTORIAL RETIREMENT VERIFICATION MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/85" onClick={() => setConfirmDeleteId(null)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-950 border border-red-500/20 max-w-md w-full p-6 shadow-2xl relative z-10 text-white rounded-sm"
            >
              <h3 className="font-serif-lux font-bold text-lg text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> RETIRE PIECE CATALOGUE?
              </h3>
              <p className="text-[11px] text-white/65 leading-relaxed font-sans mb-6">
                Are you absolutely sure you wish to retire the silhouette SKU{' '}
                <strong className="text-white font-mono">{confirmDeleteId}</strong>? This action terminates public orders and is immediate.
              </p>
              <div className="flex gap-3 text-[10px] font-bold font-mono uppercase tracking-wider">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 bg-white/5 hover:bg-white/15 text-white py-3 border border-white/15 transition-all text-center"
                >
                  CANCEL RETIREMENT
                </button>
                <button 
                  onClick={handleDeleteProduct}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 transition-all text-center"
                >
                  RETIRE PERMANENTLY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
