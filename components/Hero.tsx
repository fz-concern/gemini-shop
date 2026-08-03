'use client';

import React from 'react';
import { Search, Zap, ShieldCheck, Clock, Sparkles } from 'lucide-react';

interface HeroProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalProductsCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalProductsCount,
}) => {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Decorative Warm Background Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cream-300/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto space-y-6">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-cream-200 shadow-cream-sm text-xs font-semibold text-espresso-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-4" />
          <span>Bot Store Online & Ready</span>
          <span className="text-cream-300">•</span>
          <span className="text-gold-600 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-gold-500" /> Instant Delivery
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-espresso-900 tracking-tight leading-tight">
          Automated Digital Products <br className="hidden sm:inline" />
          <span className="gold-gradient-text">Premium Subscription Links</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-espresso-500 max-w-2xl mx-auto font-normal leading-relaxed">
          Get direct access to verified 18-month Gemini AI links, VPN vouchers, and digital accounts with instant automated delivery.
        </p>

        {/* Trust Badges Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-espresso-700">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-cream-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed Active Links</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-cream-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>24/7 Auto-Fulfillment</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/60 border border-cream-200">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>{totalProductsCount} Live {totalProductsCount === 1 ? 'Product' : 'Products'} Available</span>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="pt-4 max-w-xl mx-auto space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, links, vpn coupons..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-cream-200 text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 shadow-cream-sm text-sm font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-espresso-400 hover:text-espresso-700 bg-cream-100 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          {categories.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
              <button
                onClick={() => onSelectCategory('ALL')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  selectedCategory === 'ALL'
                    ? 'bg-espresso-800 text-cream-50 shadow-cream-sm scale-105'
                    : 'bg-white/80 hover:bg-cream-100 text-espresso-700 border border-cream-200'
                }`}
              >
                All Products ({totalProductsCount})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-espresso-800 text-cream-50 shadow-cream-sm scale-105'
                      : 'bg-white/80 hover:bg-cream-100 text-espresso-700 border border-cream-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
