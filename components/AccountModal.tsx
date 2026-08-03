'use client';

import React from 'react';
import { AccountInfo } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { X, UserCheck, Wallet, ArrowDownCircle, ArrowUpCircle, Calendar, ShieldCheck } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountInfo: AccountInfo | null;
  onRefresh: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountInfo,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-center justify-between gap-4 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 text-gold-600 flex items-center justify-center shadow-cream-sm">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-espresso-900">
                Account Overview
              </h2>
              <p className="text-xs text-espresso-500 font-medium">Customer Profile & Balance Details</p>
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
        {accountInfo ? (
          <div className="p-6 space-y-6 text-espresso-800">
            
            {/* User identity card */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-espresso-800 text-gold-400 font-bold text-lg flex items-center justify-center shadow-cream-sm">
                {(accountInfo.firstName?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="text-base font-extrabold text-espresso-900">
                  {accountInfo.firstName} {accountInfo.lastName}
                </p>
                <p className="text-xs text-espresso-500 font-medium">
                  @{accountInfo.username || 'user'} • Chat ID: {accountInfo.chatId}
                </p>
              </div>
            </div>

            {/* Financial Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-center">
                <p className="text-[10px] font-extrabold uppercase text-espresso-400 mb-1">Available</p>
                <p className="text-base font-black text-emerald-700">{formatCurrency(accountInfo.balance)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-center">
                <p className="text-[10px] font-extrabold uppercase text-espresso-400 mb-1">Total Deposit</p>
                <p className="text-base font-black text-espresso-900">{formatCurrency(accountInfo.totalDeposit)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-center">
                <p className="text-[10px] font-extrabold uppercase text-espresso-400 mb-1">Total Spent</p>
                <p className="text-base font-black text-gold-600">{formatCurrency(accountInfo.totalSpent)}</p>
              </div>
            </div>

            {/* Member Info */}
            <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-cream-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-espresso-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-espresso-400" /> Member Since
              </span>
              <span className="font-semibold text-espresso-800">{formatDate(accountInfo.createdAt)}</span>
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-espresso-500 text-xs">
            <p>Loading account details...</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/80 flex gap-2">
          <button
            onClick={onRefresh}
            className="flex-1 py-3 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-800 font-bold text-xs transition-colors border border-cream-200"
          >
            Refresh Balance
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl btn-primary font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
