import React, { useState } from 'react';
import { X, QrCode, Printer, Download, Trash2, AlertTriangle, ShieldAlert, Award, Calendar, Users, Zap } from 'lucide-react';
import { LoyaltyCard } from '../types';
import { useStore } from '../context/StoreContext';

interface CardDetailsModalProps {
  card: LoyaltyCard;
  onClose: () => void;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({ card, onClose }) => {
  const { lang, deleteLoyaltyCard, storeProfile } = useStore();
  const [activeTab, setActiveTab] = useState<'recap' | 'flyer' | 'danger'>('recap');

  const handlePrintFlyer = () => {
    window.print();
  };

  const handleDelete = () => {
    if (window.confirm(lang === 'ar' ? '⚠️ تحذير: هل أنت متأكد من حذف هذه البطاقة نهائياً؟ لن يتمكن العملاء من كسب نقاط جديدة عليها.' : '⚠️ Warning: Are you sure you want to permanently delete this card?')) {
      deleteLoyaltyCard(card.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl border border-[#E2E8F0] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black shadow-sm shrink-0 text-lg"
              style={{ backgroundColor: card.color || '#0D9488' }}
            >
              ★
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">
                {lang === 'ar' ? `تفاصيل وإدارة بطاقة: ${card.name}` : `Card Details & Flyer: ${card.name}`}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">
                {card.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 text-[#64748B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8F0] bg-white px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('recap')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'recap'
                ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {lang === 'ar' ? '📋 ملخص القواعد والأداء' : '📋 Rules & Performance'}
          </button>
          <button
            onClick={() => setActiveTab('flyer')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'flyer'
                ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {lang === 'ar' ? '🖨️ ستاند الطاولة (A4 Flyer)' : '🖨️ Table Stand A4 Flyer'}
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'danger'
                ? 'border-red-500 text-red-600 bg-red-50/50'
                : 'border-transparent text-red-500 hover:text-red-700'
            }`}
          >
            {lang === 'ar' ? '⚠️ منطقة الخطر والحذف' : '⚠️ Danger Zone'}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'recap' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'نوع نظام النقاط' : 'Engine Type'}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 block">
                    {card.ruleType === 'stamp_buy_5' ? (lang === 'ar' ? 'طوابع مشتريات 🏆' : 'Stamps') : (lang === 'ar' ? 'نقاط لكل ريال ⭐' : 'Points / SAR')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'معدل الاكتساب' : 'Earning Rate'}</span>
                  <span className="text-xs sm:text-sm font-black text-[#0D9488] mt-1 block">
                    {card.ruleType === 'stamp_buy_5' ? (lang === 'ar' ? 'ختم لكل منتج' : '1 Stamp / Item') : (lang === 'ar' ? '1 نقطة / 1 ريال' : '1 Pt / 1 SAR')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">{lang === 'ar' ? 'صلاحية الرصيد' : 'Points Expiry'}</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 mt-1 block">
                    {lang === 'ar' ? 'بدون انتهاء صلاحية' : 'Never Expire'}
                  </span>
                </div>
              </div>

              {/* Rules Breakdown Card */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="font-bold text-xs text-[#1E293B] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'ar' ? 'كيف يكسب ويستبدل العميل المكافآت؟' : 'How Customers Earn & Redeem Rewards'}</span>
                </h4>
                <ul className="text-xs text-[#64748B] space-y-2 leading-relaxed list-disc list-inside">
                  <li>
                    {lang === 'ar'
                      ? 'يقوم العميل بمسح الباركود الخاص به عند الكاشير بعد الشراء لتسجيل الزيارة فوراً.'
                      : 'Customer scans their Apple/Google Wallet pass barcode at the checkout cashier.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'يتم تحديث رصيد النقاط أو الأختام في محفظة Apple & Google Wallet تلقائياً في نفس اللحظة.'
                      : 'Points and stamps balance syncs immediately to lockscreen Apple & Google Wallet.'}
                  </li>
                  <li>
                    {lang === 'ar'
                      ? 'عند اكتمال النقاط المطلوبة، يظهر زر صرف المكافأة للكاشير بنقرة واحدة وتأكيد برقم سري.'
                      : 'Upon completion, cashier unlocks one-tap reward redemption protected by secure PIN.'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'flyer' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1E293B]">
                    {lang === 'ar' ? 'ستاند طاولة QR جاهز للطباعة (مقاس A4)' : 'Print-Ready Table Stand Poster (A4)'}
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    {lang === 'ar' ? 'اطبعه وضع الستاند بجانب الكاشير أو على طاولات المتجر لانضمام فوري للعملاء' : 'Print and place at checkout counter for instant QR customer enrollment'}
                  </p>
                </div>
                <button
                  onClick={handlePrintFlyer}
                  className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'طباعة ستاند A4 🖨️' : 'Print A4 Flyer 🖨️'}</span>
                </button>
              </div>

              {/* A4 Flyer Visual Simulation Container */}
              <div className="p-6 rounded-3xl bg-white border-2 border-slate-300 shadow-lg text-center space-y-4 max-w-md mx-auto print:shadow-none print:border-none">
                <div
                  className="py-3 px-6 rounded-2xl text-white font-black text-base shadow-sm"
                  style={{ backgroundColor: card.color || '#0D9488' }}
                >
                  {storeProfile?.name || (lang === 'ar' ? 'برنامج مكافآت المتجر' : 'Store Loyalty Rewards')}
                </div>

                <h3 className="font-black text-lg sm:text-xl text-[#1E293B] leading-tight">
                  {lang === 'ar' ? 'امسح الباركود وانضم لبرنامج مكافآتنا في ثوانٍ!' : 'Scan QR & Join Our Rewards Club instantly!'}
                </h3>

                <p className="text-xs text-[#64748B] font-semibold">
                  {lang === 'ar' ? `احصل على بطاقة ${card.name} مباشرة في محفظة جوالك` : `Get your ${card.name} pass in Apple & Google Wallet`}
                </p>

                {/* Big QR Stand */}
                <div className="w-52 h-52 mx-auto bg-slate-900 rounded-3xl p-4 flex items-center justify-center shadow-md">
                  <QrCode className="w-44 h-44 text-white" />
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <span className="px-3 py-1 rounded-lg bg-black text-white text-[11px] font-bold tracking-tight">
                     Apple Wallet
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-black text-white text-[11px] font-bold tracking-tight">
                    G Google Wallet
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-center gap-2.5 text-red-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{lang === 'ar' ? 'منطقة الخطر: حذف بطاقة الولاء نهائياً' : 'Danger Zone: Permanent Card Deletion'}</span>
                </div>
                <p className="text-xs text-red-600 leading-relaxed">
                  {lang === 'ar'
                    ? 'تنبيه هام: حذف بطاقة الولاء سيؤدي إلى إيقاف إصدار النقاط عليها فوراً ولن يتمكن الكاشير من مسحها لاحقاً. هذا الإجراء لا يمكن التراجع عنه.'
                    : 'Warning: Deleting this card terminates point allocation and disables cashier scan lookup immediately.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleDelete}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'نعم، حذف بطاقة الولاء نهائياً' : 'Yes, Delete Card Permanently'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#1E293B] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            {lang === 'ar' ? 'إغلاق نافذة التفاصيل' : 'Close Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
