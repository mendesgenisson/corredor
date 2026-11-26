export type UserRole = 'athlete' | 'coach';

export type WorkoutType = 
  | 'intervalado' 
  | 'rodagem' 
  | 'longao' 
  | 'tempo_run' 
  | 'regenerativo' 
  | 'forca' 
  | 'descanso';

export interface PaceZones {
  vdot: number;
  z1_recovery: string; // ex: 6:00 - 6:30 /km
  z2_aerobic: string;  // ex: 5:20 - 5:50 /km
  z3_tempo: string;    // ex: 4:45 - 5:05 /km
  z4_threshold: string;// ex: 4:20 - 4:40 /km
  z5_interval: string; // ex: 3:50 - 4:10 /km
}

export interface AthleteProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  initialWeightKg?: number;
  targetRace: string;
  targetDate: string;
  targetDistance: string;
  personalRecords: {
    '5k'?: string;
    '10k'?: string;
    '21k'?: string;
    '42k'?: string;
  };
  paceZones: PaceZones;
}

export interface WorkoutBlocks {
  warmup: string;
  main: string;
  cooldown: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  completedAt: string;
  distanceKm: number;
  durationMinutes: number;
  avgPace: string; // ex: "4:48/km"
  avgHeartRate?: number;
  rpeEffort: number; // 1 to 10
  painLevel: 'none' | 'mild' | 'moderate' | 'severe';
  painLocation?: string;
  athleteFeedback?: string;
}

export interface Workout {
  id: string;
  athleteId: string;
  scheduledDate: string; // YYYY-MM-DD
  title: string;
  type: WorkoutType;
  estimatedDistanceKm: number;
  blocks: WorkoutBlocks;
  coachNotes?: string;
  status: 'pending' | 'completed' | 'missed';
  log?: WorkoutLog;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  type: WorkoutType;
  estimatedDistanceKm: number;
  blocks: WorkoutBlocks;
  defaultNotes?: string;
}
