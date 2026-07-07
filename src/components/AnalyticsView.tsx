import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, RefreshCw, Clock, Calendar, Award, Lock, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProUpgradeModal } from './ProUpgradeModal';

export const AnalyticsView: React.FC = () => {
  const { lang, transactions, storeProfile } = useStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const weeklyData = [
    { dayAr: 'السبت', dayEn: 'Sat', val: 45, label: '+450 نقطة' },
    { dayAr: 'الأحد', dayEn: 'Sun', val: 68, label: '+680 نقطة' },
    { dayAr: 'الإثنين', dayEn: 'Mon', val: 52, label: '+520 نقطة' },
    { dayAr: 'الثلاثاء', dayEn: 'Tue', val: 82, label: '+820 نقطة' },
    { dayAr: 'الأربعاء', dayEn: 'Wed', val: 65, label: '+650 نقطة' },
    { dayAr: 'الخميس', dayEn: 'Thu', val: 95, label: '+950 نقطة الذروة' },
    { dayAr: 'الجمعة', dayEn: 'Fri', val: 88, label: '+880 نقطة' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#0D9488]" />
            <span>{lang === 'ar' ? 'لوحة القيادة والتحليلات المتقدمة' : 'Pro Analytics Dashboard'}</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            {lang === 'ar' ? 'راقب أداء منشأتك واتخذ قرارات مبنية على بيانات حقيقية مباشرة من محافظ جوالات عملائك' : 'Real-time performance analytics from customer wallets'}
          </p>
        </div>

        {storeProfile.plan === 'free' && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0D9488] bg-linear-to-r bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'ar' ? 'ترقية لباقة Pro المفتوحة 🚀' : 'Upgrade to Pro Unlimited 🚀'}</span>
          </button>
        )}
      </div>

      {/* PAYWALL OVERLAY FOR FREE PLAN REPLICATING SECTION H */}
      {storeProfile.plan === 'free' ? (
        <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-md bg-white p-6 sm:p-10 text-center space-y-5">
          {/* Simulated blurred backdrop behind paywall */}
          <div className="absolute inset-0 bg-white/90 bg-linear-to-b bg-gradient-to-b from-white/40 via-white/80 to-white backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#1E293B] text-[#0D9488] flex items-center justify-center shadow-xl border border-[#0D9488]/30">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0D9488] font-black text-xs border border-[#0D9488]/20">
                PRO FEATURE EXCLUSIVE 🚀
              </span>
              <h3 className="font-black text-lg sm:text-xl text-[#1E293B]">
                {lang === 'ar' ? 'التحليلات المالية والتقارير المتقدمة مقفلة في الباقة المجانية' : 'Advanced Financial Analytics Locked in Free Plan'}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {lang === 'ar'
                  ? 'رصد معدلات العائد المالي من المحافظ، ساعات الذروة، تقارير أداء الكاشير، ونمو الزيارات اليومية متاحة حصرياً لباقة loya برو.'
                  : 'Get deep revenue insights, cashier scan logs, customer lifetime value charts, and retention trends with Loya Pro Unlimited.'}
              </p>
            </div>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-8 py-3.5 rounded-2xl bg-[#0D9488] bg-linear-to-r bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <Sparkles className="w-5 h-5" />
              <span>{lang === 'ar' ? 'فتح كافة التقارير والترقية الآن إلى Pro 🚀' : 'Unlock Analytics & Upgrade to Pro 🚀'}</span>
            </button>
          </div>

          {/* Dummy visual structure visible under blur */}
          <div className="opacity-30 pointer-events-none select-none space-y-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
              <div className="h-28 bg-slate-200 rounded-2xl" />
            </div>
            <div className="h-56 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 High Impact Stat Cards Replicating Screenshot 20 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] text-center shadow-sm hover:shadow transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="font-bold text-lg sm:text-2xl text-[#1E293B] tracking-tight leading-none">3.2x</div>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] mt-1 line-clamp-2 leading-tight">{lang === 'ar' ? 'نمو شهري في الزيارات' : 'Monthly Growth'}</div>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] text-center shadow-sm hover:shadow transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="font-bold text-lg sm:text-2xl text-[#1E293B] tracking-tight leading-none">89%</div>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] mt-1 line-clamp-2 leading-tight">{lang === 'ar' ? 'معدل رجوع العملاء' : 'Return Rate'}</div>
            </div>

            <div className="p-3 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] text-center shadow-sm hover:shadow transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="font-bold text-lg sm:text-2xl text-[#1E293B] tracking-tight leading-none">1,247</div>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] mt-1 line-clamp-2 leading-tight">{lang === 'ar' ? 'عميل نشط بالمحفظة' : 'Active Customers'}</div>
            </div>
          </div>

          {/* Weekly Points Addition Chart Replicating Screenshot 20 */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#1E293B]">
                  {lang === 'ar' ? 'النقاط المضافة هذا الأسبوع' : 'Points Added This Week'}
                </h4>
                <p className="text-xs text-[#64748B]">{lang === 'ar' ? 'مقارنة بالأسبوع الماضي' : 'Compared to previous week'}</p>
              </div>
              <span className="bg-[#F0FDFA] text-[#0D9488] border border-[#0D9488]/20 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <span>+23.4%</span>
                <span>🚀</span>
              </span>
            </div>

            {/* Chart Bars */}
            <div className="flex items-end justify-between h-44 pt-6 px-1 gap-2.5">
              {weeklyData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-8 bg-[#1E293B] text-white text-[10px] font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {item.label}
                  </div>

                  <div className="w-full h-32 bg-[#F1F5F9] rounded-xl flex items-end overflow-hidden p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-700 ${
                        item.val > 90
                          ? 'bg-[#0D9488]'
                          : 'bg-[#0F766E]/70'
                      }`}
                      style={{ height: `${item.val}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#64748B]">
                    {lang === 'ar' ? item.dayAr : item.dayEn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0 border border-[#0D9488]/20">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">{lang === 'ar' ? 'يوم الذروة الأسبوعي' : 'Weekly Peak Day'}</span>
                <h4 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'يوم الخميس (مساءً)' : 'Thursday (Evening)'}</h4>
                <p className="text-xs text-[#64748B] mt-0.5">{lang === 'ar' ? 'يمثل 38٪ من إجمالي عمليات مسح الباركود وصرف المكافآت' : 'Accounts for 38% of total scans and redemptions'}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] text-[#1E293B] flex items-center justify-center shrink-0 border border-[#E2E8F0]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider">{lang === 'ar' ? 'ساعات النشاط القصوى' : 'Peak Activity Hours'}</span>
                <h4 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? '6:00 م — 10:00 م' : '6:00 PM — 10:00 PM'}</h4>
                <p className="text-xs text-[#64748B] mt-0.5">{lang === 'ar' ? 'يُوصى بإرسال إشعارات الحملات الترويجية الساعة 5:00 مساءً' : 'Recommended push campaign time: 5:00 PM'}</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions Feed */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'ar' ? 'سجل العمليات الأحدث (بث الكاشير المباشر)' : 'Recent Transaction Log'}</span>
            </h4>
            <div className="divide-y divide-[#F1F5F9]">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1E293B] block">{tx.customerName}</span>
                    <span className="text-[10px] text-[#64748B]">{lang === 'ar' ? `بواسطة الكاشير: ${tx.cashierName} • ${tx.note}` : `By Cashier: ${tx.cashierName} • ${tx.note}`}</span>
                  </div>
                  <span
                    className={`font-bold px-2.5 py-1 rounded-xl ${
                      tx.amount > 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showUpgradeModal && (
        <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
};
