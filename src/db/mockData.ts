/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon } from '../types';

export const mockCoupons: Coupon[] = [
  { code: 'LEGACY10', discountType: 'percentage', value: 10 },
  { code: 'SJYROVIP', discountType: 'percentage', value: 20, minSubtotal: 250 },
  { code: 'WELCOME50', discountType: 'fixed', value: 50, minSubtotal: 200 },
];

export const mockProducts: Product[] = [
  {
    id: 'sjyro-h01',
    name: 'SJYRO Mahabharata Lord Krishna Chariot Heavyweight Hoodie',
    category: 'Hoodies',
    price: 195,
    originalPrice: 245,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200'
    ],
    hoverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1200',
    description: 'A premium heavyweight white hoodie celebrating the legacy and divine wisdom of the Mahabharata. It features a stunning back graphic print depicting Lord Krishna in his majestic golden chariot drawn by seven white horses, surrounded by a radiant golden aura. Crafted from 480GSM ultra-dense organic cotton French Terry for an architectural drape, drop shoulders, and double-lined hood.',
    fabricDetails: '100% Organic Cotton French Terry. Pre-shrunk and garment dyed for a vintage-matte finish. Heavyweight 480GSM.',
    careInstructions: 'Machine wash cold inside-out on gentle cycle. Hang dry in shade. Do not iron over direct print.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Chalk White', hex: '#FFFFFF' }
    ],
    stock: 12,
    rating: 4.9,
    isBestSeller: true,
    isTrending: true,
    features: ['Lord Krishna & Chariot Back Graphic', '480GSM French Terry', 'Oversized Boxy Silhouette', 'Double-Lined Hood with No Drawstrings'],
    estimatedDelivery: '2-4 Business Days',
    reviews: [
      {
        id: 'rev-01',
        userName: 'Arjun S.',
        userEmail: 'arjun@example.com',
        rating: 5,
        comment: 'Absolutely legendary design. The print of Lord Krishna and his chariot on the back is incredibly high definition and majestic. The 480GSM white hoodie fabric feels exceptionally heavy and premium.',
        date: '2026-06-15',
        verifiedPurchase: true
      },
      {
        id: 'rev-02',
        userName: 'Rohan Sharma',
        userEmail: 'rohan@example.com',
        rating: 5,
        comment: 'Unbelievable quality. The graphic of the chariot is flawless. Fits perfectly boxy and oversized.',
        date: '2026-06-28',
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'sjyro-h02',
    name: 'SJYRO VK18 Silhouette Heavyweight Hoodie',
    category: 'Hoodies',
    price: 185,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1200'
    ],
    hoverImage: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=1200',
    description: 'Designed for the ultimate loyalists. This heavyweight black hoodie features a minimalist white back print of the legendary VK "18" jersey number coupled with a striking cricketer profile silhouette in black, finished with a signaturesque red script and the statement: \'DIE HARD FANS HERE\'. Engineered from ultra-dense 480GSM French Terry cotton.',
    fabricDetails: '100% Organic Cotton French Terry. Pre-shrunk, heavyweight 480GSM, ultra-soft finish.',
    careInstructions: 'Machine wash cold inside-out on gentle cycle. Hang dry in shade. Do not iron over direct print.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pitch Black', hex: '#000000' }
    ],
    stock: 18,
    rating: 5.0,
    isBestSeller: true,
    isTrending: true,
    features: ['VK18 Silhouette Back Graphic', '480GSM Heavyweight French Terry', 'Snug Double-Lined Hood', 'Ribbed Cuffs & Hem'],
    estimatedDelivery: '2-4 Business Days',
    reviews: [
      {
        id: 'rev-03',
        userName: 'Aakash K.',
        userEmail: 'aakash@example.com',
        rating: 5,
        comment: 'The perfect tribute hoodie for the King. The silhouette and "18" print is stunning and doesn’t fade. Hoodie itself is incredibly heavy and luxurious.',
        date: '2026-07-02',
        verifiedPurchase: true
      }
    ]
  },
  {
    id: 'sjyro-t01',
    name: 'SJYRO Greek Bust Classic Black T-Shirt',
    category: 'Oversized T-Shirts',
    price: 85,
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200'
    ],
    hoverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200',
    description: 'An artistic fusion of classical antiquity and high-end street culture. This oversized black tee centers a high-density print of a classical Greek bust with a striking white brush stroke over the eyes, juxtaposed with \'SJYRO\', Japanese kanji characters, and motivational statements like \'CREATE YOUR OWN FUTURE\' and \'KEEP MOVING FORWARD\'. Crafted from 280GSM organic combed cotton with a robust mock neck collar.',
    fabricDetails: '100% Combed Ring-Spun Cotton. Heavyweight 280GSM. Ultra-soft luxury silicone washed.',
    careInstructions: 'Machine wash cold with like colors inside-out. Hang dry or tumble dry low.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Core Black', hex: '#0A0A0A' }
    ],
    stock: 24,
    rating: 4.8,
    isNewArrival: true,
    isTrending: true,
    features: ['Greek Statue Eye-Stroke Print', 'SJYRO Modern Kanji Graphics', '280GSM Heavyweight Jersey', 'Snug Mock Neck Collar'],
    estimatedDelivery: '2-4 Business Days',
    reviews: [
      {
        id: 'rev-04',
        userName: 'Marcus S.',
        userEmail: 'marcus@example.com',
        rating: 5,
        comment: 'This is art in a t-shirt format. The graphics are so clean, and the text overlay has a real aesthetic look. The fit is perfect boxy and the mock neck sits very nicely.',
        date: '2026-07-05',
        verifiedPurchase: true
      }
    ]
  }
];
