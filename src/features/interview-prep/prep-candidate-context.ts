import "server-only";

import {
  getCandidateCertifications,
  getCandidateEducation,
  getCandidateExperiences,
} from "@/features/job-applications/candidate-context.repository";
import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";
import { richTextToPlainText } from "@/lib/content/rich-text";

export type PrepCandidateContext = {
  profile: {
    fullName: string;
    professionalTitle: string;
    shortBio: string;
    location: string | undefined;
    yearsOfExperience: number | undefined;
    currentCompany: string | undefined;
    currentRole: string | undefined;
    currentFocus: string | undefined;
    learningGoals: string[];
    engineeringValues: string[];
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
    proficiency: number | undefined;
    yearsOfExperience: number | undefined;
  }>;
  projects: Array<{
    title: string;
    shortDescription: string;
    role: string | undefined;
    technologies: string[];
    problemStatement: string;
    solution: string;
    architecture: string;
    challenges: string;
    outcomes: string;
  }>;
  education: Array<{
    institution: string;
    college: string | undefined;
    degree: string;
    field: string | undefined;
    modules: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
  }>;
};

function jsonToPlain(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value;
  try {
    return richTextToPlainText(value);
  } catch {
    return "";
  }
}

async function getPrepProjects() {
  if (!isDatabaseConfigured()) return [];
  return getDatabase().project.findMany({
    where: { visible: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    select: {
      title: true,
      shortDescription: true,
      role: true,
      technologies: true,
      problemStatement: true,
      solution: true,
      architecture: true,
      challenges: true,
      outcomes: true,
    },
  });
}

async function getPrepSkills() {
  if (!isDatabaseConfigured()) return [];
  return getDatabase().skillCategory.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      skills: {
        where: { visible: true },
        orderBy: [{ highlighted: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
        select: {
          name: true,
          highlighted: true,
          proficiency: true,
          yearsOfExperience: true,
        },
      },
    },
  });
}

async function getPrepProfile() {
  if (!isDatabaseConfigured()) return null;
  return getDatabase().profile.findFirst({
    select: {
      fullName: true,
      professionalTitle: true,
      shortBio: true,
      location: true,
      yearsOfExperience: true,
      currentCompany: true,
      currentRole: true,
      currentFocus: true,
      learningGoals: true,
      engineeringValues: true,
    },
  });
}

export async function buildPrepCandidateContext(): Promise<PrepCandidateContext> {
  const [profile, experiences, projects, skillCategories, certifications, education] =
    await Promise.all([
      getPrepProfile(),
      getCandidateExperiences(),
      getPrepProjects(),
      getPrepSkills(),
      getCandidateCertifications(),
      getCandidateEducation(),
    ]);

  return {
    profile: {
      fullName: profile?.fullName ?? "Minhazul Islam",
      professionalTitle: profile?.professionalTitle ?? "Full Stack Java Developer",
      shortBio: profile?.shortBio ?? "",
      location: profile?.location ?? undefined,
      yearsOfExperience: profile?.yearsOfExperience
        ? Number(profile.yearsOfExperience)
        : undefined,
      currentCompany: profile?.currentCompany ?? undefined,
      currentRole: profile?.currentRole ?? undefined,
      currentFocus: profile?.currentFocus ?? undefined,
      learningGoals: profile?.learningGoals ?? [],
      engineeringValues: profile?.engineeringValues ?? [],
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
        proficiency: s.proficiency ?? undefined,
        yearsOfExperience: s.yearsOfExperience
          ? Number(s.yearsOfExperience)
          : undefined,
      })),
    ),
    projects: projects.map((p) => ({
      title: p.title,
      shortDescription: p.shortDescription,
      role: p.role ?? undefined,
      technologies: p.technologies,
      problemStatement: jsonToPlain(p.problemStatement).slice(0, 800),
      solution: jsonToPlain(p.solution).slice(0, 800),
      architecture: jsonToPlain(p.architecture).slice(0, 800),
      challenges: jsonToPlain(p.challenges).slice(0, 600),
      outcomes: jsonToPlain(p.outcomes).slice(0, 600),
    })),
    education: education.map((e) => ({
      institution: e.institution,
      college: e.college || undefined,
      degree: e.degree,
      field: e.field || undefined,
      modules: e.modules,
    })),
    certifications: certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer,
    })),
  };
}

