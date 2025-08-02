import { collection, getDocs, getDoc, doc, addDoc, updateDoc, arrayUnion, Timestamp, where, query } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, VendorContribution, User } from './types';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';

// Helper function to convert Firestore doc to Product
const toProduct = (doc: any): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JS Date if it exists
        timeLimit: data.timeLimit instanceof Timestamp ? data.timeLimit.toDate().toISOString() : data.timeLimit,
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
        const productData = docSnap.data();
        return {
            id: docSnap.id,
            ...productData,
            timeLimit: (productData.timeLimit as Timestamp),
        } as Product;
    } else {
        return undefined;
    }
};

export const addProduct = async (product: Omit<Product, 'id' | 'currentQuantity' | 'contributions' | 'description' | 'imageUrl' | 'supplierId'>, user: User): Promise<Product> => {
    
    const [imageUrl, description] = await Promise.all([
        generateProductImage({productName: product.name}),
        generateProductDescription({productName: product.name})
    ]);

    const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        supplierId: user.uid,
        supplierName: user.name,
        timeLimit: Timestamp.fromDate(product.timeLimit as any), // Convert JS Date to Firestore Timestamp
        currentQuantity: 0,
        contributions: [],
        imageUrl: imageUrl,
        description: description,
    });

    return {
        ...product,
        id: docRef.id,
        supplierId: user.uid,
        supplierName: user.name,
        currentQuantity: 0,
        contributions: [],
        imageUrl: imageUrl,
        description: description,
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

export const getProductsBySupplier = async (supplierId: string): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('supplierId', '==', supplierId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(toProduct);
};

export const getProductsByVendorContribution = async (vendorId: string): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('contributions', 'array-contains', { vendorId: vendorId }));
    
    const querySnapshot = await getDocs(collection(db, 'products'));
    const allProducts = querySnapshot.docs.map(toProduct);
    
    const contributedProducts = allProducts.filter(p => 
        p.contributions.some(c => c.vendorId === vendorId)
    );

    return contributedProducts;
};
