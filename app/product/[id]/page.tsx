'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, CustomerOrder } from '@/lib/types';
import { fetchProductById } from '@/lib/api';
import { cleanHtmlText, formatCurrency } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { PaymentCheckoutModal } from '@/components/PaymentCheckoutModal';
import { TrackOrderModal } from '@/components/TrackOrderModal';
import { ArrowLeft, ShoppingCart, Minus, Plus, CheckCircle2, ShieldAlert, Sparkles, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const [isTrackOpen, setIsTrackOpen] = useState<boolean>(false);
  const [activeSubmittedOrder, setActiveSubmittedOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchProductById(id)
        .then((data) => {
          setProduct(data);
          setQuantity(Math.max(1, data.minBuy || 1));
        })
        .catch((err) => setError(err.message || 'Failed to load product details'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar onOpenTrackOrder={() => setIsTrackOpen(true)} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-espresso-700">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar onOpenTrackOrder={() => setIsTrackOpen(true)} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="cream-card p-8 rounded-3xl text-center max-w-md space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h2 className="text-xl font-bold text-espresso-900">Product Not Found</h2>
            <p className="text-xs text-espresso-500">{error || 'The requested product is not available.'}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl btn-primary text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const minQty = Math.max(1, product.minBuy || 1);
  const maxQty = Math.min(product.stock, product.maxBuy || 100);
  const isOutOfStock = !product.inStock || product.stock <= 0;
  const cleanedTitle = cleanHtmlText(product.name);
  const cleanedDesc = cleanHtmlText(product.description);

  const handleIncrement = () => {
    if (quantity < maxQty) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > minQty) setQuantity((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-cream-50 text-espresso-900 font-sans flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar onOpenTrackOrder={() => setIsTrackOpen(true)} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-espresso-500">
          <Link href="/" className="hover:text-espresso-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Products</span>
          </Link>
          <span>/</span>
          <span className="text-espresso-800 font-extrabold">{cleanedTitle}</span>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Summary Card */}
          <div className="lg:col-span-5 cream-card p-8 rounded-3xl space-y-6">
            
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cream-100 text-espresso-700 border border-cream-200">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                {product.category || 'Digital'}
              </span>

              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  Out of Stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {product.stock} Units In Stock
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-espresso-900 leading-tight">
                {cleanedTitle}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-extrabold text-espresso-400">Unit Price</p>
                <p className="text-3xl font-black text-espresso-900">{formatCurrency(product.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-extrabold text-espresso-400">Total Amount</p>
                <p className="text-2xl font-black text-gold-600">{formatCurrency(product.price * quantity)}</p>
              </div>
            </div>

            {/* Quantity Controls */}
            {!isOutOfStock && (
              <div className="space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-espresso-600">
                  Select Quantity
                </label>
                <div className="flex items-center justify-between bg-cream-50 p-2 rounded-2xl border border-cream-200">
                  <span className="text-xs font-extrabold text-espresso-800 pl-2">Quantity:</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= minQty}
                      className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-espresso-800 hover:bg-cream-100 disabled:opacity-40 font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-espresso-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= maxQty}
                      className="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-espresso-800 hover:bg-cream-100 disabled:opacity-40 font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              disabled={isOutOfStock}
              onClick={() => setIsCheckoutOpen(true)}
              className={`w-full py-4 px-6 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                isOutOfStock ? 'bg-cream-200 text-espresso-400 cursor-not-allowed' : 'btn-gold shadow-cream-md'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Sold Out' : `Proceed to Payment (${formatCurrency(product.price * quantity)})`}</span>
            </button>

          </div>

          {/* Right Column: Full Specifications & Redemption Steps */}
          <div className="lg:col-span-7 cream-card p-8 rounded-3xl space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-espresso-900 mb-2">
                Product Details & Redemption Instructions
              </h3>
              <div className="whitespace-pre-line bg-cream-50 p-6 rounded-2xl border border-cream-200/80 text-sm leading-relaxed text-espresso-800 font-normal">
                {cleanedDesc}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700" /> Automated Verification & Link Delivery
              </p>
              <p className="text-amber-800/90 leading-relaxed">
                After transferring payment and submitting your transfer screenshot, your activation link will be delivered directly to your WhatsApp / Email upon store owner verification.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Checkout Modal */}
      <PaymentCheckoutModal
        product={product}
        quantity={quantity}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(order) => {
          setIsCheckoutOpen(false);
          setActiveSubmittedOrder(order);
          setIsTrackOpen(true);
        }}
      />

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        initialOrder={activeSubmittedOrder}
      />

      {/* Footer */}
      <footer className="cream-glass border-t border-[#E6DCCB] py-8 text-center text-xs text-espresso-500 font-medium">
        TeleShop Premium Digital Store • Instant 24/7 Automated Fulfillment
      </footer>

    </div>
  );
}
