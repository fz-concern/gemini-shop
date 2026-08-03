'use client';

import React, { useState } from 'react';
import { CustomerOrder } from '@/lib/types';
import { cleanHtmlText, formatCurrency, formatDate, isUrl } from '@/lib/utils';
import { fetchCustomerOrders } from '@/lib/api';
import { X, Search, Clock, CheckCircle2, XCircle, Copy, ExternalLink, Sparkles, MessageSquare, Mail } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrder?: CustomerOrder | null;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrder,
}) => {
  const [query, setQuery] = useState<string>('');
  const [orders, setOrders] = useState<CustomerOrder[]>(initialOrder ? [initialOrder] : []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(!!initialOrder);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(id);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-center justify-between gap-4 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-espresso-900">
                Track Order & Link Delivery
              </h2>
              <p className="text-xs text-espresso-500 font-medium">Check payment status & retrieve activation links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-4 border-b border-cream-200 bg-cream-50/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Tracking ID (e.g. ORD-...) or WhatsApp/Email"
              className="w-full pl-10 pr-24 py-3 rounded-xl bg-white border border-cream-200 text-xs font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg btn-gold text-xs font-extrabold"
            >
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {orders.length > 0 ? (
            orders.map((order) => {
              const cleanedTitle = cleanHtmlText(order.productName);
              const isApproved = order.status === 'approved';
              const isRejected = order.status === 'rejected';

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-3"
                >
                  {/* Top Status Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : isRejected
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isApproved ? 'Approved & Delivered' : isRejected ? 'Payment Rejected' : 'Pending Verification'}
                      </span>
                      <span className="text-xs font-mono font-bold text-espresso-600">#{order.orderCode}</span>
                    </div>

                    <span className="text-[11px] text-espresso-500 font-medium">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h4 className="text-base font-extrabold text-espresso-900">{cleanedTitle}</h4>
                    <p className="text-xs text-espresso-500">
                      Qty: {order.quantity} • Total: {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-xs text-espresso-600 font-medium mt-1 flex items-center gap-1">
                      {order.contactMethod === 'whatsapp' ? <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-espresso-600" />}
                      <span>{order.contactValue}</span>
                    </p>
                  </div>

                  {/* Status Banner */}
                  {isApproved ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-3">
                      <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Payment Verified! Here are your activation links/codes:
                      </p>

                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const isLink = isUrl(item);
                            return (
                              <div key={idx} className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
                                <p className="font-mono text-xs text-espresso-900 break-all select-all">{item}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCopy(item, `${order.id}-${idx}`)}
                                    className="px-2.5 py-1 rounded-md bg-cream-100 hover:bg-cream-200 text-xs font-bold text-espresso-800 flex items-center gap-1"
                                  >
                                    {copiedIdx === `${order.id}-${idx}` ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Link</span>
                                      </>
                                    )}
                                  </button>
                                  {isLink && (
                                    <a
                                      href={item}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-md btn-gold text-xs font-bold flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Redeem</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-800">
                          Activation link was processed. Please check your WhatsApp/Email inbox.
                        </p>
                      )}
                    </div>
                  ) : isRejected ? (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-red-600" /> Payment Rejected
                      </p>
                      <p className="text-red-700">{order.rejectionReason}</p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 space-y-1">
                      <p className="font-extrabold flex items-center gap-1">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Approval
                      </p>
                      <p className="text-amber-800/90 leading-relaxed">
                        Your payment receipt has been submitted to store owner. Activation link will be sent to your {order.contactMethod === 'whatsapp' ? 'WhatsApp' : 'Email'} as soon as approved!
                      </p>
                    </div>
                  )}

                </div>
              );
            })
          ) : hasSearched ? (
            <div className="py-12 text-center text-espresso-500 text-xs space-y-2">
              <Search className="w-8 h-8 text-cream-300 mx-auto" />
              <p className="font-bold text-espresso-800 text-sm">No orders found matching search</p>
              <p>Verify your Tracking ID or contact information.</p>
            </div>
          ) : (
            <div className="py-12 text-center text-espresso-500 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-gold-400 mx-auto" />
              <p className="font-bold text-espresso-800 text-sm">Track your order status</p>
              <p>Enter your Tracking ID (e.g. ORD-123456) or your WhatsApp/Email above.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/80">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-espresso-800 text-cream-50 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
