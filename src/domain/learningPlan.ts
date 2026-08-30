export const TARGET_ROLES = ['Data analyst', 'Data engineer', 'AI engineer'] as const;
export const CURRENT_LEVELS = ['Starting out', 'Know the basics', 'Interview ready'] as const;
export const WEEKLY_TIME = ['2 hours', '5 hours', '8+ hours'] as const;

export type TargetRole = typeof TARGET_ROLES[number];
export type CurrentLevel = typeof CURRENT_LEVELS[number];
export type WeeklyTime = typeof WEEKLY_TIME[number];

export interface LearningPreferences {
  role: TargetRole;
  level: CurrentLevel;
  time: WeeklyTime;
}

export interface JourneyCandidate {
  id: string;
  slug: string;
  title: string;
}

export interface LearningPlanRecommendation {
  journey: JourneyCandidate | null;
  sessionsPerWeek: number;
  minutesPerSession: number;
  startingMode: 'foundations' | 'skills-check' | 'interview-sprint';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const ROLE_TERMS: Record<TargetRole, string[]> = {
  'Data analyst': ['analyst', 'analytics', 'sql'],
  'Data engineer': ['engineer', 'engineering', 'pipeline'],
  'AI engineer': ['ai', 'machine learning', 'ml'],
};

const PACING: Record<WeeklyTime, Pick<LearningPlanRecommendation, 'sessionsPerWeek' | 'minutesPerSession'>> = {
  '2 hours': { sessionsPerWeek: 2, minutesPerSession: 45 },
  '5 hours': { sessionsPerWeek: 3, minutesPerSession: 60 },
  '8+ hours': { sessionsPerWeek: 5, minutesPerSession: 75 },
};

const LEVEL_START: Record<CurrentLevel, Pick<LearningPlanRecommendation, 'startingMode' | 'difficulty'>> = {
  'Starting out': { startingMode: 'foundations', difficulty: 'Easy' },
  'Know the basics': { startingMode: 'skills-check', difficulty: 'Medium' },
  'Interview ready': { startingMode: 'interview-sprint', difficulty: 'Hard' },
};

export function recommendLearningPlan(
  preferences: LearningPreferences,
  journeys: JourneyCandidate[],
): LearningPlanRecommendation {
  const terms = ROLE_TERMS[preferences.role];
  const journey = journeys.find((candidate) => {
    const name = `${candidate.title} ${candidate.slug}`.toLowerCase();
    return terms.some((term) => name.includes(term));
  }) ?? journeys[0] ?? null;

  return { journey, ...PACING[preferences.time], ...LEVEL_START[preferences.level] };
}

export function preferencesToSearch(preferences: LearningPreferences): string {
  return new URLSearchParams([
    ['role', preferences.role],
    ['level', preferences.level],
    ['time', preferences.time],
  ]).toString();
}
