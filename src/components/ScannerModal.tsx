import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import {
  X,
  QrCode,
  CheckCircle2,
  Gift,
  PlusCircle,
  Search,
  Sparkles,
  History,
  Lock,
  Camera,
  CameraOff,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';

interface ScannerModalProps {
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ onClose }) => {
  const { customers, loyaltyCards, addPointsToCustomer, redeemCustomerReward, lang } = useStore();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customPoints, setCustomPoints] = useState<number | ''>('');
  const [activeAction, setActiveAction] = useState<'add' | 'redeem'>('add');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');
  const [cashierPin, setCashierPin] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<string>(
    lang === 'ar' ? 'اضغط تشغيل الكاميرا لمسح بطاقة العميل' : 'Start camera to scan customer pass'
  );
  const [lastScannedCode, setLastScannedCode] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const lastHandledCodeRef = useRef('');

  const activeCard = loyaltyCards.find((c) => c.id === selectedCustomer?.cardId) || loyaltyCards[0];
  const isStampCard = activeCard?.ruleType === 'stamp_buy_5';

  const filteredCustomers = customers.filter(
    (c) => c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string, timeout = 3000) => {
    setNoticeType(type);
    setSuccessMsg(message);
    window.setTimeout(() => setSuccessMsg(null), timeout);
  };

  const normalizePhone = (value: string) => value.replace(/[^\d+]/g, '').replace(/^966/, '0');

  const findCustomerFromQr = (rawValue: string) => {
    const decoded = rawValue.trim();
    const candidates = new Set<string>([decoded]);

    try {
      const url = new URL(decoded);
      ['customerId', 'customer_id', 'id', 'phone', 'p'].forEach((key) => {
        const value = url.searchParams.get(key);
        if (value) candidates.add(value);
      });
      url.pathname
        .split('/')
        .filter(Boolean)
        .forEach((part) => candidates.add(decodeURIComponent(part)));
    } catch {
      decoded
        .split(/[\s|,;:/?=&]+/)
        .filter(Boolean)
        .forEach((part) => candidates.add(part));
    }

    const normalizedCandidates = Array.from(candidates).map((value) => ({
      raw: value,
      phone: normalizePhone(value),
    }));

    return customers.find((customer) =>
      normalizedCandidates.some(
        (candidate) =>
          candidate.raw === customer.id ||
          candidate.raw === customer.phone ||
          candidate.phone === normalizePhone(customer.phone)
      )
    );
  };

  const handleScannedCode = (rawValue: string) => {
    if (!rawValue || rawValue === lastHandledCodeRef.current) return;
    lastHandledCodeRef.current = rawValue;
    setLastScannedCode(rawValue);

    const matchedCustomer = findCustomerFromQr(rawValue);
    if (matchedCustomer) {
      setSelectedCustomer(matchedCustomer);
      setSearchQuery('');
      showNotice(
        'success',
        lang === 'ar'
          ? `تم مسح البطاقة والتعرف على ${matchedCustomer.name}`
          : `Pass scanned. ${matchedCustomer.name} selected.`
      );
      stopCamera();
      return;
    }

    showNotice(
      'error',
      lang === 'ar'
        ? 'تمت قراءة QR، لكن لم يتم العثور على عميل مطابق. جرّب البحث بالرقم.'
        : 'QR was read, but no matching customer was found. Try searching by phone.'
    );
    setScannerStatus(lang === 'ar' ? 'لم يتم العثور على عميل مطابق لهذا الكود' : 'No customer matched this code');
  };

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      qrScannerRef.current?.destroy();
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScannedCode(result.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          onDecodeError: () => {},
        }
      );
      await qrScannerRef.current.start();
      lastHandledCodeRef.current = '';
      setIsCameraActive(true);
      setScannerStatus(lang === 'ar' ? 'وجّه الكاميرا نحو QR بطاقة العميل' : 'Point the camera at the customer pass QR');
    } catch {
      showNotice(
        'error',
        lang === 'ar'
          ? 'لم نتمكن من تشغيل الكاميرا. تأكد من السماح للمتصفح باستخدام الكاميرا.'
          : 'Could not start camera. Allow camera access in your browser settings.',
        4500
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    qrScannerRef.current?.stop();
    qrScannerRef.current?.destroy();
    qrScannerRef.current = null;
    setIsCameraActive(false);
    setScannerStatus(lang === 'ar' ? 'تم إيقاف الكاميرا' : 'Camera stopped');
  };

  const handleQuickAdd = (amount: number) => {
    if (!selectedCustomer) return;
    const result = addPointsToCustomer(selectedCustomer.id, amount);
    showNotice(
      result.success ? 'success' : 'error',
      result.success
        ? lang === 'ar'
          ? `تم إضافة ${amount} ${isStampCard ? 'طابع ختمي' : 'نقطة'} لـ ${selectedCustomer.name} بنجاح!`
          : `Successfully added ${amount} points!`
        : result.error || (lang === 'ar' ? 'تعذر إضافة الرصيد.' : 'Unable to add balance.')
    );
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !customPoints || Number(customPoints) <= 0) return;
    const result = addPointsToCustomer(selectedCustomer.id, Number(customPoints));
    showNotice(
      result.success ? 'success' : 'error',
      result.success
        ? lang === 'ar'
          ? `تم إضافة ${customPoints} بنجاح!`
          : `Added ${customPoints} successfully!`
        : result.error || (lang === 'ar' ? 'تعذر إضافة الرصيد.' : 'Unable to add balance.')
    );
    if (result.success) setCustomPoints('');
  };

  const handleRedeem = (rewardId: string, cost: number, title: string) => {
    if (!selectedCustomer) return;
    const result = redeemCustomerReward(selectedCustomer.id, rewardId, cost, title, cashierPin);
    if (result.success) {
      showNotice('success', `🎉 تم صرف المكافأة: "${title}" للعميل!`, 3500);
      setCashierPin('');
    } else {
      showNotice('error', result.error || `⚠️ رصيد العميل غير كافٍ لصرف هذه المكافأة.`, 3500);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel w-full max-w-lg max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white/80 text-[#263241] flex items-center justify-between sticky top-0 z-20 border-b border-[#EEF0F2] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center border border-[#0D9488]/20">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2 text-[#263241]">
                <span>{lang === 'ar' ? 'ماسح الكاشير المباشر' : 'Live Cashier Scanner'}</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              </h3>
              <p className="text-xs text-[#71717A]">
                {lang === 'ar' ? 'امسح الباركود أو ابحث برقم جوال العميل' : 'Scan barcode or search customer phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#F4F5F7] hover:bg-[#ECEFF3] text-[#64748B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Simulated Scanner Viewport or Search */}
          <div className="space-y-3">
            <div className="rounded-lg border border-[#EEF0F2] bg-[#FAFBFC] p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[#263241]">
                    {lang === 'ar' ? 'مسح QR بطاقة العميل بالكاميرا' : 'Scan customer QR with camera'}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{scannerStatus}</p>
                </div>
                <button
                  type="button"
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                    isCameraActive
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-gradient-to-br from-[#12A594] to-[#0B8A7D] text-white hover:brightness-105'
                  }`}
                >
                  {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                  <span>{isCameraActive ? (lang === 'ar' ? 'إيقاف' : 'Stop') : (lang === 'ar' ? 'تشغيل' : 'Start')}</span>
                </button>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#0F766E] aspect-video border border-white/30">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`h-full w-full object-cover transition-opacity ${isCameraActive ? 'opacity-100' : 'opacity-30'}`}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-3xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(15,23,42,0.35)]" />
                </div>
                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                    <QrCode className="w-10 h-10 mb-2 opacity-90" />
                    <span className="text-xs font-bold">
                      {lang === 'ar' ? 'الكاميرا جاهزة لمسح QR العميل' : 'Camera-ready customer QR scanner'}
                    </span>
                  </div>
                )}
              </div>

              {lastScannedCode && (
                <div className="rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-[10px] text-[#64748B]">
                  <span className="font-bold text-[#1E293B]">{lang === 'ar' ? 'آخر كود تمت قراءته:' : 'Last scanned code:'}</span>{' '}
                  <span dir="ltr" className="font-mono break-all">{lastScannedCode}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-[#64748B]" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث برقم الجوال (05...) أو اسم العميل للمسح الفوري' : 'Search phone or name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs focus:ring-2 focus:ring-[#0D9488] outline-none font-medium text-[#1E293B]"
              />
            </div>

            {searchQuery && (
              <div className="bg-[#F8FAFC] rounded-xl p-2 max-h-36 overflow-y-auto divide-y divide-[#E2E8F0] border border-[#E2E8F0]">
                {filteredCustomers.length === 0 ? (
                  <div className="p-2 text-center text-xs text-[#64748B]">لم يتم العثور على عميل بهذا الرقم</div>
                ) : (
                  filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setSearchQuery('');
                      }}
                      className="w-full p-2.5 flex items-center justify-between hover:bg-white rounded-lg transition-colors text-right"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#1E293B]">{cust.name}</div>
                        <div className="text-[10px] text-[#64748B] font-mono" dir="ltr">
                          {cust.phone}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#F0FDFA] text-[#0D9488] rounded-full text-xs font-bold border border-[#0D9488]/20">
                        {cust.pointsBalance} {cust.stampsBalance !== undefined ? 'طوابع' : 'نقطة'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Scanned Customer Card Banner */}
          {selectedCustomer && (
            <div className="rounded-2xl p-5 relative overflow-hidden border border-[#D8F3EC] bg-gradient-to-br from-[#F5FFFC] to-[#EEF5FF] shadow-[0_20px_52px_-42px_rgba(38,50,65,0.55)]">

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#DDF8F1] text-[#0D9488] font-bold text-xl flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-white/80 text-[#0D9488] font-bold px-2 py-0.5 rounded-full inline-block border border-[#D8F3EC]">
                      {lang === 'ar' ? 'تم التعرف على العميل' : 'Customer verified'}
                    </span>
                    <h4 className="font-bold text-lg text-[#263241] mt-1">{selectedCustomer.name}</h4>
                    <span className="text-xs text-[#71717A] font-mono block" dir="ltr">
                      {selectedCustomer.phone}
                    </span>
                  </div>
                </div>

                <div className="text-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block">
                    {isStampCard ? 'الطوابع' : 'الرصيد'}
                  </span>
                  <span className="text-2xl font-bold text-[#0D9488]">
                    {isStampCard
                      ? `${selectedCustomer.stampsBalance || 0} / ${activeCard?.stampTarget || 5}`
                      : `${selectedCustomer.pointsBalance}`}
                  </span>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white">
                <button
                  type="button"
                  onClick={() => setActiveAction('add')}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeAction === 'add'
                      ? 'bg-[#0D9488] text-white shadow-sm'
                      : 'bg-white/70 text-[#536273] hover:bg-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isStampCard ? (lang === 'ar' ? 'إضافة طابع ختمي' : 'Add Stamp') : (lang === 'ar' ? 'إضافة نقاط' : 'Add Points')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('redeem')}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeAction === 'redeem'
                      ? 'bg-[#EEF5FF] text-[#2563EB] shadow-sm'
                      : 'bg-white/70 text-[#536273] hover:bg-white'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'صرف مكافأة' : 'Redeem Reward'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Notification Banner */}
          {successMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
                noticeType === 'success'
                  ? 'bg-[#F0FDFA] border-[#0D9488]/20 text-[#0F766E]'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 ${noticeType === 'success' ? 'text-[#0D9488]' : 'text-red-600'}`} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Active Action Panel */}
          {selectedCustomer && (
            <div>
              {activeAction === 'add' ? (
                <div className="bg-[#FAFBFC] rounded-2xl p-5 border border-[#EEF0F2] space-y-4">
                  <span className="text-xs font-bold text-[#263241] block">
                    {lang === 'ar' ? 'إضافة سريعة بزر واحد (Quick Add):' : 'Quick Add Buttons:'}
                  </span>
                  <div className="rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-[11px] font-semibold text-[#64748B]">
                    {lang === 'ar'
                      ? `سيتم تسجيل العملية باسم الكاشير وإضافتها فوراً إلى رصيد ${selectedCustomer.name}.`
                      : `This action is logged to the cashier session and updates ${selectedCustomer.name}'s balance instantly.`}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {(activeCard?.quickAddButtons || [10, 25, 50]).map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => handleQuickAdd(num)}
                        className="py-3.5 rounded-xl bg-white hover:bg-[#ECFDF9] hover:text-[#0D9488] border border-[#EEF0F2] font-bold text-base text-[#263241] transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center"
                      >
                        <span>+{num}</span>
                        <span className="text-[10px] font-normal opacity-70">
                          {isStampCard ? (lang === 'ar' ? 'طابع' : 'stamp') : (lang === 'ar' ? 'نقطة' : 'points')}
                        </span>
                      </button>
                    ))}
                  </div>

                      {!isStampCard && (
                    <form onSubmit={handleCustomAdd} className="pt-2 flex gap-2">
                      <input
                        type="number"
                        min={1}
                        placeholder={lang === 'ar' ? 'مبلغ الفاتورة بالريال...' : 'Enter SAR amount...'}
                        value={customPoints}
                        onChange={(e) => setCustomPoints(e.target.value ? Number(e.target.value) : '')}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold outline-none focus:ring-2 focus:ring-[#0D9488] text-[#1E293B]"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#0D9488] text-white font-bold text-xs hover:bg-[#0F766E] shadow-sm"
                      >
                        {lang === 'ar' ? 'إضافة مخصصة' : 'Custom Add'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* REDEEM REWARD VIEW */
                <div className="bg-[#F8F5FF] rounded-2xl p-5 border border-[#EDE9FE] space-y-3">
                  <span className="text-xs font-bold text-[#3F3A56] block">
                    {lang === 'ar' ? 'اختر المكافأة ليتم صرفها للعميل فوراً:' : 'Available Rewards:'}
                  </span>

                  {activeCard?.security?.cashierPinEnabled && (
                    <div className="rounded-2xl bg-white border border-purple-100 p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">
                          {lang === 'ar' ? 'رمز الكاشير مطلوب قبل الصرف' : 'Cashier PIN required before redemption'}
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          value={cashierPin}
                          onChange={(e) => setCashierPin(e.target.value)}
                          placeholder={lang === 'ar' ? 'أدخل رمز الصرف' : 'Enter redemption PIN'}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {activeCard?.rewards.map((rew) => {
                      const canAfford =
                        (isStampCard ? selectedCustomer.stampsBalance || 0 : selectedCustomer.pointsBalance) >=
                        rew.pointsCost;
                      const needsPin = Boolean(activeCard?.security?.cashierPinEnabled && cashierPin.trim().length === 0);

                      return (
                        <div
                          key={rew.id}
                          className={`p-3.5 rounded-2xl bg-white border transition-all flex items-center justify-between ${
                            canAfford ? 'border-purple-200 shadow-sm' : 'border-gray-100 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                              {rew.icon}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-gray-900">{rew.title}</h5>
                              <span className="text-[10px] text-purple-700 font-bold">
                                {lang === 'ar' ? `التكلفة: ${rew.pointsCost} ${isStampCard ? 'طوابع' : 'نقطة'}` : `Cost: ${rew.pointsCost} ${isStampCard ? 'stamps' : 'pts'}`}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!canAfford || needsPin}
                            onClick={() => handleRedeem(rew.id, rew.pointsCost, rew.title)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              canAfford && !needsPin
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {!canAfford
                              ? lang === 'ar'
                                ? 'رصيد غير كافٍ'
                                : 'Insufficient Balance'
                              : needsPin
                              ? lang === 'ar'
                                ? 'أدخل الرمز'
                                : 'Enter PIN'
                              : lang === 'ar'
                              ? 'صرف المكافأة'
                              : 'Redeem Reward'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visit History Log */}
          {selectedCustomer && (
            <div className="pt-2">
              <h5 className="font-bold text-xs text-gray-700 flex items-center gap-1.5 mb-2">
                <History className="w-4 h-4 text-gray-400" />
                <span>{lang === 'ar' ? 'سجل زيارات العميل السابقة:' : 'Customer Visit History:'}</span>
              </h5>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-600">{lang === 'ar' ? 'إجمالي الزيارات:' : 'Total Visits:'} <strong className="text-gray-900">{selectedCustomer.visits} {lang === 'ar' ? 'زيارة' : 'visits'}</strong></span>
                <span className="text-gray-600">{lang === 'ar' ? 'آخر زيارة:' : 'Last Visit:'} <strong className="text-gray-900">{selectedCustomer.lastVisit}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#F4F5F7] text-[#536273] font-bold text-xs hover:bg-[#ECEFF3]"
          >
            {lang === 'ar' ? 'إغلاق الماسح' : 'Close Scanner'}
          </button>
        </div>
      </div>
    </div>
  );
};
