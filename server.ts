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

// Initialize databases from local JSON files to ensure absolute durability across server restarts!
let serverProducts: Product[] = [];
try {
  if (fs.existsSync(PRODUCTS_FILE)) {
    serverProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8')).map(cleanProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(serverProducts, null, 2), 'utf8');
  } else {
    serverProducts = [...mockProducts].map(cleanProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(serverProducts, null, 2), 'utf8');
  }
} catch (err) {
  console.error('Failed to load products database:', err);
  serverProducts = [...mockProducts].map(cleanProduct);
}

let serverOrders: Order[] = [];
try {
  if (fs.existsSync(ORDERS_FILE)) {
    serverOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } else {
    serverOrders = [];
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(serverOrders, null, 2), 'utf8');
  }
} catch (err) {
  console.error('Failed to load orders database:', err);
}

let serverNewsletters: string[] = [];
try {
  if (fs.existsSync(NEWSLETTERS_FILE)) {
    serverNewsletters = JSON.parse(fs.readFileSync(NEWSLETTERS_FILE, 'utf8'));
  } else {
    serverNewsletters = [];
    fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(serverNewsletters, null, 2), 'utf8');
  }
} catch (err) {
  console.error('Failed to load newsletters database:', err);
}

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API ROUTE: Get all products
  app.get('/api/products', (req, res) => {
    res.json(serverProducts);
  });

  // API ROUTE: Add a new product (Admin Panel)
  app.post('/api/products', (req, res) => {
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
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product.' });
    }
  });

  // API ROUTE: Update product (Admin Panel)
  app.put('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updatedProduct: Product = cleanProduct(req.body);
      const index = serverProducts.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      serverProducts[index] = { ...serverProducts[index], ...updatedProduct };
      saveProducts();
      res.json(serverProducts[index]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });

  // API ROUTE: Delete product (Admin Panel)
  app.delete('/api/products/:id', (req, res) => {
    try {
      const { id } = req.params;
      const index = serverProducts.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      serverProducts.splice(index, 1);
      saveProducts();
      res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  });

  // API ROUTE: Create a review for a product
  app.post('/api/products/:id/reviews', (req, res) => {
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
  app.post('/api/orders', (req, res) => {
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
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to place order.' });
    }
  });

  // API ROUTE: Update order status (Admin Panel / Returns / Cancellation)
  app.put('/api/orders/:id', (req, res) => {
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
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order.' });
    }
  });

  // API ROUTE: Subscribe to newsletter
  app.post('/api/newsletters', (req, res) => {
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
