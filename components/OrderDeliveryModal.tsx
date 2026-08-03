'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Order } from '@/lib/types';
import { cleanHtmlText, formatCurrency, formatDate, isUrl } from '@/lib/utils';
import { CheckCircle2, Copy, ExternalLink, X, PackageCheck, Clock, Sparkles } from 'lucide-react';

interface OrderDeliveryModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDeliveryModal: React.FC<OrderDeliveryModalProps> = ({ order, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (order && (order.status === 'completed' || order.status === 'confirm_paid')) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#5C4A3E', '#2D7A4D', '#F3C969'],
        });
      } catch (e) {
        // ignore fallback
      }
    }
  }, [order]);

  if (!order) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isCompleted = order.status === 'completed';
  const cleanedProductName = cleanHtmlText(order.productName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-start justify-between gap-4 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-cream-sm">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {order.status}
                </span>
                <span className="text-xs text-espresso-400 font-mono">#{order.orderCode}</span>
              </div>
              <h3 className="text-lg font-extrabold text-espresso-900 mt-1">
                Order Delivery Confirmation
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-espresso-800">
          
          {/* Order Metadata summary */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-espresso-500">Product:</span>
              <span className="font-extrabold text-espresso-900">{cleanedProductName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-espresso-500">Quantity:</span>
              <span className="font-bold text-espresso-900">{order.quantity}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-espresso-500">Total Paid:</span>
              <span className="font-extrabold text-gold-600 text-sm">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-cream-200/60">
              <span className="font-bold text-espresso-400">Date:</span>
              <span className="text-espresso-600 font-medium">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Delivered Items Area */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-espresso-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-500" />
                Delivered Items & Activation Links ({order.items?.length || 0})
              </h4>
            </div>

            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, idx) => {
                  const itemIsLink = isUrl(item);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-cream-50 border border-cream-200 hover:border-gold-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-espresso-400 mb-1">
                            Item #{idx + 1}
                          </p>
                          <p className="font-mono text-xs text-espresso-900 break-all bg-white p-3 rounded-xl border border-cream-200 select-all">
                            {item}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons for item */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(item, idx)}
                          className="px-3 py-2 rounded-xl bg-white border border-cream-200 hover:bg-cream-100 text-espresso-800 text-xs font-bold flex items-center gap-1.5 shadow-cream-sm transition-all"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-espresso-600" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        {itemIsLink && (
                          <a
                            href={item}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl btn-gold text-xs font-bold flex items-center gap-1.5 shadow-cream-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Redeem Now</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-cream-50 border border-cream-200 text-espresso-500 text-xs space-y-2">
                <Clock className="w-6 h-6 text-amber-500 mx-auto animate-pulse" />
                <p className="font-bold text-espresso-800 text-sm">Fulfillment in progress</p>
                <p>Your order is processing. Completed items will appear here shortly.</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cream-200 bg-cream-50/80">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-2xl btn-primary text-sm font-extrabold shadow-cream-md"
          >
            Done & Return to Shop
          </button>
        </div>
      </div>
    </div>
  );
};
