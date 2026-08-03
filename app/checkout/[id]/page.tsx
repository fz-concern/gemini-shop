'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, BankDetails, CustomerOrder } from '@/lib/types';
import { fetchProductById, fetchBankDetails, submitCustomerOrder } from '@/lib/api';
import { cleanHtmlText, formatCurrency } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { ArrowLeft, Building2, Check, CheckCircle2, Copy, CreditCard, Mail, MessageSquare, ShieldCheck, Sparkles, Upload, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qtyParam = parseInt(urlParams.get('qty') || '1', 10);
      if (qtyParam > 0) setQuantity(qtyParam);
    }
  }, []);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([fetchProductById(id), fetchBankDetails()])
        .then(([prodData, bankData]) => {
          setProduct(prodData);
          setBankDetails(bankData);
        })
        .catch((err) => setError(err.message || 'Failed to load checkout details'))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar onOpenTrackOrder={() => { window.location.href = '/track'; }} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-espresso-700">Preparing payment checkout page...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar onOpenTrackOrder={() => { window.location.href = '/track'; }} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="cream-card p-8 rounded-3xl text-center max-w-md space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h2 className="text-xl font-bold text-espresso-900">Checkout Error</h2>
            <p className="text-xs text-espresso-500">{error || 'Product information not available.'}</p>
            <Link href="/" className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl btn-primary text-xs font-bold">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalAmount = product.price * quantity;
  const cleanedTitle = cleanHtmlText(product.name);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    setScreenshotFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim() && !emailAddress.trim()) {
      setErrorMessage('Please enter at least your WhatsApp Number or Email Address to receive the activation link.');
      return;
    }
    if (!screenshotBase64) {
      setErrorMessage('Please attach/upload a screenshot of your payment transfer confirmation receipt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const order = await submitCustomerOrder({
        productId: product.id,
        productName: cleanedTitle,
        quantity,
        totalAmount,
        whatsappNumber: whatsappNumber.trim(),
        emailAddress: emailAddress.trim(),
        paymentScreenshot: screenshotBase64,
      });

      // Redirect to dedicated order status tracking page!
      window.location.href = `/order/${order.orderCode}`;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit payment proof');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 text-espresso-900 font-sans flex flex-col justify-between">
      
      {/* Navbar */}
      <Navbar onOpenTrackOrder={() => { window.location.href = '/track'; }} />

      {/* Main Checkout Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-espresso-500">
          <Link href="/" className="hover:text-espresso-900">Home</Link>
          <span>/</span>
          <Link href={`/product/${product.id}`} className="hover:text-espresso-900 truncate max-w-xs">{cleanedTitle}</Link>
          <span>/</span>
          <span className="text-espresso-800 font-extrabold">Payment & Order Checkout</span>
        </div>

        {/* Page Header Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-espresso-900">
              Payment & Order Checkout
            </h1>
            <p className="text-xs sm:text-sm text-espresso-500 font-medium">
              Transfer payment to store account, fill contact details, and upload receipt screenshot.
            </p>
          </div>
        </div>

        {/* Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Order Summary & Bank Transfer Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Item Order Summary Card */}
            <div className="cream-card p-6 rounded-3xl space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-gold-600 tracking-wider bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">
                Order Summary
              </span>
              
              <div>
                <h3 className="text-xl font-extrabold text-espresso-900">{cleanedTitle}</h3>
                <p className="text-xs text-espresso-500 font-medium mt-0.5">Quantity: {quantity} unit(s)</p>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-espresso-400">Total Payable</p>
                  <p className="text-2xl font-black text-espresso-900">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-espresso-400">Unit Price</p>
                  <p className="text-sm font-extrabold text-gold-600">{formatCurrency(product.price)}</p>
                </div>
              </div>
            </div>

            {/* Bank Details Box */}
            <div className="cream-card p-6 rounded-3xl space-y-4 border-2 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-700" />
                  Step 1: Transfer Payment
                </h4>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                  Bank / EasyPaisa / JazzCash
                </span>
              </div>

              {bankDetails ? (
                <div className="space-y-3 text-xs font-medium">
                  
                  {/* Title */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-500/20 shadow-cream-sm">
                    <div>
                      <p className="text-[10px] uppercase text-amber-800/80 font-bold">Account Holder Title</p>
                      <p className="font-extrabold text-espresso-900 text-sm">{bankDetails.accountTitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankDetails.accountTitle, 'title')}
                      className="px-3 py-1.5 text-amber-800 hover:text-espresso-900 rounded-xl bg-cream-50 hover:bg-amber-100 flex items-center gap-1 font-bold text-xs"
                    >
                      {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-500/20 shadow-cream-sm">
                    <div>
                      <p className="text-[10px] uppercase text-amber-800/80 font-bold">Account / Mobile Number</p>
                      <p className="font-mono font-extrabold text-espresso-900 text-base">{bankDetails.accountNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankDetails.accountNumber, 'num')}
                      className="px-3 py-1.5 text-amber-800 hover:text-espresso-900 rounded-xl bg-cream-50 hover:bg-amber-100 flex items-center gap-1 font-bold text-xs"
                    >
                      {copiedField === 'num' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'num' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* IBAN */}
                  {bankDetails.iban && (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-amber-500/20 shadow-cream-sm">
                      <div>
                        <p className="text-[10px] uppercase text-amber-800/80 font-bold">IBAN</p>
                        <p className="font-mono text-xs font-bold text-espresso-900">{bankDetails.iban}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankDetails.iban!, 'iban')}
                        className="px-3 py-1.5 text-amber-800 hover:text-espresso-900 rounded-xl bg-cream-50 hover:bg-amber-100 flex items-center gap-1 font-bold text-xs"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'iban' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {/* Instructions */}
                  <p className="text-[11px] text-amber-900/90 leading-relaxed pt-1">
                    {bankDetails.instructions || 'Transfer exact total amount to account above and upload receipt screenshot.'}
                  </p>

                </div>
              ) : null}
            </div>

          </div>

          {/* Right Column: Customer Contact & Screenshot Receipt Submission */}
          <div className="lg:col-span-7 cream-card p-8 rounded-3xl space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 2: Contact Info (WhatsApp + Email simultaneously) */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-espresso-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Step 2: Enter Contact Details to Receive Activation Link
                </h3>

                <div className="space-y-4">
                  {/* WhatsApp Field */}
                  <div>
                    <label className="block text-xs font-extrabold text-espresso-700 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Number</span>
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="Enter WhatsApp Number (e.g. +92 300 1234567)"
                      className="w-full px-4 py-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>

                  {/* Email Address Field */}
                  <div>
                    <label className="block text-xs font-extrabold text-espresso-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-espresso-700" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Enter Email Address (e.g. customer@gmail.com)"
                      className="w-full px-4 py-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Receipt Screenshot Upload */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-espresso-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gold-500" />
                  Step 3: Upload Payment Transfer Screenshot Receipt
                </h3>

                <div className="relative border-2 border-dashed border-cream-300 rounded-3xl p-6 text-center bg-cream-50/50 hover:bg-cream-50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />

                  {screenshotBase64 ? (
                    <div className="space-y-3">
                      <img
                        src={screenshotBase64}
                        alt="Payment receipt preview"
                        className="max-h-48 mx-auto rounded-2xl border border-cream-200 shadow-cream-sm object-contain"
                      />
                      <p className="text-xs font-extrabold text-emerald-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Receipt Attached ({screenshotFileName || 'Image selected'})
                      </p>
                      <p className="text-xs text-espresso-400">Click or drag another image to replace</p>
                    </div>
                  ) : (
                    <div className="py-6 space-y-3 text-espresso-500">
                      <Upload className="w-10 h-10 text-gold-500 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-extrabold text-espresso-800">Click to select receipt screenshot or drag image here</p>
                      <p className="text-xs text-espresso-400">Supports PNG, JPG, JPEG formats</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-100 border border-red-200 text-xs font-bold text-red-800">
                  {errorMessage}
                </div>
              )}

              {/* Submit Action */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl btn-gold text-base font-extrabold shadow-cream-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Submit Payment Proof & Place Order</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="cream-glass border-t border-[#E6DCCB] py-8 text-center text-xs text-espresso-500 font-medium">
        TeleShop Premium Digital Store • Instant 24/7 Automated Link Fulfillment
      </footer>

    </div>
  );
}
