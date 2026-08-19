import "server-only";

import { getPublicProfile } from "@/server/repositories/public-content.repository";
import { getVisibleExperiences } from "@/server/repositories/public-content.repository";
import { getVisibleProjects } from "@/server/repositories/public-content.repository";
import { getVisibleSkillCategories } from "@/server/repositories/public-content.repository";
import { getVisibleCertifications } from "@/server/repositories/public-content.repository";
import { getVisibleEducation } from "@/server/repositories/public-content.repository";
import { richTextToPlainText } from "@/lib/content/rich-text";

export type CandidateContext = {
  profile: {
    fullName: string;
    professionalTitle: string;
    shortBio: string;
    email: string | undefined;
    phone: string | undefined;
    location: string | undefined;
    yearsOfExperience: number | undefined;
    currentCompany: string | undefined;
    currentRole: string | undefined;
    currentFocus: string | undefined;
  };
  experiences: Array<{
    position: string;
    company: string;
    description: string;
    achievements: string[];
    technologies: string[];
  }>;
  skills: Array<{
    name: string;
    category: string;
    highlighted: boolean;
  }>;
  projects: Array<{
    title: string;
    shortDescription: string;
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string | undefined;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
  }>;
};

export async function buildCandidateContext(): Promise<CandidateContext> {
  const [profile, experiences, projects, skillCategories, certifications, education] =
    await Promise.all([
      getPublicProfile(),
      getVisibleExperiences(),
      getVisibleProjects(),
      getVisibleSkillCategories(),
      getVisibleCertifications(),
      getVisibleEducation(),
    ]);

  return {
    profile: {
      fullName: profile?.fullName ?? "Minhazul Islam",
      professionalTitle: profile?.professionalTitle ?? "Full Stack Java Developer",
      shortBio: profile?.shortBio ?? "",
      email: profile?.email ?? undefined,
      phone: undefined,
      location: profile?.location ?? undefined,
      yearsOfExperience: profile?.yearsOfExperience
        ? Number(profile.yearsOfExperience)
        : undefined,
      currentCompany: profile?.currentCompany ?? undefined,
      currentRole: profile?.currentRole ?? undefined,
      currentFocus: profile?.currentFocus ?? undefined,
    },
    experiences: experiences.map((exp) => ({
      position: exp.position,
      company: exp.company,
      description: exp.richDescription
        ? richTextToPlainText(exp.richDescription)
        : "",
      achievements: exp.achievements,
      technologies: exp.technologies,
    })),
    skills: skillCategories.flatMap((cat) =>
      cat.skills.map((s) => ({
        name: s.name,
        category: cat.name,
        highlighted: s.highlighted,
      })),
    ),
    projects: projects.map((p) => ({
      title: p.title,
      shortDescription: p.shortDescription,
      technologies: p.technologies,
    })),
    education: education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field || undefined,
    })),
    certifications: certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
    })),
  };
}

export function candidateContextToPlainText(ctx: CandidateContext): string {
  const lines: string[] = [];

  lines.push(`Name: ${ctx.profile.fullName}`);
  lines.push(`Title: ${ctx.profile.professionalTitle}`);
  lines.push(`Bio: ${ctx.profile.shortBio}`);
  if (ctx.profile.location) lines.push(`Location: ${ctx.profile.location}`);
  if (ctx.profile.yearsOfExperience) lines.push(`Experience: ${ctx.profile.yearsOfExperience} years`);
  if (ctx.profile.currentCompany) lines.push(`Current Company: ${ctx.profile.currentCompany}`);
  if (ctx.profile.currentRole) lines.push(`Current Role: ${ctx.profile.currentRole}`);
  if (ctx.profile.currentFocus) lines.push(`Focus: ${ctx.profile.currentFocus}`);
  lines.push("");

  lines.push("EXPERIENCE:");
  for (const exp of ctx.experiences) {
    lines.push(`- ${exp.position} at ${exp.company}`);
    if (exp.description) lines.push(`  ${exp.description.slice(0, 500)}`);
    if (exp.achievements.length) {
      lines.push(`  Achievements:`);
      for (const a of exp.achievements) lines.push(`  - ${a}`);
    }
    if (exp.technologies.length) lines.push(`  Technologies: ${exp.technologies.join(", ")}`);
  }
  lines.push("");

  lines.push("SKILLS:");
  for (const s of ctx.skills) {
    lines.push(`- ${s.name} (${s.category})${s.highlighted ? " [highlighted]" : ""}`);
  }
  lines.push("");

  lines.push("PROJECTS:");
  for (const p of ctx.projects) {
    lines.push(`- ${p.title}: ${p.shortDescription}`);
    if (p.technologies.length) lines.push(`  Technologies: ${p.technologies.join(", ")}`);
  }
  lines.push("");

  lines.push("EDUCATION:");
  for (const e of ctx.education) {
    lines.push(`- ${e.degree}${e.field ? ` in ${e.field}` : ""} from ${e.institution}`);
  }
  lines.push("");

  lines.push("CERTIFICATIONS:");
  for (const c of ctx.certifications) {
    lines.push(`- ${c.name} (${c.issuer})`);
  }

  return lines.join("\n");
}