export function prepCandidateContextToPlainText(ctx: PrepCandidateContext) {
  const lines: string[] = [];
  lines.push(`Name: ${ctx.profile.fullName}`);
  lines.push(`Title: ${ctx.profile.professionalTitle}`);
  lines.push(`Bio: ${ctx.profile.shortBio}`);
  if (ctx.profile.location) lines.push(`Location: ${ctx.profile.location}`);
  if (ctx.profile.yearsOfExperience) {
    lines.push(`Experience: ${ctx.profile.yearsOfExperience} years`);
  }
  if (ctx.profile.currentCompany) lines.push(`Current Company: ${ctx.profile.currentCompany}`);
  if (ctx.profile.currentRole) lines.push(`Current Role: ${ctx.profile.currentRole}`);
  if (ctx.profile.currentFocus) lines.push(`Focus: ${ctx.profile.currentFocus}`);
  if (ctx.profile.learningGoals.length) {
    lines.push(`Learning goals: ${ctx.profile.learningGoals.join(", ")}`);
  }
  if (ctx.profile.engineeringValues.length) {
    lines.push(`Engineering values: ${ctx.profile.engineeringValues.join(", ")}`);
  }
  lines.push("");

  lines.push("EXPERIENCE:");
  for (const exp of ctx.experiences) {
    lines.push(`- ${exp.position} at ${exp.company}`);
    if (exp.description) lines.push(`  ${exp.description.slice(0, 500)}`);
    if (exp.achievements.length) {
      lines.push(`  Achievements: ${exp.achievements.slice(0, 5).join("; ")}`);
    }
    if (exp.technologies.length) {
      lines.push(`  Tech: ${exp.technologies.join(", ")}`);
    }
  }
  lines.push("");

  lines.push("SKILLS:");
  for (const skill of ctx.skills) {
    const bits = [
      skill.name,
      skill.category,
      skill.highlighted ? "highlighted" : null,
      skill.proficiency != null ? `proficiency ${skill.proficiency}` : null,
      skill.yearsOfExperience != null ? `${skill.yearsOfExperience}y` : null,
    ].filter(Boolean);
    lines.push(`- ${bits.join(" · ")}`);
  }
  lines.push("");

  lines.push("PROJECTS:");
  for (const project of ctx.projects) {
    lines.push(`- ${project.title}${project.role ? ` (${project.role})` : ""}`);
    lines.push(`  ${project.shortDescription}`);
    if (project.technologies.length) {
      lines.push(`  Tech: ${project.technologies.join(", ")}`);
    }
    if (project.problemStatement) lines.push(`  Problem: ${project.problemStatement}`);
    if (project.solution) lines.push(`  Solution: ${project.solution}`);
    if (project.architecture) lines.push(`  Architecture: ${project.architecture}`);
    if (project.challenges) lines.push(`  Challenges: ${project.challenges}`);
    if (project.outcomes) lines.push(`  Outcomes: ${project.outcomes}`);
  }
  lines.push("");

  lines.push("EDUCATION:");
  for (const edu of ctx.education) {
    lines.push(
      `- ${edu.degree}${edu.field ? ` in ${edu.field}` : ""} @ ${edu.institution}`,
    );
    if (edu.modules.length) lines.push(`  Modules: ${edu.modules.join(", ")}`);
  }

  if (ctx.certifications.length) {
    lines.push("");
    lines.push("CERTIFICATIONS:");
    for (const cert of ctx.certifications) {
      lines.push(`- ${cert.name} (${cert.issuer})`);
    }
  }

  return lines.join("\n");
}
