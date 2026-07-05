# Loya / Niqati Clone Implementation Milestone Checklist

## Phase 1: Foundation (i18n setup, Data Model, Auth & Join-code)
- [x] **Task 1.1: Comprehensive Bilingual & RTL Support (Section 0)**
  - DoD: Full Arabic (RTL) & English (LTR) layout mirroring. Arabic-indic numerals (٠١٢٣٤٥٦٧٨٩) when `lang === 'ar'`. Store bilingual data pairs (`AR/EN`) for store name, gifts, and notification templates.
- [x] **Task 1.2: Store Profile & Auth Flows (Section B)**
  - DoD: Signup screen with store name, business categories (13 confirmed chips), email, phone, password. Login screen with email/phone + password and "Forgot password?". Add "الانضمام إلى منشأة" (Join an establishment) entry point and modal/screen for staff joining with code.
- [x] **Task 1.3: Splash Screen & Notification Modal (Section B)**
  - DoD: Splash screen with logo, wordmark "نقاطي / Loya", tagline, Vision 2030 lockup. Notification permission modal after signup.

## Phase 2: Onboarding & Smooth UI Polish (Section A)
- [x] **Task 2.1: Polish Pre-auth Onboarding Carousel (5 Slides)**
  - DoD: Ensure smooth intuitive onboarding with skip button ("تخطى"), segmented progress bar, 4 card types, Apple/Google wallet preview, scanner simulation, staff list preview, and analytics preview with real day labels (fix "الـ" truncation bug).

## Phase 3: Card Creation Wizard & Live Design Preview (Sections D & F)
- [x] **Task 3.1: 5-Step Loyalty Card Creation Wizard**
  - DoD: Info step (name, description, back links, AI design request option), Points step (rules, points per riyal/visit, expiry), Design step (colors, banner, live preview), Rewards step (instant win probability, stamp buy-5 rules, gifts AR/EN), and Security/Launch steps.
- [x] **Task 3.2: Standalone Card Design Editor (Section F)**
  - DoD: Dedicated screen/modal to edit existing card design with live preview and "Save Design" action.

## Phase 4: Dashboard, Card Details & Wallet Share (Sections C, E, G)
- [x] **Task 4.1: Main Dashboard ("الرئيسية") Polish**
  - DoD: Time-aware greeting, 4 stat tiles (+new, active, points, customers), quick actions, swipeable loyalty card carousel, RTL/LTR bottom nav.
- [x] **Task 4.2: Card Details & Management (Section E)**
  - DoD: Rules recap, promotional A4 flyer preview generator, and danger zone (permanent deletion with warning).
- [x] **Task 4.3: Wallet Link & Share Screen (Section G)**
  - DoD: Mini preview, copyable share URL (`loya.app/card/{code}`), native share sheet CTA, 4-step explainer, and full-size QR code.

## Phase 5: Customers, Customer Details & Notification Composer (Sections J, K, L, M)
- [x] **Task 5.1: Customers Directory & Manual Enrollment Modal (Section J)**
  - DoD: Free plan quota banner (X/50), stat tiles, search bar, row details, and "Manual Add Customer" modal.
- [x] **Task 5.2: Customer Detail Screen & Points Ledger (Section K)**
  - DoD: Gradient stat card, personal QR code, manual add/deduct points action, and chronological points transaction ledger.
- [x] **Task 5.3: Notification Composer & Inbox (Sections L, M)**
  - DoD: 3-step composer with audience targeting (single, inactive lookbacks, all), 7 ready bilingual templates + custom message, rate limit footnote (10/hr). Notification inbox with platform alerts.

## Phase 6: Staff Management, Settings & Wallet Sync Status (Sections N, O, P)
- [x] **Task 6.1: Staff Management & Join-Code System (Section N)**
  - DoD: Active/paused join code (`NQT-XXXXXX`), copy button, how-to instructions, employee directory with role badges and 6-flag permission toggles.
- [x] **Task 6.2: Wallet Sync Status & Settings Hub (Sections O, P)**
  - DoD: Wallet sync dashboard (pending, synced, Apple/Google counts). Settings screen with account, app toggles (language switcher), support guides, and logout.

## Phase 7: Pro Paywall, Limits Enforcement & Subscription (Sections H, I) [REQUIRES CONFLICT RESOLUTION]
- [x] **Task 7.1: Resolve Unresolved Conflict on Staff Gating & Enforce Plan Limits**
  - DoD: Pro upgrade screen with annual/monthly toggle, benefits detail modal, locked statistics screen for Free plan, and server-side/state enforcement of 1 card & 50 customer limits.
