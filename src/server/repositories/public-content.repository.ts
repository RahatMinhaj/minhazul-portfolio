import "server-only";

import { parseHeroContent } from "@/features/profile/hero-content";
import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";

export async function getPublicProfile() {
  if (!isDatabaseConfigured()) return null;

  const profile = await getDatabase().profile.findFirst({
    select: {
      fullName: true,
      professionalTitle: true,
      shortBio: true,
      longBio: true,
      email: true,
      location: true,
      availabilityStatus: true,
      profileImage: true,
      resumeUrl: true,
      yearsOfExperience: true,
      currentCompany: true,
      currentRole: true,
      heroContent: true,
      currentFocus: true,
      learningGoals: true,
      engineeringValues: true,
    },
  });

  return profile
    ? { ...profile, heroContent: parseHeroContent(profile.heroContent) }
    : null;
}

export async function getPublicSiteSettings() {
  if (!isDatabaseConfigured()) return null;

  return getDatabase().siteSettings.findFirst({
    select: {
      siteName: true,
      siteDescription: true,
      defaultTheme: true,
      contactEnabled: true,
      blogEnabled: true,
      playgroundEnabled: true,
      analyticsEnabled: true,
      maintenanceMode: true,
      footerText: true,
      resumeUrl: true,
      seoTitle: true,
      seoDescription: true,
      engineeringSectionLabel: true,
      engineeringLinkLabel: true,
      engineeringCoreLabel: true,
      engineeringInventoryLabel: true,
      engineeringScrollLabel: true,
    },
  });
}

export async function getActiveThemes() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().themeDefinition.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, isDefault: true },
  });
}

export async function getVisibleSocialLinks() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().socialLink.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: {
      id: true,
      platform: true,
      label: true,
      url: true,
      icon: true,
    },
  });
}

export async function getVisibleExperiences() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().experience.findMany({
    where: { visible: true },
    orderBy: [
      { currentlyWorking: "desc" },
      { sortOrder: "asc" },
      { startDate: "desc" },
    ],
    select: {
      id: true,
      company: true,
      position: true,
      employmentType: true,
      location: true,
      startDate: true,
      endDate: true,
      currentlyWorking: true,
      summary: true,
      achievements: true,
      technologies: true,
      companyLogo: true,
      featured: true,
    },
  });
}

export async function getVisibleProjects() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().project.findMany({
    where: {
      visible: true,
      status: { not: "DRAFT" },
    },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { updatedAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      projectType: true,
      clientName: true,
      status: true,
      thumbnail: true,
      technologies: true,
      githubUrl: true,
      liveUrl: true,
      featured: true,
      updatedAt: true,
    },
  });
}

export async function getVisibleProjectBySlug(slug: string) {
  if (!isDatabaseConfigured()) return null;

  return getDatabase().project.findFirst({
    where: {
      slug,
      visible: true,
      status: { not: "DRAFT" },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      richDescription: true,
      problemStatement: true,
      solution: true,
      architecture: true,
      challenges: true,
      outcomes: true,
      role: true,
      projectType: true,
      status: true,
      startDate: true,
      endDate: true,
      clientName: true,
      companyName: true,
      coverImage: true,
      gallery: true,
      technologies: true,
      githubUrl: true,
      liveUrl: true,
      caseStudyUrl: true,
      featured: true,
    },
  });
}

export async function getVisibleSkillCategories() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().skillCategory.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      skills: {
        where: { visible: true },
        orderBy: [
          { highlighted: "desc" },
          { sortOrder: "asc" },
          { name: "asc" },
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          proficiency: true,
          yearsOfExperience: true,
          highlighted: true,
        },
      },
    },
  });
}

export async function getVisibleCertifications() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().certification.findMany({
    where: { visible: true },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { issueDate: "desc" },
    ],
    select: {
      id: true,
      name: true,
      issuer: true,
      issueDate: true,
      expiryDate: true,
      credentialId: true,
      credentialUrl: true,
      certificateImage: true,
      description: true,
      category: true,
      featured: true,
    },
  });
}

export async function getVisibleEducation() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().education.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    select: {
      id: true,
      institution: true,
      degree: true,
      field: true,
      startDate: true,
      endDate: true,
      grade: true,
      description: true,
      logo: true,
    },
  });
}

export async function getPublishedPosts() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    orderBy: [
      { featured: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      tags: true,
      featured: true,
      publishedAt: true,
      readingTime: true,
    },
  });
}

export async function getPublishedPostBySlug(slug: string) {
  if (!isDatabaseConfigured()) return null;

  return getDatabase().blogPost.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      tags: true,
      featured: true,
      publishedAt: true,
      readingTime: true,
      seoTitle: true,
      seoDescription: true,
    },
  });
}

export async function getVisibleUseItems() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().useItem.findMany({
    where: { visible: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      category: true,
      name: true,
      description: true,
      url: true,
      icon: true,
    },
  });
}

export async function getPublicChatContent() {
  const [
    profile,
    experiences,
    projects,
    skillCategories,
    certifications,
    education,
    posts,
    useItems,
    socialLinks,
    settings,
  ] = await Promise.all([
    getPublicProfile(),
    getVisibleExperiences(),
    getVisibleProjects(),
    getVisibleSkillCategories(),
    getVisibleCertifications(),
    getVisibleEducation(),
    getPublishedPosts(),
    getVisibleUseItems(),
    getVisibleSocialLinks(),
    getPublicSiteSettings(),
  ]);

  return {
    profile,
    experiences,
    projects,
    skillCategories,
    certifications,
    education,
    posts: settings?.blogEnabled === false ? [] : posts,
    useItems,
    socialLinks,
    settings,
  };
}
