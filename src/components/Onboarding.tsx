import { useState, useEffect } from "react";
import { Language, translations } from "../utils/translations";
import { Business, BusinessType } from "../types";
import { ChevronLeft, ChevronRight, Check, Award, Sliders, Palette, ShoppingBag, Info, ExternalLink } from "lucide-react";

interface OnboardingProps {
  lang: Language;
  token: string;
  initialBusiness: Business;
  onNavigate: (route: string) => void;
  onUpdateBusiness: (business: Business) => void;
}

export default function Onboarding({ lang, token, initialBusiness, onNavigate, onUpdateBusiness }: OnboardingProps) {
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Business fields
  const [nameAr, setNameAr] = useState(initialBusiness?.name_ar || "");
  const [nameEn, setNameEn] = useState(initialBusiness?.name_en || "");
  const [slug, setSlug] = useState(initialBusiness?.slug || "");
  const [logoUrl, setLogoUrl] = useState(initialBusiness?.logo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80");
  const [primaryColor, setPrimaryColor] = useState(initialBusiness?.primary_color || "#D4AF37");
  const [secondaryColor, setSecondaryColor] = useState(initialBusiness?.secondary_color || "#E5C354");
  const [winProb, setWinProb] = useState(initialBusiness?.win_probability || 20);
  const [stampsRequired, setStampsRequired] = useState(initialBusiness?.stamps_required || 5);
  const [rewardAr, setRewardAr] = useState(initialBusiness?.reward_ar || "");
  const [rewardEn, setRewardEn] = useState(initialBusiness?.reward_en || "");

  // Presets for gorgeous brand coloring
  const colorPresets = [
    { name: "Saffron Gold", primary: "#1a1a1a", secondary: "#D4AF37" },
    { name: "Boiler Espresso", primary: "#4A2C11", secondary: "#D97706" },
    { name: "Royal Lavender", primary: "#7C3AED", secondary: "#F59E0B" },
    { name: "Matcha Mint", primary: "#065F46", secondary: "#34D399" },
    { name: "Coral Rose", primary: "#BE123C", secondary: "#FDA4AF" },
  ];

  // Auto update slug based on English Name on load
  useEffect(() => {
    if (!slug && nameEn) {
      const generated = nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [nameEn]);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!nameAr || !nameEn || !slug) {
        setError(lang === "en" ? "Please fill in all details." : "يرجى ملء جميع البيانات.");
        return;
      }
    }
    if (step === 3) {
      if (!rewardAr || !rewardEn) {
        setError(lang === "en" ? "Please set your instant reward description." : "يرجى تحديد وصف المكافأة الفورية.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    const updatePayload = {
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
      is_active: true
    };

    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save onboarding settings");
      }

      onUpdateBusiness(data);
      onNavigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-amber-500 selection:text-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Step progress bar */}
        <div className="mb-10 text-center">
          <span className="text-2xl font-black text-amber-500 tracking-wider font-mono">
            {t.brand}
          </span>
          <h1 className="text-xl font-bold mt-2">{t.onboarding_title}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {t.onboarding_step} {step} {t.of} 5
          </p>

          <div className="flex items-center justify-center gap-1.5 mt-5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300
                  ${step >= s ? "bg-amber-500" : "bg-zinc-800"}
                  ${step === s ? "w-8" : "w-4"}
                `}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <Info className="h-4 w-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body + Interactive Preview split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-850 p-6 sm:p-8 rounded-3xl shadow-xl">
            
            {/* Step 1: Business details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-amber-500" /> {t.step_details_title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.step_details_desc}</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_name_ar}</label>
                  <input
                    type="text"
                    required
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    dir="rtl"
                    placeholder="رقم ١٥ كافيه"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.biz_name_en}</label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="No.15 Cafe"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.slug_label}</label>
                  <div className="flex">
                    <span className="bg-zinc-950 border-y border-l border-zinc-800 rounded-l-xl px-3 py-2.5 text-zinc-500 text-xs flex items-center select-none">
                      loya.sa/b/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="no15-cafe"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-r-xl py-2.5 px-3 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">{t.slug_hint}</p>
                </div>
              </div>
            )}

            {/* Step 2: Branding */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-amber-500" /> {t.step_branding_title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.step_branding_desc}</p>
                </div>

                {/* Logo Link Option */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.logo_label} (URL)</label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none transition-all font-mono"
                  />
                  {/* Preset Quick Logos */}
                  <div className="flex gap-2 mt-2">
                    {[
                      { icon: "☕", name: "Cafe Logo", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80" },
                      { icon: "🍔", name: "Diner Logo", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop&q=80" },
                      { icon: "🛍️", name: "Retail Logo", url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&h=150&fit=crop&q=80" },
                    ].map((logoPreset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLogoUrl(logoPreset.url)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all
                          ${logoUrl === logoPreset.url ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-zinc-950 border-zinc-850 text-zinc-400"}`}
                      >
                        <span>{logoPreset.icon}</span>
                        <span>{logoPreset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Schemes Preset */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    {lang === "en" ? "Theme Presets" : "مجموعات الألوان الجاهزة"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setSecondaryColor(preset.secondary);
                        }}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-300 flex items-center justify-between cursor-pointer hover:border-zinc-700"
                      >
                        <span>{preset.name}</span>
                        <div className="flex gap-1">
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-800" style={{ backgroundColor: preset.primary }}></span>
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-800" style={{ backgroundColor: preset.secondary }}></span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.primary_color_label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs p-1.5 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.secondary_color_label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs p-1.5 font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Lottery Setting */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" /> {t.step_lottery_title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.step_lottery_desc}</p>
                </div>

                {/* Odds slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-zinc-400">{t.odds_label}</span>
                    <span className="text-amber-500 font-bold text-sm">{winProb}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={winProb}
                    onChange={(e) => setWinProb(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-950 rounded-lg"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {winProb}% {t.odds_hint}
                  </p>
                </div>

                <hr className="border-zinc-850" />

                {/* Instant Reward AR + EN */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.reward_ar_label}</label>
                  <input
                    type="text"
                    required
                    value={rewardAr}
                    onChange={(e) => setRewardAr(e.target.value)}
                    dir="rtl"
                    placeholder={t.reward_placeholder_ar}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">{t.reward_en_label}</label>
                  <input
                    type="text"
                    required
                    value={rewardEn}
                    onChange={(e) => setRewardEn(e.target.value)}
                    placeholder={t.reward_placeholder_en}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Stamp card settings */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-amber-500" /> {t.step_stamps_title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.step_stamps_desc}</p>
                </div>

                {/* Stamps required */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">
                    {t.stamps_req_label}
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[3, 5, 8, 10, 12].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStampsRequired(st)}
                        className={`py-3 rounded-xl border font-bold text-sm cursor-pointer transition-all
                          ${stampsRequired === st
                            ? "bg-amber-500 text-black border-amber-500"
                            : "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400"}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    {stampsRequired} {t.stamps_req_hint}
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Review and publish */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-500" /> {t.step_preview_title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">{t.step_preview_desc}</p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3 text-xs text-zinc-300">
                  <div className="flex justify-between border-b border-zinc-850 pb-2">
                    <span className="text-zinc-500">{lang === "en" ? "Name AR / EN" : "الاسم عربي / انجليزي"}</span>
                    <span className="font-semibold">{nameAr} / {nameEn}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-850 pb-2">
                    <span className="text-zinc-500">{lang === "en" ? "QR Link slug" : "رابط الـ QR"}</span>
                    <span className="font-mono font-semibold text-amber-500">/b/{slug}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-850 pb-2">
                    <span className="text-zinc-500">{t.odds_label}</span>
                    <span className="font-semibold">{winProb}%</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-850 pb-2">
                    <span className="text-zinc-500">{t.reward_en_label}</span>
                    <span className="font-semibold">{rewardEn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{lang === "en" ? "Stamps criteria" : "عدد الأختام المطلوب"}</span>
                    <span className="font-semibold">{stampsRequired} {lang === "en" ? "stamps" : "أختام"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-850">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" /> {t.back}
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  {t.next} <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                >
                  {loading ? (
                    <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" /> {t.complete_onboarding}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Phone Mock Preview on Desktop */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-xs text-zinc-500 mb-3 block text-center font-medium">
              📱 {t.preview_client_mode}
            </span>
            
            {/* Phone Body Container */}
            <div className="w-[280px] h-[520px] rounded-[36px] border-8 border-zinc-800 bg-zinc-950 relative overflow-hidden shadow-2xl flex flex-col justify-between">
              
              {/* Phone Camera Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-full z-20"></div>

              {/* Client view content simulated */}
              <div className="p-4 flex flex-col items-center text-center mt-6 flex-1 justify-between py-6">
                
                {/* Logo and Brand Title */}
                <div className="space-y-2 mt-4">
                  <img
                    src={logoUrl || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80"}
                    alt="Logo"
                    className="w-12 h-12 rounded-full border-2 mx-auto object-cover"
                    style={{ borderColor: primaryColor }}
                  />
                  <h3 className="text-sm font-extrabold text-white">
                    {lang === "en" ? (nameEn || "My Business") : (nameAr || "منشأتي")}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {t.cust_welcome_to} {lang === "en" ? (nameEn || "My Business") : (nameAr || "منشأتي")}
                  </p>
                </div>

                {/* Animated Spin Wheel Mock */}
                <div className="relative w-28 h-28 my-4">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-dashed animate-spin flex items-center justify-center opacity-70"
                    style={{ borderColor: secondaryColor }}
                  ></div>
                  <div
                    className="absolute inset-2 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg bg-zinc-900"
                    style={{ border: `2px solid ${primaryColor}` }}
                  >
                    🎰 SPIN ME
                  </div>
                </div>

                {/* Stamp Card Simulated */}
                <div className="w-full bg-zinc-900 border border-zinc-850 p-3 rounded-2xl">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                    {t.stamps_collected}
                  </p>
                  <div className="flex gap-1.5 justify-center mb-1">
                    {Array.from({ length: stampsRequired }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border flex items-center justify-center text-[8px] transition-all"
                        style={{
                          backgroundColor: i < 2 ? primaryColor : "transparent",
                          borderColor: i < 2 ? primaryColor : "#3f3f46",
                          color: i < 2 ? "#fff" : "#52525b"
                        }}
                      >
                        {i < 2 ? "☕" : i + 1}
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-zinc-400 mt-1">
                    {stampsRequired - 2} {t.stamps_remaining}
                  </p>
                </div>

                <div className="w-full">
                  <button
                    type="button"
                    className="w-full py-1.5 rounded-xl text-[9px] font-bold text-center text-white cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t.cust_submit_spin}
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
