import React, { useState } from 'react';
import {
  QrCode,
  Users,
  Award,
  Plus,
  Share2,
  Edit3,
  Trash2,
  Send,
  Palette,
  FileText,
  Repeat2,
  ScanLine,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LoyaltyCard } from '../types';
import { CardWizardModal } from './CardWizardModal';
import { WalletShareModal } from './WalletShareModal';
import { FreeCardDesignModal } from './FreeCardDesignModal';
import { CardDesignEditorModal } from './CardDesignEditorModal';
import { CardDetailsModal } from './CardDetailsModal';
import { ProUpgradeModal } from './ProUpgradeModal';

export const HomeView: React.FC<{ onOpenScanner: () => void }> = ({ onOpenScanner }) => {
  const { loyaltyCards, customers, transactions, deleteLoyaltyCard, setActiveTab, lang, storeProfile } = useStore();

  const [editingCard, setEditingCard] = useState<LoyaltyCard | null>(null);
  const [designingCard, setDesigningCard] = useState<LoyaltyCard | null>(null);
  const [detailsCard, setDetailsCard] = useState<LoyaltyCard | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [sharingCard, setSharingCard] = useState<LoyaltyCard | null>(null);
  const [showFreeDesign, setShowFreeDesign] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [message, setMessage] = useState('');
  const [sentMessage, setSentMessage] = useState('');

  const totalPointsEarned = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);

  const primaryCard = loyaltyCards[0];
  const activeCustomers = customers.filter((customer) => customer.visits > 1).length;
  const returnRate = customers.length ? Math.round((activeCustomers / customers.length) * 100) : 0;
  const nearRewardCustomers = customers.filter((customer) => {
    const card = loyaltyCards.find((item) => item.id === customer.cardId);
    const target = card?.stampTarget || 5;
    return customer.stampsBalance !== undefined && target - customer.stampsBalance <= 2;
  }).length;

  const openNewCardWizard = () => {
    if (storeProfile?.plan === 'free' && loyaltyCards.length >= 1) {
      setUpgradeReason(lang === 'ar' ? 'الباقة المجانية تسمح ببطاقة ولاء واحدة فقط.' : 'The free plan allows one loyalty card.');
      setShowUpgradeModal(true);
      return;
    }
    setEditingCard(null);
    setShowWizard(true);
  };

  const submitMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setSentMessage(message.trim());
    setMessage('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <section className="surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black text-[#0D9488]">
              {lang === 'ar' ? 'لوحة المالك' : 'Owner dashboard'}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[#18181B] sm:text-2xl">
              {lang === 'ar'
                ? `${storeProfile?.name || 'متجرك'} جاهز لاستقبال العملاء`
                : `${storeProfile?.name || 'Your store'} is ready for customers`}
            </h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#71717A]">
              {lang === 'ar'
                ? 'اختم الزيارات، راقب العملاء القريبين من المكافأة، وأرسل عرضاً واضحاً بدون زحمة.'
                : 'Stamp visits, watch customers near reward, and send one clear offer without clutter.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button onClick={onOpenScanner} className="btn btn-primary px-4 py-3 text-sm">
              <ScanLine className="h-4 w-4" />
              {lang === 'ar' ? 'ختم زيارة' : 'Stamp visit'}
            </button>
            <button onClick={openNewCardWizard} className="btn btn-secondary px-4 py-3 text-sm">
              <Plus className="h-4 w-4" />
              {lang === 'ar' ? 'بطاقة جديدة' : 'New card'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: lang === 'ar' ? 'عملاء نشطون' : 'Active customers',
            value: customers.length.toLocaleString(),
            note: lang === 'ar' ? `${activeCustomers} عادوا أكثر من مرة` : `${activeCustomers} returned more than once`,
            icon: Users,
          },
          {
            label: lang === 'ar' ? 'بطاقات تعمل' : 'Live cards',
            value: loyaltyCards.length.toString(),
            note: lang === 'ar' ? 'Apple و Google Wallet' : 'Apple and Google Wallet',
            icon: Award,
          },
          {
            label: lang === 'ar' ? 'نسبة العودة' : 'Return rate',
            value: `${returnRate}%`,
            note: lang === 'ar' ? 'مؤشر صحة الولاء' : 'Loyalty health signal',
            icon: Repeat2,
          },
          {
            label: lang === 'ar' ? 'قريبون من مكافأة' : 'Near reward',
            value: nearRewardCustomers.toString(),
            note: lang === 'ar' ? `${totalPointsEarned.toLocaleString()} نقطة موزعة` : `${totalPointsEarned.toLocaleString()} points issued`,
            icon: QrCode,
          },
        ].map((item) => (
          <div key={item.label} className="surface p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[11px] font-black text-[#71717A]">{item.label}</span>
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#ECFDF9] text-[#0D9488]">
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black tracking-tight text-[#18181B]">{item.value}</div>
            <p className="mt-1 text-[11px] font-semibold text-[#71717A]">{item.note}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="surface p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#18181B]">{lang === 'ar' ? 'الإجراء الأهم الآن' : 'Most useful action now'}</h3>
                <p className="mt-1 text-xs font-medium text-[#71717A]">
                  {lang === 'ar' ? 'ابدأ من الكاشير. كل ختمة صحيحة تزيد فرصة رجوع العميل.' : 'Start at checkout. Every clean stamp improves return.'}
                </p>
              </div>
              <span className="pill bg-[#ECFDF9] text-[#0D9488]">{lang === 'ar' ? 'جاهز' : 'Ready'}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={onOpenScanner} className="quiet-action bg-[#0D9488] text-white">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/15">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h4>{lang === 'ar' ? 'مسح QR وختم زيارة' : 'Scan QR and stamp'}</h4>
                  <p>{lang === 'ar' ? 'أسرع مسار للكاشير' : 'Fastest cashier path'}</p>
                </div>
              </button>

              <button onClick={() => setActiveTab('customers')} className="quiet-action bg-[#18181B] text-white">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/15">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4>{lang === 'ar' ? 'افتح العملاء' : 'Open customers'}</h4>
                  <p>{lang === 'ar' ? 'تابع الرصيد والزيارات' : 'Review balances and visits'}</p>
                </div>
              </button>
            </div>
          </div>

          <div className="surface p-5">
            <div className="mb-4">
              <h3 className="text-base font-black text-[#18181B]">{lang === 'ar' ? 'عرض بسيط للعملاء' : 'Simple customer offer'}</h3>
              <p className="mt-1 text-xs font-medium text-[#71717A]">
                {lang === 'ar' ? 'رسالة واحدة قصيرة أفضل من حملة مزدحمة.' : 'One short message beats a noisy campaign.'}
              </p>
            </div>
            <form onSubmit={submitMessage} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="field-input"
                placeholder={lang === 'ar' ? 'مثال: اليوم ختمين على الطلبات الباردة' : 'Example: double stamps on cold drinks today'}
              />
              <button type="submit" className="btn btn-primary px-5 py-3 text-sm">
                <Send className="h-4 w-4" />
                {lang === 'ar' ? 'تجهيز' : 'Prepare'}
              </button>
            </form>
            {sentMessage && (
              <div className="mt-3 rounded-lg bg-[#ECFDF9] p-3 text-xs font-bold text-[#0F766E]">
                {lang === 'ar' ? `تم تجهيز الرسالة: ${sentMessage}` : `Message prepared: ${sentMessage}`}
              </div>
            )}
          </div>

          <div className="surface p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[#18181B]">{lang === 'ar' ? 'بطاقات الولاء' : 'Loyalty cards'}</h3>
                <p className="mt-1 text-xs font-medium text-[#71717A]">
                  {lang === 'ar' ? 'أبقِ البطاقة واضحة ومباشرة للعميل.' : 'Keep each card clear and easy for the customer.'}
                </p>
              </div>
              <button onClick={openNewCardWizard} className="btn btn-secondary px-3 py-2 text-xs">
                <Plus className="h-4 w-4" />
                {lang === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </div>

            <div className="space-y-3">
              {loyaltyCards.map((card) => (
                <div key={card.id} className="rounded-lg border border-[#E4E4E7] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => setDetailsCard(card)} className="min-w-0 flex-1 text-right">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-lg font-black text-white" style={{ backgroundColor: card.color }}>
                          {card.ruleType === 'stamp_buy_5' ? '☕' : '★'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black text-[#18181B]">{card.name}</h4>
                          <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#71717A]">{card.description}</p>
                        </div>
                      </div>
                    </button>
                    <span className="pill bg-[#F4F4F5] text-[#52525B]">
                      {card.customersCount} {lang === 'ar' ? 'عميل' : 'clients'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E4E4E7] pt-3">
                    <button onClick={() => setSharingCard(card)} className="mini-tool">
                      <Share2 className="h-3.5 w-3.5" />
                      {lang === 'ar' ? 'مشاركة' : 'Share'}
                    </button>
                    <button onClick={() => setDetailsCard(card)} className="mini-tool">
                      <FileText className="h-3.5 w-3.5" />
                      {lang === 'ar' ? 'تفاصيل' : 'Details'}
                    </button>
                    <button onClick={() => setDesigningCard(card)} className="mini-tool">
                      <Palette className="h-3.5 w-3.5" />
                      {lang === 'ar' ? 'الشكل' : 'Design'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCard(card);
                        setShowWizard(true);
                      }}
                      className="mini-tool"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      {lang === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(lang === 'ar' ? 'حذف هذه البطاقة؟' : 'Delete this card?')) {
                          deleteLoyaltyCard(card.id);
                        }
                      }}
                      className="mini-tool text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {lang === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="surface p-5">
            <p className="text-[11px] font-black text-[#0D9488]">{lang === 'ar' ? 'أفضل خطوة تالية' : 'Next best step'}</p>
            <h3 className="mt-1 text-base font-black text-[#18181B]">
              {nearRewardCustomers > 0
                ? lang === 'ar'
                  ? 'ذكّر العملاء القريبين من المكافأة'
                  : 'Nudge customers near reward'
                : lang === 'ar'
                ? 'ابدأ بختم أول زيارة اليوم'
                : 'Start by stamping today'}
            </h3>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#71717A]">
              {nearRewardCustomers > 0
                ? lang === 'ar'
                  ? `${nearRewardCustomers} عملاء يحتاجون زيارة أو زيارتين فقط. هذه أسهل عودة تربحها اليوم.`
                  : `${nearRewardCustomers} customers are one or two visits away. That is today’s easiest win.`
                : lang === 'ar'
                ? 'كل رحلة ولاء تبدأ من عملية ختم بسيطة وسريعة عند الكاشير.'
                : 'Every loyalty loop starts with a fast stamp at checkout.'}
            </p>
            <button onClick={onOpenScanner} className="btn btn-primary mt-4 w-full px-4 py-3 text-sm">
              <QrCode className="h-4 w-4" />
              {lang === 'ar' ? 'افتح الماسح' : 'Open scanner'}
            </button>
          </div>

          {primaryCard && (
            <div className="surface overflow-hidden">
              <div className="p-5">
                <p className="text-[11px] font-black text-[#71717A]">{lang === 'ar' ? 'البطاقة الأساسية' : 'Primary card'}</p>
                <h3 className="mt-1 text-base font-black text-[#18181B]">{primaryCard.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#71717A]">{primaryCard.description}</p>
              </div>
              <div className="px-5 pb-5">
                <button onClick={() => setShowFreeDesign(true)} className="w-full rounded-lg border border-dashed border-[#0D9488]/45 bg-[#ECFDF9] px-4 py-3 text-sm font-black text-[#0D9488]">
                  {lang === 'ar' ? 'اطلب تحسين تصميم البطاقة' : 'Request card design polish'}
                </button>
              </div>
            </div>
          )}
        </aside>
      </section>

      {showWizard && (
        <CardWizardModal
          initialCard={editingCard}
          onClose={() => {
            setShowWizard(false);
            setEditingCard(null);
          }}
        />
      )}

      {designingCard && (
        <CardDesignEditorModal
          card={designingCard}
          onClose={() => setDesigningCard(null)}
        />
      )}

      {detailsCard && (
        <CardDetailsModal
          card={detailsCard}
          onClose={() => setDetailsCard(null)}
        />
      )}

      {sharingCard && (
        <WalletShareModal card={sharingCard} onClose={() => setSharingCard(null)} />
      )}

      {showFreeDesign && (
        <FreeCardDesignModal onClose={() => setShowFreeDesign(false)} />
      )}

      {showUpgradeModal && (
        <ProUpgradeModal onClose={() => setShowUpgradeModal(false)} reason={upgradeReason} />
      )}
    </div>
  );
};
