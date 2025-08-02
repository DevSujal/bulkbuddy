
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SupplierDashboard } from '@/components/SupplierDashboard';
import { VendorDashboard } from '@/components/VendorDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {user.role === 'supplier' && <SupplierDashboard user={user} />}
      {user.role === 'vendor' && <VendorDashboard user={user} />}
    </div>
  );
}
