import React, { useState } from 'react';
import { QrCode, RotateCcw, MapPin, Phone, Instagram, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { LoyaltyCard } from '../types';
import { useStore } from '../context/StoreContext';

interface WalletCardPreviewProps {
  card: LoyaltyCard;
  customerName?: string;
  pointsBalance?: number;
  stampsBalance?: number;
}

export const WalletCardPreview: React.FC<WalletCardPreviewProps> = ({
  card,
  customerName = 'أحمد محمد العمري',
  pointsBalance = 240,
  stampsBalance = 4,
}) => {
  const { storeProfile, lang } = useStore();
  const [isFlipped, setIsFlipped] = useState(false);

  const isStampCard = card.ruleType === 'stamp_buy_5';

  return (
    <div className="w-full max-w-sm mx-auto my-3 perspective-1000">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 bg-[#F1F5F9] px-2 py-0.5 rounded-md text-[#1E293B]"> Apple Wallet</span>
          <span>&bull;</span>
          <span className="inline-flex items-center gap-1 bg-[#F1F5F9] px-2 py-0.5 rounded-md text-[#1E293B]">💳 Google Wallet</span>
        </span>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-bold text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors border border-[#0D9488]/20 shadow-sm shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isFlipped ? (lang === 'ar' ? 'الوجه الأمامي' : 'Front') : (lang === 'ar' ? 'تفاصيل المحفظة' : 'Back Details')}</span>
        </button>
      </div>

      {/* Card Container */}
      <div
        className="w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl relative transition-all duration-500 overflow-hidden border-2 sm:border-4 border-white/20"
        style={{
          backgroundColor: card.color,
          color: card.textColor,
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="relative z-10 flex flex-col justify-between min-h-[350px] sm:min-h-[360px] gap-4">
            {/* Top Store Header */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {card.logoUrl || storeProfile.logoUrl ? (
                  <img
                    src={card.logoUrl || storeProfile.logoUrl}
                    alt={storeProfile.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover border-2 border-white/40 shadow-sm bg-white shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg sm:text-xl border border-white/30 shrink-0">
                    🏪
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base leading-tight tracking-tight flex items-center gap-1 truncate">
                    <span className="truncate">{storeProfile.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 fill-emerald-500/20 shrink-0" />
                  </h3>
                  <p className="text-[11px] sm:text-xs opacity-80 truncate mt-0.5">{card.name}</p>
                </div>
              </div>

              <div className="text-left bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl sm:rounded-2xl border border-white/10 shrink-0">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold block opacity-75 leading-none mb-0.5">
                  {isStampCard ? 'الطوابع' : 'الرصيد'}
                </span>
                <span className="text-base sm:text-lg font-bold block leading-none">
                  {isStampCard ? `${stampsBalance || 4} / ${card.stampTarget || 5}` : `${pointsBalance} نقطة`}
                </span>
              </div>
            </div>

            {/* Banner / Title Area */}
            <div className="py-3.5 px-4 rounded-xl sm:rounded-2xl bg-black/15 backdrop-blur-sm border border-white/15 text-center">
              <h4 className="font-bold text-sm sm:text-base drop-shadow-sm leading-snug line-clamp-2">
                {card.bannerTitle || card.description}
              </h4>
              <p className="text-[11px] sm:text-xs opacity-85 mt-1 truncate">
                {card.bannerSubtext || 'بواسطة loya للأعمال'}
              </p>
            </div>

            {/* Stamp Grid (If Stamp Card) */}
            {isStampCard && (
              <div className="py-3 px-2 bg-white/15 rounded-xl sm:rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {Array.from({ length: card.stampTarget || 5 }).map((_, i) => {
                  const isEarned = i < (stampsBalance || 4);
                  return (
                    <div
                      key={i}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all shrink-0 ${
                        isEarned
                          ? 'bg-white text-[#0D9488] border-white shadow-sm scale-105'
                          : 'bg-black/25 text-white/60 border-white/30 border-dashed'
                      }`}
                    >
                      {isEarned ? '☕' : i + 1}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Customer Info & QR Code */}
            <div className="bg-white text-[#1E293B] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-3 mt-auto border border-[#E2E8F0]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shrink-0">
                  <QrCode className="w-12 h-12 sm:w-14 sm:h-14 text-[#1E293B]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] sm:text-[10px] text-[#64748B] font-bold block uppercase tracking-wider leading-none mb-1">
                    {lang === 'ar' ? 'حامل البطاقة' : 'CARDHOLDER'}
                  </span>
                  <h5 className="font-bold text-xs sm:text-sm text-[#1E293B] truncate">{customerName}</h5>
                  <span className="text-[10px] bg-[#F0FDFA] text-[#0D9488] border border-[#0D9488]/20 font-bold px-2 py-0.5 rounded-md inline-block mt-1 truncate max-w-full">
                    ID: #{card.id.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="text-center pl-2 border-l border-[#E2E8F0] shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D9488] mx-auto animate-pulse" />
                <span className="text-[9px] text-[#64748B] font-bold mt-1 block leading-tight">مسح فوري</span>
              </div>
            </div>
          </div>
        ) : (
          /* BACK SIDE DETAILS */
          <div className="relative z-10 flex flex-col justify-between min-h-[350px] sm:min-h-[360px] space-y-4">
            <div className="pb-3 border-b border-white/20">
              <h4 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Award className="w-5 h-5 shrink-0" />
                <span>شروط وأحكام البطاقة</span>
              </h4>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="space-y-2.5 bg-black/20 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md border border-white/10 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="opacity-75 shrink-0">نوع الاحتساب:</span>
                <span className="font-bold text-right truncate">
                  {card.ruleType === 'points_per_riyal'
                    ? `${card.pointsPerUnit} نقطة لكل 1 ريال`
                    : card.ruleType === 'stamp_buy_5'
                    ? 'اشتر 5 والسادس مجاناً'
                    : 'نقطة عند كل زيارة'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="opacity-75 shrink-0">صلاحية النقاط:</span>
                <span className="font-bold text-right truncate">
                  {card.expiry === 'never' ? 'بدون انتهاء صلاحية' : 'سنة كاملة'}
                </span>
              </div>
            </div>

            {/* Back Links */}
            <div className="space-y-2 text-xs">
              <div className="font-bold opacity-85">روابط المنشأة:</div>
              <div className="grid grid-cols-1 gap-2">
                {card.backLinks.phone && (
                  <a
                    href={`tel:${card.backLinks.phone}`}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all font-bold truncate"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="truncate">اتصل بالفرع: {card.backLinks.phone}</span>
                  </a>
                )}
                {card.backLinks.googleMaps && (
                  <a
                    href={card.backLinks.googleMaps}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-all font-bold truncate"
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">موقعنا على خرائط جوجل</span>
                  </a>
                )}
                {card.backLinks.instagram && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/15 font-bold truncate">
                    <Instagram className="w-4 h-4 shrink-0" />
                    <span className="truncate">انستغرام: {card.backLinks.instagram}</span>
                  </div>
                )}
              </div>
            </div>

            {card.backLinks.customNote && (
              <div className="text-[11px] opacity-85 text-center italic bg-black/15 p-2 rounded-xl leading-relaxed">
                {card.backLinks.customNote}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
