import { collection, getDocs, getDoc, doc, addDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, VendorContribution } from './types';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';

// Helper function to convert Firestore doc to Product
const toProduct = (doc: any): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JS Date
        timeLimit: data.timeLimit,
    } as Product;
};

export const getProducts = async (): Promise<Product[]> => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = querySnapshot.docs.map(toProduct);
    return products;
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return toProduct(docSnap);
    } else {
        return undefined;
    }
};

export const addProduct = async (product: Omit<Product, 'id' | 'currentQuantity' | 'contributions'>): Promise<Product> => {
    
    const imageUrl = await generateProductImage({productName: product.name});

    const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        timeLimit: Timestamp.fromDate(product.timeLimit as any), // Convert JS Date to Firestore Timestamp
        currentQuantity: 0,
        contributions: [],
        imageUrl: imageUrl,
    });

    return {
        ...product,
        id: docRef.id,
        currentQuantity: 0,
        contributions: [],
        imageUrl: imageUrl,
    };
};

export const addContribution = async (productId: string, contribution: VendorContribution): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
        throw new Error("Product not found");
    }

    const productData = productSnap.data();
    const newQuantity = productData.currentQuantity + contribution.quantity;

    await updateDoc(productRef, {
        contributions: arrayUnion(contribution),
        currentQuantity: newQuantity,
    });
};
