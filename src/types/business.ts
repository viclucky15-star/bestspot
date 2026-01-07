export type AppRole = 'admin' | 'moderator' | 'user' | 'business';
export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface BusinessAccount {
  id: string;
  user_id: string;
  business_name: string;
  business_email: string;
  phone_number?: string;
  business_type?: string;
  owner_full_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_verified?: boolean;
  wallet_balance?: number;
  total_earnings?: number;
  documents_submitted?: boolean;
  verification_status?: string;
  subscription_tier?: string;
  subscription_expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationClaim {
  id: string;
  location_id: string;
  business_id: string;
  status: VerificationStatus;
  business_name: string;
  owner_full_name: string;
  phone_number: string;
  phone_verified?: boolean;
  cac_document_url?: string;
  utility_bill_url?: string;
  signboard_photo_url?: string;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  locations?: {
    id: string;
    name: string;
    area: string;
    state: string;
    image_url?: string;
  };
  business_accounts?: {
    business_name: string;
    business_email: string;
  };
}

export interface NewLocationSubmission {
  id: string;
  business_id: string;
  name: string;
  category: string;
  state: string;
  area: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  image_urls?: string[];
  amenities?: string[];
  budget_level: string;
  estimated_budget_min?: number;
  estimated_budget_max?: number;
  best_time?: string;
  contact_phone?: string;
  status: VerificationStatus;
  rejection_reason?: string;
  approved_location_id?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  location_id: string;
  business_id: string;
  booking_date: string;
  booking_time?: string;
  end_time?: string;
  number_of_guests?: number;
  total_amount: number;
  platform_fee?: number;
  business_amount: number;
  status: BookingStatus;
  payment_reference?: string;
  payment_status?: string;
  special_requests?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  created_at?: string;
  updated_at?: string;
  locations?: {
    id: string;
    name: string;
    area: string;
    state: string;
    image_url?: string;
  };
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Payment {
  id: string;
  booking_id?: string;
  user_id: string;
  business_id?: string;
  amount: number;
  platform_commission?: number;
  business_amount?: number;
  payment_method?: string;
  payment_reference?: string;
  paystack_reference?: string;
  status: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface Payout {
  id: string;
  business_id: string;
  amount: number;
  status: PayoutStatus;
  bank_name: string;
  account_number: string;
  account_name: string;
  transfer_code?: string;
  transfer_reference?: string;
  failure_reason?: string;
  processed_at?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  location_id: string;
  user_id: string;
  booking_id?: string;
  rating: number;
  comment?: string;
  business_response?: string;
  responded_at?: string;
  is_verified_booking?: boolean;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface PlatformSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description?: string;
  updated_by?: string;
  updated_at?: string;
}
