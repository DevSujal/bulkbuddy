import type { Product } from './types';

let products: Product[] = [
  {
    id: 'prod-1',
    name: 'Organic Potatoes',
    category: 'Vegetable',
    supplierName: 'Green Farms',
    unitPrice: 1.5,
    minBulkQuantity: 500,
    currentQuantity: 270,
    timeLimit: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: 'Warehouse A, Springfield',
    contributions: [
      { vendorId: 'vend-1', vendorName: 'The Corner Cafe', quantity: 100 },
      { vendorId: 'vend-2', vendorName: 'Burger Palace', quantity: 150 },
      { vendorId: 'vend-3', vendorName: 'Salad Haven', quantity: 20 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Vine-Ripened Tomatoes',
    category: 'Vegetable',
    supplierName: 'Sun Valley Orchards',
    unitPrice: 2.2,
    minBulkQuantity: 300,
    currentQuantity: 120,
    timeLimit: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    location: 'Pickup Point B',
    contributions: [
        { vendorId: 'vend-4', vendorName: 'Pizza Shed', quantity: 80 },
        { vendorId: 'vend-1', vendorName: 'The Corner Cafe', quantity: 40 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Extra Virgin Olive Oil',
    category: 'Pantry',
    supplierName: 'Mediterranean Imports',
    unitPrice: 15,
    minBulkQuantity: 100,
    currentQuantity: 95,
    timeLimit: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    contributions: [
        { vendorId: 'vend-5', vendorName: 'Pasta Place', quantity: 50 },
        { vendorId: 'vend-3', vendorName: 'Salad Haven', quantity: 25 },
        { vendorId: 'vend-2', vendorName: 'Burger Palace', quantity: 20 },
    ],
  },
    {
    id: 'prod-4',
    name: 'Angus Beef Mince',
    category: 'Meat',
    supplierName: 'Butcher\'s Block',
    unitPrice: 8.5,
    minBulkQuantity: 200,
    currentQuantity: 200,
    timeLimit: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    location: 'Cold Storage Z',
    contributions: [
        { vendorId: 'vend-2', vendorName: 'Burger Palace', quantity: 200 },
    ],
  },
];

export const getProducts = (): Product[] => {
  return products;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const addProduct = (product: Omit<Product, 'id' | 'currentQuantity' | 'contributions'>): Product => {
    const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        currentQuantity: 0,
        contributions: [],
    };
    products.unshift(newProduct);
    return newProduct;
}

export const addContribution = (productId: string, contribution: { quantity: number, vendorName: string }): Product | undefined => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return undefined;

    const newContribution = {
        vendorId: `vend-${Date.now()}`,
        vendorName: contribution.vendorName,
        quantity: contribution.quantity,
    };
    
    products[productIndex].contributions.push(newContribution);
    products[productIndex].currentQuantity += contribution.quantity;
    
    return products[productIndex];
}
