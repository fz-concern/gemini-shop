'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CustomerOrder } from '@/lib/types';
import { fetchCustomerOrders } from '@/lib/api';
import { cleanHtmlText, formatCurrency, formatDate, isUrl } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { CheckCircle2, Clock, Copy, ExternalLink, PackageCheck, Sparkles, XCircle, ArrowLeft, MessageSquare, Mail, Search } from 'lucide-react';
import Link from 'next/link';

export default function OrderStatusPage() {
  const params = useParams();
  const code = params?.code as string;

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (code) {
      setIsLoading(true);
      fetchCustomerOrders(code)
        .then((res) => {
          if (res && res.length > 0) {
            setOrder(res[0]);
          } else {
            setOrder(null);
          }
        })
        .catch(() => setOrder(null))
        .finally(() => setIsLoading(false));
    }
  }, [code]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-cream-50 text-espresso-900 font-sans flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar onOpenTrackOrder={() => { window.location.href = '/track'; }} />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-espresso-500">
          <Link href="/" className="hover:text-espresso-900 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
          <span>/</span>
          <span className="text-espresso-800 font-extrabold">Order Status #{code}</span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-espresso-700">Retrieving order status...</p>
          </div>
        ) : order ? (
          <div className="cream-card p-8 rounded-3xl space-y-8">
            
            {/* Status Header Bar */}
            <div className="flex items-start justify-between gap-4 border-b border-cream-200 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
                  <PackageCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold uppercase px-3 py-0.5 rounded-full border ${
                        order.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : order.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {order.status === 'approved' ? 'Approved & Delivered' : order.status === 'rejected' ? 'Payment Rejected' : 'Pending Verification'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-espresso-900 mt-1">
                    Order Tracking #{order.orderCode}
                  </h1>
                  <p className="text-xs text-espresso-500 font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Order Items & Price Summary */}
            <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-espresso-400">Product</p>
                <p className="text-base font-extrabold text-espresso-900">{cleanHtmlText(order.productName)}</p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase text-espresso-400">Quantity</p>
                <p className="text-base font-black text-espresso-900">{order.quantity} unit(s)</p>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase text-espresso-400">Total Price</p>
                <p className="text-xl font-black text-gold-600">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            {/* Delivery Status Banner & Delivered Items */}
            {order.status === 'approved' ? (
              <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200 space-y-4">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-lg font-black">Payment Verified! Here are your activation links:</h3>
                </div>

                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {order.items.map((item, idx) => {
                      const itemIsLink = isUrl(item);
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3 shadow-cream-sm">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-emerald-800 mb-1">Delivered Item #{idx + 1}</p>
                            <p className="font-mono text-xs text-espresso-900 break-all select-all p-3 rounded-xl bg-cream-50 border border-cream-200">
                              {item}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopy(item, idx)}
                              className="px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-espresso-800 text-xs font-bold flex items-center gap-1.5 border border-cream-200"
                            >
                              {copiedIdx === idx ? (
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
                                className="px-4 py-2 rounded-xl btn-gold text-xs font-extrabold flex items-center gap-1.5 shadow-cream-sm"
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
                  <p className="text-xs text-emerald-800 font-medium">
                    Your subscription link has been sent to your WhatsApp / Email!
                  </p>
                )}
              </div>
            ) : order.status === 'rejected' ? (
              <div className="p-6 rounded-3xl bg-red-50 border-2 border-red-200 text-red-900 space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-black">Payment Receipt Rejected</h3>
                </div>
                <p className="text-xs text-red-700">{order.rejectionReason || 'The payment proof could not be verified.'}</p>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/20 text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
                  <h3 className="text-lg font-black">Payment Verification Pending</h3>
                </div>
                <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                  Your payment screenshot receipt has been received by the store owner. Activation links will be delivered directly to your WhatsApp ({order.whatsappNumber || 'N/A'}) / Email ({order.emailAddress || 'N/A'}) as soon as approved!
                </p>
              </div>
            )}

            {/* Back CTA */}
            <div className="pt-4 flex justify-between items-center border-t border-cream-200">
              <Link href="/" className="py-3 px-6 rounded-2xl btn-primary text-xs font-extrabold">
                Return to Shop Home
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="py-3 px-4 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-800 text-xs font-bold border border-cream-200"
              >
                Refresh Order Status
              </button>
            </div>

          </div>
        ) : (
          <div className="cream-card p-10 rounded-3xl text-center text-espresso-500 space-y-4">
            <Search className="w-10 h-10 text-cream-300 mx-auto" />
            <h2 className="text-xl font-bold text-espresso-900">Order Not Found</h2>
            <p className="text-xs text-espresso-500">No order matches tracking code #{code}. Please verify your tracking ID.</p>
            <Link href="/track" className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl btn-gold text-xs font-extrabold">
              <span>Go to Order Tracker</span>
            </Link>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="cream-glass border-t border-[#E6DCCB] py-8 text-center text-xs text-espresso-500 font-medium">
        TeleShop Premium Digital Store • Instant 24/7 Automated Link Fulfillment
      </footer>

    </div>
  );
}
