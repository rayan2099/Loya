import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Share2, Smartphone, Send } from 'lucide-react';
import { LoyaltyCard } from '../types';
import { useStore } from '../context/StoreContext';
import { WalletCardPreview } from './WalletCardPreview';

interface WalletShareModalProps {
  card: LoyaltyCard;
  onClose: () => void;
}

export const WalletShareModal: React.FC<WalletShareModalProps> = ({ card, onClose }) => {
  const { storeProfile, lang } = useStore();
  const [copied, setCopied] = useState(false);
  const [sendPhone, setSendPhone] = useState('05');
  const [smsSent, setSmsSent] = useState(false);

  const shareUrl = `https://loya.app/card/${card.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: card.name,
          text: lang === 'ar' ? `انضم لبرنامج مكافآت ${card.name} الآن!` : `Join our ${card.name} rewards pass!`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (sendPhone.length < 10) return;
    setSmsSent(true);
    setTimeout(() => {
      setSmsSent(false);
      setSendPhone('05');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-[#E2E8F0] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center border border-[#0D9488]/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E293B]">
                {lang === 'ar' ? 'مشاركة بطاقة الولاء' : 'Share Loyalty Card'}
              </h3>
              <p className="text-xs text-[#64748B]">{card.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 text-[#64748B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Live Preview */}
          <div>
            <span className="text-xs font-semibold text-[#1E293B] block mb-2 text-center">
              {lang === 'ar' ? 'معاينة البطاقة كما تظهر للعميل في محفظته' : 'Live Wallet Pass Preview'}
            </span>
            <WalletCardPreview card={card} customerName="عميل جديد" pointsBalance={0} stampsBalance={0} />
          </div>

          {/* Quick Share Buttons */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-4">
            <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'ar' ? 'إرسال رابط المحفظة للعميل عبر SMS أو واتساب' : 'Send Wallet Link to Customer'}</span>
            </h4>

            <form onSubmit={handleSendSms} className="flex gap-2">
              <input
                type="tel"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-mono text-left bg-white focus:ring-2 focus:ring-[#0D9488] outline-none text-[#1E293B]"
                dir="ltr"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                {smsSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{smsSent ? (lang === 'ar' ? 'تم الإرسال' : 'Sent') : (lang === 'ar' ? 'إرسال' : 'Send')}</span>
              </button>
            </form>
            {smsSent && (
              <p className="text-xs text-[#16A34A] font-bold text-center animate-pulse">
                ✨ {lang === 'ar' ? 'تم إرسال رابط الإضافة لمحفظة العميل في ثوانٍ!' : 'Link sent to customer phone!'}
              </p>
            )}
          </div>

          {/* QR Code Stand Box */}
          <div className="bg-white rounded-2xl p-5 border border-dashed border-[#CBD5E1] text-center space-y-3">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
              {lang === 'ar' ? 'اعرض هذا الباركود أمام الكاشير أو على الطاولة' : 'STORE TABLET STAND QR'}
            </span>
            <div className="w-44 h-44 mx-auto bg-[#1E293B] rounded-2xl p-4 flex items-center justify-center shadow-sm">
              <QrCode className="w-36 h-36 text-white" />
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              {lang === 'ar'
                ? 'العميل يمسح الكود بكاميرا جواله وتضاف البطاقة لمحفظته فوراً'
                : 'Customers scan this QR code to add pass directly to Apple/Google Wallet'}
            </p>
          </div>

          {/* Copy & Native Share Link */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1E293B]">
              {lang === 'ar' ? 'رابط الإضافة المباشر ومشاركة المحفظة' : 'Direct Add Link & Share'}
            </label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-[#64748B] font-mono outline-none px-2 truncate"
                dir="ltr"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-bold text-[#0D9488] flex items-center gap-1 shadow-sm transition-all shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
              </button>
              <button
                onClick={handleNativeShare}
                className="px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* 4-Step Explainer Replicating Section G */}
          <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#0D9488]/20 space-y-2">
            <h5 className="font-bold text-xs text-[#0D9488]">
              {lang === 'ar' ? 'كيف تعمل البطاقة مع العميل؟ (٤ خطوات سهلة)' : 'How it works for your customer (4 steps)'}
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#1E293B]">
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="font-bold text-[#0D9488] block">١. مسح الكود</span>
                <span className="text-gray-600">{lang === 'ar' ? 'يمسح العميل الـ QR أو يفتح الرابط' : 'Scan QR or open pass link'}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="font-bold text-[#0D9488] block">٢. الإضافة للمحفظة</span>
                <span className="text-gray-600">{lang === 'ar' ? 'يضغط حفظ في Apple / Google Wallet' : 'Tap Add to Apple/Google Wallet'}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="font-bold text-[#0D9488] block">٣. مسح الكاشير</span>
                <span className="text-gray-600">{lang === 'ar' ? 'يعرض البطاقة عند كل شراء لزيادة الرصيد' : 'Present barcode at checkout to earn'}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="font-bold text-[#0D9488] block">٤. استبدال المكافأة</span>
                <span className="text-gray-600">{lang === 'ar' ? 'يصرف هديته بضغطة زر عند اكتمال النقاط' : 'Redeem reward instantly upon target'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#1E293B] text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
