
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, arrayUnion, Timestamp, where, query, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Product, VendorContribution, User, ProductStatus, Review } from './types';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import { generateProductDescription } from '@/ai/flows/generate-product-description-flow';

// Helper function to convert Firestore doc to Product
const toProduct = async (doc: any): Promise<Product> => {
    const data = doc.data();
    const reviewsCollection = collection(db, 'products', doc.id, 'reviews');
    const reviewsSnapshot = await getDocs(reviewsCollection);
    const reviews = reviewsSnapshot.docs.map(reviewDoc => ({id: reviewDoc.id, ...reviewDoc.data()})) as Review[];

    return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JS Date if it exists
        timeLimit: data.timeLimit instanceof Timestamp ? data.timeLimit.toDate().toISOString() : data.timeLimit,
        reviews,
    } as Product;
};

export const getProducts = async (): Promise<Product[]> => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const products = await Promise.all(querySnapshot.docs.map(toProduct));
    return products;
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const productData = docSnap.data();
        const reviewsCollection = collection(db, 'products', docSnap.id, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsCollection);
        const reviews = reviewsSnapshot.docs.map(reviewDoc => ({id: reviewDoc.id, ...reviewDoc.data()})) as Review[];

        return {
            id: docSnap.id,
            ...productData,
            timeLimit: (productData.timeLimit as Timestamp),
            reviews
        } as Product;
    } else {
        return undefined;
    }
};

export const addProduct = async (product: Omit<Product, 'id' | 'currentQuantity' | 'contributions' | 'description' | 'imageUrl' | 'supplierId' | 'status' | 'reviews' | 'averageRating' | 'reviewCount'>, user: User): Promise<Product> => {
    
    const [imageUrl, description] = await Promise.all([
        generateProductImage({productName: product.name}),
        generateProductDescription({productName: product.name})
    ]);

    const newProductData = {
        ...product,
        supplierId: user.uid,
        supplierName: user.name,
        timeLimit: Timestamp.fromDate(product.timeLimit as any), // Convert JS Date to Firestore Timestamp
        currentQuantity: 0,
        contributions: [],
        imageUrl: imageUrl,
        description: description,
        status: 'Active' as ProductStatus,
        averageRating: 0,
        reviewCount: 0,
    };

    const docRef = await addDoc(collection(db, 'products'), newProductData);

    return {
        id: docRef.id,
        reviews: [],
        ...newProductData
    };
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
}

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

export const updateProductStatus = async (productId: string, status: ProductStatus): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { status });
};

export const getProductsBySupplier = async (supplierId: string): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('supplierId', '==', supplierId));
    const querySnapshot = await getDocs(q);
    return await Promise.all(querySnapshot.docs.map(toProduct));
};

export const getProductsByVendorContribution = async (vendorId: string): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('contributions', 'array-contains', { vendorId: vendorId }));
    
    const querySnapshot = await getDocs(collection(db, 'products'));
    const allProducts = await Promise.all(querySnapshot.docs.map(doc => toProduct(doc)));
    
    const contributedProducts = allProducts.filter(p => 
        p.contributions.some(c => c.vendorId === vendorId)
    );

    return contributedProducts;
};

export const addReview = async (productId: string, supplierId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const batch = writeBatch(db);

    // 1. Add review to subcollection
    const reviewRef = doc(collection(db, 'products', productId, 'reviews'));
    batch.set(reviewRef, { ...reviewData, createdAt: Timestamp.now() });

    // 2. Update product's average rating
    const productRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productRef);
    const productData = productDoc.data() as Product;

    const newReviewCount = (productData.reviewCount || 0) + 1;
    const oldRatingTotal = (productData.averageRating || 0) * (productData.reviewCount || 0);
    const newAverageRating = (oldRatingTotal + reviewData.rating) / newReviewCount;
    
    batch.update(productRef, {
        reviewCount: newReviewCount,
        averageRating: newAverageRating
    });

    // 3. Update supplier's overall rating
    const supplierRef = doc(db, 'users', supplierId);
    const supplierDoc = await getDoc(supplierRef);
    const supplierData = supplierDoc.data() as User;
    
    const currentSupplierRating = supplierData.supplierRating || { count: 0, average: 0 };
    const newSupplierReviewCount = currentSupplierRating.count + 1;
    const oldSupplierRatingTotal = currentSupplierRating.average * currentSupplierRating.count;
    const newSupplierAverage = (oldSupplierRatingTotal + reviewData.rating) / newSupplierReviewCount;

    batch.update(supplierRef, {
        supplierRating: {
            count: newSupplierReviewCount,
            average: newSupplierAverage
        }
    });

    // 4. Commit all writes
    await batch.commit();
}
