import React, { useState } from 'react';
import { Award, Store, Coffee, Utensils, Scissors, Eye, EyeOff, KeyRound, Users, Check, ArrowRight } from 'lucide-react';
import { BusinessCategory } from '../types';
import { useStore } from '../context/StoreContext';

export const AuthView: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { storeProfile, setStoreProfile, lang } = useStore();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [storeName, setStoreName] = useState(storeProfile.name);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [email, setEmail] = useState('contact@starcafe.sa');
  const [password, setPassword] = useState('12345678');
  const [category, setCategory] = useState<BusinessCategory>(storeProfile.category);

  // Modals state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [staffName, setStaffName] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  const categories: { id: BusinessCategory; icon: React.ReactNode; en: string }[] = [
    { id: 'مطعم', icon: <Utensils className="w-3.5 h-3.5" />, en: 'Restaurant' },
    { id: 'مقهى', icon: <Coffee className="w-3.5 h-3.5" />, en: 'Cafe' },
    { id: 'صالون', icon: <Scissors className="w-3.5 h-3.5" />, en: 'Salon' },
    { id: 'ملابس', icon: <span>👔</span>, en: 'Apparel' },
    { id: 'صيدلية', icon: <span>💊</span>, en: 'Pharmacy' },
    { id: 'رياضة', icon: <span>🏋️‍♂️</span>, en: 'Fitness' },
    { id: 'بقالة', icon: <span>🛒</span>, en: 'Grocery' },
    { id: 'خدمات سيارات', icon: <span>🔧</span>, en: 'Auto Services' },
    { id: 'مغسلة سيارات', icon: <span>🚗</span>, en: 'Car Wash' },
    { id: 'مركز مساج', icon: <span>💆‍♂️</span>, en: 'Massage Spa' },
    { id: 'مشغل نسائي', icon: <span>💅</span>, en: 'Beauty Parlor' },
    { id: 'محل ورود', icon: <span>💐</span>, en: 'Flower Shop' },
    { id: 'أخرى', icon: <Store className="w-3.5 h-3.5" />, en: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && (!storeName.trim() || phone.length < 9)) return;
    if (!isLogin) {
      setStoreProfile((prev) => ({
        ...prev,
        name: storeName,
        phone,
        email,
        category,
      }));
    }
    onLoginSuccess();
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinSuccess(true);
    setTimeout(() => {
      setShowJoinModal(false);
      onLoginSuccess();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-sm border border-[#E2E8F0] space-y-5">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-[#0D9488] text-white mx-auto flex items-center justify-center shadow-sm">
            <Award className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">
            {lang === 'ar' ? 'loya لمنشآت الأعمال' : 'Loya Business Portal'}
          </h1>
          <p className="text-xs text-[#64748B] max-w-xs mx-auto leading-relaxed">
            {isLogin
              ? lang === 'ar'
                ? 'سجل دخولك لإدارة بطاقات ولاء منشأتك وعملائك'
                : 'Sign in to manage your loyalty cards and customers'
              : lang === 'ar'
                ? 'أنشئ حساب منشأتك في ثوانٍ واربط بطاقاتك بمحافظ Apple & Google Wallet'
                : 'Create your store account in seconds and connect with Apple & Google Wallet'}
          </p>
        </div>

        {/* Tab Switch */}
        <div className="flex bg-[#F1F5F9] p-1.5 rounded-xl">
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isLogin ? 'bg-white text-[#0D9488] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            {lang === 'ar' ? 'إنشاء حساب جديد' : 'Sign Up'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isLogin ? 'bg-white text-[#0D9488] shadow-sm' : 'text-[#64748B]'
            }`}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                {lang === 'ar' ? 'اسم المتجر أو المنشأة *' : 'Store / Business Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'ar' ? 'مثال: مقهى النجوم - Star Cafe' : 'e.g., Star Cafe'}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold focus:ring-2 focus:ring-[#0D9488] outline-none bg-white text-[#1E293B]"
              />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                {lang === 'ar' ? 'نوع النشاط *' : 'Business Category *'}
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border shrink-0 transition-all ${
                      category === cat.id
                        ? 'bg-[#F0FDFA] border-[#0D9488] text-[#0D9488] shadow-2xs'
                        : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {cat.icon}
                    <span>{lang === 'ar' ? cat.id : cat.en}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#1E293B] block mb-1">
              {lang === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-mono focus:ring-2 focus:ring-[#0D9488] outline-none bg-white text-[#1E293B] text-left"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1E293B] block mb-1">
              {lang === 'ar' ? 'رقم الجوال *' : 'Phone Number *'}
            </label>
            <input
              type="tel"
              required
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-mono focus:ring-2 focus:ring-[#0D9488] outline-none bg-white text-[#1E293B] text-left"
              dir="ltr"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#1E293B]">
                {lang === 'ar' ? 'كلمة المرور *' : 'Password *'}
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-semibold text-[#0D9488] hover:underline"
                >
                  {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-mono focus:ring-2 focus:ring-[#0D9488] outline-none bg-white text-[#1E293B] text-left"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] active:scale-98 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>{isLogin ? (lang === 'ar' ? 'دخول لوحة تحكم المنشأة' : 'Sign In to Portal') : (lang === 'ar' ? 'بدء التجربة المجانية الفورية 🚀' : 'Start Free Trial 🚀')}</span>
          </button>
        </form>

        {/* Secondary Action: Join an Establishment */}
        <div className="pt-3 border-t border-[#E2E8F0] text-center">
          <button
            type="button"
            onClick={() => {
              setJoinSuccess(false);
              setShowJoinModal(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#1E293B] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-[#0D9488]" />
            <span>{lang === 'ar' ? 'هل أنت موظف؟ الانضمام إلى منشأة بكود الدعوة' : 'Are you staff? Join an establishment'}</span>
          </button>
        </div>

        <div className="text-center pt-1">
          <span className="text-[10px] text-[#64748B] font-medium">
            {lang === 'ar'
              ? 'بالدخول أنت توافق على شروط الخدمة وسياسة الخصوصية لمنصة loya'
              : 'By entering, you agree to Loya Terms of Service & Privacy Policy'}
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'}</h3>
              <p className="text-xs text-[#64748B] mt-1">{lang === 'ar' ? 'أدخل بريدك أو رقم جوالك المسجل لإرسال رابط الاستعادة' : 'Enter your registered email or phone number'}</p>
            </div>
            {forgotSent ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تم إرسال تعليمات استعادة كلمة المرور بنجاح!' : 'Reset link sent successfully!'}</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder={lang === 'ar' ? 'البريد الإلكتروني أو الجوال' : 'Email or Phone'}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] font-bold text-xs text-[#1E293B]"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              {!forgotSent && (
                <button
                  onClick={() => setForgotSent(true)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0D9488] text-white font-bold text-xs"
                >
                  {lang === 'ar' ? 'إرسال الرابط' : 'Send Reset Link'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Join Establishment Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'الانضمام إلى فريق منشأة' : 'Join Staff Team'}</h3>
              <p className="text-xs text-[#64748B] mt-1">{lang === 'ar' ? 'أدخل كود الانضمام الممنوح لك من مدير الفرع أو مالك المنشأة' : 'Enter join code provided by store owner or manager'}</p>
            </div>
            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#1E293B] block mb-1">{lang === 'ar' ? 'اسمك الكريم' : 'Your Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'مثال: محمد العمري' : 'e.g., Mohammed Al-Omari'}
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#1E293B] block mb-1">{lang === 'ar' ? 'كود الانضمام (Join Code)' : 'Join Code'}</label>
                <input
                  type="text"
                  required
                  placeholder="LYA-XXXXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-mono text-center tracking-widest uppercase outline-none focus:ring-2 focus:ring-purple-600"
                  dir="ltr"
                />
              </div>
              {joinSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-pulse">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تم التحقق والانضمام بنجاح! جاري الدخول...' : 'Verified! Entering store...'}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] font-bold text-xs text-[#1E293B]"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={joinSuccess}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
                >
                  {lang === 'ar' ? 'انضمام الآن' : 'Join Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

