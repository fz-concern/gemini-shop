'use client';

import React from 'react';
import { ShoppingBag, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenTrackOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrackOrder }) => {
  return (
    <header className="sticky top-0 z-40 w-full cream-glass border-b border-[#E6DCCB]/80 shadow-cream-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-espresso-700 via-espresso-800 to-espresso-900 flex items-center justify-center text-gold-400 shadow-cream-md group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-espresso-900 tracking-tight">TeleShop</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/15 text-espresso-700 border border-gold-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold-500" /> Digital Store
              </span>
            </div>
            <p className="text-xs font-medium text-espresso-500/80">Verified AI & VPN Subscriptions</p>
          </div>
        </div>

        {/* Action Buttons for Customer */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Track Order Button */}
          <button
            onClick={onOpenTrackOrder}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-espresso-800 hover:bg-espresso-700 text-cream-50 text-xs sm:text-sm font-extrabold shadow-cream-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-4 h-4 text-gold-400" />
            <span>Track My Order</span>
          </button>

        </div>
      </div>
    </header>
  );
};
