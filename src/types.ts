/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string; // 'Hoodies' | 'Oversized T-Shirts' | 'Shirts' | 'Collections' | 'DTF Printed' | 'Limited Drop'
  price: number;
  originalPrice?: number;
  images: string[];
  hoverImage?: string;
  description: string;
  fabricDetails: string;
  careInstructions: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  rating: number;
  reviews: Review[];
  isLimitedDrop?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  features: string[];
  estimatedDelivery: string;
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSubtotal?: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Processing' | 'Shipped' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Returned';
  trackingNumber?: string;
  giftWrap?: boolean;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  addresses: {
    id: string;
    isDefault: boolean;
    fullName: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  }[];
  wishlist: string[]; // Product IDs
}
