export interface GpsPoint {
  lat: number;
  lng: number;
}

export interface Waypoint extends GpsPoint {
  name: string;
  type: 'viewpoint' | 'rest' | 'water' | 'danger' | 'parking';
}

export interface TrailEndpoint extends GpsPoint {
  name: string;
}

export type TrailDifficulty = 'easy' | 'moderate' | 'hard';
export type TrailType = 'loop' | 'out_and_back' | 'point_to_point';

export interface HikingTrail {
  id: string;
  location_id: string;
  name: string;
  description: string | null;
  distance_km: number;
  estimated_duration_minutes: number;
  difficulty: TrailDifficulty;
  elevation_gain_meters: number;
  trail_type: TrailType;
  gps_path: GpsPoint[];
  start_point: TrailEndpoint | null;
  end_point: TrailEndpoint | null;
  waypoints: Waypoint[];
  safety_notes: string | null;
  highlights: string[] | null;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedTrail {
  id: string;
  user_id: string;
  trail_id: string;
  created_at: string;
}

export const DIFFICULTY_COLORS: Record<TrailDifficulty, string> = {
  easy: '#22c55e',
  moderate: '#eab308',
  hard: '#ef4444',
};

export const DIFFICULTY_LABELS: Record<TrailDifficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

export const TRAIL_TYPE_LABELS: Record<TrailType, string> = {
  loop: 'Loop',
  out_and_back: 'Out & Back',
  point_to_point: 'Point to Point',
};

export const WAYPOINT_ICONS: Record<Waypoint['type'], string> = {
  viewpoint: '👁️',
  rest: '🪑',
  water: '💧',
  danger: '⚠️',
  parking: '🅿️',
};
