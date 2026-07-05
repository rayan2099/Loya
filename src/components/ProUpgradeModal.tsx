import React, { useState } from 'react';
import { X, Sparkles, Check, Zap, Shield, BarChart3, Users, CreditCard, Award, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import confetti from 'canvas-confetti';

interface ProUpgradeModalProps {
  onClose: () => void;
  reason?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ onClose, reason }) => {
  const { lang, setStoreProfile } = useStore();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [upgraded, setUpgraded] = useState(false);

  const handleUpgrade = () => {
    setStoreProfile((prev) => ({ ...prev, plan: 'pro' }));
    setUpgraded(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });

    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl border border-[#E2E8F0] flex flex-col">
        {/* Top Header Gradient */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0D9488] text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#0D9488]/20 blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#0D9488] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> PRO UNLIMITED
            </span>
            {reason && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                ⚠️ {reason}
              </span>
            )}
          </div>

          <h3 className="font-black text-xl sm:text-2xl tracking-tight">
            {lang === 'ar' ? 'ترقية حساب منشأتك إلى باقة نقاطي برو 🚀' : 'Upgrade to Loya Pro Unlimited Plan 🚀'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            {lang === 'ar'
              ? 'افتح كافة القيود، أنشئ عدداً غير محدود من بطاقات الولاء، واستقبل آلاف العملاء بمحافظ جوالاتهم'
              : 'Unlock unlimited wallet cards, unlimited customers, and advanced financial analytics'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Annual vs Monthly Billing Switcher */}
          <div className="flex items-center justify-center">
            <div className="bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#E2E8F0] flex items-center gap-2 w-full max-w-md">
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#0D9488] text-white shadow-md'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <span>{lang === 'ar' ? 'اشتراك سنوي (وفر ٢٠٪)' : 'Annual (Save 20%)'}</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-md font-extrabold">١٩٩ ر.س/شهر</span>
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'monthly'
                    ? 'bg-[#1E293B] text-white shadow-md'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                <span>{lang === 'ar' ? 'اشتراك شهري مرن' : 'Monthly Flexible'}</span>
                <span className="text-[10px] font-bold opacity-80">٢٤٩ ر.س/شهر</span>
              </button>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 bg-[#F8FAFC] p-3 border-b border-[#E2E8F0] text-xs font-black text-[#1E293B]">
              <div className="col-span-6">{lang === 'ar' ? 'الميزة والخدمة' : 'Feature / Capability'}</div>
              <div className="col-span-3 text-center text-slate-500">{lang === 'ar' ? 'الباقة المجانية Free' : 'Free Plan'}</div>
              <div className="col-span-3 text-center text-[#0D9488]">{lang === 'ar' ? 'باقة برو Pro 🚀' : 'Pro Plan 🚀'}</div>
            </div>

            <div className="divide-y divide-[#E2E8F0] text-xs">
              <div className="grid grid-cols-12 p-3 items-center">
                <div className="col-span-6 font-bold text-[#1E293B] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'ar' ? 'عدد بطاقات الولاء المصممة للمتجر' : 'Active Loyalty Passes'}</span>
                </div>
                <div className="col-span-3 text-center font-semibold text-slate-500">{lang === 'ar' ? 'بطاقة واحدة فقط ١' : '1 Card Limit'}</div>
                <div className="col-span-3 text-center font-black text-[#0D9488] bg-[#F0FDFA] py-1 rounded-lg">
                  {lang === 'ar' ? 'غير محدود ♾️' : 'Unlimited Cards ♾️'}
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 items-center">
                <div className="col-span-6 font-bold text-[#1E293B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'ar' ? 'حصة العملاء المنضمين لمحفظة Apple & Google' : 'Enrolled Customer Passes'}</span>
                </div>
                <div className="col-span-3 text-center font-semibold text-slate-500">{lang === 'ar' ? 'بحد أقصى ٥٠ عميل' : 'Max 50 Customers'}</div>
                <div className="col-span-3 text-center font-black text-[#0D9488] bg-[#F0FDFA] py-1 rounded-lg">
                  {lang === 'ar' ? 'غير محدود ♾️' : 'Unlimited Passes ♾️'}
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 items-center">
                <div className="col-span-6 font-bold text-[#1E293B] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'ar' ? 'التحليلات المالية المتقدمة ومعدل عودة العملاء' : 'Pro Financial & Growth Analytics'}</span>
                </div>
                <div className="col-span-3 text-center font-semibold text-slate-400">🔒 {lang === 'ar' ? 'مغلق' : 'Locked'}</div>
                <div className="col-span-3 text-center font-black text-emerald-600 bg-[#F0FDFA] py-1 rounded-lg">
                  ✓ {lang === 'ar' ? 'متاح بالكامل' : 'Full Access'}
                </div>
              </div>

              <div className="grid grid-cols-12 p-3 items-center">
                <div className="col-span-6 font-bold text-[#1E293B] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'ar' ? 'بث الإشعارات الفورية لشاشات قفل الجوال' : 'Priority Lockscreen Push Campaigns'}</span>
                </div>
                <div className="col-span-3 text-center font-semibold text-slate-500">{lang === 'ar' ? 'قياسي' : 'Standard'}</div>
                <div className="col-span-3 text-center font-black text-[#0D9488] bg-[#F0FDFA] py-1 rounded-lg">
                  ⚡ {lang === 'ar' ? 'بث فوري ذي أولوية' : 'High Priority VIP'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer Button */}
          {upgraded ? (
            <div className="p-4 rounded-2xl bg-[#DCFCE7] text-[#16A34A] font-black text-base text-center flex items-center justify-center gap-2 shadow-sm">
              <Check className="w-6 h-6" />
              <span>{lang === 'ar' ? 'تم تفعيل باقة نقاطي برو بنجاح! مرحباً بك في العالم غير المحدود 🎉' : 'Successfully Upgraded to Loya Pro! Welcome aboard 🎉'}</span>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleUpgrade}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0D9488] to-[#0F766E] hover:from-[#0F766E] hover:to-[#0D9488] text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-98"
              >
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>
                  {lang === 'ar'
                    ? `تفعيل الاشتراك في باقة برو (${billingCycle === 'annual' ? '١٩٩ ر.س/شهر' : '٢٤٩ ر.س/شهر'}) 🚀`
                    : `Activate Pro Plan (${billingCycle === 'annual' ? '199 SAR/mo' : '249 SAR/mo'}) 🚀`}
                </span>
              </button>
              <p className="text-[11px] text-[#64748B] text-center font-semibold">
                {lang === 'ar'
                  ? 'ضمان استرداد الأموال خلال ١٤ يوماً • إلغاء مرن في أي وقت بضغطة زر'
                  : '14-day money back guarantee • Cancel anytime with zero fees'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
