import React, { useState } from 'react';
import { Bell, Globe, Sparkles, Store, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProUpgradeModal } from './ProUpgradeModal';

export const Header: React.FC = () => {
  const { storeProfile, lang, setLang, campaigns } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (lang === 'ar') {
      if (hour < 12) return 'صباح الخير ☀️';
      return 'مساء الخير 🌙';
    } else {
      if (hour < 12) return 'Good Morning ☀️';
      return 'Good Evening 🌙';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Store Name & Greeting */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center shadow-sm shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1.5 truncate">
              <span className="truncate">{getGreeting()}</span>
              {storeProfile.plan === 'pro' ? (
                <span className="bg-[#F0FDFA] text-[#0D9488] border border-[#0D9488]/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300/50 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer"
                >
                  <span>FREE PLAN • </span>
                  <span className="underline">{lang === 'ar' ? 'ترقية لـ Pro' : 'Upgrade'}</span>
                </button>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-bold text-[#1E293B] tracking-tight flex items-center gap-1 truncate">
              <span className="truncate">{storeProfile.name}</span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            </h1>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 active:scale-95 transition-all text-xs font-semibold text-[#1E293B] flex items-center gap-1 border border-[#E2E8F0]"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 active:scale-95 transition-all relative border border-[#E2E8F0] text-[#1E293B]"
            >
              <Bell className="w-4 h-4 text-[#64748B]" />
              {campaigns.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#0D9488] rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white text-[#1E293B] rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1E293B]">
                    {lang === 'ar' ? 'آخر الحملات والإشعارات' : 'Recent Campaigns'}
                  </span>
                  <span className="text-[11px] bg-[#F0FDFA] text-[#0D9488] font-semibold px-2 py-0.5 rounded-full border border-[#0D9488]/20">
                    {campaigns.length}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-[#F1F5F9]">
                  {campaigns.length === 0 ? (
                    <div className="p-4 text-center text-[#64748B] text-xs font-medium">
                      {lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No recent notifications'}
                    </div>
                  ) : (
                    campaigns.map((camp) => (
                      <div key={camp.id} className="p-3 hover:bg-[#F8FAFC] transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-xs text-[#1E293B]">{camp.title}</h4>
                          <span className="text-[10px] text-[#64748B]">{camp.sentAt}</span>
                        </div>
                        <p className="text-xs text-[#64748B] line-clamp-2">{camp.message}</p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#10B981] font-semibold">
                          <span>✅ {lang === 'ar' ? 'تم الوصول لـ' : 'Reached'} {camp.recipientsCount} {lang === 'ar' ? 'عميل في المحفظة' : 'customers'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 bg-[#F8FAFC] text-center border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#0D9488] hover:underline"
                  >
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </header>
  );
};
