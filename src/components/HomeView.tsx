import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Award,
  BarChart3,
  Plus,
  Sparkles,
  Share2,
  Edit3,
  Eye,
  Trash2,
  Smartphone,
  ChevronLeft,
  Zap,
  Palette,
  FileText,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LoyaltyCard } from '../types';
import { CardWizardModal } from './CardWizardModal';
import { WalletShareModal } from './WalletShareModal';
import { FreeCardDesignModal } from './FreeCardDesignModal';
import { CardDesignEditorModal } from './CardDesignEditorModal';
import { CardDetailsModal } from './CardDetailsModal';
import { ProUpgradeModal } from './ProUpgradeModal';

export const HomeView: React.FC<{ onOpenScanner: () => void }> = ({ onOpenScanner }) => {
  const { loyaltyCards, customers, transactions, deleteLoyaltyCard, setActiveTab, lang, storeProfile } = useStore();

  const [editingCard, setEditingCard] = useState<LoyaltyCard | null>(null);
  const [designingCard, setDesigningCard] = useState<LoyaltyCard | null>(null);
  const [detailsCard, setDetailsCard] = useState<LoyaltyCard | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [sharingCard, setSharingCard] = useState<LoyaltyCard | null>(null);
  const [showFreeDesign, setShowFreeDesign] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('');

  const totalPointsEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentHour = new Date().getHours();
  const greeting =
    lang === 'ar'
      ? currentHour < 12
        ? 'صباح الخير ☀️'
        : currentHour < 18
        ? 'طاب يومك 🌤️'
        : 'مساء الخير 🌙'
      : currentHour < 12
      ? 'Good Morning ☀️'
      : currentHour < 18
      ? 'Good Afternoon 🌤️'
      : 'Good Evening 🌙';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Time-Aware Greeting Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1E293B] bg-linear-to-r bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-700">
        <div>
          <span className="text-xs text-teal-300 font-bold tracking-wide uppercase block mb-0.5">
            {greeting}
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            {storeProfile?.name || (lang === 'ar' ? 'متجر loya' : 'Loya Store')}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {lang === 'ar'
              ? 'تابع أداء بطاقات الولاء، نشاط العملاء وإحصائيات المحفظة لحظة بلحظة'
              : 'Track loyalty cards, customer activity, and live wallet metrics in real time'}
          </p>
        </div>
        <button
          onClick={() => {
            if (storeProfile?.plan === 'free' && loyaltyCards.length >= 1) {
              setUpgradeReason(lang === 'ar' ? 'الباقة المجانية تسمح بإنشاء بطاقة ولاء واحدة فقط' : 'Free plan allows 1 loyalty card limit');
              setShowUpgradeModal(true);
            } else {
              setEditingCard(null);
              setShowWizard(true);
            }
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إنشاء بطاقة ولاء جديدة' : 'Create New Loyalty Card'}</span>
        </button>
      </div>

      {/* 4 Stat Cards Grid Replicating Screenshot 7 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">{lang === 'ar' ? 'العملاء المنضمون' : 'Enrolled'}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E293B] leading-none">{customers.length}</div>
          <div className="text-[10px] sm:text-[11px] text-[#10B981] font-semibold mt-1.5 truncate">
            {lang === 'ar' ? '↑ 12٪ مقارنة بالشهر السابق' : '↑ 12% vs last month'}
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">{lang === 'ar' ? 'البطاقات النشطة' : 'Active Cards'}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E293B] leading-none">{loyaltyCards.length}</div>
          <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-1.5 truncate">{lang === 'ar' ? 'محفظة آبل وجوجل' : 'Apple & Google Wallet'}</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">{lang === 'ar' ? 'النقاط الموزعة' : 'Points Issued'}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E293B] leading-none">{totalPointsEarned.toLocaleString()}</div>
          <div className="text-[10px] sm:text-[11px] text-[#10B981] font-semibold mt-1.5 truncate">{lang === 'ar' ? '↑ 74٪ تم استبدالها لمكافآت' : '↑ 74% redeemed'}</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#64748B] truncate">{lang === 'ar' ? 'معدل العودة' : 'Return Rate'}</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#1E293B] leading-none">89%</div>
          <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-1.5 truncate">{lang === 'ar' ? 'عملاء دائمون متكررون' : 'Returning customers'}</div>
        </div>
      </div>

      {/* Quick Actions Grid Replicating Screenshot 8 & 9 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
          <span className="text-xs text-[#64748B]">{lang === 'ar' ? 'أدوات نقاط البيع والكاشير الفورية' : 'Quick POS Tools'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenScanner}
            className="p-4 sm:p-5 rounded-2xl bg-[#0D9488] bg-linear-to-br bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-between group"
          >
            <div className="text-right min-w-0 flex-1 pr-2">
              <h4 className="font-bold text-sm flex items-center gap-1.5 truncate">
                <span className="truncate">{lang === 'ar' ? 'مسح QR فوري' : 'Instant QR Scan'}</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              </h4>
              <p className="text-[11px] text-white/80 mt-0.5 truncate">{lang === 'ar' ? 'إضافة نقاط أو طوابع بثانية واحدة' : 'Issue points instantly'}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center transform group-hover:scale-110 transition-transform shrink-0">
              <QrCode className="w-6 h-6 text-white" />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className="p-4 sm:p-5 rounded-2xl bg-[#1E293B] text-white shadow-sm hover:brightness-105 active:scale-98 transition-all flex items-center justify-between group"
          >
            <div className="text-right min-w-0 flex-1 pr-2">
              <h4 className="font-bold text-sm truncate">{lang === 'ar' ? 'إرسال إشعار للمحفظة' : 'Send Wallet Push'}</h4>
              <p className="text-[11px] text-white/80 mt-0.5 truncate">{lang === 'ar' ? 'تنبيه مباشر على شاشة قفل العميل' : 'Live lockscreen push'}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center transform group-hover:scale-110 transition-transform shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Free Design Banner Promo Replicating Screenshot 8 */}
      <div
        onClick={() => setShowFreeDesign(true)}
        className="p-5 rounded-2xl bg-white border border-dashed border-[#0D9488] text-[#1E293B] shadow-sm cursor-pointer hover:bg-[#F8FAFC] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0 border border-[#0D9488]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-[#0D9488] flex items-center gap-2">
              <span>{lang === 'ar' ? 'نصمم لك البطاقة مجاناً! 🎨✨' : 'Free Custom Pass Design Service'}</span>
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              {lang === 'ar' ? 'فريق تصميم loya يجهز لك بطاقة ولاء احترافية بشعارك وهويتك خلال ساعتين' : 'Our team crafts your custom wallet pass in under 2 hours'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs font-bold bg-[#0D9488] text-white px-4 py-2 rounded-xl shadow-sm">
          <span>{lang === 'ar' ? 'اطلب التصميم' : 'Request Design'}</span>
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>

      {/* Active Cards Section Replicating Screenshot 10 & 11 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'بطاقات الولاء الخاصة بمنشأتك' : 'Loyalty Cards Catalog'}</h3>
            <p className="text-xs text-[#64748B]">{lang === 'ar' ? 'مرتبطة مباشرة بمحافظ آبل وجوجل الرسمية على هواتف عملائك' : 'Connected to Apple Wallet & Google Wallet'}</p>
          </div>

          <button
            onClick={() => {
              setEditingCard(null);
              setShowWizard(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'بطاقة جديدة' : 'New Pass'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loyaltyCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:shadow transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => setDetailsCard(card)}
                  className="flex items-start justify-between gap-3 mb-3 cursor-pointer group/card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0 group-hover/card:scale-105 transition-transform"
                      style={{ backgroundColor: card.color }}
                    >
                      {card.ruleType === 'stamp_buy_5' ? '☕' : '🏆'}
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0D9488] border border-[#0D9488]/20">
                        {card.ruleType === 'stamp_buy_5' ? (lang === 'ar' ? 'نظام طوابع (اشتر 5)' : 'Stamps (Buy 5)') : (lang === 'ar' ? 'نقاط عند الشراء' : 'Points per Purchase')}
                      </span>
                      <h4 className="font-bold text-base text-[#1E293B] mt-1 group-hover/card:text-[#0D9488] transition-colors">{card.name}</h4>
                    </div>
                  </div>

                  <span className="text-xs bg-[#F1F5F9] text-[#1E293B] font-semibold px-2.5 py-1 rounded-xl">
                    {card.customersCount} {lang === 'ar' ? 'عميل' : 'clients'}
                  </span>
                </div>

                <p
                  onClick={() => setDetailsCard(card)}
                  className="text-xs text-[#64748B] line-clamp-2 leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {card.description}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mt-4 pt-4 border-t border-[#E2E8F0] text-[11px] sm:text-xs font-semibold">
                <button
                  onClick={() => setSharingCard(card)}
                  className="py-2 px-1.5 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center gap-1 transition-colors min-w-0"
                >
                  <Share2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lang === 'ar' ? 'مشاركة ومسح' : 'Share & Scan'}</span>
                </button>

                <button
                  onClick={() => setDetailsCard(card)}
                  className="py-2 px-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center gap-1 transition-colors min-w-0"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lang === 'ar' ? 'التفاصيل والستاند' : 'Details & Flyer'}</span>
                </button>

                <button
                  onClick={() => setDesigningCard(card)}
                  className="py-2 px-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center gap-1 transition-colors min-w-0"
                >
                  <Palette className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lang === 'ar' ? 'التصميم' : 'Design'}</span>
                </button>

                <button
                  onClick={() => {
                    setEditingCard(card);
                    setShowWizard(true);
                  }}
                  className="py-2 px-1.5 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 text-[#1E293B] flex items-center justify-center gap-1 transition-colors min-w-0"
                >
                  <Edit3 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه البطاقة؟' : 'Are you sure you want to delete this card?')) {
                      deleteLoyaltyCard(card.id);
                    }
                  }}
                  className="py-2 px-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center gap-1 transition-colors col-span-2 sm:col-span-1 min-w-0"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showWizard && (
        <CardWizardModal
          initialCard={editingCard}
          onClose={() => {
            setShowWizard(false);
            setEditingCard(null);
          }}
        />
      )}

      {designingCard && (
        <CardDesignEditorModal
          card={designingCard}
          onClose={() => setDesigningCard(null)}
        />
      )}

      {detailsCard && (
        <CardDetailsModal
          card={detailsCard}
          onClose={() => setDetailsCard(null)}
        />
      )}

      {sharingCard && (
        <WalletShareModal card={sharingCard} onClose={() => setSharingCard(null)} />
      )}

      {showFreeDesign && (
        <FreeCardDesignModal onClose={() => setShowFreeDesign(false)} />
      )}

      {showUpgradeModal && (
        <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} />
      )}
    </div>
  );
};
