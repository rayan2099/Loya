import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  PhoneCall,
  Sparkles,
  Copy,
  Check,
  QrCode,
  Sliders,
  Globe,
  Settings,
  Users,
  Smartphone,
  Server,
  CloudLightning,
  AlertCircle,
  Power,
  Layers,
  MessageCircle,
  Zap,
  Download,
  Key,
  Camera,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Employee } from '../types';
import { EmployeePermissionsModal } from './EmployeePermissionsModal';
import { HelpTooltip } from './HelpTooltip';

export const ManagementView: React.FC = () => {
  const {
    employees,
    addEmployee,
    approveEmployee,
    simulateNewJoinRequest,
    updateEmployeeStatus,
    resetToDemoData,
    storeProfile,
    lang,
    setLang,
    loyaltyCards,
    customers,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'staff' | 'settings'>('staff');
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState<Employee['role']>('كاشير');
  const [empPhone, setEmpPhone] = useState('05');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newlyCreatedEmp, setNewlyCreatedEmp] = useState<Employee | null>(null);

  // Join code state
  const [joinCodeStatus, setJoinCodeStatus] = useState<'active' | 'paused'>('active');
  const joinCode = 'NQT-894210';
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteRolePreset, setInviteRolePreset] = useState<Employee['role']>('كاشير');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWhatsAppInvite = () => {
    const roleLabel = lang === 'ar' ? inviteRolePreset : inviteRolePreset === 'مدير فرع' ? 'Branch Manager' : inviteRolePreset === 'موظف' ? 'Staff' : 'Cashier';
    const shareText =
      lang === 'ar'
        ? `مرحباً بك في فريق متجر ${storeProfile.name}! 🚀\nللانضمام كـ (${inviteRolePreset}):\n١- حمل تطبيق كاشير نقاطي: https://app.niqati.com/download\n٢- أدخل رمز الفرع للانضمام: ${joinCode}`
        : `Welcome to ${storeProfile.name} team! 🚀\nTo join as (${roleLabel}):\n1- Download Loya Cashier app: https://app.niqati.com/download\n2- Enter branch join code: ${joinCode}`;
    if (navigator.share) {
      navigator.share({ title: 'دعوة انضمام لكاشير نقاطي', text: shareText }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || empPhone.length < 10) return;
    const created = addEmployee(empName, empRole, empPhone);
    setShowAddEmp(false);
    setEmpName('');
    setEmpPhone('05');
    setNewlyCreatedEmp(created);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#0D9488] shrink-0" />
            <span>{lang === 'ar' ? 'إدارة فريق الكاشير وإعدادات المنشأة' : 'Team Management & Store Settings'}</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {lang === 'ar'
              ? 'تحكم في صلاحيات الكاشير، كود انضمام الفروع، ومزامنة خوادم Apple & Google Wallet'
              : 'Configure cashier access, branch join codes, and Apple/Google cloud connectivity'}
          </p>
        </div>

        {activeTab === 'staff' && (
          <button
            onClick={() => setShowAddEmp(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>{lang === 'ar' ? 'إضافة موظف كاشير' : 'Add Cashier Account'}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] bg-white rounded-t-2xl px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`py-2.5 px-5 font-bold text-xs rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'staff'
              ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
              : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'ar' ? `👥 إدارة الموظفين وكود الانضمام (${employees.length})` : `👥 Team & Join Code (${employees.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-5 font-bold text-xs rounded-t-xl transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-[#0D9488] text-[#0D9488] bg-[#F0FDFA]'
              : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{lang === 'ar' ? '⚙️ حالة مزامنة المحافظ والإعدادات' : '⚙️ Wallet Sync & Settings Hub'}</span>
        </button>
      </div>

      {/* TAB 1: STAFF MANAGEMENT & JOIN CODE SYSTEM (SECTION N) */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Join-Code & Quick WhatsApp Invite System */}
          <div className="p-5 rounded-3xl bg-[#1E293B] bg-linear-to-br bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white shadow-xl space-y-4 border border-slate-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0D9488] text-white text-[10px] font-bold">
                    {lang === 'ar' ? 'دعوة وانضمام الكاشير' : 'Quick Staff Invite'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      joinCodeStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {joinCodeStatus === 'active' ? (lang === 'ar' ? '● الكود فعال' : '● Active') : (lang === 'ar' ? '⏸ موقوف' : '⏸ Paused')}
                  </span>
                  <HelpTooltip
                    title={lang === 'ar' ? 'كيف يعمل انضمام الكاشير؟' : 'How Cashier Invite Works'}
                    content={lang === 'ar' ? 'أرسل دعوة جاهزة عبر واتساب بضغطة واحدة تحتوي رابط التحميل وكود الفرع. يقوم الموظف بإدخال الكود ليظهر طلب انضمامه فوراً في شاشتك للقبول السريع دون كشف أي إعدادات حساسة.' : 'Send a single ready-made WhatsApp invite with both download link and join code. When staff enters the code, their request pops up instantly in your dashboard for 1-tap approval.'}
                  />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <span>{lang === 'ar' ? 'دعوة موظف بضغطة واحدة' : 'One-Tap WhatsApp Invite'}</span>
                </h3>
              </div>

              {/* Role Presets & Single Invite Button */}
              <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/15 backdrop-blur-md w-full md:w-auto">
                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-[11px] text-slate-300">{lang === 'ar' ? 'الدور:' : 'Role:'}</span>
                  <select
                    value={inviteRolePreset}
                    onChange={(e) => setInviteRolePreset(e.target.value as any)}
                    className="bg-slate-800 text-amber-300 font-bold text-xs px-2 py-1 rounded-lg border border-slate-600 outline-none"
                  >
                    <option value="كاشير">{lang === 'ar' ? 'كاشير' : 'Cashier'}</option>
                    <option value="مدير فرع">{lang === 'ar' ? 'مدير فرع' : 'Branch Manager'}</option>
                    <option value="موظف">{lang === 'ar' ? 'موظف' : 'Assistant Staff'}</option>
                  </select>
                </div>

                <button
                  onClick={handleWhatsAppInvite}
                  disabled={joinCodeStatus !== 'active'}
                  className="px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white transition-all disabled:opacity-40 flex items-center gap-1.5 text-xs font-extrabold shadow-md active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'ar' ? 'دعوة موظف عبر واتساب 💬' : 'Invite via WhatsApp 💬'}</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  title={lang === 'ar' ? 'نسخ الكود والرابط يدوياً' : 'Manual Copy'}
                  className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                  <span>{copiedCode ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ يدوي' : 'Manual Copy')}</span>
                </button>
              </div>
            </div>

            {/* Trimmed How-To Stepper (3 Horizontal Icons) */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 text-center">
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 rounded-xl bg-white/5">
                <Download className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200">{lang === 'ar' ? '١- تحميل التطبيق' : '1- Download App'}</span>
              </div>
              <div className="text-slate-500 font-bold">←</div>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 rounded-xl bg-white/5">
                <Key className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200">{lang === 'ar' ? `٢- إدخال الرمز (${joinCode})` : `2- Enter Code (${joinCode})`}</span>
              </div>
              <div className="text-slate-500 font-bold">←</div>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 rounded-xl bg-white/5">
                <Camera className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-[11px] font-bold text-slate-200">{lang === 'ar' ? '٣- بدء المسح' : '3- Start Scanning'}</span>
              </div>
            </div>
          </div>

          {/* Real-time pending-state visibility & One-tap approval */}
          {employees.filter((emp) => emp.status === 'معلق').length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300/80 shadow-md space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <h4 className="font-extrabold text-sm text-amber-900 flex items-center gap-1.5">
                    <span>{lang === 'ar' ? 'طلبات انضمام معلقة في انتظار موافقتك' : 'Pending Staff Join Requests'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs">
                      {employees.filter((emp) => emp.status === 'معلق').length}
                    </span>
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {employees
                  .filter((emp) => emp.status === 'معلق')
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3.5 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {emp.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#1E293B]">{emp.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              {emp.role}
                            </span>
                          </div>
                          <span className="text-xs text-[#64748B] font-mono" dir="ltr">{emp.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E293B] font-bold text-xs transition-colors cursor-pointer"
                        >
                          {lang === 'ar' ? 'تعديل الصلاحيات ⚙️' : 'Customize ⚙️'}
                        </button>
                        <button
                          type="button"
                          onClick={() => approveEmployee(emp.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-extrabold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>{lang === 'ar' ? `قبول كموظف ${emp.role} ✅` : `Approve as ${emp.role} ✅`}</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Staff List */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#1E293B]">
                  {lang === 'ar' ? `قائمة الموظفين والكاشير وأكواد الدخول (${employees.length})` : `Staff Members & Login Codes (${employees.length})`}
                </h4>
                <HelpTooltip
                  title={lang === 'ar' ? 'نظام الدخول (رقم الجوال + الكود)' : 'Phone + Code Auth System'}
                  content={lang === 'ar' ? 'يدخل الموظف برقم جواله وكود الدخول الممتد دون كلمة مرور أو إنشاء حساب. اضغط على أي موظف لتعديل صلاحياته أو إعادة إرسال الكود وإصدار كود جديد.' : 'Staff login uses Phone + Long-lived Code without password or signup. Click any row to customize permissions or resend/regenerate code.'}
                />
              </div>

              <button
                type="button"
                onClick={() => simulateNewJoinRequest(inviteRolePreset)}
                className="self-start sm:self-auto px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer border border-amber-300/60"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'ar' ? '⚡ محاكاة وصول طلب انضمام' : '⚡ Simulate Join Request'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white hover:border-[#0D9488]/40 transition-all shadow-sm cursor-pointer group/emp"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-sm group-hover/emp:scale-105 transition-transform ${
                          emp.role === 'مدير فرع'
                            ? 'bg-[#0D9488]'
                            : emp.role === 'كاشير'
                            ? 'bg-[#2563EB]'
                            : 'bg-[#16A34A]'
                        }`}
                      >
                        {emp.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-[#1E293B] group-hover/emp:text-[#0D9488] transition-colors">{emp.name}</h5>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                              emp.role === 'مدير فرع'
                                ? 'bg-[#F0FDFA] text-[#0D9488] border-[#0D9488]/20'
                                : 'bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/20'
                            }`}
                          >
                            {emp.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[#64748B] font-mono" dir="ltr">
                            {emp.phone || '05XXXXXXXX'}
                          </span>
                          <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200/80 font-mono font-bold px-1.5 py-0.5 rounded uppercase" dir="ltr">
                            🔑 {emp.authCode || 'EMP-849201'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <Sliders className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span className="font-semibold text-[11px]">
                          {lang === 'ar' ? 'إدارة الصلاحيات والكود' : 'Manage & Code'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployee(emp);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          emp.status === 'نشط'
                            ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-green-200'
                            : emp.status === 'بانتظار أول تسجيل دخول'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-[#FEF3C7] text-[#D97706] hover:bg-amber-200'
                        }`}
                      >
                        {emp.status === 'نشط'
                          ? (lang === 'ar' ? '● نشط' : '● Active')
                          : emp.status === 'بانتظار أول تسجيل دخول'
                          ? (lang === 'ar' ? '⏳ بانتظار أول دخول' : '⏳ Awaiting 1st Login')
                          : (lang === 'ar' ? '⏸ معلق' : '⏸ Suspended')}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WALLET SYNC STATUS & SETTINGS HUB (SECTIONS O, P) */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Wallet Sync Dashboard (Section O) */}
          <div className="p-5 rounded-3xl bg-[#0D9488] bg-linear-to-br bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30 shrink-0">
                  <CloudLightning className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-snug">
                    {lang === 'ar' ? 'مركز مزامنة محافظ Apple & Google Wallet السحابي' : 'Apple & Google Wallet Cloud Sync Hub'}
                  </h3>
                  <p className="text-xs text-white/90">
                    {lang === 'ar'
                      ? 'جميع بطاقات منشأتك مرتبطة لحظياً بخوادم المحافظ وتعمل بدون انقطاع (99.9% Uptime)'
                      : 'Real-time synchronization active with official Apple Push Notification Service (APNs) & Google API'}
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-white text-[#0D9488] font-black text-xs shadow-sm shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                <span>{lang === 'ar' ? 'متصل ومؤمن بشهادة SSL 🔒' : 'Operational & Secure 🔒'}</span>
              </span>
            </div>

            {/* Sync Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[11px] text-white/80 font-semibold block">
                  {lang === 'ar' ? 'بطاقات Apple Wallet' : 'Apple Passes Synced'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                  {customers.filter((c) => c.walletStatus === 'apple' || c.walletStatus === 'both').length}
                </span>
                <span className="text-[10px] text-emerald-200 font-bold block mt-0.5">✓ {lang === 'ar' ? 'محدثة لحظياً' : 'Real-time sync'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[11px] text-white/80 font-semibold block">
                  {lang === 'ar' ? 'بطاقات Google Wallet' : 'Google Passes Synced'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                  {customers.filter((c) => c.walletStatus === 'google' || c.walletStatus === 'both').length}
                </span>
                <span className="text-[10px] text-emerald-200 font-bold block mt-0.5">✓ {lang === 'ar' ? 'محدثة لحظياً' : 'Real-time sync'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[11px] text-white/80 font-semibold block">
                  {lang === 'ar' ? 'تحديثات معلقة (Pending)' : 'Pending Queue'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white mt-1 block">0</span>
                <span className="text-[10px] text-emerald-200 font-bold block mt-0.5">{lang === 'ar' ? 'الطابور فارغ' : 'All delivered'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[11px] text-white/80 font-semibold block">
                  {lang === 'ar' ? 'سرعة الاستجابة السحابية' : 'Server Latency'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">38ms</span>
                <span className="text-[10px] text-emerald-200 font-bold block mt-0.5">⚡ {lang === 'ar' ? 'فائق السرعة' : 'Ultra-low delay'}</span>
              </div>
            </div>
          </div>

          {/* Settings Hub Grid (Section P) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Account Profile Setting */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                <Settings className="w-4 h-4 text-[#0D9488]" />
                <span>{lang === 'ar' ? 'بيانات وإعدادات حساب المنشأة' : 'Store Account Profile & Preferences'}</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC]">
                  <span className="text-[#64748B] font-semibold">{lang === 'ar' ? 'اسم المنشأة المسجل:' : 'Organization Name:'}</span>
                  <span className="font-bold text-[#1E293B]">{storeProfile.name || 'مقهى ومحمصة نقاطي'}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC]">
                  <span className="text-[#64748B] font-semibold">{lang === 'ar' ? 'لغة واجهة النظام:' : 'System Interface Language:'}</span>
                  <button
                    onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                    className="px-3 py-1.5 rounded-xl bg-[#0D9488] text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'التبديل إلى English 🇺🇸' : 'التبديل إلى العربية 🇸🇦'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC]">
                  <span className="text-[#64748B] font-semibold">{lang === 'ar' ? 'نمط المظهر العرضي:' : 'Visual Appearance:'}</span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 font-bold text-[#1E293B] text-[11px]">
                    ☀️ {lang === 'ar' ? 'النمط الفاتح (Light Mode)' : 'Light Mode'}
                  </span>
                </div>
              </div>
            </div>

            {/* Support & System Action Danger Zone */}
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                  <HelpCircle className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'ar' ? 'الدعم الفني وشروحات المساعدة' : 'Support & Assistance'}</span>
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {lang === 'ar'
                    ? 'فريق نقاطي متاح للمساعدة في تصميم بطاقات الولاء وربط أجهزة الكاشير وتفعيل الحملات التسويقية.'
                    : 'Loya engineering team is available 24/7 to assist with wallet pass design and hardware configuration.'}
                </p>
                <a
                  href="tel:0535110460"
                  className="w-full py-2.5 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0D9488] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'اتصل بخبير نقاطي المباشر: 0535110460' : 'Call Direct Hotline: 0535110460'}</span>
                </a>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex gap-2">
                <button
                  onClick={() => {
                    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من إعادة تهيئة البيانات التجريبية الافتراضية؟' : 'Reset to demo default data?')) {
                      resetToDemoData();
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 text-[#1E293B] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'إعادة ضبط البيانات' : 'Reset Demo Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {showAddEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-base text-[#1E293B]">{lang === 'ar' ? 'إضافة موظف / كاشير جديد للفرع' : 'Add Branch Cashier'}</h3>
            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'اسم الموظف' : 'Cashier Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ar' ? 'مثال: عمر بن عبدالعزيز' : 'e.g., Omar Al-Aziz'}
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'الدور والصلاحية' : 'Role & Level'}</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-white font-semibold focus:ring-2 focus:ring-[#0D9488]"
                >
                  <option value="كاشير">{lang === 'ar' ? 'كاشير (صلاحية مسح وإضافة نقاط فقط)' : 'Cashier (Scan & Add only)'}</option>
                  <option value="مدير فرع">{lang === 'ar' ? 'مدير فرع (صلاحية كاملة وإحصائيات)' : 'Branch Manager (Full Access)'}</option>
                  <option value="موظف">{lang === 'ar' ? 'موظف مساعد' : 'Assistant Staff'}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1E293B] block mb-1">{lang === 'ar' ? 'رقم الجوال لتسجيل الدخول' : 'Login Phone Number'}</label>
                <input
                  type="tel"
                  required
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-mono outline-none focus:ring-2 focus:ring-[#0D9488]"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmp(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F1F5F9] font-semibold text-xs text-[#1E293B]"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs"
                >
                  {lang === 'ar' ? 'إضافة الموظف ومنحه الكود' : 'Add & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* EMPLOYEE PERMISSIONS MODAL */}
      {selectedEmployee && (
        <EmployeePermissionsModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      )}

      {/* POST-SUBMISSION CREDENTIALS CONFIRMATION MODAL */}
      {newlyCreatedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] space-y-5 text-center max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Key className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-[#1E293B]">
                {lang === 'ar' ? 'تم إصدار بيانات الدخول للموظف بنجاح 🎉' : 'Staff Credentials Issued Successfully 🎉'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {lang === 'ar' ? `تم إنشاء حساب (${newlyCreatedEmp.name}) بدور [${newlyCreatedEmp.role}]` : `Account created for ${newlyCreatedEmp.name} [${newlyCreatedEmp.role}]`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold leading-relaxed text-right space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === 'ar' ? 'نموذج الدخول الفوري (بدون كلمة مرور):' : 'Phone + Code Auth Model:'}</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                {lang === 'ar'
                  ? 'تنبيه هام: نظام الدخول للموظفين لا يتطلب كلمة مرور ولا إنشاء حساب جديد ولا بريد إلكتروني. رقم الجوال وكود الدخول هما بيانات الدخول الكاملة والوحيدة للدخول الفوري والسريع لنظام الكاشير.'
                  : 'Important: Staff login requires no password, no account registration, and no email. The phone number and access code below are the complete login credentials.'}
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-3 text-left" dir="ltr">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Login Phone:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{newlyCreatedEmp.phone}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-semibold">Long-Lived Code:</span>
                <span className="font-mono font-extrabold text-emerald-600 text-base tracking-wider uppercase">{newlyCreatedEmp.authCode}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const shareMsg = lang === 'ar'
                    ? `مرحباً بك في فريق نقاطي!\nبيانات دخولك لمنشأة الكاشير:\nرقم الجوال: ${newlyCreatedEmp.phone}\nكود الدخول: ${newlyCreatedEmp.authCode}\nللدخول الفوري دون كلمة مرور: https://app.niqati.com/staff-login`
                    : `Welcome to Loya POS!\nYour Staff Credentials:\nPhone: ${newlyCreatedEmp.phone}\nCode: ${newlyCreatedEmp.authCode}\nLogin: https://app.niqati.com/staff-login`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إرسال للموظف عبر واتساب 💬' : 'Send via WhatsApp 💬'}</span>
              </button>

              <button
                type="button"
                onClick={() => setNewlyCreatedEmp(null)}
                className="flex-1 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'تم وحفظ' : 'Done & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
