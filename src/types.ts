export type BusinessType = 'coffee' | 'restaurant' | 'retail' | 'other';

export interface Business {
  id: string;
  owner_id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  business_type: BusinessType;
  win_probability: number; // 1-100
  stamps_required: number; // default 5
  reward_ar: string;
  reward_en: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  phone: string;
  name: string;
  stamps: number;
  total_scans: number;
  created_at: string;
}

export interface Scan {
  id: string;
  business_id: string;
  customer_id: string;
  won: boolean;
  reward_claimed: boolean;
  created_at: string;
}

export interface Reward {
  id: string;
  business_id: string;
  customer_id: string;
  scan_id: string;
  type: 'lottery_win' | 'stamp_reward';
  claimed: boolean;
  claim_code: string; // 6-char unique uppercase code
  created_at: string;
}

export interface Owner {
  id: string;
  email: string;
  business_id: string;
}

// Stats types for owner dashboard
export interface DashboardStats {
  totalScansAllTime: number;
  totalScansToday: number;
  totalScansThisWeek: number;
  totalCustomers: number;
  totalWins: number;
  claimedRewards: number;
  unclaimedRewards: number;
  chartData: { date: string; scans: number; wins: number }[];
}
