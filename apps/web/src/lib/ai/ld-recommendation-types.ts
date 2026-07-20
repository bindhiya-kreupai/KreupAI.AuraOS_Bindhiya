export type LearningRecommendation = {
  id: string;
  title: string;
  provider: string;
  duration: string;
  rating: number;
  skills: string[];
  matchScore: number;
  reason: string;
  enrolled: boolean;
};

export type SkillGap = { skill: string; currentLevel: number; targetLevel: number; gap: number };
