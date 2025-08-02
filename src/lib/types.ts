import { Timestamp } from "firebase/firestore";

export interface VendorContribution {
  vendorId: string;
  vendorName: string;
  quantity: number;
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
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'vendor' | 'supplier';
}
