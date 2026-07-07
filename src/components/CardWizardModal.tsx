import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Award,
  Palette,
  Gift,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  Zap,
} from 'lucide-react';
import { CardExpiry, CardReward, CardRuleType, LoyaltyCard, RewardEngineType } from '../types';
import { useStore } from '../context/StoreContext';
import { WalletCardPreview } from './WalletCardPreview';
import { FreeCardDesignModal } from './FreeCardDesignModal';

interface CardWizardModalProps {
  initialCard?: LoyaltyCard | null;
  onClose: () => void;
}

const PRESET_COLORS = [
  { nameAr: 'برتقالي loya', nameEn: 'Loya Orange', hex: '#FF6B35' },
  { nameAr: 'أزرق ملكي', nameEn: 'Royal Blue', hex: '#3B82F6' },
  { nameAr: 'أخضر زمردي', nameEn: 'Emerald Green', hex: '#10B981' },
  { nameAr: 'بنفسجي فاخر', nameEn: 'Luxury Purple', hex: '#8B5CF6' },
  { nameAr: 'وردي كلاسيك', nameEn: 'Classic Pink', hex: '#EC4899' },
  { nameAr: 'رمادي ليلي', nameEn: 'Night Slate', hex: '#1E293B' },
  { nameAr: 'ذهبي دافئ', nameEn: 'Warm Gold', hex: '#D97706' },
  { nameAr: 'بني قهوة', nameEn: 'Coffee Brown', hex: '#78350F' },
];

