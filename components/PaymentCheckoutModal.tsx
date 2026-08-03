'use client';

import React, { useState, useEffect } from 'react';
import { Product, BankDetails, CustomerOrder } from '@/lib/types';
import { cleanHtmlText, formatCurrency } from '@/lib/utils';
import { fetchBankDetails, submitCustomerOrder } from '@/lib/api';
import { X, Copy, Check, Upload, MessageSquare, Mail, Building2, CreditCard, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface PaymentCheckoutModalProps {
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onSuccess: (order: CustomerOrder) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  product,
  quantity,
  onClose,
  onSuccess,
}) => {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isLoadingBank, setIsLoadingBank] = useState<boolean>(true);

  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setIsLoadingBank(true);
      fetchBankDetails()
        .then((res) => setBankDetails(res))
        .catch(() => {})
        .finally(() => setIsLoadingBank(false));
    }
  }, [product]);

  if (!product) return null;

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

      onSuccess(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-center justify-between gap-4 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-espresso-900">
                Payment & Order Checkout
              </h2>
              <p className="text-xs text-espresso-500 font-medium">Transfer payment & upload receipt</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-espresso-800">
          
          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gold-600 tracking-wider">Item Summary</span>
              <h4 className="text-base font-extrabold text-espresso-900">{cleanedTitle}</h4>
              <p className="text-xs text-espresso-500 font-medium">Qty: {quantity} unit(s)</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-espresso-400">Total Payable</span>
              <p className="text-2xl font-black text-espresso-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Bank Payment Details Box */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-700" />
                Store Payment Account Details
              </h4>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                Step 1: Transfer Payment
              </span>
            </div>

            {isLoadingBank ? (
              <div className="text-xs text-amber-800 py-2">Loading bank details...</div>
            ) : bankDetails ? (
              <div className="space-y-2 text-xs text-amber-950 font-medium">
                
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-500/20">
                  <div>
                    <p className="text-[10px] uppercase text-amber-800/80 font-bold">Account Holder / Title</p>
                    <p className="font-extrabold text-espresso-900">{bankDetails.accountTitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.accountTitle, 'title')}
                    className="p-1.5 text-amber-800 hover:text-espresso-900 rounded-lg hover:bg-amber-100 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-500/20">
                  <div>
                    <p className="text-[10px] uppercase text-amber-800/80 font-bold">Account / Mobile Number</p>
                    <p className="font-mono font-extrabold text-espresso-900 text-sm">{bankDetails.accountNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankDetails.accountNumber, 'num')}
                    className="p-1.5 text-amber-800 hover:text-espresso-900 rounded-lg hover:bg-amber-100 flex items-center gap-1 font-bold text-[11px]"
                  >
                    {copiedField === 'num' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'num' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {bankDetails.iban && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-amber-500/20">
                    <div>
                      <p className="text-[10px] uppercase text-amber-800/80 font-bold">IBAN</p>
                      <p className="font-mono text-xs font-bold text-espresso-900">{bankDetails.iban}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(bankDetails.iban!, 'iban')}
                      className="p-1.5 text-amber-800 hover:text-espresso-900 rounded-lg hover:bg-amber-100 flex items-center gap-1 font-bold text-[11px]"
                    >
                      {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'iban' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

              </div>
            ) : null}
          </div>

          {/* Customer Contact Section - Showing BOTH WhatsApp and Email at the same time */}
          <div className="space-y-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-espresso-700">
              Step 2: Enter Contact Details to Receive Activation Link
            </label>

            <div className="space-y-3">
              {/* WhatsApp Number Field */}
              <div>
                <label className="block text-[11px] font-bold text-espresso-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Number</span>
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Enter WhatsApp Number (e.g. +92 300 1234567)"
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              </div>

              {/* Email Address Field */}
              <div>
                <label className="block text-[11px] font-bold text-espresso-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-espresso-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter Email Address (e.g. customer@gmail.com)"
                  className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                />
              </div>
            </div>
          </div>

          {/* Screenshot Upload Section */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-espresso-700">
              Step 3: Upload Payment Screenshot Receipt
            </label>

            <div className="relative border-2 border-dashed border-cream-300 rounded-2xl p-4 text-center bg-cream-50/50 hover:bg-cream-50 transition-colors cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              {screenshotBase64 ? (
                <div className="space-y-2">
                  <img
                    src={screenshotBase64}
                    alt="Payment receipt preview"
                    className="max-h-36 mx-auto rounded-xl border border-cream-200 shadow-cream-sm object-contain"
                  />
                  <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Receipt attached ({screenshotFileName || 'Image attached'})
                  </p>
                  <p className="text-[11px] text-espresso-400">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="py-4 space-y-2 text-espresso-500">
                  <Upload className="w-8 h-8 text-gold-500 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-espresso-800">Click to select screenshot or drag image here</p>
                  <p className="text-[11px] text-espresso-400">Supports PNG, JPG, JPEG</p>
                </div>
              )}
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-xs font-bold text-red-800">
              {errorMessage}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl btn-gold text-sm font-extrabold shadow-cream-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Payment Proof for Approval</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
