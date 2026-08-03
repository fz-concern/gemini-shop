'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { fetchProducts } from '@/lib/api';
import { cleanHtmlText } from '@/lib/utils';
import { AlertCircle, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const loadData = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const prods = await fetchProducts();
      setProducts(prods);
    } catch (err: any) {
      setProductsError(err.message || 'Error loading products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const title = cleanHtmlText(p.name).toLowerCase();
      const desc = cleanHtmlText(p.description).toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || title.includes(query) || desc.includes(query);
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleBuyClick = (product: Product, quantity: number) => {
    // Navigate directly to dedicated checkout page!
    window.location.href = `/checkout/${product.id}?qty=${quantity}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Customer Navbar */}
      <Navbar
        onOpenTrackOrder={() => {
          window.location.href = '/track';
        }}
      />

      {/* Main Content */}
      <main className="flex-1 pb-16">
        
        {/* Hero Section */}
        <Hero
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          totalProductsCount={products.length}
        />

        {/* Product Catalog Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-espresso-900 tracking-tight">
                Available Digital Products
              </h2>
              <p className="text-xs sm:text-sm text-espresso-500 font-medium">
                Select your product, view details, transfer payment via bank/EasyPaisa/JazzCash/USDT, and upload receipt screenshot.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={isLoadingProducts}
              className="px-3.5 py-2 rounded-xl bg-white border border-cream-200 text-espresso-700 hover:text-espresso-900 text-xs font-bold flex items-center gap-1.5 shadow-cream-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProducts ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">Reload Products</span>
            </button>
          </div>

          {/* Loading Skeleton */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="cream-card rounded-3xl p-6 h-80 animate-pulse space-y-4">
                  <div className="h-6 bg-cream-200 rounded-full w-1/3" />
                  <div className="h-8 bg-cream-200 rounded-xl w-3/4" />
                  <div className="h-16 bg-cream-100 rounded-2xl w-full" />
                  <div className="h-12 bg-cream-200 rounded-2xl w-full pt-4" />
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto space-y-4">
              <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
              <h3 className="text-lg font-bold text-red-900">Failed to load API products</h3>
              <p className="text-xs text-red-700">{productsError}</p>
              <button
                onClick={loadData}
                className="py-2.5 px-5 rounded-2xl bg-red-900 text-white text-xs font-bold hover:bg-red-800 transition-all shadow-md"
              >
                Retry Request
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onBuy={handleBuyClick}
                  isOrdering={false}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center cream-card rounded-3xl p-8 max-w-md mx-auto space-y-3">
              <ShoppingBag className="w-10 h-10 text-cream-400 mx-auto" />
              <h3 className="text-lg font-bold text-espresso-800">No products match your search</h3>
              <p className="text-xs text-espresso-500">Try adjusting your category filter or search keywords.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="py-2.5 px-4 rounded-xl bg-espresso-800 text-cream-50 text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="cream-glass border-t border-[#E6DCCB] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-espresso-500 font-medium">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-espresso-800 text-gold-400 flex items-center justify-center font-bold">
              TS
            </div>
            <div>
              <p className="font-extrabold text-espresso-900 text-sm">TeleShop Digital Store</p>
              <p className="text-[11px]">Instant automated delivery upon payment verification</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/track" className="hover:text-espresso-900 font-bold">
              Track Order Status
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Active Subscription Links</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
