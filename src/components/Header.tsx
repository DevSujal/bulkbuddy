'use client';

import Link from 'next/link';
import { ShoppingBasket, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-110 transition-transform">
                <ShoppingBasket className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-headline text-foreground tracking-tight">
              BulkBuddy
            </span>
          </Link>

          <nav className="flex items-center gap-4">
             <Link href="/products/create">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Create Listing
                </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
