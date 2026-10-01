export interface ProfileMetrics {
  gpaBachelor: number;
  gpaAssociate: number;
  yearsExperience: number;
  certificationsCount: number;
}

export interface Profile {
  fullName: string;
  preferredName: string;
  editorialRole: string;
  editorialTitle: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  availabilityStatus: string;
  pdfResumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  metrics: ProfileMetrics;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  organization?: string;
  period?: string;
  summary: string;
  highlights: string[];
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  hologramType?: "crystal" | "cube" | "mesh" | "sphere";
  order: number;
  isFeatured: boolean;
}

export interface Experience {
  id: string;
  role: string;
  institution: string;
  department?: string;
  location: string;
  period: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  order: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  period: string;
  gpa: string;
  finalProject: {
    title: string;
    domain: string;
  };
  order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueYear: number;
  credentialUrl?: string;
  category: string;
  order: number;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface SkillMatrix {
  hardSkills: SkillCategory[];
  softSkills: string[];
}

export interface PortfolioData {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  skills: SkillMatrix;
}
