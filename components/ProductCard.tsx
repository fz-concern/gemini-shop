'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { cleanHtmlText, formatCurrency } from '@/lib/utils';
import { ShoppingCart, Info, Minus, Plus, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
  onBuy: (product: Product, quantity: number) => void;
  isOrdering: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuy,
  isOrdering,
}) => {
  const minQty = Math.max(1, product.minBuy || 1);
  const maxQty = Math.min(product.stock, product.maxBuy || 100);
  const [quantity, setQuantity] = useState<number>(minQty);

  const cleanedTitle = cleanHtmlText(product.name);
  const cleanedDesc = cleanHtmlText(product.description);
  const isOutOfStock = !product.inStock || product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < maxQty) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > minQty) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="cream-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group border border-[#E8DFD1]">
      
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-colors pointer-events-none" />

      <div>
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 mb-4">
          
          {/* Category Badge */}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-cream-100 text-espresso-700 border border-cream-200">
            <Sparkles className="w-3 h-3 text-gold-500" />
            {product.category || 'Digital'}
          </span>

          {/* Stock Status Badge */}
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
              <XCircle className="w-3.5 h-3.5" />
              Out of Stock
            </span>
          ) : product.stock < 10 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              Only {product.stock} Left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              In Stock ({product.stock})
            </span>
          )}

        </div>

        {/* Product Title - Links directly to /product/[id] */}
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-xl font-extrabold text-espresso-900 leading-snug mb-3 hover:text-gold-600 transition-colors">
            {cleanedTitle}
          </h3>
        </Link>

        {/* Description Excerpt */}
        <p className="text-xs text-espresso-500/90 leading-relaxed mb-6 line-clamp-3 font-normal">
          {cleanedDesc}
        </p>
      </div>

      {/* Pricing & Order Action Area */}
      <div className="pt-4 border-t border-cream-200 space-y-4">
        
        {/* Price Display */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-espresso-400">Price</p>
            <p className="text-2xl font-black text-espresso-900">
              {formatCurrency(product.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-bold text-espresso-400">Total Price</p>
            <p className="text-lg font-extrabold text-gold-600">
              {formatCurrency(product.price * quantity)}
            </p>
          </div>
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="flex items-center justify-between gap-3 bg-cream-50 p-2 rounded-2xl border border-cream-200">
            <span className="text-xs font-bold text-espresso-700 pl-2">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= minQty || isOrdering}
                className="w-8 h-8 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-espresso-800 hover:bg-cream-100 disabled:opacity-40 font-bold"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-extrabold text-espresso-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= maxQty || isOrdering}
                className="w-8 h-8 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-espresso-800 hover:bg-cream-100 disabled:opacity-40 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-5 gap-2">
          
          {/* Navigate to Dedicated Product Detail Page */}
          <Link
            href={`/product/${product.id}`}
            className="col-span-2 py-3 px-3 rounded-2xl bg-cream-100 hover:bg-cream-200/70 text-espresso-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-cream-200"
          >
            <Info className="w-4 h-4 text-espresso-600" />
            <span>Details</span>
          </Link>

          {/* Instant Purchase CTA */}
          <button
            type="button"
            disabled={isOutOfStock || isOrdering}
            onClick={() => onBuy(product, quantity)}
            className={`col-span-3 py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-cream-200 text-espresso-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isOrdering ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-gold-400" />
                <span>{isOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};
