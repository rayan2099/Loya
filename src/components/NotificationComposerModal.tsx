import React, { useState } from 'react';
import { X, Bell, Send, Check, Smartphone, Sparkles, Users, Calendar, Clock, AlertTriangle, MessageSquare, History, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NotificationComposerModalProps {
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: 't1',
    titleAr: '☕ قهوة مجانية عند زيارتك اليوم!',
    bodyAr: 'أبرز بطاقتك في المحفظة عند الكاشير واحصل على قهوتك المفضلة مجاناً.',
    titleEn: '☕ Free Coffee With Today’s Visit!',
    bodyEn: 'Present your pass at checkout and enjoy a free barista coffee on us.',
  },
  {
    id: 't2',
    titleAr: '⭐ نقاط مضاعفة هذا الأسبوع!',
    bodyAr: 'احصل على ضعف النقاط عند كل عملية شراء حتى نهاية عطلة الأسبوع.',
    titleEn: '⭐ Double Points This Weekend!',
    bodyEn: 'Earn 2x points on all purchases through Sunday night.',
  },
  {
    id: 't3',
    titleAr: '🎁 خصم 10٪ خاص بعملاء المحفظة',
    bodyAr: 'استمتع بخصم فوري عند إبراز بطاقة ولاء متجرنا من محفظة جوالك.',
    titleEn: '🎁 10% Exclusive Passholder Discount',
    bodyEn: 'Enjoy instant savings when presenting your digital wallet pass.',
  },
  {
    id: 't4',
    titleAr: '🎉 هدية خاصة بمناسبة عيد ميلادك!',
    bodyAr: 'نتمنى لك عاماً سعيداً! تفضل بزيارتنا لاستلام هديتك المجانية اليوم.',
    titleEn: '🎉 Special Birthday Treat For You!',
    bodyEn: 'Happy Birthday! Stop by our store today to claim your free surprise gift.',
  },
  {
    id: 't5',
    titleAr: '🔥 عرض الغداء السريع المحدود',
    bodyAr: 'خصم 20٪ على وجبات الغداء بين الساعة 1 و 4 مساءً لعملاء loya.',
    titleEn: '🔥 Flash Lunch Hour Special Deal',
    bodyEn: 'Save 20% on all lunch combos between 1 PM and 4 PM today.',
  },
  {
    id: 't6',
    titleAr: '💖 نشتاق لزيارتك لمتجرنا!',
    bodyAr: 'مرت فترة منذ آخر زيارة لك! لدينا منتجات جديدة ومكافآت بانتظارك.',
    titleEn: '💖 We Miss Seeing You Here!',
    bodyEn: 'It has been a while! Come check out our latest items and rewards.',
  },
  {
    id: 't7',
    titleAr: '✨ وصول تشكيلتنا الجديدة حصرياً',
    bodyAr: 'تصفح أحدث المنتجات واكسب 3 أضعاف النقاط عند شرائك اليوم.',
    titleEn: '✨ Exclusive New Arrival Preview',
    bodyEn: 'Be the first to explore new arrivals and earn 3x points on your visit.',
  },
];

