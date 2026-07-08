import React, { useState } from 'react';
import { Users, Search, Plus, Bell, Send, Check, Sparkles, Smartphone } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D9488] shrink-0" />
            <span>{lang === 'ar' ? 'سجل العملاء وبطاقات الولاء' : 'Customer Directory'}</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {lang === 'ar' ? `إجمالي العملاء المنضمين لمحفظة جوالهم: ${customers.length} عميل` : `Total enrolled: ${customers.length} customers`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowComposer(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            <Bell className="w-4 h-4 animate-bounce shrink-0 text-[#0D9488]" />
            <span>{lang === 'ar' ? 'ارسل اشعار للعملاء' : 'Send Customer Notification'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'إضافة عميل يدوي' : 'Add Customer'}</span>
          </button>
        </div>
      </div>

      <div
        onClick={() => setShowComposer(true)}
        className="p-4 sm:p-5 rounded-2xl border border-[#0D9488]/30 bg-[#F0FDFA] shadow-sm cursor-pointer hover:bg-[#CCFBF1]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#0D9488] shrink-0" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-[#1E293B]">
              {lang === 'ar' ? 'ارسل اشعار للعملاء' : 'Send a notification to customers'}
            </h4>
            <p className="text-[11px] text-[#64748B]">
              {lang === 'ar'
                ? 'اكتب رسالة قصيرة ووجّهها للعملاء عبر بطاقات المحفظة.'
                : 'Write a short message and send it through customer wallet cards.'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-white text-[#0D9488] font-bold text-xs border border-[#0D9488]/20">
          {customers.length} {lang === 'ar' ? 'عميل نشط' : 'active customers'}
        </span>
      </div>

      {/* Push Banner Promo */}
      <div
        onClick={() => setShowComposer(true)}
        className="p-5 rounded-2xl bg-white border border-[#E2E8F0] text-[#1E293B] shadow-sm cursor-pointer hover:bg-[#F8FAFC] transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center border border-[#0D9488]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1E293B]">{lang === 'ar' ? 'أرسل إشعاراً لعملائك مباشرة في شاشة قفل المحفظة' : 'Send Push Notification to Apple & Google Wallet'}</h4>
            <p className="text-xs text-[#64748B]">{lang === 'ar' ? 'معدل فتح الإشعارات عبر المحفظة يصل إلى 92٪ مقارنة بالرسائل العادية' : '92% open rate natively on customer lock screens'}</p>
          </div>
        </div>
        <span className="bg-[#F1F5F9] text-[#1E293B] font-semibold text-xs px-3 py-1.5 rounded-xl border border-[#E2E8F0]">{lang === 'ar' ? 'ارسل الآن' : 'Send now'}</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-[#64748B]" />
        <input
          type="text"
          placeholder={lang === 'ar' ? 'ابحث باسم العميل أو رقم الجوال (05...)...' : 'Search customers by name or phone...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-medium focus:ring-2 focus:ring-[#0D9488] bg-white outline-none text-[#1E293B]"
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
              className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer group/row"
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
                    <h4 className="font-bold text-sm text-[#1E293B] truncate group-hover/row:text-[#0D9488] transition-colors">{cust.name}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#1E293B] text-[10px] font-semibold border border-[#E2E8F0] whitespace-nowrap">
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

              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#E2E8F0]">
                <span className="text-xs text-[#64748B] font-medium sm:hidden">{lang === 'ar' ? 'الرصيد في المحفظة:' : 'Wallet Balance:'}</span>
                <div className="text-center bg-[#F8FAFC] px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#E2E8F0] shrink-0 group-hover/row:border-[#0D9488]/40 transition-colors">
                  <span className="text-[9px] sm:text-[10px] text-[#64748B] font-semibold block uppercase tracking-wider leading-none mb-0.5">
                    {isStamp ? (lang === 'ar' ? 'الطوابع' : 'Stamps') : (lang === 'ar' ? 'الرصيد' : 'Points')}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#1E293B]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'تسجيل عميل جديد لبطاقة الولاء' : 'Enroll New Customer'}</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'اسم العميل الثلاثي' : 'Full Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'مثال: أحمد محمد العمري' : 'e.g., Ahmed Al-Omari'}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'رقم الجوال السعودية (SMS)' : 'Phone Number (SMS)'}</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-mono outline-none focus:ring-2 focus:ring-[#0D9488]"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'اختر بطاقة الولاء المخصصة' : 'Select Loyalty Card'}</label>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-white focus:ring-2 focus:ring-[#0D9488]"
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
                  className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] font-semibold text-xs text-[#1E293B]"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0D9488] text-white font-bold text-xs"
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
