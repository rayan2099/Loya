# QA Verification Report — Phase 3: Card Creation Wizard & Live Design Preview

| DoD Criterion | Status | Verification Notes |
|---|---|---|
| 5-Step Loyalty Card Creation Wizard structure | ✅ PASSED | Reconciled Loya 5 steps: `١. المعلومات`, `٢. النقاط`, `٣. التصميم`, `٤. المكافآت`, `٥. الأمان`. |
| Step 1: Info & AI Free Design Promo button | ✅ PASSED | Verified card name, description, back-of-card links (Phone, Google Maps, Instagram, Custom Note), and promotional AI design button (`نصمم لك البطاقة مجاناً! 🎨✨`). |
| Step 2: Points engine & rules selection | ✅ PASSED | Verified 4 rule toggles (`نقطة/ريال`, `اشترى ٥ طوابع`, `نقطة/زيارة`, `إضافة يدوية`), points ratio, stamp targets, and expiry selector (`never`, `90_days`, `6_months`, `1_year`, `2_years`). |
| Step 3: Color swatches & Banner customization | ✅ PASSED | Verified 8 bilingual color swatches (`#FF6B35`, `#3B82F6`, etc.), custom HEX input, text color toggle (`#FFFFFF`/`#000000`), and banner title & subtext fields. |
| Step 4: Rewards method & win probability slider | ✅ PASSED | Verified 3-way toggle (`حظ فوري 🎲`, `تجميع النقاط/الأختام 🏆`, `كلاهما معاً ⭐`), win probability slider (`0-100%` default `10%`), instant gift AR/EN names, and editable quick-add cashier buttons (`50+`/`25+`/`10+`). |
| Step 5: Security controls & launch checklist | ✅ PASSED | Verified Cashier PIN protection toggle, rate limiting display (`60s duplicate scan block`), and launch readiness checklist (`🚀 حفظ وإطلاق البطاقة`). |
| Standalone Card Design Editor (Section F) | ✅ PASSED | Verified dedicated `CardDesignEditorModal.tsx` launched via `التصميم` card button with Apple & Google Wallet live preview and single `حفظ التصميم 💾` action. |
