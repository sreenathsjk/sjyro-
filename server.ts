/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { mockProducts } from './src/db/mockData';
import { getSmartSearchAI, getCompleteTheLookAI } from './src/lib/gemini';
import { Order, Product, Review } from './src/types';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Google Drive URL formatters
function cleanImageUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Pattern 1: /file/d/([a-zA-Z0-9_-]+)
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Pattern 2: open?id=([a-zA-Z0-9_-]+) or uc?id=([a-zA-Z0-9_-]+)
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (
    (trimmed.includes('drive.google.com/open') ||
      trimmed.includes('drive.google.com/uc') ||
      trimmed.includes('docs.google.com/uc')) &&
    idMatch &&
    idMatch[1]
  ) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}

function cleanProduct(p: Product): Product {
  if (!p) return p;
  const cleanedImages = (p.images || []).map(cleanImageUrl);
  const cleanedHoverImage = p.hoverImage ? cleanImageUrl(p.hoverImage) : undefined;
  return {
    ...p,
    images: cleanedImages,
    hoverImage: cleanedHoverImage,
  };
}

const PRODUCTS_FILE = path.join(process.cwd(), 'products-db.json');
const ORDERS_FILE = path.join(process.cwd(), 'orders-db.json');
const NEWSLETTERS_FILE = path.join(process.cwd(), 'newsletters-db.json');

// Read Firebase config
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = null;
try {
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to read firebase config:', e);
}

const isRealFirebase = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'DUMMY_KEY';

let fireApp: any = null;
let fireDb: any = null;

if (isRealFirebase) {
  try {
    fireApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    fireDb = getFirestore(fireApp, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase initialized successfully in server.ts');
  } catch (err) {
    console.error('Failed to initialize Firebase in server.ts:', err);
  }
}

let serverProducts: Product[] = [];
let serverOrders: Order[] = [];
let serverNewsletters: string[] = [];

function saveProducts() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(serverProducts, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save products database:', err);
  }
}

function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(serverOrders, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save orders database:', err);
  }
}

function saveNewsletters() {
  try {
    fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(serverNewsletters, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save newsletters database:', err);
  }
}

// Fetch from Firestore
async function getProductsFromFirestore(): Promise<Product[] | null> {
  if (isRealFirebase && fireDb) {
    try {
      const colRef = collection(fireDb, 'products');
      const snapshot = await getDocs(colRef);
      const list: Product[] = [];
      snapshot.forEach(docSnap => {
        list.push(cleanProduct(docSnap.data() as Product));
      });
      if (list.length > 0) {
        return list;
      }
    } catch (err) {
      console.error('Error fetching products from Firestore in server:', err);
    }
  }
  return null;
}

async function getOrdersFromFirestore(): Promise<Order[] | null> {
  if (isRealFirebase && fireDb) {
    try {
      const colRef = collection(fireDb, 'orders');
      const snapshot = await getDocs(colRef);
      const list: Order[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Order);
      });
      return list;
    } catch (err) {
      console.error('Error fetching orders from Firestore in server:', err);
    }
  }
  return null;
}

async function getNewslettersFromFirestore(): Promise<string[] | null> {
  if (isRealFirebase && fireDb) {
    try {
      const colRef = collection(fireDb, 'newsletters');
      const snapshot = await getDocs(colRef);
      const list: string[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.email) {
          list.push(data.email);
        }
      });
      return list;
    } catch (err) {
      console.error('Error fetching newsletters from Firestore in server:', err);
    }
  }
  return null;
}

async function authenticateServer() {
  if (isRealFirebase && fireApp) {
    const auth = getAuth(fireApp);
    const email = '18sparweb@gmail.com';
    const password = 'Krishika@24sjyro@18sparweb';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Server authenticated successfully as admin:', email);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.message?.includes('INVALID_LOGIN_CREDENTIALS')) {
        console.log('Admin user not found or password incorrect on server, attempting to create/sign in...');
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('Admin user created and authenticated successfully:', email);
        } catch (createErr) {
          console.error('Failed to create admin user on server:', createErr);
        }
      } else {
        console.error('Failed to sign in admin user on server:', err);
      }
    }
  }
}

