import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FreeCardDesignModalProps {
  onClose: () => void;
}

export const FreeCardDesignModal: React.FC<FreeCardDesignModalProps> = ({ onClose }) => {
  const { storeProfile, lang } = useStore();
  const [phone, setPhone] = useState(storeProfile.phone);
  const [note, setNote] = useState(
    lang === 'ar'
      ? 'نرغب بتصميم بطاقة ولاء بألوان واجهة المقهى مع شعارنا'
      : 'We want a custom loyalty pass designed matching our store brand colors and logo'
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 border border-[#E2E8F0]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center border border-[#0D9488]/20">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1E293B]">
                {lang === 'ar' ? 'نصمم لك البطاقة مجاناً! 🎨✨' : 'Free Custom Design Service 🎨✨'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {lang === 'ar' ? 'فريق تصميم loya يجهز لك بطاقة احترافية' : 'Our team will craft your pass for free'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#1E293B] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-16 h-16 text-[#16A34A] mx-auto animate-bounce" />
            <h4 className="font-bold text-lg text-[#1E293B]">
              {lang === 'ar' ? 'تم استلام طلبك بنجاح!' : 'Design Request Received!'}
            </h4>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
              {lang === 'ar' ? (
                <>سيتواصل معك مصمم loya عبر الواتساب على الرقم <strong dir="ltr">{phone}</strong> خلال أقل من ساعتين مع نماذج مخصصة لمنشأتك.</>
              ) : (
                <>Our design team will contact you via WhatsApp at <strong dir="ltr">{phone}</strong> within 2 hours with tailored wallet mockups.</>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#0D9488]/20 text-xs text-[#1E293B] leading-relaxed">
              💡 {lang === 'ar' ? 'نقدم هذه الخدمة مجاناً لجميع المشتركين لنضمن ظهور بطاقة منشأتك بأفضل جودة ممكنة داخل محافظ Apple Wallet & Google Wallet لعملائك.' : 'We provide professional pass design completely free to make your brand stand out inside Apple & Google Wallets.'}
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                {lang === 'ar' ? 'اسم المنشأة' : 'Store Name'}
              </label>
              <input
                type="text"
                value={storeProfile.name}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#64748B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                {lang === 'ar' ? 'رقم التواصل عبر واتساب *' : 'WhatsApp Contact Phone *'}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-mono outline-none focus:ring-2 focus:ring-[#0D9488]"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                {lang === 'ar' ? 'ملاحظات أو ألوان تفضلها' : 'Design Notes & Color Preferences'}
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#F1F5F9] font-bold text-xs text-[#1E293B]"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إرسال طلب التصميم المجاني' : 'Send Free Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
