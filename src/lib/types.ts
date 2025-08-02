
import { Timestamp } from "firebase/firestore";

export type ProductStatus = 'Active' | 'Fulfilled' | 'Shipped' | 'Cancelled';

export interface VendorContribution {
  vendorId: string;
  vendorName: string;
  quantity: number;
}

export interface Review {
  id: string;
  vendorId: string;
  vendorName: string;
  rating: number;
  comment?: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  minBulkQuantity: number;
  currentQuantity: number;
  timeLimit: Timestamp | string; // Allow string for client-side
  location?: string;
  contributions: VendorContribution[];
  imageUrl?: string;
  status: ProductStatus;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export interface User {
  uid: string;
  name:string;
  email: string;
  role: 'vendor' | 'supplier';
  supplierRating?: {
    average: number;
    count: number;
  };
}
