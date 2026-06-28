import { useState, useEffect, useRef, FormEvent } from "react";
import { Language, translations } from "../utils/translations";
import { Business, Customer, Reward, DashboardStats } from "../types";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { 
  TrendingUp, Users, Award, CheckCircle2, QrCode, ClipboardList, 
  Settings, Search, Printer, Download, Save, LogOut, Check, Sparkles, Copy, Eye, AlertCircle,
  Store, Palette, ShieldCheck, ArrowLeft, ArrowRight, ExternalLink
} from "lucide-react";

interface DashboardProps {
  lang: Language;
  token: string;
  business: Business;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  onUpdateBusiness: (business: Business) => void;
}

export default function Dashboard({ lang, token, business, onNavigate, onLogout, onUpdateBusiness }: DashboardProps) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<"overview" | "qr" | "customers" | "rewards" | "settings">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<(Reward & { customer_name: string; customer_phone: string })[]>([]);
  
  // Search state for customers
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Claim actions inside dashboard
  const [claimCodeInput, setClaimCodeInput] = useState("");
  const [claimPinInput, setClaimPinInput] = useState("");
  const [claimSuccessMsg, setClaimSuccessMsg] = useState("");
  const [claimErrorMsg, setClaimErrorMsg] = useState("");

  // Settings states
  const [nameAr, setNameAr] = useState(business?.name_ar || "");
  const [nameEn, setNameEn] = useState(business?.name_en || "");
  const [slug, setSlug] = useState(business?.slug || "");
  const [logoUrl, setLogoUrl] = useState(business?.logo_url || "");
  const [primaryColor, setPrimaryColor] = useState(business?.primary_color || "#7c3aed");
  const [secondaryColor, setSecondaryColor] = useState(business?.secondary_color || "#f59e0b");
  const [winProb, setWinProb] = useState(business?.win_probability || 20);
  const [stampsRequired, setStampsRequired] = useState(business?.stamps_required || 5);
  const [rewardAr, setRewardAr] = useState(business?.reward_ar || "");
  const [rewardEn, setRewardEn] = useState(business?.reward_en || "");
  const [cashierPin, setCashierPin] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsStep, setSettingsStep] = useState(0);

  // Link copy notifier
  const [copied, setCopied] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error loading dashboard statistics:", err);
    }
  };

  // Fetch Customers
  const fetchCustomers = async (search = "") => {
    try {
      const res = await fetch(`/api/dashboard/customers?search=${search}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCustomers(data);
      }
    } catch (err) {
      console.error("Error loading customers list:", err);
    }
  };

  // Fetch Rewards
  const fetchRewards = async () => {
    try {
      const res = await fetch("/api/dashboard/rewards", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRewards(data);
      }
    } catch (err) {
      console.error("Error loading rewards list:", err);
    }
  };

  // Trigger full dashboard fetch
  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchCustomers(searchQuery), fetchRewards()]);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle claim reward inside rewards panel
  const handleVerifyClaim = async (code: string) => {
    setClaimErrorMsg("");
    setClaimSuccessMsg("");

    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code, pin: claimPinInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Claim verification failed.");
      }

      setClaimSuccessMsg(t.claim_success);
      setClaimCodeInput("");
      fetchRewards();
      fetchStats();
    } catch (err: any) {
      setClaimErrorMsg(err.message || "Failed to claim reward.");
    }
  };

  // Update Settings handler
  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name_ar: nameAr,
          name_en: nameEn,
          slug,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          win_probability: winProb,
          stamps_required: stampsRequired,
          reward_ar: rewardAr,
          reward_en: rewardEn,
          ...(cashierPin.trim() ? { cashier_pin: cashierPin.trim() } : {})
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      onUpdateBusiness(data);
      setCashierPin("");
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  // Helper to handle client link copying
  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/b/${business.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger browser print of the QR Stand
  const handlePrintStand = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const fullUrl = `${window.location.origin}/b/${business.slug}`;
    const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Table Stand - ${business.name_en}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700;900&family=Inter:wght@700;800&display=swap');
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: 'Inter', 'Tajawal', sans-serif;
              background-color: #fafafa;
              color: #1a1a1a;
              height: 90vh;
            }
            .stand-card {
              border: 12px solid ${business.primary_color};
              border-radius: 36px;
              padding: 40px;
              max-width: 450px;
              background-color: #ffffff;
              box-shadow: 0 20px 50px rgba(0,0,0,0.05);
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 50px;
              object-fit: cover;
              border: 3px solid ${business.primary_color};
              margin-bottom: 20px;
            }
            h1 {
              font-size: 28px;
              margin: 10px 0;
              font-weight: 900;
              color: #111;
            }
            h2 {
              font-size: 22px;
              margin: 0 0 20px 0;
              color: #555;
            }
            .slogan-ar {
              font-size: 20px;
              color: ${business.secondary_color};
              margin-bottom: 5px;
              font-family: 'Tajawal', sans-serif;
            }
            .slogan-en {
              font-size: 16px;
              font-weight: 800;
              color: ${business.secondary_color};
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 25px;
            }
            .qr-box {
              padding: 15px;
              background-color: #ffffff;
              border: 2px solid #eaeaea;
              border-radius: 20px;
              margin-bottom: 25px;
            }
            .qr-img {
              width: 200px;
              height: 200px;
            }
            .footer-tip {
              font-size: 12px;
              color: #888;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="stand-card">
            <img class="logo" src="${business.logo_url}" />
            <h1>${business.name_ar}</h1>
            <h2>${business.name_en}</h2>
            <div class="slogan-ar">امسح واربح مكافآت فورية! 🎰</div>
            <div class="slogan-en">Scan to win instant rewards!</div>
            <div class="qr-box">
              <img class="qr-img" src="${qrImageSrc}" />
            </div>
            <p class="footer-tip">Powered by Loya Loyalty System — loya.sa</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const clientPortalUrl = `${window.location.origin}/b/${business.slug}`;
  const settingsSteps = [
    {
      title: lang === "en" ? "Business identity" : "هوية المنشأة",
      desc: lang === "en" ? "This is what guests see after scanning your QR code." : "هذه البيانات تظهر للعميل بعد مسح رمز QR.",
      icon: <Store className="h-4 w-4" />
    },
    {
      title: lang === "en" ? "Brand look" : "شكل العلامة",
      desc: lang === "en" ? "Match the customer page with your restaurant colors and logo." : "اجعل صفحة العميل بنفس ألوان وشعار المطعم.",
      icon: <Palette className="h-4 w-4" />
    },
    {
      title: lang === "en" ? "Rewards engine" : "محرك المكافآت",
      desc: lang === "en" ? "Choose what guests can win and how often loyalty rewards unlock." : "حدد ماذا يربح العميل ومتى تفتح مكافأة الولاء.",
      icon: <Award className="h-4 w-4" />
    },
    {
      title: lang === "en" ? "Cashier security" : "أمان الكاشير",
      desc: lang === "en" ? "Cashiers use this PIN to mark rewards as claimed." : "يستخدم الكاشير هذا الرمز لتسليم الجوائز.",
      icon: <ShieldCheck className="h-4 w-4" />
    },
    {
      title: lang === "en" ? "Launch checklist" : "قائمة الإطلاق",
      desc: lang === "en" ? "Print the QR, place it at checkout, and let guests scan after purchase." : "اطبع رمز QR وضعه عند الكاشير ليبدأ العملاء بالمسح بعد الشراء.",
      icon: <QrCode className="h-4 w-4" />
    }
  ];
  const currentSettingsStep = settingsSteps[settingsStep];

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-amber-500 selection:text-black flex flex-col md:flex-row">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-850 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-black font-black text-lg select-none">
              L
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-wider font-mono">
                {t.brand}
              </span>
              <span className="text-[9px] bg-amber-500/15 border border-amber-500/20 text-amber-500 font-bold px-1.5 py-0.5 rounded ml-1.5">
                SaaS
              </span>
            </div>
          </div>

          {/* Quick business view */}
          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center gap-3">
            <img 
              src={business?.logo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80"} 
              alt="Logo" 
              className="w-10 h-10 rounded-full border border-zinc-800 object-cover" 
            />
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">
                {lang === "en" ? business.name_en : business.name_ar}
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono truncate">
                /b/{business.slug}
              </p>
            </div>
          </div>

          {/* Nav buttons */}
          <nav className="space-y-1.5">
            {[
              { id: "overview", label: t.dash_overview, icon: <TrendingUp className="h-4 w-4" /> },
              { id: "qr", label: t.dash_qr, icon: <QrCode className="h-4 w-4" /> },
              { id: "customers", label: t.dash_customers, icon: <Users className="h-4 w-4" /> },
              { id: "rewards", label: t.dash_rewards, icon: <ClipboardList className="h-4 w-4" /> },
              { id: "settings", label: t.dash_settings, icon: <Settings className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                id={`sidebar-tab-${tab.id}`}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer
                  ${activeTab === tab.id
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-850"
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-zinc-850 mt-8">
          <button
            onClick={onLogout}
            id="logout-btn"
            className="w-full px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all flex items-center gap-3 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-hidden">
        
        {/* Loading state */}
        {loading && (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
            <span className="border-4 border-amber-500 border-t-transparent rounded-full w-10 h-10 animate-spin"></span>
            <p className="text-xs text-zinc-500">{lang === "en" ? "Fetching real-time business statistics..." : "جاري تحميل إحصائيات منشأتك المباشرة..."}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && stats && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-amber-500" /> {t.dash_overview}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">{lang === "en" ? "Real-time analytics and user retention metrics" : "تحليلات الأداء المباشرة ومؤشرات تكرار الزيارات"}</p>
                  </div>

                  {/* Customer Portal Link shortcut */}
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-xs text-zinc-300 w-fit">
                    <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[160px]">{clientPortalUrl}</span>
                    <button onClick={handleCopyLink} className="p-1.5 hover:bg-zinc-800 text-amber-500 rounded-lg cursor-pointer transition-all">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a href={`/b/${business.slug}`} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all">
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Total Scans */}
                  <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400">{t.stat_total_scans}</p>
                      <h3 className="text-3xl font-black text-white mt-1">{stats.totalScansAllTime}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {stats.totalScansToday} {t.stat_today} | {stats.totalScansThisWeek} {t.stat_week}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-950 text-amber-500 rounded-xl">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Active Customers */}
                  <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400">{t.stat_customers}</p>
                      <h3 className="text-3xl font-black text-white mt-1">{stats.totalCustomers}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1">{lang === "en" ? "Unique smartphone profiles" : "أجهزة جوال فريدة مسجلة"}</p>
                    </div>
                    <div className="p-3 bg-zinc-950 text-blue-500 rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Instant Wins */}
                  <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400">{t.stat_wins}</p>
                      <h3 className="text-3xl font-black text-emerald-400 mt-1">{stats.totalWins}</h3>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {lang === "en" ? `Win probability set to ${business.win_probability}%` : `احتمالية الفوز الحالية ${business.win_probability}٪`}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-950 text-emerald-500 rounded-xl">
                      <Award className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Unclaimed / Claimed */}
                  <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400">{t.stat_claimed_vs}</p>
                      <h3 className="text-3xl font-black text-white mt-1">{stats.claimedRewards} <span className="text-xs text-zinc-500 font-normal">/ {stats.claimedRewards + stats.unclaimedRewards}</span></h3>
                      <p className="text-[10px] text-amber-500 mt-1">
                        ● {stats.unclaimedRewards} {t.stat_unclaimed}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-950 text-purple-500 rounded-xl">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>

                </div>

                {/* Recharts chart */}
                <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <span>📊</span> {t.chart_scans} ({lang === "en" ? "Last 7 Days" : "آخر ٧ أيام"})
                  </h4>
                  <div className="h-80 w-full font-mono text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="#52525b" />
                        <YAxis stroke="#52525b" />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                        <Legend />
                        <Bar dataKey="scans" name={t.chart_scans} fill={business.primary_color || "#7c3aed"} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="wins" name={t.chart_wins} fill={business.secondary_color || "#f59e0b"} radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: QR STAND */}
            {activeTab === "qr" && (
              <div className="space-y-6 max-w-xl animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <QrCode className="h-6 w-6 text-amber-500" /> {t.qr_title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.qr_subtitle}</p>
                </div>

                {/* Styled Table Stand Display Card */}
                <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-850 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
                  <div 
                    className="absolute top-0 left-0 w-full h-3" 
                    style={{ backgroundColor: business.primary_color }}
                  ></div>

                  {/* Customer business logo inside qr card */}
                  <img 
                    src={business?.logo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80"} 
                    alt="Logo" 
                    className="w-16 h-16 rounded-full border-2 border-zinc-800 object-cover mt-4 mb-4" 
                    style={{ borderColor: business.primary_color }}
                  />

                  <h3 className="text-xl font-extrabold text-white">
                    {lang === "en" ? business.name_en : business.name_ar}
                  </h3>
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mt-1">
                    {lang === "en" ? "Scan to Win & Collect Stamps!" : "امسح واربح مكافآت فورية! 🎰"}
                  </p>

                  {/* Real scan QR Code API */}
                  <div className="p-4 bg-white rounded-2xl my-6 border-4" style={{ borderColor: business.primary_color }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(clientPortalUrl)}`} 
                      alt="Scan to Win QR Link"
                      className="w-48 h-48 select-none" 
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500 mb-6">
                    {t.qr_direct_link} <a href={clientPortalUrl} target="_blank" rel="noreferrer" className="text-amber-500 underline font-mono">{clientPortalUrl}</a>
                  </p>

                  {/* Call to action buttons */}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handlePrintStand}
                      className="flex-1 py-3 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Printer className="h-4 w-4" /> {t.qr_print_btn}
                    </button>
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(clientPortalUrl)}`}
                      download="loya_qr_code.png"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" /> {t.qr_download_btn}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CUSTOMERS DATABASE */}
            {activeTab === "customers" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      <Users className="h-6 w-6 text-amber-500" /> {t.dash_customers}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">{lang === "en" ? "Customer profiles logged automatically upon scanning QR code" : "قاعدة بيانات العملاء المتفاعلين تسجل تلقائياً فور مسح الكود"}</p>
                  </div>

                  {/* Search field */}
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder={t.search_placeholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Customer Table */}
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden">
                  {customers.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-xs">
                      {t.no_customers_found}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-zinc-300">
                        <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-850 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-4">{t.cust_table_name}</th>
                            <th className="p-4">{t.cust_table_phone}</th>
                            <th className="p-4 text-center">{t.cust_table_stamps}</th>
                            <th className="p-4 text-center">{t.cust_table_total_scans}</th>
                            <th className="p-4">{t.cust_table_joined}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 font-medium">
                          {customers.map((cust) => (
                            <tr key={cust.id} className="hover:bg-zinc-850/40 transition-colors">
                              <td className="p-4 font-bold text-white">{cust.name}</td>
                              <td className="p-4 font-mono">{cust.phone}</td>
                              <td className="p-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-amber-500 font-bold">
                                  {cust.stamps} / {business.stamps_required} ☕
                                </span>
                              </td>
                              <td className="p-4 text-center text-zinc-400 font-bold">{cust.total_scans}</td>
                              <td className="p-4 text-zinc-500">{new Date(cust.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: REWARDS / CLAIMS VERIFICATION */}
            {activeTab === "rewards" && (
              <div className="space-y-6 max-w-4xl animate-fadeIn">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <ClipboardList className="h-6 w-6 text-amber-500" /> {t.dash_rewards}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.rewards_unclaimed_desc}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left: Interactive Quick Claim box */}
                  <div className="lg:col-span-5 bg-zinc-900 border border-zinc-850 p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {lang === "en" ? "📥 Fulfill Reward Code" : "📥 صرف وتسليم جائزة العميل"}
                    </h3>

                    {claimSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{claimSuccessMsg}</span>
                      </div>
                    )}

                    {claimErrorMsg && (
                      <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <span>{claimErrorMsg}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">{t.claim_code}</label>
                      <input
                        type="text"
                        placeholder="e.g. W9A8X1"
                        value={claimCodeInput}
                        onChange={(e) => setClaimCodeInput(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm font-bold tracking-widest text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">{t.cashier_pin_label}</label>
                      <input
                        type="password"
                        placeholder={lang === "en" ? "Owner session can claim directly" : "جلسة المالك تكفي للتسليم"}
                        value={claimPinInput}
                        onChange={(e) => setClaimPinInput(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2 px-4 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleVerifyClaim(claimCodeInput)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {t.mark_as_claimed}
                    </button>
                  </div>

                  {/* Right: Unclaimed Rewards list table */}
                  <div className="lg:col-span-7 bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-zinc-950 border-b border-zinc-850 flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">{t.rewards_unclaimed_list}</h4>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full">
                        {rewards.filter(r => !r.claimed).length} Unclaimed
                      </span>
                    </div>

                    {rewards.length === 0 ? (
                      <div className="p-12 text-center text-zinc-500 text-xs">
                        {lang === "en" ? "All rewards have been successfully claimed." : "تم تسليم وصرف كافة هدايا عملائك بنجاح!"}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-zinc-300">
                          <thead className="bg-zinc-950 border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                            <tr>
                              <th className="p-3">{t.cust_table_name}</th>
                              <th className="p-3">{t.reward_type}</th>
                              <th className="p-3 font-mono text-center">{t.claim_code}</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-850 font-medium">
                            {rewards.map((reward) => (
                              <tr key={reward.id} className={`hover:bg-zinc-850/20 transition-colors ${reward.claimed ? "opacity-40" : ""}`}>
                                <td className="p-3">
                                  <div className="font-bold text-white">{reward.customer_name}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono">{reward.customer_phone}</div>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block
                                    ${reward.type === "lottery_win" 
                                      ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}>
                                    {reward.type === "lottery_win" ? t.type_lottery_win : t.type_stamp_reward}
                                  </span>
                                </td>
                                <td className="p-3 font-mono font-bold text-center text-zinc-200 tracking-wider">
                                  {reward.claim_code}
                                </td>
                                <td className="p-3 text-right">
                                  {reward.claimed ? (
                                    <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                                      <Check className="h-3 w-3" /> {t.stat_claimed}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setClaimCodeInput(reward.claim_code);
                                        handleVerifyClaim(reward.claim_code);
                                      }}
                                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 rounded text-[10px] text-amber-500 hover:text-amber-400 cursor-pointer transition-all"
                                    >
                                      Claim
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {activeTab === "settings" && (
              <div className="max-w-6xl space-y-6 animate-fadeIn">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500">
                      {lang === "en" ? "Launch setup" : "إعداد الإطلاق"}
                    </span>
                    <h2 className="mt-2 text-2xl font-black text-white flex items-center gap-2">
                      <Settings className="h-6 w-6 text-amber-500" />
                      {lang === "en" ? "Set up your scan-to-win system" : "جهز نظام امسح واربح"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                      {lang === "en"
                        ? "In a few steps, your restaurant gets a branded QR page, instant rewards, stamp loyalty, and a cashier claim flow. Save when you are done, then print the QR and place it at checkout or on tables."
                        : "بخطوات بسيطة يحصل مطعمك على صفحة QR بهويتك، جوائز فورية، ولاء بالأختام، وطريقة تسليم للكاشير. احفظ الإعدادات ثم اطبع الرمز وضعه عند الكاشير أو على الطاولات."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 max-w-sm">
                    <p className="font-black text-amber-400">{lang === "en" ? "What staff will do" : "ماذا سيفعل الفريق"}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                      {lang === "en"
                        ? "Cashier asks guests to scan after payment. Winners show a claim code. Staff verifies it in Pending Claims or /claim."
                        : "الكاشير يطلب من العميل المسح بعد الدفع. الفائز يعرض كود الجائزة، والفريق يتحقق منه من صفحة الجوائز أو /claim."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateSettings} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
                  <aside className="space-y-3">
                    {settingsSteps.map((step, index) => {
                      const active = settingsStep === index;
                      return (
                        <button
                          key={step.title}
                          type="button"
                          onClick={() => setSettingsStep(index)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all cursor-pointer ${active ? "border-amber-500 bg-amber-500 text-black shadow-lg shadow-amber-500/10" : "border-zinc-850 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-black/10" : "bg-zinc-950"}`}>
                              {step.icon}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {lang === "en" ? `Step ${index + 1}` : `الخطوة ${index + 1}`}
                            </span>
                          </div>
                          <p className="mt-3 text-sm font-black">{step.title}</p>
                          <p className={`mt-1 text-[11px] leading-relaxed ${active ? "text-black/70" : "text-zinc-500"}`}>{step.desc}</p>
                        </button>
                      );
                    })}
                  </aside>

                  <section className="rounded-2xl border border-zinc-850 bg-zinc-900 p-6 shadow-xl">
                    {settingsSuccess && (
                      <div className="mb-5 p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{t.settings_saved}</span>
                      </div>
                    )}

                    {error && (
                      <div className="mb-5 p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="mb-6 border-b border-zinc-850 pb-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                          {currentSettingsStep.icon}
                        </span>
                        <div>
                          <h3 className="text-lg font-black text-white">{currentSettingsStep.title}</h3>
                          <p className="text-xs text-zinc-400 mt-1">{currentSettingsStep.desc}</p>
                        </div>
                      </div>
                    </div>

                    {settingsStep === 0 && (
                      <div className="space-y-5">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                          <p className="text-xs font-black text-white">{lang === "en" ? "Purpose" : "الهدف"}</p>
                          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                            {lang === "en"
                              ? "This tells guests they are in the right restaurant page before they spin or collect stamps."
                              : "هذه الخطوة تطمئن العميل أنه في صفحة المطعم الصحيحة قبل السحب وجمع الأختام."}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_name_ar}</label>
                            <input type="text" required value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_name_en}</label>
                            <input type="text" required value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.slug_label}</label>
                          <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm font-mono text-white focus:outline-none transition-all" />
                          <p className="text-[10px] text-zinc-500 mt-2">{clientPortalUrl}</p>
                        </div>
                      </div>
                    )}

                    {settingsStep === 1 && (
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.logo_label} (URL)</label>
                          <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none transition-all font-mono" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-2">{t.primary_color_label}</label>
                            <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" />
                              <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full bg-transparent text-sm font-mono text-white focus:outline-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-2">{t.secondary_color_label}</label>
                            <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" />
                              <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full bg-transparent text-sm font-mono text-white focus:outline-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-2">
                            <span className="text-zinc-400">{t.odds_label}</span>
                            <span className="text-amber-500 font-bold">{winProb}%</span>
                          </div>
                          <input type="range" min="1" max="100" value={winProb} onChange={(e) => setWinProb(parseInt(e.target.value))} className="w-full accent-amber-500 h-2 bg-zinc-950 rounded-lg" />
                          <p className="mt-2 text-[11px] text-zinc-500">
                            {lang === "en" ? `${winProb} out of every 100 scans can win instantly.` : `تقريباً ${winProb} من كل 100 عملية مسح قد تفوز فوراً.`}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.stamps_req_label}</label>
                          <input type="number" min="2" max="20" value={stampsRequired} onChange={(e) => setStampsRequired(parseInt(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none" />
                          <p className="mt-2 text-[11px] text-zinc-500">
                            {lang === "en" ? `Every scan adds 1 stamp. At ${stampsRequired} stamps, the guest earns a loyalty reward.` : `كل مسح يضيف ختماً واحداً. عند ${stampsRequired} أختام يحصل العميل على مكافأة ولاء.`}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.reward_ar_label}</label>
                            <input type="text" required value={rewardAr} onChange={(e) => setRewardAr(e.target.value)} dir="rtl" className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.reward_en_label}</label>
                            <input type="text" required value={rewardEn} onChange={(e) => setRewardEn(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsStep === 3 && (
                      <div className="space-y-5">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                          <p className="text-xs font-black text-white">{lang === "en" ? "How claiming works" : "طريقة تسليم الجائزة"}</p>
                          <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                            {lang === "en"
                              ? "When a guest wins, they show a 6-character code. Cashiers enter the code and PIN to mark the reward as claimed."
                              : "عندما يفوز العميل، يعرض كود مكون من 6 رموز. يدخل الكاشير الكود ورمز المرور لتأكيد تسليم الجائزة."}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.cashier_pin_label}</label>
                          <input type="password" minLength={4} value={cashierPin} onChange={(e) => setCashierPin(e.target.value)} placeholder={lang === "en" ? "Leave blank to keep current PIN" : "اتركه فارغاً للإبقاء على الرمز الحالي"} className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-3 px-3 text-sm text-white focus:outline-none" />
                        </div>
                      </div>
                    )}

                    {settingsStep === 4 && (
                      <div className="space-y-4">
                        {[
                          lang === "en" ? "Save this setup" : "احفظ الإعدادات",
                          lang === "en" ? "Open the QR Stand tab and print the code" : "افتح تبويب QR واطبع الرمز",
                          lang === "en" ? "Place it at checkout, receipts, or tables" : "ضعه عند الكاشير أو على الفواتير أو الطاولات",
                          lang === "en" ? "Tell cashiers: after payment, ask guests to scan" : "أخبر الكاشير: بعد الدفع اطلب من العميل المسح",
                          lang === "en" ? "Use Pending Claims to verify winners" : "استخدم صفحة الجوائز للتحقق من الفائزين"
                        ].map((item, index) => (
                          <div key={item} className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-black">{index + 1}</span>
                            <p className="text-sm font-bold text-white">{item}</p>
                          </div>
                        ))}
                        <button type="button" onClick={() => setActiveTab("qr")} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-xs font-black text-amber-400 hover:bg-amber-500 hover:text-black transition-all">
                          <ExternalLink className="h-4 w-4" />
                          {lang === "en" ? "Go to QR Stand" : "اذهب إلى رمز QR"}
                        </button>
                      </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3 border-t border-zinc-850 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <button type="button" disabled={settingsStep === 0} onClick={() => setSettingsStep(Math.max(0, settingsStep - 1))} className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 px-4 py-3 text-xs font-bold text-zinc-300 transition-all hover:border-zinc-700 hover:text-white disabled:opacity-40">
                        <ArrowLeft className="h-4 w-4" />
                        {t.back}
                      </button>
                      {settingsStep < settingsSteps.length - 1 ? (
                        <button type="button" onClick={() => setSettingsStep(Math.min(settingsSteps.length - 1, settingsStep + 1))} className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-black text-black transition-all hover:bg-amber-400">
                          {t.next}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-black text-black transition-all hover:bg-amber-400">
                          <Save className="h-4 w-4" />
                          {t.save_settings}
                        </button>
                      )}
                    </div>
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-2xl border border-zinc-850 bg-zinc-900 p-5">
                      <p className="text-xs font-black text-white">{lang === "en" ? "Guest preview" : "معاينة العميل"}</p>
                      <div className="mt-4 rounded-[28px] border border-zinc-800 bg-zinc-950 p-4">
                        <div className="text-center">
                          <img src={logoUrl || business.logo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80"} alt="" className="mx-auto h-14 w-14 rounded-full object-cover border-2" style={{ borderColor: primaryColor }} />
                          <h4 className="mt-3 text-sm font-black text-white">{lang === "en" ? nameEn : nameAr}</h4>
                          <p className="mt-1 text-[10px] text-zinc-500">{lang === "en" ? rewardEn : rewardAr}</p>
                        </div>
                        <div className="mt-5 rounded-2xl p-4 text-center" style={{ backgroundColor: primaryColor }}>
                          <p className="text-[10px] font-black uppercase text-white/80">{lang === "en" ? "Scan to win" : "امسح واربح"}</p>
                          <p className="mt-1 text-lg font-black text-white">{winProb}%</p>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-zinc-800">
                          <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (2 / Math.max(1, stampsRequired)) * 100)}%`, backgroundColor: secondaryColor }}></div>
                        </div>
                        <p className="mt-2 text-center text-[10px] text-zinc-500">2 / {stampsRequired} {lang === "en" ? "stamps" : "أختام"}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-850 bg-zinc-900 p-5">
                      <p className="text-xs font-black text-white">{lang === "en" ? "Your customer link" : "رابط العملاء"}</p>
                      <p className="mt-2 break-all rounded-xl bg-zinc-950 p-3 font-mono text-[10px] text-zinc-400">{clientPortalUrl}</p>
                      <button type="button" onClick={handleCopyLink} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 py-2.5 text-xs font-bold text-zinc-300 hover:text-white">
                        <Copy className="h-4 w-4" />
                        {copied ? (lang === "en" ? "Copied" : "تم النسخ") : (lang === "en" ? "Copy link" : "نسخ الرابط")}
                      </button>
                    </div>
                  </aside>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
