import { useState, useEffect, FormEvent } from "react";
import { Language, translations } from "../utils/translations";
import { Business, Customer, Reward } from "../types";
import { Coffee, Phone, User, Award, Share2, Wallet, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Sun, Moon } from "lucide-react";
import Confetti from "./Confetti";

interface CustomerPortalProps {
  lang: Language;
  slugParam: string;
  onLanguageToggle: (lang: Language) => void;
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
}

export default function CustomerPortal({ lang, slugParam, onLanguageToggle, theme = "dark", onThemeToggle }: CustomerPortalProps) {
  const t = translations[lang];

  // Business state loaded from slug
  const [business, setBusiness] = useState<Business | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  
  // Interactive wizard states
  const [step, setStep] = useState<"details" | "spinning" | "result">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Lottery outcome states
  const [spinResult, setSpinResult] = useState<{
    wonLottery: boolean;
    wonStampReward: boolean;
    rewards: Reward[];
    currentStamps: number;
    stampsRequired: number;
  } | null>(null);

  // Wheel animation states
  const [wheelRotation, setWheelRotation] = useState(0);
  const [addedWallet, setAddedWallet] = useState(false);

  // Load business parameters based on slug URL
  const fetchBusiness = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/business/${slugParam}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to load business details");
      }
      setBusiness(data);

      // Recognize customer from local storage
      const savedPhone = localStorage.getItem(`loya_phone_${data.id}`);
      const savedName = localStorage.getItem(`loya_name_${data.id}`);
      
      if (savedPhone && savedName) {
        setPhone(savedPhone);
        setName(savedName);
      }
    } catch (err: any) {
      setError(err.message || "Business could not be verified.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slugParam) {
      fetchBusiness();
    }
  }, [slugParam]);

  const handleStartSpin = async (e: FormEvent) => {
    e.preventDefault();
    if (!business) return;

    if (!name.trim() || !phone.trim()) {
      setError(lang === "en" ? "Name and phone are required." : "يرجى كتابة الاسم ورقم الجوال.");
      return;
    }

    setStep("spinning");
    setError("");

    // Start rotation animation (constant spinning)
    let rotation = 0;
    const interval = setInterval(() => {
      rotation += 45;
      setWheelRotation(rotation);
    }, 50);

    try {
      // Execute authoritative roll from server
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: business.id,
          phone: phone.trim(),
          name: name.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Scan request failed.");
      }

      // Save credentials for subsequent return visits
      localStorage.setItem(`loya_phone_${business.id}`, phone.trim());
      localStorage.setItem(`loya_name_${business.id}`, name.trim());

      // Slow down animation and show results after 3 seconds of suspense
      setTimeout(() => {
        clearInterval(interval);
        setWheelRotation(rotation + 1440 + (data.wonLottery ? 45 : 180)); // finish rotation beautifully
        
        setSpinResult({
          wonLottery: data.wonLottery,
          wonStampReward: data.wonStampReward,
          rewards: data.rewards,
          currentStamps: data.currentStamps,
          stampsRequired: data.stampsRequired
        });
        setCustomer(data.customer);
        setStep("result");
      }, 2500);

    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Verification failed");
      setStep("details");
    }
  };

  const handleSimulateWallet = () => {
    setAddedWallet(true);
    setTimeout(() => {
      setAddedWallet(false);
      alert(t.added_to_wallet);
    }, 1500);
  };

  const handleShare = () => {
    if (!business) return;
    const shareUrl = `${window.location.origin}/b/${business.slug}`;
    const formattedText = t.share_text
      .replace("{business}", lang === "en" ? business.name_en : business.name_ar)
      .replace("{url}", shareUrl);
    
    const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;
    window.open(whatsappLink, "_blank");
  };

  // Loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <span className="border-4 border-amber-500 border-t-transparent rounded-full w-10 h-10 animate-spin mb-4"></span>
        <p className="text-zinc-500 text-xs">Loading brand details...</p>
      </div>
    );
  }

  // Error verified state
  if (error && !business) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">Error / خطأ</h2>
        <p className="text-zinc-400 text-xs mb-6 max-w-xs">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  if (!business) return null;

  // Custom theme shorthand colors
  const brandPrimary = business.primary_color || "#D4AF37";
  const brandSecondary = business.secondary_color || "#E5C354";

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex flex-col justify-between py-6 px-4 selection:bg-amber-500 selection:text-black">
      
      {/* Confetti triggered on winning lottery */}
      {step === "result" && spinResult?.wonLottery && <Confetti />}

      {/* Bilingual Toggle floating header */}
      <header className="flex justify-between items-center max-w-sm mx-auto w-full mb-6">
        <span className="text-xs font-black tracking-wider text-zinc-500 uppercase font-mono">
          Powered by Loya
        </span>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => onLanguageToggle(lang === "en" ? "ar" : "en")}
            className="text-[10px] px-2.5 py-1 border border-zinc-850 rounded-lg hover:border-zinc-800 transition-all font-semibold cursor-pointer text-zinc-400 bg-zinc-900"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </header>

      {/* Main Container Core */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full space-y-6">
        
        {/* Business Header block */}
        <div className="text-center space-y-2 mb-2">
          <img
            src={business.logo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80"}
            alt={business.name_en}
            className="w-16 h-16 rounded-full mx-auto border-2 object-cover shadow-lg"
            style={{ borderColor: brandPrimary }}
          />
          <h1 className="text-xl font-black text-white">
            {lang === "en" ? business.name_en : business.name_ar}
          </h1>
          <p className="text-[10px] text-zinc-400 max-w-[220px] mx-auto">
            {lang === "en" ? business.reward_en : business.reward_ar}
          </p>
        </div>

        {/* STEP 1: Details input */}
        {step === "details" && (
          <form onSubmit={handleStartSpin} className="w-full bg-zinc-900 border border-zinc-850 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold text-center text-white">
              {t.cust_enter_details}
            </h3>

            {error && (
              <p className="text-[10px] text-red-400 text-center bg-red-900/10 border border-red-500/20 py-2 rounded-xl">
                {error}
              </p>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1">{t.cust_full_name}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.cust_name_placeholder}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1">{t.cust_phone_label}</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.cust_phone_placeholder}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-black text-xs text-white cursor-pointer hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: brandPrimary }}
            >
              🎰 {t.cust_submit_spin}
            </button>
          </form>
        )}

        {/* STEP 2: Spinning wheel animation */}
        {step === "spinning" && (
          <div className="w-full bg-zinc-900 border border-zinc-850 p-8 rounded-3xl text-center space-y-6 flex flex-col items-center">
            
            {/* Spinning Wheel CSS Art */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Spinning outer dotted border */}
              <div 
                className="absolute inset-0 rounded-full border-8 border-dashed transition-transform ease-out duration-300"
                style={{ 
                  transform: `rotate(${wheelRotation}deg)`, 
                  borderColor: brandSecondary,
                  boxShadow: `0 0 30px ${brandPrimary}25`
                }}
              ></div>

              {/* Wheel Center */}
              <div 
                className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-3 relative shadow-2xl bg-zinc-950"
                style={{ border: `4px solid ${brandPrimary}` }}
              >
                <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mb-1.5" />
                <span className="text-[10px] font-black tracking-wider uppercase">
                  {lang === "en" ? "Rolling" : "جاري السحب"}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 animate-pulse font-medium">
              ✨ {t.spin_suspense}
            </p>
          </div>
        )}

        {/* STEP 3: Outcome results and loyalty progress stamps */}
        {step === "result" && spinResult && (
          <div className="w-full space-y-5 animate-fadeIn">
            
            {/* S1: LOTTERY WIN OR LOSE DISPLAY */}
            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl text-center space-y-4 shadow-xl relative overflow-hidden">
              {spinResult.wonLottery ? (
                <>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Award className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-black text-emerald-400">
                    {t.spin_celebrate_win}
                  </h2>
                  <p className="text-zinc-300 text-xs font-bold leading-relaxed">
                    {lang === "en" ? business.reward_en : business.reward_ar}
                  </p>
                  
                  {/* Claim code display block */}
                  <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{t.claim_code_title}</span>
                    <h4 className="text-xl font-black font-mono text-amber-500 tracking-wider">
                      {spinResult.rewards.find(r => r.type === 'lottery_win')?.claim_code}
                    </h4>
                  </div>

                  <p className="text-[9px] text-zinc-500 leading-relaxed">
                    {t.spin_win_sub}
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                    ☕
                  </div>
                  <h2 className="text-lg font-extrabold text-zinc-300">
                    {t.spin_lose}
                  </h2>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                    {t.spin_lose_sub}
                  </p>
                </>
              )}

              {/* Show Stamp Card won directly if wonStampReward */}
              {spinResult.wonStampReward && (
                <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">Stamp Reward Earned! ☕</span>
                  <p className="text-xs text-zinc-200 font-bold">Free Loyalty Reward unlocked! Code:</p>
                  <h5 className="text-lg font-black font-mono text-amber-500 tracking-wider">
                    {spinResult.rewards.find(r => r.type === 'stamp_reward')?.claim_code}
                  </h5>
                </div>
              )}
            </div>

            {/* S2: THE STAMP CARD DISPLAY */}
            <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl text-center space-y-4 shadow-xl">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">
                {t.stamps_collected}
              </span>

              {/* Stamps visual list */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 justify-center py-2">
                {Array.from({ length: spinResult.stampsRequired }).map((_, idx) => {
                  const isActive = idx < spinResult.currentStamps;
                  return (
                    <div
                      key={idx}
                      className="aspect-square rounded-2xl border-2 flex items-center justify-center font-bold text-xs relative overflow-hidden transition-all"
                      style={{
                        backgroundColor: isActive ? brandPrimary : "rgba(24,24,27,0.7)",
                        borderColor: isActive ? brandPrimary : "#27272a",
                        color: isActive ? "#ffffff" : "#3f3f46"
                      }}
                    >
                      {isActive ? (
                        <span className="text-base animate-pulse">☕</span>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {spinResult.currentStamps === 0 ? (
                <p className="text-[10px] text-emerald-400 font-bold">
                  {lang === "en" ? "Loyalty stamps completed! You got a grand prize!" : "اكتملت أختام الولاء وحصلت على هدية كبرى! 🎉"}
                </p>
              ) : (
                <p className="text-[10px] text-zinc-400">
                  {spinResult.stampsRequired - spinResult.currentStamps} {t.stamps_remaining}
                </p>
              )}

              {/* Save to Apple/Google Wallets */}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={handleSimulateWallet}
                  className="py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-[10px] font-bold border border-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{t.save_to_apple}</span>
                </button>
                <button
                  onClick={handleSimulateWallet}
                  className="py-2.5 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl text-[10px] font-bold border border-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{t.save_to_google}</span>
                </button>
              </div>

              {/* Social sharing */}
              <button
                onClick={handleShare}
                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-amber-500 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{t.share_btn}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Small footer brand */}
      <footer className="max-w-sm mx-auto w-full text-center text-zinc-600 text-[10px] mt-6 select-none font-mono">
        loya © 2026. All rights reserved.
      </footer>
    </div>
  );
}
