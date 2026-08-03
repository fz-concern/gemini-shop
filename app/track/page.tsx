'use client';

import React, { useState } from 'react';
import { CustomerOrder } from '@/lib/types';
import { fetchCustomerOrders } from '@/lib/api';
import { cleanHtmlText, formatCurrency, formatDate } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { Search, PackageCheck, Clock, CheckCircle2, XCircle, ArrowLeft, ChevronRight, MessageSquare, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TrackPage() {
  const [query, setQuery] = useState<string>('');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetchCustomerOrders(query.trim());
      setOrders(res);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-espresso-900 font-sans flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar onOpenTrackOrder={() => {}} />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-espresso-500">
          <Link href="/" className="hover:text-espresso-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <span>/</span>
          <span className="text-espresso-800 font-extrabold">Track Order</span>
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-espresso-900">
              Track Order & Activation Links
            </h1>
            <p className="text-xs sm:text-sm text-espresso-500 font-medium">
              Enter your Order Tracking ID (e.g. ORD-123456) or your WhatsApp/Email below.
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="cream-card p-6 rounded-3xl space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking ID (e.g. ORD-...) or WhatsApp/Email"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl btn-gold text-xs font-extrabold shadow-cream-sm"
            >
              {isLoading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order) => {
              const cleanedTitle = cleanHtmlText(order.productName);
              return (
                <Link
                  key={order.id}
                  href={`/order/${order.orderCode}`}
                  className="cream-card p-6 rounded-3xl flex items-center justify-between gap-4 hover:border-gold-500/50 transition-all cursor-pointer block group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          order.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : order.status === 'rejected'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {order.status === 'approved' ? 'Approved' : order.status === 'rejected' ? 'Rejected' : 'Pending Verification'}
                      </span>
                      <span className="text-xs font-mono font-bold text-espresso-600">#{order.orderCode}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-espresso-900 group-hover:text-gold-600 transition-colors truncate">
                      {cleanedTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-espresso-500 font-medium">
                      <span>Qty: {order.quantity}</span>
                      <span>•</span>
                      <span className="font-extrabold text-gold-600">{formatCurrency(order.totalAmount)}</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-cream-100 group-hover:bg-gold-500/10 text-espresso-600 group-hover:text-gold-600 flex items-center justify-center transition-colors flex-shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              );
            })
          ) : hasSearched ? (
            <div className="cream-card p-10 rounded-3xl text-center text-espresso-500 space-y-2">
              <Search className="w-8 h-8 text-cream-300 mx-auto" />
              <h3 className="text-base font-extrabold text-espresso-900">No orders found</h3>
              <p className="text-xs text-espresso-500">Please check your tracking code or contact information and try again.</p>
            </div>
          ) : null}
        </div>

      </main>

      {/* Footer */}
      <footer className="cream-glass border-t border-[#E6DCCB] py-8 text-center text-xs text-espresso-500 font-medium">
        TeleShop Premium Digital Store • Instant 24/7 Automated Link Fulfillment
      </footer>

    </div>
  );
}
