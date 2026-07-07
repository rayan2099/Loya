import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  QrCode,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Users,
  Award,
  Zap,
  Gift,
  PlusCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  Calendar,
  Lock,
  Smartphone,
  Sparkles,
  Coffee,
  Utensils,
  ShoppingBag,
  Scissors,
  Dumbbell,
  Car,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { lang } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedBusiness, setSelectedBusiness] = useState('coffee');

  const businessPlaybooks = [
    {
      id: 'coffee',
      icon: Coffee,
      titleAr: 'مقهى',
      titleEn: 'Cafe',
      setupAr: 'اشتر 5 واحصل على السادس مجاناً',
      setupEn: 'Buy 5, get the 6th free',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'restaurant',
      icon: Utensils,
      titleAr: 'مطعم',
      titleEn: 'Restaurant',
      setupAr: 'نقاط حسب الفاتورة + هدية للزيارات المتكررة',
      setupEn: 'Bill-based points plus visit rewards',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'retail',
      icon: ShoppingBag,
      titleAr: 'تجزئة',
      titleEn: 'Retail',
      setupAr: 'نقاط لكل ريال مع مكافآت قابلة للاستبدال',
      setupEn: 'Points per riyal with redeemable rewards',
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      id: 'salon',
      icon: Scissors,
      titleAr: 'صالون',
      titleEn: 'Salon',
      setupAr: 'طابع لكل زيارة وخدمة مجانية بعد الاكتمال',
      setupEn: 'Visit stamps with a free service reward',
      color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    },
    {
      id: 'gym',
      icon: Dumbbell,
      titleAr: 'نادي',
      titleEn: 'Gym',
      setupAr: 'مكافآت للالتزام وتجديد الاشتراك',
      setupEn: 'Rewards for consistency and renewals',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'cars',
      icon: Car,
      titleAr: 'سيارات',
      titleEn: 'Auto',
      setupAr: 'غسلة أو خدمة مجانية بعد عدد زيارات محدد',
      setupEn: 'Free wash or service after repeat visits',
      color: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  ];

  const selectedPlaybook = businessPlaybooks.find((item) => item.id === selectedBusiness) || businessPlaybooks[0];

  const slides = [
    {
      tagAr: 'إعداد سريع حسب نوع النشاط',
      tagEn: 'Quick setup by business type',
      titleAr: 'اختر نشاطك وسنقترح أفضل نظام ولاء',
      subAr: 'ابدأ من قالب جاهز يناسب منشأتك، ثم عدّل النقاط والطوابع والمكافآت وقتما تريد',
      titleEn: 'Choose your business and get the right loyalty setup',
      subEn: 'Start from a ready playbook, then adjust points, stamps, and rewards anytime',
      renderVisual: () => {
        const ActiveIcon = selectedPlaybook.icon;

        return (
          <div className="space-y-4 my-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-2 gap-2.5">
              {businessPlaybooks.map((playbook) => {
                const Icon = playbook.icon;
                const active = selectedBusiness === playbook.id;

                return (
                  <button
                    key={playbook.id}
                    type="button"
                    onClick={() => setSelectedBusiness(playbook.id)}
                    className={`p-3 rounded-2xl border text-start transition-all active:scale-98 ${
                      active
                        ? 'bg-[#0D9488] border-[#0D9488] text-white shadow-lg shadow-teal-700/20'
                        : 'bg-white border-slate-200 text-[#1E293B] hover:border-[#0D9488]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center border ${active ? 'bg-white/15 border-white/20' : playbook.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </span>
                      <span className="font-extrabold text-sm">{lang === 'ar' ? playbook.titleAr : playbook.titleEn}</span>
                    </div>
                    <p className={`mt-2 text-[10px] leading-relaxed ${active ? 'text-white/80' : 'text-[#64748B]'}`}>
                      {lang === 'ar' ? playbook.setupAr : playbook.setupEn}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-wide">
                    {lang === 'ar' ? 'القالب المقترح' : 'Recommended playbook'}
                  </p>
                  <h4 className="text-base font-extrabold text-[#1E293B] mt-1">
                    {lang === 'ar' ? selectedPlaybook.setupAr : selectedPlaybook.setupEn}
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed mt-1.5">
                    {lang === 'ar'
                      ? 'سيتم تجهيز بطاقة المحفظة، طريقة الكسب، والمكافأة الأولى بناءً على اختيارك.'
                      : 'We prepare the wallet card, earning rule, and first reward from your choice.'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
                  <ActiveIcon className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {[
                  lang === 'ar' ? 'نوع البطاقة' : 'Card type',
                  lang === 'ar' ? 'المكافأة' : 'Reward',
                  lang === 'ar' ? 'الموظفين' : 'Staff flow',
                ].map((label) => (
                  <div key={label} className="rounded-2xl bg-[#F8FAFC] border border-slate-100 px-2 py-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[9px] font-bold text-[#64748B] leading-tight block">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      tagAr: 'شركة الحلول السعودية لتقنية المعلومات',
      tagEn: 'Saudi IT Solutions Co.',
      titleAr: 'نظام ولاء احترافي لمنشأتك',
      subAr: 'أنشئ بطاقة ولاء لعملائك وتابع نموّ أعمالك واستبقاء عملائك بكل سهولة',
      titleEn: 'Professional Loyalty System for Your Business',
      subEn: 'Create loyalty cards for your customers and track growth effortlessly',
      renderVisual: () => (
        <div className="space-y-4 my-2 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-right text-xs font-bold text-[#1E293B] mb-1">
            {lang === 'ar' ? '4 أنواع من البطاقات المتاحة:' : '4 Card Types Available:'}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center text-center shadow-sm hover:shadow transition-all">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-1.5">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{lang === 'ar' ? 'نقطة / زيارة' : 'Point / Visit'}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">{lang === 'ar' ? 'نقطة مع كل زيارة للمنشأة' : 'Point per store visit'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center text-center shadow-sm hover:shadow transition-all">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5">
                <Award className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{lang === 'ar' ? 'نقطة / ريال' : 'Point / Riyal'}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">{lang === 'ar' ? 'نقطة مع كل عملية شراء' : 'Points per riyal spent'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center shadow-sm hover:shadow transition-all">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                <PlusCircle className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{lang === 'ar' ? 'يدوي' : 'Manual'}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">{lang === 'ar' ? 'الموظف يضيف النقاط يدوياً' : 'Staff manually adds pts'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col items-center text-center shadow-sm hover:shadow transition-all">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5">
                <Gift className="w-4.5 h-4.5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">{lang === 'ar' ? 'اشتر 5' : 'Buy 5 Stamp'}</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">{lang === 'ar' ? 'السادس مجاناً — طابع ختمي' : '6th free stamp card'}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0D9488] bg-linear-to-r bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white flex items-center justify-between shadow-sm">
            <div className="text-right flex-1">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'ar' ? 'قوالب جاهزة احترافية' : 'Ready Professional Templates'}</span>
              </h4>
              <p className="text-[11px] text-white/80 mt-0.5">{lang === 'ar' ? '5 قوالب ألوان وهوية مخصصة جاهزة للإطلاق الفوري' : '5 ready color templates for instant launch'}</p>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-[11px] font-bold text-[#64748B] mb-2 text-right">
              {lang === 'ar' ? 'ما الذي تتحكم فيه بالكامل؟' : 'What do you control?'}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {[
                lang === 'ar' ? 'حد الاستبدال' : 'Redemption limit',
                lang === 'ar' ? 'نسبة النقاط للريال' : 'Points/SAR ratio',
                lang === 'ar' ? 'ألوان وشعار' : 'Colors & Logo',
                lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date',
                lang === 'ar' ? 'المكافأة' : 'Rewards',
                lang === 'ar' ? 'إشعارات المحفظة' : 'Wallet Push',
                lang === 'ar' ? 'بطاقات متعددة' : 'Multiple Cards',
              ].map((pill, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold text-[10px] shadow-2xs">
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      tagAr: 'Apple & Google Wallet',
      tagEn: 'Apple & Google Wallet',
      titleAr: 'العميل يضيف البطاقة لجواله خلال ثوانٍ',
      subAr: 'بدون تطبيق — يعمل مباشرة في Apple Wallet و Google Wallet الرسمية',
      titleEn: 'Customers add cards to Wallet in seconds',
      subEn: 'No app needed — works natively inside official Apple & Google Wallets',
      renderVisual: () => (
        <div className="my-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center text-center">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <span>Google Wallet</span> 💳
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <span>Apple Wallet</span> 
              </span>
            </div>

            <div className="p-5 bg-orange-50 bg-linear-to-br bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl border-2 border-orange-200 shadow-inner mb-4">
              <QrCode className="w-36 h-36 text-gray-900 mx-auto" />
            </div>

            <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-extrabold flex items-center justify-center gap-1.5 border border-emerald-200/50">
              <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600 animate-bounce" />
              <span>{lang === 'ar' ? 'أقل من 5 ثوانٍ للإضافة للمحفظة!' : 'Less than 5 seconds to add!'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      tagAr: 'مسح سريع وآمن',
      tagEn: 'Fast & Secure Scan',
      titleAr: 'أضف نقاطاً أو طوابع بمسح بسيط',
      subAr: 'امسح بطاقة العميل وأضف النقاط أو الطوابع في ثانية واحدة بأمان كاشير محكم',
      titleEn: 'Add points or stamps with a simple scan',
      subEn: 'Scan customer wallet card and reward them instantly with cashier security',
      renderVisual: () => (
        <div className="my-3 space-y-3.5 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#1E293B] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-slate-700">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{lang === 'ar' ? 'ماسح loya المباشر' : 'Live Cashier Scanner'}</span>
            </div>

            <div className="flex flex-col items-center py-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 mb-2.5">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base">{lang === 'ar' ? 'تم المسح بنجاح!' : 'Scanned Successfully!'}</h4>
              <p className="text-xs text-gray-300 mt-0.5">{lang === 'ar' ? 'أحمد محمد — 240 نقطة' : 'Ahmed Mohammed — 240 pts'}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <div className="text-xs font-bold text-[#1E293B]">{lang === 'ar' ? 'إجراءات سريعة بعد المسح:' : 'Quick post-scan actions:'}</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-2 text-right">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">+</div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">{lang === 'ar' ? 'إضافة نقاط' : 'Add Points'}</div>
                  <div className="text-[9px] text-gray-500 truncate">{lang === 'ar' ? 'نقطة/ريال' : 'Pts/SAR'}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center gap-2 text-right">
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0">🎫</div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">{lang === 'ar' ? 'إضافة طابع' : 'Add Stamp'}</div>
                  <div className="text-[9px] text-gray-500 truncate">{lang === 'ar' ? 'نظام الأختام' : 'Stamp card'}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2 text-right">
                <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center text-xs font-bold shrink-0">🎁</div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">{lang === 'ar' ? 'صرف مكافأة' : 'Redeem Reward'}</div>
                  <div className="text-[9px] text-gray-500 truncate">{lang === 'ar' ? 'استبدال رصيد' : 'Claim gift'}</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-2 text-right">
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">📋</div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-gray-900 truncate">{lang === 'ar' ? 'سجل العميل' : 'History'}</div>
                  <div className="text-[9px] text-gray-500 truncate">{lang === 'ar' ? 'الزيارات السابقة' : 'Visit ledger'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-around py-2 px-3 bg-white rounded-xl border border-[#E2E8F0] text-[10px] font-bold text-[#64748B]">
            <span className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'آمن 100٪' : '100% Secure'}</span>
            </span>
            <span>&bull;</span>
            <span>{lang === 'ar' ? 'متعدد البطاقات' : 'Multi-card'}</span>
            <span>&bull;</span>
            <span>{lang === 'ar' ? 'فوري بثانية' : 'Instant 1s'}</span>
          </div>
        </div>
      ),
    },
    {
      tagAr: 'إدارة الصلاحيات',
      tagEn: 'Permissions Management',
      titleAr: 'أضف موظفين لمنشأتك وتحكم في صلاحياتهم',
      subAr: 'كل موظف يسجل دخول بحسابه الخاص وكود الانضمام مع صلاحيات محددة بدقة',
      titleEn: 'Add staff & control team permissions precisely',
      subEn: 'Each employee joins via store code with custom permissions',
      renderVisual: () => (
        <div className="my-4 space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#1E293B]">{lang === 'ar' ? 'فريق العمل' : 'Staff Team'}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{lang === 'ar' ? '3 موظفين' : '3 Staff'}</span>
          </div>

          <div className="space-y-2">
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-sm">م</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{lang === 'ar' ? 'محمد العمري' : 'Mohammed Al-Omari'}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span>{lang === 'ar' ? 'كاشير' : 'Cashier'}</span>
                    <span>&bull;</span>
                    <span className="text-purple-700 font-bold bg-purple-100/60 px-1.5 py-0.5 rounded text-[10px]">
                      {lang === 'ar' ? 'صلاحيات 2/6' : 'Perms 2/6'}
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">{lang === 'ar' ? 'نشط' : 'Active'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm">س</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{lang === 'ar' ? 'سارة الزهراني' : 'Sarah Al-Zahrani'}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span>{lang === 'ar' ? 'مدير فرع' : 'Branch Mgr'}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded text-[10px]">
                      {lang === 'ar' ? 'صلاحيات 6/6' : 'Perms 6/6'}
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">{lang === 'ar' ? 'نشط' : 'Active'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm">خ</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{lang === 'ar' ? 'خالد الرشيدي' : 'Khaled Al-Rashidi'}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span>{lang === 'ar' ? 'موظف' : 'Staff'}</span>
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">{lang === 'ar' ? 'معلق' : 'Pending'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      tagAr: 'تحليلات وبيانات حقيقية',
      tagEn: 'Real Data & Analytics',
      titleAr: 'تحليلات وبيانات عملائك كلها في مكان واحد',
      subAr: 'راقب أداء منشأتك واتخذ قرارات مبنية على البيانات الحقيقية لزيادة أرباحك',
      titleEn: 'All your customer analytics in one dashboard',
      subEn: 'Monitor your business performance and make data-driven decisions',
      renderVisual: () => {
        const daysAr = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
        const daysEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const chartVals = [45, 60, 50, 75, 85, 100, 70];

        return (
          <div className="my-3 space-y-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                <TrendingUp className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <div className="font-extrabold text-sm text-purple-900">{lang === 'ar' ? '3.2x' : '3.2x'}</div>
                <div className="text-[10px] text-gray-600 font-semibold">{lang === 'ar' ? 'نمو شهري' : 'Monthly Growth'}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <RefreshCw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="font-extrabold text-sm text-emerald-900">{lang === 'ar' ? '٪89' : '89%'}</div>
                <div className="text-[10px] text-gray-600 font-semibold">{lang === 'ar' ? 'معدل رجوع' : 'Return Rate'}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                <Users className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                <div className="font-extrabold text-sm text-orange-900">{lang === 'ar' ? '1247' : '1247'}</div>
                <div className="text-[10px] text-gray-600 font-semibold">{lang === 'ar' ? 'عميل نشط' : 'Active Users'}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-gray-900">{lang === 'ar' ? 'النقاط المضافة هذا الأسبوع' : 'Points Added This Week'}</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{lang === 'ar' ? '+23٪' : '+23%'}</span>
              </div>
              <div className="flex items-end justify-between h-20 pt-2 px-1 gap-1.5">
                {chartVals.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${idx === 5 ? 'bg-[#0D9488] shadow-sm' : 'bg-slate-200'}`}
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[9px] text-[#64748B] font-semibold truncate w-full text-center">
                      {lang === 'ar' ? daysAr[idx] : daysEn[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] text-center text-[10px]">
              <div>
                <span className="text-[#64748B] block">{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <strong className="text-[#1E293B] font-bold">{lang === 'ar' ? '4820' : '4,820'}</strong>
              </div>
              <div className="border-x border-slate-200 px-1">
                <span className="text-[#64748B] block">{lang === 'ar' ? 'أعلى يوم' : 'Peak Day'}</span>
                <strong className="text-[#0D9488] font-bold">{lang === 'ar' ? 'الخميس' : 'Thursday'}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block">{lang === 'ar' ? 'أوقات الذروة' : 'Peak Hours'}</span>
                <strong className="text-[#1E293B] font-bold">{lang === 'ar' ? '6 - 8 م' : '6-8 PM'}</strong>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const current = slides[currentSlide];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-5 sm:p-6 max-w-md mx-auto select-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onComplete}
          className="text-xs font-bold text-[#64748B] hover:text-[#1E293B] px-3.5 py-1.5 rounded-full bg-[#F1F5F9] active:scale-95 transition-all"
        >
          {lang === 'ar' ? 'تخطى' : 'Skip'}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0D9488] flex items-center justify-center shadow-sm">
            <Award className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-[#1E293B] tracking-tight">loya</span>
        </div>
        <div className="text-xs font-bold text-[#64748B] bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs" dir="ltr">
          {`${currentSlide + 1} / ${slides.length}`}
        </div>
      </div>

      {/* Middle Content */}
      <div className="my-auto py-3">
        <div className="text-center mb-3">
          <span className="px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0D9488] text-[10px] sm:text-[11px] font-extrabold inline-block mb-2 border border-[#0D9488]/20 shadow-2xs">
            {lang === 'ar' ? current.tagAr : current.tagEn}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] leading-snug">
            {lang === 'ar' ? current.titleAr : current.titleEn}
          </h2>
          <p className="text-xs text-[#64748B] mt-1.5 max-w-xs mx-auto leading-relaxed">
            {lang === 'ar' ? current.subAr : current.subEn}
          </p>
        </div>

        {current.renderVisual()}
      </div>

      {/* Footer Navigation */}
      <div className="space-y-4 pt-2">
        {/* Dots */}
        <div className="flex justify-center items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-[#0D9488]' : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (currentSlide < slides.length - 1) {
              setCurrentSlide((c) => c + 1);
            } else {
              onComplete();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm sm:text-base shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>{currentSlide < slides.length - 1 ? (lang === 'ar' ? 'التالي' : 'Next') : (lang === 'ar' ? '🚀 ابدأ الآن مجاناً' : 'Start Free Now 🚀')}</span>
          {lang === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
