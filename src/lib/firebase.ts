/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, Review } from '../types';
import { cleanProduct, cleanImageUrl } from './driveImageHelper';
import { mockProducts } from '../db/mockData';

// Detect if real Firebase credentials are provided
const isRealFirebase = firebaseConfig && firebaseConfig.apiKey !== 'DUMMY_KEY';

let app;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isRealFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    }, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error('Failed to initialize real Firebase, using local-only mode:', error);
  }
}

// ----------------------------------------------------
// Error Handler matching the firebase-integration skill
// ----------------------------------------------------
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Raised: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// UNIFIED E-COMMERCE DATABASE SERVICE
// (Syncs with the custom Express server to guarantee full interactivity)
// ----------------------------------------------------
export const dbService = {
  // --- AUTH METHODS ---
  async loginWithGoogle() {
    if (isRealFirebase && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return {
          uid: result.user.uid,
          fullName: result.user.displayName || 'Legacy Guest',
          email: result.user.email || '',
        };
      } catch (err) {
        console.error('Firebase Auth Error, falling back:', err);
      }
    }
    // High-fidelity simulation login
    const mockUser = {
      uid: 'mock-user-123',
      fullName: 'Satoshi Nakamoto',
      email: 'satoshi@sjyro.luxury',
    };
    localStorage.setItem('sjyro_auth_user', JSON.stringify(mockUser));
    return mockUser;
  },

  async logout() {
    if (isRealFirebase && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Firebase SignOut Error:', err);
      }
    }
    localStorage.removeItem('sjyro_auth_user');
  },

  getCurrentUser() {
    if (isRealFirebase && auth) {
      const u = auth.currentUser;
      if (u) {
        return {
          uid: u.uid,
          fullName: u.displayName || 'Legacy Guest',
          email: u.email || '',
        };
      }
    }
    try {
      const saved = localStorage.getItem('sjyro_auth_user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse cached auth user:', e);
      return null;
    }
  },

  // --- PRODUCTS MANAGEMENT ---
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const text = await response.text();
        // Check if response is HTML (which happens on static servers like Vercel with SPA fallback)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error('Received HTML response instead of JSON. Frontend probably deployed without a running backend server.');
        }
        const prods = JSON.parse(text);
        if (Array.isArray(prods) && prods.length > 0) {
          return prods.map(cleanProduct);
        }
      }
    } catch (err) {
      console.warn('API fetch failed or returned non-JSON, checking other sources:', err);
    }

    // Fallback 1: Try real client-side Firestore if available
    if (isRealFirebase && db) {
      try {
        const colRef = collection(db, 'products');
        const snapshot = await getDocs(colRef);
        const list: Product[] = [];
        snapshot.forEach(docSnap => {
          if (docSnap.exists()) {
            list.push(cleanProduct(docSnap.data() as Product));
          }
        });
        if (list.length > 0) {
          console.log(`Fetched ${list.length} products directly from Firestore client-side`);
          return list;
        }
      } catch (fireErr) {
        console.error('Client-side Firestore products fetch failed:', fireErr);
      }
    }

    // Fallback 2: Client-side high-fidelity mock data (guarantees products always appear)
    console.log('Falling back to high-fidelity mock data for products');
    return mockProducts.map(cleanProduct);
  },

  async addProduct(product: Product): Promise<Product> {
    const cleanedProduct = cleanProduct(product);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedProduct),
      });
      if (response.ok) {
        const savedProd = await response.json();
        return cleanProduct(savedProd);
      }
    } catch (err) {
      console.error('Failed to create product via API:', err);
    }
    return cleanedProduct;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const cleanedPatch = { ...product };
    if (cleanedPatch.images) {
      cleanedPatch.images = cleanedPatch.images.map(cleanImageUrl);
    }
    if (cleanedPatch.hoverImage) {
      cleanedPatch.hoverImage = cleanImageUrl(cleanedPatch.hoverImage);
    }
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedPatch),
      });
      if (response.ok) {
        const updated = await response.json();
        return cleanProduct(updated);
      }
    } catch (err) {
      console.error('Failed to update product via API:', err);
    }
    return product as Product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        return true;
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
    return false;
  },

  // --- REVIEW METHODS ---
  async addReview(productId: string, rating: number, comment: string, userName: string, userEmail: string): Promise<Review> {
    const reviewPayload = { userName, userEmail, rating, comment };
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });
      if (response.ok) {
        const { review } = await response.json();
        return review;
      }
    } catch (err) {
      console.error('Failed to add review via API:', err);
    }
    
    // local fallback review structure
    return {
      id: `rev-${Date.now()}`,
      userName,
      userEmail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true
    };
  },

  // --- ORDERS MANAGEMENT ---
  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('API getOrders failed:', err);
    }
    return [];
  },

  async createOrder(order: Order): Promise<Order> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Failed to create order via API:', err);
    }
    return order;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
    return null;
  },

  // --- NEWSLETTER METHODS ---
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || 'Failed to subscribe.' };
    } catch (err) {
      return { success: false, message: 'Subscription failed. Please try again.' };
    }
  }
};

export { db, auth };
export default isRealFirebase;
