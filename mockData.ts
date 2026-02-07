
import { Candidate, Evaluation } from './types';

const ROLES = [
  'Senior Software Engineer', 'Product Manager', 'UX Designer', 
  'Operations Director', 'Sustainability Lead', 'HR Business Partner',
  'Marketing Strategy Head', 'Data Scientist', 'CTO', 'Project Manager'
];

const SKILLS_POOL = [
  'React', 'Node.js', 'Python', 'Agile', 'CSR', 'Cloud Architecture',
  'Leadership', 'Strategic Planning', 'Risk Mitigation', 'Data Visualization',
  'Public Speaking', 'Negotiation', 'Conflict Resolution', 'Supply Chain'
];

const ACHIEVEMENTS_POOL = [
  "Led a cross-functional team of 20 to deliver a $2M project under budget.",
  "Reduced operational costs by 15% through strategic automation.",
  "Developed a patent-pending algorithm for real-time data processing.",
  "Pioneered the company's first ESG reporting framework.",
  "Managed a major system outage with zero data loss in under 2 hours.",
  "Increased user engagement by 40% through UX redesign.",
  "Spearheaded a diversity and inclusion initiative that saw 30% growth in diverse hiring.",
  "Authored a white paper on sustainable supply chain management."
];

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

export const generateCandidates = (): Candidate[] => {
  return Array.from({ length: 40 }, (_, i) => {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const skillsCount = 3 + Math.floor(Math.random() * 4);
    const selectedSkills = [...SKILLS_POOL]
      .sort(() => 0.5 - Math.random())
      .slice(0, skillsCount);
    
    const achCount = 2 + Math.floor(Math.random() * 2);
    const selectedAchievements = [...ACHIEVEMENTS_POOL]
      .sort(() => 0.5 - Math.random())
      .slice(0, achCount);

    return {
      id: `c-${i + 1}`,
      name: `${fn} ${ln}`,
      experienceYears: Math.floor(Math.random() * 15) + 3,
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      skills: selectedSkills,
      bio: `Highly experienced professional with a background in ${selectedSkills[0]} and ${selectedSkills[1]}. Proven track record of delivering high-impact projects.`,
      avatar: `https://picsum.photos/seed/${i + 1}/150/150`,
      achievements: selectedAchievements
    };
  });
};

export const generateMockEvaluations = (candidates: Candidate[]): Evaluation[] => {
  return candidates.map(c => ({
    candidateId: c.id,
    crisisManagementScore: Math.floor(Math.random() * 40) + 60, // 60-100
    sustainabilityScore: Math.floor(Math.random() * 50) + 50, // 50-100
    teamMotivationScore: Math.floor(Math.random() * 30) + 70, // 70-100
    summary: "Candidate shows strong potential in key leadership areas. Values alignment is high.",
    lastEvaluated: new Date().toISOString()
  }));
};