// Database Initialization
async function initializeDatabases() {
  await authenticateServer();
  // 1. Initialize Products
  const fireProds = await getProductsFromFirestore();
  if (fireProds && fireProds.length > 0) {
    serverProducts = fireProds;
    console.log(`Loaded ${serverProducts.length} products from Firestore directly!`);
    saveProducts();
  } else {
    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        serverProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8')).map(cleanProduct);
        console.log(`Loaded ${serverProducts.length} products from local JSON file`);
      } else {
        serverProducts = [...mockProducts].map(cleanProduct);
        saveProducts();
        console.log(`Initialized ${serverProducts.length} products from mockData`);
      }

      // Seed to Firestore
      if (isRealFirebase && fireDb) {
        console.log('Seeding empty Firestore with initial products...');
        for (const prod of serverProducts) {
          try {
            await setDoc(doc(fireDb, 'products', prod.id), prod);
          } catch (seedErr) {
            console.error(`Failed to seed product ${prod.id} into Firestore:`, seedErr);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load products database:', err);
      serverProducts = [...mockProducts].map(cleanProduct);
    }
  }

  // 2. Initialize Orders
  const fireOrders = await getOrdersFromFirestore();
  if (fireOrders && fireOrders.length > 0) {
    serverOrders = fireOrders;
    console.log(`Loaded ${serverOrders.length} orders from Firestore directly!`);
    saveOrders();
  } else {
    try {
      if (fs.existsSync(ORDERS_FILE)) {
        serverOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        console.log(`Loaded ${serverOrders.length} orders from local JSON file`);
      } else {
        serverOrders = [];
        saveOrders();
      }
    } catch (err) {
      console.error('Failed to load orders database:', err);
    }
  }

  // 3. Initialize Newsletters
  const fireNewsletters = await getNewslettersFromFirestore();
  if (fireNewsletters && fireNewsletters.length > 0) {
    serverNewsletters = fireNewsletters;
    console.log(`Loaded ${serverNewsletters.length} newsletter subscribers from Firestore directly!`);
    saveNewsletters();
  } else {
    try {
      if (fs.existsSync(NEWSLETTERS_FILE)) {
        serverNewsletters = JSON.parse(fs.readFileSync(NEWSLETTERS_FILE, 'utf8'));
        console.log(`Loaded ${serverNewsletters.length} newsletter subscribers from local JSON file`);
      } else {
        serverNewsletters = [];
        saveNewsletters();
      }
    } catch (err) {
      console.error('Failed to load newsletters database:', err);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Run database initialization
  await initializeDatabases();

  // API ROUTE: Get all products
  app.get('/api/products', (req, res) => {
    res.json(serverProducts);
  });

  // API ROUTE: Add a new product (Admin Panel)
  app.post('/api/products', async (req, res) => {
    try {
      const newProduct: Product = cleanProduct(req.body);
      if (!newProduct.id || !newProduct.name || !newProduct.price) {
        return res.status(400).json({ error: 'Missing required product fields.' });
      }
      // Ensure unique ID
      if (serverProducts.some(p => p.id === newProduct.id)) {
        newProduct.id = `${newProduct.id}-${Date.now()}`;
      }
      serverProducts.push(newProduct);
      saveProducts();

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          await setDoc(doc(fireDb, 'products', newProduct.id), newProduct);
          console.log(`Synced added product ${newProduct.id} to Firestore`);
        } catch (fireErr) {
          console.error(`Failed to sync added product ${newProduct.id} to Firestore:`, fireErr);
        }
      }

      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product.' });
    }
  });

  // API ROUTE: Update product (Admin Panel)
  app.put('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct: Product = cleanProduct(req.body);
      const index = serverProducts.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      serverProducts[index] = { ...serverProducts[index], ...updatedProduct };
      saveProducts();

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          await setDoc(doc(fireDb, 'products', id), serverProducts[index]);
          console.log(`Synced updated product ${id} to Firestore`);
        } catch (fireErr) {
          console.error(`Failed to sync updated product ${id} to Firestore:`, fireErr);
        }
      }

      res.json(serverProducts[index]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });

  // API ROUTE: Delete product (Admin Panel)
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const index = serverProducts.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      serverProducts.splice(index, 1);
      saveProducts();

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          await deleteDoc(doc(fireDb, 'products', id));
          console.log(`Synced deleted product ${id} from Firestore`);
        } catch (fireErr) {
          console.error(`Failed to sync deleted product ${id} from Firestore:`, fireErr);
        }
      }

      res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  });

  // API ROUTE: Create a review for a product
  app.post('/api/products/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const review: Review = req.body;
      const product = serverProducts.find(p => p.id === id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      product.reviews = product.reviews || [];
      review.id = `rev-${Date.now()}`;
      review.date = new Date().toISOString().split('T')[0];
      product.reviews.push(review);
      
      // Re-calculate rating
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));
      
      saveProducts();

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          await setDoc(doc(fireDb, 'products', id), product);
          console.log(`Synced reviews update for ${id} to Firestore`);
        } catch (fireErr) {
          console.error(`Failed to sync reviews update for ${id} to Firestore:`, fireErr);
        }
      }

      res.status(201).json({ product, review });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit review.' });
    }
  });

  // API ROUTE: Get all orders
  app.get('/api/orders', (req, res) => {
    res.json(serverOrders);
  });

  // API ROUTE: Create a new order (Checkout Flow)
  app.post('/api/orders', async (req, res) => {
    try {
      const order: Order = req.body;
      if (!order.items || order.items.length === 0) {
        return res.status(400).json({ error: 'Order must contain items.' });
      }
      order.id = `SJYRO-${Math.floor(100000 + Math.random() * 900000)}`;
      order.date = new Date().toISOString();
      order.orderStatus = 'Processing';
      order.trackingNumber = `SY-${Math.floor(100000000 + Math.random() * 900000000)}-IN`;
      
      // Update inventory on server
      order.items.forEach(item => {
        const prod = serverProducts.find(p => p.id === item.product.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });

      serverOrders.push(order);
      saveOrders();
      saveProducts(); // Save updated stocks

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          await setDoc(doc(fireDb, 'orders', order.id), order);
          console.log(`Synced order ${order.id} to Firestore`);
          
          // Also sync updated product stocks to Firestore
          for (const item of order.items) {
            const prod = serverProducts.find(p => p.id === item.product.id);
            if (prod) {
              await setDoc(doc(fireDb, 'products', prod.id), prod);
            }
          }
        } catch (fireErr) {
          console.error(`Failed to sync order ${order.id} to Firestore:`, fireErr);
        }
      }

      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to place order.' });
    }
  });

  // API ROUTE: Update order status (Admin Panel / Returns / Cancellation)
  app.put('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { orderStatus, paymentStatus } = req.body;
      const order = serverOrders.find(o => o.id === id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      saveOrders();

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          await setDoc(doc(fireDb, 'orders', id), order);
          console.log(`Synced order status update for ${id} to Firestore`);
        } catch (fireErr) {
          console.error(`Failed to sync order status update for ${id} to Firestore:`, fireErr);
        }
      }

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order.' });
    }
  });

  // API ROUTE: Subscribe to newsletter
  app.post('/api/newsletters', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }
      if (serverNewsletters.includes(email)) {
        return res.status(200).json({ message: 'You are already subscribed to the legacy.' });
      }
      serverNewsletters.push(email);
      saveNewsletters();

      // Sync to Firestore
      if (isRealFirebase && fireDb) {
        try {
          const emailId = email.replace(/[^a-zA-Z0-9]/g, '_');
          await setDoc(doc(fireDb, 'newsletters', emailId), { email });
          console.log(`Synced newsletter email ${email} to Firestore`);
        } catch (fireErr) {
          console.error(`Failed to sync newsletter email ${email} to Firestore:`, fireErr);
        }
      }

      res.status(201).json({ success: true, message: 'Welcome to the SJYRO legacy circle.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to subscribe.' });
    }
  });

  // API ROUTE: Smart Search powered by Gemini
  app.post('/api/ai/smart-search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || query.trim() === '') {
        return res.status(400).json({ error: 'Search query is required.' });
      }
      const aiResult = await getSmartSearchAI(query);
      res.json(aiResult);
    } catch (err) {
      res.status(500).json({ error: 'Stylist module encountered an issue.' });
    }
  });

  // API ROUTE: Complete the Look recommendations powered by Gemini
  app.post('/api/ai/recommend', async (req, res) => {
    try {
      const { cartItemIds } = req.body;
      const productIds = await getCompleteTheLookAI(cartItemIds || []);
      res.json({ productIds });
    } catch (err) {
      res.status(500).json({ error: 'Recommendations failed.' });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SJYRO server booted on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server boot failed:', err);
});
