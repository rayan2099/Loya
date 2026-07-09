import React, { useState } from 'react';
import { Users, Search, Plus, Bell, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { NotificationComposerModal } from './NotificationComposerModal';

export const CustomersView: React.FC = () => {
  const { customers, loyaltyCards, addCustomer, lang } = useStore();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('05');
  const [selectedCardId, setSelectedCardId] = useState(loyaltyCards[0]?.id || '');

  const filtered = customers.filter(
    (c) => c.name.includes(search) || c.phone.includes(search)
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPhone.length < 10) return;
    addCustomer(newName, newPhone, selectedCardId);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('05');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top action header */}
      <div className="surface hero-sheen p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#263241] flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D9488] shrink-0" />
            <span>{lang === 'ar' ? 'سجل العملاء وبطاقات الولاء' : 'Customer Directory'}</span>
          </h2>
          <p className="text-xs text-[#71717A] mt-0.5">
            {lang === 'ar' ? `إجمالي العملاء المنضمين لمحفظة جوالهم: ${customers.length} عميل` : `Total enrolled: ${customers.length} customers`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowComposer(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-[#EEF5FF] hover:bg-[#E0ECFF] text-[#2563EB] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all whitespace-nowrap"
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'ارسل اشعار للعملاء' : 'Send Customer Notification'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-gradient-to-br from-[#12A594] to-[#0B8A7D] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'إضافة عميل يدوي' : 'Add Customer'}</span>
          </button>
        </div>
      </div>

      <div
        onClick={() => setShowComposer(true)}
        className="surface p-4 sm:p-5 cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#0D9488] shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#263241]">
              {lang === 'ar' ? 'ارسل اشعار للعملاء' : 'Send a notification to customers'}
            </h4>
            <p className="text-[11px] text-[#71717A]">
              {lang === 'ar'
                ? 'اكتب رسالة قصيرة ووجّهها للعملاء عبر بطاقات المحفظة.'
                : 'Write a short message and send it through customer wallet cards.'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-[#ECFDF9] text-[#0D9488] font-bold text-xs border border-[#0D9488]/20">
          {customers.length} {lang === 'ar' ? 'عميل نشط' : 'active customers'}
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-[#64748B]" />
        <input
          type="text"
          placeholder={lang === 'ar' ? 'ابحث باسم العميل أو رقم الجوال (05...)...' : 'Search customers by name or phone...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input pr-10"
        />
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filtered.map((cust) => {
          const card = loyaltyCards.find((c) => c.id === cust.cardId) || loyaltyCards[0];
          const isStamp = cust.stampsBalance !== undefined;

          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="surface p-4 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group/row"
            >
              <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 group-hover/row:scale-105 transition-transform"
                  style={{ backgroundColor: card?.color || '#0D9488' }}
                >
                  {cust.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-bold text-sm text-[#263241] truncate group-hover/row:text-[#0D9488] transition-colors">{cust.name}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#536273] text-[10px] font-semibold border border-[#EEF0F2] whitespace-nowrap">
                      {cust.walletStatus === 'apple' ? ' Apple Wallet' : cust.walletStatus === 'google' ? '💳 Google Wallet' : ' & 💳'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] sm:text-xs text-[#64748B] font-mono" dir="ltr">
                    <span>{cust.phone}</span>
                    <span>&bull;</span>
                    <span className="font-sans text-[#64748B]">{lang === 'ar' ? `آخر زيارة: ${cust.lastVisit}` : `Last visit: ${cust.lastVisit}`}</span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#EEF0F2]">
                <span className="text-xs text-[#64748B] font-medium sm:hidden">{lang === 'ar' ? 'الرصيد في المحفظة:' : 'Wallet Balance:'}</span>
                <div className="text-center bg-[#FAFBFC] px-3.5 py-1.5 sm:py-2 rounded-lg border border-[#EEF0F2] shrink-0 group-hover/row:border-[#0D9488]/40 transition-colors">
                  <span className="text-[9px] sm:text-[10px] text-[#64748B] font-semibold block uppercase tracking-wider leading-none mb-0.5">
                    {isStamp ? (lang === 'ar' ? 'الطوابع' : 'Stamps') : (lang === 'ar' ? 'الرصيد' : 'Points')}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#263241]">
                    {isStamp ? `${cust.stampsBalance} ${lang === 'ar' ? 'طوابع' : 'stamps'}` : `${cust.pointsBalance} ${lang === 'ar' ? 'نقطة' : 'pts'}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-panel w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-base text-[#263241]">{lang === 'ar' ? 'تسجيل عميل جديد لبطاقة الولاء' : 'Enroll New Customer'}</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'اسم العميل الثلاثي' : 'Full Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'مثال: أحمد محمد العمري' : 'e.g., Ahmed Al-Omari'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="field-input"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'رقم الجوال السعودية (SMS)' : 'Phone Number (SMS)'}</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="field-input font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'اختر بطاقة الولاء المخصصة' : 'Select Loyalty Card'}</label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="field-input bg-white"
                >
                  {loyaltyCards.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-[#F4F5F7] font-semibold text-xs text-[#536273]"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-br from-[#12A594] to-[#0B8A7D] text-white font-bold text-xs"
                >
                  {lang === 'ar' ? 'إضافة وإرسال رابط المحفظة' : 'Add & Send Pass Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION COMPOSER MODAL */}
      {showComposer && (
        <NotificationComposerModal onClose={() => setShowComposer(false)} />
      )}

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          card={loyaltyCards.find((c) => c.id === selectedCustomer.cardId) || loyaltyCards[0]}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};
