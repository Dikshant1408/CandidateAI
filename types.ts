
export interface Candidate {
  id: string;
  name: string;
  experienceYears: number;
  skills: string[];
  role: string;
  bio: string;
  avatar: string;
  achievements: string[];
}

export interface Evaluation {
  candidateId: string;
  crisisManagementScore: number;
  sustainabilityScore: number;
  teamMotivationScore: number;
  summary: string;
  lastEvaluated: string;
}

export interface Ranking {
  candidateId: string;
  totalScore: number;
  rank: number;
}

export type EvaluationCategory = 'crisis' | 'sustainability' | 'motivation';
