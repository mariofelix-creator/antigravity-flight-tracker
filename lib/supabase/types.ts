// Database types for MicroGuard
// All monetary values are in USD

export type RiskProfile = "conservative" | "moderate" | "aggressive";
export type AssetType = "etf" | "bond" | "crypto" | "stock";
export type InvestmentStatus = "active" | "sold" | "pending";
export type OfferType = "investment" | "educational" | "alert";
export type NotificationType = "alert" | "offer" | "update" | "system";

// ─── Row types (what Supabase returns) ────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  risk_profile: RiskProfile | null;
  investment_goal: string | null;
  max_investment_usd: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  total_invested: number;
  current_value: number;
  return_pct: number;
  created_at: string;
}

export interface Investment {
  id: string;
  portfolio_id: string;
  user_id: string;
  asset_symbol: string;
  asset_name: string;
  asset_type: AssetType;
  amount_usd: number;
  shares: number;
  entry_price: number;
  current_price: number;
  return_pct: number;
  status: InvestmentStatus;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  asset_symbol: string;
  asset_name: string;
  confidence_score: number; // 0–100
  reasoning: string;
  suggested_amount: number;
  risk_level: RiskProfile;
  expires_at: string;
  acted_on: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  offer_type: OfferType;
  asset_symbol: string | null;
  min_investment: number | null;
  max_return_pct: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  sent_at: string;
}

// ─── Insert types (what we send to Supabase) ──────────────────────────────────

export type ProfileInsert = Omit<Profile, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type PortfolioInsert = Omit<Portfolio, "id" | "created_at"> & {
  id?: string;
};

export type InvestmentInsert = Omit<Investment, "id" | "created_at"> & {
  id?: string;
};

export type RecommendationInsert = Omit<Recommendation, "id" | "created_at"> & {
  id?: string;
};

export type CampaignInsert = Omit<Campaign, "id" | "created_at"> & {
  id?: string;
};

export type PushSubscriptionInsert = Omit<PushSubscription, "id" | "created_at"> & {
  id?: string;
};

export type NotificationInsert = Omit<Notification, "id"> & {
  id?: string;
};

// ─── Update types ─────────────────────────────────────────────────────────────

export type ProfileUpdate = Partial<Omit<Profile, "id" | "user_id" | "created_at">>;
export type PortfolioUpdate = Partial<Omit<Portfolio, "id" | "user_id" | "created_at">>;
export type InvestmentUpdate = Partial<Omit<Investment, "id" | "user_id" | "created_at">>;
export type RecommendationUpdate = Partial<Omit<Recommendation, "id" | "user_id" | "created_at">>;

// ─── Database schema (for createServerClient generic) ────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      portfolios: {
        Row: Portfolio;
        Insert: PortfolioInsert;
        Update: PortfolioUpdate;
      };
      investments: {
        Row: Investment;
        Insert: InvestmentInsert;
        Update: InvestmentUpdate;
      };
      recommendations: {
        Row: Recommendation;
        Insert: RecommendationInsert;
        Update: RecommendationUpdate;
      };
      campaigns: {
        Row: Campaign;
        Insert: CampaignInsert;
        Update: Partial<Omit<Campaign, "id" | "created_at">>;
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: PushSubscriptionInsert;
        Update: Partial<Omit<PushSubscription, "id" | "user_id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<Omit<Notification, "id" | "user_id">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      risk_profile: RiskProfile;
      asset_type: AssetType;
      investment_status: InvestmentStatus;
      offer_type: OfferType;
      notification_type: NotificationType;
    };
  };
}

// ─── API response helpers ─────────────────────────────────────────────────────

export type ApiSuccess<T> = { data: T; error?: never };
export type ApiError = { error: string; data?: never };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Composite types used by API routes ───────────────────────────────────────

export interface PortfolioWithInvestments extends Portfolio {
  investments: Investment[];
}
