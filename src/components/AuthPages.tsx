import { useState, FormEvent } from "react";
import { Language, translations } from "../utils/translations";
import { BusinessType } from "../types";
import { Coffee, Key, Mail, Phone, ShoppingBag, Store, Utensils, AlertCircle } from "lucide-react";

interface AuthPagesProps {
  lang: Language;
  mode: "login" | "register";
  onNavigate: (route: string) => void;
  onAuthSuccess: (token: string, owner: any, business: any) => void;
}

export default function AuthPages({ lang, mode, onNavigate, onAuthSuccess }: AuthPagesProps) {
  const t = translations[lang];

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [bizType, setBizType] = useState<BusinessType>("coffee");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" 
        ? { email, password } 
        : { email, password, name_ar: nameAr, name_en: nameEn, business_type: bizType, phone };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { error: responseText || "Server returned an invalid response." };
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Success! Pass states to App container
      onAuthSuccess(data.token, data.owner, data.business);

      // Redirect
      if (mode === "register") {
        onNavigate("/onboarding");
      } else {
        onNavigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.03),transparent_60%)]"></div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-850 p-8 rounded-3xl relative shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span 
            onClick={() => onNavigate("/")}
            className="text-2xl font-black text-amber-500 tracking-wider cursor-pointer select-none font-mono"
          >
            {t.brand}
          </span>
          <h2 className="text-xl font-extrabold text-white mt-4">
            {mode === "login" ? t.auth_login_title : t.auth_register_title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === "login" ? t.auth_login_subtitle : t.auth_register_subtitle}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.password}</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Additional fields for register */}
          {mode === "register" && (
            <>
              {/* Business Name Arabic */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_name_ar}</label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: ريشيو كافيه"
                  dir="rtl"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all"
                />
              </div>

              {/* Business Name English */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_name_en}</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g., Ratio Cafe"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_type}</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "coffee", label: t.coffee, icon: <Coffee className="h-3.5 w-3.5" /> },
                    { type: "restaurant", label: t.restaurant, icon: <Utensils className="h-3.5 w-3.5" /> },
                    { type: "retail", label: t.retail, icon: <ShoppingBag className="h-3.5 w-3.5" /> },
                    { type: "other", label: t.other, icon: <Store className="h-3.5 w-3.5" /> },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setBizType(item.type as BusinessType)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer text-left
                        ${bizType === item.type
                          ? "bg-amber-500/10 border-amber-500 text-amber-500"
                          : "bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-800"
                        }`}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="border-2 border-black border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
            ) : mode === "login" ? (
              t.login_btn
            ) : (
              t.register_btn
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate(mode === "login" ? "/register" : "/login")}
            className="text-xs text-amber-500 hover:underline hover:text-amber-400 cursor-pointer"
          >
            {mode === "login" ? t.no_account : t.have_account}
          </button>
        </div>

        {/* Quick Demo Assist */}
        {mode === "login" && (
          <div className="mt-8 pt-6 border-t border-zinc-850">
            <p className="text-[10px] text-center text-zinc-500 mb-3">
              {lang === "en" ? "💡 Tap to load demo credentials:" : "💡 اضغط لتعبئة بيانات التجربة تلقائياً:"}
            </p>
            <button
              onClick={() => {
                setEmail("demo@loya.sa");
                setPassword("password123");
              }}
              className="w-full py-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-[10px] text-zinc-400 hover:text-white transition-all cursor-pointer font-mono"
            >
              demo@loya.sa / password123
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
