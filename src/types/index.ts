export interface Exercise {
  id: string;
  name: string;
  type: 'multiarticular' | 'monoarticular';
  resistanceProfile: string;
  category: string;
  muscleGroup: string;
  description: string;
  videoUrl?: string;
}

export interface DayExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  effortType: 'RIR' | 'RPE' | 'percentage';
  effortValue: number;
  orderIndex: number;
  notes?: string;
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  date: Date;
  name: string;
  focus: string;
  exercises: DayExercise[];
  restDay: boolean;
}

export interface Microcycle {
  id: string;
  weekNumber: number;
  name: string;
  startDate: Date;
  endDate: Date;
  trainingDays: TrainingDay[];
  intensityLevel: 'low' | 'medium' | 'high' | 'deload';
}

export interface Macrocycle {
  id: string;
  name: string;
  description: string;
  objective: string;
  startDate: Date;
  endDate: Date;
  microcycles: Microcycle[];
  clientId: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
}
