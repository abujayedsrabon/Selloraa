import { ReactNode } from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Vendor {
  uid: string;
  storeName: string;
  slug: string;
  logo?: string;
  location?: string;
  packageId?: string;
  createdAt: any;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: any;
}

export interface Order {
  id: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  fakeProbability?: number;
  createdAt: any;
}
