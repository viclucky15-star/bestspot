export type ServiceProviderType = 'photographer' | 'cinematographer' | 'tour_guide';

export interface ServiceProvider {
  id: string;
  user_id: string;
  provider_type: ServiceProviderType;
  full_name: string;
  phone_number: string;
  state: string;
  area: string | null;
  bio: string | null;
  is_approved: boolean;
  is_paid: boolean;
  payment_amount: number;
  payment_date: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const SERVICE_PROVIDER_LABELS: Record<ServiceProviderType, string> = {
  photographer: 'Photographer',
  cinematographer: 'Cinematographer',
  tour_guide: 'Tour Guide',
};

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;
