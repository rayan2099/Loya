import { Language, translations } from "../utils/translations";
import { Sparkles, QrCode, Smartphone, Coins, Languages, Flame, Users, Check, ExternalLink } from "lucide-react";

interface LandingPageProps {
  lang: Language;
  onNavigate: (route: string) => void;
}

export default function LandingPage({ lang, onNavigate }: LandingPageProps) {
  const t = translations[lang];

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
      title: t.feat1_title,
      desc: t.feat1_desc,
    },
    {
      icon: <Smartphone className="h-6 w-6 text-purple-500" />,
      title: t.feat2_title,
      desc: t.feat2_desc,
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: t.feat3_title,
      desc: t.feat3_desc,
    },
    {
      icon: <Flame className="h-6 w-6 text-amber-500" />,
      title: t.feat4_title,
      desc: t.feat4_desc,
    },
    {
      icon: <QrCode className="h-6 w-6 text-green-500" />,
      title: t.feat5_title,
      desc: t.feat5_desc,
    },
    {
      icon: <Languages className="h-6 w-6 text-pink-500" />,
      title: t.feat6_title,
      desc: t.feat6_desc,
    },
  ];

  return (
    <div className="bg-zinc-950 text-white min-h-screen selection:bg-amber-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.05),transparent_50%)]"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Action Copy and Stats */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                  {lang === "en" ? "Now in Beta — v1.0.4" : "متاح الآن في المرحلة التجريبية"}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {lang === "en" ? (
                  <>
                    Turn every purchase into a{" "}
                    <br />
                    <span className="text-amber-500">
                      winning moment
                    </span>
                  </>
                ) : (
                  <>
                    حوّل كل عملية شراء إلى{" "}
                    <br />
                    <span className="text-amber-500 font-bold">
                      لحظة فوز وتفاعل
                    </span>
                  </>
                )}
              </h1>

              <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t.hero_subtitle}
              </p>

              {/* Elegant design stats grid */}
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0 pt-2">
                <div className="p-4 bg-zinc-900 rounded-xl border border-white/5 text-center lg:text-left rtl:lg:text-right">
                  <div className="text-amber-500 font-mono text-xl mb-1 font-extrabold">1.2k+</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    {lang === "en" ? "Active Businesses" : "المنشآت النشطة"}
                  </div>
                </div>
                <div className="p-4 bg-zinc-900 rounded-xl border border-white/5 text-center lg:text-left rtl:lg:text-right">
                  <div className="text-emerald-500 font-mono text-xl mb-1 font-extrabold">482k</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    {lang === "en" ? "Rewards Claimed" : "المكافآت المستلمة"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
                <button
                  onClick={() => onNavigate("/register")}
                  id="hero-cta-register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {t.cta_start}
                </button>
                <button
                  onClick={() => onNavigate("/login")}
                  id="hero-cta-login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold bg-zinc-900 border border-white/10 text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {t.cta_login}
                </button>
              </div>

              {/* Simulated Live Scan Indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/5 backdrop-blur text-xs text-white/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>
                  {lang === "en" ? (
                    <>
                      Active demo: <span className="font-mono text-zinc-300 font-semibold">demo@loya.sa</span> (password: <span className="font-mono text-zinc-300 font-semibold">password123</span>)
                    </>
                  ) : (
                    <>
                      بيانات تجربة: <span className="font-mono text-zinc-300 font-semibold">demo@loya.sa</span> (كلمة السر: <span className="font-mono text-zinc-300 font-semibold">password123</span>)
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Right Column: Stunning Mock Phone Frame */}
            <div className="lg:col-span-5 hidden lg:flex justify-center relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full"></div>
              </div>

              {/* iPhone Mock Device */}
              <div className="w-[300px] h-[550px] bg-[#151515] rounded-[42px] border-[6px] border-[#252525] relative shadow-2xl overflow-hidden flex flex-col z-10 select-none">
                {/* Device Camera Notch */}
                <div className="h-5 w-28 bg-[#252525] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>

                {/* Simulated Screen */}
                <div className="p-5 pt-10 flex-1 flex flex-col justify-between text-left">
                  
                  {/* Business Brand Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1">
                      <div className="w-full h-full bg-zinc-950 rounded-md flex items-center justify-center text-amber-500 font-black text-xs">B</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Boiler Coffee</div>
                      <div className="text-[10px] font-bold text-white">Riyadh, KSA</div>
                    </div>
                  </div>

                  {/* Lottery Win Outcome Block */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-5 rounded-2xl border border-amber-500/30 text-center mb-5">
                    <div className="text-[9px] uppercase text-amber-500 tracking-[0.2em] font-black mb-1.5 animate-pulse">
                      {lang === "en" ? "You're a Winner!" : "لقد ربحت معنا! 🎉"}
                    </div>
                    <div className="text-xl font-black mb-3 text-white">
                      {lang === "en" ? "Free Espresso" : "كوب إسبريسو مجاني"}
                    </div>
                    <div className="bg-zinc-950/80 py-2.5 rounded-lg border border-dashed border-white/20 font-mono text-base tracking-widest text-amber-500 font-bold">
                      X4B7R9
                    </div>
                  </div>

                  {/* Stamp Card Progress Visualizer */}
                  <div className="space-y-3 mb-5">
                    <div className="text-[10px] font-bold flex justify-between uppercase tracking-wider text-white/70">
                      <span>{lang === "en" ? "Stamp Card Progress" : "مستوى بطاقة الأختام"}</span>
                      <span className="text-amber-500">4 / 5 {lang === "en" ? "Stamps" : "أختام"}</span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1.5">
                      <div className="aspect-square rounded-full bg-amber-500 flex items-center justify-center text-black font-extrabold text-[10px]">✓</div>
                      <div className="aspect-square rounded-full bg-amber-500 flex items-center justify-center text-black font-extrabold text-[10px]">✓</div>
                      <div className="aspect-square rounded-full bg-amber-500 flex items-center justify-center text-black font-extrabold text-[10px]">✓</div>
                      <div className="aspect-square rounded-full bg-amber-500 flex items-center justify-center text-black font-extrabold text-[10px]">✓</div>
                      <div className="aspect-square rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20 text-[9px] font-bold">5</div>
                    </div>
                    
                    <p className="text-[8px] text-white/40 text-center">
                      {lang === "en" ? "One more scan for your free specialty drink!" : "مسح إضافي واحد للحصول على مشروب مجاني!"}
                    </p>
                  </div>

                  {/* Device Bottom Button Stack */}
                  <div className="mt-auto space-y-2">
                    <button className="w-full bg-white text-black py-2.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-white/90">
                      <span> {lang === "en" ? "Add to Apple Wallet" : "إضافة للمحفظة"}</span>
                    </button>
                    <button className="w-full bg-zinc-850 text-white/80 py-2.5 rounded-xl text-[10px] font-bold hover:bg-zinc-800">
                      {lang === "en" ? "Share with Friends" : "مشاركة مع الأصدقاء"}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-zinc-900/40 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.how_it_works}
            </h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/80 border border-zinc-850 p-8 rounded-2xl relative group hover:border-zinc-700 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t.step1_title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.step1_desc}
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-850 p-8 rounded-2xl relative group hover:border-zinc-700 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t.step2_title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.step2_desc}
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-850 p-8 rounded-2xl relative group hover:border-zinc-700 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {t.step3_title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {t.step3_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              {t.features_title}
            </h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-850 hover:border-zinc-800 hover:bg-zinc-900 transition-all group"
              >
                <div className="p-3 bg-zinc-950 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-zinc-900/30 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              {t.pricing_title}
            </h2>
            <p className="text-zinc-400 text-sm mt-3">{t.price_billed}</p>
            <div className="h-1 w-20 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-zinc-900/80 border border-zinc-850 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-250">
              <div>
                <h3 className="text-xl font-bold text-zinc-300">{t.plan_starter_name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white">{t.plan_starter_price}</span>
                  <span className="text-zinc-500 text-sm ml-2 mr-2">/ month</span>
                </div>
                <hr className="border-zinc-850 my-6" />
                <ul className="space-y-4">
                  {t.plan_starter_features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-zinc-400 gap-2.5">
                      <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onNavigate("/register")}
                className="mt-8 w-full py-3 rounded-xl font-bold bg-zinc-800 text-white hover:bg-zinc-750 transition-all cursor-pointer"
              >
                {t.cta_start}
              </button>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500 p-8 rounded-2xl flex flex-col justify-between shadow-2xl shadow-amber-500/5 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-extrabold text-[10px] uppercase tracking-widest px-4 py-1 rounded-full">
                Most Popular / الأكثر شعبية
              </span>
              <div>
                <h3 className="text-xl font-bold text-amber-500">{t.plan_growth_name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white">{t.plan_growth_price}</span>
                  <span className="text-zinc-500 text-sm ml-2 mr-2">/ month</span>
                </div>
                <hr className="border-zinc-800 my-6" />
                <ul className="space-y-4">
                  {t.plan_growth_features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-zinc-300 gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onNavigate("/register")}
                className="mt-8 w-full py-3 rounded-xl font-bold bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
              >
                {t.cta_start}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-zinc-900/80 border border-zinc-850 p-8 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-250">
              <div>
                <h3 className="text-xl font-bold text-zinc-400">{t.plan_enterprise_name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-black text-white">{t.plan_enterprise_price}</span>
                </div>
                <hr className="border-zinc-850 my-6" />
                <ul className="space-y-4">
                  {t.plan_enterprise_features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-zinc-400 gap-2.5">
                      <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onNavigate("/register")}
                className="mt-8 w-full py-3 rounded-xl font-bold bg-zinc-800 text-white hover:bg-zinc-750 transition-all cursor-pointer"
              >
                {lang === "en" ? "Contact Sales" : "تواصل معنا"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950 text-center text-zinc-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-4">{t.footer_text}</p>
          <div className="flex justify-center gap-6 text-zinc-600">
            <a href="#" className="hover:text-amber-500">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-amber-500">Terms of Service</a>
            <span>•</span>
            <button onClick={() => onNavigate("/claim/W10935")} className="hover:text-amber-500 underline flex items-center gap-1">
              Verify Claim Demo <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
