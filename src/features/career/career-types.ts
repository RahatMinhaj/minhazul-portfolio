import type { RichTextDocument } from "@/lib/content/rich-text";

export type ExperienceWriteInput = {
  company: string;
  position: string;
  location: string | null;
  richDescription: RichTextDocument | null;
  startDate: Date | null;
  endDate: Date | null;
  currentlyWorking: boolean;
  achievements: string[];
  technologies: string[];
  sortOrder: number;
  featured: boolean;
  visible: boolean;
};

export type CertificationWriteInput = {
  name: string;
  issuer: string;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateImage: string | null;
  category: string | null;
  description: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  sortOrder: number;
  featured: boolean;
  visible: boolean;
};

export type EducationWriteInput = {
  institution: string;
  college: string | null;
  degree: string;
  field: string | null;
  grade: string | null;
  logo: string | null;
  description: RichTextDocument | null;
  modules: string[];
  startDate: Date | null;
  endDate: Date | null;
  sortOrder: number;
  visible: boolean;
};
