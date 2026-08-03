'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { cleanHtmlText, formatCurrency, formatDate } from '@/lib/utils';
import { X, Search, History, ChevronRight, Package, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  isLoading: boolean;
  onSelectOrder: (order: Order) => void;
  onRefreshOrders: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  isLoading,
  onSelectOrder,
  onRefreshOrders,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      cleanHtmlText(o.productName).toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-center justify-between gap-4 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-espresso-900">
                Order History ({orders.length})
              </h2>
              <p className="text-xs text-espresso-500 font-medium">Your recent purchases and digital keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-cream-200 bg-cream-50/30 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order code or product name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-cream-200 text-xs font-medium text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['ALL', 'completed', 'confirm_paid', 'expired', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-espresso-800 text-cream-50 shadow-cream-sm'
                    : 'bg-white text-espresso-600 border border-cream-200 hover:bg-cream-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-espresso-500 text-xs space-y-3">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading order history...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const cleanedTitle = cleanHtmlText(order.productName);
              return (
                <div
                  key={order.orderCode}
                  onClick={() => onSelectOrder(order)}
                  className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 hover:border-gold-500/50 hover:bg-white transition-all cursor-pointer group flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                          order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : order.status === 'confirm_paid'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs font-mono text-espresso-400">#{order.orderCode}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-espresso-900 group-hover:text-gold-600 transition-colors truncate">
                      {cleanedTitle}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-espresso-500 font-medium">
                      <span>Qty: {order.quantity}</span>
                      <span>•</span>
                      <span className="font-extrabold text-espresso-800">{formatCurrency(order.totalAmount)}</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-gold-500/10 text-espresso-400 group-hover:text-gold-600 flex items-center justify-center border border-cream-200 transition-colors flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-espresso-500 text-xs space-y-2">
              <Package className="w-8 h-8 text-cream-300 mx-auto" />
              <p className="font-bold text-espresso-700 text-sm">No orders found</p>
              <p>Purchased digital items and activation links will appear here.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/80 flex justify-between items-center text-xs">
          <button
            onClick={onRefreshOrders}
            className="text-espresso-600 font-bold hover:text-espresso-900 underline underline-offset-2"
          >
            Refresh Orders
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-espresso-800 text-cream-50 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
