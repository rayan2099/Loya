import React, { useState } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  Gift,
  PlusCircle,
  Search,
  Sparkles,
  History,
  Award,
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

  const activeCard = loyaltyCards.find((c) => c.id === selectedCustomer?.cardId) || loyaltyCards[0];
  const isStampCard = activeCard?.ruleType === 'stamp_buy_5';

  const filteredCustomers = customers.filter(
    (c) => c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  );

  const handleQuickAdd = (amount: number) => {
    if (!selectedCustomer) return;
    addPointsToCustomer(selectedCustomer.id, amount);
    setSuccessMsg(
      lang === 'ar'
        ? `تم إضافة ${amount} ${isStampCard ? 'طابع ختمي' : 'نقطة'} لـ ${selectedCustomer.name} بنجاح!`
        : `Successfully added ${amount} points!`
    );
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !customPoints || Number(customPoints) <= 0) return;
    addPointsToCustomer(selectedCustomer.id, Number(customPoints));
    setSuccessMsg(`تم إضافة ${customPoints} بنجاح!`);
    setCustomPoints('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleRedeem = (rewardId: string, cost: number, title: string) => {
    if (!selectedCustomer) return;
    const ok = redeemCustomerReward(selectedCustomer.id, rewardId, cost, title);
    if (ok) {
      setSuccessMsg(`🎉 تم صرف المكافأة: "${title}" للعميل!`);
    } else {
      setSuccessMsg(`⚠️ رصيد العميل غير كافٍ لصرف هذه المكافأة.`);
    }
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-xl border border-[#E2E8F0] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#F8FAFC] text-[#1E293B] rounded-t-2xl flex items-center justify-between sticky top-0 z-20 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center border border-[#0D9488]/20">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2 text-[#1E293B]">
                <span>{lang === 'ar' ? 'نقطة مسح الكاشير (POS Scanner)' : 'POS Instant Scanner'}</span>
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
              </h3>
              <p className="text-xs text-[#64748B]">
                {lang === 'ar' ? 'امسح الباركود أو ابحث برقم جوال العميل' : 'Scan barcode or search customer phone'}
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

        <div className="p-5 space-y-5">
          {/* Simulated Scanner Viewport or Search */}
          <div className="space-y-3">
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
            <div className="bg-gradient-to-br from-[#1E293B] to-gray-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-gray-800">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full inline-block">
                      ⚡ تم المسح بنجاح!
                    </span>
                    <h4 className="font-extrabold text-lg text-white mt-1">{selectedCustomer.name}</h4>
                    <span className="text-xs text-gray-400 font-mono block" dir="ltr">
                      {selectedCustomer.phone}
                    </span>
                  </div>
                </div>

                <div className="text-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-gray-300 uppercase font-bold block">
                    {isStampCard ? 'الطوابع' : 'الرصيد'}
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {isStampCard
                      ? `${selectedCustomer.stampsBalance || 0} / ${activeCard?.stampTarget || 5}`
                      : `${selectedCustomer.pointsBalance}`}
                  </span>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveAction('add')}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeAction === 'add'
                      ? 'bg-[#0D9488] text-white shadow-sm'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isStampCard ? 'إضافة طابع ختمي' : 'إضافة نقاط'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveAction('redeem')}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    activeAction === 'redeem'
                      ? 'bg-[#1E293B] text-white shadow-sm'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>صرف مكافأة</span>
                </button>
              </div>
            </div>
          )}

          {/* Success Notification Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#0D9488]/20 text-[#0F766E] text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Sparkles className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Active Action Panel */}
          {selectedCustomer && (
            <div>
              {activeAction === 'add' ? (
                <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-4">
                  <span className="text-xs font-bold text-[#1E293B] block">
                    {lang === 'ar' ? 'إضافة سريعة بزر واحد (Quick Add):' : 'Quick Add Buttons:'}
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    {(activeCard?.quickAddButtons || [10, 25, 50]).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleQuickAdd(num)}
                        className="py-3.5 rounded-xl bg-white hover:bg-[#0D9488] hover:text-white border border-[#E2E8F0] font-bold text-base text-[#1E293B] transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center"
                      >
                        <span>+{num}</span>
                        <span className="text-[10px] font-normal opacity-70">
                          {isStampCard ? 'طابع' : 'نقطة'}
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
                <div className="bg-purple-50/60 rounded-3xl p-5 border border-purple-100 space-y-3">
                  <span className="text-xs font-bold text-gray-800 block">
                    {lang === 'ar' ? 'اختر المكافأة ليتم صرفها للعميل فوراً:' : 'Available Rewards:'}
                  </span>

                  <div className="space-y-2.5">
                    {activeCard?.rewards.map((rew) => {
                      const canAfford =
                        (isStampCard ? selectedCustomer.stampsBalance || 0 : selectedCustomer.pointsBalance) >=
                        rew.pointsCost;

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
                            disabled={!canAfford}
                            onClick={() => handleRedeem(rew.id, rew.pointsCost, rew.title)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              canAfford
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? (lang === 'ar' ? 'صرف المكافأة' : 'Redeem Reward') : (lang === 'ar' ? 'رصيد غير كافٍ' : 'Insufficient Balance')}
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
            className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800"
          >
            {lang === 'ar' ? 'إغلاق الماسح' : 'Close Scanner'}
          </button>
        </div>
      </div>
    </div>
  );
};
