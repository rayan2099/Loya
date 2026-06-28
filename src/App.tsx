import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from "react-router-dom";
import { Language, translations } from "./utils/translations";
import { Business, Owner } from "./types";
import LandingPage from "./components/LandingPage";
import AuthPages from "./components/AuthPages";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import CustomerPortal from "./components/CustomerPortal";
import ClaimVerification from "./components/ClaimVerification";
import LanguageToggle from "./components/LanguageToggle";
import { Menu, X, Sparkles, LogIn, ExternalLink, Sun, Moon } from "lucide-react";

// Wrap everything in a Router to utilize useNavigate and hook variables
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Bilingual state - English by default, Arabic RTL supported
  const [lang, setLang] = useState<Language>("en");

  // Theme state: dark by default, customizable
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("loya_theme") as "dark" | "light") || "dark";
  });

  // Sync theme with document class list
  useEffect(() => {
    localStorage.setItem("loya_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Auth session states
  const [token, setToken] = useState<string | null>(localStorage.getItem("loya_token"));
  const [owner, setOwner] = useState<Owner | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Mobile menu open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync HTML dir attribute for RTL/LTR layouts
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    
    // Set appropriate class for fonts
    if (lang === "ar") {
      document.documentElement.style.fontFamily = '"Tajawal", sans-serif';
    } else {
      document.documentElement.style.fontFamily = '"Inter", sans-serif';
    }
  }, [lang]);

  // Load authenticated session on mount
  const checkSession = async () => {
    const savedToken = localStorage.getItem("loya_token");
    if (!savedToken) {
      setSessionLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setToken(savedToken);
        setOwner(data.owner);
        setBusiness(data.business);
      } else {
        // Clear corrupt session
        localStorage.removeItem("loya_token");
        setToken(null);
      }
    } catch (err) {
      console.error("Session fetch failed:", err);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleAuthSuccess = (authToken: string, authOwner: Owner, authBusiness: Business) => {
    localStorage.setItem("loya_token", authToken);
    setToken(authToken);
    setOwner(authOwner);
    setBusiness(authBusiness);
  };

  const handleLogout = () => {
    localStorage.removeItem("loya_token");
    setToken(null);
    setOwner(null);
    setBusiness(null);
    navigate("/");
  };

  const handleUpdateBusiness = (updatedBusiness: Business) => {
    setBusiness(updatedBusiness);
  };

  // Helper inside client portal params
  const CustomerPortalWrapper = () => {
    const { slug } = useParams<{ slug: string }>();
    return (
      <CustomerPortal 
        lang={lang} 
        slugParam={slug || ""} 
        onLanguageToggle={setLang} 
        theme={theme}
        onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    );
  };

  // Helper inside cashier params
  const ClaimVerificationWrapper = () => {
    const { code } = useParams<{ code: string }>();
    return (
      <ClaimVerification 
        lang={lang} 
        codeParam={code || null} 
        onNavigate={navigate} 
        theme={theme}
        onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    );
  };

  // Check if current page is cashier or customer portal to hide general navbar
  const isSpecialView = location.pathname.startsWith("/b/") || location.pathname.startsWith("/claim/");

  const t = translations[lang];

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex flex-col justify-between">
      
      {/* Global Bilingual Public Navbar */}
      {!isSpecialView && (
        <nav className="bg-zinc-900 border-b border-zinc-850 sticky top-0 z-40 backdrop-blur bg-opacity-80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-base">
                L
              </div>
              <span className="text-base font-black text-white tracking-wider font-mono">
                {t.brand}
              </span>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/")} className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer">
                {t.nav_landing}
              </button>
              {token ? (
                <button onClick={() => navigate("/dashboard")} className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer">
                  {t.nav_dashboard}
                </button>
              ) : (
                <>
                  <button onClick={() => navigate("/login")} className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer">
                    {t.nav_login}
                  </button>
                  <button 
                    onClick={() => navigate("/register")} 
                    className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {t.cta_start}
                  </button>
                </>
              )}
              
              <LanguageToggle lang={lang} onChange={setLang} />

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-850 border border-white/5 transition-all cursor-pointer flex items-center justify-center bg-zinc-950"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-zinc-400" />
                )}
              </button>
            </div>

            {/* Mobile Nav Menu Toggler */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-850 border border-white/5 transition-all cursor-pointer flex items-center justify-center bg-zinc-950"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-zinc-400" />
                )}
              </button>
              <LanguageToggle lang={lang} onChange={setLang} />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-lg cursor-pointer"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 pt-2 pb-6 border-b border-zinc-850 bg-zinc-900 space-y-3">
              <button 
                onClick={() => { navigate("/"); setMobileMenuOpen(false); }} 
                className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
              >
                {t.nav_landing}
              </button>
              {token ? (
                <button 
                  onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} 
                  className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
                >
                  {t.nav_dashboard}
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} 
                    className="block w-full text-left py-2 text-sm text-zinc-300 hover:text-white"
                  >
                    {t.nav_login}
                  </button>
                  <button 
                    onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} 
                    className="w-full py-2.5 bg-amber-500 text-black text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {t.cta_start}
                  </button>
                </>
              )}
            </div>
          )}
        </nav>
      )}

      {/* Primary Routes view */}
      <div className="flex-1">
        {sessionLoading ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 bg-zinc-950">
            <span className="border-4 border-amber-500 border-t-transparent rounded-full w-10 h-10 animate-spin"></span>
            <p className="text-zinc-500 text-xs">Authenticating user session...</p>
          </div>
        ) : (
          <Routes>
            {/* Landing */}
            <Route path="/" element={<LandingPage lang={lang} onNavigate={navigate} />} />

            {/* Auth routes with guards */}
            <Route 
              path="/login" 
              element={token ? <Navigate to="/dashboard" replace /> : <AuthPages lang={lang} mode="login" onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />} 
            />
            <Route 
              path="/register" 
              element={token ? <Navigate to="/dashboard" replace /> : <AuthPages lang={lang} mode="register" onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />} 
            />

            {/* Private Onboarding step */}
            <Route 
              path="/onboarding" 
              element={
                token && business ? (
                  <Onboarding 
                    lang={lang} 
                    token={token} 
                    initialBusiness={business} 
                    onNavigate={navigate} 
                    onUpdateBusiness={handleUpdateBusiness} 
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Private Dashboard console */}
            <Route 
              path="/dashboard" 
              element={
                token && business ? (
                  <Dashboard 
                    lang={lang} 
                    token={token} 
                    business={business} 
                    onNavigate={navigate} 
                    onLogout={handleLogout} 
                    onUpdateBusiness={handleUpdateBusiness} 
                  />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Customer public qr scanning route /b/[slug] */}
            <Route path="/b/:slug" element={<CustomerPortalWrapper />} />

            {/* Cashier public verified claim route /claim/[code] */}
            <Route path="/claim/:code" element={<ClaimVerificationWrapper />} />

            {/* Default Catch-All redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
