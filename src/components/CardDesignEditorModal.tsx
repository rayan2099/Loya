import React, { useState } from 'react';
import { X, Palette, Check, Save, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { LoyaltyCard } from '../types';
import { useStore } from '../context/StoreContext';
import { WalletCardPreview } from './WalletCardPreview';
import { FreeCardDesignModal } from './FreeCardDesignModal';

interface CardDesignEditorModalProps {
  card: LoyaltyCard;
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

export const CardDesignEditorModal: React.FC<CardDesignEditorModalProps> = ({ card, onClose }) => {
  const { lang, updateLoyaltyCard } = useStore();
  const [color, setColor] = useState(card.color || '#FF6B35');
  const [textColor, setTextColor] = useState<'#FFFFFF' | '#000000'>(card.textColor || '#FFFFFF');
  const [bannerTitle, setBannerTitle] = useState(card.bannerTitle || (lang === 'ar' ? 'جمّع نقاطك واكسب مكافآت' : 'Collect Points & Earn Rewards'));
  const [bannerSubtext, setBannerSubtext] = useState(card.bannerSubtext || (lang === 'ar' ? 'بواسطة loya' : 'Powered by Loya'));
  const [showFreeDesign, setShowFreeDesign] = useState(false);

  const updatedCard: LoyaltyCard = {
    ...card,
    color,
    textColor,
    bannerTitle,
    bannerSubtext,
  };

  const handleSave = () => {
    updateLoyaltyCard(updatedCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-xl border border-[#E2E8F0] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] transition-colors"
            >
              {lang === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#0D9488] text-white flex items-center justify-center shadow-sm shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">
                {lang === 'ar' ? `تخصيص تصميم بطاقة: ${card.name}` : `Customize Design: ${card.name}`}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">
                {lang === 'ar' ? 'معاينة مباشرة لتغييرات محفظتي Apple Wallet & Google Wallet' : 'Live preview for Apple Wallet & Google Wallet pass'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor Options */}
          <div className="space-y-5">
            {/* Free AI Service Banner */}
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

            {/* Colors Grid */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                {lang === 'ar' ? 'لون خلفية البطاقة في المحفظة' : 'Wallet Pass Background Color'}
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
                  className="w-24 px-2 py-1.5 rounded-xl border border-gray-200 font-mono text-xs text-center uppercase font-bold"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                {lang === 'ar' ? 'لون النصوص والبيانات على البطاقة' : 'Pass Text & Data Color'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTextColor('#FFFFFF')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                    textColor === '#FFFFFF' ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-gray-800'
                  }`}
                >
                  {lang === 'ar' ? 'أبيض (للخلفيات الداكنة)' : 'White (Dark Backgrounds)'}
                </button>
                <button
                  type="button"
                  onClick={() => setTextColor('#000000')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs border transition-all ${
                    textColor === '#000000' ? 'bg-gray-100 text-gray-900 border-gray-400 font-black shadow-sm' : 'bg-white text-gray-500'
                  }`}
                >
                  {lang === 'ar' ? 'أسود (للخلفيات الفاتحة)' : 'Black (Light Backgrounds)'}
                </button>
              </div>
            </div>

            {/* Banner Title */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'ar' ? 'عنوان اللافتة العريضة (Banner Title)' : 'Banner Title'}
              </label>
              <input
                type="text"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>

            {/* Banner Subtext */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {lang === 'ar' ? 'نص اللافتة الفرعي (Banner Subtext)' : 'Banner Subtext'}
              </label>
              <input
                type="text"
                value={bannerSubtext}
                onChange={(e) => setBannerSubtext(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex flex-col justify-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
            <span className="text-xs font-bold text-gray-500 block text-center mb-2">
              {lang === 'ar' ? 'معاينة حية للمحفظة الفورية' : 'Instant Live Preview'}
            </span>
            <WalletCardPreview card={updatedCard} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold text-xs hover:bg-[#F1F5F9]"
          >
            {lang === 'ar' ? 'إلغاء والتراجع' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'ar' ? 'حفظ التصميم 💾' : 'Save Design 💾'}</span>
          </button>
        </div>

        {showFreeDesign && <FreeCardDesignModal onClose={() => setShowFreeDesign(false)} />}
      </div>
    </div>
  );
};
