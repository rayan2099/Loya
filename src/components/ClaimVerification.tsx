import { useState, useEffect, FormEvent } from "react";
import { Language, translations } from "../utils/translations";
import { Reward } from "../types";
import { CheckCircle2, AlertCircle, ShoppingBag, ShieldAlert, Key, CornerDownLeft, Sparkles, Sun, Moon } from "lucide-react";

interface ClaimVerificationProps {
  lang: Language;
  codeParam: string | null;
  onNavigate: (route: string) => void;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
}

export default function ClaimVerification({ lang, codeParam, onNavigate, theme = "dark", onThemeToggle }: ClaimVerificationProps) {
  const t = translations[lang];

  const [code, setCode] = useState(codeParam || "");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Claim details loaded from API
  const [claimDetails, setClaimDetails] = useState<{
    reward: Reward;
    customer_name: string;
    business_name_ar: string;
    business_name_en: string;
    reward_name_ar: string;
    reward_name_en: string;
  } | null>(null);

  const fetchClaimDetails = async (claimCode: string) => {
    if (!claimCode.trim()) return;
    setLoading(true);
    setError("");
    setClaimDetails(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/claim/${claimCode.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.invalid_code);
      }
      setClaimDetails(data);
    } catch (err: any) {
      setError(err.message || t.invalid_code);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codeParam) {
      fetchClaimDetails(codeParam);
    }
  }, [codeParam]);

  const handleVerifySubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchClaimDetails(code);
  };

  const handleClaimReward = async () => {
    if (!code.trim() || !pin.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), pin })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to mark as claimed.");
      }

      setSuccess(true);
      if (claimDetails) {
        setClaimDetails({
          ...claimDetails,
          reward: {
            ...claimDetails.reward,
            claimed: true
          }
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during claiming");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-amber-500 selection:text-black flex flex-col justify-between py-12 px-4">
      
      <div className="max-w-md mx-auto w-full space-y-8 flex-1 flex flex-col justify-center">
        
        {/* Floating Utilities */}
        <div className="flex justify-end gap-2 -mb-4">
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              className="p-1 border border-zinc-850 rounded-lg hover:border-zinc-800 transition-all cursor-pointer bg-zinc-900"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </button>
          )}
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span 
            onClick={() => onNavigate("/")}
            className="text-2xl font-black text-amber-500 tracking-wider font-mono cursor-pointer select-none"
          >
            {t.brand}
          </span>
          <h1 className="text-xl font-extrabold text-white">
            {t.cashier_verification_title}
          </h1>
          <p className="text-xs text-zinc-500">
            {t.cashier_verification_subtitle}
          </p>
        </div>

        {/* Enter Code form */}
        <form onSubmit={handleVerifySubmit} className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl space-y-4 shadow-xl">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              {t.claim_code}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.g., W10935"
                className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm font-black font-mono tracking-widest text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-750 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span> : t.nav_landing}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-3xl bg-red-900/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loaded Claim Details Card */}
        {claimDetails && (
          <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-bold uppercase tracking-wider">
                  {claimDetails.reward.type === "lottery_win" ? t.type_lottery_win : t.type_stamp_reward}
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">
                  {lang === "en" ? claimDetails.business_name_en : claimDetails.business_name_ar}
                </h3>
              </div>
              <span className="text-sm font-mono font-black text-amber-500 bg-zinc-950 border border-zinc-850 px-3 py-1 rounded-xl">
                {claimDetails.reward.claim_code}
              </span>
            </div>

            <hr className="border-zinc-850" />

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">{lang === "en" ? "Customer Profile:" : "ملف العميل المستحق:"}</span>
                <span className="font-bold text-white">{claimDetails.customer_name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-zinc-500 shrink-0">{lang === "en" ? "Reward Earned:" : "الجائزة المستحقة:"}</span>
                <span className="font-bold text-amber-500 text-right">
                  {lang === "en" ? claimDetails.reward_name_en : claimDetails.reward_name_ar}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">{lang === "en" ? "Current Status:" : "حالة الكود الحالية:"}</span>
                {claimDetails.reward.claimed ? (
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t.stat_claimed}
                  </span>
                ) : (
                  <span className="font-bold text-amber-500 flex items-center gap-1 animate-pulse">
                    ● {t.stat_unclaimed}
                  </span>
                )}
              </div>
            </div>

            {/* Verification Success Celebration feedback */}
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 text-center space-y-1">
                <h4 className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t.verified_success_title}
                </h4>
                <p className="text-[10px] text-zinc-400">
                  {t.verified_success_desc
                    .replace("{name}", claimDetails.customer_name)
                    .replace("{reward}", lang === "en" ? claimDetails.reward_name_en : claimDetails.reward_name_ar)}
                </p>
              </div>
            )}

            {/* Verify PIN + Big Button */}
            {!claimDetails.reward.claimed && (
              <div className="pt-4 border-t border-zinc-850 space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 mb-1">
                    {t.cashier_pin_label}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder={lang === "en" ? "Cashier PIN" : "رمز الكاشير"}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleClaimReward}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-400 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> {t.mark_as_claimed}
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      <footer className="text-center text-zinc-700 text-[10px] mt-12 font-mono select-none">
        loya verification node
      </footer>
    </div>
  );
}
