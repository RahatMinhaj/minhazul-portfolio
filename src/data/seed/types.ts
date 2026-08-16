export type ProfileSeedData = {
  fullName: string;
  professionalTitle: string;
  shortBio: string;
  longBio?: RichTextSeedData;
  email?: string;
  phone?: string;
  location?: string;
  availabilityStatus?: string;
  profileImage?: string;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentRole?: string;
  currentFocus?: string;
  learningGoals: string[];
  engineeringValues: string[];
};

export type ExperienceSeedData = {
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking: boolean;
  summary?: string;
  achievements: string[];
  technologies: string[];
  featured?: boolean;
};

export type ProjectSeedData = {
  title: string;
  slug: string;
  shortDescription: string;
  richDescription?: RichTextSeedData;
  projectType?: string;
  clientName?: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  technologies: string[];
  featured?: boolean;
};

export type SkillSeedData = {
  name: string;
  slug: string;
  category: string;
  highlighted?: boolean;
};

export type CertificationSeedData = {
  name: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
};

export type EducationSeedData = {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: RichTextSeedData;
};

export type SocialLinkSeedData = {
  platform: string;
  label: string;
  url: string;
  icon?: string;
};

export type SkillCategorySeedData = {
  name: string;
  slug: string;
  description: string;
  icon: string;
};

export type RichTextSeedData = {
  type: "doc";
  content: Array<{
    type: "paragraph";
    content: Array<{
      type: "text";
      text: string;
    }>;
  }>;
};
