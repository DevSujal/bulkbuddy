export interface VendorContribution {
  vendorId: string;
  vendorName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  unitPrice: number;
  minBulkQuantity: number;
  currentQuantity: number;
  timeLimit: Date;
  location?: string;
  contributions: VendorContribution[];
}
