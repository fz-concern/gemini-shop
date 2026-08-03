'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { cleanHtmlText, formatCurrency } from '@/lib/utils';
import { X, ShoppingCart, Minus, Plus, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product, quantity: number) => void;
  isOrdering: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onBuy,
  isOrdering,
}) => {
  if (!product) return null;

  const minQty = Math.max(1, product.minBuy || 1);
  const maxQty = Math.min(product.stock, product.maxBuy || 100);
  const [quantity, setQuantity] = useState<number>(minQty);

  const cleanedTitle = cleanHtmlText(product.name);
  const cleanedDesc = cleanHtmlText(product.description);
  const isOutOfStock = !product.inStock || product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < maxQty) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > minQty) setQuantity((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-start justify-between gap-4 bg-cream-50/50">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-gold-600 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20 mb-2">
              <Sparkles className="w-3 h-3 text-gold-500" />
              {product.category || 'Product Details'}
            </span>
            <h2 className="text-2xl font-black text-espresso-900 leading-tight">
              {cleanedTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-espresso-800 text-sm leading-relaxed">
          
          {/* Price & Stock Highlight */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-espresso-400">Price per item</p>
              <p className="text-2xl font-extrabold text-espresso-900">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-espresso-400">Availability</p>
              <p className="text-base font-extrabold flex items-center gap-1.5 mt-1">
                {isOutOfStock ? (
                  <span className="text-red-600 font-bold">Out of stock</span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {product.stock} Units Available
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Description & Rules */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-espresso-400 mb-2">
              Product Description & Redemption Guide
            </h4>
            <div className="whitespace-pre-line bg-cream-50/70 p-4 rounded-2xl border border-cream-200/70 font-normal text-espresso-800 text-sm leading-relaxed">
              {cleanedDesc}
            </div>
          </div>

          {/* Important Notice */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-900 mb-0.5">Automated Delivery Policy</p>
              <p className="text-amber-800/90 leading-relaxed">
                Keys and activation links are delivered instantly after order confirmation. Please redeem your link or code within the specified window.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-cream-200 bg-cream-50/80 space-y-4">
          {!isOutOfStock && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-espresso-400">Selected Quantity</p>
                <p className="text-xl font-black text-gold-600">{formatCurrency(product.price * quantity)}</p>
              </div>

              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-2xl border border-cream-200 shadow-cream-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= minQty || isOrdering}
                  className="w-8 h-8 rounded-xl bg-cream-100 flex items-center justify-center text-espresso-800 hover:bg-cream-200 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-extrabold text-espresso-900 text-base">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= maxQty || isOrdering}
                  className="w-8 h-8 rounded-xl bg-cream-100 flex items-center justify-center text-espresso-800 hover:bg-cream-200 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-800 font-bold text-sm transition-colors border border-cream-200"
            >
              Close
            </button>

            <button
              disabled={isOutOfStock || isOrdering}
              onClick={() => onBuy(product, quantity)}
              className={`flex-1 py-3.5 px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                isOutOfStock ? 'bg-cream-200 text-espresso-400 cursor-not-allowed' : 'btn-gold'
              }`}
            >
              {isOrdering ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : `Confirm Purchase (${formatCurrency(product.price * quantity)})`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
