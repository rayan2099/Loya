import React, { useState } from 'react';
import { X, Shield, Lock, Check, Trash2, AlertCircle, User, Key, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Employee } from '../types';

interface EmployeePermissionsModalProps {
  employee: Employee;
  onClose: () => void;
}

export const EmployeePermissionsModal: React.FC<EmployeePermissionsModalProps> = ({ employee, onClose }) => {
  const { updateEmployeePermissions, updateEmployeeStatus, regenerateEmployeeCode, deleteEmployee, lang } = useStore();

  const [permissions, setPermissions] = useState({
    canAddPoints: employee.permissions.canAddPoints,
    canRedeemRewards: employee.permissions.canRedeemRewards,
    canViewAnalytics: employee.permissions.canViewAnalytics,
    canManageCards: employee.permissions.canManageCards,
    canManageTeam: employee.permissions.canManageTeam,
    canBroadcastPush: employee.permissions.canBroadcastPush ?? (employee.role === 'مدير فرع'),
  });

  const [saved, setSaved] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateEmployeePermissions(employee.id, permissions);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleDelete = () => {
    deleteEmployee(employee.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {employee.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1E293B]">{employee.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-[#F0FDFA] text-[#0D9488] text-[10px] font-bold border border-[#0D9488]/20">
                  {employee.role}
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-mono mt-0.5" dir="ltr">
                {employee.phone || '05XXXXXXXX'}
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Login Credentials & Admin Code Actions */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                  {lang === 'ar' ? 'بيانات الدخول (بدون كلمة مرور)' : 'Login Credentials (No Password)'}
                </h4>
              </div>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                {lang === 'ar' ? 'رقم الجوال + كود الدخول' : 'Phone + Access Code'}
              </span>
            </div>

            <p className="text-[11px] text-amber-800 leading-relaxed">
              {lang === 'ar'
                ? 'نظام الدخول للكاشير يعتمد كلياً على رقم الجوال وكود الدخول الممتد ولا يتطلب بريداً إلكترونياً أو كلمة مرور. يمكنك إعادة إرسال نفس الكود أو إلغاؤه وإصدار كود جديد فوراً.'
                : 'Staff login uses Phone + Code exclusively with no password or email needed. Resend current code or revoke & issue a new one.'}
            </p>

            <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-amber-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{lang === 'ar' ? 'رقم الجوال المسجل:' : 'Login Phone:'}</span>
                <span className="font-mono font-bold text-slate-800" dir="ltr">{employee.phone || '05XXXXXXXX'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{lang === 'ar' ? 'كود الدخول الممتد:' : 'Access Code:'}</span>
                <span className="font-mono font-extrabold text-amber-600 tracking-wider uppercase" dir="ltr">{employee.authCode || 'EMP-849201'}</span>
              </div>
            </div>

            {employee.isLocked && (
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-between">
                <span>{lang === 'ar' ? '⚠️ تم قفل الحساب لتجاوز 5 محاولات خاطئة.' : '⚠️ Account locked due to 5 failed login attempts.'}</span>
                <button
                  type="button"
                  onClick={() => {
                    regenerateEmployeeCode(employee.id);
                    setRegenSuccess(true);
                    setTimeout(() => setRegenSuccess(false), 2000);
                  }}
                  className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px]"
                >
                  {lang === 'ar' ? 'فك القفل وإصدار كود' : 'Unlock & New Code'}
                </button>
              </div>
            )}

            <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const msg = lang === 'ar'
                    ? `مرحباً بك في نظام loya!\nبيانات دخولك لمنشأة الكاشير:\nرقم الجوال: ${employee.phone || ''}\nكود الدخول: ${employee.authCode || 'EMP-849201'}\nللدخول: https://app.loya.com/staff-login`
                    : `Welcome to Loya POS!\nYour Staff Login:\nPhone: ${employee.phone || ''}\nCode: ${employee.authCode || 'EMP-849201'}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'ar' ? 'إعادة إرسال الكود واتساب 💬' : 'Resend Code via WhatsApp 💬'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء الكود الحالي وإصدار كود جديد؟ سيتم تسجيل خروج الموظف إذا كان متصلاً حالياً.' : 'Revoke current code and generate new one? Active session will be logged out.')) {
                    regenerateEmployeeCode(employee.id);
                    setRegenSuccess(true);
                    setTimeout(() => setRegenSuccess(false), 2500);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{regenSuccess ? (lang === 'ar' ? '✓ تم إصدار كود جديد' : '✓ New Code Issued') : (lang === 'ar' ? '🔄 إلغاء وإصدار كود جديد' : '🔄 Revoke & Issue New Code')}</span>
              </button>
            </div>
          </div>

          {/* Status Quick Switch */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#1E293B]">
                {lang === 'ar' ? 'حالة حساب الكاشير' : 'Account Login Status'}
              </h4>
              <p className="text-[11px] text-[#64748B]">
                {lang === 'ar' ? 'إيقاف مؤقت أو تفعيل صلاحية الدخول للنظام' : 'Temporarily suspend or enable access'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateEmployeeStatus(employee.id, employee.status === 'نشط' ? 'معلق' : 'نشط')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                employee.status === 'نشط'
                  ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-green-200'
                  : employee.status === 'بانتظار أول تسجيل دخول'
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-[#FEF3C7] text-[#D97706] hover:bg-amber-200'
              }`}
            >
              {employee.status === 'نشط'
                ? (lang === 'ar' ? '● نشط ومصرح' : '● Active')
                : employee.status === 'بانتظار أول تسجيل دخول'
                ? (lang === 'ar' ? '⏳ بانتظار أول تسجيل دخول' : '⏳ Awaiting 1st Login')
                : (lang === 'ar' ? '⏸ معلق' : '⏸ Suspended')}
            </button>
          </div>

          {/* 6 Permission Flags Toggles Replicating Section N */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-[#1E293B] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#0D9488]" />
              <span>{lang === 'ar' ? 'صلاحيات الموظف التفصيلية (6 صلاحيات أساسية)' : 'Granular 6-Flag Permission Toggles'}</span>
            </h4>

            {/* Flag 1 */}
            <div
              onClick={() => togglePermission('canAddPoints')}
              className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer bg-white"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                  {lang === 'ar' ? '1. مسح باركود بطاقة العميل وإضافة النقاط / الطوابع' : '1. Scan pass barcodes & award loyalty points'}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {lang === 'ar' ? 'يسمح للموظف بتسجيل المشتريات اليومية ومنح المكافآت' : 'Allow awarding stamps on customer purchases'}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {permissions.canAddPoints ? (
                  <ToggleRight className="w-7 h-7 text-[#0D9488]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300" />
                )}
              </div>
            </div>

            {/* Flag 2 */}
            <div
              onClick={() => togglePermission('canRedeemRewards')}
              className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer bg-white"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                  {lang === 'ar' ? '2. استبدال المكافآت وخصم النقاط من رصيد العميل' : '2. Redeem customer rewards & deduct points'}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {lang === 'ar' ? 'يسمح بتقديم الوجبات المجانية والخصومات مقابل النقاط' : 'Allow redeeming vouchers or free items'}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {permissions.canRedeemRewards ? (
                  <ToggleRight className="w-7 h-7 text-[#0D9488]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300" />
                )}
              </div>
            </div>

            {/* Flag 3 */}
            <div
              onClick={() => togglePermission('canViewAnalytics')}
              className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer bg-white"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                  {lang === 'ar' ? '3. الاطلاع على تقارير الأداء المالي وإحصائيات الزيارات' : '3. View store financial reports & analytics'}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {lang === 'ar' ? 'الوصول للرسوم البيانية ومعدل عائد الولاء للمنشأة' : 'Access revenue impact and visit charts'}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {permissions.canViewAnalytics ? (
                  <ToggleRight className="w-7 h-7 text-[#0D9488]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300" />
                )}
              </div>
            </div>

            {/* Flag 4 */}
            <div
              onClick={() => togglePermission('canManageCards')}
              className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer bg-white"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                  {lang === 'ar' ? '4. تصميم وإنشاء بطاقات ولاء جديدة أو تعديل ألوانها' : '4. Design & configure Apple/Google wallet passes'}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {lang === 'ar' ? 'تعديل سياسات النقاط والشعار وقواعد المكافأة' : 'Create or edit card rules and design'}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {permissions.canManageCards ? (
                  <ToggleRight className="w-7 h-7 text-[#0D9488]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300" />
                )}
              </div>
            </div>

            {/* Flag 5 */}
            <div
              onClick={() => togglePermission('canManageTeam')}
              className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer bg-white"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                  {lang === 'ar' ? '5. إدارة فريق الكاشير وتوليد أكواد الانضمام للموظفين' : '5. Manage team accounts & branch permissions'}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {lang === 'ar' ? 'إضافة أو إيقاف موظفين جدد في الفرع' : 'Invite cashiers or edit account roles'}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {permissions.canManageTeam ? (
                  <ToggleRight className="w-7 h-7 text-[#0D9488]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300" />
                )}
              </div>
            </div>

            {/* Flag 6 */}
            <div
              onClick={() => togglePermission('canBroadcastPush')}
              className="p-3.5 rounded-2xl border border-[#E2E8F0] hover:border-slate-300 transition-all flex items-center justify-between cursor-pointer bg-white"
            >
              <div>
                <span className="font-bold text-xs sm:text-sm text-[#1E293B] block">
                  {lang === 'ar' ? '6. إنشاء وحفظ حملات الإشعارات للعملاء' : '6. Create and save customer notification campaigns'}
                </span>
                <span className="text-[11px] text-[#64748B]">
                  {lang === 'ar' ? 'إعداد رسائل العروض وربطها بسجل الحملات' : 'Prepare promotional messages and attach them to campaign history'}
                </span>
              </div>
              <div className="shrink-0 ml-2">
                {permissions.canBroadcastPush ? (
                  <ToggleRight className="w-7 h-7 text-[#0D9488]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-[#E2E8F0]">
            {showConfirmDelete ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="text-xs font-bold text-rose-800">
                  {lang === 'ar' ? 'هل أنت متأكد من سحب صلاحية وحذف حساب هذا الموظف نهائياً؟' : 'Are you sure you want to delete this cashier account?'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-1.5 rounded-xl bg-white text-xs font-semibold text-slate-700 border border-slate-300"
                  >
                    {lang === 'ar' ? 'تراجع' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    {lang === 'ar' ? 'نعم، حذف الموظف' : 'Yes, Delete Account'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'ar' ? 'حذف حساب الكاشير نهائياً' : 'Delete Cashier Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            <span>{saved ? (lang === 'ar' ? 'تم الحفظ!' : 'Saved!') : (lang === 'ar' ? 'حفظ الصلاحيات' : 'Save Permissions')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
