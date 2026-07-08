export type BusinessCategory =
  | 'مقهى'
  | 'مطعم'
  | 'صالون'
  | 'ملابس'
  | 'صيدلية'
  | 'رياضة'
  | 'بقالة'
  | 'خدمات سيارات'
  | 'مغسلة سيارات'
  | 'مركز مساج'
  | 'مشغل نسائي'
  | 'محل ورود'
  | 'أخرى';

export type CardRuleType = 'points_per_riyal' | 'points_per_visit' | 'stamp_buy_5' | 'manual';

export type RewardEngineType = 'instant' | 'stamps' | 'both';

export type CardExpiry = 'never' | '90_days' | '6_months' | '1_year' | '2_years';

export interface CardReward {
  id: string;
  title: string;
  pointsCost: number;
  icon: string;
}

export interface CardSecuritySettings {
  cashierPinEnabled: boolean;
  cashierPin: string;
  duplicateScanWindowSeconds: number;
  staffAuditEnabled: boolean;
}

export interface LoyaltyCard {
  id: string;
  name: string;
  description: string;
  ruleType: CardRuleType;
  pointsPerUnit: number; // e.g. 1 point per 1 SAR or 1 stamp per visit
  minSpend?: number;
  stampTarget?: number; // e.g. 5 or 6 for stamp card
  rewardEngine: RewardEngineType;
  winProbability: number;
  instantGiftAr?: string;
  instantGiftEn?: string;
  expiry: CardExpiry;
  color: string; // hex
  textColor: '#FFFFFF' | '#000000';
  logoUrl?: string;
  bannerTitle?: string;
  bannerSubtext?: string;
  backLinks: {
    phone?: string;
    googleMaps?: string;
    instagram?: string;
    customNote?: string;
  };
  security: CardSecuritySettings;
  quickAddButtons: number[];
  rewards: CardReward[];
  isActive: boolean;
  customersCount: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  cardId: string;
  date: string;
  type: 'earn' | 'redeem' | 'stamp';
  amount: number;
  note?: string;
  cashierName: string;
  staffId?: string;
  staffCode?: string;
  createdAtMs?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cardId: string;
  pointsBalance: number;
  stampsBalance?: number;
  totalEarned: number;
  visits: number;
  lastVisit: string;
  walletStatus: 'apple' | 'google' | 'both';
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'كاشير' | 'مدير فرع' | 'موظف';
  status: 'نشط' | 'معلق' | 'بانتظار أول تسجيل دخول';
  phone?: string;
  authCode?: string;
  failedLoginCount?: number;
  lastFailedLogin?: string;
  lastLogin?: string;
  isLocked?: boolean;
  permissions: {
    canAddPoints: boolean;
    canRedeemRewards: boolean;
    canViewAnalytics: boolean;
    canManageCards: boolean;
    canManageTeam: boolean;
    canBroadcastPush?: boolean;
  };
}

export interface PushCampaign {
  id: string;
  title: string;
  message: string;
  targetCardId: string;
  sentAt: string;
  recipientsCount: number;
}

export interface StoreProfile {
  name: string;
  category: BusinessCategory;
  email: string;
  phone: string;
  logoUrl: string;
  plan: 'free' | 'pro';
  walletSyncStatus: 'connected' | 'syncing' | 'error';
}
