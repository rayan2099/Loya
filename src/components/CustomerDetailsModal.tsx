import React, { useState } from 'react';
import { X, QrCode, Plus, Minus, Award, Calendar, Smartphone, Clock, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { Customer, LoyaltyCard, Transaction } from '../types';
import { useStore } from '../context/StoreContext';

interface CustomerDetailsModalProps {
  customer: Customer;
  card?: LoyaltyCard;
  onClose: () => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ customer, card, onClose }) => {
  const { lang, addPointsToCustomer, transactions } = useStore();
  
  const isStamp = customer.stampsBalance !== undefined;
  const [mode, setMode] = useState<'add' | 'deduct'>('add');
  const [amount, setAmount] = useState<number>(isStamp ? 1 : 10);
  const [note, setNote] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const customerTransactions = transactions.filter((t) => t.customerId === customer.id);

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const adjustment = mode === 'add' ? amount : -amount;
    const actionNote = note.trim() || (mode === 'add'
      ? (lang === 'ar' ? `إضافة يدوية من الإدارة (${amount})` : `Manual Addition (+${amount})`)
      : (lang === 'ar' ? `تعديل/خصم يدوي من الإدارة (${amount})` : `Manual Deduction (-${amount})`));

    const result = addPointsToCustomer(customer.id, adjustment, actionNote);
    if (result.success) {
      setShowSuccess(true);
      setErrorMsg(null);
      setNote('');
      setTimeout(() => setShowSuccess(false), 2500);
    } else {
      setErrorMsg(result.error || (lang === 'ar' ? 'تعذر حفظ التعديل.' : 'Could not save adjustment.'));
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl border border-[#E2E8F0] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black shadow-sm shrink-0 text-xl"
              style={{ backgroundColor: card?.color || '#0D9488' }}
            >
              {customer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">{customer.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                  ID: #{customer.id.slice(-4)}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#64748B] font-mono mt-0.5" dir="ltr">
                {customer.phone} &bull; {lang === 'ar' ? `بطاقة: ${card?.name || 'الولاء'}` : `Pass: ${card?.name || 'Loyalty'}`}
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section K1: Gradient Stat Card Replicating Apple Wallet Look */}
          <div
            className="p-5 sm:p-6 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: card?.color
                ? `linear-gradient(135deg, ${card.color}, #1E293B)`
                : 'linear-gradient(135deg, #0D9488, #1E293B)',
            }}
          >
            <div className="space-y-3 w-full sm:w-auto text-center sm:text-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>
                  {customer.walletStatus === 'apple'
                    ? ' Apple Wallet Pass Active'
                    : customer.walletStatus === 'google'
                    ? '💳 Google Wallet Pass Active'
                    : ' & 💳 Apple + Google Pass Active'}
                </span>
              </span>

              <div>
                <span className="text-xs text-white/80 block uppercase tracking-wider font-semibold">
                  {isStamp ? (lang === 'ar' ? 'رصيد الأختام الحالي' : 'Current Stamps Balance') : (lang === 'ar' ? 'رصيد النقاط الحالي' : 'Current Points Balance')}
                </span>
                <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">
                    {isStamp ? customer.stampsBalance : customer.pointsBalance}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white/90">
                    {isStamp ? (lang === 'ar' ? 'طابع / أختام ☕' : 'stamps') : (lang === 'ar' ? 'نقطة ⭐' : 'pts')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-white/80 pt-1 border-t border-white/20">
                <span>{lang === 'ar' ? `إجمالي الزيارات: ${customer.visits}` : `Total visits: ${customer.visits}`}</span>
                <span>&bull;</span>
                <span>{lang === 'ar' ? `آخر زيارة: ${customer.lastVisit}` : `Last visit: ${customer.lastVisit}`}</span>
              </div>
            </div>

            {/* Personal QR Code Simulation */}
            <div className="bg-white p-3 rounded-2xl shadow-md shrink-0 text-center space-y-1">
              <QrCode className="w-24 h-24 text-slate-900 mx-auto" />
              <span className="text-[9px] font-bold text-slate-600 block tracking-tight uppercase">
                {lang === 'ar' ? 'باركود العميل المباشر' : 'MEMBER BARCODE'}
              </span>
            </div>
          </div>

          {/* Section K2: Manual Add / Deduct Points Action Box */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#0D9488]" />
                <span>{lang === 'ar' ? 'تعديل رصيد النقاط / الأختام يدوياً' : 'Manual Points / Stamps Adjustment'}</span>
              </h4>
              <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode('add')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    mode === 'add' ? 'bg-[#0D9488] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إضافة رصيد' : 'Add Points'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('deduct')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    mode === 'deduct' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'خصم رصيد' : 'Deduct Points'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1E293B] block mb-1">
                    {isStamp ? (lang === 'ar' ? 'عدد الأختام' : 'Stamps Amount') : (lang === 'ar' ? 'عدد النقاط' : 'Points Amount')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold bg-white focus:ring-2 focus:ring-[#0D9488] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1E293B] block mb-1">
                    {lang === 'ar' ? 'ملاحظة أو سبب التعديل (اختياري)' : 'Adjustment Note (Optional)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={
                        mode === 'add'
                          ? (lang === 'ar' ? 'مثال: تعويض عن مشتريات سابقة' : 'e.g., Compensation bonus')
                          : (lang === 'ar' ? 'مثال: تصحيح خطأ تسجيل' : 'e.g., Ledger correction')
                      }
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs bg-white focus:ring-2 focus:ring-[#0D9488] outline-none"
                    />
                    <button
                      type="submit"
                      className={`px-5 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-95 transition-all ${
                        mode === 'add' ? 'bg-[#0D9488] hover:bg-[#0F766E]' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {mode === 'add' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      <span>{mode === 'add' ? (lang === 'ar' ? 'تأكيد الإضافة' : 'Confirm Add') : (lang === 'ar' ? 'تأكيد الخصم' : 'Confirm Deduct')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {showSuccess && (
                <div className="p-2.5 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تم تحديث رصيد العميل وتسجيل العملية بنجاح!' : 'Customer ledger updated and action logged successfully!'}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* Section K3: Chronological Points Transaction Ledger */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
              <History className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'ar' ? 'سجل الحركات التاريخي للمحفظة' : 'Chronological Transaction Ledger'}</span>
            </h4>

            {customerTransactions.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-300">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">
                  {lang === 'ar' ? 'لا توجد حركات سابقة مسجلة لهذا العميل حتى الآن' : 'No prior point or stamp transactions recorded yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {customerTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#1E293B]">
                          {tx.note || (tx.type === 'stamp' ? (lang === 'ar' ? 'تسجيل طابع شراء' : 'Stamp Earned') : tx.type === 'earn' ? (lang === 'ar' ? 'اكتساب نقاط شراء' : 'Points Earned') : (lang === 'ar' ? 'صرف مكافأة الولاء' : 'Reward Redeemed'))}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] text-[#64748B] mt-0.5">
                          <span>{tx.date}</span>
                          <span>&bull;</span>
                          <span>{lang === 'ar' ? `الكاشير: ${tx.cashierName}` : `Staff: ${tx.cashierName}`}</span>
                          {tx.staffCode && (
                            <>
                              <span>&bull;</span>
                              <span dir="ltr">{tx.staffCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-slate-600 uppercase font-mono">
                      {tx.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#1E293B] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            {lang === 'ar' ? 'إغلاق نافذة العميل' : 'Close Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
