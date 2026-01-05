export type Category = 'romantic' | 'picnic' | 'event' | 'hiking';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type EventStatus = 'upcoming' | 'completed' | 'cancelled';
export type MessageType = 'text' | 'location' | 'event_invite';
export type NigerianState = 'Abia' | 'Anambra' | 'Enugu' | 'Ebonyi' | 'Imo';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  budget_preference: BudgetLevel;
  favorite_activities: string[];
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  state: NigerianState;
  area: string;
  category: Category;
  budget_level: BudgetLevel;
  estimated_budget_min: number | null;
  estimated_budget_max: number | null;
  best_time: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  rating: number;
  total_reviews: number;
  amenities: string[];
  is_featured: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  location_id: string;
  created_at: string;
  location?: Location;
}

export interface PlannedEvent {
  id: string;
  user_id: string;
  location_id: string | null;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  notes: string | null;
  budget_breakdown: Record<string, number> | null;
  schedule: ScheduleItem[] | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface ScheduleItem {
  time: string;
  activity: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  location_id: string | null;
  state: NigerianState | null;
  content: string;
  image_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  location?: Location;
  has_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_participant?: Profile;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  location_id: string | null;
  event_id: string | null;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  location?: Location;
  event?: PlannedEvent;
}

export interface WeatherData {
  date: string;
  temperature: number;
  condition: WeatherCondition;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy' | 'stormy';

export interface FilterOptions {
  category?: Category | 'all';
  budgetLevel?: BudgetLevel | 'all';
  area?: string | 'all';
  state?: NigerianState | 'all';
  searchQuery?: string;
}
