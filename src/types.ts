export interface Lap {
  id: number;
  lapNumber: number;
  timeMs: number;
  distanceMeters: number;
  averagePace: string; // "MM:SS /km"
  timestamp: string;
}

export interface RunSession {
  id: string;
  name: string;
  date: string;
  totalTimeMs: number;
  totalDistanceMeters: number;
  averagePace: string;
  laps: Lap[];
  caloriesBurned: number;
}

export interface AthleteProfile {
  name: string;
  level: string; // e.g. "Club Runner"
  homeParkrun: string; // e.g. "Bushy Park"
  totalRuns: number;
  totalDistanceKm: number;
  vo2Max: number;
  avatarUrl?: string;
  personalBests: {
    distance: string; // "1km", "5km", "10km"
    time: string; // "03:45", "19:24", "41:12"
    pace: string;
    date: string;
  }[];
}

export interface NotificationAlert {
  id: string;
  message: string;
  subMessage?: string;
  type: 'lap_complete' | 'checkpoint' | 'milestone' | 'info';
  timestamp: string;
}