export const CardWizardModal: React.FC<CardWizardModalProps> = ({ initialCard, onClose }) => {
  const { lang, addLoyaltyCard, updateLoyaltyCard, storeProfile } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showFreeDesign, setShowFreeDesign] = useState(false);

  // Form state
  const [name, setName] = useState(
    initialCard?.name || (lang === 'ar' ? 'بطاقة الولاء الذهبية' : 'Gold Loyalty Pass')
  );
  const [description, setDescription] = useState(
    initialCard?.description ||
      (lang === 'ar'
        ? 'اجمع نقاطك مع كل عملية شراء واستمتع بمكافآت حصرية'
        : 'Collect points with every purchase and unlock exclusive rewards')
  );
  const [ruleType, setRuleType] = useState<CardRuleType>(initialCard?.ruleType || 'points_per_riyal');
  const [pointsPerUnit, setPointsPerUnit] = useState<number>(initialCard?.pointsPerUnit || 1);
  const [minSpend, setMinSpend] = useState<number>(initialCard?.minSpend || 10);
  const [stampTarget, setStampTarget] = useState<number>(initialCard?.stampTarget || 5);
  const [expiry, setExpiry] = useState<CardExpiry>(initialCard?.expiry || 'never');

  // Design state
  const [color, setColor] = useState(initialCard?.color || '#FF6B35');
  const [textColor, setTextColor] = useState<'#FFFFFF' | '#000000'>(initialCard?.textColor || '#FFFFFF');
  const [bannerTitle, setBannerTitle] = useState(
    initialCard?.bannerTitle || (lang === 'ar' ? 'جمّع نقاطك واكسب مكافآت' : 'Collect Points & Earn Rewards')
  );
  const [bannerSubtext, setBannerSubtext] = useState(
    initialCard?.bannerSubtext || (lang === 'ar' ? 'بواسطة loya' : 'Powered by Loya')
  );

  // Links
  const [phone, setPhone] = useState(initialCard?.backLinks.phone || storeProfile.phone);
  const [googleMaps, setGoogleMaps] = useState(initialCard?.backLinks.googleMaps || '');
  const [instagram, setInstagram] = useState(initialCard?.backLinks.instagram || '');
  const [customNote, setCustomNote] = useState(initialCard?.backLinks.customNote || '');

  // Rewards & Win Probability
  const [rewardMethod, setRewardMethod] = useState<RewardEngineType>(initialCard?.rewardEngine || 'both');
  const [winProb, setWinProb] = useState<number>(initialCard?.winProbability ?? 10);
  const [instantGiftAr, setInstantGiftAr] = useState(initialCard?.instantGiftAr || 'مكافأة مميزة مجانية 🎁');
  const [instantGiftEn, setInstantGiftEn] = useState(initialCard?.instantGiftEn || 'Free Special Reward 🎁');

  const [rewards, setRewards] = useState<CardReward[]>(
    initialCard?.rewards || [
      { id: 'r1', title: lang === 'ar' ? 'مشروب مجاني من اختيارك' : 'Free Drink of Your Choice', pointsCost: 50, icon: '☕' },
      { id: 'r2', title: lang === 'ar' ? 'خصم 20% على الفاتورة' : '20% Bill Discount', pointsCost: 100, icon: '🏷️' },
    ]
  );
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(50);
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');

  // Security
  const [cashierPinEnabled, setCashierPinEnabled] = useState(true);

  // Quick buttons
  const [quickAddButtons, setQuickAddButtons] = useState<number[]>(
    initialCard?.quickAddButtons || (ruleType === 'stamp_buy_5' ? [1, 2, 3] : [10, 25, 50])
  );

  const draftCard: LoyaltyCard = {
    id: initialCard?.id || 'preview-card',
    name,
    description,
    ruleType,
    pointsPerUnit,
    minSpend,
    stampTarget,
    rewardEngine: rewardMethod,
    winProbability: rewardMethod === 'stamps' ? 0 : winProb,
    instantGiftAr,
    instantGiftEn,
    expiry,
    color,
    textColor,
    bannerTitle,
    bannerSubtext,
    backLinks: { phone, googleMaps, instagram, customNote },
    quickAddButtons,
    rewards,
    isActive: true,
    customersCount: initialCard?.customersCount || 0,
    createdAt: initialCard?.createdAt || (lang === 'ar' ? 'اليوم' : 'Today'),
  };

  const handleSave = () => {
    if (initialCard) {
      updateLoyaltyCard({ ...draftCard, id: initialCard.id });
    } else {
      addLoyaltyCard(draftCard);
    }
    onClose();
  };

  const addReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardTitle.trim()) return;
    setRewards([
      ...rewards,
      {
        id: `r-${Date.now()}`,
        title: newRewardTitle,
        pointsCost: Number(newRewardCost),
        icon: newRewardIcon || '🎁',
      },
    ]);
    setNewRewardTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-xl border border-[#E2E8F0] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">
                {initialCard
                  ? lang === 'ar'
                    ? 'تعديل بطاقة الولاء'
                    : 'Edit Loyalty Card'
                  : lang === 'ar'
                  ? 'تصميم بطاقة ولاء جديدة'
                  : 'Design New Loyalty Card'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">
                <span dir="ltr">
                  {lang === 'ar' ? `الخطوة ${step} من 5 • متوافق مع Apple & Google Wallet` : `Step ${step} of 5 • Apple & Google Wallet ready`}
                </span>
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

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-5 border-b border-[#E2E8F0] bg-white">
          {[
            { s: 1, labelAr: '1. المعلومات', labelEn: '1. Info' },
            { s: 2, labelAr: '2. النقاط', labelEn: '2. Rules' },
            { s: 3, labelAr: '3. التصميم', labelEn: '3. Design' },
            { s: 4, labelAr: '4. المكافآت', labelEn: '4. Rewards' },
            { s: 5, labelAr: '5. الأمان', labelEn: '5. Launch' },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => setStep(item.s as any)}
              className={`py-3 px-1 sm:px-2 text-[11px] sm:text-xs font-bold text-center transition-all border-b-2 truncate ${
                step === item.s
                  ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {lang === 'ar' ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* AI Design Request Promo */}
                <div
                  onClick={() => setShowFreeDesign(true)}
                  className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-dashed border-[#0D9488] text-[#1E293B] cursor-pointer hover:bg-[#CCFBF1]/50 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#0D9488]">
                        {lang === 'ar' ? 'نصمم لك البطاقة مجاناً! 🎨✨' : 'Free Custom Pass Design Service'}
                      </h5>
                      <p className="text-[10px] text-[#64748B]">
                        {lang === 'ar' ? 'اطلب تصميم بطاقتك بواسطة فريقنا المتخصص الآن' : 'Request professional wallet design by our team'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#0D9488] text-white px-2.5 py-1 rounded-lg shrink-0">
                    {lang === 'ar' ? 'اطلب الآن' : 'Request'}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'ar' ? 'اسم البطاقة' : 'Card Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF6B35] outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'ar' ? 'وصف البطاقة والشروط' : 'Description & Terms'}
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FF6B35] outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2.5">
                  <span className="text-xs font-bold text-gray-800 block">
                    {lang === 'ar' ? 'روابط ومعلومات ظهر البطاقة في المحفظة' : 'Back of Card Links & Info'}
                  </span>
                  <div>
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'رقم هاتف الفرع أو خدمة العملاء' : 'Customer Service Phone'}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="url"
                      placeholder={lang === 'ar' ? 'رابط خرائط جوجل للموقع' : 'Google Maps Location URL'}
                      value={googleMaps}
                      onChange={(e) => setGoogleMaps(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'حساب الانستغرام (مثال: @star_cafe)' : 'Instagram Handle'}
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'ملاحظة أو شرط إضافي (اختياري)' : 'Custom Note / Extra Term'}
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-gray-800 block">
                  {lang === 'ar' ? 'اختر نظام احتساب النقاط أو الطوابع' : 'Rule Type'}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'points_per_riyal', labelAr: 'نقطة / ريال', desc: 'نقطة لكل ريال مشتريات' },
                    { id: 'stamp_buy_5', labelAr: 'اشتر 5 (طوابع)', desc: 'طابع لكل كوب والسادس مجاناً' },
                    { id: 'points_per_visit', labelAr: 'نقطة / زيارة', desc: 'نقطة ثابتة عند كل زيارة' },
                    { id: 'manual', labelAr: 'إضافة يدوية', desc: 'الكاشير يحدد النقاط يدوياً' },
                  ].map((rt) => (
                    <button
                      key={rt.id}
                      type="button"
                      onClick={() => {
                        setRuleType(rt.id as any);
                        if (rt.id === 'stamp_buy_5') setQuickAddButtons([1, 2, 3]);
                        else setQuickAddButtons([10, 25, 50]);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                        ruleType === rt.id
                          ? 'border-[#FF6B35] bg-orange-50 ring-2 ring-orange-200 font-bold'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-900">{rt.labelAr}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{rt.desc}</span>
                    </button>
                  ))}
                </div>

                {ruleType === 'stamp_buy_5' ? (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {lang === 'ar' ? 'عدد الطوابع المطلوبة للحصول على الختم المجاني' : 'Target Stamps'}
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={stampTarget}
                      onChange={(e) => setStampTarget(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      {lang === 'ar' ? 'عدد النقاط المكتسبة لكل 1 ريال' : 'Points per 1 SAR'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pointsPerUnit}
                      onChange={(e) => setPointsPerUnit(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'ar' ? 'صلاحية النقاط / البطاقة' : 'Points Expiry'}
                  </label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm bg-white"
                  >
                    <option value="never">{lang === 'ar' ? 'بدون انتهاء صلاحية' : 'Never expire'}</option>
                    <option value="90_days">{lang === 'ar' ? '90 يوماً' : '90 Days'}</option>
                    <option value="6_months">{lang === 'ar' ? '6 أشهر' : '6 Months'}</option>
                    <option value="1_year">{lang === 'ar' ? 'سنة واحدة' : '1 Year'}</option>
                    <option value="2_years">{lang === 'ar' ? 'سنتان' : '2 Years'}</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    {lang === 'ar' ? 'لون خلفية البطاقة' : 'Card Color Theme'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((pc) => (
                      <button
                        key={pc.hex}
                        type="button"
                        onClick={() => setColor(pc.hex)}
                        className={`p-2.5 rounded-2xl text-white font-bold text-[11px] flex flex-col items-center justify-center transition-transform ${
                          color === pc.hex ? 'ring-4 ring-orange-300 scale-105 shadow-lg' : 'hover:scale-102'
                        }`}
                        style={{ backgroundColor: pc.hex }}
                      >
                        <span className="truncate">{lang === 'ar' ? pc.nameAr : pc.nameEn}</span>
                        {color === pc.hex && <Check className="w-4 h-4 mt-1" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-bold">{lang === 'ar' ? 'تخصيص لون HEX:' : 'Custom HEX:'}</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-none"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-24 px-2 py-1.5 rounded-xl border border-gray-200 font-mono text-xs text-center uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'ar' ? 'لون النصوص على البطاقة' : 'Text Color'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTextColor('#FFFFFF')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs border ${
                        textColor === '#FFFFFF' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800'
                      }`}
                    >
                      {lang === 'ar' ? 'أبيض (للخلفيات الداكنة)' : 'White (Dark Backgrounds)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextColor('#000000')}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs border ${
                        textColor === '#000000' ? 'bg-gray-100 text-gray-900 border-gray-400 font-black' : 'bg-white text-gray-500'
                      }`}
                    >
                      {lang === 'ar' ? 'أسود (للخلفيات الفاتحة)' : 'Black (Light Backgrounds)'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'ar' ? 'عنوان اللافتة العريضة (Banner Title)' : 'Banner Title'}
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {lang === 'ar' ? 'نص اللافتة الفرعي (Banner Subtext)' : 'Banner Subtext'}
                  </label>
                  <input
                    type="text"
                    value={bannerSubtext}
                    onChange={(e) => setBannerSubtext(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-sm"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 3-way Rewards Method */}
                <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <span className="text-xs font-bold text-[#1E293B] block">
                    {lang === 'ar' ? 'طريقة صرف المكافأة (نظام المكافآت)' : 'Rewards Engine Method'}
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'instant', labelAr: 'حظ فوري 🎲', labelEn: 'Instant Win' },
                      { id: 'stamps', labelAr: 'تجميع النقاط/الأختام 🏆', labelEn: 'Points / Stamps' },
                      { id: 'both', labelAr: 'كلاهما معاً ⭐', labelEn: 'Combined Both' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRewardMethod(m.id as any)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all border text-center ${
                          rewardMethod === m.id
                            ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                            : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
                        }`}
                      >
                        {lang === 'ar' ? m.labelAr : m.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant Win Probability Slider */}
                {(rewardMethod === 'instant' || rewardMethod === 'both') && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>{lang === 'ar' ? 'نسبة فوز العميل بمكافأة فورية بعد المسح' : 'Instant Win Probability per Scan'}</span>
                      </span>
                      <span className="text-xs font-black bg-amber-500 text-white px-2 py-0.5 rounded-lg">
                        {winProb}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={winProb}
                      onChange={(e) => setWinProb(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-amber-800 font-semibold">
                      💡 {lang === 'ar' ? `مثال: كل 10 عملاء يمسحون الباركود، سيفوز حوالي عميل واحد (${winProb}%) بمكافأة فورية لتعزيز التفاعل!` : `Approx. ${winProb}% of scanned visits trigger instant prize notification.`}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-bold text-gray-700 block mb-0.5">اسم الهدية الفورية (عربي)</label>
                        <input
                          type="text"
                          value={instantGiftAr}
                          onChange={(e) => setInstantGiftAr(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-700 block mb-0.5">Instant Gift Name (EN)</label>
                        <input
                          type="text"
                          value={instantGiftEn}
                          onChange={(e) => setInstantGiftEn(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-amber-300 text-xs bg-white"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Add Presets Configuration */}
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="text-xs font-bold text-gray-800 block">
                    {lang === 'ar' ? 'أزرار الكاشير السريعة (إضافة بنقرة واحدة)' : 'Cashier Quick-Add Buttons'}
                  </span>
                  <div className="flex items-center gap-2">
                    {quickAddButtons.map((val, idx) => (
                      <div key={idx} className="flex-1">
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => {
                            const next = [...quickAddButtons];
                            next[idx] = Number(e.target.value);
                            setQuickAddButtons(next);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-center font-bold text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <span className="text-xs font-bold text-gray-800 block pt-1">
                  {lang === 'ar' ? 'قائمة المكافآت التي يمكن للعميل صرفها عند اكتمال النقاط' : 'Rewards Catalog'}
                </span>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {rewards.map((rew) => (
                    <div
                      key={rew.id}
                      className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rew.icon}</span>
                        <div>
                          <h5 className="font-bold text-xs text-gray-900">{rew.title}</h5>
                          <span className="text-[10px] text-orange-600 font-bold">
                            {rew.pointsCost} {ruleType === 'stamp_buy_5' ? (lang === 'ar' ? 'طوابع' : 'stamps') : (lang === 'ar' ? 'نقطة' : 'pts')}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRewards(rewards.filter((r) => r.id !== rew.id))}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new reward */}
                <form onSubmit={addReward} className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2.5">
                  <span className="text-xs font-bold text-[#FF6B35] block">
                    + {lang === 'ar' ? 'إضافة مكافأة جديدة للقائمة' : 'Add Reward Option'}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="☕"
                      value={newRewardIcon}
                      onChange={(e) => setNewRewardIcon(e.target.value)}
                      className="w-14 px-2 py-1.5 rounded-xl border border-gray-200 bg-white text-center text-sm"
                    />
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'اسم المكافأة (مثال: قهوة مجانية)' : 'Reward Title'}
                      value={newRewardTitle}
                      onChange={(e) => setNewRewardTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">{lang === 'ar' ? 'التكلفة:' : 'Cost:'}</span>
                    <input
                      type="number"
                      min={1}
                      value={newRewardCost}
                      onChange={(e) => setNewRewardCost(Number(e.target.value))}
                      className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold"
                    />
                    <span className="text-xs text-gray-500">{ruleType === 'stamp_buy_5' ? (lang === 'ar' ? 'طوابع' : 'stamps') : (lang === 'ar' ? 'نقطة' : 'pts')}</span>
                    <button
                      type="submit"
                      className="mr-auto px-4 py-1.5 rounded-xl bg-[#FF6B35] hover:bg-orange-600 text-white font-bold text-xs shadow-sm"
                    >
                      {lang === 'ar' ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#0D9488]/20 flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#0D9488] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#1E293B]">
                      {lang === 'ar' ? 'أمان الكاشير وحماية رصيد النقاط' : 'Cashier Security & Fraud Protection'}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">
                      {lang === 'ar'
                        ? 'يتمتع نظام loya بضوابط أمان متقدمة تمنع التلاعب بالنقاط أو الإضافة المكررة في فترة قصيرة.'
                        : 'Loya provides advanced cashier security preventing duplicate point allocation or unauthorized stamping.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#1E293B]">
                          {lang === 'ar' ? 'تفعيل رمز كاشير آمن (PIN Protection)' : 'Enable Cashier PIN Security'}
                        </h5>
                        <p className="text-[10px] text-[#64748B]">
                          {lang === 'ar' ? 'يتطلب إدخال رقم سري للكاشير قبل اعتماد الصرف' : 'Requires cashier PIN before reward redemption'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCashierPinEnabled(!cashierPinEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        cashierPinEnabled ? 'bg-[#0D9488]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          cashierPinEnabled ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-[#64748B] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#1E293B] font-semibold">
                      <Check className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{lang === 'ar' ? 'حظر المسح المكرر لنفس العميل خلال 60 ثانية' : 'Rate limit: Block duplicate scans within 60s'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#1E293B] font-semibold">
                      <Check className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>{lang === 'ar' ? 'تسجيل كود الموظف مع كل عملية مسح أو إضافة' : 'Log staff ID with every scan or stamp'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <h5 className="font-bold text-xs text-[#1E293B]">
                    {lang === 'ar' ? 'قائمة جاهزية الإطلاق 🚀' : 'Launch Readiness Checklist 🚀'}
                  </h5>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[#0D9488] font-bold">
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تم تحديد الهوية والمعلومات بنجاح' : 'Card info and branding configured'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0D9488] font-bold">
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تم ربط قواعد احتساب النقاط والمكافآت' : 'Points rules and rewards linked'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0D9488] font-bold">
                      <Check className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'جاهز للمزامنة الفورية مع Apple & Google Wallet' : 'Ready for live Apple & Google Wallet sync'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Column */}
          <div className="flex flex-col justify-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <span className="text-xs font-bold text-gray-500 block text-center mb-1">
              {lang === 'ar' ? 'معاينة حية للبطاقة المحفوظة' : 'Live Preview'}
            </span>
            <WalletCardPreview card={draftCard} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold text-xs hover:bg-[#F1F5F9]"
              >
                {lang === 'ar' ? 'السابق' : 'Previous'}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm"
              >
                {lang === 'ar' ? 'التالي' : 'Next'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حفظ وإطلاق البطاقة 🚀' : 'Launch & Save Pass 🚀'}</span>
              </button>
            )}
          </div>
        </div>

        {showFreeDesign && <FreeCardDesignModal onClose={() => setShowFreeDesign(false)} />}
      </div>
    </div>
  );
};
