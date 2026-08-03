'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Check, RefreshCw, ShieldAlert, Copy } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange: () => void;
}

const DEFAULT_KEY = process.env.NEXT_PUBLIC_TELESHOPBOT_API_KEY || '';

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyChange,
}) => {
  const [currentKey, setCurrentKey] = useState<string>(DEFAULT_KEY);
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('teleshop_custom_key');
      if (storedKey) {
        setCurrentKey(storedKey);
        setCustomKeyInput(storedKey);
      } else {
        setCurrentKey(DEFAULT_KEY);
        setCustomKeyInput('');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (customKeyInput.trim()) {
      localStorage.setItem('teleshop_custom_key', customKeyInput.trim());
      setCurrentKey(customKeyInput.trim());
    } else {
      localStorage.removeItem('teleshop_custom_key');
      setCurrentKey(DEFAULT_KEY);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onKeyChange();
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('teleshop_custom_key');
    setCurrentKey(DEFAULT_KEY);
    setCustomKeyInput('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onKeyChange();
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-900/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-cream-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-cream-100 flex items-center justify-between gap-4 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-espresso-800 text-gold-400 flex items-center justify-center shadow-cream-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-espresso-900">
                API Authentication Key
              </h2>
              <p className="text-xs text-espresso-500 font-medium">Manage your TeleShopBot API credentials</p>
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
        <form onSubmit={handleSave} className="p-6 space-y-6 text-espresso-800">
          
          {/* Active Key Display */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-espresso-600 uppercase tracking-wider text-[10px]">Currently Active API Key</span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-xs font-bold text-espresso-700 hover:text-gold-600 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Key'}</span>
              </button>
            </div>
            <p className="font-mono text-xs text-espresso-900 break-all bg-white p-3 rounded-xl border border-cream-200 select-all">
              {currentKey}
            </p>
          </div>

          {/* Update Key Input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-espresso-600">
              Use Custom API Key (Optional)
            </label>
            <input
              type="text"
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              placeholder="Paste custom tsb_live_... key here"
              className="w-full px-4 py-3 rounded-2xl bg-cream-50 border border-cream-200 font-mono text-xs text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
            />
            <p className="text-[11px] text-espresso-500 leading-relaxed">
              If left empty, the pre-configured bot live key will be used automatically.
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-cream-100/60 border border-cream-200 text-xs text-espresso-700">
            <ShieldAlert className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
            <p>
              Your API key is sent securely in request headers to fulfill purchases and retrieve balance information.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="py-3 px-4 rounded-2xl bg-cream-100 hover:bg-cream-200 text-espresso-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-cream-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl btn-gold text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-cream-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Key Saved!</span>
                </>
              ) : (
                <span>Save Key Settings</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
