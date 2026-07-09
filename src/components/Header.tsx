import React, { useState } from 'react';
import { Bell, Globe, Sparkles, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProUpgradeModal } from './ProUpgradeModal';

export const Header: React.FC = () => {
  const { storeProfile, lang, setLang, campaigns } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (lang === 'ar') return hour < 12 ? 'صباح الخير' : 'مساء الخير';
    return hour < 12 ? 'Good Morning' : 'Good Evening';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F7F7F5]/90 border-b border-[#E4E4E7] px-4 sm:px-6 py-3 backdrop-blur-xl">
      <div className="max-w-xl xl:max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          <div className="w-9 h-9 rounded-lg bg-[#18181B] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-[#71717A] flex items-center gap-1.5 truncate">
              <span className="truncate">{getGreeting()}</span>
              {storeProfile.plan === 'pro' ? (
                <span className="bg-[#ECFDF9] text-[#0D9488] border border-[#0D9488]/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> PRO
                </span>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#9A3412] border border-[#FED7AA] text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 transition-colors cursor-pointer"
                >
                  <span>FREE</span>
                  <span className="underline">{lang === 'ar' ? 'ترقية لـ Pro' : 'Upgrade'}</span>
                </button>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-black text-[#18181B] tracking-tight flex items-center gap-1 truncate">
              <span className="truncate">{storeProfile.name}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="px-2.5 py-1.5 rounded-lg bg-[#ECECEA] hover:bg-[#E4E4E7] active:scale-95 transition-all text-xs font-bold text-[#18181B] flex items-center gap-1"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-[#ECECEA] hover:bg-[#E4E4E7] active:scale-95 transition-all relative text-[#18181B]"
            >
              <Bell className="w-4 h-4 text-[#64748B]" />
              {campaigns.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#0D9488] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white text-[#18181B] rounded-lg shadow-xl border border-[#E4E4E7] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-[#F7F7F5] border-b border-[#E4E4E7] flex items-center justify-between">
                  <span className="font-bold text-xs text-[#18181B]">
                    {lang === 'ar' ? 'آخر الحملات والإشعارات' : 'Recent Campaigns'}
                  </span>
                  <span className="text-[11px] bg-[#ECFDF9] text-[#0D9488] font-bold px-2 py-0.5 rounded-full border border-[#0D9488]/20">
                    {campaigns.length}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-[#F4F4F5]">
                  {campaigns.length === 0 ? (
                    <div className="p-4 text-center text-[#71717A] text-xs font-medium">
                      {lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No recent notifications'}
                    </div>
                  ) : (
                    campaigns.map((camp) => (
                      <div key={camp.id} className="p-3 hover:bg-[#F7F7F5] transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-xs text-[#18181B]">{camp.title}</h4>
                          <span className="text-[10px] text-[#71717A]">{camp.sentAt}</span>
                        </div>
                        <p className="text-xs text-[#71717A] line-clamp-2">{camp.message}</p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#0D9488] font-bold">
                          <span>{lang === 'ar' ? 'وصل إلى' : 'Reached'} {camp.recipientsCount} {lang === 'ar' ? 'عميل' : 'customers'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 bg-[#F7F7F5] text-center border-t border-[#E4E4E7]">
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
