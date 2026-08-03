'use client';

import React, { useEffect, useState } from 'react';
import { CustomerOrder, AccountInfo, BankDetails, Product } from '@/lib/types';
import { fetchCustomerOrders, approveCustomerOrder, rejectCustomerOrder, resendActivationEmail, fetchAccountInfo, fetchBankDetails, saveBankDetails, fetchProducts, updateProductPricing, adminLogin } from '@/lib/api';
import { cleanHtmlText, formatCurrency, formatDate } from '@/lib/utils';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Wallet, UserCheck, Key, Building2, Save, RefreshCw, Eye, MessageSquare, Mail, Lock, LogOut, DollarSign, TrendingUp, Sparkles, CircleDollarSign, History, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Panel state
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [binanceBalance, setBinanceBalance] = useState<number | null>(null);

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    easypaisaNumber: '',
    jazzcashNumber: '',
    usdtAddress: '',
    instructions: '',
  });

  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);

  const [isSavingBank, setIsSavingBank] = useState<boolean>(false);
  const [bankSavedSuccess, setBankSavedSuccess] = useState<boolean>(false);

  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast(message ? { message, type } : null);
    setTimeout(() => setToast(null), 4000);
  };

  // Check saved session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_auth_token');
      if (token) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadAdminData = async () => {
    setIsLoadingOrders(true);
    try {
      const [ordRes, accRes, bankRes, prodRes] = await Promise.allSettled([
        fetchCustomerOrders(),
        fetchAccountInfo(),
        fetchBankDetails(),
        fetchProducts(),
      ]);

      if (ordRes.status === 'fulfilled') setOrders(ordRes.value);
      if (accRes.status === 'fulfilled') setAccountInfo(accRes.value);
      if (bankRes.status === 'fulfilled') setBankDetails(bankRes.value);
      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value);
        const prices: Record<string, number> = {};
        prodRes.value.forEach((p) => {
          prices[p.id] = p.price;
        });
        setCustomPrices(prices);
      }

      // Fetch Binance account status with admin token
      const token = localStorage.getItem('admin_auth_token') || '';
      fetch('/api/binance', {
        headers: { 'x-admin-token': token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setBinanceBalance(data.usdtBalance);
        })
        .catch(() => {});

    } catch (err: any) {
      showToast(err.message || 'Failed to load admin panel data', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const token = await adminLogin(emailInput.trim(), passwordInput);
      localStorage.setItem('admin_auth_token', token);
      setIsAuthenticated(true);
      showToast('Admin logged in successfully', 'success');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth_token');
    setIsAuthenticated(false);
    showToast('Logged out of admin panel', 'success');
  };

  const handlePriceUpdate = async (productId: string) => {
    const customPrice = customPrices[productId];
    if (customPrice === undefined || customPrice < 0) return;

    setSavingPriceId(productId);
    try {
      await updateProductPricing(productId, customPrice);
      showToast('Product selling price & profit margin updated successfully!', 'success');
      const updatedProds = await fetchProducts();
      setProducts(updatedProds);
    } catch (err: any) {
      showToast(err.message || 'Failed to update product price', 'error');
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleApprove = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const updatedOrder = await approveCustomerOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      showToast(`Order #${updatedOrder.orderCode} approved! Activation link generated.`, 'success');
      fetchAccountInfo().then((acc) => setAccountInfo(acc));
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Enter rejection reason for customer:', 'Payment receipt could not be verified.');
    if (reason === null) return;

    setProcessingOrderId(orderId);
    try {
      const updatedOrder = await rejectCustomerOrder(orderId, reason);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      showToast(`Order #${updatedOrder.orderCode} rejected.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleResendEmail = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const updatedOrder = await resendActivationEmail(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      showToast(`Activation email sent successfully to ${updatedOrder.emailAddress || updatedOrder.contactValue}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send activation email', 'error');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBank(true);
    try {
      await saveBankDetails(bankDetails);
      setBankSavedSuccess(true);
      setTimeout(() => setBankSavedSuccess(false), 2000);
      showToast('Bank details updated successfully for customer checkout!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save bank details', 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-cream-200 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center mx-auto shadow-cream-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-espresso-900">Admin Portal Login</h1>
            <p className="text-xs text-espresso-500 font-medium">Enter store owner credentials to access panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-espresso-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="fz.concern@gmail.com"
                required
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-espresso-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••••••••••"
                required
                className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 text-sm font-semibold text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-xs font-bold text-red-800">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 px-6 rounded-2xl btn-gold text-sm font-extrabold shadow-cream-md flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Log In to Admin Panel</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs font-bold text-espresso-500 hover:text-espresso-900">
                ← Return to Front Store
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 text-espresso-900 font-sans pb-16">
      
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-espresso-900 text-cream-50 border border-gold-500'
                : 'bg-red-900 text-white'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <header className="cream-glass border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-gold-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-espresso-900">Store Admin Dashboard</h1>
                <span className="bg-espresso-800 text-gold-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Logged In
                </span>
              </div>
              <p className="text-xs text-espresso-500 font-medium">Verify payments, configure profits & delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="px-3.5 py-2 rounded-2xl bg-white border border-cream-200 text-espresso-700 hover:text-espresso-900 text-xs font-bold flex items-center gap-1.5 shadow-cream-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              className="px-4 py-2 rounded-2xl btn-gold text-xs font-extrabold shadow-cream-sm"
            >
              Customer Store
            </Link>

            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2.5 rounded-2xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Account Info Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {accountInfo && (
            <div className="cream-card p-6 rounded-3xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-espresso-400">Bot Balance</span>
                <Wallet className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-3xl font-black text-espresso-900">{formatCurrency(accountInfo.balance)}</p>
              <p className="text-[11px] text-espresso-500">TeleShopBot Credit</p>
            </div>
          )}

          {/* Binance Status Card */}
          <div className="cream-card p-6 rounded-3xl space-y-1 border-2 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Binance API Linked</span>
              <CircleDollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-espresso-900">
              {binanceBalance !== null ? `${binanceBalance.toFixed(2)} USDT` : 'Connected'}
            </p>
            <p className="text-[11px] text-amber-800 font-bold">On-Demand Auto Transfer Active</p>
          </div>

          {accountInfo && (
            <div className="cream-card p-6 rounded-3xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-espresso-400">Bot Owner Account</span>
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-espresso-900">@{accountInfo.username || 'owner'}</p>
              <p className="text-[11px] text-espresso-500">Deposit: {formatCurrency(accountInfo.totalDeposit)}</p>
            </div>
          )}

          <div className="cream-card p-6 rounded-3xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-espresso-400">Pending Payments</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-700">{pendingOrders.length}</p>
            <p className="text-[11px] text-espresso-500">Awaiting your approval</p>
          </div>
        </section>

        {/* Section 1: Product Pricing & Profit Margin Manager */}
        <section className="cream-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-cream-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-espresso-900">Product Profit & Pricing Manager</h3>
                <p className="text-xs text-espresso-500">Set custom selling prices and alter your profit per product.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((prod) => {
              const cleanedTitle = cleanHtmlText(prod.name);
              const baseCost = prod.basePrice ?? prod.price;
              const currentCustomPrice = customPrices[prod.id] !== undefined ? customPrices[prod.id] : prod.price;
              const calculatedProfit = currentCustomPrice - baseCost;

              return (
                <div key={prod.id} className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                        {prod.category || 'Product'}
                      </span>
                      <h4 className="text-base font-extrabold text-espresso-900 mt-1">{cleanedTitle}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                      <p className="text-[10px] uppercase font-bold text-espresso-400">API Base Cost</p>
                      <p className="text-sm font-extrabold text-espresso-800">{formatCurrency(baseCost)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-cream-200">
                      <p className="text-[10px] uppercase font-bold text-espresso-400">Selling Price</p>
                      <p className="text-sm font-black text-espresso-900">{formatCurrency(currentCustomPrice)}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="text-[10px] uppercase font-bold text-emerald-800">Your Profit</p>
                      <p className="text-sm font-black text-emerald-700">{formatCurrency(calculatedProfit)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-espresso-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customPrices[prod.id] ?? prod.price}
                        onChange={(e) => setCustomPrices({ ...customPrices, [prod.id]: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter custom selling price"
                        className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-cream-200 text-xs font-bold text-espresso-900"
                      />
                    </div>

                    <button
                      onClick={() => handlePriceUpdate(prod.id)}
                      disabled={savingPriceId === prod.id}
                      className="px-4 py-2 rounded-xl btn-gold text-xs font-extrabold flex items-center gap-1.5 shadow-cream-sm"
                    >
                      {savingPriceId === prod.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Price</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Order Management & Complete Order History */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-espresso-900 flex items-center gap-2">
                <History className="w-6 h-6 text-gold-500" />
                Customer Order History ({orders.length})
              </h2>
              <p className="text-xs text-espresso-500">Review pending payments, approve orders, or re-approve previously rejected payments.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-2xl border border-cream-200 text-xs font-bold">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${orderFilter === 'all' ? 'bg-espresso-800 text-white shadow-cream-sm' : 'text-espresso-700 hover:text-espresso-900'}`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition-all ${orderFilter === 'pending' ? 'bg-amber-600 text-white shadow-cream-sm' : 'text-espresso-700 hover:text-espresso-900'}`}
              >
                Pending ({pendingOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('approved')}
                className={`px-3 py-1.5 rounded-xl transition-all ${orderFilter === 'approved' ? 'bg-emerald-700 text-white shadow-cream-sm' : 'text-espresso-700 hover:text-espresso-900'}`}
              >
                Approved ({orders.filter((o) => o.status === 'approved').length})
              </button>
              <button
                onClick={() => setOrderFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl transition-all ${orderFilter === 'rejected' ? 'bg-red-700 text-white shadow-cream-sm' : 'text-espresso-700 hover:text-espresso-900'}`}
              >
                Rejected ({orders.filter((o) => o.status === 'rejected').length})
              </button>
            </div>
          </div>

          {isLoadingOrders ? (
            <div className="py-12 text-center text-espresso-500 text-xs space-y-2">
              <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading order history...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                const cleanedTitle = cleanHtmlText(order.productName);
                const isApproved = order.status === 'approved';
                const isRejected = order.status === 'rejected';

                return (
                  <div
                    key={order.id}
                    className={`cream-card p-6 rounded-3xl space-y-5 border-2 ${
                      isApproved
                        ? 'border-emerald-500/30'
                        : isRejected
                        ? 'border-red-500/30'
                        : 'border-amber-500/30'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-cream-200 pb-3">
                      <div>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          {isApproved ? 'Approved & Delivered' : isRejected ? 'Rejected' : 'Pending Approval'}
                        </span>
                        <h3 className="text-lg font-black text-espresso-900 mt-1">{cleanedTitle}</h3>
                        <p className="text-xs text-espresso-500 font-mono">#{order.orderCode} • {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-espresso-400">Total Charged</span>
                        <p className="text-xl font-black text-gold-600">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-espresso-500">Qty: {order.quantity}</p>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
                      <p className="text-[10px] uppercase font-bold text-espresso-400">Customer Contact Details</p>
                      {order.whatsappNumber && (
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-espresso-900 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            WhatsApp: {order.whatsappNumber}
                          </span>
                          <button
                            onClick={() => handleCopyLink(order.whatsappNumber!, `wa-${order.id}`)}
                            className="px-2 py-0.5 rounded-lg bg-white border border-cream-200 font-bold text-[10px]"
                          >
                            {copiedLink === `wa-${order.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                      {order.emailAddress && (
                        <div className="flex items-center justify-between pt-1 border-t border-cream-200/50">
                          <span className="font-extrabold text-espresso-900 flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-espresso-700" />
                            Email: {order.emailAddress}
                          </span>
                          <button
                            onClick={() => handleCopyLink(order.emailAddress!, `em-${order.id}`)}
                            className="px-2 py-0.5 rounded-lg bg-white border border-cream-200 font-bold text-[10px]"
                          >
                            {copiedLink === `em-${order.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Screenshot Preview */}
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-espresso-600 flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gold-500" /> Payment Screenshot Receipt
                      </p>

                      <div
                        onClick={() => setPreviewImage(order.paymentScreenshot)}
                        className="relative rounded-2xl border border-cream-300 overflow-hidden bg-black/5 hover:opacity-90 cursor-pointer group max-h-40 flex items-center justify-center p-2"
                      >
                        <img
                          src={order.paymentScreenshot}
                          alt="Payment screenshot"
                          className="max-h-36 object-contain rounded-xl shadow-sm"
                        />
                        <div className="absolute inset-0 bg-espresso-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                          <Eye className="w-4 h-4" /> Click to view full image
                        </div>
                      </div>
                    </div>

                    {/* Delivered Links if Approved */}
                    {isApproved && order.items && order.items.length > 0 && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase font-extrabold text-emerald-800">Delivered Activation Items</p>
                          <div className="flex items-center gap-1">
                            {order.emailSent ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Mail className="w-3 h-3" /> Email Sent (fz.concern@gmail.com)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                                <Mail className="w-3 h-3" /> Email Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-emerald-200 font-mono text-[11px]">
                            <span className="truncate max-w-xs">{item}</span>
                            <button
                              onClick={() => handleCopyLink(item, `del-${order.id}-${idx}`)}
                              className="px-2 py-0.5 rounded-md bg-cream-50 border border-cream-200 text-[10px] font-bold"
                            >
                              {copiedLink === `del-${order.id}-${idx}` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        ))}

                        {(order.emailAddress || order.contactValue) && (
                          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                            <span className="text-[11px] text-espresso-700 font-medium truncate max-w-[200px]">
                              To: <strong className="text-espresso-900">{order.emailAddress || order.contactValue}</strong>
                            </span>
                            <button
                              disabled={processingOrderId === order.id}
                              onClick={() => handleResendEmail(order.id)}
                              className="px-3 py-1 rounded-xl bg-white hover:bg-cream-100 border border-emerald-300 text-espresso-900 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Mail className="w-3.5 h-3.5 text-gold-600" />
                              {processingOrderId === order.id ? 'Sending...' : 'Resend Email'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rejection Reason if Rejected */}
                    {isRejected && (
                      <div className="p-3 rounded-xl bg-red-100 border border-red-200 text-xs font-bold text-red-900">
                        Reason: {order.rejectionReason || 'Payment receipt not verified.'}
                      </div>
                    )}

                    {/* Action Buttons (Supports Re-Approving Previously Rejected Orders!) */}
                    <div className="flex gap-3 pt-2 border-t border-cream-200">
                      {!isApproved && (
                        <button
                          disabled={processingOrderId === order.id}
                          onClick={() => handleApprove(order.id)}
                          className="w-full py-3 px-4 rounded-2xl btn-gold text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-cream-md"
                        >
                          {processingOrderId === order.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>{isRejected ? 'Re-Approve & Deliver Link' : 'Approve & Deliver Link'}</span>
                            </>
                          )}
                        </button>
                      )}

                      {!isRejected && !isApproved && (
                        <button
                          disabled={processingOrderId === order.id}
                          onClick={() => handleReject(order.id)}
                          className="py-3 px-4 rounded-2xl bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="cream-card p-10 rounded-3xl text-center text-espresso-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-base font-extrabold text-espresso-900">No orders found</h3>
              <p>There are no customer orders matching your selected status filter.</p>
            </div>
          )}
        </section>

        {/* Section 3: Store Payment Account Settings */}
        <section className="cream-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-cream-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-espresso-900">Configure Bank & Crypto Payment Details</h3>
                <p className="text-xs text-espresso-500">Customers will see these transfer details at checkout.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveBank} className="space-y-4 text-xs font-semibold">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-espresso-600 mb-1">Account Holder Title</label>
                <input
                  type="text"
                  value={bankDetails.accountTitle}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountTitle: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-espresso-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-espresso-600 mb-1">Account Number / EasyPaisa / JazzCash</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="e.g. 0300 1234567"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-espresso-900 font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-espresso-600 mb-1">IBAN (Optional)</label>
                <input
                  type="text"
                  value={bankDetails.iban || ''}
                  onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                  placeholder="PK36MEZN..."
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-espresso-900 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-espresso-600 mb-1">USDT TRC20 / Binance Pay ID</label>
                <input
                  type="text"
                  value={bankDetails.usdtAddress || ''}
                  onChange={(e) => setBankDetails({ ...bankDetails, usdtAddress: e.target.value })}
                  placeholder="Binance Pay ID or TRC20 address"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-espresso-900 font-bold font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingBank}
                className="py-3 px-6 rounded-2xl btn-primary text-xs font-extrabold flex items-center justify-center gap-2 shadow-cream-sm"
              >
                {bankSavedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Saved Payment Settings!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Payment Settings</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </section>

      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white p-2 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Full payment screenshot"
              className="max-h-[85vh] object-contain rounded-2xl mx-auto"
            />
          </div>
        </div>
      )}

    </div>
  );
}