export const NotificationComposerModal: React.FC<NotificationComposerModalProps> = ({ onClose }) => {
  const { lang, customers, loyaltyCards, sendPushNotification, campaigns, storeProfile } = useStore();

  const [activeTab, setActiveTab] = useState<'composer' | 'inbox'>('composer');
  const [step, setStep] = useState<number>(1);
  const [audience, setAudience] = useState<'all' | 'inactive' | 'card'>('all');
  const [selectedCardId, setSelectedCardId] = useState<string>(loyaltyCards[0]?.id || 'all');
  const [title, setTitle] = useState<string>(TEMPLATES[0].titleAr);
  const [body, setBody] = useState<string>(TEMPLATES[0].bodyAr);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  // Apply template selection
  const handleSelectTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(lang === 'ar' ? tmpl.titleAr : tmpl.titleEn);
    setBody(lang === 'ar' ? tmpl.bodyAr : tmpl.bodyEn);
  };

  const calculateTargetCount = () => {
    if (audience === 'all') return customers.length;
    if (audience === 'inactive') return Math.max(1, Math.floor(customers.length * 0.4));
    return customers.filter((c) => c.cardId === selectedCardId).length || customers.length;
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    sendPushNotification(title, body, selectedCardId);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl border border-[#E2E8F0] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E293B] text-white flex items-center justify-center shadow-sm shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">
                {lang === 'ar' ? 'مركز بث إشعارات المحافظ الذكية (Push Campaigns)' : 'Wallet Push Campaign Composer'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#64748B]">
                {lang === 'ar'
                  ? 'بث فوري على شاشات قفل Apple Wallet و Google Wallet لعملائك'
                  : 'Live lockscreen notifications directly to customer Apple/Google Wallets'}
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

        {/* Tabs */}
        <div className="flex border-b border-[#E2E8F0] bg-white px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('composer')}
            className={`py-2.5 px-5 font-bold text-xs rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'composer'
                ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? '🚀 إنشاء بث إشعار جديد' : '🚀 Create Push Campaign'}</span>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2.5 px-5 font-bold text-xs rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'inbox'
                ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? `📋 أرشيف الحملات المرسلة (${campaigns.length})` : `📋 Campaign Archives (${campaigns.length})`}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'inbox' ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h4 className="font-bold text-sm text-[#1E293B]">
                {lang === 'ar' ? 'أرشيف حملات الإشعارات التي تم بثها للعملاء' : 'Broadcast Push Campaigns History'}
              </h4>

              {campaigns.length === 0 ? (
                <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-300">
                  <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">
                    {lang === 'ar' ? 'لم تقم بإرسال حملات إشعارات جماعية سابقة.' : 'No push campaigns sent yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1E293B]">{camp.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ {lang === 'ar' ? `تم البث لـ ${camp.recipientsCount} عميل` : `Sent to ${camp.recipientsCount}`}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">{camp.message}</p>
                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200">
                        {lang === 'ar' ? `وقت الإرسال: ${camp.sentAt}` : `Sent at: ${camp.sentAt}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === 1 ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    1
                  </span>
                  <span className={`text-xs font-bold ${step === 1 ? 'text-[#0D9488]' : 'text-slate-500'}`}>
                    {lang === 'ar' ? 'الجمهور المستهدف' : 'Target Audience'}
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === 2 ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    2
                  </span>
                  <span className={`text-xs font-bold ${step === 2 ? 'text-[#0D9488]' : 'text-slate-500'}`}>
                    {lang === 'ar' ? 'القوالب والمحتوى' : 'Content & Templates'}
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === 3 ? 'bg-[#0D9488] text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    3
                  </span>
                  <span className={`text-xs font-bold ${step === 3 ? 'text-[#0D9488]' : 'text-slate-500'}`}>
                    {lang === 'ar' ? 'المعاينة والإرسال' : 'Preview & Broadcast'}
                  </span>
                </div>
              </div>

              {/* STEP 1: AUDIENCE TARGETING */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="font-bold text-sm text-[#1E293B]">
                    {lang === 'ar' ? 'الخطوة 1: حدد شريحة العملاء المستهدفة في هذه الحملة' : 'Step 1: Select Target Audience Segment'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      onClick={() => setAudience('all')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        audience === 'all'
                          ? 'border-[#0D9488] bg-[#F0FDFA]'
                          : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className={`w-5 h-5 ${audience === 'all' ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                        <input type="radio" checked={audience === 'all'} readOnly className="text-[#0D9488]" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                        {lang === 'ar' ? 'جميع عملاء المحفظة' : 'All Enrolled Customers'}
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-1 block font-semibold">
                        {lang === 'ar' ? `العدد المستهدف: ${customers.length} عميل` : `Target count: ${customers.length} users`}
                      </span>
                    </label>

                    <label
                      onClick={() => setAudience('inactive')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        audience === 'inactive'
                          ? 'border-[#0D9488] bg-[#F0FDFA]'
                          : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Clock className={`w-5 h-5 ${audience === 'inactive' ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                        <input type="radio" checked={audience === 'inactive'} readOnly className="text-[#0D9488]" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                        {lang === 'ar' ? 'العملاء غير النشطين (+30 يوم)' : 'Inactive Lookback (>30 days)'}
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-1 block font-semibold">
                        {lang === 'ar' ? `استرجاع العملاء الغائبين (${Math.max(1, Math.floor(customers.length * 0.4))} عميل)` : `Re-engage dormant users`}
                      </span>
                    </label>

                    <label
                      onClick={() => setAudience('card')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        audience === 'card'
                          ? 'border-[#0D9488] bg-[#F0FDFA]'
                          : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Layers className={`w-5 h-5 ${audience === 'card' ? 'text-[#0D9488]' : 'text-slate-400'}`} />
                        <input type="radio" checked={audience === 'card'} readOnly className="text-[#0D9488]" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                        {lang === 'ar' ? 'حاملو بطاقة ولاء محددة' : 'Specific Pass Holders'}
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-1 block font-semibold">
                        {lang === 'ar' ? 'تخصيص العرض لبطاقة معينة' : 'Filter by specific card'}
                      </span>
                    </label>
                  </div>

                  {audience === 'card' && (
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                      <label className="text-xs font-semibold text-[#1E293B] block">
                        {lang === 'ar' ? 'اختر بطاقة الولاء المستهدفة بالبث:' : 'Select Target Pass:'}
                      </label>
                      <select
                        value={selectedCardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold bg-white outline-none"
                      >
                        {loyaltyCards.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: TEMPLATES & CONTENT */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h4 className="font-bold text-sm text-[#1E293B] mb-1">
                      {lang === 'ar' ? 'الخطوة 2: اختر قالباً جاهزاً أو اكتب رسالتك المخصصة' : 'Step 2: Choose Ready Template or Custom Message'}
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      {lang === 'ar' ? '7 قوالب احترافية مجربة لتحقيق أعلى معدل تفاعل وزيارات للمتجر' : '7 high-converting bilingual marketing templates'}
                    </p>
                  </div>

                  {/* 7 Ready Templates Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {TEMPLATES.map((tmpl) => {
                      const isSelected = title === (lang === 'ar' ? tmpl.titleAr : tmpl.titleEn);
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => handleSelectTemplate(tmpl)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#0D9488] bg-[#F0FDFA]'
                              : 'border-[#E2E8F0] hover:border-slate-300 bg-[#F8FAFC]'
                          }`}
                        >
                          <span className="font-bold text-xs text-[#1E293B] block mb-1">
                            {lang === 'ar' ? tmpl.titleAr : tmpl.titleEn}
                          </span>
                          <span className="text-[11px] text-[#64748B] line-clamp-2">
                            {lang === 'ar' ? tmpl.bodyAr : tmpl.bodyEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Input Editors */}
                  <div className="space-y-3 pt-3 border-t border-[#E2E8F0]">
                    <div>
                      <label className="text-xs font-semibold text-[#1E293B] block mb-1">
                        {lang === 'ar' ? 'عنوان الإشعار في شاشة القفل' : 'Lockscreen Push Title'}
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold outline-none focus:ring-2 focus:ring-[#0D9488]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#1E293B] block mb-1">
                        {lang === 'ar' ? 'نص الرسالة المباشرة' : 'Message Body'}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:ring-2 focus:ring-[#0D9488]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PREVIEW & BROADCAST */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="text-center">
                    <h4 className="font-bold text-sm text-[#1E293B]">
                      {lang === 'ar' ? 'الخطوة 3: معاينة شكل الإشعار على جوال العميل وإرسال البث' : 'Step 3: Lockscreen Preview & Confirm Broadcast'}
                    </h4>
                    <p className="text-xs text-[#64748B]">
                      {lang === 'ar'
                        ? `سيصل هذا التنبيه فوراً إلى شاشات قفل ${calculateTargetCount()} عميل عبر Apple & Google Wallet`
                        : `Will immediately alert ${calculateTargetCount()} lockscreens via official wallet API`}
                    </p>
                  </div>

                  {/* Lockscreen Simulation Container Replicating iPhone Style */}
                  <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>9:41 AM</span>
                      <span>🔒 Lock Screen</span>
                    </div>

                    {/* Apple Wallet Notification Bubble */}
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-[#0D9488] flex items-center justify-center text-[10px] font-black">
                            ★
                          </div>
                          <span className="font-bold text-xs tracking-tight text-white/90">
                            {storeProfile.name || 'متجرنا'} &bull; Apple Wallet
                          </span>
                        </div>
                        <span className="text-[10px] text-white/60">{lang === 'ar' ? 'الآن' : 'now'}</span>
                      </div>
                      <div>
                        <h5 className="font-black text-xs sm:text-sm text-white leading-tight">{title}</h5>
                        <p className="text-xs text-white/80 mt-1 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rate Limit Footnote Replicating Section L */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                      {lang === 'ar'
                        ? 'ملاحظة هامة لحماية حسابك: يحق للمنشأة إرسال حتى 10 حملات إشعار جماعية في الساعة لتجنب إزعاج العملاء وحفاظاً على معايير الجودة في محافظ Apple & Google الرسمية.'
                        : 'Rate Limit Footnote: Organizations are allotted up to 10 broadcast notifications per hour to preserve customer trust and comply with wallet standards.'}
                    </p>
                  </div>

                  {sentSuccess ? (
                    <div className="p-4 rounded-2xl bg-[#DCFCE7] text-[#16A34A] text-sm font-bold text-center flex items-center justify-center gap-2 border border-[#16A34A]/20 shadow-sm">
                      <Check className="w-5 h-5" />
                      <span>{lang === 'ar' ? `تم بث الإشعار لجميع العملاء المستهدفين بنجاح! 🚀` : `Successfully broadcasted campaign! 🚀`}</span>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        onClick={handleBroadcast}
                        className="w-full py-3.5 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
                      >
                        <Send className="w-5 h-5" />
                        <span>
                          {lang === 'ar' ? `تأكيد وبث الإشعار الآن (${calculateTargetCount()} عميل) 🚀` : `Confirm & Broadcast Now (${calculateTargetCount()} users) 🚀`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {activeTab === 'composer' && !sentSuccess && (
          <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
              >
                {lang === 'ar' ? '→ الخطوة السابقة' : '← Back'}
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
              >
                {lang === 'ar' ? 'الخطوة التالية ←' : 'Next Step →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
